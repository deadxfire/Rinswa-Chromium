// Copyright 2026 Rinswa Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/webui/help/version_updater_basic.h"

#include <windows.h>
#include <winhttp.h>

#include <memory>
#include <string>
#include <vector>

#include "base/command_line.h"
#include "base/containers/span.h"
#include "base/files/file.h"
#include "base/files/file_path.h"
#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/json/json_reader.h"
#include "base/memory/weak_ptr.h"
#include "base/path_service.h"
#include "base/process/launch.h"
#include "base/process/process.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/thread_pool.h"
#include "base/time/time.h"
#include "base/values.h"
#include "chrome/browser/ui/webui/help/version_updater.h"
#include "chrome/browser/upgrade_detector/upgrade_detector.h"
#include "content/public/browser/browser_task_traits.h"
#include "content/public/browser/browser_thread.h"

namespace {

// Dynamically resolved WinHTTP API table to eliminate static linking dependencies.
struct WinHttpApi {
  HMODULE hMod = nullptr;
  decltype(&WinHttpOpen) Open = nullptr;
  decltype(&WinHttpConnect) Connect = nullptr;
  decltype(&WinHttpOpenRequest) OpenRequest = nullptr;
  decltype(&WinHttpSendRequest) SendRequest = nullptr;
  decltype(&WinHttpReceiveResponse) ReceiveResponse = nullptr;
  decltype(&WinHttpQueryHeaders) QueryHeaders = nullptr;
  decltype(&WinHttpQueryDataAvailable) QueryDataAvailable = nullptr;
  decltype(&WinHttpReadData) ReadData = nullptr;
  decltype(&WinHttpCloseHandle) CloseHandle = nullptr;
  decltype(&WinHttpSetOption) SetOption = nullptr;
  decltype(&WinHttpCrackUrl) CrackUrl = nullptr;

  bool Init() {
    hMod = LoadLibraryW(L"winhttp.dll");
    if (!hMod) return false;
    Open = reinterpret_cast<decltype(Open)>(GetProcAddress(hMod, "WinHttpOpen"));
    Connect = reinterpret_cast<decltype(Connect)>(GetProcAddress(hMod, "WinHttpConnect"));
    OpenRequest = reinterpret_cast<decltype(OpenRequest)>(GetProcAddress(hMod, "WinHttpOpenRequest"));
    SendRequest = reinterpret_cast<decltype(SendRequest)>(GetProcAddress(hMod, "WinHttpSendRequest"));
    ReceiveResponse = reinterpret_cast<decltype(ReceiveResponse)>(GetProcAddress(hMod, "WinHttpReceiveResponse"));
    QueryHeaders = reinterpret_cast<decltype(QueryHeaders)>(GetProcAddress(hMod, "WinHttpQueryHeaders"));
    QueryDataAvailable = reinterpret_cast<decltype(QueryDataAvailable)>(GetProcAddress(hMod, "WinHttpQueryDataAvailable"));
    ReadData = reinterpret_cast<decltype(ReadData)>(GetProcAddress(hMod, "WinHttpReadData"));
    CloseHandle = reinterpret_cast<decltype(CloseHandle)>(GetProcAddress(hMod, "WinHttpCloseHandle"));
    SetOption = reinterpret_cast<decltype(SetOption)>(GetProcAddress(hMod, "WinHttpSetOption"));
    CrackUrl = reinterpret_cast<decltype(CrackUrl)>(GetProcAddress(hMod, "WinHttpCrackUrl"));

    return Open && Connect && OpenRequest && SendRequest && ReceiveResponse &&
           QueryHeaders && QueryDataAvailable && ReadData && CloseHandle && SetOption && CrackUrl;
  }

