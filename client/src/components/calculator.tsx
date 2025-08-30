import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Download, TrendingUp, Shield, Award } from "lucide-react";
import { useCalculator } from "@/hooks/use-calculator";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import logoImg from "@/assets/Logo-removeBG_1753542032142.png";

export default function Calculator() {
  const { state, updateAmount, updateYears, updateCompoundInterest, calculateResults } = useCalculator();
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const results = calculateResults();

  const generatePDF = () => {
    setIsGeneratingPDF(true);
    
    try {
      const doc = new jsPDF();
      
      // Add logo to PDF
      const logoWidth = 45;
      const logoHeight = 25;
      doc.addImage(logoImg, 'PNG', 145, 8, logoWidth, logoHeight);
      
      // Configure fonts and colors
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(52, 78, 65); // Green color
      
      // Header
      doc.text("NAKAMA&PARTNERS", 20, 25);
      doc.setFontSize(16);
      doc.setTextColor(52, 78, 65); // Green color
      doc.text("Simulación de Inversión Personalizada", 20, 40);
      
      // Separator line
      doc.setDrawColor(52, 78, 65);
      doc.setLineWidth(1);
      doc.line(20, 50, 190, 50);
      
      // Premium badge
      doc.setFillColor(52, 78, 65);
      doc.roundedRect(150, 35, 40, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('PREMIUM REPORT', 152, 42);
      
      // Investment details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const currentDate = new Date().toLocaleDateString('es-ES');
      doc.text(`Fecha de simulación: ${currentDate}`, 20, 65);
      
      // Investment parameters
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("PARÁMETROS DE INVERSIÓN", 20, 85);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`• Capital inicial: €${state.amount.toLocaleString()}`, 25, 100);
      doc.text(`• Plazo de inversión: ${state.years} ${state.years === 1 ? 'año' : 'años'}`, 25, 112);
      doc.text(`• Tasa de interés: 9% anual fijo`, 25, 124);
      doc.text(`• Tipo de interés: ${state.compoundInterest ? 'Compuesto' : 'Simple'}`, 25, 136);
      
      // Results section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("RESULTADOS DE LA SIMULACIÓN", 20, 150);
      
      // Results box
      doc.setFillColor(240, 248, 255); // Light blue background
      doc.rect(20, 155, 170, 45, 'F');
      doc.setDrawColor(0, 31, 63);
      doc.rect(20, 155, 170, 45, 'S');
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Capital inicial:`, 25, 168);
      doc.text(`€${results.initialAmount.toLocaleString()}`, 140, 168);
      
      doc.text(`Intereses generados:`, 25, 182);
      doc.setTextColor(0, 128, 0); // Green for earnings
      doc.text(`+€${results.interestGenerated.toLocaleString()}`, 140, 182);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(`Capital final:`, 25, 196);
      doc.setTextColor(0, 31, 63);
      doc.setFontSize(12);
      doc.text(`€${results.finalAmount.toLocaleString()}`, 140, 196);
      
      // Product information
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("CARACTERÍSTICAS DEL PRODUCTO", 20, 215);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("• Depósito bancario con rentabilidad fija del 9% anual", 25, 230);
      doc.text("• Capital protegido mediante contrato bancario", 25, 242);
      doc.text("• Renovación automática al vencimiento", 25, 254);
      doc.text("• Sin comisiones de apertura ni mantenimiento", 25, 266);
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("Esta simulación es orientativa. Rentabilidades pasadas no garantizan rentabilidades futuras.", 20, 290);
      doc.text("Nakama&Partners - Soluciones de inversión profesionales", 20, 300);
      
      // Generate filename with timestamp
      const filename = `simulacion-inversion-${Date.now()}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      toast({
        title: "PDF descargado",
        description: "Su simulación personalizada se ha descargado correctamente."
      });
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Inténtelo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = () => {
    generatePDF();
  };

  return (
    <section className="py-8 bg-transparent relative">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-8 relative">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-6">
            Calculadora Premium de <span className="text-green">Inversiones</span>
          </h2>
          <p className="text-xl text-silver-100 max-w-3xl mx-auto">
            Simula el crecimiento de tu patrimonio con nuestra herramienta exclusiva de proyección financiera.
          </p>
        </div>
        
        {/* Premium Calculator Container */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-black/80 to-gray-900/90 rounded-3xl border border-green/30 shadow-2xl overflow-hidden">
            {/* Premium Header Bar */}
            <div className="bg-gradient-to-r from-green/20 to-green/10 p-6 border-b border-green/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green/20 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-2xl font-bold text-white">Simulador Avanzado</h3>
                    <p className="text-green text-sm">Rentabilidad garantizada del 9% anual</p>
                  </div>
                </div>
                
                {/* Logo in Center */}
                <div className="flex justify-center">
                  <img 
                    src={logoImg} 
                    alt="Nakama&Partners Logo" 
                    className="h-16 w-auto filter drop-shadow-xl brightness-110 contrast-125"
                  />
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-silver-100">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green" />
                    <span>Capital Protegido</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-green" />
                    <span>Sin Comisiones</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculator Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Left Column - Input Controls */}
                <div className="space-y-8">
                  <div>
                    <Label className="block text-white font-semibold mb-4 text-lg">
                      💰 Cantidad a Invertir (€)
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="50000"
                        step="1000"
                        value={state.amount}
                        onChange={(e) => updateAmount(Number(e.target.value))}
                        className="w-full bg-black/50 text-white border-green/30 focus:border-green text-xl p-4 rounded-xl"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green font-semibold">
                        EUR
                      </div>
                    </div>
                    <p className="text-sm text-silver-100 mt-2">Inversión mínima: €50,000</p>
                  </div>
                  
                  <div>
                    <Label className="block text-white font-semibold mb-4 text-lg">
                      ⏱️ Plazo de Inversión ({state.years} {state.years === 1 ? 'año' : 'años'})
                    </Label>
                    <div className="px-4">
                      <Slider
                        value={[state.years]}
                        onValueChange={(value) => updateYears(value[0])}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-silver-100 mt-3">
                        <span>1 año</span>
                        <span>2 años</span>
                        <span>3 años</span>
                        <span>4 años</span>
                        <span>5 años</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-xl p-6 border border-green/20">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="compound-interest"
                        checked={state.compoundInterest}
                        onCheckedChange={updateCompoundInterest}
                        className="border-green data-[state=checked]:bg-green"
                      />
                      <Label htmlFor="compound-interest" className="text-white cursor-pointer font-semibold">
                        🚀 Activar Interés Compuesto
                      </Label>
                    </div>
                    <p className="text-sm text-silver-100 mt-2 ml-6">
                      Maximiza tu rentabilidad reinvirtiendo automáticamente los beneficios
                    </p>
                  </div>
                </div>
                
                {/* Right Column - Results */}
                <div className="bg-gradient-to-br from-green/10 to-green/5 rounded-2xl p-8 border border-green/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green" />
                    </div>
                    <h3 className="font-playfair text-2xl font-bold text-white">Proyección Financiera</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-black/30 rounded-xl p-6">
                      <div className="flex justify-between items-center">
                        <span className="text-silver-100 font-medium">Inversión Inicial:</span>
                        <span className="text-white font-bold text-lg">€{results.initialAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="bg-green/10 rounded-xl p-6 border border-green/20">
                      <div className="flex justify-between items-center">
                        <span className="text-silver-100 font-medium">Beneficios Generados:</span>
                        <span className="text-green font-bold text-lg">+€{results.interestGenerated.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green/20 to-green/10 rounded-xl p-6 border border-green/30">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-lg">Capital Final:</span>
                        <span className="text-green font-bold text-2xl">€{results.finalAmount.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-sm text-green font-semibold">
                          +{((results.interestGenerated / results.initialAmount) * 100).toFixed(1)}% de rentabilidad total
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="w-full mt-8 bg-gradient-to-r from-green to-green/80 text-white hover:from-green/90 hover:to-green/70 transition-all duration-300 py-4 text-lg font-semibold rounded-xl shadow-lg"
                  >
                    <Download className="mr-3 h-5 w-5" />
                    {isGeneratingPDF ? "Generando PDF Premium..." : "Descargar Informe Premium"}
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-silver-100">
                      Documento personalizado con tu proyección financiera exclusiva
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}