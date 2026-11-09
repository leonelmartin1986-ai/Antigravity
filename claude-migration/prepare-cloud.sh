#!/usr/bin/env bash
# =============================================================================
# prepare-cloud.sh — Deja lista la recarga manual en claude.ai / Cowork (macOS/Linux)
#
#  1. Plugins propios ("My Uploads") sincronizados  -> CloudReload/Plugins/<plugin>.zip
#  2. Skills (locales + sincronizados)               -> CloudReload/Skills/<skill>.zip
#  3. Export de claude.ai (opcional)                 -> CloudReload/Proyectos/<proyecto>/
#  4. CloudReload/AVANCE.md con checklist por elemento
#
# Uso:  ./prepare-cloud.sh [--export export-claude.zip] [--out DIR] [--source DIR]
#   --export  Zip (o carpeta ya descomprimida) del export de claude.ai
#   --out     Destino (default: ~/Desktop o ~)
#   --source  Carpeta .claude a usar (default: ~/.claude; sirve también la
#             carpeta claude-home/ de un backup descomprimido)
#
# El parser del export es DEFENSIVO: el formato no está documentado, detecta
# campos por nombre y registra lo que no entiende en parser-warnings.log.
# =============================================================================
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib.sh
. "$HERE/lib.sh"

EXPORT=""; DEST=""; SRC="$(claude_dir)"
while [ $# -gt 0 ]; do
  case "$1" in
    --export) EXPORT="$2"; shift 2 ;;
    --out)    DEST="$2"; shift 2 ;;
    --source) SRC="$2"; shift 2 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) die "Parámetro desconocido: $1" ;;
  esac
done
have jq || die "Se necesita jq (macOS 15+ lo trae; si no: brew install jq)."
[ -z "$DEST" ] && { [ -d "$HOME/Desktop" ] && DEST="$HOME/Desktop" || DEST="$HOME"; }
mkdir -p "$DEST" && DEST="$(cd "$DEST" && pwd)" || die "No se puede usar $DEST"

OUT="$DEST/CloudReload_$(date '+%Y%m%d_%H%M%S')"
mkdir -p "$OUT/Plugins" "$OUT/Skills" "$OUT/Proyectos" || die "No se puede escribir en $DEST"
LOG_FILE="$OUT/prepare.log"
WARN="$OUT/parser-warnings.log"; : > "$WARN"
AV="$OUT/AVANCE.md"
{ echo "# Avance de recarga en la cuenta corporativa"; echo; echo "Marcá cada casilla a medida que avanzás."; echo; } > "$AV"
log "Origen: $SRC"; log "Destino: $OUT"

# --- 1. Plugins sincronizados ---------------------------------------------------
NP=0; echo "## Plugins" >> "$AV"
for m in "$SRC"/plugins/synced/*/manifest.json; do
  [ -f "$m" ] || continue
  base="$(dirname "$m")"
  for p in "$base"/*/; do
    [ -d "$p" ] || continue
    name="$(basename "$p")"
    kind="desconocido"; market="?"
    if [ -f "$base/$name.meta.json" ]; then
      kind="$(jq -r '.marketplace_kind // "desconocido"' "$base/$name.meta.json")"
      market="$(jq -r '.marketplace_name // "?"' "$base/$name.meta.json")"
    fi
    case "$kind" in
      anthropic_catalog)
        echo "- [ ] **$name** — catálogo Anthropic ($market): activarlo desde el catálogo, no se sube" >> "$AV" ;;
      *)
        if [ -f "$p/.claude-plugin/plugin.json" ] || [ -f "$p/plugin.json" ]; then
          zip_dir "${p%/}" "$OUT/Plugins/$name.zip" 0
          NP=$((NP+1))
          echo "- [ ] **$name** — subir \`Plugins/$name.zip\` ($market)" >> "$AV"
        else
          echo "- [ ] **$name** — sin plugin.json, revisar a mano: $p" >> "$AV"
          printf 'plugin sin manifiesto: %s\n' "$p" >> "$WARN"
        fi ;;
    esac
  done
done
log "Plugins empaquetados: $NP"

# --- 2. Skills -------------------------------------------------------------------
NS=0; echo >> "$AV"; echo "## Skills" >> "$AV"
for d in "$SRC"/skills/*/ "$SRC"/skills/synced/*/*/; do
  [ -f "$d/SKILL.md" ] || continue
  name="$(basename "$d")"
  [ -e "$OUT/Skills/$name.zip" ] && continue
  if [ -f "$d/LICENSE.txt" ] && grep -qiE 'Anthropic|Apache License' "$d/LICENSE.txt"; then
    echo "- [ ] **$name** — probablemente de Anthropic: verificar que ya exista en la cuenta nueva" >> "$AV"
    continue
  fi
  zip_dir "${d%/}" "$OUT/Skills/$name.zip" 1
  NS=$((NS+1))
  echo "- [ ] **$name** — subir \`Skills/$name.zip\`" >> "$AV"
done
log "Skills empaquetados: $NS"

