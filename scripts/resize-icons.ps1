<#
.SYNOPSIS
    Life Tracker App Icon Resizer & Asset Generator
.DESCRIPTION
    Generates high-quality resized icons (PNG, ICO) for web, PWA, mobile (Capacitor/Android/iOS), 
    and UI components from a source image using .NET System.Drawing with HighQualityBicubic interpolation.
.EXAMPLE
    # Batch generate all standard app & web sizes
    powershell -ExecutionPolicy Bypass -File ./scripts/resize-icons.ps1

    # Custom single resize whenever needed
    powershell -ExecutionPolicy Bypass -File ./scripts/resize-icons.ps1 -Width 300 -Height 300 -OutFile ./public/custom-300.png
#>

param(
    [string]$InputPath = "",
    [string]$OutputDir = "",
    [int]$Width = 0,
    [int]$Height = 0,
    [string]$OutFile = ""
)

Add-Type -AssemblyName System.Drawing

$workspaceRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName

# Determine input source
if (-not $InputPath) {
    $assetSource = Join-Path $workspaceRoot "src\assets\life-wheel.png"
    $brainLatest = Get-ChildItem -Path "C:\Users\Sukumar Thangaraj\.gemini\antigravity-ide\brain\*\.user_uploaded\*.jpg" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if (Test-Path $assetSource) {
        $InputPath = $assetSource
    } elseif ($brainLatest -and (Test-Path $brainLatest.FullName)) {
        $InputPath = $brainLatest.FullName
    } else {
        Write-Error "Source image not found! Please specify -InputPath"
        exit 1
    }
}

if (-not (Test-Path $InputPath)) {
    Write-Error "Input file does not exist: $InputPath"
    exit 1
}

$publicDir = Join-Path $workspaceRoot "public"
$assetsDir = Join-Path $workspaceRoot "src\assets"

if (-not (Test-Path $publicDir)) { New-Item -ItemType Directory -Force -Path $publicDir | Out-Null }
if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null }

function Resize-ImageFile {
    param(
        [string]$Src,
        [string]$Dest,
        [int]$W,
        [int]$H
    )
    $srcImg = [System.Drawing.Image]::FromFile($Src)
    $destBmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    $g.DrawImage($srcImg, 0, 0, $W, $H)
    
    $parentDir = Split-Path -Parent $Dest
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
    }

    $destBmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $destBmp.Dispose()
    $srcImg.Dispose()
    
    Write-Host "  -> Generated: $Dest ($W x $H)" -ForegroundColor Green
}

# Single custom resize mode
if ($Width -gt 0 -and $Height -gt 0) {
    if (-not $OutFile) {
        $OutFile = Join-Path $publicDir "icon-${Width}x${Height}.png"
    }
    Write-Host "Resizing image to custom dimensions ${Width}x${Height}..." -ForegroundColor Cyan
    Resize-ImageFile -Src $InputPath -Dest $OutFile -W $Width -H $Height
    Write-Host "Done!" -ForegroundColor Green
    exit 0
}

Write-Host "=== Life Tracker: Generating App Icons & Resized Assets ===" -ForegroundColor Cyan
Write-Host "Source: $InputPath" -ForegroundColor Gray

# Copy master original high-res asset
$masterAsset = Join-Path $assetsDir "life-wheel.png"
Copy-Item -Path $InputPath -Destination $masterAsset -Force
Write-Host "  -> Master saved: $masterAsset" -ForegroundColor Green

# Standard Batch Sizes for Web, PWA, Mobile, and UI
$targets = @(
    @{ Path = (Join-Path $publicDir "favicon-16x16.png");   W = 16;   H = 16 },
    @{ Path = (Join-Path $publicDir "favicon-32x32.png");   W = 32;   H = 32 },
    @{ Path = (Join-Path $publicDir "favicon-48x48.png");   W = 48;   H = 48 },
    @{ Path = (Join-Path $publicDir "apple-touch-icon.png"); W = 180;  H = 180 },
    @{ Path = (Join-Path $publicDir "icon-192.png");         W = 192;  H = 192 },
    @{ Path = (Join-Path $publicDir "icon-512.png");         W = 512;  H = 512 },
    @{ Path = (Join-Path $publicDir "app-logo.png");         W = 512;  H = 512 },
    @{ Path = (Join-Path $assetsDir "app-icon-64.png");      W = 64;   H = 64 },
    @{ Path = (Join-Path $assetsDir "app-icon-128.png");     W = 128;  H = 128 },
    @{ Path = (Join-Path $assetsDir "app-icon-256.png");     W = 256;  H = 256 },
    @{ Path = (Join-Path $assetsDir "app-icon-512.png");     W = 512;  H = 512 },
    @{ Path = (Join-Path $assetsDir "app-icon.png");         W = 1024; H = 1024 }
)

foreach ($target in $targets) {
    Resize-ImageFile -Src $InputPath -Dest $target.Path -W $target.W -H $target.H
}

# Also create favicon.ico from 32x32 bitmap
try {
    $icoPath = Join-Path $publicDir "favicon.ico"
    $fav32 = Join-Path $publicDir "favicon-32x32.png"
    $bmp32 = [System.Drawing.Bitmap]::FromFile($fav32)
    $hIcon = $bmp32.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    $fileStream = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create)
    $icon.Save($fileStream)
    $fileStream.Close()
    $bmp32.Dispose()
    Write-Host "  -> Generated ICO: $icoPath" -ForegroundColor Green
} catch {
    Write-Host "  (ICO generation skipped: $($_.Exception.Message))" -ForegroundColor Yellow
}

# Clean temporary test file if present
$testIcon = Join-Path $publicDir "test-icon.png"
if (Test-Path $testIcon) { Remove-Item $testIcon -Force }

Write-Host "=== All Life Tracker Icons & Assets Generated Successfully! ===" -ForegroundColor Cyan
