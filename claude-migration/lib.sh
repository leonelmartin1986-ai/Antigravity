# shellcheck shell=bash
# Funciones comunes para los scripts de migración (macOS / Linux).
# Compatible con bash 3.2 (el bash de macOS): sin arrays asociativos ni mapfile.

REDACTED='<<REDACTED>>'

# Filtro jq: enmascara valores sensibles por NOMBRE de clave o por FORMA del valor.
# shellcheck disable=SC2016
JQ_REDACT='
def secret_key: test("(token|secret|passw|pwd|api.?key|access.?key|authorization|bearer|credential|private.?key|cookie|session.?key|(^|[_-])pat($|[_-])|_key$)"; "i");
def secret_val: type == "string" and test("^(sk-ant-|sk-|ghp_|gho_|github_pat_|xox[bap]-|Bearer |Basic |eyJ)"; "");
def red:
  if type == "object" then
    with_entries(
      if ((.key | secret_key) and ((.value | type) == "string" or (.value | type) == "number")) or (.value | secret_val)
      then .value = "<<REDACTED>>"
      else .value |= red end)
  elif type == "array" then map(if secret_val then "<<REDACTED>>" else red end)
  else . end;
'

# Claves de ~/.claude.json atadas a la cuenta/máquina vieja: nunca se respaldan.
JQ_DROP_IDENTITY='del(.oauthAccount, .userID, .primaryApiKey, .customApiKeyResponses, .machineID,
  .cachedGrowthBookFeatures, .cachedGrowthBookFeaturesAt, .cachedExperimentData,
  .cachedExperimentFeatures, .cachedExtraUsageDisabledReason, .s1mAccessCache, .groveConfigCache)'

LOG_FILE=""
log()  { printf '%s\n' "$*"; [ -n "$LOG_FILE" ] && printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*" >> "$LOG_FILE"; return 0; }
warn() { log "AVISO: $*"; }
die()  { log "ERROR: $*"; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }

os_kind() {
  case "$(uname -s)" in
    Darwin) echo mac ;;
    Linux)  echo linux ;;
    *)      echo other ;;
  esac
}

# Rutas estándar
claude_dir()  { printf '%s' "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"; }
claude_json() {
  if [ -n "${CLAUDE_CONFIG_DIR:-}" ] && [ -f "$CLAUDE_CONFIG_DIR/.claude.json" ]; then
    printf '%s' "$CLAUDE_CONFIG_DIR/.claude.json"
  else
    printf '%s' "$HOME/.claude.json"
  fi
}
app_dir() {
  case "$(os_kind)" in
    mac)   printf '%s' "$HOME/Library/Application Support/Claude" ;;
    linux) printf '%s' "${XDG_CONFIG_HOME:-$HOME/.config}/Claude" ;;
    *)     printf '%s' "" ;;
  esac
}

# Nombre seguro para carpetas/archivos (Windows y macOS)
safe_name() {
  printf '%s' "$1" | tr -d '\000-\037' | sed -e 's#[/\\:*?"<>|]#_#g' -e 's/^[ .]*//' -e 's/[ .]*$//' | cut -c1-80
}

b64d() { [ "$1" = "-" ] && return 0; printf '%s' "$1" | base64 --decode 2>/dev/null || printf '%s' "$1" | base64 -D 2>/dev/null; }

sha256() {
  if have shasum; then shasum -a 256 "$1" | awk '{print $1}'
  elif have sha256sum; then sha256sum "$1" | awk '{print $1}'
  else echo "n/d"; fi
}

# zip_dir <origen> <zip destino> <incluir_carpeta_padre: 1|0>
# Copia a una carpeta temporal para limpiar marcadores (.in_use, .DS_Store) sin tocar el origen.
zip_dir() {
  src="${1%/}"; dst="$2"; keep="$3"
  stage="$(mktemp -d)" || die "mktemp falló"
  cp -Rp "$src" "$stage/" || { rm -rf "$stage"; die "No se pudo copiar $src"; }
  find "$stage" \( -name '.in_use' -o -name '.DS_Store' \) -exec rm -rf {} + 2>/dev/null
  item="$stage/$(basename "$src")"
  rm -f "$dst"
  if [ "$(os_kind)" = mac ] && have ditto; then
    if [ "$keep" = 1 ]; then ditto -c -k --norsrc --keepParent "$item" "$dst"
    else ditto -c -k --norsrc "$item" "$dst"; fi
  elif have zip; then
    if [ "$keep" = 1 ]; then (cd "$stage" && zip -rqX "$dst" "$(basename "$src")")
    else (cd "$item" && zip -rqX "$dst" .); fi
  else
    rm -rf "$stage"; die "No hay 'zip' ni 'ditto' para comprimir."
  fi
  rm -rf "$stage"
}

