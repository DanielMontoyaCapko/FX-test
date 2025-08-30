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

export type AdminDashboardData = {
  fecha: string;
  periodo: string;
  totalUsers: number;
  totalProducts: number;
  totalContracts: number;
  pendingKyc: number;
  financialKpis?: {
    totalAUM: number;
    newCapitalMonth: number;
    withdrawnCapitalMonth: number;
    netCapitalGrowth: number;
    averageInvestment: number;
    activeClients: number;
    clientRetention: number;
    monthlyEvolution: Array<{
      month: string;
      aum: number;
      newCapital: number;
      withdrawals: number;
      retention: number;
    }>;
  };
  kycStats: Array<{ name: string; value: number; color: string }>;
  contractsStats: Array<{ name: string; value: number; color: string }>;
};

export async function generateAdminStatementPDF(data: AdminDashboardData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "A4" });

  let y = await drawBrandHeader(doc, "Reporte Administrativo", data.periodo);
  y += 10;

  // Información general del reporte
  sectionHeading(doc, "Información del Reporte", y);
  y += 24;
  kv(doc, "Fecha de Generación", data.fecha, 40, y);
  kv(doc, "Período", data.periodo, 220, y);
  kv(doc, "Tipo de Reporte", "Dashboard Administrativo", 400, y);
  y += 56;

  // Métricas generales
  sectionHeading(doc, "Métricas Generales del Sistema", y);
  y += 24;
  kv(doc, "Usuarios Totales", data.totalUsers.toString(), 40, y);
  kv(doc, "Productos Totales", data.totalProducts.toString(), 220, y);
  kv(doc, "Contratos Totales", data.totalContracts.toString(), 400, y);
  y += 40;
  kv(doc, "KYC Pendientes", data.pendingKyc.toString(), 40, y);
  y += 56;

  // Distribución de KYC
  sectionHeading(doc, "Estado de Verificaciones KYC", y);
  y += 24;
  
  doc.setFontSize(10);
  setTextRGB(doc, [255, 255, 255]);
  setFillRGB(doc, BRAND.primary600);
  doc.rect(40, y - 12, 520, 24, "F");
  doc.text("Estado", 56, y + 2);
  doc.text("Cantidad", 320, y + 2);
  doc.text("Porcentaje", 420, y + 2);

  const rowH = 24;
  doc.setFontSize(11);
  setTextRGB(doc, [15, 23, 42]);
  
  const totalKyc = data.kycStats.reduce((sum, item) => sum + item.value, 0);
  data.kycStats.forEach((row, idx) => {
    const ry = y + rowH * (idx + 1);
    if (idx % 2 === 0) {
      setFillRGB(doc, [240, 253, 244]);
      doc.rect(40, ry - 16, 520, rowH, "F");
    }
    const percentage = totalKyc > 0 ? ((row.value / totalKyc) * 100).toFixed(1) : "0.0";
    doc.text(row.name, 56, ry);
    doc.text(row.value.toString(), 320, ry);
    doc.text(`${percentage}%`, 420, ry);
  });

  y += rowH * data.kycStats.length + 40;

  // Distribución de Contratos
  sectionHeading(doc, "Estado de Contratos", y);
  y += 24;
  
  doc.setFontSize(10);
  setTextRGB(doc, [255, 255, 255]);
  setFillRGB(doc, BRAND.primary600);
  doc.rect(40, y - 12, 520, 24, "F");
  doc.text("Estado", 56, y + 2);
  doc.text("Cantidad", 320, y + 2);
  doc.text("Porcentaje", 420, y + 2);

  doc.setFontSize(11);
  setTextRGB(doc, [15, 23, 42]);
  
  const totalContracts = data.contractsStats.reduce((sum, item) => sum + item.value, 0);
  data.contractsStats.forEach((row, idx) => {
    const ry = y + rowH * (idx + 1);
    if (idx % 2 === 0) {
      setFillRGB(doc, [240, 253, 244]);
      doc.rect(40, ry - 16, 520, rowH, "F");
    }
    const percentage = totalContracts > 0 ? ((row.value / totalContracts) * 100).toFixed(1) : "0.0";
    doc.text(row.name, 56, ry);
    doc.text(row.value.toString(), 320, ry);
    doc.text(`${percentage}%`, 420, ry);
  });

  y += rowH * data.contractsStats.length + 40;

  // KPIs Financieros (si están disponibles)
  if (data.financialKpis) {
    // Verificar si necesitamos una nueva página
    if (y > 650) {
      doc.addPage();
      y = 40;
    }

    sectionHeading(doc, "KPIs Financieros", y);
    y += 24;
    kv(doc, "Capital Total Gestionado", eur(data.financialKpis.totalAUM), 40, y);
    kv(doc, "Clientes Activos", data.financialKpis.activeClients.toString(), 220, y);
    kv(doc, "Inversión Promedio", eur(data.financialKpis.averageInvestment), 400, y);
    y += 40;
    kv(doc, "Nuevo Capital del Mes", eur(data.financialKpis.newCapitalMonth), 40, y);
    kv(doc, "Capital Retirado del Mes", eur(data.financialKpis.withdrawnCapitalMonth), 220, y);
    kv(doc, "Crecimiento Neto", eur(data.financialKpis.netCapitalGrowth), 400, y);
    y += 40;
    kv(doc, "Retención de Clientes", `${data.financialKpis.clientRetention.toFixed(1)}%`, 40, y);
    y += 56;

    // Evolución mensual (últimos 6 meses)
    if (data.financialKpis.monthlyEvolution && data.financialKpis.monthlyEvolution.length > 0) {
      sectionHeading(doc, "Evolución Mensual", y);
      y += 24;

      doc.setFontSize(9);
      setTextRGB(doc, [255, 255, 255]);
      setFillRGB(doc, BRAND.primary600);
      doc.rect(40, y - 12, 520, 24, "F");
      doc.text("Mes", 56, y + 2);
      doc.text("AUM", 156, y + 2);
      doc.text("Nuevo Capital", 256, y + 2);
      doc.text("Retiros", 356, y + 2);
      doc.text("Retención %", 456, y + 2);

      doc.setFontSize(10);
      setTextRGB(doc, [15, 23, 42]);
      
      data.financialKpis.monthlyEvolution.slice(-6).forEach((row, idx) => {
        const ry = y + rowH * (idx + 1);
        if (idx % 2 === 0) {
          setFillRGB(doc, [240, 253, 244]);
          doc.rect(40, ry - 16, 520, rowH, "F");
        }
        doc.text(row.month, 56, ry);
        doc.text(eur(row.aum), 156, ry);
        doc.text(eur(row.newCapital), 256, ry);
        doc.text(eur(row.withdrawals), 356, ry);
        doc.text(`${row.retention.toFixed(1)}%`, 456, ry);
      });
    }
  }

  drawFooter(doc);
  doc.save(`reporte-admin-nakama-${new Date().toISOString().slice(0, 10)}.pdf`);
}