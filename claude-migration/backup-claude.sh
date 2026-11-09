#!/usr/bin/env bash
# =============================================================================
# backup-claude.sh — Respaldo de Claude Code + Claude Desktop/Cowork (macOS/Linux)
#
# Respalda skills, plugins, agents, commands, settings, CLAUDE.md, MCP servers y
# el historial por proyecto, EXCLUYENDO credenciales e identidad de la cuenta.
# Genera: ClaudeBackup_<fecha>.zip + INVENTARIO.md + CHECKLIST_NUBE.md
#
# Uso:  ./backup-claude.sh [--dest DIR] [--no-history]
#   --dest DIR      Carpeta donde dejar el backup (default: ~/Desktop o ~)
#   --no-history    No incluir ~/.claude/projects (transcripts, puede pesar mucho)
#
# Solo LEE el origen. No modifica nada de tu instalación.
# =============================================================================
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib.sh
. "$HERE/lib.sh"

DEST=""
HISTORY=1
while [ $# -gt 0 ]; do
  case "$1" in
    --dest) DEST="$2"; shift 2 ;;
    --no-history) HISTORY=0; shift ;;
    -h|--help) sed -n '2,15p' "$0"; exit 0 ;;
    *) die "Parámetro desconocido: $1" ;;
  esac
done
[ -z "$DEST" ] && { [ -d "$HOME/Desktop" ] && DEST="$HOME/Desktop" || DEST="$HOME"; }
mkdir -p "$DEST" || die "No se puede crear $DEST"
DEST="$(cd "$DEST" && pwd)"

STAMP="$(date '+%Y%m%d_%H%M%S')"
NAME="ClaudeBackup_$STAMP"
OUT="$DEST/$NAME"
mkdir -p "$OUT/claude-home" "$OUT/desktop-app" || die "No se puede escribir en $DEST"
LOG_FILE="$OUT/backup.log"

CDIR="$(claude_dir)"; CJSON="$(claude_json)"; ADIR="$(app_dir)"
log "== Backup Claude =="
log "Origen Claude Code : $CDIR"
log "Config global      : $CJSON"
log "App Desktop/Cowork : ${ADIR:-n/d}"
log "Destino            : $OUT"

HAS_JQ=0; have jq && HAS_JQ=1
[ $HAS_JQ = 0 ] && warn "jq no está instalado (macOS 15+ lo trae; si no: 'brew install jq'). Los JSON con posibles secretos NO se copiarán."

# --- 1. ~/.claude (copia por exclusión de lo volátil/sensible) -----------------
EXCLUDE_TOP=".credentials.json .claude.json backups cache shell-snapshots session-env statsig logs ide debug telemetry"
[ $HISTORY = 0 ] && EXCLUDE_TOP="$EXCLUDE_TOP projects"

