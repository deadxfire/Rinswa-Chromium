// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/tabs/shared/tab_strip_combo_button.h"

#include "base/i18n/rtl.h"
#include "base/metrics/user_metrics.h"
#include "base/metrics/user_metrics_action.h"
#include "base/task/sequenced_task_runner.h"
#include "base/time/time.h"
#include "chrome/app/chrome_command_ids.h"
#include "chrome/app/vector_icons/vector_icons.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/favicon/favicon_service_factory.h"
#include "chrome/browser/favicon/history_ui_favicon_request_handler_factory.h"
#include "chrome/browser/ui/actions/chrome_action_id.h"
#include "chrome/browser/ui/browser_actions.h"
#include "chrome/browser/ui/browser_commands.h"
#include "chrome/browser/ui/browser_element_identifiers.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/layout_constants.h"
#include "chrome/browser/ui/tabs/organizer/organizer_panel_utils.h"
#include "chrome/browser/ui/tabs/saved_tab_groups/saved_tab_group_utils.h"
#include "chrome/browser/ui/tabs/vertical_tab_strip_state_controller.h"
#include "chrome/browser/ui/views/bookmarks/saved_tab_groups/saved_tab_group_everything_menu.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/tab_search_bubble_host.h"
#include "chrome/browser/ui/views/tabs/shared/tab_strip_flat_edge_button.h"
#include "chrome/browser/ui/views/toolbar/app_menu.h"
#include "chrome/browser/ui/toolbar/app_menu_model.h"
#include "chrome/browser/ui/views/toolbar/toolbar_view.h"
#include "chrome/common/pref_names.h"
#include "chrome/grit/generated_resources.h"
#include "chrome/grit/theme_resources.h"
#include "components/favicon/core/favicon_service.h"
#include "components/favicon/core/history_ui_favicon_request_handler.h"
#include "components/prefs/pref_service.h"
#include "ui/base/resource/resource_bundle.h"
#include "ui/gfx/image/image_skia_operations.h"
#include "components/saved_tab_groups/public/features.h"
#include "components/vector_icons/vector_icons.h"
#include "ui/base/l10n/l10n_util.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/ui_base_features.h"
#include "ui/views/actions/action_view_controller.h"
#include "ui/views/controls/button/menu_button_controller.h"
#include "ui/views/controls/menu/menu_model_adapter.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/browser_tabstrip.h"
#include "chrome/browser/ui/browser_window.h"
#include "ui/views/window/dialog_delegate.h"
#include "ui/views/controls/textfield/textfield.h"
#include "ui/views/controls/label.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/image/canvas_image_source.h"
#include "ui/gfx/image/image_skia.h"
#include "base/strings/utf_string_conversions.h"
#include "base/strings/string_util.h"
#include "third_party/skia/include/core/SkPathBuilder.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/layout/layout_types.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/view_utils.h"

namespace {
constexpr base::TimeDelta kHideTabSearchButtonDelay = base::Seconds(2);
constexpr base::TimeDelta kAnimationDuration = base::Milliseconds(300);

constexpr int kOpenShortcutTab = 9001;
constexpr int kOpenShortcutWindow = 9002;
constexpr int kEditShortcut = 9003;
constexpr int kResetShortcut = 9004;
constexpr int kToggleHideShortcuts = 9005;

class TabStripShortcutImageSource : public gfx::CanvasImageSource {
 public:
  enum class Type {
    kYouTube,
    kGmail,
    kWikipedia,
    kWhatsApp,
    kX,
    kGitHub,
    kReddit,
    kFacebook,
    kChatGPT,
    kNetflix,
    kGeneric
  };

  TabStripShortcutImageSource(Type type,
                              const std::string& letter,
                              SkColor bg_color = SK_ColorTRANSPARENT)
      : gfx::CanvasImageSource(gfx::Size(16, 16)),
        type_(type),
        letter_(letter),
        bg_color_(bg_color) {}

