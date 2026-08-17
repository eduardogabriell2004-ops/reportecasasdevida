# Reporte Semanal de Casas de Vida — Centro Cristiano Misión Global Maracay

Formulario web para que cada Líder de Vida (Casa Grupal, Familiar o Empresarial) reporte
semanalmente la información de su Casa de Vida. Los datos se guardan automáticamente en
una hoja de Google Sheets, organizados en 3 pestañas según el tipo de casa, para que los
Líderes de Red puedan consultarlos.

## Contenido del proyecto

- `index.html` — El formulario (no necesita instalación, es un solo archivo).
- `apps-script/Code.gs` — Script que conecta el formulario con Google Sheets.
- `README.md` — Esta guía.

## Paso 1 — La hoja de Google Sheets

Hoja oficial del proyecto:
https://docs.google.com/spreadsheets/d/1e2ebw_UpmM4A5dOdca_hp15OiyBmIKIIH3Di7JDsMVg/edit

No necesitas crear las pestañas manualmente: el script las crea solo (Casas Grupales,
Casas Familiares, Casas Empresariales) la primera vez que alguien envía un reporte de
cada tipo.

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

Cada envío del formulario crea una fila nueva en la pestaña correspondiente de la hoja
(**Casas Grupales**, **Casas Familiares** o **Casas Empresariales**), con la Red y el
Líder de Red ya identificados en las primeras columnas. Puedes usar el **filtro de Google
Sheets** o crear una vista filtrada por Red para que cada líder de red vea solo sus casas.

## Verificación rápida

Antes de compartir el link con los líderes:
1. Abre el formulario y completa un reporte de prueba para cada tipo de casa (Grupal,
   Familiar, Empresarial).
2. Confirma que aparece la fila correspondiente en tu Google Sheet.
3. Borra las filas de prueba antes de poner el formulario en producción.
