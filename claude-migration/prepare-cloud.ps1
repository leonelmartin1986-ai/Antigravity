<#
.SYNOPSIS
  Deja lista la recarga manual en claude.ai / Cowork (Windows).

.DESCRIPTION
  1. Plugins propios ("My Uploads") sincronizados -> CloudReload\Plugins\<plugin>.zip
  2. Skills (locales + sincronizados)              -> CloudReload\Skills\<skill>.zip
  3. Export de claude.ai (opcional)                -> CloudReload\Proyectos\<proyecto>\
  4. CloudReload\AVANCE.md con checklist por elemento
  El parser del export es DEFENSIVO: el formato no está documentado; detecta campos
  por nombre y registra lo que no entiende en parser-warnings.log.

.PARAMETER Export  Zip (o carpeta descomprimida) del export de claude.ai
.PARAMETER Out     Destino (default: Escritorio)
.PARAMETER Source  Carpeta .claude a usar (default: %USERPROFILE%\.claude; sirve también
                   la carpeta claude-home de un backup descomprimido)
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\prepare-cloud.ps1 -Export "$HOME\Downloads\data-export.zip"
#>
[CmdletBinding()]
param([string]$Export, [string]$Out, [string]$Source)
$ErrorActionPreference = 'Continue'
. (Join-Path $PSScriptRoot 'lib.ps1')

if (-not $Source) { $Source = Get-ClaudeDir }
if (-not $Out) { $Out = Get-DefaultDest }
New-Item -ItemType Directory -Path $Out -Force | Out-Null
$root = Join-Path (Resolve-Path -LiteralPath $Out).Path ("CloudReload_" + (Get-Date -Format 'yyyyMMdd_HHmmss'))
foreach ($d in 'Plugins', 'Skills', 'Proyectos') { New-Item -ItemType Directory -Path (Join-Path $root $d) -Force | Out-Null }
$script:LogFile = Join-Path $root 'prepare.log'
$warns = New-Object System.Collections.Generic.List[string]
$av = New-Object System.Collections.Generic.List[string]
$av.Add('# Avance de recarga en la cuenta corporativa'); $av.Add(''); $av.Add('Marcá cada casilla a medida que avanzás.'); $av.Add('')
Write-Log "Origen: $Source"; Write-Log "Destino: $root"

# --- 1. Plugins sincronizados --------------------------------------------------
$np = 0; $av.Add('## Plugins')
Get-ChildItem -LiteralPath (Join-Path $Source 'plugins\synced') -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  $base = $_.FullName
  if (-not (Test-Path -LiteralPath (Join-Path $base 'manifest.json'))) { return }
  Get-ChildItem -LiteralPath $base -Directory | ForEach-Object {
    $name = $_.Name; $kind = 'desconocido'; $market = '?'
    $metaPath = Join-Path $base "$name.meta.json"
    if (Test-Path -LiteralPath $metaPath) {
      $meta = Read-Json $metaPath
      if ($meta) { if ($meta.marketplace_kind) { $kind = $meta.marketplace_kind }; if ($meta.marketplace_name) { $market = $meta.marketplace_name } }
    }
    if ($kind -eq 'anthropic_catalog') {
      $av.Add("- [ ] **$name** — catálogo Anthropic ($market): activarlo desde el catálogo, no se sube")
    } elseif ((Test-Path -LiteralPath (Join-Path $_.FullName '.claude-plugin\plugin.json')) -or (Test-Path -LiteralPath (Join-Path $_.FullName 'plugin.json'))) {
      New-ZipFromDir $_.FullName (Join-Path $root "Plugins\$name.zip") $false
      $np++
      $av.Add("- [ ] **$name** — subir ``Plugins\$name.zip`` ($market)")
    } else {
      $av.Add("- [ ] **$name** — sin plugin.json, revisar a mano: $($_.FullName)")
      $warns.Add("plugin sin manifiesto: $($_.FullName)")
    }
  }
}
Write-Log "Plugins empaquetados: $np"

# --- 2. Skills ------------------------------------------------------------------
$ns = 0; $av.Add(''); $av.Add('## Skills')
$skillDirs = @()
$skillDirs += Get-ChildItem -LiteralPath (Join-Path $Source 'skills') -Directory -ErrorAction SilentlyContinue
Get-ChildItem -LiteralPath (Join-Path $Source 'skills\synced') -Directory -ErrorAction SilentlyContinue |
  ForEach-Object { $skillDirs += Get-ChildItem -LiteralPath $_.FullName -Directory }
foreach ($d in $skillDirs) {
  if (-not (Test-Path -LiteralPath (Join-Path $d.FullName 'SKILL.md'))) { continue }
  $zipPath = Join-Path $root "Skills\$($d.Name).zip"
  if (Test-Path -LiteralPath $zipPath) { continue }
  $lic = Join-Path $d.FullName 'LICENSE.txt'
  if ((Test-Path -LiteralPath $lic) -and (Select-String -LiteralPath $lic -Pattern 'Anthropic|Apache License' -Quiet)) {
    $av.Add("- [ ] **$($d.Name)** — probablemente de Anthropic: verificar que ya exista en la cuenta nueva")
    continue
  }
  New-ZipFromDir $d.FullName $zipPath $true
  $ns++
  $av.Add("- [ ] **$($d.Name)** — subir ``Skills\$($d.Name).zip``")
}
Write-Log "Skills empaquetados: $ns"