  void Draw(gfx::Canvas* canvas) override {
    if (type_ == Type::kYouTube) {
      cc::PaintFlags flags;
      flags.setAntiAlias(true);
      flags.setColor(SkColorSetRGB(235, 32, 32));
      flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawRoundRect(gfx::RectF(0.5f, 2.0f, 15.0f, 12.0f), 3.5f, flags);

      cc::PaintFlags play_flags;
      play_flags.setAntiAlias(true);
      play_flags.setColor(SK_ColorWHITE);
      play_flags.setStyle(cc::PaintFlags::kFill_Style);
      SkPathBuilder path;
      path.moveTo(6.5f, 5.0f);
      path.lineTo(11.0f, 8.0f);
      path.lineTo(6.5f, 11.0f);
      path.close();
      canvas->DrawPath(path.detach(), play_flags);
    } else if (type_ == Type::kGmail) {
      cc::PaintFlags bg_flags;
      bg_flags.setAntiAlias(true);
      bg_flags.setColor(SK_ColorWHITE);
      bg_flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawRoundRect(gfx::RectF(1.0f, 2.0f, 14.0f, 12.0f), 2.5f, bg_flags);

      cc::PaintFlags m_flags;
      m_flags.setAntiAlias(true);
      m_flags.setColor(SkColorSetRGB(234, 67, 53));
      m_flags.setStyle(cc::PaintFlags::kStroke_Style);
      m_flags.setStrokeWidth(1.8f);
      m_flags.setStrokeCap(cc::PaintFlags::kRound_Cap);
      m_flags.setStrokeJoin(cc::PaintFlags::kRound_Join);

      SkPathBuilder m_path;
      m_path.moveTo(2.5f, 12.0f);
      m_path.lineTo(2.5f, 4.0f);
      m_path.lineTo(8.0f, 8.5f);
      m_path.lineTo(13.5f, 4.0f);
      m_path.lineTo(13.5f, 12.0f);
      canvas->DrawPath(m_path.detach(), m_flags);
    } else if (type_ == Type::kWikipedia) {
      cc::PaintFlags bg_flags;
      bg_flags.setAntiAlias(true);
      bg_flags.setColor(SK_ColorWHITE);
      bg_flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawRoundRect(gfx::RectF(1.0f, 1.0f, 14.0f, 14.0f), 3.0f, bg_flags);

      canvas->DrawStringRectWithFlags(
          u"W",
          gfx::FontList({"Times New Roman", "serif"},
                        gfx::Font::FontStyle::NORMAL, 11,
                        gfx::Font::Weight::BOLD),
          SK_ColorBLACK, gfx::Rect(0, 0, 16, 16),
          gfx::Canvas::TEXT_ALIGN_CENTER);
    } else if (type_ == Type::kWhatsApp) {
      cc::PaintFlags bg_flags;
      bg_flags.setAntiAlias(true);
      bg_flags.setColor(SkColorSetRGB(37, 211, 102));
      bg_flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawRoundRect(gfx::RectF(1.0f, 1.0f, 14.0f, 14.0f), 4.0f, bg_flags);

      canvas->DrawStringRectWithFlags(
          u"W",
          gfx::FontList({"Segoe UI", "sans-serif"},
                        gfx::Font::FontStyle::NORMAL, 10,
                        gfx::Font::Weight::BOLD),
          SK_ColorWHITE, gfx::Rect(0, 0, 16, 16),
          gfx::Canvas::TEXT_ALIGN_CENTER);
    } else if (type_ == Type::kX) {
      cc::PaintFlags bg_flags;
      bg_flags.setAntiAlias(true);
      bg_flags.setColor(SK_ColorBLACK);
      bg_flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawRoundRect(gfx::RectF(1.0f, 1.0f, 14.0f, 14.0f), 3.0f, bg_flags);

      canvas->DrawStringRectWithFlags(
          u"X",
          gfx::FontList({"Segoe UI", "sans-serif"},
                        gfx::Font::FontStyle::NORMAL, 10,
                        gfx::Font::Weight::BOLD),
          SK_ColorWHITE, gfx::Rect(0, 0, 16, 16),
          gfx::Canvas::TEXT_ALIGN_CENTER);
    } else if (type_ == Type::kGitHub) {
      cc::PaintFlags bg_flags;
      bg_flags.setAntiAlias(true);
      bg_flags.setColor(SkColorSetRGB(36, 41, 46));
      bg_flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawRoundRect(gfx::RectF(1.0f, 1.0f, 14.0f, 14.0f), 4.0f, bg_flags);

      canvas->DrawStringRectWithFlags(
          u"GH",
          gfx::FontList({"Segoe UI", "sans-serif"},
                        gfx::Font::FontStyle::NORMAL, 8,
                        gfx::Font::Weight::BOLD),
          SK_ColorWHITE, gfx::Rect(0, 0, 16, 16),
          gfx::Canvas::TEXT_ALIGN_CENTER);
    } else if (type_ == Type::kReddit) {
      cc::PaintFlags bg_flags;
      bg_flags.setAntiAlias(true);
      bg_flags.setColor(SkColorSetRGB(255, 69, 0));
      bg_flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawCircle(gfx::PointF(8.0f, 8.0f), 7.0f, bg_flags);

      canvas->DrawStringRectWithFlags(
          u"r/",
          gfx::FontList({"Segoe UI", "sans-serif"},
                        gfx::Font::FontStyle::NORMAL, 8,
                        gfx::Font::Weight::BOLD),
          SK_ColorWHITE, gfx::Rect(0, 0, 16, 16),
          gfx::Canvas::TEXT_ALIGN_CENTER);
    } else if (type_ == Type::kFacebook) {
      cc::PaintFlags bg_flags;
      bg_flags.setAntiAlias(true);
      bg_flags.setColor(SkColorSetRGB(24, 119, 242));
      bg_flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawRoundRect(gfx::RectF(1.0f, 1.0f, 14.0f, 14.0f), 4.0f, bg_flags);

      canvas->DrawStringRectWithFlags(
          u"f",
          gfx::FontList({"Segoe UI", "sans-serif"},
                        gfx::Font::FontStyle::NORMAL, 11,
                        gfx::Font::Weight::BOLD),
          SK_ColorWHITE, gfx::Rect(0, 0, 16, 16),
          gfx::Canvas::TEXT_ALIGN_CENTER);
    } else if (type_ == Type::kChatGPT) {
      cc::PaintFlags bg_flags;
      bg_flags.setAntiAlias(true);
      bg_flags.setColor(SkColorSetRGB(16, 163, 127));
      bg_flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawRoundRect(gfx::RectF(1.0f, 1.0f, 14.0f, 14.0f), 4.0f, bg_flags);

      canvas->DrawStringRectWithFlags(
          u"AI",
          gfx::FontList({"Segoe UI", "sans-serif"},
                        gfx::Font::FontStyle::NORMAL, 8,
                        gfx::Font::Weight::BOLD),
          SK_ColorWHITE, gfx::Rect(0, 0, 16, 16),
          gfx::Canvas::TEXT_ALIGN_CENTER);
    } else if (type_ == Type::kNetflix) {
      cc::PaintFlags bg_flags;
      bg_flags.setAntiAlias(true);
      bg_flags.setColor(SK_ColorBLACK);
      bg_flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawRoundRect(gfx::RectF(1.0f, 1.0f, 14.0f, 14.0f), 3.0f, bg_flags);

      canvas->DrawStringRectWithFlags(
          u"N",
          gfx::FontList({"Segoe UI", "sans-serif"},
                        gfx::Font::FontStyle::NORMAL, 10,
                        gfx::Font::Weight::BOLD),
          SkColorSetRGB(229, 9, 20), gfx::Rect(0, 0, 16, 16),
          gfx::Canvas::TEXT_ALIGN_CENTER);
    } else {
      cc::PaintFlags bg_flags;
      bg_flags.setAntiAlias(true);
      bg_flags.setColor(bg_color_ != SK_ColorTRANSPARENT
                            ? bg_color_
                            : SkColorSetRGB(66, 133, 244));
      bg_flags.setStyle(cc::PaintFlags::kFill_Style);
      canvas->DrawRoundRect(gfx::RectF(1.0f, 1.0f, 14.0f, 14.0f), 3.5f, bg_flags);

      canvas->DrawStringRectWithFlags(
          base::UTF8ToUTF16(letter_),
          gfx::FontList({"Segoe UI", "sans-serif"},
                        gfx::Font::FontStyle::NORMAL, 10,
                        gfx::Font::Weight::BOLD),
          SK_ColorWHITE, gfx::Rect(0, 0, 16, 16),
          gfx::Canvas::TEXT_ALIGN_CENTER);
    }
  }

 private:
  Type type_;
  std::string letter_;
  SkColor bg_color_;
};

}  // namespace

DEFINE_CLASS_ELEMENT_IDENTIFIER_VALUE(TabStripComboButton,
                                      kTabSearchUnpinMenuItem);
DEFINE_CLASS_ELEMENT_IDENTIFIER_VALUE(TabStripComboButton,
                                      kEverythingMenuUnpinMenuItem);
DEFINE_CLASS_ELEMENT_IDENTIFIER_VALUE(TabStripComboButton,
                                      kRinswaAppMenuButton);