  ~WinHttpApi() {
    if (hMod) {
      FreeLibrary(hMod);
    }
  }
};

bool FetchUrl(const WinHttpApi& api, const std::string& url_str, std::string* out_response, int* out_status_code) {
  URL_COMPONENTS urlComp;
  ZeroMemory(&urlComp, sizeof(urlComp));
  urlComp.dwStructSize = sizeof(urlComp);
  wchar_t hostName[256] = {0};
  wchar_t urlPath[2048] = {0};
  urlComp.lpszHostName = hostName;
  urlComp.dwHostNameLength = 256;
  urlComp.lpszUrlPath = urlPath;
  urlComp.dwUrlPathLength = 2048;

  std::wstring wUrl = base::UTF8ToWide(url_str);
  if (!api.CrackUrl(wUrl.c_str(), static_cast<DWORD>(wUrl.length()), 0, &urlComp)) {
    return false;
  }

  HINTERNET hSession = api.Open(L"RinswaBrowser-AutoUpdater/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
                                WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
  if (!hSession) return false;

  DWORD redirect_policy = WINHTTP_OPTION_REDIRECT_POLICY_ALWAYS;
  api.SetOption(hSession, WINHTTP_OPTION_REDIRECT_POLICY, &redirect_policy, sizeof(redirect_policy));

  HINTERNET hConnect = api.Connect(hSession, hostName, urlComp.nPort, 0);
  if (!hConnect) {
    api.CloseHandle(hSession);
    return false;
  }

  DWORD flags = (urlComp.nScheme == INTERNET_SCHEME_HTTPS) ? WINHTTP_FLAG_SECURE : 0;
  HINTERNET hRequest = api.OpenRequest(hConnect, L"GET", urlPath, NULL, WINHTTP_NO_REFERER,
                                       WINHTTP_DEFAULT_ACCEPT_TYPES, flags);
  if (!hRequest) {
    api.CloseHandle(hConnect);
    api.CloseHandle(hSession);
    return false;
  }

  api.SetOption(hRequest, WINHTTP_OPTION_REDIRECT_POLICY, &redirect_policy, sizeof(redirect_policy));

  std::wstring headers = L"User-Agent: RinswaBrowser-AutoUpdater\r\nAccept: application/vnd.github.v3+json\r\n";
  BOOL sent = api.SendRequest(hRequest, headers.c_str(), static_cast<DWORD>(headers.length()),
                              NULL, 0, 0, 0);
  if (!sent || !api.ReceiveResponse(hRequest, NULL)) {
    api.CloseHandle(hRequest);
    api.CloseHandle(hConnect);
    api.CloseHandle(hSession);
    return false;
  }

  DWORD statusCode = 0;
  DWORD statusCodeSize = sizeof(statusCode);
  if (api.QueryHeaders(hRequest, WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
                       WINHTTP_HEADER_NAME_BY_INDEX, &statusCode, &statusCodeSize, WINHTTP_NO_HEADER_INDEX)) {
    if (out_status_code) *out_status_code = static_cast<int>(statusCode);
  }

  std::string response;
  DWORD bytesAvailable = 0;
  while (api.QueryDataAvailable(hRequest, &bytesAvailable) && bytesAvailable > 0) {
    std::vector<char> buffer(bytesAvailable);
    DWORD bytesRead = 0;
    if (api.ReadData(hRequest, buffer.data(), bytesAvailable, &bytesRead) && bytesRead > 0) {
      response.append(buffer.data(), bytesRead);
    } else {
      break;
    }
  }

  if (out_response) *out_response = std::move(response);

  api.CloseHandle(hRequest);
  api.CloseHandle(hConnect);
  api.CloseHandle(hSession);
  return true;
}

bool DownloadFile(const WinHttpApi& api,
                  const std::string& url_str,
                  const base::FilePath& dest_path,
                  base::RepeatingCallback<void(int progress)> progress_cb) {
  URL_COMPONENTS urlComp;
  ZeroMemory(&urlComp, sizeof(urlComp));
  urlComp.dwStructSize = sizeof(urlComp);
  wchar_t hostName[512] = {0};
  wchar_t urlPath[4096] = {0};
  urlComp.lpszHostName = hostName;
  urlComp.dwHostNameLength = 512;
  urlComp.lpszUrlPath = urlPath;
  urlComp.dwUrlPathLength = 4096;

  std::wstring wUrl = base::UTF8ToWide(url_str);
  if (!api.CrackUrl(wUrl.c_str(), static_cast<DWORD>(wUrl.length()), 0, &urlComp)) {
    return false;
  }

  HINTERNET hSession = api.Open(L"RinswaBrowser-AutoUpdater/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
                                WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
  if (!hSession) return false;

  DWORD redirect_policy = WINHTTP_OPTION_REDIRECT_POLICY_ALWAYS;
  api.SetOption(hSession, WINHTTP_OPTION_REDIRECT_POLICY, &redirect_policy, sizeof(redirect_policy));

  HINTERNET hConnect = api.Connect(hSession, hostName, urlComp.nPort, 0);
  if (!hConnect) {
    api.CloseHandle(hSession);
    return false;
  }

  DWORD flags = (urlComp.nScheme == INTERNET_SCHEME_HTTPS) ? WINHTTP_FLAG_SECURE : 0;
  HINTERNET hRequest = api.OpenRequest(hConnect, L"GET", urlPath, NULL, WINHTTP_NO_REFERER,
                                       WINHTTP_DEFAULT_ACCEPT_TYPES, flags);
  if (!hRequest) {
    api.CloseHandle(hConnect);
    api.CloseHandle(hSession);
    return false;
  }

  api.SetOption(hRequest, WINHTTP_OPTION_REDIRECT_POLICY, &redirect_policy, sizeof(redirect_policy));

  std::wstring headers = L"User-Agent: RinswaBrowser-AutoUpdater\r\n";
  if (!api.SendRequest(hRequest, headers.c_str(), static_cast<DWORD>(headers.length()),
                       NULL, 0, 0, 0) ||
      !api.ReceiveResponse(hRequest, NULL)) {
    api.CloseHandle(hRequest);
    api.CloseHandle(hConnect);
    api.CloseHandle(hSession);
    return false;
  }

  DWORD statusCode = 0;
  DWORD statusCodeSize = sizeof(statusCode);
  if (api.QueryHeaders(hRequest, WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
                       WINHTTP_HEADER_NAME_BY_INDEX, &statusCode, &statusCodeSize, WINHTTP_NO_HEADER_INDEX)) {
    if (statusCode < 200 || statusCode >= 400) {
      api.CloseHandle(hRequest);
      api.CloseHandle(hConnect);
      api.CloseHandle(hSession);
      return false;
    }
  }

  DWORD contentLength = 0;
  DWORD contentLengthSize = sizeof(contentLength);
  api.QueryHeaders(hRequest, WINHTTP_QUERY_CONTENT_LENGTH | WINHTTP_QUERY_FLAG_NUMBER,
                   WINHTTP_HEADER_NAME_BY_INDEX, &contentLength, &contentLengthSize, WINHTTP_NO_HEADER_INDEX);

  base::File dest_file(dest_path, base::File::FLAG_CREATE_ALWAYS | base::File::FLAG_WRITE);
  if (!dest_file.IsValid()) {
    api.CloseHandle(hRequest);
    api.CloseHandle(hConnect);
    api.CloseHandle(hSession);
    return false;
  }

  DWORD totalBytesRead = 0;
  DWORD bytesAvailable = 0;
  int lastReportedProgress = -1;

  while (api.QueryDataAvailable(hRequest, &bytesAvailable) && bytesAvailable > 0) {
    std::vector<char> buffer(bytesAvailable);
    DWORD bytesRead = 0;
    if (api.ReadData(hRequest, buffer.data(), bytesAvailable, &bytesRead) && bytesRead > 0) {
      dest_file.WriteAtCurrentPos(base::as_bytes(base::span(buffer).first(bytesRead)));
      totalBytesRead += bytesRead;

      if (contentLength > 0 && progress_cb) {
        int progress = static_cast<int>((static_cast<uint64_t>(totalBytesRead) * 100) / contentLength);
        if (progress != lastReportedProgress) {
          lastReportedProgress = progress;
          progress_cb.Run(progress);
        }
      }
    } else {
      break;
    }
  }

  dest_file.Close();
  api.CloseHandle(hRequest);
  api.CloseHandle(hConnect);
  api.CloseHandle(hSession);
  return totalBytesRead > 0;
}

bool LaunchSilentInstaller(const base::FilePath& installer_path) {
  base::CommandLine cmd(installer_path);
  cmd.AppendArg("/VERYSILENT");
  cmd.AppendArg("/SUPPRESSMSGBOXES");
  cmd.AppendArg("/NORESTART");
  cmd.AppendArg("/SP-");

  base::LaunchOptions options;
  options.start_hidden = true;
  base::Process process = base::LaunchProcess(cmd, options);
  if (!process.IsValid()) {
    return false;
  }

  int exit_code = 0;
  if (process.WaitForExitWithTimeout(base::Minutes(5), &exit_code)) {
    return (exit_code == 0);
  }
  return false;
}

bool IsRemoteVersionNewer(const std::string& current_ver, const std::string& remote_tag) {
  std::string clean_remote = remote_tag;
  if (!clean_remote.empty() && (clean_remote[0] == 'v' || clean_remote[0] == 'V')) {
    clean_remote = clean_remote.substr(1);
  }

  auto parse_parts = [](const std::string& v) {
    std::vector<int> parts;
    std::string cur;
    for (char c : v) {
      if (c == '.') {
        if (!cur.empty()) {
          int n = 0;
          base::StringToInt(cur, &n);
          parts.push_back(n);
          cur.clear();
        }
      } else if (c >= '0' && c <= '9') {
        cur += c;
      } else {
        break;
      }
    }
    if (!cur.empty()) {
      int n = 0;
      base::StringToInt(cur, &n);
      parts.push_back(n);
    }
    while (parts.size() < 4) parts.push_back(0);
    return parts;
  };

  std::vector<int> cur = parse_parts(current_ver);
  std::vector<int> rem = parse_parts(clean_remote);

  for (size_t i = 0; i < 4; ++i) {
    if (rem[i] > cur[i]) return true;
    if (rem[i] < cur[i]) return false;
  }
  return false;
}

struct UpdateCheckResultInfo {
  bool new_version_available = false;
  std::string new_version;
  std::string download_url;
  bool update_installed = false;
};

UpdateCheckResultInfo PerformUpdateWorkflow(
    base::RepeatingCallback<void(int progress)> progress_cb) {
  UpdateCheckResultInfo result;

  WinHttpApi api;
  if (!api.Init()) {
    return result;
  }

  std::string releases_url =
      "https://api.github.com/repos/deadxfire/Rinswa-Chromium/releases/latest";
  std::string response;
  int status_code = 0;

  if (!FetchUrl(api, releases_url, &response, &status_code)) {
    return result;
  }

  if (status_code != 200 || response.empty()) {
    return result;
  }

  std::optional<base::DictValue> dict_val =
      base::JSONReader::ReadDict(response, base::JSON_PARSE_RFC);
  if (!dict_val) {
    return result;
  }

  const base::DictValue& dict = *dict_val;
  const std::string* tag_name = dict.FindString("tag_name");
  if (!tag_name || tag_name->empty()) {
    return result;
  }

#ifndef RINSWA_VERSION
#define RINSWA_VERSION "1.0.9"
#endif
  std::string current_ver = RINSWA_VERSION;
  if (!IsRemoteVersionNewer(current_ver, *tag_name)) {
    return result;
  }

  const base::ListValue* assets = dict.FindList("assets");
  if (!assets || assets->empty()) {
    return result;
  }

  std::string asset_url;
  for (const auto& asset : *assets) {
    const base::DictValue* asset_dict = asset.GetIfDict();
    if (!asset_dict) continue;
    const std::string* name = asset_dict->FindString("name");
    const std::string* dl_url = asset_dict->FindString("browser_download_url");
    if (name && dl_url) {
      if (base::EndsWith(*name, ".exe", base::CompareCase::INSENSITIVE_ASCII)) {
        asset_url = *dl_url;
        break;
      }
    }
  }

  if (asset_url.empty()) {
    return result;
  }

  result.new_version_available = true;
  result.new_version = *tag_name;
  result.download_url = asset_url;

  base::FilePath temp_dir;
  if (!base::PathService::Get(base::DIR_TEMP, &temp_dir)) {
    return result;
  }

  base::FilePath installer_path = temp_dir.Append(L"Rinswa-Browser-Update-Setup.exe");
  if (!DownloadFile(api, asset_url, installer_path, progress_cb)) {
    return result;
  }

  // Update installer is downloaded and ready for the user. Do not execute LaunchSilentInstaller
  // while the browser session is active, as Inno Setup force-closes running processes.
  result.update_installed = true;

  return result;
}

// Full Rinswa GitHub Releases Version Updater
class VersionUpdaterBasic : public VersionUpdater {
 public:
  VersionUpdaterBasic() : weak_factory_(this) {}
  VersionUpdaterBasic(const VersionUpdaterBasic&) = delete;
  VersionUpdaterBasic& operator=(const VersionUpdaterBasic&) = delete;
  ~VersionUpdaterBasic() override = default;

  void CheckForUpdate(StatusCallback callback, PromoteCallback) override {
    callback_ = std::move(callback);

    // 1. Report CHECKING state to UI (displays spinning indicator)
    callback_.Run(CHECKING, 0, false, false, std::string(), 0, std::u16string());

    // 2. Offload network check & download to ThreadPool so UI never hangs
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE,
        {base::MayBlock(), base::TaskPriority::USER_VISIBLE},
        base::BindOnce(&PerformUpdateWorkflow,
                       base::BindRepeating(&VersionUpdaterBasic::OnProgress,
                                           weak_factory_.GetWeakPtr())),
        base::BindOnce(&VersionUpdaterBasic::OnUpdateFinished,
                       weak_factory_.GetWeakPtr()));
  }

 private:
  void OnProgress(int progress) {
    if (!content::BrowserThread::CurrentlyOn(content::BrowserThread::UI)) {
      content::GetUIThreadTaskRunner({})->PostTask(
          FROM_HERE,
          base::BindOnce(&VersionUpdaterBasic::OnProgress,
                         weak_factory_.GetWeakPtr(), progress));
      return;
    }
    if (callback_) {
      callback_.Run(UPDATING, progress, false, false, std::string(), 0, std::u16string());
    }
  }

  void OnUpdateFinished(UpdateCheckResultInfo result) {
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    if (!callback_) return;

    if (result.update_installed) {
      // Successfully updated! Prompt user to Relaunch
      callback_.Run(NEARLY_UPDATED, 0, false, false, std::string(), 0, std::u16string());
    } else {
      // Already up to date, or offline/no release yet:
      // Gracefully report "Rinswa is up to date" without any errors
      callback_.Run(UPDATED, 0, false, false, std::string(), 0, std::u16string());
    }
  }

  StatusCallback callback_;
  base::WeakPtrFactory<VersionUpdaterBasic> weak_factory_;
};

void RinswaBackgroundUpdateTask() {
  // Silent background auto-updates that kill running processes are intentionally disabled.
}

}  // namespace

void RinswaTriggerBackgroundUpdateCheck() {
  // No-op to preserve active user browsing sessions.
}

std::unique_ptr<VersionUpdater> VersionUpdater::Create(
    content::WebContents* web_contents) {
  return std::make_unique<VersionUpdaterBasic>();
}
