/**
 * Reporte Semanal de Casas de Vida — Centro Cristiano Misión Global Maracay
 *
 * Este script recibe los reportes enviados desde el formulario web (index.html)
 * y los guarda en la hoja de cálculo, en una pestaña distinta según el tipo
 * de Casa de Vida (Grupal / Familiar / Empresarial).
 *
 * INSTALACIÓN: ver README.md en la raíz del proyecto.
 */

const SHEET_NAMES = {
  grupal: "Casas Grupales",
  familiar: "Casas Familiares",
  empresarial: "Casas Empresariales"
};

// Encabezado de columna -> clave del payload enviado por el formulario.
// El orden de este arreglo define el orden de las columnas en la hoja.
const HEADERS_BY_TYPE = {
  grupal: [
    ["Fecha reportada", "fecha"], ["Red", "red"], ["Líder de Red", "liderRed"],
    ["Casa de Vida", "casaVida"], ["Líder de Vida", "liderNombre"],
    ["Bautizados", "m_bautizados"], ["Discípulos", "m_discipulos"], ["Invitados", "m_invitados"],
    ["Niños", "m_ninos"], ["Ausentes", "m_ausentes"], ["Visitas a hogares", "m_visitasHogares"],
    ["Decisiones - Adultos", "d_adultos"], ["Decisiones - Niños", "d_ninos"], ["Decisiones - Reconciliados", "d_reconciliados"],
    ["Total Asistencia", "totalAsistencia"],
    ["Dominical - Hermanos", "dom_hermanos"], ["Dominical - Invitados", "dom_invitados"], ["Dominical - Niños", "dom_ninos"],
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
    ["Decisiones - Adultos", "d_adultos"], ["Decisiones - Niños", "d_ninos"], ["Decisiones - Reconciliados", "d_reconciliados"],
    ["Total Asistencia", "totalAsistencia"],
    ["Dominical - Adultos", "dom_adultos"], ["Dominical - Jóvenes", "dom_jovenes"], ["Dominical - Niños", "dom_ninos"],
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
    ["Bautizados", "m_bautizados"], ["Discípulos", "m_discipulos"], ["Invitados", "m_invitados"],
    ["Ausentes", "m_ausentes"], ["Visitas a hogares", "m_visitasHogares"],
    ["Decisiones - Adultos", "d_adultos"], ["Decisiones - Reconciliados", "d_reconciliados"],
    ["Total Asistencia", "totalAsistencia"],
    ["Dominical - Hermanos", "dom_hermanos"], ["Dominical - Invitados", "dom_invitados"],
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