TabStripComboButton::TabStripComboButton(BrowserWindowInterface* browser,
                                         Context context)
    : browser_(browser),
      context_(context),
      action_view_controller_(std::make_unique<views::ActionViewController>()) {
  base::TimeDelta animation_duration =
      gfx::Animation::ShouldRenderRichAnimation() ? kAnimationDuration
                                                  : base::TimeDelta();
  start_button_animation_.SetSlideDuration(animation_duration);
  end_button_animation_.SetSlideDuration(animation_duration);
  SetProperty(views::kElementIdentifierKey, kTabStripComboButtonElementId);
  SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kHorizontal, gfx::Insets(),
      GetLayoutConstant(
          LayoutConstant::kVerticalTabStripFlatEdgeButtonPadding)));

  std::unique_ptr<TabStripFlatEdgeButton> start_button;
  if (context_ == Context::kVerticalTabStrip) {
    if (tab_groups::SavedTabGroupUtils::IsEnabledForProfile(
            browser_->GetProfile()) &&
        !organizer_panel::IsOrganizerPanelFeatureEnabled()) {
      start_button = CreateFlatEdgeButtonFor(kActionTabGroupsMenu,
                                             kSavedTabGroupButtonElementId);

      auto controller = std::make_unique<views::MenuButtonController>(
          start_button.get(),
          base::BindRepeating(&TabStripComboButton::ShowEverythingMenu,
                              base::Unretained(this)),
          std::make_unique<views::Button::DefaultButtonControllerDelegate>(
              start_button.get()));
      everything_menu_controller_ = controller.get();
      start_button->SetButtonController(std::move(controller));
    }
  } else {
    start_button = CreateFlatEdgeButtonFor(kRinswaAppMenuButton);
    ui::ResourceBundle& rb = ui::ResourceBundle::GetSharedInstance();
    const gfx::ImageSkia* logo = rb.GetImageSkiaNamed(IDR_PRODUCT_LOGO_32);
    if (!logo || logo->isNull()) {
      logo = rb.GetImageSkiaNamed(IDR_PRODUCT_LOGO_16);
    }
    if (logo && !logo->isNull()) {
      gfx::ImageSkia resized_logo = gfx::ImageSkiaOperations::CreateResizedImage(
          *logo, skia::ImageOperations::RESIZE_BEST, gfx::Size(22, 22));
      ui::ImageModel logo_model = ui::ImageModel::FromImageSkia(resized_logo);
      start_button->SetImageModel(views::Button::STATE_NORMAL, logo_model);
      start_button->SetImageModel(views::Button::STATE_HOVERED, logo_model);
      start_button->SetImageModel(views::Button::STATE_PRESSED, logo_model);
    }
    start_button->SetTooltipText(u"Rinswa");
    auto controller = std::make_unique<views::MenuButtonController>(
        start_button.get(),
        base::BindRepeating(&TabStripComboButton::ShowAppMenu,
                            base::Unretained(this)),
        std::make_unique<views::Button::DefaultButtonControllerDelegate>(
            start_button.get()));
    app_menu_controller_ = controller.get();
    start_button->SetButtonController(std::move(controller));
  }

  if (start_button) {
    if (context_ == Context::kHorizontalTabStrip) {
      start_button->set_paint_transparent(true);
    }
    start_button_ = AddChildView(std::move(start_button));
  }
  end_button_ = AddChildView(
      CreateFlatEdgeButtonFor(kActionTabSearch, kTabSearchButtonElementId));
  if (context_ == Context::kHorizontalTabStrip && end_button_) {
    end_button_->set_paint_transparent(true);
  }

  if (context_ == Context::kHorizontalTabStrip) {
    shortcut_button_1_ = AddChildView(CreateShortcutButton(1));
    shortcut_button_2_ = AddChildView(CreateShortcutButton(2));
  }

  PrefService* prefs = browser_->GetProfile()->GetPrefs();
  pref_registrar_.Init(prefs);
  pref_registrar_.Add(
      prefs::kTabSearchPinnedToTabstrip,
      base::BindRepeating(&TabStripComboButton::UpdateButtonsVisibility,
                          base::Unretained(this)));
  pref_registrar_.Add(
      prefs::kEverythingMenuPinnedToTabstrip,
      base::BindRepeating(&TabStripComboButton::UpdateButtonsVisibility,
                          base::Unretained(this)));
  pref_registrar_.Add(
      prefs::kTabStripShortcutsEnabled,
      base::BindRepeating(&TabStripComboButton::UpdateButtonsVisibility,
                          base::Unretained(this)));
  pref_registrar_.Add(
      prefs::kTabStripShortcut1Title,
      base::BindRepeating(&TabStripComboButton::UpdateShortcuts,
                          base::Unretained(this)));
  pref_registrar_.Add(
      prefs::kTabStripShortcut1Url,
      base::BindRepeating(&TabStripComboButton::UpdateShortcuts,
                          base::Unretained(this)));
  pref_registrar_.Add(
      prefs::kTabStripShortcut2Title,
      base::BindRepeating(&TabStripComboButton::UpdateShortcuts,
                          base::Unretained(this)));
  pref_registrar_.Add(
      prefs::kTabStripShortcut2Url,
      base::BindRepeating(&TabStripComboButton::UpdateShortcuts,
                          base::Unretained(this)));
  UpdateButtonsVisibility();
  UpdateShortcuts();
  UpdateStyles();
}

TabStripComboButton::~TabStripComboButton() {
  tab_search_bubble_host_observation_.Reset();
  app_menu_.reset();
  app_menu_model_.reset();
}

void TabStripComboButton::UpdateButtonsVisibility() {
  if (!browser_ || !BrowserActions::From(browser_)) {
    return;
  }
  auto update_button_visibility = [&](actions::ActionItem* action_item,
                                      gfx::SlideAnimation& animation,
                                      bool target_visible) {
    if (!action_item) {
      return;
    }

    if (target_visible) {
      action_item->SetVisible(true);
      animation.Show();
    } else {
      animation.Hide();
    }
    if (!animation.is_animating() && animation.GetCurrentValue() == 0.0) {
      action_item->SetVisible(false);
    }
  };

  PrefService* prefs = browser_->GetProfile()->GetPrefs();
  if (start_button_) {
    if (context_ == Context::kHorizontalTabStrip) {
      start_button_->SetVisible(true);
      start_button_->SetExpansionFactor(1.0f);
      start_button_->SetIconOpacity(1.0f);
    } else {
      update_button_visibility(
          GetStartButtonActionItem(), start_button_animation_,
          prefs->GetBoolean(prefs::kEverythingMenuPinnedToTabstrip));
    }
  }

  update_button_visibility(GetEndButtonActionItem(), end_button_animation_,
                           IsTabSearchPinned() || show_tab_search_ephemerally_);

  const bool shortcuts_enabled =
      prefs->GetBoolean(prefs::kTabStripShortcutsEnabled);
  if (shortcut_button_1_) {
    shortcut_button_1_->SetVisible(shortcuts_enabled);
  }
  if (shortcut_button_2_) {
    shortcut_button_2_->SetVisible(shortcuts_enabled);
  }
}