# --- 3. Export de claude.ai ------------------------------------------------------
NPR=0; echo >> "$AV"; echo "## Proyectos" >> "$AV"
if [ -n "$EXPORT" ]; then
  if [ -d "$EXPORT" ]; then EXDIR="$EXPORT"
  elif [ -f "$EXPORT" ]; then
    EXDIR="$OUT/_export"; mkdir -p "$EXDIR"
    unzip -q -o "$EXPORT" -d "$EXDIR" || die "No se pudo descomprimir $EXPORT"
  else die "No existe $EXPORT"; fi

  FILES="$(find "$EXDIR" -type f -iname 'projects*.json' 2>/dev/null)"
  if [ -z "$FILES" ]; then
    printf 'No se encontró projects*.json. JSON presentes en el export:\n' >> "$WARN"
    find "$EXDIR" -type f -iname '*.json' | sed "s#^$EXDIR/#  #" >> "$WARN"
    warn "El export no trae projects*.json; ver $WARN"
    echo "- [ ] No se encontraron proyectos en el export (ver parser-warnings.log)" >> "$AV"
  fi

  # Normaliza cualquier variante razonable de esquema a líneas TSV con base64.
  # shellcheck disable=SC2016
  JQ_PARSE='
  def arr: if type=="array" then . elif type=="object" then ([.[] | select(type=="array")] | add // []) else [] end;
  def pick($ks): . as $o | (first($ks[] as $k | $o[$k] | select(. != null and . != "")) // null);
  def s: if . == null then "" elif type=="string" then . else tojson end;
  def b: s | @base64 | if . == "" then "-" else . end;
  def nz: if . == "" then "-" else . end;
  arr | to_entries[] | .key as $i | .value | select(type=="object") |
  ( pick(["name","title","project_name"]) ) as $name |
  ( pick(["prompt_template","instructions","custom_instructions","system_prompt","prompt"]) ) as $ins |
  ( pick(["docs","documents","files","knowledge","knowledge_files","attachments"]) // [] | if type=="array" then . else [] end ) as $docs |
  ( [ (if $name==null then "name" else empty end), (if $ins==null then "instrucciones" else empty end),
      (if ($docs|length)==0 then "docs" else empty end) ] | join(",") ) as $miss |
  ( ["P", ($i|tostring), ($name|b), (pick(["description","summary"])|b), ($ins|b),
     ($docs|length|tostring), ($miss|nz), (keys|join(",")|nz)] | @tsv ),
  ( $docs | to_entries[] | .key as $j | .value |
    if type=="object" then
      ["D", ($i|tostring), ($j|tostring),
       (pick(["filename","file_name","name","title"]) // "documento_\($j).txt" | b),
       (pick(["content","text","body","extracted_content"]) | b)] | @tsv
    else ["D", ($i|tostring), ($j|tostring), ("documento_\($j).txt"|b), b] | @tsv end )
  '
  printf '%s\n' "$FILES" | while IFS= read -r jf; do
    [ -n "$jf" ] || continue
    if ! jq -e . "$jf" >/dev/null 2>&1; then
      printf 'JSON inválido, ignorado: %s\n' "$jf" >> "$WARN"; continue
    fi
    jq -r "$JQ_PARSE" "$jf" 2>>"$WARN" | while IFS="$(printf '\t')" read -r t a b c d e f g; do
      if [ "$t" = P ]; then
        name="$(b64d "$b")"; [ -n "$name" ] || name="proyecto_$a"
        dir="$OUT/Proyectos/$(safe_name "$name")"
        [ -e "$dir" ] && dir="${dir}_$a"
        mkdir -p "$dir/conocimiento"; printf '%s' "$dir" > "$OUT/.p_$a"
        b64d "$c" > "$dir/descripcion.txt"
        b64d "$d" > "$dir/instrucciones.txt"
        [ "$f" != "-" ] && printf 'Proyecto "%s": campos vacíos o ausentes [%s]. Claves presentes: %s\n' "$name" "$f" "$g" >> "$WARN"
        echo "- [ ] **$name** ($e archivos) — [ ] creado  [ ] instrucciones  [ ] archivos" >> "$AV"
      elif [ "$t" = D ]; then
        dir="$(cat "$OUT/.p_$a" 2>/dev/null)"; [ -n "$dir" ] || continue
        fn="$(safe_name "$(b64d "$c")")"; [ -n "$fn" ] || fn="documento_$b.txt"
        [ -e "$dir/conocimiento/$fn" ] && fn="${b}_$fn"
        b64d "$d" > "$dir/conocimiento/$fn"
        [ -s "$dir/conocimiento/$fn" ] || printf 'Documento vacío o sin contenido en el export: %s/%s\n' "$(basename "$dir")" "$fn" >> "$WARN"
      fi
    done
  done
  rm -f "$OUT"/.p_*
  NPR="$(find "$OUT/Proyectos" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
  [ -n "$(find "$EXDIR" -type f -iname 'conversations*.json' 2>/dev/null)" ] && \
    echo "- Nota: el export trae conversaciones; no se pueden importar (solo consulta)." >> "$AV"
  [ "$OUT/_export" = "$EXDIR" ] && rm -rf "$EXDIR"
else
  echo "- [ ] Pendiente: correr de nuevo con --export <zip del export de claude.ai>" >> "$AV"
fi
log "Proyectos extraídos: $NPR"

[ -s "$WARN" ] && warn "Hubo observaciones del parser: $WARN" || rm -f "$WARN"
log ""
log "== Listo: $OUT =="
log "Abrí AVANCE.md y seguí la lista. Checklist completo: CHECKLIST_NUBE.md"
