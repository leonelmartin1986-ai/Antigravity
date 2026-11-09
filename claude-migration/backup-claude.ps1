<#
.SYNOPSIS
  Respaldo de Claude Code + Claude Desktop/Cowork (Windows).

.DESCRIPTION
  Respalda skills, plugins, agents, commands, settings, CLAUDE.md, MCP servers y el
  historial por proyecto, EXCLUYENDO credenciales e identidad de la cuenta.
  Genera: ClaudeBackup_<fecha>.zip + INVENTARIO.md + CHECKLIST_NUBE.md
  Solo LEE el origen. No modifica tu instalación.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\backup-claude.ps1
  powershell -ExecutionPolicy Bypass -File .\backup-claude.ps1 -Dest D:\Backups -NoHistory
#>
[CmdletBinding()]
param(
  [string]$Dest,
  [switch]$NoHistory
)
$ErrorActionPreference = 'Continue'
. (Join-Path $PSScriptRoot 'lib.ps1')

if (-not $Dest) { $Dest = Get-DefaultDest }
New-Item -ItemType Directory -Path $Dest -Force | Out-Null
$Dest = (Resolve-Path -LiteralPath $Dest).Path
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$name  = "ClaudeBackup_$stamp"
$out   = Join-Path $Dest $name
$home2 = Join-Path $out 'claude-home'
$desk  = Join-Path $out 'desktop-app'
New-Item -ItemType Directory -Path $home2, $desk -Force | Out-Null
$script:LogFile = Join-Path $out 'backup.log'

$cdir = Get-ClaudeDir; $cjson = Get-ClaudeJson; $apps = Get-AppDirs
Write-Log '== Backup Claude =='
Write-Log "Origen Claude Code : $cdir"
Write-Log "Config global      : $cjson"
Write-Log ("App Desktop/Cowork : " + ($(if ($apps) { $apps -join '; ' } else { 'n/d' })))
Write-Log "Destino            : $out"
if ($PSVersionTable.PSVersion.Major -lt 7) {
  Write-Log '  (PowerShell 5.1: si un JSON grande falla, corré con PowerShell 7: pwsh -File ...)'
}

# --- 1. ~/.claude ---------------------------------------------------------------
$exclude = @('.credentials.json', '.claude.json', 'backups', 'cache', 'shell-snapshots', 'session-env',
             'statsig', 'logs', 'ide', 'debug', 'telemetry')
if ($NoHistory) { $exclude += 'projects' }

if (Test-Path -LiteralPath $cdir) {
  Get-ChildItem -LiteralPath $cdir -Force | ForEach-Object {
    if ($exclude -contains $_.Name -or $_.Name -like '*.lock') { Write-Log "  - excluido: $($_.Name)"; return }
    try { Copy-Item -LiteralPath $_.FullName -Destination $home2 -Recurse -Force -ErrorAction Stop }
    catch { Write-Warn "No se pudo copiar $($_.Name): $($_.Exception.Message)" }
  }
  $pc = Join-Path $home2 'plugins\cache'
  if (Test-Path -LiteralPath $pc) { Remove-Item -LiteralPath $pc -Recurse -Force }
  Get-ChildItem -LiteralPath $home2 -Recurse -Force -Filter '.in_use' -ErrorAction SilentlyContinue |
    Sort-Object { $_.FullName.Length } -Descending |
    ForEach-Object { Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue }
  Write-Log '  + .claude copiado'
} else {
  Write-Warn "No existe $cdir (¿Claude Code no instalado?)"
}

# --- 2. Sanitizar JSON ------------------------------------------------------------
function Save-Sanitized([string]$src, [string]$dst) {
  $o = Read-Json $src
  if ($null -eq $o) { if (Test-Path -LiteralPath $dst) { Remove-Item -LiteralPath $dst -Force }; return }
  Write-Json (Protect-Secrets $o) $dst
}
foreach ($f in @('settings.json', 'settings.local.json')) {
  $p = Join-Path $cdir $f
  if (Test-Path -LiteralPath $p) { Save-Sanitized $p (Join-Path $home2 $f) }
}

$sanitized = Join-Path $out 'claude.json.sanitized'
if (Test-Path -LiteralPath $cjson) {
  $o = Read-Json $cjson
  if ($null -ne $o) {
    foreach ($k in $script:IdentityKeys) { $o.PSObject.Properties.Remove($k) }
    Write-Json (Protect-Secrets $o) $sanitized
    Write-Log '  + .claude.json sanitizado (sin oauthAccount/userID/tokens)'
  }
}

