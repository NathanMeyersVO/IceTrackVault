# Signs a single Windows binary during `tauri build` using Azure Artifact Signing.
# Expects `azure/login` (OIDC) to have run in the same job so `az` is already authenticated.
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$File
)

$ErrorActionPreference = 'Stop'

$endpoint = $env:AZURE_SIGNING_ENDPOINT
$account = $env:AZURE_SIGNING_ACCOUNT
$profile = $env:AZURE_SIGNING_PROFILE
if (-not $endpoint -or -not $account -or -not $profile) {
    throw 'Set AZURE_SIGNING_ENDPOINT, AZURE_SIGNING_ACCOUNT, and AZURE_SIGNING_PROFILE.'
}

$configDir = Join-Path $env:USERPROFILE '.artifact-signing-cli'
$libPath = Join-Path $configDir 'lib\bin\x64\Azure.CodeSigning.Dlib.dll'
$metadataPath = Join-Path $configDir 'metadata.json'

if (-not (Test-Path $libPath)) {
    New-Item -ItemType Directory -Force -Path (Split-Path $libPath -Parent) | Out-Null
    $pkgVersion = '1.0.128'
    $zipPath = Join-Path $configDir "$pkgVersion.zip"
    $extractRoot = Join-Path $configDir 'lib'
    Invoke-WebRequest -Uri "https://www.nuget.org/api/v2/package/Microsoft.ArtifactSigning.Client/$pkgVersion" -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath $extractRoot -Force
    Remove-Item $zipPath -Force
}

$metadata = @{
    Endpoint                 = $endpoint
    CodeSigningAccountName   = $account
    CertificateProfileName   = $profile
} | ConvertTo-Json -Compress
Set-Content -Path $metadataPath -Value $metadata -Encoding utf8NoBOM

$signtool = $env:SIGNTOOL_PATH
if (-not $signtool -or -not (Test-Path -LiteralPath $signtool)) {
    $candidates = Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Recurse -Filter 'signtool.exe' -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match '\\x64\\signtool\.exe$' }
    $signtool = ($candidates | Sort-Object { $_.FullName } -Descending | Select-Object -First 1).FullName
}
if (-not $signtool -or -not (Test-Path -LiteralPath $signtool)) {
    throw 'signtool.exe not found. Set SIGNTOOL_PATH to the Windows SDK x64 signtool.exe.'
}

$description = if ($env:SIGNING_DESCRIPTION) { $env:SIGNING_DESCRIPTION } else { 'IceTrackVault' }

& $signtool sign /v /fd SHA256 /tr 'http://timestamp.acs.microsoft.com' /td SHA256 /d $description /dlib $libPath /dmdf $metadataPath $File
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
