/**
 * Reporte Semanal de Casas de Vida — Centro Cristiano Misión Global Maracay
 *
 * Este script recibe los reportes enviados desde el formulario web (index.html)
 * y los guarda en la hoja de cálculo:
 *   1. Una pestaña por TIPO de Casa de Vida (Casas Grupales / Familiares / Empresariales)
 *      — es la fuente de datos "cruda", cada envío agrega una fila.
 *   2. Una pestaña por RED ("Red 1"..."Red 6") — se reconstruye automáticamente en
 *      cada envío, mostrando solo las casas de esa red, agrupadas por tipo.
 *   3. Una pestaña "Resumen Mensual" — totales por Red y por Mes, también se
 *      reconstruye automáticamente en cada envío.
 *
 * INSTALACIÓN: ver README.md en la raíz del proyecto.
 */

const SHEET_NAMES = {
  grupal: "Casas Grupales",
  familiar: "Casas Familiares",
  empresarial: "Casas Empresariales"
};

const REDES_LIST = ["Red 1", "Red 2", "Red 3", "Red 4", "Red 5", "Red 6"];

const REPORT_TIMEZONE = "America/Caracas";

/**
 * Ventana de tiempo para reportar (hora de Venezuela, sin importar la
 * configuración regional del script): abierto jueves, viernes, sábado y
 * domingo todo el día, y lunes hasta antes de las 10:00 a.m. Cerrado el
 * resto del lunes, y todo el martes y miércoles. Esta es la validación
 * "real" — el candado que se ve en el formulario es solo una ayuda visual
 * basada en la hora del celular de cada líder, que se podría manipular;
 * esta función es la que de verdad decide si el reporte se guarda o no.
 */
function isReportWindowOpen() {
  const now = new Date();
  const dow = Number(Utilities.formatDate(now, REPORT_TIMEZONE, "u")); // 1=Lun ... 7=Dom
  if (dow === 4 || dow === 5 || dow === 6 || dow === 7) return true; // Jue, Vie, Sáb, Dom
  if (dow === 1) {
    const hh = Number(Utilities.formatDate(now, REPORT_TIMEZONE, "H"));
    const mm = Number(Utilities.formatDate(now, REPORT_TIMEZONE, "m"));
    return (hh * 60 + mm) < 600; // antes de las 10:00 a.m.
  }
  return false; // Martes y Miércoles
}

