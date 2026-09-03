[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$url = "https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/MinGit-2.47.1-64-bit.zip"
$zipPath = "$env:TEMP\mingit.zip"
$destPath = "$env:USERPROFILE\git-portable"

Write-Host "Descargando MinGit..."
Invoke-WebRequest -Uri $url -OutFile $zipPath
Write-Host "Extrayendo MinGit en $destPath..."
Expand-Archive -Path $zipPath -DestinationPath $destPath -Force
Write-Host "SUCCESS: Git portable instalado correctamente en $destPath"
