Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Get-Process -Name chrome,Rinswa -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

$proc = Start-Process "c:\cr\chromium\src\out\RinswaRelease\chrome.exe" -ArgumentList "--user-data-dir=C:\cr\temp_test_ui --no-first-run --no-default-browser-check --window-position=50,50 --window-size=1200,800 https://www.google.com" -PassThru
Start-Sleep -Seconds 6

$mainProc = Get-Process -Name chrome,Rinswa -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if ($mainProc) {
    $hwnd = $mainProc.MainWindowHandle
    Write-Host "Found HWND: $hwnd"

    # Capture 1200x800 from (50, 50)
    $bmp = New-Object System.Drawing.Bitmap 1200, 800
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.CopyFromScreen(50, 50, 0, 0, (New-Object System.Drawing.Size 1200, 800))
    $outPath = "C:\cr\screenshot_browser_window.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $gfx.Dispose()
    $bmp.Dispose()
    Write-Host "Successfully saved CopyFromScreen to $outPath"
} else {
    Write-Host "No main process found"
}

Get-Process -Name chrome,Rinswa -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