const MES_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Encabezado de columna -> clave del payload enviado por el formulario.
// El orden de este arreglo define el orden de las columnas en la hoja.
const HEADERS_BY_TYPE = {
  grupal: [
    ["Fecha reportada", "fecha"], ["Red", "red"], ["Líder de Red", "liderRed"],
    ["Casa de Vida", "casaVida"], ["Líder de Vida", "liderNombre"],
    ["Hermanos", "m_hermanos"], ["Nuevo Bautizado", "m_bautizados"], ["Discípulos", "m_discipulos"], ["Invitados", "m_invitados"],
    ["Niños", "m_ninos"], ["Ausentes", "m_ausentes"], ["Visitas a hogares", "m_visitasHogares"],
    ["Decisiones - Adultos", "d_adultos"], ["Decisiones - Niños", "d_ninos"], ["Decisiones - Reconciliados", "d_reconciliados"],
    ["Total Asistencia", "totalAsistencia"],
    ["Dominical - Hermanos", "dom_hermanos"], ["Dominical - Discípulos", "dom_discipulos"],
    ["Dominical - Invitados", "dom_invitados"], ["Dominical - Niños", "dom_ninos"],
    ["Misión Vida", "p_misionVida"], ["Consolidación", "p_consolidacion"], ["Pasos de Vida", "p_pasosVida"],
    ["V.E.A.", "a_vea"], ["Escuela de Vida", "a_escuelaVida"], ["Seminario", "a_seminario"],
    ["Líder de Vida presente", "l_liderVida"], ["Aprendiz presente", "l_aprendiz"],
    ["Maestro de Niños presente", "l_maestroNinos"], ["Anfitrión presente", "l_anfitrion"],
    ["Diezmo Bs", "fin_diezmoBs"], ["Ofrenda Bs", "fin_ofrendaBs"], ["Total Bs", "fin_totalBs"],
    ["Diezmo USD", "fin_diezmoUsd"], ["Ofrenda USD", "fin_ofrendaUsd"], ["Total USD", "fin_totalUsd"],
    ["Ref. Pago Móvil", "fin_pagoMovilRef"],
    ["Dirección", "nov_direccion"], ["Teléfono", "nov_telefono"], ["Día", "nov_dia"], ["Hora", "nov_hora"],
    ["Observaciones", "nov_observaciones"]
  ],
  familiar: [
    ["Fecha reportada", "fecha"], ["Red", "red"], ["Líder de Red", "liderRed"],
    ["Casa de Vida", "casaVida"], ["Guía de Vida", "liderNombre"],
    ["Adultos (+26)", "m_adultos26"], ["Jóvenes (13-25)", "m_jovenes"], ["Niños (1-12)", "m_ninos112"],
    ["Discípulos", "m_discipulos"], ["Invitados", "m_invitados"], ["Ausentes", "m_ausentes"],
    ["Decisiones - Adultos", "d_adultos"], ["Decisiones - Niños (+13 años)", "d_ninos"], ["Decisiones - Reconciliados", "d_reconciliados"],
    ["Total Asistencia", "totalAsistencia"],
    ["Dominical - Adultos", "dom_adultos"], ["Dominical - Jóvenes", "dom_jovenes"], ["Dominical - Niños", "dom_ninos"],
    ["Dominical - Discípulos", "dom_discipulos"], ["Dominical - Invitados", "dom_invitados"],
    ["Misión Vida", "p_misionVida"], ["Consolidación", "p_consolidacion"], ["Pasos de Vida", "p_pasosVida"],
    ["V.E.A.", "a_vea"], ["Escuela de Vida", "a_escuelaVida"], ["Seminario", "a_seminario"],
    ["Guía de Vida presente", "l_guiaVida"],
    ["Diezmo Bs", "fin_diezmoBs"], ["Ofrenda Bs", "fin_ofrendaBs"], ["Total Bs", "fin_totalBs"],
    ["Diezmo USD", "fin_diezmoUsd"], ["Ofrenda USD", "fin_ofrendaUsd"], ["Total USD", "fin_totalUsd"],
    ["Ref. Pago Móvil", "fin_pagoMovilRef"],
    ["Dirección", "nov_direccion"], ["Teléfono", "nov_telefono"], ["Día", "nov_dia"], ["Hora", "nov_hora"],
    ["Observaciones", "nov_observaciones"]
  ],
  empresarial: [
    ["Fecha reportada", "fecha"], ["Red", "red"], ["Líder de Red", "liderRed"],
    ["Casa de Vida", "casaVida"], ["Líder de Vida", "liderNombre"],
    ["Hermanos", "m_hermanos"], ["Nuevo Bautizado", "m_bautizados"], ["Discípulos", "m_discipulos"], ["Invitados", "m_invitados"],
    ["Ausentes", "m_ausentes"], ["Visitas a hogares", "m_visitasHogares"],
    ["Decisiones - Adultos", "d_adultos"], ["Decisiones - Reconciliados", "d_reconciliados"],
    ["Total Asistencia", "totalAsistencia"],
    ["Dominical - Hermanos", "dom_hermanos"], ["Dominical - Discípulos", "dom_discipulos"], ["Dominical - Invitados", "dom_invitados"],
    ["Misión Vida", "p_misionVida"], ["Consolidación", "p_consolidacion"], ["Pasos de Vida", "p_pasosVida"],
    ["V.E.A.", "a_vea"], ["Escuela de Vida", "a_escuelaVida"], ["Seminario", "a_seminario"],
    ["Líder de Vida presente", "l_liderVida"], ["Anfitrión presente", "l_anfitrion"],
    ["Diezmo Bs", "fin_diezmoBs"], ["Ofrenda Bs", "fin_ofrendaBs"], ["Total Bs", "fin_totalBs"],
    ["Diezmo USD", "fin_diezmoUsd"], ["Ofrenda USD", "fin_ofrendaUsd"], ["Total USD", "fin_totalUsd"],
    ["Ref. Pago Móvil", "fin_pagoMovilRef"],
    ["Dirección", "nov_direccion"], ["Teléfono", "nov_telefono"], ["Día", "nov_dia"], ["Hora", "nov_hora"],
    ["Observaciones", "nov_observaciones"]
  ]
};

