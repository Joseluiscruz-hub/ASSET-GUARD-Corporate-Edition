# Script: check_secrets.ps1
# Revisión rápida de posibles secrets y configuración .gitignore en repositorios

# 1. Busca patrones sospechosos en el código
Write-Host "🔍 Buscando patrones de secrets en el código..."

$patterns = @("api_key", "apikey", "gemini", "sk-")
foreach ($pattern in $patterns) {
    Write-Host "`nBuscando: $pattern"
    # Busca el patrón de forma recursiva en los archivos del repo, excluyendo .git
    Get-ChildItem -Recurse -File | Where-Object { $_.DirectoryName -notmatch "\.git($|\\)" } | 
        ForEach-Object {
            $matches = Select-String -Path $_.FullName -Pattern $pattern -Quiet
            if ($matches) { Write-Host "   Posible secreto en $($_.FullName)" -ForegroundColor Yellow }
        }
}

Write-Host "`n---"

# 2. Busca archivos de ambiente en el repo
Write-Host "`n📦 Revisando archivos de ambiente y posibles archivos de secretos..."

$secretFiles = @(".env", ".env.local", "*.key", "*.secret", "secrets.yml", "credentials.json")
foreach ($file in $secretFiles) {
    Get-ChildItem -Recurse -Include $file -File |
        ForEach-Object { Write-Host "   Encontrado: $($_.FullName)" -ForegroundColor Cyan }
}

Write-Host "`n---"

# 3. Verifica si archivos de secretos están protegidos por .gitignore
Write-Host "`n🛡️ Verificando protección en .gitignore..."

$gitignorePath = ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath
    foreach ($file in @(".env", ".env.local", "*.key", "*.secret", "secrets.yml", "credentials.json")) {
        if ($gitignoreContent -notcontains $file) {
            Write-Host "   ADVERTENCIA: Falta '$file' en .gitignore" -ForegroundColor Red
        } else {
            Write-Host "   '$file' está protegido en .gitignore" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   AVISO: No existe archivo .gitignore en la raíz del proyecto." -ForegroundColor Red
}

Write-Host "`n✅ Revisión finalizada. ¡Revisa cualquier advertencia arriba!"