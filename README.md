# Reporte Semanal de Casas de Vida — Centro Cristiano Misión Global Maracay

Formulario web para que cada Líder de Vida (Casa Grupal, Familiar o Empresarial) reporte
semanalmente la información de su Casa de Vida. Los datos se guardan automáticamente en
una hoja de Google Sheets, organizados en pestañas por tipo de casa, por Red y en un
resumen mensual, para que los Líderes de Red puedan consultarlos.

## Contenido del proyecto

- `index.html` — El formulario (no necesita instalación, es un solo archivo).
- `apps-script/Code.gs` — Script que conecta el formulario con Google Sheets.
- `README.md` — Esta guía.

## Paso 1 — La hoja de Google Sheets

Hoja oficial del proyecto:
https://docs.google.com/spreadsheets/d/1e2ebw_UpmM4A5dOdca_hp15OiyBmIKIIH3Di7JDsMVg/edit

No necesitas crear las pestañas manualmente: el script las crea y actualiza solo, con
cada reporte que se envía:

- **Casas Grupales / Casas Familiares / Casas Empresariales** — una fila por cada reporte
  enviado (la fuente de datos original, nunca se borra ni se reordena).
- **Red 1 ... Red 6** — se reconstruye automáticamente después de cada envío. Muestra,
  agrupadas por tipo de casa, solo las filas que pertenecen a esa red, ordenadas de la más
  reciente a la más antigua. Es la pestaña que cada Líder de Red debe revisar: ahí ve toda
  la información completa de sus casas de vida, sin tener que filtrar nada.
- **Resumen Mensual** — también se reconstruye automáticamente. Una fila por cada
  combinación de Red + Mes, con: N° de reportes recibidos, Total de Asistencia, Total de
  Decisiones de Fe, Total Bs (diezmo + ofrenda) y Total USD (diezmo + ofrenda). Sirve para
  ver de un vistazo cómo va cada red mes a mes; se puede ordenar o filtrar por Red.

> Si ya tenías reportes guardados **antes** de instalar esta versión del script, esas filas
> no van a aparecer solas en "Red N" ni en "Resumen Mensual" hasta que se dispare una
> reconstrucción. Para generarlas una sola vez con el histórico existente: en el editor de
> Apps Script, selecciona la función **`rebuildAllRedSheetsAndSummary`** en el menú
> desplegable de funciones (arriba, junto al botón ▶) y dale **Ejecutar**. De ahí en
> adelante todo se mantiene al día solo, con cada nuevo envío.

## Paso 2 — Instalar el script (Apps Script)

1. En tu hoja de Google Sheets, ve a **Extensiones → Apps Script**.
2. Borra el contenido de `Code.gs` que aparece por defecto.
3. Copia y pega todo el contenido del archivo `apps-script/Code.gs` de este proyecto.
4. Guarda el proyecto (ícono de disquete o `Ctrl+S`). Puedes ponerle un nombre como
   "API Reporte Casas de Vida".

## Paso 3 — Publicar el script como aplicación web

1. En el editor de Apps Script, haz clic en **Implementar → Nueva implementación**.
2. Haz clic en el ícono de engranaje (⚙️) junto a "Seleccionar tipo" y elige **Aplicación web**.
3. Configura:
   - **Ejecutar como:** *Yo (tu correo)*
   - **Quién tiene acceso:** *Cualquier usuario*
4. Haz clic en **Implementar**.
5. Google te pedirá autorizar permisos: acepta y confirma (puede mostrar una advertencia
   de "app no verificada" porque es tu propio script — haz clic en "Avanzado" → "Ir a...
   (no seguro)" y autoriza).
6. Copia la **URL de la aplicación web** que aparece al final (termina en `/exec`).

> Cada vez que edites `Code.gs` en el futuro, debes crear una **nueva implementación**
> (o "Gestionar implementaciones → Editar → Nueva versión") para que los cambios se apliquen.

## Paso 4 — Conectar el formulario con tu hoja

1. Abre `index.html` con un editor de texto.
2. Busca esta línea cerca del inicio del `<script>`:
   ```js
   const SHEET_WEBAPP_URL = "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT";
   ```
3. Reemplaza el texto entre comillas por la URL que copiaste en el Paso 3. Debe quedar así:
   ```js
   const SHEET_WEBAPP_URL = "https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec";
   ```
4. Guarda el archivo.

## Paso 5 — Alojar el formulario (hosting)

Como elegiste manejar tú mismo el hosting, aquí tienes 3 opciones gratuitas y sencillas
para publicar `index.html` con un link que puedas compartir por WhatsApp a los líderes:

**Opción A — Netlify Drop (la más simple, sin cuenta técnica):**
1. Entra a https://app.netlify.com/drop
2. Arrastra el archivo `index.html` a la página.
3. En segundos obtienes un link público (puedes personalizarlo luego desde tu cuenta).

**Opción B — GitHub Pages** (si prefieres usar este mismo repositorio):
1. En GitHub, ve a **Settings → Pages** del repositorio.
2. En "Source" selecciona la rama donde está `index.html` y la carpeta raíz `/`.
3. Guarda; GitHub te dará un link tipo `https://usuario.github.io/reportecasasdevida/`.

**Opción C — Cualquier hosting o WordPress que ya tenga la iglesia:**
Solo sube el archivo `index.html` tal cual — no necesita servidor, base de datos ni
instalación adicional.

## Paso 6 — Poner el logo oficial

Actualmente el formulario usa un ícono placeholder (silueta de casa) en el encabezado
porque no se recibió el archivo del logo. Para poner el logo real:

1. Guarda tu logo como `assets/logo.png` (fondo transparente recomendado) en este proyecto.
2. En `index.html`, busca el bloque `<div class="logo-mono">` y reemplaza el `<svg>...</svg>`
   interior por:
   ```html
   <img src="assets/logo.png" alt="Logo CCMG" style="width:34px;height:34px;object-fit:contain;">
   ```

## Cómo verán la información los Líderes de Red

Cada Líder de Red debe abrir la pestaña con el nombre de su red (**Red 1** a **Red 6**):
ahí encuentra, organizadas por tipo de casa (Grupal / Familiar / Empresarial), todas las
filas que sus casas de vida han reportado, más recientes primero — no necesita filtrar
nada. Para una vista rápida de todas las redes por mes, usa la pestaña **Resumen Mensual**.

Si en algún momento quieres restringir el acceso (que cada líder de red solo pueda ver o
editar su propia pestaña), puedes usar **Datos → Hojas y rangos protegidos** en Google
Sheets para proteger cada pestaña de Red y compartirla solo con ese líder, o crear una
copia de solo lectura de la hoja completa y compartirla con todos.

## Verificación rápida

Antes de compartir el link con los líderes:
1. Abre el formulario y completa un reporte de prueba para cada tipo de casa (Grupal,
   Familiar, Empresarial).
2. Confirma que aparece la fila correspondiente en tu Google Sheet.
3. Borra las filas de prueba antes de poner el formulario en producción.