void TabStripComboButton::SetOrientation(views::LayoutOrientation orientation) {
  if (orientation_ == orientation) {
    return;
  }
  orientation_ = orientation;

  if (start_button_) {
    start_button_->SetExpansionOrientation(orientation_);
  }
  if (end_button_) {
    end_button_->SetExpansionOrientation(orientation_);
  }

  views::BoxLayout* layout = static_cast<views::BoxLayout*>(GetLayoutManager());
  layout->SetOrientation(orientation_);
  layout->set_between_child_spacing(GetLayoutConstant(
      LayoutConstant::kVerticalTabStripFlatEdgeButtonPadding));

  UpdateStyles();
}

void TabStripComboButton::ChildVisibilityChanged(views::View* child) {
  UpdateStyles();
  PreferredSizeChanged();
}

void TabStripComboButton::ShowEverythingMenu() {
  base::RecordAction(base::UserMetricsAction(
      BrowserView::GetBrowserViewForBrowser(browser_)
              ->ShouldDrawVerticalTabStrip()
          ? "TabGroups_SavedTabGroups_EverythingButtonPressed_Vertical"
          : "TabGroups_SavedTabGroups_EverythingButtonPressed_Horizontal"));
  browser_->GetProfile()->GetPrefs()->SetTime(
      prefs::kVerticalTabsEverythingMenuLastPressed, base::Time::Now());
  if (everything_menu_ && everything_menu_->IsShowing()) {
    return;
  }

  everything_menu_ = std::make_unique<tab_groups::STGEverythingMenu>(
      everything_menu_controller_, browser_,
      tab_groups::STGEverythingMenu::MenuContext::kVerticalTabStrip);

  everything_menu_->RunMenu();
}

void TabStripComboButton::ShowAppMenu() {
  BrowserView* const browser_view =
      BrowserView::GetBrowserViewForBrowser(browser_);
  if (!browser_view) {
    return;
  }

  ToolbarView* const toolbar = browser_view->toolbar();
  if (!toolbar) {
    return;
  }

  if (app_menu_ && app_menu_->IsShowing()) {
    app_menu_->CloseMenu();
    return;
  }

  app_menu_.reset();
  app_menu_model_.reset();

  AlertMenuItem alert_item =
      AppMenuModel::GetAlertItemForRunningTutorial(browser_);

  app_menu_model_ = std::make_unique<AppMenuModel>(
      toolbar, browser_, toolbar->app_menu_icon_controller(), alert_item);
  app_menu_model_->Init();

  app_menu_ = std::make_unique<AppMenu>(
      browser_, app_menu_model_.get(), views::MenuRunner::HAS_MNEMONICS,
      base::BindRepeating(&TabStripComboButton::OnAppMenuClosed,
                          weak_ptr_factory_.GetWeakPtr()));
  app_menu_->RunMenu(app_menu_controller_, ui::mojom::MenuSourceType::kNone,
                     views::MenuAnchorPosition::kTopLeft);
}

void TabStripComboButton::OnAppMenuClosed() {
  base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE,
      base::BindOnce(
          [](base::WeakPtr<TabStripComboButton> self) {
            if (self) {
              self->app_menu_.reset();
              self->app_menu_model_.reset();
            }
          },
          weak_ptr_factory_.GetWeakPtr()));
}

std::unique_ptr<TabStripFlatEdgeButton>
TabStripComboButton::CreateFlatEdgeButtonFor(ui::ElementIdentifier element_id) {
  auto button = std::make_unique<TabStripFlatEdgeButton>();
  button->SetHorizontalAlignment(gfx::HorizontalAlignment::ALIGN_CENTER);
  button->SetShouldShowLabel(context_ == Context::kVerticalTabStrip);
  button->SetExpansionOrientation(orientation_);
  button->set_context_menu_controller(this);
  button->SetProperty(views::kElementIdentifierKey, element_id);
  return button;
}

std::unique_ptr<TabStripFlatEdgeButton>
TabStripComboButton::CreateFlatEdgeButtonFor(actions::ActionId action_id,
                                             ui::ElementIdentifier element_id) {
  auto button = CreateFlatEdgeButtonFor(element_id);
  if (!browser_ || !BrowserActions::From(browser_)) {
    return button;
  }
  actions::ActionItem* action_item = actions::ActionManager::Get().FindAction(
      action_id, BrowserActions::From(browser_)->root_action_item());
  CHECK(action_item);
  action_view_controller_->CreateActionViewRelationship(
      button.get(), action_item->GetAsWeakPtr());

  return button;
}

void TabStripComboButton::UpdateStyles() {
  const bool both_visible = start_button_ && start_button_->GetVisible() &&
                            end_button_ && end_button_->GetVisible();
  const bool is_vertical = orientation_ == views::LayoutOrientation::kVertical;

  if (start_button_) {
    TabStripFlatEdgeButton::FlatEdge flat_edge =
        TabStripFlatEdgeButton::FlatEdge::kNone;
    if (both_visible) {
      if (is_vertical) {
        flat_edge = TabStripFlatEdgeButton::FlatEdge::kBottom;
      } else {
        flat_edge = base::i18n::IsRTL()
                        ? TabStripFlatEdgeButton::FlatEdge::kLeft
                        : TabStripFlatEdgeButton::FlatEdge::kRight;
      }
    }
    start_button_->SetFlatEdge(flat_edge);
  }

  if (end_button_) {
    TabStripFlatEdgeButton::FlatEdge flat_edge =
        TabStripFlatEdgeButton::FlatEdge::kNone;
    if (both_visible) {
      if (is_vertical) {
        flat_edge = TabStripFlatEdgeButton::FlatEdge::kTop;
      } else {
        flat_edge = base::i18n::IsRTL()
                        ? TabStripFlatEdgeButton::FlatEdge::kRight
                        : TabStripFlatEdgeButton::FlatEdge::kLeft;
      }
    }
    end_button_->SetFlatEdge(flat_edge);
  }

  if (shortcut_button_1_) {
    shortcut_button_1_->SetFlatEdge(TabStripFlatEdgeButton::FlatEdge::kNone);
  }
  if (shortcut_button_2_) {
    shortcut_button_2_->SetFlatEdge(TabStripFlatEdgeButton::FlatEdge::kNone);
  }
}

std::unique_ptr<TabStripFlatEdgeButton>
TabStripComboButton::CreateShortcutButton(int index) {
  auto button = std::make_unique<TabStripFlatEdgeButton>();
  button->SetHorizontalAlignment(gfx::HorizontalAlignment::ALIGN_CENTER);
  button->SetShouldShowLabel(false);
  button->SetExpansionOrientation(orientation_);
  button->set_paint_transparent(true);
  button->set_context_menu_controller(this);
  button->SetCallback(base::BindRepeating(
      &TabStripComboButton::OnShortcutClicked, base::Unretained(this), index));
  return button;
}

