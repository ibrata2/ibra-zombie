; IBRA ZOMBIE - Windows installer (NSIS). Build: npm run dist
Unicode true
!include "MUI2.nsh"
!define APP "IBRA ZOMBIE"
!ifndef VER
  !define VER "1.0.0"
!endif
!define UNKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\IBRA ZOMBIE"
Name "${APP}"
OutFile "..\dist\IBRA-ZOMBIE-Setup-${VER}.exe"
InstallDir "$LOCALAPPDATA\Programs\IBRA ZOMBIE"
InstallDirRegKey HKCU "Software\IBRA ZOMBIE" "InstallDir"
RequestExecutionLevel user
SetCompressor /SOLID lzma
SetCompressorDictSize 64
BrandingText "IBRAPROGRAM - Ibrahim Al-Khazraji"
!define MUI_ICON "..\build\icon.ico"
!define MUI_UNICON "..\build\icon.ico"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\IBRA ZOMBIE.exe"
!define MUI_LANGDLL_ALLLANGUAGES
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Arabic"
!insertmacro MUI_LANGUAGE "English"
VIProductVersion "${VER}.0"
VIAddVersionKey /LANG=1033 "ProductName" "${APP}"
VIAddVersionKey /LANG=1033 "FileDescription" "${APP} Setup"
VIAddVersionKey /LANG=1033 "CompanyName" "IBRAPROGRAM"
VIAddVersionKey /LANG=1033 "LegalCopyright" "(c) 2026 Ibrahim Al-Khazraji"
VIAddVersionKey /LANG=1033 "FileVersion" "${VER}"
VIAddVersionKey /LANG=1033 "ProductVersion" "${VER}"

Function .onInit
  !insertmacro MUI_LANGDLL_DISPLAY
FunctionEnd

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "..\dist\win-unpacked\*.*"
  WriteUninstaller "$INSTDIR\Uninstall IBRA ZOMBIE.exe"
  CreateShortcut "$DESKTOP\IBRA ZOMBIE.lnk" "$INSTDIR\IBRA ZOMBIE.exe"
  CreateDirectory "$SMPROGRAMS\IBRA ZOMBIE"
  CreateShortcut "$SMPROGRAMS\IBRA ZOMBIE\IBRA ZOMBIE.lnk" "$INSTDIR\IBRA ZOMBIE.exe"
  CreateShortcut "$SMPROGRAMS\IBRA ZOMBIE\Uninstall IBRA ZOMBIE.lnk" "$INSTDIR\Uninstall IBRA ZOMBIE.exe"
  WriteRegStr HKCU "Software\IBRA ZOMBIE" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "${UNKEY}" "DisplayName" "${APP}"
  WriteRegStr HKCU "${UNKEY}" "DisplayVersion" "${VER}"
  WriteRegStr HKCU "${UNKEY}" "Publisher" "IBRAPROGRAM - Ibrahim Al-Khazraji"
  WriteRegStr HKCU "${UNKEY}" "DisplayIcon" "$INSTDIR\IBRA ZOMBIE.exe"
  WriteRegStr HKCU "${UNKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNKEY}" "UninstallString" '"$INSTDIR\Uninstall IBRA ZOMBIE.exe"'
  WriteRegDWORD HKCU "${UNKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNKEY}" "NoRepair" 1
  WriteRegDWORD HKCU "${UNKEY}" "EstimatedSize" 276000
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\IBRA ZOMBIE.lnk"
  RMDir /r "$SMPROGRAMS\IBRA ZOMBIE"
  RMDir /r "$INSTDIR\locales"
  RMDir /r "$INSTDIR\resources"
  Delete "$INSTDIR\*.*"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "${UNKEY}"
  DeleteRegKey HKCU "Software\IBRA ZOMBIE"
SectionEnd