if [ -d "$CDIR" ]; then
  for item in "$CDIR"/* "$CDIR"/.[!.]*; do
    [ -e "$item" ] || continue
    base="$(basename "$item")"
    skip=0
    for ex in $EXCLUDE_TOP; do [ "$base" = "$ex" ] && skip=1; done
    case "$base" in *.lock) skip=1 ;; esac
    [ $skip = 1 ] && { log "  - excluido: $base"; continue; }
    cp -Rp "$item" "$OUT/claude-home/" 2>>"$LOG_FILE" || warn "No se pudo copiar $base"
  done
  rm -rf "$OUT/claude-home/plugins/cache"
  find "$OUT/claude-home" -name '.in_use' -exec rm -rf {} + 2>/dev/null
  log "  + ~/.claude copiado"
else
  warn "No existe $CDIR (¿Claude Code no instalado?)"
fi

# --- 2. Sanitizar JSON de configuración ----------------------------------------
sanitize_json() { # <origen> <destino>
  if [ $HAS_JQ = 1 ]; then
    jq "$JQ_REDACT red" "$1" > "$2" 2>>"$LOG_FILE" || { rm -f "$2"; warn "JSON inválido, no copiado: $1"; }
  else
    rm -f "$2"; warn "Sin jq: no se copia $1"
  fi
}

for f in settings.json settings.local.json; do
  [ -f "$CDIR/$f" ] && sanitize_json "$CDIR/$f" "$OUT/claude-home/$f"
done

if [ -f "$CJSON" ]; then
  if [ $HAS_JQ = 1 ]; then
    jq "$JQ_REDACT $JQ_DROP_IDENTITY | red" "$CJSON" > "$OUT/claude.json.sanitized" 2>>"$LOG_FILE" \
      && log "  + .claude.json sanitizado (sin oauthAccount/userID/tokens)" \
      || warn ".claude.json no se pudo procesar"
  else
    warn "Sin jq: .claude.json NO respaldado (contiene identidad de la cuenta)"
  fi
fi

# --- 3. Claude Desktop / Cowork --------------------------------------------------
if [ -n "$ADIR" ] && [ -d "$ADIR" ]; then
  [ -f "$ADIR/claude_desktop_config.json" ] && sanitize_json "$ADIR/claude_desktop_config.json" "$OUT/desktop-app/claude_desktop_config.json"
  # Rutas internas de Cowork no documentadas: se buscan carpetas skills/plugins, no se asumen.
  find "$ADIR" -maxdepth 5 -type d \( -name skills -o -name plugins \) 2>/dev/null \
    | grep -viE '/(Cache|Code Cache|GPUCache|IndexedDB|Local Storage|Session Storage|blob_storage|Crashpad|node_modules)/' \
    > "$OUT/desktop-app/encontrado.txt"
  while IFS= read -r d; do
    rel="${d#"$ADIR"/}"
    mkdir -p "$OUT/desktop-app/$(dirname "$rel")"
    cp -Rp "$d" "$OUT/desktop-app/$(dirname "$rel")/" 2>>"$LOG_FILE" && log "  + Desktop: $rel"
  done < "$OUT/desktop-app/encontrado.txt"
  [ -s "$OUT/desktop-app/encontrado.txt" ] || log "  · Desktop: no se encontraron carpetas skills/plugins locales"
else
  log "  · App Desktop/Cowork no encontrada en esta máquina"
fi

# --- 4. Escaneo de secretos residuales ----------------------------------------
LEAKS="$(grep -rIlE 'sk-ant-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|"accessToken"|"refreshToken"' "$OUT" 2>/dev/null | grep -v 'backup.log' || true)"
if [ -n "$LEAKS" ]; then
  warn "Posibles secretos en estos archivos (revisalos antes de compartir el zip):"
  printf '%s\n' "$LEAKS" | sed 's/^/    /' | tee -a "$LOG_FILE"
fi

# --- 5. Inventario --------------------------------------------------------------
INV="$OUT/INVENTARIO.md"
{
  echo "# Inventario Claude — $STAMP"
  echo
  echo "## Skills locales (~/.claude/skills)"
  for d in "$CDIR"/skills/*/; do [ -f "$d/SKILL.md" ] && echo "- $(basename "$d")"; done
  echo
  echo "## Skills sincronizados desde claude.ai (~/.claude/skills/synced)"
  for d in "$CDIR"/skills/synced/*/*/; do
    [ -f "$d/SKILL.md" ] || continue
    tag=""; [ -f "$d/LICENSE.txt" ] && tag=" _(con LICENSE: probablemente de Anthropic, no hace falta re-subir)_"
    echo "- $(basename "$d")$tag"
  done
  echo
  echo "## Plugins sincronizados (claude.ai / Cowork)"
  for m in "$CDIR"/plugins/synced/*/manifest.json; do
    [ -f "$m" ] || continue
    if [ $HAS_JQ = 1 ]; then
      jq -r '.plugins[]? | "- \(.name) — marketplace: \(.marketplaceName // "?")"' "$m"
    else echo "- (ver $m)"; fi
  done
  echo
  echo "## Plugins instalados en Claude Code (installed_plugins.json)"
  [ -f "$CDIR/plugins/installed_plugins.json" ] && [ $HAS_JQ = 1 ] \
    && jq -r '(.plugins // .) | if type=="object" then keys[] else .[]? | tostring end | "- \(.)"' "$CDIR/plugins/installed_plugins.json" 2>/dev/null
  echo
  echo "## Marketplaces conocidos"
  [ -f "$CDIR/plugins/known_marketplaces.json" ] && [ $HAS_JQ = 1 ] \
    && jq -r 'keys[]? | "- \(.)"' "$CDIR/plugins/known_marketplaces.json" 2>/dev/null
  echo
  echo "## Plugins habilitados (settings.json → enabledPlugins)"
  [ -f "$CDIR/settings.json" ] && [ $HAS_JQ = 1 ] \
    && jq -r '.enabledPlugins // {} | to_entries[] | "- \(.key): \(.value)"' "$CDIR/settings.json" 2>/dev/null
  echo
  echo "## Agents / Commands"
  for f in "$CDIR"/agents/*.md "$CDIR"/commands/*.md; do [ -f "$f" ] && echo "- ${f#"$CDIR"/}"; done
  echo
  echo "## MCP servers (las credenciales marcadas $REDACTED se cargan de nuevo)"
  if [ -f "$OUT/claude.json.sanitized" ]; then
    jq -r '(.mcpServers // {}) | keys[] | "- [usuario] \(.)"' "$OUT/claude.json.sanitized"
    jq -r '(.projects // {}) | to_entries[] | select(.value.mcpServers) | .key as $p | .value.mcpServers | keys[] | "- [proyecto \($p)] \(.)"' "$OUT/claude.json.sanitized"
  fi
  [ -f "$OUT/desktop-app/claude_desktop_config.json" ] \
    && jq -r '(.mcpServers // {}) | keys[] | "- [Desktop] \(.)"' "$OUT/desktop-app/claude_desktop_config.json"
  grep -rl --include='*.json' --include='*.sanitized' "$REDACTED" "$OUT" 2>/dev/null | sed "s#^$OUT/#- secreto enmascarado en: #"
  echo
  echo "## Proyectos con historial (~/.claude/projects)"
  for d in "$CDIR"/projects/*/; do [ -d "$d" ] && echo "- $(basename "$d")"; done
} > "$INV" 2>>"$LOG_FILE"
log "  + INVENTARIO.md"