void TabStripComboButton::UpdateShortcuts() {
  if (!browser_ || !browser_->GetProfile()) {
    return;
  }
  favicon_task_tracker_.TryCancelAll();
  PrefService* prefs = browser_->GetProfile()->GetPrefs();
  auto configure_button = [&](TabStripFlatEdgeButton* button, int index) {
    if (!button) {
      return;
    }
    std::string title = prefs->GetString(
        index == 1 ? prefs::kTabStripShortcut1Title
                   : prefs::kTabStripShortcut2Title);
    std::string url = prefs->GetString(
        index == 1 ? prefs::kTabStripShortcut1Url
                   : prefs::kTabStripShortcut2Url);
    if (title.empty()) {
      title = (index == 1) ? "YouTube" : "Gmail";
    }
    if (url.empty()) {
      url = (index == 1) ? "https://www.youtube.com"
                         : "https://mail.google.com";
    }
    std::u16string title16 = base::UTF8ToUTF16(title);
    button->SetTooltipText(title16);
    button->GetViewAccessibility().SetName(title16);

    TabStripShortcutImageSource::Type icon_type =
        TabStripShortcutImageSource::Type::kGeneric;
    std::string lower_url = base::ToLowerASCII(url);
    std::string lower_title = base::ToLowerASCII(title);
    if (lower_url.find("youtube") != std::string::npos ||
        lower_title.find("youtube") != std::string::npos) {
      icon_type = TabStripShortcutImageSource::Type::kYouTube;
    } else if (lower_url.find("mail.google.com") != std::string::npos ||
               lower_title.find("gmail") != std::string::npos ||
               lower_url.find("gmail") != std::string::npos) {
      icon_type = TabStripShortcutImageSource::Type::kGmail;
    } else if (lower_url.find("wikipedia.org") != std::string::npos ||
               lower_title.find("wikipedia") != std::string::npos) {
      icon_type = TabStripShortcutImageSource::Type::kWikipedia;
    } else if (lower_url.find("whatsapp.com") != std::string::npos ||
               lower_title.find("whatsapp") != std::string::npos) {
      icon_type = TabStripShortcutImageSource::Type::kWhatsApp;
    } else if (lower_url.find("twitter.com") != std::string::npos ||
               lower_url.find("x.com") != std::string::npos ||
               lower_title == "x") {
      icon_type = TabStripShortcutImageSource::Type::kX;
    } else if (lower_url.find("github.com") != std::string::npos ||
               lower_title.find("github") != std::string::npos) {
      icon_type = TabStripShortcutImageSource::Type::kGitHub;
    } else if (lower_url.find("reddit.com") != std::string::npos ||
               lower_title.find("reddit") != std::string::npos) {
      icon_type = TabStripShortcutImageSource::Type::kReddit;
    } else if (lower_url.find("facebook.com") != std::string::npos ||
               lower_title.find("facebook") != std::string::npos) {
      icon_type = TabStripShortcutImageSource::Type::kFacebook;
    } else if (lower_url.find("openai.com") != std::string::npos ||
               lower_url.find("chatgpt.com") != std::string::npos ||
               lower_title.find("chatgpt") != std::string::npos) {
      icon_type = TabStripShortcutImageSource::Type::kChatGPT;
    } else if (lower_url.find("netflix.com") != std::string::npos ||
               lower_title.find("netflix") != std::string::npos) {
      icon_type = TabStripShortcutImageSource::Type::kNetflix;
    }

    uint32_t hash = 5381;
    for (char c : lower_url) {
      hash = ((hash << 5) + hash) + static_cast<uint8_t>(c);
    }
    const SkColor kPastelColors[] = {
        SkColorSetRGB(52, 168, 83),   // Google Green
        SkColorSetRGB(66, 133, 244),  // Google Blue
        SkColorSetRGB(251, 188, 4),   // Google Yellow
        SkColorSetRGB(156, 39, 176),  // Purple
        SkColorSetRGB(0, 150, 136),   // Teal
        SkColorSetRGB(233, 30, 99),   // Pink
        SkColorSetRGB(255, 87, 34),   // Deep Orange
        SkColorSetRGB(63, 81, 181),   // Indigo
    };
    SkColor bg_color = kPastelColors[hash % std::size(kPastelColors)];

    std::string first_letter = title.empty() ? "?" : title.substr(0, 1);
    gfx::ImageSkia icon =
        gfx::CanvasImageSource::MakeImageSkia<TabStripShortcutImageSource>(
            icon_type, first_letter, bg_color);
    ui::ImageModel model = ui::ImageModel::FromImageSkia(icon);
    button->SetImageModel(views::Button::STATE_NORMAL, model);
    button->SetImageModel(views::Button::STATE_HOVERED, model);
    button->SetImageModel(views::Button::STATE_PRESSED, model);
    button->SetImageModel(views::Button::STATE_DISABLED, model);

    GURL gurl(url);
    if (!gurl.is_valid()) {
      gurl = GURL("https://" + url);
    }
    if (gurl.is_valid() && browser_->GetProfile()) {
      Profile* profile = browser_->GetProfile();
      favicon::FaviconService* favicon_service =
          FaviconServiceFactory::GetForProfile(
              profile, ServiceAccessType::EXPLICIT_ACCESS);
      if (favicon_service) {
        favicon_service->GetFaviconImageForPageURL(
            gurl,
            base::BindOnce(&TabStripComboButton::OnFaviconLoaded,
                           weak_ptr_factory_.GetWeakPtr(), index),
            &favicon_task_tracker_);
      }
      favicon::HistoryUiFaviconRequestHandler* history_handler =
          HistoryUiFaviconRequestHandlerFactory::GetForBrowserContext(profile);
      if (history_handler) {
        history_handler->GetFaviconImageForPageURL(
            gurl,
            base::BindOnce(&TabStripComboButton::OnFaviconLoaded,
                           weak_ptr_factory_.GetWeakPtr(), index));
      }
    }
  };

  configure_button(shortcut_button_1_, 1);
  configure_button(shortcut_button_2_, 2);
}

