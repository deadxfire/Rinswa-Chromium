; ==============================================================================
; Rinswa Browser (Chromium Edition)
; Standalone Offline Setup Installer for Windows x64
; Developed and made by Arindam Makar
; ==============================================================================

#define AppName "Rinswa Browser"
#ifndef AppVersion
  #define AppVersion "1.0.9"
#endif
#define AppPublisher "Arindam Makar"
#define AppURL "https://github.com/deadxfire/Rinswa-browser"
#define AppExeName "Rinswa.exe"
#define AppId "{{5A8D3E42-6F91-4B2E-8E71-912836EBAF91}"

#ifndef EngineVersion
  #define EngineVersion "158.0.8106.0"
#endif

#ifndef StageDir
  #define StageDir "..\dist\staging"
#endif

#ifndef ProjectRoot
  #define ProjectRoot ".."
#endif

[Setup]
AppId={#AppId}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} v{#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
AllowNoIcons=yes
LicenseFile={#ProjectRoot}\LICENSE
OutputDir={#ProjectRoot}\dist\installer
OutputBaseFilename=Rinswa-Browser-Setup-x64-v{#AppVersion}
SetupIconFile={#ProjectRoot}\branding\icons\default.ico
WizardImageFile={#ProjectRoot}\branding\wizWatermark.bmp
WizardSmallImageFile={#ProjectRoot}\branding\wizHeader.bmp
Compression=lzma2/ultra64
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
UninstallDisplayIcon={app}\{#AppExeName},0
UninstallDisplayName={#AppName} (Chromium Edition)
CloseApplications=no
RestartApplications=yes
DisableWelcomePage=no
DisableProgramGroupPage=yes
ShowLanguageDialog=no
MinVersion=10.0

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "startmenuicon"; Description: "Create a Start Menu shortcut"; GroupDescription: "{cm:AdditionalIcons}"
Name: "registerbrowser"; Description: "Register Rinswa Browser in Windows Default Apps"; GroupDescription: "System Integration:"; Flags: checkedonce

[Files]
; Root Browser Files
Source: "{#StageDir}\{#AppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StageDir}\chrome_proxy.exe"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "{#StageDir}\yt-dlp.exe"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "{#StageDir}\ffmpeg.exe"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "{#StageDir}\initial_preferences"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "{#StageDir}\Rinswa.VisualElementsManifest.xml"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "{#StageDir}\document.ico"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "{#StageDir}\LICENSE"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "{#StageDir}\*.dll"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "{#StageDir}\resources\*"; DestDir: "{app}\resources"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
Source: "{#StageDir}\rinswa-adshield\*"; DestDir: "{app}\rinswa-adshield"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist

; Versioned Engine Directory
Source: "{#StageDir}\{#EngineVersion}\*"; DestDir: "{app}\{#EngineVersion}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#AppName}"; Filename: "{app}\{#AppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\{#AppExeName}"; Tasks: startmenuicon
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\{#AppExeName}"; Tasks: desktopicon

[Registry]
; App Paths for Win+R -> rinswa
Root: HKA; Subkey: "Software\Microsoft\Windows\CurrentVersion\App Paths\{#AppExeName}"; ValueType: string; ValueName: ""; ValueData: "{app}\{#AppExeName}"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Microsoft\Windows\CurrentVersion\App Paths\{#AppExeName}"; ValueType: string; ValueName: "Path"; ValueData: "{app}"; Flags: uninsdeletekey; Tasks: registerbrowser

; StartMenuInternet Registration
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}"; ValueType: string; ValueName: ""; ValueData: "{#AppName}"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#AppExeName},0"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#AppExeName}"""; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\InstallInfo"; ValueType: string; ValueName: "ReinstallCommand"; ValueData: """{app}\{#AppExeName}"" --make-default-browser"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\InstallInfo"; ValueType: dword; ValueName: "IconsVisible"; ValueData: 1; Flags: uninsdeletekey; Tasks: registerbrowser

; Capabilities Registration for Windows 10/11 Default Apps
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities"; ValueType: string; ValueName: "ApplicationDescription"; ValueData: "A fast, private, and stunning modern web browser built on the real Chromium C++ engine with Cyber-Glass UI and built-in ad blocking."; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities"; ValueType: string; ValueName: "ApplicationIcon"; ValueData: "{app}\{#AppExeName},0"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities"; ValueType: string; ValueName: "ApplicationName"; ValueData: "{#AppName}"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".htm"; ValueData: "RinswaHTML"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".html"; ValueData: "RinswaHTML"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".shtml"; ValueData: "RinswaHTML"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".xht"; ValueData: "RinswaHTML"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".xhtml"; ValueData: "RinswaHTML"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".svg"; ValueData: "RinswaHTML"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".webp"; ValueData: "RinswaHTML"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".pdf"; ValueData: "RinswaPDF"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "http"; ValueData: "RinswaHTML"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "https"; ValueData: "RinswaHTML"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "ftp"; ValueData: "RinswaHTML"; Flags: uninsdeletekey; Tasks: registerbrowser

; Windows RegisteredApplications
Root: HKA; Subkey: "Software\RegisteredApplications"; ValueType: string; ValueName: "Rinswa"; ValueData: "Software\Clients\StartMenuInternet\{#AppExeName}\Capabilities"; Flags: uninsdeletevalue; Tasks: registerbrowser

; Classes: RinswaHTML and RinswaPDF
Root: HKA; Subkey: "Software\Classes\RinswaHTML"; ValueType: string; ValueName: ""; ValueData: "Rinswa HTML Document"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Classes\RinswaHTML\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\document.ico,0"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Classes\RinswaHTML\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#AppExeName}"" -- ""%1"""; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Classes\RinswaPDF"; ValueType: string; ValueName: ""; ValueData: "Rinswa PDF Document"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Classes\RinswaPDF\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\document.ico,0"; Flags: uninsdeletekey; Tasks: registerbrowser
Root: HKA; Subkey: "Software\Classes\RinswaPDF\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#AppExeName}"" -- ""%1"""; Flags: uninsdeletekey; Tasks: registerbrowser

[Run]
Filename: "{app}\{#AppExeName}"; Description: "{cm:LaunchProgram,{#AppName}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\{#EngineVersion}"
Type: filesandordirs; Name: "{app}"

[Code]
procedure SHChangeNotify(wEventId: LongInt; uFlags: Cardinal; dwItem1, dwItem2: Cardinal);
external 'SHChangeNotify@shell32.dll stdcall';

const
  SHCNE_ASSOCCHANGED = $08000000;
  SHCNF_IDLIST = $0000;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    try
      SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, 0, 0);
    except
    end;
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
  begin
    try
      SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, 0, 0);
    except
    end;
  end;
end;
