#!/usr/bin/env bash
# =============================================================================
# restore-claude.sh — Restaura un backup de backup-claude.sh (macOS/Linux)
#
# Por defecto es NO destructivo: solo agrega lo que falta y nunca pisa archivos
# ni la sesión de la cuenta nueva (oauthAccount). Antes de tocar nada guarda el
# estado actual en ~/.claude-pre-restore_<fecha>.
#
# Uso:  ./restore-claude.sh --from ClaudeBackup_<fecha>.zip [--dry-run] [--overwrite] [--yes]
#   --dry-run    Muestra qué haría, sin escribir
#   --overwrite  Reemplaza archivos existentes con los del backup
#   --yes        No pide confirmación
# =============================================================================
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib.sh
. "$HERE/lib.sh"

FROM=""; DRY=0; OVER=0; YES=0
while [ $# -gt 0 ]; do
  case "$1" in
    --from) FROM="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --overwrite) OVER=1; shift ;;
    --yes) YES=1; shift ;;
    -h|--help) sed -n '2,14p' "$0"; exit 0 ;;
    *) die "Parámetro desconocido: $1" ;;
  esac
done
[ -n "$FROM" ] || die "Indicá --from <zip o carpeta del backup>"
have jq || die "Se necesita jq (brew install jq)."

WORK=""
if [ -d "$FROM" ]; then BK="$FROM"
elif [ -f "$FROM" ]; then
  WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
  unzip -q "$FROM" -d "$WORK" || die "No se pudo descomprimir $FROM"
  BK="$(find "$WORK" -maxdepth 2 -type d -name 'ClaudeBackup_*' | head -1)"
  [ -n "$BK" ] || BK="$WORK"
else die "No existe $FROM"; fi
[ -d "$BK/claude-home" ] || die "No parece un backup válido (falta claude-home/)"

CDIR="$(claude_dir)"; CJSON="$(claude_json)"; ADIR="$(app_dir)"
log "Backup : $BK"
log "Destino: $CDIR"
log "Modo   : $([ $DRY = 1 ] && echo DRY-RUN) $([ $OVER = 1 ] && echo SOBRESCRIBIR || echo 'solo-agregar')"

if [ $DRY = 0 ] && [ $YES = 0 ]; then
  printf 'Cerrá Claude Code y Claude Desktop antes de seguir. ¿Continuar? [s/N] '
  read -r ans; case "$ans" in s|S|si|SI|y|Y) ;; *) die "Cancelado." ;; esac
fi

# --- Snapshot previo -----------------------------------------------------------
if [ $DRY = 0 ]; then
  SNAP="$HOME/.claude-pre-restore_$(date '+%Y%m%d_%H%M%S')"
  mkdir -p "$SNAP"
  [ -d "$CDIR" ] && cp -Rp "$CDIR" "$SNAP/claude-dir"
  [ -f "$CJSON" ] && cp -p "$CJSON" "$SNAP/claude.json"
  [ -n "$ADIR" ] && [ -f "$ADIR/claude_desktop_config.json" ] && cp -p "$ADIR/claude_desktop_config.json" "$SNAP/"
  log "Estado actual guardado en: $SNAP"
fi

# --- Archivos y carpetas --------------------------------------------------------
JSON_MERGE="settings.json settings.local.json"
copy_tree() { # <origen> <destino>
  src="$1"; dst="$2"
  (cd "$src" && find . -type f) | while IFS= read -r rel; do
    rel="${rel#./}"
    case " $JSON_MERGE " in *" $rel "*) continue ;; esac
    # Copias sincronizadas de la cuenta vieja: no se restauran (se re-suben con prepare-cloud).
    case "$rel" in plugins/synced/*|skills/synced/*) continue ;; esac
    if [ -e "$dst/$rel" ] && [ $OVER = 0 ]; then continue; fi
    if [ $DRY = 1 ]; then echo "  + $rel"
    else mkdir -p "$dst/$(dirname "$rel")" && cp -p "$src/$rel" "$dst/$rel"; fi
  done
}
log "Archivos a restaurar en $CDIR:"
mkdir -p "$CDIR" 2>/dev/null
copy_tree "$BK/claude-home" "$CDIR"

# --- Merge JSON: el actual manda; el backup completa lo que falta ---------------
# Los valores <<REDACTED>> del backup se descartan (nunca pisan un secreto real).
JQ_STRIP='def strip: if type=="object" then with_entries(select(.value != "<<REDACTED>>") | .value |= strip)
  elif type=="array" then map(select(. != "<<REDACTED>>") | strip) else . end;'
merge_json() { # <backup> <actual> <filtro-jq>
  b="$1"; c="$2"; f="$3"
  [ -f "$b" ] || return 0
  cur="$c"
  if [ ! -f "$c" ]; then cur="$(mktemp)"; echo '{}' > "$cur"; fi
  out="$(jq -n --slurpfile bak "$b" --slurpfile cur "$cur" "$JQ_STRIP $f")" || { warn "No se pudo combinar $c"; return 0; }
  if [ $DRY = 1 ]; then echo "  ~ merge $(basename "$c")"
  else mkdir -p "$(dirname "$c")"; printf '%s\n' "$out" > "$c"; fi
}
# jq '*' = merge profundo donde gana el lado derecho.
if [ $OVER = 1 ]; then ORDER='$cur[0] * ($bak[0]|strip)'; else ORDER='($bak[0]|strip) * $cur[0]'; fi
for f in $JSON_MERGE; do merge_json "$BK/claude-home/$f" "$CDIR/$f" "$ORDER"; done

# .claude.json: solo mcpServers y projects. Identidad (oauthAccount) nunca se toca.
merge_json "$BK/claude.json.sanitized" "$CJSON" \
  '$cur[0] as $c | ($bak[0]|strip) as $b |
   $c + { mcpServers: (($b.mcpServers // {}) * ($c.mcpServers // {})),
          projects:   (($b.projects   // {}) * ($c.projects   // {})) }'

[ -n "$ADIR" ] && [ -f "$BK/desktop-app/claude_desktop_config.json" ] && \
  merge_json "$BK/desktop-app/claude_desktop_config.json" "$ADIR/claude_desktop_config.json" "$ORDER"

log ""
log "== Restauración $([ $DRY = 1 ] && echo 'simulada' || echo 'completa') =="
log "Recargá los secretos marcados <<REDACTED>> (ver INVENTARIO.md del backup)."
log "Verificá en Claude Code: /status, /plugin, /mcp"
