# Close Rinswa and copy the fresh binaries
Write-Host "Closing running Rinswa processes..." -ForegroundColor Cyan
taskkill /F /IM Rinswa.exe /T 2>$null
Get-Process -Name "*rinswa*" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

$srcOut = "C:\cr\chromium\src\out\RinswaRelease"
$installDir = "C:\Users\arind\AppData\Local\Programs\Rinswa Browser"
$verDir = "C:\Users\arind\AppData\Local\Programs\Rinswa Browser\158.0.8106.0"

Write-Host "Copying fresh chrome.dll and Rinswa.exe..." -ForegroundColor Cyan
Copy-Item "$srcOut\chrome.dll" "$verDir\chrome.dll" -Force
if (Test-Path "$installDir\chrome.dll") {
    Copy-Item "$srcOut\chrome.dll" "$installDir\chrome.dll" -Force
}
Copy-Item "$srcOut\Rinswa.exe" "$installDir\Rinswa.exe" -Force
if (Test-Path "$srcOut\resources.pak") {
    Copy-Item "$srcOut\resources.pak" "$verDir\resources.pak" -Force
}
if (Test-Path "$srcOut\locales") {
    Copy-Item "$srcOut\locales\*" "$verDir\locales\" -Force
}

# Ensure yt-dlp.exe and ffmpeg.exe are in both installDir and verDir
if (Test-Path "$srcOut\yt-dlp.exe") {
    Copy-Item "$srcOut\yt-dlp.exe" "$installDir\yt-dlp.exe" -Force
    Copy-Item "$srcOut\yt-dlp.exe" "$verDir\yt-dlp.exe" -Force
}
if (Test-Path "$srcOut\ffmpeg.exe") {
    Copy-Item "$srcOut\ffmpeg.exe" "$installDir\ffmpeg.exe" -Force
    Copy-Item "$srcOut\ffmpeg.exe" "$verDir\ffmpeg.exe" -Force
}

Write-Host "Syncing updated extensions..." -ForegroundColor Cyan
$adshieldSrc = "c:\Users\arind\OneDrive\Documents\Project\BrowserCromium\config\adblock\rinswa-adshield\*"
$extTargets = @(
    "$installDir\rinswa-adshield\",
    "$installDir\resources\rinswa-adshield\",
    "$srcOut\resources\rinswa-adshield\",
    "$srcOut\rinswa-adshield\",
    "$verDir\resources\rinswa-adshield\",
    "C:\cr\config\adblock\rinswa-adshield\"
)
foreach ($target in $extTargets) {
    if (-not (Test-Path $target)) {
        New-Item -ItemType Directory -Path $target -Force | Out-Null
    }
    Copy-Item $adshieldSrc $target -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Successfully updated installed Rinswa Browser!" -ForegroundColor Green
Write-Host "Launching Rinswa Browser..." -ForegroundColor Cyan
Start-Process "$installDir\Rinswa.exe"

