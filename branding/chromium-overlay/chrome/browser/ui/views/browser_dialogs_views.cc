// Copyright 2015 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include <memory>
#include <utility>

#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "build/build_config.h"
#include "chrome/browser/extensions/api/chrome_device_permissions_prompt.h"
#include "chrome/browser/media/webrtc/select_audio_output_picker.h"
#include "chrome/browser/task_manager/task_manager_metrics_recorder.h"
#include "chrome/browser/ui/browser_window.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/dialogs/browser_dialogs.h"
#include "chrome/browser/ui/views/bookmarks/bookmark_editor_view.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/select_audio_output/select_audio_output_views.h"
#include "chrome/browser/ui/views/task_manager_view.h"
#include "components/constrained_window/constrained_window_views.h"
#include "components/permissions/chooser_controller.h"
#include "ui/base/class_property.h"
#include "ui/base/interaction/element_identifier.h"
#include "ui/base/interaction/element_tracker.h"
#include "ui/views/bubble/bubble_anchor.h"
#include "ui/views/bubble/bubble_dialog_delegate_view.h"
#include "ui/views/bubble/bubble_dialog_model_host.h"
#include "ui/views/interaction/element_tracker_views.h"
#include "ui/views/widget/widget.h"
#include "ui/views/window/dialog_delegate.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/controls/button/radio_button.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/separator.h"
#include "ui/views/controls/progress_bar.h"
#include "ui/base/mojom/dialog_button.mojom.h"
#include "ui/base/mojom/ui_base_types.mojom-shared.h"
#include "content/public/browser/web_contents.h"
#include "base/command_line.h"
#include "base/files/file_path.h"
#include "base/files/file_util.h"
#include "base/path_service.h"
#include "base/process/launch.h"
#include "base/task/thread_pool.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/common/chrome_paths.h"
#include "url/gurl.h"
#if BUILDFLAG(IS_WIN)
#include "ui/base/win/shell.h"
#endif

// This file provides definitions of desktop browser dialog-creation methods for
// all toolkit-views platforms.

// static
void BookmarkEditor::Show(gfx::NativeWindow parent_window,
                          Profile* profile,
                          const EditDetails& details,
                          Configuration configuration,
                          OnSaveCallback on_save_callback) {
  auto editor = std::make_unique<BookmarkEditorView>(
      profile, details, configuration, std::move(on_save_callback));
  editor->Show(parent_window);
  editor.release();  // BookmarkEditorView is self-deleting
}

void ChromeUsbDevicePermissionsPrompt::ShowDialog() {
  ShowDialogViews();
}

std::unique_ptr<SelectAudioOutputPicker> SelectAudioOutputPicker::Create(
    const content::SelectAudioOutputRequest& request) {
  return std::make_unique<SelectAudioOutputPickerViews>();
}

namespace {

// Waits for `anchor_element_id` to be shown in `element_context` before
// showing the bubble. Owned by `widget` via `kPendingBubbleShowerKey`.
class PendingBubbleShower {
 public:
  PendingBubbleShower(views::Widget* widget,
                      ui::ElementContext element_context,
                      ui::ElementIdentifier anchor_element_id,
                      std::unique_ptr<ui::DialogModel> dialog_model)
      : widget_(widget), dialog_model_(std::move(dialog_model)) {
    subscription_ =
        ui::ElementTracker::GetElementTracker()->AddElementShownCallback(
            anchor_element_id, element_context,
            base::BindRepeating(&PendingBubbleShower::OnElementShown,
                                base::Unretained(this)));
  }

  PendingBubbleShower(const PendingBubbleShower&) = delete;
  PendingBubbleShower& operator=(const PendingBubbleShower&) = delete;
  ~PendingBubbleShower() = default;

 private:
  void OnElementShown(ui::TrackedElement* element);