function doPost(e) {
  try {
    if (!isReportWindowOpen()) {
      return ContentService.createTextOutput(JSON.stringify({
        result: "closed",
        message: "El tiempo para reportar ha finalizado. El reporte se reabre el jueves."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const tipo = data.tipo;
    const sheetName = SHEET_NAMES[tipo];
    if (!sheetName) throw new Error("Tipo de Casa de Vida inválido: " + tipo);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    const headerDefs = HEADERS_BY_TYPE[tipo];
    const headerLabels = ["Marca temporal"].concat(headerDefs.map(h => h[0]));

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headerLabels);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headerLabels.length).setFontWeight("bold").setBackground("#006C69").setFontColor("#FFFFFF");
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(headerLabels);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headerLabels.length).setFontWeight("bold").setBackground("#006C69").setFontColor("#FFFFFF");
    }

    const row = [new Date()].concat(headerDefs.map(h => {
      const value = data[h[1]];
      return value === undefined || value === null ? "" : value;
    }));
    sheet.appendRow(row);

    // Reconstruir la pestaña de la Red correspondiente y el resumen mensual.
    // Si algo falla aquí, el reporte YA quedó guardado arriba: no se debe
    // romper la respuesta de éxito al líder por un error en las vistas derivadas.
    try {
      syncRedSheet(data.red);
      rebuildMonthlySummary();
    } catch (syncErr) {
      Logger.log("Error al reconstruir pestañas de Red / Resumen Mensual: " + syncErr.message);
    }

    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "Reporte Casas de Vida API activa" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Busca el índice de columna (0-based) de una clave dentro de los headerDefs
 * de un tipo. Devuelve -1 si esa clave no existe para ese tipo (por ejemplo,
 * "d_ninos" no existe para empresarial).
 */
function fieldColIndex(tipo, key) {
  const i = HEADERS_BY_TYPE[tipo].findIndex(h => h[1] === key);
  return i === -1 ? -1 : i + 1; // +1 porque la columna 0 es "Marca temporal"
}

function toSafeDate(value) {
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Reconstruye por completo la pestaña de una Red específica, mostrando
 * (agrupadas por tipo de casa) solo las filas de las 3 pestañas fuente que
 * pertenecen a esa red. Se llama automáticamente después de cada envío.
 */
function syncRedSheet(redName) {
  if (!redName) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(redName);
  if (!sheet) {
    sheet = ss.insertSheet(redName);
  } else {
    sheet.clear();
  }

  const sectionTitles = { grupal: "CASAS GRUPALES", familiar: "CASAS FAMILIARES", empresarial: "CASAS EMPRESARIALES" };
  const sectionColors = { grupal: "#006C69", familiar: "#0097A3", empresarial: "#00C19E" };

  let currentRow = 1;

  ["grupal", "familiar", "empresarial"].forEach(tipo => {
    const headerDefs = HEADERS_BY_TYPE[tipo];
    const headerLabels = ["Marca temporal"].concat(headerDefs.map(h => h[0]));
    const srcSheet = ss.getSheetByName(SHEET_NAMES[tipo]);
    const redIdx = fieldColIndex(tipo, "red");
    const fechaIdx = fieldColIndex(tipo, "fecha");

    let rows = [];
    if (srcSheet && srcSheet.getLastRow() > 1) {
      const allData = srcSheet.getRange(2, 1, srcSheet.getLastRow() - 1, headerLabels.length).getValues();
      rows = allData.filter(r => r[redIdx] === redName);
      rows.sort((a, b) => {
        const da = toSafeDate(a[fechaIdx]);
        const db = toSafeDate(b[fechaIdx]);
        if (!da || !db) return 0;
        return db.getTime() - da.getTime(); // más reciente primero
      });
    }

    ensureSheetSize(sheet, currentRow + rows.length + 3, headerLabels.length);

    sheet.getRange(currentRow, 1, 1, headerLabels.length).setBackground(sectionColors[tipo]);
    sheet.getRange(currentRow, 1)
      .setValue(sectionTitles[tipo] + "  (" + rows.length + " reporte" + (rows.length === 1 ? "" : "s") + ")")
      .setFontWeight("bold").setFontColor("#FFFFFF").setFontSize(12);
    currentRow++;

    sheet.getRange(currentRow, 1, 1, headerLabels.length).setValues([headerLabels])
      .setFontWeight("bold").setBackground("#EAF6F5").setFontColor("#0B2E2C");
    currentRow++;

    if (rows.length > 0) {
      sheet.getRange(currentRow, 1, rows.length, headerLabels.length).setValues(rows);
      currentRow += rows.length;
    }

    currentRow += 2; // espacio antes de la siguiente sección
  });

  sheet.setFrozenRows(0);
  try { sheet.autoResizeColumns(1, Math.min(sheet.getMaxColumns(), 40)); } catch (e) { /* no crítico */ }
}

function ensureSheetSize(sheet, minRows, minCols) {
  if (sheet.getMaxRows() < minRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), minRows - sheet.getMaxRows());
  }
  if (sheet.getMaxColumns() < minCols) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), minCols - sheet.getMaxColumns());
  }
}

