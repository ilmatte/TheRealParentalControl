!include "MUI2.nsh"
!include "x64.nsh"

RequestExecutionLevel admin

; Custom installer macros for Windows service installation
!macro customInstall
  ; Install Windows service
  ; Determine installation type based on installation directory
  ${If} $INSTDIR == "$PROGRAMFILES\Parental Control Child"
    ; System-wide installation (all users)
    DetailPrint "Installing Windows service (system-wide)..."
    nsExec::ExecToLog '"powershell.exe" -ExecutionPolicy Bypass -Command "cd \"$INSTDIR\" && node service-install.js install --system"'
    Pop $0
  ${Else}
    ; Per-user installation
    DetailPrint "Installing Windows service (current user)..."
    nsExec::ExecToLog '"powershell.exe" -ExecutionPolicy Bypass -Command "cd \"$INSTDIR\" && node service-install.js install"'
    Pop $0
  ${EndIf}
  
  ${If} $0 == 0
    DetailPrint "Service installation completed successfully"
  ${Else}
    DetailPrint "Service installation completed (check logs if service did not start)"
  ${EndIf}
!macroend

!macro customUnInstall
  ; Uninstall Windows service
  DetailPrint "Uninstalling Windows service..."
  nsExec::ExecToLog '"powershell.exe" -ExecutionPolicy Bypass -Command "cd \"$INSTDIR\" && node service-install.js uninstall"'
  Pop $0
  
  ${If} $0 == 0
    DetailPrint "Service uninstallation completed successfully"
  ${Else}
    DetailPrint "Service uninstallation completed"
  ${EndIf}
!macroend