  const raw_ptr<views::Widget> widget_;
  std::unique_ptr<ui::DialogModel> dialog_model_;
  ui::ElementTracker::Subscription subscription_;
};

DEFINE_OWNED_UI_CLASS_PROPERTY_KEY(PendingBubbleShower, kPendingBubbleShowerKey)

}  // namespace

DEFINE_UI_CLASS_PROPERTY_TYPE(PendingBubbleShower*)

namespace {

void PendingBubbleShower::OnElementShown(ui::TrackedElement* element) {
  chrome::ShowBubble(element->context(), element->identifier(),
                     std::move(dialog_model_));
  widget_->ClearProperty(kPendingBubbleShowerKey);
}

}  // namespace

namespace chrome {

task_manager::TaskManagerTableModel* ShowTaskManager(
    BrowserWindowInterface* browser,
    task_manager::StartAction start_action) {
  return task_manager::TaskManagerView::Show(browser, start_action);
}

void HideTaskManager() {
  task_manager::TaskManagerView::Hide();
}

views::Widget* ShowBrowserModal(BrowserWindowInterface* browser,
                                std::unique_ptr<ui::DialogModel> dialog_model) {
  return constrained_window::ShowBrowserModal(
      std::move(dialog_model), browser->GetWindow()->GetNativeWindow());
}

// TODO(pbos): Move bubble showing out of this file (like ShowBrowserModal) so
// that this code can be used for showing bubbles outside Browser too.
void ShowBubble(ui::ElementContext element_context,
                ui::ElementIdentifier anchor_element_id,
                std::unique_ptr<ui::DialogModel> dialog_model) {
  ui::TrackedElement* const anchor_element =
      ui::ElementTracker::GetElementTracker()->GetUniqueElement(
          anchor_element_id, element_context);
  if (!anchor_element) {
    views::Widget* const primary_widget =
        views::ElementTrackerViews::GetInstance()
            ->GetPrimaryWindowWidgetForContext(element_context);
    DCHECK(primary_widget);
    primary_widget->SetProperty(
        kPendingBubbleShowerKey,
        std::make_unique<PendingBubbleShower>(primary_widget, element_context,
                                              anchor_element_id,
                                              std::move(dialog_model)));
    return;
  }
  // TODO(pbos): Add a version of BubbleBorder::Arrow that infers position
  // automatically based on the anchor's position relative to its widget.
  auto bubble = std::make_unique<views::BubbleDialogModelHost>(
      std::move(dialog_model), views::BubbleAnchor(anchor_element),
      views::BubbleBorder::TOP_RIGHT);
  bubble->SetHighlightedElement(anchor_element_id);
  views::BubbleDialogDelegate::CreateBubbleDeprecated(
      std::move(bubble), views::Widget::InitParams::NATIVE_WIDGET_OWNS_WIDGET)
      ->Show();
}

namespace {

void StartRinswaVideoDownload(const GURL& video_url, int resolution_choice) {
  base::ThreadPool::PostTask(
      FROM_HERE,
      {base::MayBlock(), base::TaskPriority::USER_VISIBLE,
       base::TaskShutdownBehavior::CONTINUE_ON_SHUTDOWN},
      base::BindOnce(
          [](GURL url, int choice) {
            base::FilePath downloads_dir;
            if (!base::PathService::Get(chrome::DIR_DEFAULT_DOWNLOADS,
                                        &downloads_dir)) {
              downloads_dir = base::GetHomeDir().AppendASCII("Downloads");
            }

            base::FilePath exe_dir;
            base::PathService::Get(base::DIR_EXE, &exe_dir);
            base::FilePath module_dir;
            base::PathService::Get(base::DIR_MODULE, &module_dir);

            // Locate yt-dlp.exe in common locations
            base::FilePath ytdlp_path;
            const base::FilePath candidate_ytdlp_paths[] = {
                exe_dir.AppendASCII("yt-dlp.exe"),
                exe_dir.DirName().AppendASCII("yt-dlp.exe"),
                module_dir.AppendASCII("yt-dlp.exe"),
                module_dir.DirName().AppendASCII("yt-dlp.exe"),
                base::FilePath(FILE_PATH_LITERAL(
                    "C:\\cr\\chromium\\src\\out\\RinswaRelease\\yt-dlp.exe")),
                base::FilePath(FILE_PATH_LITERAL(
                    "C:\\Users\\arind\\AppData\\Local\\Python\\pythoncore-3.14-64\\Scripts\\yt-dlp.exe"))
            };
            for (const auto& path : candidate_ytdlp_paths) {
              if (base::PathExists(path)) {
                ytdlp_path = path;
                break;
              }
            }

            // Locate ffmpeg.exe in common locations
            base::FilePath ffmpeg_path;
            const base::FilePath candidate_ffmpeg_paths[] = {
                exe_dir.AppendASCII("ffmpeg.exe"),
                exe_dir.DirName().AppendASCII("ffmpeg.exe"),
                module_dir.AppendASCII("ffmpeg.exe"),
                module_dir.DirName().AppendASCII("ffmpeg.exe"),
                base::FilePath(FILE_PATH_LITERAL(
                    "C:\\cr\\chromium\\src\\out\\RinswaRelease\\ffmpeg.exe"))
            };
            for (const auto& path : candidate_ffmpeg_paths) {
              if (base::PathExists(path)) {
                ffmpeg_path = path;
                break;
              }
            }

            if (!base::PathExists(ytdlp_path)) {
              LOG(ERROR) << "[Rinswa] yt-dlp.exe not found for video download";
              return;
            }

            base::CommandLine cmd(ytdlp_path);
            if (base::PathExists(ffmpeg_path)) {
              cmd.AppendSwitchPath("ffmpeg-location", ffmpeg_path.DirName());
            }

            cmd.AppendSwitch("no-playlist");
            cmd.AppendSwitch("no-warnings");
            cmd.AppendSwitchPath("paths", downloads_dir);
            cmd.AppendSwitchASCII("output",
                                  "%(title)s [%(resolution)s].%(ext)s");

            switch (choice) {
              case 0:  // 1080p
                cmd.AppendSwitchASCII(
                    "format",
                    "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best");
                cmd.AppendSwitchASCII("merge-output-format", "mp4");
                break;
              case 1:  // 720p
                cmd.AppendSwitchASCII(
                    "format",
                    "bestvideo[height<=720]+bestaudio/best[height<=720]/best");
                cmd.AppendSwitchASCII("merge-output-format", "mp4");
                break;
              case 2:  // 480p
                cmd.AppendSwitchASCII(
                    "format",
                    "bestvideo[height<=480]+bestaudio/best[height<=480]/best");
                cmd.AppendSwitchASCII("merge-output-format", "mp4");
                break;
              case 3:  // 360p
                cmd.AppendSwitchASCII(
                    "format",
                    "bestvideo[height<=360]+bestaudio/best[height<=360]/best");
                cmd.AppendSwitchASCII("merge-output-format", "mp4");
                break;
              case 4:  // Audio only
                cmd.AppendSwitch("extract-audio");
                cmd.AppendSwitchASCII("audio-format", "mp3");
                break;
              default:
                cmd.AppendSwitchASCII(
                    "format",
                    "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best");
                cmd.AppendSwitchASCII("merge-output-format", "mp4");
                break;
            }

            cmd.AppendArg(url.spec());

            base::LaunchOptions options;
            options.start_hidden = true;
            base::Process process = base::LaunchProcess(cmd, options);
            if (process.IsValid()) {
              LOG(INFO) << "[Rinswa] Started video download process: "
                        << process.Pid() << " for URL: " << url.spec();
              int exit_code = 0;
              process.WaitForExit(&exit_code);
              LOG(INFO) << "[Rinswa] Video download finished with exit code: "
                        << exit_code;
              if (exit_code == 0) {
#if BUILDFLAG(IS_WIN)
                ui::win::OpenFolderViaShell(downloads_dir);
#endif
              }
            } else {
              LOG(ERROR) << "[Rinswa] Failed to launch yt-dlp process";
            }
          },
          video_url, resolution_choice));
}

}  // namespace

void ShowRinswaDownloadProgressDialog(content::WebContents* web_contents,
                                     const std::u16string& video_title) {
  if (!web_contents) {
    return;
  }

  auto dialog = std::make_unique<views::DialogDelegate>();
  dialog->SetTitle(u"Downloading Video...");
  dialog->SetShowCloseButton(true);
  dialog->SetModalType(ui::mojom::ModalType::kChild);
  dialog->SetButtons(static_cast<int>(ui::mojom::DialogButton::kOk));
  dialog->SetButtonLabel(ui::mojom::DialogButton::kOk, u"Download in Background");

  auto contents = std::make_unique<views::View>();
  contents->SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical, gfx::Insets::VH(16, 20), 12));

  auto* title_label = contents->AddChildView(
      std::make_unique<views::Label>(video_title));
  title_label->SetFontList(gfx::FontList({"Segoe UI", "sans-serif"},
                                         gfx::Font::FontStyle::NORMAL, 13,
                                         gfx::Font::Weight::BOLD));
  title_label->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  title_label->SetMultiLine(true);
  title_label->SetMaximumWidth(420);

  auto* progress_bar =
      contents->AddChildView(std::make_unique<views::ProgressBar>());
  progress_bar->SetValue(-1);  // Indeterminate loading animation
  progress_bar->SetPreferredHeight(6);

  auto* desc_label = contents->AddChildView(std::make_unique<views::Label>(
      u"Downloading and processing media stream. When finished, your Downloads folder will automatically open with the completed video file."));
  desc_label->SetFontList(gfx::FontList({"Segoe UI", "sans-serif"},
                                        gfx::Font::FontStyle::NORMAL, 11,
                                        gfx::Font::Weight::NORMAL));
  desc_label->SetEnabledColor(SkColorSetRGB(120, 120, 120));
  desc_label->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  desc_label->SetMultiLine(true);
  desc_label->SetMaximumWidth(420);

  dialog->SetContentsView(std::move(contents));
  constrained_window::ShowWebModalDialogViews(dialog.release(), web_contents);
}