/**
 * Reconstruye por completo la pestaña "Resumen Mensual": una fila por
 * combinación de Red + Mes, con totales agregados de las 3 pestañas fuente.
 * Se llama automáticamente después de cada envío.
 */
function rebuildMonthlySummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Resumen Mensual");
  if (!sheet) {
    sheet = ss.insertSheet("Resumen Mensual");
  } else {
    sheet.clear();
  }

  const summary = {}; // "Red|yyyy-MM" -> { red, mesKey, mesLabel, reportes, asistencia, decisiones, bs, usd }

  ["grupal", "familiar", "empresarial"].forEach(tipo => {
    const srcSheet = ss.getSheetByName(SHEET_NAMES[tipo]);
    if (!srcSheet || srcSheet.getLastRow() < 2) return;

    const headerDefs = HEADERS_BY_TYPE[tipo];
    const headerLabels = ["Marca temporal"].concat(headerDefs.map(h => h[0]));
    const redIdx = fieldColIndex(tipo, "red");
    const fechaIdx = fieldColIndex(tipo, "fecha");
    const totalAsistIdx = fieldColIndex(tipo, "totalAsistencia");
    const dAdultosIdx = fieldColIndex(tipo, "d_adultos");
    const dNinosIdx = fieldColIndex(tipo, "d_ninos");
    const dReconIdx = fieldColIndex(tipo, "d_reconciliados");
    const diezmoBsIdx = fieldColIndex(tipo, "fin_diezmoBs");
    const ofrendaBsIdx = fieldColIndex(tipo, "fin_ofrendaBs");
    const diezmoUsdIdx = fieldColIndex(tipo, "fin_diezmoUsd");
    const ofrendaUsdIdx = fieldColIndex(tipo, "fin_ofrendaUsd");

    const data = srcSheet.getRange(2, 1, srcSheet.getLastRow() - 1, headerLabels.length).getValues();
    data.forEach(row => {
      const red = row[redIdx];
      if (!red) return;
      const d = toSafeDate(row[fechaIdx]);
      if (!d) return;

      const mesKey = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM");
      const mesLabel = MES_LABELS[d.getMonth()] + " " + d.getFullYear();
      const key = red + "|" + mesKey;

      if (!summary[key]) {
        summary[key] = { red: red, mesKey: mesKey, mesLabel: mesLabel, reportes: 0, asistencia: 0, decisiones: 0, bs: 0, usd: 0 };
      }
      const s = summary[key];
      s.reportes += 1;
      s.asistencia += Number(row[totalAsistIdx]) || 0;
      s.decisiones += (Number(row[dAdultosIdx]) || 0)
        + (dNinosIdx > -1 ? (Number(row[dNinosIdx]) || 0) : 0)
        + (Number(row[dReconIdx]) || 0);
      s.bs += (Number(row[diezmoBsIdx]) || 0) + (Number(row[ofrendaBsIdx]) || 0);
      s.usd += (Number(row[diezmoUsdIdx]) || 0) + (Number(row[ofrendaUsdIdx]) || 0);
    });
  });

  const rows = Object.keys(summary).map(k => summary[k]);
  rows.sort((a, b) => {
    if (a.red !== b.red) return a.red < b.red ? -1 : 1;
    return b.mesKey < a.mesKey ? -1 : (b.mesKey > a.mesKey ? 1 : 0);
  });

  const headers = ["Red", "Mes", "N° de Reportes", "Total Asistencia", "Total Decisiones de Fe", "Total Bs (Diezmo + Ofrenda)", "Total USD (Diezmo + Ofrenda)"];
  ensureSheetSize(sheet, rows.length + 1, headers.length);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground("#006C69").setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);

  if (rows.length > 0) {
    const out = rows.map(r => [r.red, r.mesLabel, r.reportes, r.asistencia, r.decisiones, r.bs, r.usd]);
    sheet.getRange(2, 1, out.length, headers.length).setValues(out);
  }
  try { sheet.autoResizeColumns(1, headers.length); } catch (e) { /* no crítico */ }
}

/**
 * Ejecuta esto UNA VEZ manualmente desde el editor de Apps Script
 * (menú desplegable de funciones → rebuildAllRedSheetsAndSummary → Ejecutar)
 * para generar las pestañas de Red y el Resumen Mensual a partir de reportes
 * que ya existían antes de instalar esta versión del script. Después de eso,
 * todo se mantiene al día automáticamente con cada nuevo envío.
 */
function rebuildAllRedSheetsAndSummary() {
  REDES_LIST.forEach(red => syncRedSheet(red));
  rebuildMonthlySummary();
}
