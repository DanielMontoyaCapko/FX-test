import {
  BRAND,
  setFillRGB,
  setTextRGB,
  sectionHeading,
  kv,
  drawBrandHeader,
  drawFooter,
  eur,
} from "./pdfBrand";

export type StatementData = {
  cliente: string;
  periodo: string;          // Ej. "Enero 2025"
  fecha: string;            // Ej. new Date().toLocaleDateString("es-ES")
  capitalInvertido: number; // 50000
  rentabilidadAnualPct: number; // 9.0
  mesesTranscurridos: number;   // 3
  mesesTotales: number;         // 12
  beneficioAcumulado: number;   // 1125
  valorTotalActual: number;     // 51125
  detalleMensual: { label: string; importe: number }[]; // Ej. [{label:"Enero 2025", importe:375}, ...]
  proyeccion: { beneficioTotal: number; valorFinal: number }; // Ej. {4500, 54500}
};

export async function generateStatementPDF(data: StatementData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "A4" });

  let y = await drawBrandHeader(doc, "Estado de Cuenta", data.periodo);
  y += 10;

  // Datos del cliente
  sectionHeading(doc, "Datos del cliente", y);
  y += 24;
  kv(doc, "Cliente", data.cliente, 40, y);
  kv(doc, "Fecha", data.fecha, 220, y);
  kv(doc, "Período", data.periodo, 400, y);
  y += 56;

  // Resumen de inversión
  sectionHeading(doc, "Resumen de inversión", y);
  y += 24;
  const progreso = Math.round((data.mesesTranscurridos / data.mesesTotales) * 100);
  kv(doc, "Capital Invertido", eur(data.capitalInvertido), 40, y);
  kv(doc, "Rentabilidad Anual", `${data.rentabilidadAnualPct.toFixed(1)}%`, 220, y);
  kv(doc, "Progreso", `${data.mesesTranscurridos} de ${data.mesesTotales} (${progreso}%)`, 400, y);
  y += 40;
  kv(doc, "Beneficio Acumulado", eur(data.beneficioAcumulado), 40, y);
  kv(doc, "Valor Total Actual", eur(data.valorTotalActual), 220, y);
  y += 56;

  // Detalle del período (tabla)
  sectionHeading(doc, "Detalle de rendimiento", y);
  y += 24;

  doc.setFontSize(10);
  setTextRGB(doc, [255, 255, 255]);
  setFillRGB(doc, BRAND.primary600);
  doc.rect(40, y - 12, 520, 24, "F");
  doc.text("Mes", 56, y + 2);
  doc.text("Importe", 320, y + 2);

  const rowH = 24;
  doc.setFontSize(11);
  setTextRGB(doc, [15, 23, 42]); // textDark
  data.detalleMensual.forEach((row, idx) => {
    const ry = y + rowH * (idx + 1);
    if (idx % 2 === 0) {
      setFillRGB(doc, [240, 253, 244]); // fila alterna
      doc.rect(40, ry - 16, 520, rowH, "F");
    }
    doc.text(row.label, 56, ry);
    doc.text(eur(row.importe), 320, ry);
  });

  y += rowH * data.detalleMensual.length + 40;

  // Proyección
  sectionHeading(doc, "Proyección a fin de año", y);
  y += 24;
  kv(doc, "Beneficio Total Estimado", eur(data.proyeccion.beneficioTotal), 40, y);
  kv(doc, "Valor Final Estimado", eur(data.proyeccion.valorFinal), 220, y);

  drawFooter(doc);
  doc.save(`estado-cuenta-nakama-${new Date().toISOString().slice(0, 10)}.pdf`);
}