void ShowRinswaVideoDownloadDialog(content::WebContents* web_contents,
                                   const GURL& video_url,
                                   const std::string& page_title) {
  if (!web_contents) {
    return;
  }

  auto dialog = std::make_unique<views::DialogDelegate>();
  dialog->SetTitle(u"Download Video");
  dialog->SetShowCloseButton(true);
  dialog->SetModalType(ui::mojom::ModalType::kChild);
  dialog->SetButtons(static_cast<int>(ui::mojom::DialogButton::kOk) |
                     static_cast<int>(ui::mojom::DialogButton::kCancel));
  dialog->SetButtonLabel(ui::mojom::DialogButton::kOk, u"Download");
  dialog->SetButtonLabel(ui::mojom::DialogButton::kCancel, u"Cancel");

  auto contents = std::make_unique<views::View>();
  contents->SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical, gfx::Insets::VH(14, 18), 10));

  std::u16string display_title = base::UTF8ToUTF16(page_title);
  if (display_title.empty()) {
    display_title = base::UTF8ToUTF16(video_url.spec());
  }
  auto* title_label =
      contents->AddChildView(std::make_unique<views::Label>(display_title));
  title_label->SetFontList(gfx::FontList({"Segoe UI", "sans-serif"},
                                         gfx::Font::FontStyle::NORMAL, 13,
                                         gfx::Font::Weight::BOLD));
  title_label->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  title_label->SetMultiLine(true);
  title_label->SetMaximumWidth(400);

  std::string domain(video_url.host());
  auto* url_label = contents->AddChildView(std::make_unique<views::Label>(
      base::UTF8ToUTF16(domain.empty() ? video_url.spec() : domain)));
  url_label->SetFontList(gfx::FontList({"Segoe UI", "sans-serif"},
                                       gfx::Font::FontStyle::NORMAL, 11,
                                       gfx::Font::Weight::NORMAL));
  url_label->SetEnabledColor(SkColorSetRGB(130, 130, 130));
  url_label->SetHorizontalAlignment(gfx::ALIGN_LEFT);

  contents->AddChildView(std::make_unique<views::Separator>());

  auto* select_label = contents->AddChildView(
      std::make_unique<views::Label>(u"Select Download Resolution:"));
  select_label->SetFontList(gfx::FontList({"Segoe UI", "sans-serif"},
                                          gfx::Font::FontStyle::NORMAL, 12,
                                          gfx::Font::Weight::BOLD));
  select_label->SetHorizontalAlignment(gfx::ALIGN_LEFT);

  const int kRadioGroup = 100;
  auto* rb_1080p = contents->AddChildView(std::make_unique<views::RadioButton>(
      u"1080p Full HD (MP4) - Best Quality", kRadioGroup));
  rb_1080p->SetChecked(true);

  auto* rb_720p = contents->AddChildView(std::make_unique<views::RadioButton>(
      u"720p HD (MP4) - High Quality", kRadioGroup));

  auto* rb_480p = contents->AddChildView(std::make_unique<views::RadioButton>(
      u"480p Standard (MP4)", kRadioGroup));

  auto* rb_360p = contents->AddChildView(std::make_unique<views::RadioButton>(
      u"360p Low (MP4)", kRadioGroup));

  auto* rb_audio = contents->AddChildView(std::make_unique<views::RadioButton>(
      u"Audio Only (MP3)", kRadioGroup));

  contents->AddChildView(std::make_unique<views::Separator>());

  auto* dest_label = contents->AddChildView(std::make_unique<views::Label>(
      u"Video will be downloaded directly to your Downloads folder."));
  dest_label->SetFontList(gfx::FontList({"Segoe UI", "sans-serif"},
                                        gfx::Font::FontStyle::NORMAL, 11,
                                        gfx::Font::Weight::NORMAL));
  dest_label->SetEnabledColor(SkColorSetRGB(120, 120, 120));
  dest_label->SetHorizontalAlignment(gfx::ALIGN_LEFT);

  base::WeakPtr<content::WebContents> weak_wc = web_contents->GetWeakPtr();

  dialog->SetAcceptCallback(base::BindOnce(
      [](base::WeakPtr<content::WebContents> wc, std::u16string title,
         GURL url, views::RadioButton* r1080, views::RadioButton* r720,
         views::RadioButton* r480, views::RadioButton* r360,
         views::RadioButton* raudio) {
        int choice = 0;
        if (r1080 && r1080->GetChecked()) {
          choice = 0;
        } else if (r720 && r720->GetChecked()) {
          choice = 1;
        } else if (r480 && r480->GetChecked()) {
          choice = 2;
        } else if (r360 && r360->GetChecked()) {
          choice = 3;
        } else if (raudio && raudio->GetChecked()) {
          choice = 4;
        }
        StartRinswaVideoDownload(url, choice);
        if (wc) {
          ShowRinswaDownloadProgressDialog(wc.get(), title);
        }
      },
      weak_wc, display_title, video_url,
      base::Unretained(rb_1080p), base::Unretained(rb_720p),
      base::Unretained(rb_480p), base::Unretained(rb_360p),
      base::Unretained(rb_audio)));

  dialog->SetContentsView(std::move(contents));
  constrained_window::ShowWebModalDialogViews(dialog.release(), web_contents);
}

}  // namespace chrome
