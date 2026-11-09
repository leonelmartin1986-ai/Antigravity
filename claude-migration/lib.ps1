# Funciones comunes para los scripts de migración (Windows PowerShell 5.1+ / PowerShell 7).
# Este archivo se guarda en UTF-8 con BOM para que PowerShell 5.1 lea bien los acentos.

# PowerShell 5.1: evita que ConvertTo-Json serialice arrays como {"value":[...],"Count":n}.
if ($PSVersionTable.PSVersion.Major -lt 6) { Remove-TypeData System.Array -ErrorAction SilentlyContinue }

$script:Redacted = '<<REDACTED>>'
$script:SecretKeyRx = '(token|secret|passw|pwd|api.?key|access.?key|authorization|bearer|credential|private.?key|cookie|session.?key|(^|[_-])pat($|[_-])|_key$)'
$script:SecretValRx = '^(sk-ant-|sk-|ghp_|gho_|github_pat_|xox[bap]-|Bearer |Basic |eyJ)'
$script:IdentityKeys = @('oauthAccount','userID','primaryApiKey','customApiKeyResponses','machineID',
  'cachedGrowthBookFeatures','cachedGrowthBookFeaturesAt','cachedExperimentData','cachedExperimentFeatures',
  'cachedExtraUsageDisabledReason','s1mAccessCache','groveConfigCache')
$script:LogFile = $null
$script:Utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Write-Log([string]$msg) {
  Write-Host $msg
  if ($script:LogFile) { Add-Content -LiteralPath $script:LogFile -Value ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $msg) -Encoding UTF8 }
}
function Write-Warn([string]$msg) { Write-Log "AVISO: $msg" }

function Get-ClaudeDir {
  if ($env:CLAUDE_CONFIG_DIR) { return $env:CLAUDE_CONFIG_DIR }
  return (Join-Path $HOME '.claude')
}
function Get-ClaudeJson {
  if ($env:CLAUDE_CONFIG_DIR -and (Test-Path -LiteralPath (Join-Path $env:CLAUDE_CONFIG_DIR '.claude.json'))) {
    return (Join-Path $env:CLAUDE_CONFIG_DIR '.claude.json')
  }
  return (Join-Path $HOME '.claude.json')
}
# Claude Desktop: instalación clásica (%APPDATA%\Claude) y versión Microsoft Store/MSIX.
function Get-AppDirs {
  $dirs = @()
  if ($env:APPDATA) { $dirs += (Join-Path $env:APPDATA 'Claude') }
  if ($env:LOCALAPPDATA -and (Test-Path -LiteralPath (Join-Path $env:LOCALAPPDATA 'Packages'))) {
    Get-ChildItem -LiteralPath (Join-Path $env:LOCALAPPDATA 'Packages') -Directory -Filter 'Claude*' -ErrorAction SilentlyContinue |
      ForEach-Object { $dirs += (Join-Path $_.FullName 'LocalCache\Roaming\Claude') }
  }
  if ($IsMacOS) { $dirs += (Join-Path $HOME 'Library/Application Support/Claude') }
  return @($dirs | Where-Object { Test-Path -LiteralPath $_ })
}

function Read-Json([string]$path) {
  try {
    $raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    return ($raw | ConvertFrom-Json -ErrorAction Stop)
  } catch {
    Write-Warn "No se pudo leer JSON $path : $($_.Exception.Message)"
    return $null
  }
}
function Write-Json($obj, [string]$path) {
  $json = $obj | ConvertTo-Json -Depth 100
  [System.IO.File]::WriteAllText($path, $json, $script:Utf8NoBom)
}
function Write-Text([string]$path, [string]$text) {
  if ($null -eq $text) { $text = '' }
  [System.IO.File]::WriteAllText($path, $text, $script:Utf8NoBom)
}

function Test-SecretValue($v) { return ($v -is [string]) -and ($v -cmatch $script:SecretValRx) }