void TabStripComboButton::OnFaviconLoaded(
    int index,
    const favicon_base::FaviconImageResult& result) {
  if (result.image.IsEmpty()) {
    return;
  }
  TabStripFlatEdgeButton* button =
      (index == 1) ? shortcut_button_1_ : shortcut_button_2_;
  if (!button) {
    return;
  }
  gfx::ImageSkia icon = result.image.AsImageSkia();
  if (icon.width() != 16 || icon.height() != 16) {
    icon = gfx::ImageSkiaOperations::CreateResizedImage(
        icon, skia::ImageOperations::RESIZE_BEST, gfx::Size(16, 16));
  }
  ui::ImageModel model = ui::ImageModel::FromImageSkia(icon);
  button->SetImageModel(views::Button::STATE_NORMAL, model);
  button->SetImageModel(views::Button::STATE_HOVERED, model);
  button->SetImageModel(views::Button::STATE_PRESSED, model);
  button->SetImageModel(views::Button::STATE_DISABLED, model);
}

void TabStripComboButton::OnShortcutClicked(int index) {
  if (!browser_) {
    return;
  }
  PrefService* prefs = browser_->GetProfile()->GetPrefs();
  std::string url_str = prefs->GetString(
      index == 1 ? prefs::kTabStripShortcut1Url
                 : prefs::kTabStripShortcut2Url);
  if (url_str.empty()) {
    url_str = (index == 1) ? "https://www.youtube.com" : "https://mail.google.com";
  }
  GURL url(url_str);
  if (!url.is_valid()) {
    url = GURL("https://" + url_str);
  }
  if (url.is_valid()) {
    chrome::AddSelectedTabWithURL(browser_, url,
                                  ui::PAGE_TRANSITION_AUTO_BOOKMARK);
  }
}

void TabStripComboButton::ShowEditShortcutDialog(int index) {
  if (!GetWidget()) {
    return;
  }
  PrefService* prefs = browser_->GetProfile()->GetPrefs();
  auto dialog = std::make_unique<views::DialogDelegate>();
  dialog->SetTitle(index == 1 ? u"Edit Shortcut 1" : u"Edit Shortcut 2");
  dialog->SetShowCloseButton(true);
  dialog->SetModalType(ui::mojom::ModalType::kWindow);
  dialog->SetButtons(static_cast<int>(ui::mojom::DialogButton::kOk) |
                     static_cast<int>(ui::mojom::DialogButton::kCancel));
  dialog->SetButtonLabel(ui::mojom::DialogButton::kOk, u"Save");

  auto contents = std::make_unique<views::View>();
  contents->SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical, gfx::Insets::VH(10, 14), 8));

  auto* name_label = contents->AddChildView(std::make_unique<views::Label>(u"Name"));
  name_label->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  auto* name_field = contents->AddChildView(std::make_unique<views::Textfield>());
  std::string cur_title = prefs->GetString(
      index == 1 ? prefs::kTabStripShortcut1Title : prefs::kTabStripShortcut2Title);
  name_field->SetText(base::UTF8ToUTF16(cur_title));
  name_field->SetAccessibleName(u"Shortcut Name");

  auto* url_label = contents->AddChildView(std::make_unique<views::Label>(u"URL"));
  url_label->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  auto* url_field = contents->AddChildView(std::make_unique<views::Textfield>());
  std::string cur_url = prefs->GetString(
      index == 1 ? prefs::kTabStripShortcut1Url : prefs::kTabStripShortcut2Url);
  url_field->SetText(base::UTF8ToUTF16(cur_url));
  url_field->SetAccessibleName(u"Shortcut URL");

  dialog->SetAcceptCallback(base::BindOnce(
      [](PrefService* prefs, int shortcut_index, views::Textfield* nf,
         views::Textfield* uf) {
        std::string title = base::UTF16ToUTF8(nf->GetText());
        std::string url = base::UTF16ToUTF8(uf->GetText());
        if (title.empty()) {
          title = (shortcut_index == 1) ? "YouTube" : "Gmail";
        }
        if (!url.empty() &&
            !base::StartsWith(url, "http://",
                              base::CompareCase::INSENSITIVE_ASCII) &&
            !base::StartsWith(url, "https://",
                              base::CompareCase::INSENSITIVE_ASCII)) {
          url = "https://" + url;
        }
        if (url.empty()) {
          url = (shortcut_index == 1) ? "https://www.youtube.com"
                                      : "https://mail.google.com";
        }
        prefs->SetString(shortcut_index == 1 ? prefs::kTabStripShortcut1Title
                                             : prefs::kTabStripShortcut2Title,
                         title);
        prefs->SetString(shortcut_index == 1 ? prefs::kTabStripShortcut1Url
                                             : prefs::kTabStripShortcut2Url,
                         url);
      },
      base::Unretained(prefs), index, base::Unretained(name_field),
      base::Unretained(url_field)));

  dialog->SetContentsView(std::move(contents));
  views::DialogDelegate::CreateDialogWidget(dialog.release(), nullptr,
                                            GetWidget()->GetNativeView())
      ->Show();
}

bool TabStripComboButton::HasVisibleShortcuts() const {
  return (shortcut_button_1_ && shortcut_button_1_->GetVisible()) ||
         (shortcut_button_2_ && shortcut_button_2_->GetVisible());
}