# --- 3. Claude Desktop / Cowork ----------------------------------------------------
$skipRx = '\\(Cache|Code Cache|GPUCache|IndexedDB|Local Storage|Session Storage|blob_storage|Crashpad|node_modules)\\'
$found = @()
$i = 0
foreach ($a in $apps) {
  $i++
  $tgt = Join-Path $desk "app$i"
  New-Item -ItemType Directory -Path $tgt -Force | Out-Null
  Write-Text (Join-Path $tgt 'ORIGEN.txt') $a
  $cfg = Join-Path $a 'claude_desktop_config.json'
  if (Test-Path -LiteralPath $cfg) { Save-Sanitized $cfg (Join-Path $tgt 'claude_desktop_config.json') }
  # Rutas internas de Cowork no documentadas: se buscan carpetas skills/plugins, no se asumen.
  Get-ChildItem -LiteralPath $a -Recurse -Directory -Depth 4 -Force -ErrorAction SilentlyContinue |
    Where-Object { ($_.Name -eq 'skills' -or $_.Name -eq 'plugins') -and ($_.FullName -notmatch $skipRx) } |
    ForEach-Object {
      $rel = $_.FullName.Substring($a.Length).TrimStart('\', '/')
      $dstParent = Join-Path $tgt (Split-Path $rel -Parent)
      New-Item -ItemType Directory -Path $dstParent -Force | Out-Null
      Copy-Item -LiteralPath $_.FullName -Destination $dstParent -Recurse -Force -ErrorAction SilentlyContinue
      $found += $_.FullName
      Write-Log "  + Desktop: $rel"
    }
}
Write-Text (Join-Path $desk 'encontrado.txt') ($found -join "`r`n")
if (-not $apps) { Write-Log '  · App Desktop/Cowork no encontrada en esta máquina' }
elseif (-not $found) { Write-Log '  · Desktop: no se encontraron carpetas skills/plugins locales' }

# --- 4. Escaneo de secretos residuales ---------------------------------------------
$leakRx = 'sk-ant-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|"accessToken"|"refreshToken"'
$leaks = Get-ChildItem -LiteralPath $out -Recurse -File -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -ne 'backup.log' } |
  Select-String -Pattern $leakRx -List -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Path -Unique
if ($leaks) {
  Write-Warn 'Posibles secretos en estos archivos (revisalos antes de compartir el zip):'
  $leaks | ForEach-Object { Write-Log "    $_" }
}

# --- 5. Inventario -----------------------------------------------------------------
$inv = New-Object System.Collections.Generic.List[string]
$inv.Add("# Inventario Claude — $stamp"); $inv.Add('')
$inv.Add('## Skills locales (.claude\skills)')
Get-ChildItem -LiteralPath (Join-Path $cdir 'skills') -Directory -ErrorAction SilentlyContinue |
  Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') } | ForEach-Object { $inv.Add("- $($_.Name)") }
$inv.Add(''); $inv.Add('## Skills sincronizados desde claude.ai (.claude\skills\synced)')
Get-ChildItem -LiteralPath (Join-Path $cdir 'skills\synced') -Directory -ErrorAction SilentlyContinue |
  ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory } |
  Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') } | ForEach-Object {
    $tag = ''; if (Test-Path -LiteralPath (Join-Path $_.FullName 'LICENSE.txt')) { $tag = ' _(con LICENSE: probablemente de Anthropic, no hace falta re-subir)_' }
    $inv.Add("- $($_.Name)$tag")
  }