# Enmascara secretos por nombre de clave o por forma del valor (recursivo).
function Protect-Secrets($o) {
  if ($null -eq $o) { return $null }
  if ($o -is [System.Management.Automation.PSCustomObject]) {
    foreach ($p in @($o.PSObject.Properties)) {
      $v = $p.Value
      $isScalar = ($v -is [string]) -or ($v -is [int]) -or ($v -is [long]) -or ($v -is [double])
      if ((($p.Name -match $script:SecretKeyRx) -and $isScalar) -or (Test-SecretValue $v)) {
        $p.Value = $script:Redacted
      } else {
        $p.Value = Protect-Secrets $v
      }
    }
    return $o
  }
  if ($o -is [System.Array]) {
    for ($i = 0; $i -lt $o.Length; $i++) {
      if (Test-SecretValue $o[$i]) { $o[$i] = $script:Redacted } else { $o[$i] = Protect-Secrets $o[$i] }
    }
    return ,$o
  }
  return $o
}

# Quita valores <<REDACTED>> (para que nunca pisen un secreto real al restaurar).
function Remove-Redacted($o) {
  if ($o -is [System.Management.Automation.PSCustomObject]) {
    foreach ($p in @($o.PSObject.Properties)) {
      if ($p.Value -is [string] -and $p.Value -eq $script:Redacted) { $o.PSObject.Properties.Remove($p.Name) }
      else { $p.Value = Remove-Redacted $p.Value }
    }
    return $o
  }
  if ($o -is [System.Array]) { return ,@($o | Where-Object { -not ($_ -is [string] -and $_ -eq $script:Redacted) } | ForEach-Object { Remove-Redacted $_ }) }
  return $o
}

# Merge profundo: gana $over; los objetos se combinan recursivamente.
function Merge-Deep($base, $over) {
  if (($base -is [System.Management.Automation.PSCustomObject]) -and ($over -is [System.Management.Automation.PSCustomObject])) {
    $r = [pscustomobject]@{}
    foreach ($p in $base.PSObject.Properties) { $r | Add-Member -NotePropertyName $p.Name -NotePropertyValue $p.Value }
    foreach ($p in $over.PSObject.Properties) {
      if ($r.PSObject.Properties[$p.Name]) { $r.($p.Name) = Merge-Deep $r.($p.Name) $p.Value }
      else { $r | Add-Member -NotePropertyName $p.Name -NotePropertyValue $p.Value }
    }
    return $r
  }
  if ($null -eq $over) { return $base }
  return $over
}

function Get-SafeName([string]$s) {
  if (-not $s) { return '' }
  $s = ($s -replace '[\x00-\x1F]', '') -replace '[\\/:*?"<>|]', '_'
  $s = $s.Trim(' ', '.')
  if ($s.Length -gt 80) { $s = $s.Substring(0, 80) }
  return $s
}

# Comprime una carpeta en zip. Copia antes a temporal para limpiar .in_use / .DS_Store.
function New-ZipFromDir([string]$src, [string]$dst, [bool]$includeBase) {
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $stage = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
  New-Item -ItemType Directory -Path $stage | Out-Null
  try {
    Copy-Item -LiteralPath $src -Destination $stage -Recurse -Force
    $item = Join-Path $stage (Split-Path $src -Leaf)
    Get-ChildItem -LiteralPath $item -Recurse -Force -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -eq '.in_use' -or $_.Name -eq '.DS_Store' } |
      Sort-Object { $_.FullName.Length } -Descending |
      ForEach-Object { Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $dst) { Remove-Item -LiteralPath $dst -Force }
    [System.IO.Compression.ZipFile]::CreateFromDirectory($item, $dst, [System.IO.Compression.CompressionLevel]::Optimal, $includeBase)
  } finally {
    Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue
  }
}

function Get-DefaultDest {
  $desk = [Environment]::GetFolderPath('Desktop')
  if ($desk -and (Test-Path -LiteralPath $desk)) { return $desk }
  return $HOME
}