# --- 6. Checklist de nube ---------------------------------------------------------
cp "$HERE/CHECKLIST_NUBE.md" "$OUT/CHECKLIST_NUBE.md" 2>/dev/null || warn "No se encontró CHECKLIST_NUBE.md junto al script"

# --- 7. Comprimir -----------------------------------------------------------------
ZIP="$DEST/$NAME.zip"
zip_dir "$OUT" "$ZIP" 1
HASH="$(sha256 "$ZIP")"
printf '%s  %s\n' "$HASH" "$NAME.zip" > "$ZIP.sha256"

SIZE="$(du -sh "$ZIP" | awk '{print $1}')"
log ""
log "== Listo =="
log "Backup : $ZIP ($SIZE)"
log "SHA256 : $HASH"
log "Carpeta: $OUT  (podés borrarla; el zip es el respaldo)"
cat <<EOF

PRÓXIMOS PASOS
  1. Revisá $OUT/INVENTARIO.md
  2. (Opcional) Prepará la recarga en la nube:
       ./prepare-cloud.sh --export <export-claude.zip>
  3. Cambiá de cuenta:
       - Claude Code:  /logout  y luego  /login  (con la cuenta corporativa)
       - Claude Desktop / Cowork: cerrar sesión → iniciar con la cuenta corporativa
  4. Verificá: 'claude' → /status, /plugin, /mcp
  5. Si algo se perdió:  ./restore-claude.sh --from "$ZIP" --dry-run
EOF
