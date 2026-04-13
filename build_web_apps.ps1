# ========================================
# Script para construir las apps Flet como paginas web estaticas
# con estructura compartida (shared runtime) para optimizar tamanio.
#
# Ejecutar desde la raiz del proyecto:
#   .\build_web_apps.ps1
#
# Requisitos:
#   - Python 3.12 con flet instalado (pip install flet)
#   - NO necesita Flutter SDK (usa flet publish)
#
# Estructura de salida:
#   web_apps/
#     shared/          <- runtime compartido (~66MB una sola vez)
#     ecdh_visual/     <- app.tar.gz + index.html + version.json
#     calculadora_ecc/ <- app.tar.gz + index.html + version.json
#     calculadora_ecdh/<- app.tar.gz + index.html + version.json
# ========================================

$ErrorActionPreference = "Stop"
$FLET = "C:\Users\vale_\AppData\Local\Programs\Python\Python312\Scripts\flet.exe"
$BUILD_DIR = Join-Path $PSScriptRoot "assets\practicas\web_builds"
$WEB_APPS_DIR = Join-Path $PSScriptRoot "assets\practicas\web_apps"
$SHARED_DIR = Join-Path $WEB_APPS_DIR "shared"

# Apps a construir: Name = carpeta, Source = ruta al main.py original
$apps = @(
    @{ Name = "ecdh_visual";       Desc = "ECDH Visual";              AppName = "ECDH Visual" },
    @{ Name = "calculadora_ecc";   Desc = "Calculadora ECC";          AppName = "Calculadora ECC" },
    @{ Name = "calculadora_ecdh";  Desc = "Calculadora ECC + ECDH";   AppName = "Calculadora ECC ECDH" }
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Construyendo apps Flet para la web" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Construir cada app con flet publish (en web_builds/)
$firstDist = $null
foreach ($app in $apps) {
    $projectPath = Join-Path $BUILD_DIR $app.Name
    $mainPy = Join-Path $projectPath "main.py"
    $distPath = Join-Path $projectPath "dist"
    
    if (-not (Test-Path $mainPy)) {
        Write-Host "[SKIP] $($app.Desc) - No se encontro main.py en $projectPath" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "[BUILD] $($app.Desc) ..." -ForegroundColor Green
    
    & $FLET publish $mainPy --distpath $distPath --app-name $app.AppName --pre 2>&1 | ForEach-Object { Write-Host "  $_" }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] $($app.Desc) -> dist/" -ForegroundColor Green
        if (-not $firstDist) { $firstDist = $distPath }
    } else {
        Write-Host "[ERROR] $($app.Desc) fallo con codigo $LASTEXITCODE" -ForegroundColor Red
    }
    Write-Host ""
}

# Paso 2: Actualizar shared/ con el runtime del primer build
if ($firstDist) {
    Write-Host "[SHARED] Actualizando runtime compartido..." -ForegroundColor Cyan
    
    if (Test-Path $SHARED_DIR) {
        Remove-Item $SHARED_DIR -Recurse -Force
    }
    New-Item -ItemType Directory -Path $SHARED_DIR -Force | Out-Null
    
    # Copiar todo excepto app.tar.gz y version.json (que son por-app)
    Get-ChildItem $firstDist | Where-Object { $_.Name -notin @("app.tar.gz", "version.json") } | ForEach-Object {
        Copy-Item $_.FullName -Destination $SHARED_DIR -Recurse -Force
    }
    
    $sharedSize = (Get-ChildItem $SHARED_DIR -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "[OK] Shared runtime: $([math]::Round($sharedSize, 1)) MB" -ForegroundColor Green
}

# Paso 3: Copiar app.tar.gz y version.json a cada carpeta de web_apps/
foreach ($app in $apps) {
    $distPath = Join-Path $BUILD_DIR "$($app.Name)\dist"
    $appDir = Join-Path $WEB_APPS_DIR $app.Name
    
    if (-not (Test-Path $distPath)) { continue }
    
    if (-not (Test-Path $appDir)) {
        New-Item -ItemType Directory -Path $appDir -Force | Out-Null
    }
    
    Copy-Item (Join-Path $distPath "app.tar.gz") -Destination $appDir -Force
    if (Test-Path (Join-Path $distPath "version.json")) {
        Copy-Item (Join-Path $distPath "version.json") -Destination $appDir -Force
    }
    
    Write-Host "[OK] $($app.Desc) -> web_apps/$($app.Name)/" -ForegroundColor Green
}

# Paso 4: Resumen
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Build completado!" -ForegroundColor Cyan
Write-Host "  Estructura en: assets/practicas/web_apps/" -ForegroundColor Cyan
Write-Host "    shared/          (runtime compartido)" -ForegroundColor White
foreach ($app in $apps) {
    $appDir = Join-Path $WEB_APPS_DIR $app.Name
    if (Test-Path $appDir) {
        Write-Host "    $($app.Name)/  (app.tar.gz + index.html)" -ForegroundColor White
    }
}
$totalSize = (Get-ChildItem $WEB_APPS_DIR -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Tamanio total: $([math]::Round($totalSize, 1)) MB" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
