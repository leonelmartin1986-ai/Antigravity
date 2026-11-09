# Migración de Claude Code + Cowork a una cuenta corporativa

Scripts para respaldar todo lo local antes de cambiar de cuenta en la **misma PC**, y para dejar lista la recarga manual de lo que vive en la nube.

| Qué | ¿Cómo se migra? |
|---|---|
| Skills, agents, commands, CLAUDE.md, settings, MCP, historial (`~/.claude`) | **Queda en la PC** al cambiar de cuenta. El backup sirve de seguro y `restore` de rollback. |
| Plugins propios subidos a claude.ai ("My Uploads") | `prepare-cloud` los empaqueta en `.zip` y se vuelven a subir. |
| Skills de claude.ai | `prepare-cloud` los empaqueta en `.zip` y se vuelven a subir. |
| Proyectos de claude.ai / Cowork | Export de claude.ai → `prepare-cloud` arma una carpeta por proyecto → se recargan a mano. |
| Chats, artifacts, conectores, plugins del catálogo de Anthropic | Manual. Ver [CHECKLIST_NUBE.md](CHECKLIST_NUBE.md). |

> claude.ai no expone una API para crear proyectos ni subir skills o plugins a una cuenta. Por eso el último paso es manual, aunque deja cada cosa lista para arrastrar y soltar.

## Seguridad
- **No se respaldan**: `.credentials.json`, `oauthAccount`, `userID` ni caches.
- Los tokens, API keys, PAT y headers `Authorization` dentro de los JSON quedan como `<<REDACTED>>`. Hay que volver a cargarlos con las credenciales corporativas.
- Al final se escanea el backup buscando secretos residuales. El historial (`projects/*.jsonl`) puede contener lo que hayas pegado en un chat: revisá el aviso antes de compartir el zip, o usá `--no-history` / `-NoHistory`.
- `restore` nunca pisa la sesión nueva ni un secreto real.

## Uso — Windows (PowerShell)
Si bajaste los archivos de internet, desbloquealos primero:

```powershell
Get-ChildItem .\claude-migration | Unblock-File
```

```powershell
cd .\claude-migration
powershell -ExecutionPolicy Bypass -File .\backup-claude.ps1
```

```powershell
powershell -ExecutionPolicy Bypass -File .\prepare-cloud.ps1 -Export "$HOME\Downloads\<export-claude>.zip"
```

```powershell
powershell -ExecutionPolicy Bypass -File .\restore-claude.ps1 -From "C:\ClaudeBackup\ClaudeBackup_<fecha>.zip" -DryRun
```

Se recomienda PowerShell 7 (`pwsh`), porque PowerShell 5.1 puede fallar con JSON muy grandes.

En Windows el backup se guarda por defecto en `C:\ClaudeBackup`, una ruta local y corta. No conviene guardarlo en el Escritorio ni en OneDrive por dos motivos:
- Windows limita las rutas a 260 caracteres, y los nombres de proyectos de Claude son largos.
- OneDrive sincronizaría el backup a la nube.

Para copiar, el script usa `robocopy`, que soporta rutas largas y sigue si un archivo falla. Al final informa cuántos archivos no se copiaron.

## Uso — macOS (Terminal)
Requiere `jq`. Viene con macOS 15 en adelante; si no lo tenés: `brew install jq`.

```bash
cd claude-migration && chmod +x *.sh
```

```bash
./backup-claude.sh
```

```bash
./prepare-cloud.sh --export ~/Downloads/<export-claude>.zip
```

```bash
./restore-claude.sh --from ~/Desktop/ClaudeBackup_<fecha>.zip --dry-run
```

## Secuencia recomendada
1. Con la **cuenta vieja** abierta, corré `backup` y después `prepare-cloud`. `prepare-cloud` necesita que los plugins y skills sincronizados estén en la PC.
2. Pedí el export en claude.ai (Settings → Privacy → Export data) y corré `prepare-cloud` con `--export` / `-Export`.
3. Cambiá de cuenta: en Claude Code, `/logout` y luego `/login`; en Claude Desktop/Cowork, cerrá sesión y entrá con la corporativa.
4. Verificá con `/status`, `/plugin` y `/mcp`. Si falta algo, corré `restore` (primero con `--dry-run` / `-DryRun`).
5. Seguí `CloudReload_<fecha>/AVANCE.md` para subir plugins, skills y proyectos.

## Opciones
| Script | Opciones |
|---|---|
| `backup` | `--dest DIR` / `-Dest` · `--no-history` / `-NoHistory` |
| `prepare-cloud` | `--export ZIP` / `-Export` · `--out DIR` / `-Out` · `--source DIR` / `-Source` (sirve la carpeta `claude-home` de un backup) |
| `restore` | `--from ZIP` / `-From` · `--dry-run` / `-DryRun` · `--overwrite` / `-Overwrite` · `--yes` / `-Yes` |

## Limitaciones conocidas
- **El formato del export de claude.ai no está documentado.** El parser es defensivo: detecta los campos por nombre y lo que no reconoce lo registra en `parser-warnings.log`, sin inventar contenido. Validalo en la primera corrida.
- **Las rutas internas de Cowork en Desktop no están documentadas.** El backup busca carpetas `skills`/`plugins` y solo informa lo que encuentra.
- **Las políticas de la organización corporativa** (managed settings) pueden bloquear plugins personales, MCP o conectores. Validalo con IT.
- **Los plugins y skills con contenido de otra empresa** pueden requerir autorización de compliance antes de subirse a la nueva org.
