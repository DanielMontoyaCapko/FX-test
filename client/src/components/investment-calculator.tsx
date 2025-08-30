import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calculator, TrendingUp, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* ------------------------------ NUEVO PDF UX ------------------------------ */
const BRAND = {
  name: "Nakama&Partners",
  primary: [16, 185, 129] as [number, number, number], // #10B981
  primary600: [5, 150, 105] as [number, number, number], // #059669
  textDark: [15, 23, 42] as [number, number, number],
  textMuted: [107, 114, 128] as [number, number, number],
};

function setFillRGB(doc: any, [r, g, b]: [number, number, number]) {
  doc.setFillColor(r, g, b);
}
function setStrokeRGB(doc: any, [r, g, b]: [number, number, number]) {
  doc.setDrawColor(r, g, b);
}
function setTextRGB(doc: any, [r, g, b]: [number, number, number]) {
  doc.setTextColor(r, g, b);
}
function sectionHeading(doc: any, text: string, y: number) {
  doc.setFontSize(13);
  setTextRGB(doc, BRAND.primary);
  doc.text(text.toUpperCase(), 40, y);
  setStrokeRGB(doc, BRAND.primary);
  doc.setLineWidth(1);
  doc.line(40, y + 6, doc.internal.pageSize.getWidth() - 40, y + 6);
}
function kv(doc: any, label: string, value: string, x: number, y: number) {
  doc.setFontSize(10);
  setTextRGB(doc, BRAND.textMuted);
  doc.text(label, x, y);
  doc.setFontSize(12);
  setTextRGB(doc, BRAND.textDark);
  doc.text(value, x, y + 16);
}
async function drawBrandHeader(doc: any, title: string, subtitle?: string) {
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

  return barH + 18;
}
function drawFooter(doc: any) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  setTextRGB(doc, BRAND.textMuted);
  doc.setFontSize(9);
  const footer = `${BRAND.name} • Documento generado automáticamente • ${new Date().toLocaleString("es-ES")}`;
  doc.text(footer, pageW / 2, pageH - 24, { align: "center" });
}
function eur(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
function calcular(capitalInicial: number, tasaAnual: number, meses: number) {
  const tasaMensual = tasaAnual / 12;
  const valorFinal = capitalInicial * Math.pow(1 + tasaMensual, meses);
  const beneficio = valorFinal - capitalInicial;
  return { tasaMensual, valorFinal, beneficio };
}
async function generateSimulationPDF(params: { capitalInicial: number; tasaAnual: number; meses: number }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "A4" });

  let y = await drawBrandHeader(doc, "Simulación de Inversión", "Calculadora de interés compuesto");
  y += 10;

  // Parámetros
  sectionHeading(doc, "Parámetros", y);
  y += 24;
  kv(doc, "Capital Inicial", eur(params.capitalInicial), 40, y);
  kv(doc, "Tasa Anual", `${(params.tasaAnual * 100).toFixed(2)}%`, 220, y);
  kv(doc, "Plazo", `${params.meses} meses`, 400, y);
  y += 56;

  // Resultados
  const { tasaMensual, valorFinal, beneficio } = calcular(params.capitalInicial, params.tasaAnual, params.meses);
  sectionHeading(doc, "Resultados", y);
  y += 24;
  kv(doc, "Tasa Mensual", `${(tasaMensual * 100).toFixed(4)}%`, 40, y);
  kv(doc, "Beneficio Estimado", eur(beneficio), 220, y);
  kv(doc, "Valor Final Estimado", eur(valorFinal), 400, y);
  y += 56;

  // Hitos (trimestrales + último)
  sectionHeading(doc, "Hitos (trimestrales)", y);
  y += 24;

  doc.setFontSize(10);
  setTextRGB(doc, [255, 255, 255]);
  setFillRGB(doc, BRAND.primary600);
  doc.rect(40, y - 12, 520, 24, "F");
  doc.text("Mes", 56, y + 2);
  doc.text("Capital Estimado", 140, y + 2);
  doc.text("Beneficio Acumulado", 320, y + 2);

  setTextRGB(doc, BRAND.textDark);
  const rowH = 24;
  const tramos = [3, 6, 9, 12, 18, params.meses].filter((m, i, a) => m <= params.meses && a.indexOf(m) === i);
  tramos.forEach((mes, idx) => {
    const v = params.capitalInicial * Math.pow(1 + tasaMensual, mes);
    const b = v - params.capitalInicial;
    const ry = y + rowH * (idx + 1);
    if (idx % 2 === 0) {
      setFillRGB(doc, [240, 253, 244]);
      doc.rect(40, ry - 16, 520, rowH, "F");
    }
    doc.setFontSize(11);
    doc.text(String(mes), 56, ry);
    doc.text(eur(v), 140, ry);
    doc.text(eur(b), 320, ry);
  });

  drawFooter(doc);
  doc.save(`simulacion-nakama-${params.capitalInicial}-${params.meses}m-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ------------------------------ CALCULADORA UI ----------------------------- */

interface InvestmentCalculatorProps {
  onClose: () => void;
  onLogActivity?: (action: string) => void;
}

export default function InvestmentCalculator({ onClose, onLogActivity }: InvestmentCalculatorProps) {
  const [amount, setAmount] = useState("50000");
  const [term, setTerm] = useState("12");
  const [rate] = useState(9); // Fixed 9% rate

  const calculateProjection = () => {
    const principal = parseFloat(amount);
    const months = parseInt(term);
    const monthlyRate = rate / 100 / 12;

    const data: Array<{ month: number; compound: number; simple: number; difference: number }> = [];
    for (let month = 0; month <= months; month++) {
      const compoundAmount = principal * Math.pow(1 + monthlyRate, month);
      const simpleAmount = principal + principal * (rate / 100) * (month / 12);

      data.push({
        month,
        compound: Math.round(compoundAmount),
        simple: Math.round(simpleAmount),
        difference: Math.round(compoundAmount - simpleAmount),
      });
    }
    return data;
  };

  const projectionData = calculateProjection();
  const finalAmount = projectionData[projectionData.length - 1]?.compound || 0;
  const totalGain = finalAmount - parseFloat(amount);
  const gainPercentage = ((totalGain / parseFloat(amount)) * 100).toFixed(2);

  // Función para registrar nueva inversión calculada
  const handleCalculationChange = () => {
    if (onLogActivity) {
      const capitalInicial = parseFloat(amount);
      const meses = parseInt(term);
      onLogActivity(`Nueva inversión calculada: €${capitalInicial.toLocaleString()} por ${meses} meses`);
    }
  };

  // ⬇️ Solo cambiamos esta función para usar el NUEVO PDF
  const handleDownloadSimulation = async () => {
    try {
      const capitalInicial = parseFloat(amount);
      const meses = parseInt(term);
      const tasaAnual = 0.09; // 9% fijo
      await generateSimulationPDF({ capitalInicial, tasaAnual, meses });
      
      // Registrar descarga de simulación
      if (onLogActivity) {
        onLogActivity(`Simulación de inversión descargada: €${capitalInicial.toLocaleString()} por ${meses} meses`);
      }
    } catch (error) {
      console.error("Error generating simulation PDF:", error);
      alert("Error al generar la simulación. Inténtalo de nuevo.");
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const compound = payload[0].value;
      const gain = compound - parseFloat(amount);

      return (
        <div className="bg-black/95 p-4 rounded-lg border border-green-500/30 backdrop-blur-sm">
          <p className="text-white font-semibold mb-2">Mes {label}</p>
          <p className="text-green-400 font-bold">€{compound.toLocaleString()}</p>
          <p className="text-green-300 text-sm">+€{gain.toLocaleString()} ganancia</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-[#040505] border-silver-500/20 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Calculator className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Calculadora de Nueva Inversión</CardTitle>
              <p className="text-silver-100 text-sm">Simula tu próxima inversión con rentabilidad del 9% anual</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-silver-100 hover:text-white hover:bg-black/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Controls */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">Cantidad a Invertir</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver-100">€</span>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      handleCalculationChange();
                    }}
                    className="pl-8 bg-black/50 border-silver-500/20 text-white"
                    min="50000"
                    step="50000"
                  />
                </div>
                <p className="text-silver-100 text-xs">Mínimo: €50.000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="term" className="text-white">Plazo de Inversión</Label>
                <Select value={term} onValueChange={(value) => {
                  setTerm(value);
                  handleCalculationChange();
                }}>
                  <SelectTrigger className="bg-black/50 border-silver-500/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-silver-500/20">
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="18">18 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                    <SelectItem value="36">36 meses</SelectItem>
                    <SelectItem value="60">60 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Rentabilidad Anual</Label>
                <div className="flex items-center space-x-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-bold text-lg">9.0%</span>
                  <span className="text-silver-100 text-sm">Garantizada</span>
                </div>
              </div>

              {/* Results Summary */}
              <Card className="bg-black/70 border-silver-500/20">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-4">Resumen de Proyección</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-silver-100">Inversión inicial:</span>
                      <span className="text-white font-semibold">€{parseFloat(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-100">Plazo:</span>
                      <span className="text-white font-semibold">{term} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-100">Ganancia total:</span>
                      <span className="text-green-500 font-bold">+€{totalGain.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-silver-500/20 pt-3">
                      <span className="text-white font-semibold">Valor final:</span>
                      <span className="text-green-500 font-bold text-lg">€{finalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-100 text-sm">Rentabilidad total:</span>
                      <span className="text-green-400 text-sm">+{gainPercentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Evolución de la Inversión</h3>
              <div id="simulation-chart" className="h-96 bg-black/70 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={calculateProjection()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${value}m`} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      domain={[50000, 'dataMax']}
                      tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="compound"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleDownloadSimulation} className="bg-green-600 hover:bg-green-700 text-white px-8">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Simulación
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
