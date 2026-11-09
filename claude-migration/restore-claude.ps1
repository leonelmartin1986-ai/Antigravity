<#
.SYNOPSIS
  Restaura un backup de backup-claude.ps1 (Windows).

.DESCRIPTION
  Por defecto es NO destructivo: solo agrega lo que falta y nunca pisa archivos ni la
  sesión de la cuenta nueva (oauthAccount). Antes de tocar nada guarda el estado actual
  en %USERPROFILE%\.claude-pre-restore_<fecha>.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\restore-claude.ps1 -From .\ClaudeBackup_20261109_120000.zip -DryRun
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$From,
  [switch]$DryRun,
  [switch]$Overwrite,
  [switch]$Yes
)
$ErrorActionPreference = 'Continue'
. (Join-Path $PSScriptRoot 'lib.ps1')

$work = $null
if (Test-Path -LiteralPath $From -PathType Container) { $bk = (Resolve-Path -LiteralPath $From).Path }
elseif (Test-Path -LiteralPath $From -PathType Leaf) {
  $work = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
  Expand-Archive -LiteralPath $From -DestinationPath $work -Force
  $bk = (Get-ChildItem -LiteralPath $work -Directory -Filter 'ClaudeBackup_*' | Select-Object -First 1).FullName
  if (-not $bk) { $bk = $work }
} else { throw "No existe $From" }

try {
  $bkHome = Join-Path $bk 'claude-home'
  if (-not (Test-Path -LiteralPath $bkHome)) { throw 'No parece un backup válido (falta claude-home)' }

  $cdir = Get-ClaudeDir; $cjson = Get-ClaudeJson; $apps = Get-AppDirs
  Write-Log "Backup : $bk"
  Write-Log "Destino: $cdir"
  Write-Log ("Modo   : " + ($(if ($DryRun) { 'DRY-RUN ' } else { '' })) + ($(if ($Overwrite) { 'SOBRESCRIBIR' } else { 'solo-agregar' })))

  if (-not $DryRun -and -not $Yes) {
    $ans = Read-Host 'Cerrá Claude Code y Claude Desktop antes de seguir. ¿Continuar? [s/N]'
    if ($ans -notmatch '^(s|si|sí|y|yes)$') { throw 'Cancelado.' }
  }

  # --- Snapshot previo ---------------------------------------------------------
  if (-not $DryRun) {
    $snap = Join-Path $HOME (".claude-pre-restore_" + (Get-Date -Format 'yyyyMMdd_HHmmss'))
    New-Item -ItemType Directory -Path $snap -Force | Out-Null
    if (Test-Path -LiteralPath $cdir) { Copy-Item -LiteralPath $cdir -Destination (Join-Path $snap 'claude-dir') -Recurse -Force }
    if (Test-Path -LiteralPath $cjson) { Copy-Item -LiteralPath $cjson -Destination (Join-Path $snap 'claude.json') -Force }
    foreach ($a in $apps) {
      $cfg = Join-Path $a 'claude_desktop_config.json'
      if (Test-Path -LiteralPath $cfg) { Copy-Item -LiteralPath $cfg -Destination $snap -Force }
    }
    Write-Log "Estado actual guardado en: $snap"
  }

  # --- Archivos ----------------------------------------------------------------
  $jsonMerge = @('settings.json', 'settings.local.json')
  Write-Log "Archivos a restaurar en ${cdir}:"
  Get-ChildItem -LiteralPath $bkHome -Recurse -File -Force | ForEach-Object {
    $rel = $_.FullName.Substring($bkHome.Length).TrimStart('\', '/')
    $relN = $rel -replace '\\', '/'
    if ($jsonMerge -contains $relN) { return }
    # Copias sincronizadas de la cuenta vieja: no se restauran (se re-suben con prepare-cloud).
    if ($relN -like 'plugins/synced/*' -or $relN -like 'skills/synced/*') { return }
    $dst = Join-Path $cdir $rel
    if ((Test-Path -LiteralPath $dst) -and -not $Overwrite) { return }
    if ($DryRun) { Write-Host "  + $rel" }
    else {
      New-Item -ItemType Directory -Path (Split-Path $dst -Parent) -Force | Out-Null
      Copy-Item -LiteralPath $_.FullName -Destination $dst -Force
    }
  }

  # --- Merge JSON: el actual manda; el backup completa lo que falta ---------------
  function Merge-JsonFile([string]$bakPath, [string]$curPath, [bool]$backupWins) {
    if (-not (Test-Path -LiteralPath $bakPath)) { return }
    $b = Remove-Redacted (Read-Json $bakPath)
    if ($null -eq $b) { return }
    $c = $null; if (Test-Path -LiteralPath $curPath) { $c = Read-Json $curPath }
    if ($null -eq $c) { $c = [pscustomobject]@{} }
    if ($backupWins) { $r = Merge-Deep $c $b } else { $r = Merge-Deep $b $c }
    if ($DryRun) { Write-Host "  ~ merge $(Split-Path $curPath -Leaf)"; return }
    New-Item -ItemType Directory -Path (Split-Path $curPath -Parent) -Force | Out-Null
    Write-Json $r $curPath
  }
  foreach ($f in $jsonMerge) { Merge-JsonFile (Join-Path $bkHome $f) (Join-Path $cdir $f) ([bool]$Overwrite) }

  # .claude.json: solo mcpServers y projects; la identidad (oauthAccount) nunca se toca.
  $bakJson = Join-Path $bk 'claude.json.sanitized'
  if (Test-Path -LiteralPath $bakJson) {
    $b = Remove-Redacted (Read-Json $bakJson)
    $c = $null; if (Test-Path -LiteralPath $cjson) { $c = Read-Json $cjson }
    if ($null -eq $c) { $c = [pscustomobject]@{} }
    foreach ($k in 'mcpServers', 'projects') {
      $bv = $b.$k; if ($null -eq $bv) { continue }
      $cv = $c.$k; if ($null -eq $cv) { $cv = [pscustomobject]@{} }
      $merged = Merge-Deep $bv $cv
      if ($c.PSObject.Properties[$k]) { $c.$k = $merged } else { $c | Add-Member -NotePropertyName $k -NotePropertyValue $merged }
    }
    if ($DryRun) { Write-Host '  ~ merge .claude.json (mcpServers, projects)' } else { Write-Json $c $cjson }
  }

  # Claude Desktop
  Get-ChildItem -LiteralPath (Join-Path $bk 'desktop-app') -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $origen = Join-Path $_.FullName 'ORIGEN.txt'
    $cfg = Join-Path $_.FullName 'claude_desktop_config.json'
    if ((Test-Path -LiteralPath $origen) -and (Test-Path -LiteralPath $cfg)) {
      $target = (Get-Content -LiteralPath $origen -Raw).Trim()
      if (Test-Path -LiteralPath $target) { Merge-JsonFile $cfg (Join-Path $target 'claude_desktop_config.json') ([bool]$Overwrite) }
    }
  }

  Write-Log ''
  Write-Log ("== Restauración " + ($(if ($DryRun) { 'simulada' } else { 'completa' })) + ' ==')
  Write-Log 'Recargá los secretos marcados <<REDACTED>> (ver INVENTARIO.md del backup).'
  Write-Log 'Verificá en Claude Code: /status, /plugin, /mcp'
}
finally {
  if ($work) { Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction SilentlyContinue }
}
