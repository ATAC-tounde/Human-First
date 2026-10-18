# HUMAN FIRST — THINK FIRST 0.1 | Démarrage local Windows
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'Node.js 20 ou supérieur est nécessaire : https://nodejs.org/' -ForegroundColor Red
    exit 1
}
$nodeVersion = (& node -p 'parseInt(process.versions.node.split(".")[0], 10)')
if ([int]$nodeVersion -lt 20) {
    Write-Host 'Installe Node.js 20 ou supérieur.' -ForegroundColor Red
    exit 1
}
Write-Host 'THINK FIRST V0.1 - Demarrage local, sans installation npm.' -ForegroundColor Green
Write-Host 'Navigateur : http://127.0.0.1:4173' -ForegroundColor Cyan
Write-Host 'Pour interrompre le serveur : Ctrl+C' -ForegroundColor DarkGray
& node server/index.mjs