void TabStripComboButton::ShowContextMenuForViewImpl(
    views::View* source,
    const gfx::Point& point,
    ui::mojom::MenuSourceType source_type) {
  int command_id = -1;
  int string_id = -1;
  ui::ElementIdentifier element_id;
  std::string_view pref_name;

  PrefService* prefs = browser_->GetProfile()->GetPrefs();

  if (source == start_button_) {
    if (context_ == Context::kHorizontalTabStrip) {
      ShowAppMenu();
      return;
    }
    command_id = IDC_EVERYTHING_MENU_TOGGLE_PIN;
    pref_name = prefs::kEverythingMenuPinnedToTabstrip;
    string_id = prefs->GetBoolean(pref_name)
                    ? IDS_EVERYTHING_MENU_BUTTON_CXMENU_UNPIN
                    : IDS_EVERYTHING_MENU_BUTTON_CXMENU_PIN;
    element_id = kEverythingMenuUnpinMenuItem;
  } else if (source == end_button_) {
    command_id = IDC_TAB_SEARCH_TOGGLE_PIN;
    pref_name = prefs::kTabSearchPinnedToTabstrip;
    string_id = prefs->GetBoolean(pref_name)
                    ? IDS_TAB_SEARCH_BUTTON_CXMENU_UNPIN
                    : IDS_TAB_SEARCH_BUTTON_CXMENU_PIN;
    element_id = kTabSearchUnpinMenuItem;
  } else if (source == shortcut_button_1_ || source == shortcut_button_2_) {
    int shortcut_index = (source == shortcut_button_1_) ? 1 : 2;
    context_menu_shortcut_index_ = shortcut_index;

    menu_model_ = std::make_unique<ui::SimpleMenuModel>(this);
    menu_model_->AddItem(kOpenShortcutTab, u"Open in new tab");
    menu_model_->AddItem(kOpenShortcutWindow, u"Open in new window");
    menu_model_->AddSeparator(ui::NORMAL_SEPARATOR);
    menu_model_->AddItem(kEditShortcut, u"Edit shortcut...");
    menu_model_->AddItem(kResetShortcut, u"Reset to default");
    menu_model_->AddSeparator(ui::NORMAL_SEPARATOR);
    menu_model_->AddItem(kToggleHideShortcuts, u"Hide tab strip shortcuts");

    menu_model_adapter_ = std::make_unique<views::MenuModelAdapter>(
        menu_model_.get(),
        base::BindRepeating(&TabStripComboButton::OnMenuClosed,
                            base::Unretained(this)));
    menu_model_adapter_->set_triggerable_event_flags(ui::EF_LEFT_MOUSE_BUTTON |
                                                     ui::EF_RIGHT_MOUSE_BUTTON);
    std::unique_ptr<views::MenuItemView> root = menu_model_adapter_->CreateMenu();
    menu_runner_ = std::make_unique<views::MenuRunner>(
        std::move(root),
        views::MenuRunner::HAS_MNEMONICS | views::MenuRunner::CONTEXT_MENU);

    BrowserView* browser_view = BrowserView::GetBrowserViewForBrowser(browser_);
    if (browser_view && browser_view->tab_strip_view()) {
      expand_on_hover_lock_ = browser_view->tab_strip_view()->GetExpandOnHoverLock(
          ExpandOnHoverLockType::kKeepCurrentState);
    }

    menu_runner_->RunMenuAt(GetWidget(), nullptr,
                            source->GetAnchorBoundsInScreen(),
                            views::MenuAnchorPosition::kTopLeft, source_type);
    return;
  } else {
    return;
  }

  const bool is_pinned = prefs->GetBoolean(pref_name);
  const gfx::VectorIcon& icon =
      is_pinned
          ? features::IsRoundedIconsEnabled() ? kKeepOffIcon : kKeepOffOldIcon
      : features::IsRoundedIconsEnabled() ? kKeepIcon
                                          : kKeepOldIcon;

  menu_model_ = std::make_unique<ui::SimpleMenuModel>(this);
  menu_model_->AddItemWithStringIdAndIcon(
      command_id, string_id,
      ui::ImageModel::FromVectorIcon(icon, ui::kColorIcon, 16));
  menu_model_->SetElementIdentifierAt(0, element_id);

  if (source == end_button_) {
    menu_model_->AddSeparator(ui::NORMAL_SEPARATOR);
    menu_model_->AddCheckItem(kToggleHideShortcuts, u"Show tab strip shortcuts");
  }

  menu_model_adapter_ = std::make_unique<views::MenuModelAdapter>(
      menu_model_.get(), base::BindRepeating(&TabStripComboButton::OnMenuClosed,
                                             base::Unretained(this)));
  menu_model_adapter_->set_triggerable_event_flags(ui::EF_LEFT_MOUSE_BUTTON |
                                                   ui::EF_RIGHT_MOUSE_BUTTON);
  std::unique_ptr<views::MenuItemView> root = menu_model_adapter_->CreateMenu();
  menu_runner_ = std::make_unique<views::MenuRunner>(
      std::move(root),
      views::MenuRunner::HAS_MNEMONICS | views::MenuRunner::CONTEXT_MENU);

  BrowserView* browser_view = BrowserView::GetBrowserViewForBrowser(browser_);
  CHECK(browser_view);
  CHECK(browser_view->tab_strip_view());
  expand_on_hover_lock_ = browser_view->tab_strip_view()->GetExpandOnHoverLock(
      ExpandOnHoverLockType::kKeepCurrentState);

  menu_runner_->RunMenuAt(GetWidget(), nullptr,
                          source->GetAnchorBoundsInScreen(),
                          views::MenuAnchorPosition::kTopLeft, source_type);
}

void TabStripComboButton::ExecuteCommand(int command_id, int event_flags) {
  if (command_id == IDC_TAB_SEARCH_TOGGLE_PIN) {
    show_tab_search_ephemerally_ = false;
    hide_tab_search_timer_.Stop();
    chrome::ExecuteCommand(browser_, command_id);
    return;
  }

  if (command_id == kOpenShortcutTab) {
    OnShortcutClicked(context_menu_shortcut_index_);
    return;
  }
  if (command_id == kOpenShortcutWindow) {
    PrefService* prefs = browser_->GetProfile()->GetPrefs();
    std::string url_str = prefs->GetString(context_menu_shortcut_index_ == 1
                                               ? prefs::kTabStripShortcut1Url
                                               : prefs::kTabStripShortcut2Url);
    if (url_str.empty()) {
      url_str = (context_menu_shortcut_index_ == 1) ? "https://www.youtube.com"
                                                    : "https://mail.google.com";
    }
    NavigateParams params(
        BrowserView::GetBrowserViewForBrowser(browser_)->browser(),
        GURL(url_str), ui::PAGE_TRANSITION_AUTO_BOOKMARK);
    params.disposition = WindowOpenDisposition::NEW_WINDOW;
    Navigate(&params);
    return;
  }
  if (command_id == kEditShortcut) {
    ShowEditShortcutDialog(context_menu_shortcut_index_);
    return;
  }
  if (command_id == kResetShortcut) {
    PrefService* prefs = browser_->GetProfile()->GetPrefs();
    prefs->SetString(context_menu_shortcut_index_ == 1
                         ? prefs::kTabStripShortcut1Title
                         : prefs::kTabStripShortcut2Title,
                     context_menu_shortcut_index_ == 1 ? "YouTube" : "Gmail");
    prefs->SetString(context_menu_shortcut_index_ == 1
                         ? prefs::kTabStripShortcut1Url
                         : prefs::kTabStripShortcut2Url,
                     context_menu_shortcut_index_ == 1
                         ? "https://www.youtube.com"
                         : "https://mail.google.com");
    return;
  }
  if (command_id == kToggleHideShortcuts) {
    PrefService* prefs = browser_->GetProfile()->GetPrefs();
    bool current = prefs->GetBoolean(prefs::kTabStripShortcutsEnabled);
    prefs->SetBoolean(prefs::kTabStripShortcutsEnabled, !current);
    return;
  }

  if (command_id != IDC_EVERYTHING_MENU_TOGGLE_PIN) {
    return;
  }

  PrefService* prefs = browser_->GetProfile()->GetPrefs();
  const bool is_pinned =
      prefs->GetBoolean(prefs::kEverythingMenuPinnedToTabstrip);
  base::RecordAction(base::UserMetricsAction(
      is_pinned ? "TabStripComboButton.EverythingMenu.Unpinned"
                : "TabStripComboButton.EverythingMenu.Pinned"));

  prefs->SetBoolean(prefs::kEverythingMenuPinnedToTabstrip, !is_pinned);
}