# --- 3. Export de claude.ai -------------------------------------------------------
function Get-First($o, [string[]]$keys) {
  foreach ($k in $keys) {
    $p = $o.PSObject.Properties[$k]
    if ($p -and $null -ne $p.Value -and "$($p.Value)" -ne '') { return $p.Value }
  }
  return $null
}
function ConvertTo-Text($v) {
  if ($null -eq $v) { return '' }
  if ($v -is [string]) { return $v }
  return ($v | ConvertTo-Json -Depth 50)
}

$npr = 0; $av.Add(''); $av.Add('## Proyectos')
if ($Export) {
  $tmp = $null
  if (Test-Path -LiteralPath $Export -PathType Container) { $exdir = $Export }
  elseif (Test-Path -LiteralPath $Export -PathType Leaf) {
    $tmp = Join-Path $root '_export'
    Expand-Archive -LiteralPath $Export -DestinationPath $tmp -Force
    $exdir = $tmp
  } else { throw "No existe $Export" }

  $files = @(Get-ChildItem -LiteralPath $exdir -Recurse -File -Filter 'projects*.json' -ErrorAction SilentlyContinue)
  if (-not $files) {
    $warns.Add('No se encontró projects*.json. JSON presentes en el export:')
    Get-ChildItem -LiteralPath $exdir -Recurse -File -Filter '*.json' | ForEach-Object { $warns.Add("  $($_.FullName.Substring($exdir.Length))") }
    $av.Add('- [ ] No se encontraron proyectos en el export (ver parser-warnings.log)')
  }
  foreach ($jf in $files) {
    $data = Read-Json $jf.FullName
    if ($null -eq $data) { $warns.Add("JSON inválido, ignorado: $($jf.FullName)"); continue }
    # Lista de proyectos: array directo o primer array dentro de un objeto.
    $list = @()
    if ($data -is [System.Array]) { $list = $data }
    elseif ($data -is [System.Management.Automation.PSCustomObject]) {
      foreach ($p in $data.PSObject.Properties) { if ($p.Value -is [System.Array]) { $list += $p.Value } }
    }
    $i = 0
    foreach ($pr in $list) {
      $i++
      if (-not ($pr -is [System.Management.Automation.PSCustomObject])) { continue }
      $pname = Get-First $pr @('name', 'title', 'project_name'); if (-not $pname) { $pname = "proyecto_$i" }
      $desc  = Get-First $pr @('description', 'summary')
      $ins   = Get-First $pr @('prompt_template', 'instructions', 'custom_instructions', 'system_prompt', 'prompt')
      $docs  = @(Get-First $pr @('docs', 'documents', 'files', 'knowledge', 'knowledge_files', 'attachments'))
      if ($docs.Count -eq 1 -and $null -eq $docs[0]) { $docs = @() }
      $miss = @(); if (-not (Get-First $pr @('name', 'title', 'project_name'))) { $miss += 'name' }
      if ($null -eq $ins) { $miss += 'instrucciones' }; if ($docs.Count -eq 0) { $miss += 'docs' }
      if ($miss) { $warns.Add("Proyecto `"$pname`": campos vacíos o ausentes [$($miss -join ',')]. Claves presentes: $(($pr.PSObject.Properties.Name) -join ',')") }

      $dir = Join-Path $root ("Proyectos\" + (Get-SafeName "$pname"))
      if (Test-Path -LiteralPath $dir) { $dir = "${dir}_$i" }
      New-Item -ItemType Directory -Path (Join-Path $dir 'conocimiento') -Force | Out-Null
      Write-Text (Join-Path $dir 'descripcion.txt') (ConvertTo-Text $desc)
      Write-Text (Join-Path $dir 'instrucciones.txt') (ConvertTo-Text $ins)
      $j = 0
      foreach ($doc in $docs) {
        if ($doc -is [System.Management.Automation.PSCustomObject]) {
          $fn = Get-SafeName "$(Get-First $doc @('filename', 'file_name', 'name', 'title'))"
          $content = ConvertTo-Text (Get-First $doc @('content', 'text', 'body', 'extracted_content'))
        } else { $fn = ''; $content = ConvertTo-Text $doc }
        if (-not $fn) { $fn = "documento_$j.txt" }
        $fp = Join-Path $dir "conocimiento\$fn"
        if (Test-Path -LiteralPath $fp) { $fp = Join-Path $dir "conocimiento\${j}_$fn" }
        Write-Text $fp $content
        if (-not $content) { $warns.Add("Documento vacío o sin contenido en el export: $(Split-Path $dir -Leaf)\$fn") }
        $j++
      }
      $npr++
      $av.Add("- [ ] **$pname** ($($docs.Count) archivos) — [ ] creado  [ ] instrucciones  [ ] archivos")
    }
  }
  if (Get-ChildItem -LiteralPath $exdir -Recurse -File -Filter 'conversations*.json' -ErrorAction SilentlyContinue) {
    $av.Add('- Nota: el export trae conversaciones; no se pueden importar (solo consulta).')
  }
  if ($tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue }
} else {
  $av.Add('- [ ] Pendiente: correr de nuevo con -Export <zip del export de claude.ai>')
}
Write-Log "Proyectos extraídos: $npr"

Write-Text (Join-Path $root 'AVANCE.md') ($av -join "`r`n")
if ($warns.Count) {
  Write-Text (Join-Path $root 'parser-warnings.log') ($warns -join "`r`n")
  Write-Warn "Hubo observaciones del parser: $(Join-Path $root 'parser-warnings.log')"
}
Write-Log ''
Write-Log "== Listo: $root =="
Write-Log 'Abrí AVANCE.md y seguí la lista. Checklist completo: CHECKLIST_NUBE.md'
