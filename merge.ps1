$p1 = [IO.File]::ReadAllText("$env:USERPROFILE\Downloads\mycel-v5-p1.jsx")
$p2 = [IO.File]::ReadAllText("$env:USERPROFILE\Downloads\mycel-v5-p2.jsx")
$p3 = [IO.File]::ReadAllText("$env:USERPROFILE\Downloads\mycel-v5-p3.jsx")
$p4 = [IO.File]::ReadAllText("$env:USERPROFILE\Downloads\mycel-v5-p4.jsx")
[IO.File]::WriteAllText("$env:USERPROFILE\mycel\src\App.jsx", $p1 + $p2 + $p3 + $p4)
Write-Host "Done! Size: $((Get-Item "$env:USERPROFILE\mycel\src\App.jsx").Length) bytes"
