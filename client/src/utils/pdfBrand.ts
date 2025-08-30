// Reutilizado del diseño de la calculadora
export const BRAND = {
  name: "Nakama&Partners",
  primary: [16, 185, 129] as [number, number, number],    // #10B981
  primary600: [5, 150, 105] as [number, number, number],  // #059669
  textDark: [15, 23, 42] as [number, number, number],
  textMuted: [107, 114, 128] as [number, number, number],
};

export function setFillRGB(doc: any, [r, g, b]: [number, number, number]) {
  doc.setFillColor(r, g, b);
}
export function setStrokeRGB(doc: any, [r, g, b]: [number, number, number]) {
  doc.setDrawColor(r, g, b);
}
export function setTextRGB(doc: any, [r, g, b]: [number, number, number]) {
  doc.setTextColor(r, g, b);
}
export function sectionHeading(doc: any, text: string, y: number) {
  doc.setFontSize(13);
  setTextRGB(doc, BRAND.primary);
  doc.text(text.toUpperCase(), 40, y);
  setStrokeRGB(doc, BRAND.primary);
  doc.setLineWidth(1);
  doc.line(40, y + 6, doc.internal.pageSize.getWidth() - 40, y + 6);
}
export function kv(doc: any, label: string, value: string, x: number, y: number) {
  doc.setFontSize(10);
  setTextRGB(doc, BRAND.textMuted);
  doc.text(label, x, y);
  doc.setFontSize(12);
  setTextRGB(doc, BRAND.textDark);
  doc.text(value, x, y + 16);
}
export async function drawBrandHeader(doc: any, title: string, subtitle?: string) {
  const pageW = doc.internal.pageSize.getWidth();
  const barH = 64;

  setFillRGB(doc, BRAND.primary600);
  doc.rect(0, 0, pageW, barH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextRGB(doc, [255, 255, 255]);
  doc.text(BRAND.name, 40, 24);

  doc.setFontSize(18);
  doc.text(title, 40, 44);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    setTextRGB(doc, [236, 253, 245]);
    doc.text(subtitle, 40, 58);
  }

  setStrokeRGB(doc, BRAND.primary);
  doc.setLineWidth(2);
  doc.line(40, barH + 6, pageW - 40, barH + 6);

  return barH + 18; // y inicial recomendado para el contenido
}
export function drawFooter(doc: any) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  setTextRGB(doc, BRAND.textMuted);
  doc.setFontSize(9);
  const footer = `${BRAND.name} • Documento generado automáticamente • ${new Date().toLocaleString("es-ES")}`;
  doc.text(footer, pageW / 2, pageH - 24, { align: "center" });
}
export function eur(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
