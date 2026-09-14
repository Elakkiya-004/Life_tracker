Add-Type -AssemblyName System.Drawing

$source = 'C:\Users\Sukumar Thangaraj\.gemini\antigravity-ide\brain\88d0d763-3e73-4edb-a44e-d3c078e721db\.user_uploaded\media_1789396776256.jpg'
$target = 'd:\Elakkiya_work_files\Cookscape_workspace\Life_tracker\public\test-icon.png'

$srcImg = [System.Drawing.Image]::FromFile($source)
$destImg = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($destImg)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.DrawImage($srcImg, 0, 0, 512, 512)
$destImg.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$destImg.Dispose()
$srcImg.Dispose()

Write-Output "Successfully saved $target"