bool TabStripComboButton::IsCommandIdChecked(int command_id) const {
  if (command_id == kToggleHideShortcuts) {
    return browser_->GetProfile()->GetPrefs()->GetBoolean(
        prefs::kTabStripShortcutsEnabled);
  }
  return false;
}

void TabStripComboButton::OnBubbleInitializing() {
  BrowserView* browser_view = BrowserView::GetBrowserViewForBrowser(browser_);
  CHECK(browser_view);
  CHECK(browser_view->tab_strip_view());
  expand_on_hover_lock_ = browser_view->tab_strip_view()->GetExpandOnHoverLock(
      ExpandOnHoverLockType::kKeepCurrentState);

  base::RecordAction(
      base::UserMetricsAction("TabStripComboButton.TabSearch.BubbleShown"));

  if (IsTabSearchPinned()) {
    return;
  }

  show_tab_search_ephemerally_ = true;
  UpdateButtonsVisibility();
}

void TabStripComboButton::OnBubbleDestroying() {
  expand_on_hover_lock_.reset();

  if (IsTabSearchPinned()) {
    return;
  }

  // Post a delayed task to give a chance for the user to use the context menu
  hide_tab_search_timer_.Start(
      FROM_HERE, kHideTabSearchButtonDelay,
      base::BindOnce(&TabStripComboButton::MaybeHideTabSearchButton,
                     base::Unretained(this)));
}

void TabStripComboButton::OnHostDestroying() {
  tab_search_bubble_host_observation_.Reset();
}

void TabStripComboButton::SetTabSearchBubbleHost(TabSearchBubbleHost* host) {
  tab_search_bubble_host_observation_.Reset();
  if (host) {
    tab_search_bubble_host_observation_.Observe(host);
    const bool use_vertical_strip_icon = context_ == Context::kVerticalTabStrip;
    GetEndButtonActionItem()->SetImage(ui::ImageModel::FromVectorIcon(
        use_vertical_strip_icon
            ? (features::IsRoundedIconsEnabled() ? kManageSearchIcon
                                                 : kTabSearchTabStripOldIcon)
            : (features::IsRoundedIconsEnabled()
                   ? vector_icons::kKeyboardArrowDownIcon
                   : vector_icons::kExpandMoreOldIcon)));
  }
}

void TabStripComboButton::MaybeHideTabSearchButton() {
  if (IsTabSearchPinned() || (menu_runner_ && menu_runner_->IsRunning())) {
    return;
  }

  show_tab_search_ephemerally_ = false;
  UpdateButtonsVisibility();
}

bool TabStripComboButton::IsTabSearchPinned() {
  PrefService* prefs = browser_->GetProfile()->GetPrefs();
  return prefs->GetBoolean(prefs::kTabSearchPinnedToTabstrip);
}

actions::ActionItem* TabStripComboButton::GetStartButtonActionItem() {
  return actions::ActionManager::Get().FindAction(
      kActionTabGroupsMenu, BrowserActions::From(browser_)->root_action_item());
}

actions::ActionItem* TabStripComboButton::GetEndButtonActionItem() {
  return actions::ActionManager::Get().FindAction(
      kActionTabSearch, BrowserActions::From(browser_)->root_action_item());
}

void TabStripComboButton::AnimationProgressed(const gfx::Animation* animation) {
  const double value = animation->GetCurrentValue();

  // Mapping overlapping stages where each lasts for 1/2 of the total duration.
  // 1. Expansion: Starts at 0.0, Ends at 0.5.
  // 2. Opacity: Starts at 0.25, Ends at 0.75.
  // 3. Radius: Starts at 0.5, Ends at 1.0.
  // These formulas work for both appearing (0.0 -> 1.0) and disappearing (1.0
  // -> 0.0).
  const float expansion_factor =
      std::clamp(static_cast<float>(value * 2.0), 0.0f, 1.0f);
  const float opacity_factor =
      std::clamp(static_cast<float>((value - 0.25) * 2.0), 0.0f, 1.0f);
  const float radius_factor =
      std::clamp(static_cast<float>((value - 0.5) * 2.0), 0.0f, 1.0f);

  auto update_buttons = [&](TabStripFlatEdgeButton* primary_button,
                            TabStripFlatEdgeButton* sibling_button) {
    if (!primary_button) {
      return;
    }
    primary_button->SetExpansionFactor(expansion_factor);
    primary_button->SetIconOpacity(opacity_factor);
    primary_button->SetFlatEdgeFactor(radius_factor);
    if (sibling_button) {
      sibling_button->SetFlatEdgeFactor(radius_factor);
    }
  };

  if (animation == &start_button_animation_) {
    update_buttons(start_button_, end_button_);
  } else if (animation == &end_button_animation_) {
    update_buttons(end_button_, start_button_);
  }
}

void TabStripComboButton::AnimationEnded(const gfx::Animation* animation) {
  AnimationProgressed(animation);
  if (animation->GetCurrentValue() == 0.0) {
    if (start_button_ && animation == &start_button_animation_) {
      if (auto* item = GetStartButtonActionItem()) {
        item->SetVisible(false);
      }
    } else if (animation == &end_button_animation_) {
      if (auto* item = GetEndButtonActionItem()) {
        item->SetVisible(false);
      }
    }
  }
}

gfx::Size TabStripComboButton::GetPreferredSizeForOrientation(
    views::LayoutOrientation orientation) {
  int width = 0;
  int height = 0;
  const int spacing =
      GetLayoutConstant(LayoutConstant::kVerticalTabStripFlatEdgeButtonPadding);
  bool has_visible_child = false;

  for (views::View* child : children()) {
    if (!child->GetVisible()) {
      continue;
    }

    gfx::Size child_size = child->GetPreferredSize();
    if (child_size.width() == 0) {
      continue;
    }

    if (orientation == views::LayoutOrientation::kHorizontal) {
      if (has_visible_child) {
        width += spacing;
      }
      width += child_size.width();
      height = std::max(height, child_size.height());
    } else {
      if (has_visible_child) {
        height += spacing;
      }
      height += child_size.height();
      width = std::max(width, child_size.width());
    }
    has_visible_child = true;
  }

  return gfx::Size(width, height);
}

void TabStripComboButton::OnMenuClosed() {
  expand_on_hover_lock_.reset();
  menu_runner_.reset();
  if (show_tab_search_ephemerally_) {
    hide_tab_search_timer_.Start(
        FROM_HERE, kHideTabSearchButtonDelay,
        base::BindOnce(&TabStripComboButton::MaybeHideTabSearchButton,
                       base::Unretained(this)));
  }
}

BEGIN_METADATA(TabStripComboButton)
END_METADATA
