# Checklist: lo que vive en la nube (no se migra por script)

claude.ai no tiene una API pública para exportar o importar proyectos, skills ni plugins de una cuenta. Por eso estos pasos se hacen a mano. `prepare-cloud` deja cada pieza lista para arrastrar y soltar.

## Antes de cerrar la cuenta vieja
- [ ] **Exportar los datos de claude.ai**: Settings → Privacy → *Export data*. El link llega por mail. Guardá el `.zip`.
- [ ] Correr `prepare-cloud` con ese export: `./prepare-cloud.sh --export <zip>` o `.\prepare-cloud.ps1 -Export <zip>`.
- [ ] Anotar los **conectores** activos en Settings → Connectors (M365, Azure DevOps, GitHub, Google, etc.).
- [ ] Anotar las **instrucciones personales / estilo** de Settings → Profile. No vienen en el export de proyectos.
- [ ] Descargar los **artifacts** que quieras conservar. Los links publicados de la cuenta vieja dejan de ser tuyos.

## En la cuenta corporativa
- [ ] **Plugins propios** ("My Uploads"): subir cada `.zip` de `CloudReload/Plugins/` (Customize → Plugins → Upload).
- [ ] **Plugins del catálogo de Anthropic** (engineering, operations, productivity…): volver a activarlos desde el catálogo. No hace falta subirlos.
- [ ] **Skills**: subir cada `.zip` de `CloudReload/Skills/` (Settings → Capabilities → Skills → Upload). Los marcados como "Anthropic" ya existen en la cuenta.
- [ ] **Proyectos**: por cada carpeta de `CloudReload/Proyectos/`, crear el proyecto, pegar `instrucciones.txt` y arrastrar los archivos de `conocimiento/`.
- [ ] **Conectores**: reconectarlos con las credenciales corporativas.
- [ ] **MCP servers con secretos** (`<<REDACTED>>` en `INVENTARIO.md`): volver a cargar los tokens corporativos.
- [ ] Ir marcando el avance en `CloudReload/AVANCE.md`.

## Riesgos a validar con IT de la empresa
- La organización corporativa puede **bloquear** plugins o skills personales, MCP no aprobados o conectores (managed settings).
- Los plugins internos de otra empresa (por ejemplo, los que mencionan a un cliente o a un partner) pueden requerir aprobación de compliance antes de subirse a la nueva org.
- Los chats (conversaciones) **no se pueden importar**: quedan solo como consulta en el export.