$inv.Add(''); $inv.Add('## Plugins sincronizados (claude.ai / Cowork)')
Get-ChildItem -LiteralPath (Join-Path $cdir 'plugins\synced') -Recurse -Filter 'manifest.json' -Depth 1 -ErrorAction SilentlyContinue | ForEach-Object {
  $m = Read-Json $_.FullName
  if ($m -and $m.plugins) { foreach ($pl in $m.plugins) { $inv.Add("- $($pl.name) — marketplace: $($pl.marketplaceName)") } }
}
$inv.Add(''); $inv.Add('## Plugins instalados en Claude Code (installed_plugins.json)')
$ip = Join-Path $cdir 'plugins\installed_plugins.json'
if (Test-Path -LiteralPath $ip) {
  $j = Read-Json $ip
  $src = $j; if ($j -and $j.PSObject.Properties['plugins']) { $src = $j.plugins }
  if ($src -is [System.Management.Automation.PSCustomObject]) { $src.PSObject.Properties | ForEach-Object { $inv.Add("- $($_.Name)") } }
}
$inv.Add(''); $inv.Add('## Marketplaces conocidos')
$km = Join-Path $cdir 'plugins\known_marketplaces.json'
if (Test-Path -LiteralPath $km) { $j = Read-Json $km; if ($j) { $j.PSObject.Properties | ForEach-Object { $inv.Add("- $($_.Name)") } } }
$inv.Add(''); $inv.Add('## Plugins habilitados (settings.json → enabledPlugins)')
$sj = Join-Path $cdir 'settings.json'
if (Test-Path -LiteralPath $sj) { $j = Read-Json $sj; if ($j -and $j.enabledPlugins) { $j.enabledPlugins.PSObject.Properties | ForEach-Object { $inv.Add("- $($_.Name): $($_.Value)") } } }
$inv.Add(''); $inv.Add('## Agents / Commands')
foreach ($sub in @('agents', 'commands')) {
  Get-ChildItem -LiteralPath (Join-Path $cdir $sub) -Filter '*.md' -File -ErrorAction SilentlyContinue | ForEach-Object { $inv.Add("- $sub\$($_.Name)") }
}
$inv.Add(''); $inv.Add("## MCP servers (las credenciales marcadas $($script:Redacted) se cargan de nuevo)")
if (Test-Path -LiteralPath $sanitized) {
  $j = Read-Json $sanitized
  if ($j.mcpServers) { $j.mcpServers.PSObject.Properties | ForEach-Object { $inv.Add("- [usuario] $($_.Name)") } }
  if ($j.projects) {
    $j.projects.PSObject.Properties | ForEach-Object {
      $pn = $_.Name
      if ($_.Value.mcpServers) { $_.Value.mcpServers.PSObject.Properties | ForEach-Object { $inv.Add("- [proyecto $pn] $($_.Name)") } }
    }
  }
}
Get-ChildItem -LiteralPath $desk -Recurse -Filter 'claude_desktop_config.json' -ErrorAction SilentlyContinue | ForEach-Object {
  $j = Read-Json $_.FullName
  if ($j.mcpServers) { $j.mcpServers.PSObject.Properties | ForEach-Object { $inv.Add("- [Desktop] $($_.Name)") } }
}
Get-ChildItem -LiteralPath $out -Recurse -File -Include '*.json', '*.sanitized' -ErrorAction SilentlyContinue |
  Select-String -SimpleMatch $script:Redacted -List | ForEach-Object { $inv.Add("- secreto enmascarado en: $($_.Path.Substring($out.Length + 1))") }
$inv.Add(''); $inv.Add('## Proyectos con historial (.claude\projects)')
Get-ChildItem -LiteralPath (Join-Path $cdir 'projects') -Directory -ErrorAction SilentlyContinue | ForEach-Object { $inv.Add("- $($_.Name)") }
Write-Text (Join-Path $out 'INVENTARIO.md') ($inv -join "`r`n")
Write-Log '  + INVENTARIO.md'

# --- 6. Checklist de nube -------------------------------------------------------------
$chk = Join-Path $PSScriptRoot 'CHECKLIST_NUBE.md'
if (Test-Path -LiteralPath $chk) { Copy-Item -LiteralPath $chk -Destination $out } else { Write-Warn 'No se encontró CHECKLIST_NUBE.md junto al script' }

# --- 7. Comprimir ---------------------------------------------------------------------
$zip = Join-Path $Dest "$name.zip"
New-ZipFromDir $out $zip $true
$hash = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLower()
Write-Text "$zip.sha256" "$hash  $name.zip"
$size = '{0:N1} MB' -f ((Get-Item -LiteralPath $zip).Length / 1MB)

Write-Log ''
Write-Log '== Listo =='
Write-Log "Backup : $zip ($size)"
Write-Log "SHA256 : $hash"
Write-Log "Carpeta: $out  (podés borrarla; el zip es el respaldo)"
Write-Host @"

PRÓXIMOS PASOS
  1. Revisá $out\INVENTARIO.md
  2. (Opcional) Prepará la recarga en la nube:
       .\prepare-cloud.ps1 -Export <export-claude.zip>
  3. Cambiá de cuenta:
       - Claude Code:  /logout  y luego  /login  (con la cuenta corporativa)
       - Claude Desktop / Cowork: cerrar sesión → iniciar con la cuenta corporativa
  4. Verificá: 'claude' → /status, /plugin, /mcp
  5. Si algo se perdió:  .\restore-claude.ps1 -From "$zip" -DryRun
"@
