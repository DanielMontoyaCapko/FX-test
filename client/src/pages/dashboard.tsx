import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KycFileUpload } from "@/components/KycFileUpload";
import {
  LogOut,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Plus,
  Package,
  User,
  Calculator,
  ArrowLeft,
  Camera,
  Filter,
  X,
  ShieldCheck,
  Banknote,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Hash,
  QrCode,
  FileText,
  Trash2,
  PlusCircle,
  Building2,
  Handshake,

} from "lucide-react";
import logoImg from "@/assets/Logo-removeBG_1752488347081.png";
import landscapeSvg from "@/assets/landscape.svg";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import CompoundInterestChart from "@/components/compound-interest-chart";
import InvestmentCalculator from "@/components/investment-calculator";
import { generateStatementPDF } from "@/utils/generateStatementPDF";

/* -------------------------------------------------------------------------- */
/*                                   UI bits                                  */
/* -------------------------------------------------------------------------- */

// --- Barra de progreso reutilizable ---
function ProgressBar({
  percent,
  monthsRemaining,
  noteWhenOver100 = false,
  className = "",
}: {
  percent: number;
  monthsRemaining?: number; 
  noteWhenOver100?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));

  const barColor =
    monthsRemaining !== undefined
      ? percent > 75
        ? "bg-red-500" // Meses 10-12 (75.1-100%)
        : percent > 50
        ? "bg-amber-400" // Meses 7-9 (50.1-75%)
        : "bg-emerald-500/80" // Meses 1-6 (0-50%)
      : "bg-emerald-500/80";

  const ringColor =
    monthsRemaining !== undefined
      ? monthsRemaining <= 1
        ? "ring-2 ring-red-500/40"
        : monthsRemaining <= 3
        ? "ring-2 ring-amber-400/40"
        : "ring-1 ring-emerald-400/20"
      : "ring-1 ring-emerald-400/20";

  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex items-center justify-between text-sm text-emerald-200/80 mb-2">
        <span>Progreso</span>
        <span className="text-emerald-50 font-medium">{Math.round(percent)}%</span>
      </div>

      <div
        className={`relative h-2 rounded-full bg-emerald-900/30 overflow-visible ${ringColor}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div className={`absolute left-0 top-0 h-2 rounded-full ${barColor}`} style={{ width: `${clamped}%` }} />
        {noteWhenOver100 && percent > 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-2 h-2 w-6 rounded-full bg-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
            aria-hidden
          />
        )}
      </div>

      {monthsRemaining !== undefined && (
        <p className="mt-2 text-xs text-emerald-200/70">
          {monthsRemaining <= 0 ? "Vencido" : monthsRemaining < 1 ? "< 1 mes" : `${monthsRemaining} meses restantes`}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             VISTA: DEPÓSITO                                */
/* -------------------------------------------------------------------------- */

type Metodo = "banco" | "crypto";
type PasoBanco = "Pendiente" | "Conciliado" | "Asignado";
type PasoCrypto = "Detectado" | "Confirmado" | "Asignado";

function DepositoView({
  setHasActiveDeposit,
  setActiveTab,
  setProfileActiveTab,
}: {
  setHasActiveDeposit: (v: boolean) => void;
  setActiveTab: (tab: string) => void;
  setProfileActiveTab: (tab: string) => void;
}) {
  const { user } = useAuth();

  // Consulta del estado KYC real (ya existe en el dashboard principal, la reutilizamos)
  const { data: kycData } = useQuery({
    queryKey: ["/api/kyc/me"],
    enabled: !!user,
  });

  // ---- Precondiciones de firma (simuladas) ----
  const [contratoMarco, setContratoMarco] = useState(false);
  const [perfilOk, setPerfilOk] = useState(false);
  const [docsProducto, setDocsProducto] = useState(false);
  
  // Estado KYC real basado en la consulta
  const currentKyc = kycData?.kyc;
  const kycOk = currentKyc?.status === "approved";
  const allPreOk = contratoMarco && kycOk && perfilOk && docsProducto;

  // ---- Depósito ----
  const [productoElegido, setProductoElegido] = useState<"fija" | "variable" | "mixto">("fija");
  const [metodo, setMetodo] = useState<Metodo | "">("");
  const [montoEur, setMontoEur] = useState<number>(50000);
  const [instruccionesGeneradas, setInstruccionesGeneradas] = useState(false);
  const [reciboSubido, setReciboSubido] = useState(false);
  const [bancoPaso, setBancoPaso] = useState<PasoBanco | null>(null);

  // Crypto fields
  const [tasaEurUsdt, setTasaEurUsdt] = useState<number>(1.0);
  const [cryptoNetwork, setCryptoNetwork] = useState("USDT ERC20");
  const [txHash, setTxHash] = useState("");
  const [capturaCrypto, setCapturaCrypto] = useState(false);
  const [cryptoPaso, setCryptoPaso] = useState<PasoCrypto | null>(null);

  const montoToUsdt = Number.isFinite(montoEur) ? +(montoEur / (tasaEurUsdt || 1)).toFixed(2) : 0;

  // Copys
  const puedeIniciarAportacion = allPreOk;
  const depositoBancoListo = montoEur >= 50000 && instruccionesGeneradas && reciboSubido;
  const depositoCryptoListo = montoEur >= 50000 && !!txHash && capturaCrypto;

  // Simulaciones de avance de estado
  const simularConciliado = () => setBancoPaso("Conciliado");
  const simularAsignado = () => {
    setBancoPaso("Asignado");
    setHasActiveDeposit(true);
  };
  const simularConfirmado = () => setCryptoPaso("Confirmado");
  const simularAsignadoCrypto = () => {
    setCryptoPaso("Asignado");
    setHasActiveDeposit(true);
  };

  // UI helper: Checklist
  const ChecklistItem = ({
    label,
    checked,
    onFix,
  }: {
    label: string;
    checked: boolean;
    onFix?: () => void;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {checked ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
        <span className="text-sm">{label}</span>
      </div>
      {!checked && (
        <Button size="sm" variant="outline" className="border-emerald-500/30 hover:bg-emerald-900/10" onClick={onFix}>
          Firmar/Completar ahora
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-emerald-50">Depósito</h1>
        <p className="text-emerald-200/80">Inicia una nueva aportación por banco o cripto</p>
      </div>

      {/* Condición previa de firma */}
      <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="text-emerald-50 font-semibold">Condición previa de firma (obligatoria)</h4>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-4">
            <ChecklistItem label="Contrato Marco de Servicios (firmado)" checked={contratoMarco} onFix={() => setContratoMarco(true)} />
            <ChecklistItem 
              label={`KYC/AML ${currentKyc?.status === "approved" ? "aprobado" : currentKyc?.status === "rejected" ? "rechazado" : "pendiente"}`} 
              checked={kycOk} 
              onFix={() => {
                if (!kycOk) {
                  // Navegar a la sección Perfil > Estado KYC
                  setActiveTab("perfil");
                  setProfileActiveTab("kyc");
                }
              }} 
            />
            <ChecklistItem label="Perfil de idoneidad completado" checked={perfilOk} onFix={() => setPerfilOk(true)} />
            <ChecklistItem
              label="Documentación específica del producto (Depósito Pignorado / Riesgos de Mercado)"
              checked={docsProducto}
              onFix={() => setDocsProducto(true)}
            />
          </div>
          {!allPreOk && (
            <p className="text-xs text-emerald-200/70 mt-3">
              Para iniciar una aportación, primero firma/activa los pasos pendientes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Paso 1: Nueva aportación */}
      <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
        <CardContent className="p-6 space-y-6">
          <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-200/80">Paso 1</p>
                <h5 className="text-emerald-50 font-semibold mb-3">Nueva aportación</h5>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={productoElegido === "fija" ? "default" : "outline"}
                    onClick={() => setProductoElegido("fija")}
                    className={productoElegido === "fija" ? "bg-emerald-600 hover:bg-emerald-500" : "border-emerald-500/30 hover:bg-emerald-900/10"}
                  >
                    Renta Fija 9%
                  </Button>
                  <Button
                    variant={productoElegido === "variable" ? "default" : "outline"}
                    onClick={() => setProductoElegido("variable")}
                    className={productoElegido === "variable" ? "bg-emerald-600 hover:bg-emerald-500" : "border-emerald-500/30 hover:bg-emerald-900/10"}
                  >
                    Variable
                  </Button>
                  <Button
                    variant={productoElegido === "mixto" ? "default" : "outline"}
                    onClick={() => setProductoElegido("mixto")}
                    className={productoElegido === "mixto" ? "bg-emerald-600 hover:bg-emerald-500" : "border-emerald-500/30 hover:bg-emerald-900/10"}
                  >
                    Mixto
                  </Button>
                </div>
              </div>
              <Button disabled={!puedeIniciarAportacion} className="rounded-xl">
                Nueva aportación
              </Button>
            </div>
            {!puedeIniciarAportacion && (
              <p className="text-xs text-emerald-200/70 mt-3">
                Botón deshabilitado: completa las firmas/validaciones para continuar.
              </p>
            )}
          </div>

          {/* Paso 2: Método */}
          <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-5">
            <p className="text-sm text-emerald-200/80">Paso 2</p>
            <h5 className="text-emerald-50 font-semibold mb-3">Elige método de depósito</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={metodo === "banco" ? "default" : "outline"}
                onClick={() => setMetodo("banco")}
                className={`rounded-xl justify-start ${metodo === "banco" ? "bg-emerald-600 hover:bg-emerald-500" : "border-emerald-500/30 hover:bg-emerald-900/10"}`}
              >
                <Banknote className="w-4 h-4 mr-2" />
                Cuenta bancaria
              </Button>
              <Button
                variant={metodo === "crypto" ? "default" : "outline"}
                onClick={() => setMetodo("crypto")}
                className={`rounded-xl justify-start ${metodo === "crypto" ? "bg-emerald-600 hover:bg-emerald-500" : "border-emerald-500/30 hover:bg-emerald-900/10"}`}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Cripto
              </Button>
            </div>
          </div>

          {/* Método: Banco */}
          {metodo === "banco" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-5">
                <h6 className="text-emerald-50 font-semibold mb-3">Importe y Instrucciones</h6>
                <div className="space-y-4">
                  <div>
                    <Label className="text-emerald-50">Importe (€) — mínimo 50.000</Label>
                    <Input
                      type="number"
                      min={0}
                      value={montoEur}
                      onChange={(e) => setMontoEur(parseFloat(e.target.value) || 0)}
                      className="bg-black/50 border-emerald-500/20 text-emerald-50"
                    />
                    {montoEur < 50000 && <p className="text-xs text-amber-400 mt-1">El importe mínimo es 50.000 €.</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="border-emerald-500/30 hover:bg-emerald-900/10"
                      onClick={() => setInstruccionesGeneradas(true)}
                    >
                      Generar instrucciones
                    </Button>
                    {instruccionesGeneradas && <Badge className="bg-emerald-500 text-black">Generadas</Badge>}
                  </div>

                  {instruccionesGeneradas && (
                    <div className="rounded-lg p-4 bg-black/40 border border-emerald-500/15 text-sm">
                      <p><span className="text-emerald-300">IBAN:</span> ES11 2222 3333 4444 5555 6666</p>
                      <p><span className="text-emerald-300">BIC:</span> ABCDESMMXXX</p>
                      <p><span className="text-emerald-300">Referencia:</span> NAKAMA-DEP-000123</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-5">
                <h6 className="text-emerald-50 font-semibold mb-3">Justificante y Confirmación</h6>
                <div className="space-y-4">
                  <div>
                    <Label className="text-emerald-50">Subir justificante (PDF/JPG/PNG)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setReciboSubido((e.target.files?.length ?? 0) > 0)}
                      className="bg-black/50 border-emerald-500/20 text-emerald-50"
                    />
                    {!reciboSubido && <p className="text-xs text-amber-400 mt-1">Obligatorio para continuar.</p>}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button disabled={!depositoBancoListo} onClick={() => setBancoPaso("Pendiente")} className="rounded-xl">
                      He realizado la transferencia
                    </Button>
                    <Button variant="outline" className="border-emerald-500/30 hover:bg-emerald-900/10">
                      Descargar certificado
                    </Button>
                  </div>

                  {/* Seguimiento */}
                  {bancoPaso && (
                    <div className="mt-4">
                      <p className="text-sm text-emerald-200/80 mb-2">Seguimiento</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`px-3 ${bancoPaso ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Pendiente</Badge>
                        <span>→</span>
                        <Badge className={`${bancoPaso === "Conciliado" || bancoPaso === "Asignado" ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Conciliado</Badge>
                        <span>→</span>
                        <Badge className={`${bancoPaso === "Asignado" ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Asignado</Badge>
                      </div>

                      {bancoPaso === "Pendiente" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={simularConciliado} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Simular conciliación
                          </Button>
                        </div>
                      )}
                      {bancoPaso === "Conciliado" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={simularAsignado} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Simular asignación
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Método: Crypto */}
          {metodo === "crypto" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-5">
                <h6 className="text-emerald-50 font-semibold mb-3">Importe, activo y red</h6>
                <div className="space-y-4">
                  <div>
                    <Label className="text-emerald-50">Importe en EUR — mínimo 50.000</Label>
                    <Input
                      type="number"
                      min={0}
                      value={montoEur}
                      onChange={(e) => setMontoEur(parseFloat(e.target.value) || 0)}
                      className="bg-black/50 border-emerald-500/20 text-emerald-50"
                    />
                    {montoEur < 50000 && <p className="text-xs text-amber-400 mt-1">El importe mínimo es 50.000 €.</p>}
                  </div>
                  <div>
                    <Label className="text-emerald-50">Tasa EUR → USDT (editable)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={tasaEurUsdt}
                      onChange={(e) => setTasaEurUsdt(parseFloat(e.target.value) || 1)}
                      className="bg-black/50 border-emerald-500/20 text-emerald-50"
                    />
                    <p className="text-xs text-emerald-200/70 mt-1">Conversión estimada: {montoToUsdt.toLocaleString("es-ES")} USDT</p>
                  </div>

                  <div>
                    <Label className="text-emerald-50">Activo y red</Label>
                    <Select value={cryptoNetwork} onValueChange={setCryptoNetwork}>
                      <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                        <SelectItem value="USDT ERC20">USDT (ERC20)</SelectItem>
                        <SelectItem value="USDT TRC20">USDT (TRC20)</SelectItem>
                        <SelectItem value="USDT BEP20">USDT (BEP20)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg p-4 bg-black/40 border border-emerald-500/15 text-sm">
                    <p className="mb-2"><span className="text-emerald-300">Dirección:</span> 0xNAKAMA...DEPOSIT</p>
                    <p className="mb-2"><span className="text-emerald-300">Memo (si aplica):</span> —</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-20 h-20 rounded-lg border border-emerald-500/20 bg-black/50 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-emerald-400" />
                      </div>
                      <Button size="sm" variant="outline" className="border-emerald-500/30 hover:bg-emerald-900/10">
                        Copiar dirección
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-5">
                <h6 className="text-emerald-50 font-semibold mb-3">Comprobante y Confirmación</h6>
                <div className="space-y-4">
                  <div>
                    <Label className="text-emerald-50 flex items-center gap-2"><Hash className="w-4 h-4" /> Hash de transacción</Label>
                    <Input
                      placeholder="0xabc123..."
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="bg-black/50 border-emerald-500/20 text-emerald-50"
                    />
                  </div>
                  <div>
                    <Label className="text-emerald-50">Subir captura/imagen del envío</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setCapturaCrypto((e.target.files?.length ?? 0) > 0)}
                      className="bg-black/50 border-emerald-500/20 text-emerald-50"
                    />
                    {(!txHash || !capturaCrypto) && <p className="text-xs text-amber-400 mt-1">Debes adjuntar hash + captura para continuar.</p>}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button disabled={!depositoCryptoListo} onClick={() => setCryptoPaso("Detectado")} className="rounded-xl">
                      He realizado el envío
                    </Button>
                    <Button variant="outline" className="border-emerald-500/30 hover:bg-emerald-900/10">
                      Descargar certificado
                    </Button>
                  </div>

                  {/* Seguimiento */}
                  {cryptoPaso && (
                    <div className="mt-4">
                      <p className="text-sm text-emerald-200/80 mb-2">Seguimiento</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`px-3 ${cryptoPaso ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Detectado</Badge>
                        <span>→</span>
                        <Badge className={`${cryptoPaso === "Confirmado" || cryptoPaso === "Asignado" ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Confirmado</Badge>
                        <span>→</span>
                        <Badge className={`${cryptoPaso === "Asignado" ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Asignado</Badge>
                      </div>

                      {cryptoPaso === "Detectado" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={simularConfirmado} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Simular confirmación
                          </Button>
                        </div>
                      )}
                      {cryptoPaso === "Confirmado" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={simularAsignadoCrypto} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Simular asignación
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               VISTA: RETIRO                                */
/* -------------------------------------------------------------------------- */

function RetiroView({
  hasActiveDeposit,
}: {
  hasActiveDeposit: boolean;
}) {
  // ---- Retiros ----
  const [retiroProducto, setRetiroProducto] = useState("Plazo fijo 9% - 175 días");
  const [retiroMetodo, setRetiroMetodo] = useState<Metodo | "">("");
  const [retiroTotal, setRetiroTotal] = useState(true);
  const [retiroImporte, setRetiroImporte] = useState<number>(1000);

  const [ibanList, setIbanList] = useState<{ iban: string; verified: boolean }[]>([
    { iban: "ES12 3456 7890 1234 5678 9012", verified: true },
  ]);
  const [walletList, setWalletList] = useState<{ name: string; address: string; verified: boolean }[]>([
    { name: "Mi USDT ERC20", address: "0xABCD...1234", verified: true },
  ]);
  const [ibanSeleccionado, setIbanSeleccionado] = useState<string>(ibanList[0]?.iban ?? "");
  const [walletSeleccionada, setWalletSeleccionada] = useState<string>(walletList[0]?.address ?? "");
  const [retiroPasoBanco, setRetiroPasoBanco] = useState<"Recibida" | "Programada" | "Transferida" | "Finalizada" | null>(null);
  const [retiroPasoCrypto, setRetiroPasoCrypto] = useState<"Recibida" | "TX enviada" | "Finalizada" | null>(null);

  // Añadir/validar IBAN/Wallet
  const handleAddIban = () => {
    const nuevo = prompt("Introduce un IBAN nuevo (formato ejemplo ES12 3456 7890 1234 5678 9012):");
    if (!nuevo) return;
    setIbanList((l) => [...l, { iban: nuevo, verified: false }]);
    setIbanSeleccionado(nuevo);
  };
  const handleVerifyIban = () => {
    setIbanList((l) => l.map((i) => (i.iban === ibanSeleccionado ? { ...i, verified: true } : i)));
  };

  const handleAddWallet = () => {
    const nombre = prompt("Nombre de la wallet (ej. 'Mi USDT TRC20'):");
    const dir = prompt("Dirección de la wallet:");
    if (!nombre || !dir) return;
    setWalletList((l) => [...l, { name: nombre, address: dir, verified: false }]);
    setWalletSeleccionada(dir);
  };
  const handleVerifyWallet = () => {
    setWalletList((l) => l.map((w) => (w.address === walletSeleccionada ? { ...w, verified: true } : w)));
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-emerald-50">Retiro</h1>
        <p className="text-emerald-200/80">Solicita un retiro a cuenta bancaria o wallet</p>
      </div>

      <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
        <CardContent className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {!hasActiveDeposit ? (
            <div className="text-emerald-200/80 text-sm">
              Aún no tienes aportaciones activas, por eso no hay retiros disponibles.
            </div>
          ) : (
            <>
              {/* Paso 1: Solicitar retiro */}
              <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-emerald-50">Producto</Label>
                    <Select value={retiroProducto} onValueChange={setRetiroProducto}>
                      <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                        <SelectItem value="Plazo fijo 9% - 175 días">Plazo fijo 9% - 175 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-emerald-50">Importe</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        disabled={retiroTotal}
                        min={0}
                        value={retiroImporte}
                        onChange={(e) => setRetiroImporte(parseFloat(e.target.value) || 0)}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                      <Button
                        type="button"
                        variant={retiroTotal ? "default" : "outline"}
                        onClick={() => setRetiroTotal((v) => !v)}
                        className={retiroTotal ? "bg-emerald-600 hover:bg-emerald-500" : "border-emerald-500/30 hover:bg-emerald-900/10"}
                      >
                        {retiroTotal ? "Total" : "Parcial"}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-emerald-50">Método</Label>
                    <Select value={retiroMetodo} onValueChange={(v) => setRetiroMetodo(v as Metodo)}>
                      <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                        <SelectValue placeholder="Selecciona método" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                        <SelectItem value="banco">Cuenta bancaria</SelectItem>
                        <SelectItem value="crypto">Cripto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Button className="rounded-xl">Solicitar retiro</Button>
                </div>
              </div>

              {/* Paso 2: Según método */}
              {retiroMetodo === "banco" && (
                <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-5">
                  <h6 className="text-emerald-50 font-semibold mb-3">Cuenta bancaria</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-emerald-50">IBAN verificado</Label>
                      <Select value={ibanSeleccionado} onValueChange={setIbanSeleccionado}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                          {ibanList.map((i) => (
                            <SelectItem key={i.iban} value={i.iban}>
                              {i.iban} {i.verified ? "✓" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" onClick={handleAddIban} className="border-emerald-500/30 hover:bg-emerald-900/10">
                          Añadir IBAN/Wallet
                        </Button>
                        {!ibanList.find((i) => i.iban === ibanSeleccionado)?.verified && (
                          <Button variant="outline" onClick={handleVerifyIban} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Verificar IBAN
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button className="rounded-xl" onClick={() => setRetiroPasoBanco("Recibida")}>
                        Confirmar retiro
                      </Button>
                    </div>
                  </div>

                  {/* Seguimiento */}
                  {retiroPasoBanco && (
                    <div className="mt-4">
                      <p className="text-sm text-emerald-200/80 mb-2">Seguimiento</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${retiroPasoBanco ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Recibida</Badge>
                        <span>→</span>
                        <Badge className={`${["Programada", "Transferida", "Finalizada"].includes(retiroPasoBanco) ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Programada</Badge>
                        <span>→</span>
                        <Badge className={`${["Transferida", "Finalizada"].includes(retiroPasoBanco) ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Transferida</Badge>
                        <span>→</span>
                        <Badge className={`${retiroPasoBanco === "Finalizada" ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Finalizada</Badge>
                      </div>

                      {retiroPasoBanco === "Recibida" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => setRetiroPasoBanco("Programada")} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Simular programación
                          </Button>
                        </div>
                      )}
                      {retiroPasoBanco === "Programada" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => setRetiroPasoBanco("Transferida")} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Simular transferencia
                          </Button>
                        </div>
                      )}
                      {retiroPasoBanco === "Transferida" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => setRetiroPasoBanco("Finalizada")} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Simular finalización
                          </Button>
                          <Button size="sm" variant="outline" className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Descargar justificante
                          </Button>
                        </div>
                      )}
                      {retiroPasoBanco === "Finalizada" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Descargar justificante
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {retiroMetodo === "crypto" && (
                <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-5">
                  <h6 className="text-emerald-50 font-semibold mb-3">Cripto</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-emerald-50">Wallet verificada</Label>
                      <Select value={walletSeleccionada} onValueChange={setWalletSeleccionada}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                          {walletList.map((w) => (
                            <SelectItem key={w.address} value={w.address}>
                              {w.name} — {w.address.slice(0, 8)}... {w.verified ? "✓" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" onClick={handleAddWallet} className="border-emerald-500/30 hover:bg-emerald-900/10">
                          Añadir IBAN/Wallet
                        </Button>
                        {!walletList.find((w) => w.address === walletSeleccionada)?.verified && (
                          <Button variant="outline" onClick={handleVerifyWallet} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Verificar Wallet
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button className="rounded-xl" onClick={() => setRetiroPasoCrypto("Recibida")}>
                        Confirmar retiro
                      </Button>
                    </div>
                  </div>

                  {/* Seguimiento */}
                  {retiroPasoCrypto && (
                    <div className="mt-4">
                      <p className="text-sm text-emerald-200/80 mb-2">Seguimiento</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${retiroPasoCrypto ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Recibida</Badge>
                        <span>→</span>
                        <Badge className={`${["TX enviada", "Finalizada"].includes(retiroPasoCrypto) ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>TX enviada</Badge>
                        <span>→</span>
                        <Badge className={`${retiroPasoCrypto === "Finalizada" ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}`}>Finalizada</Badge>
                      </div>

                      {retiroPasoCrypto === "Recibida" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => setRetiroPasoCrypto("TX enviada")} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Simular TX enviada
                          </Button>
                        </div>
                      )}
                      {retiroPasoCrypto === "TX enviada" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => setRetiroPasoCrypto("Finalizada")} className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Simular finalización
                          </Button>
                          <Button size="sm" variant="outline" className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Descargar justificante
                          </Button>
                        </div>
                      )}
                      {retiroPasoCrypto === "Finalizada" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="border-emerald-500/30 hover:bg-emerald-900/10">
                            Descargar justificante
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         VISTA: INFO DE PRODUCTO                            */
/* -------------------------------------------------------------------------- */

function ProductInfoView({ onBack, goToDeposit }: { onBack: () => void; goToDeposit: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="border-emerald-500/30 text-emerald-50 hover:bg-emerald-900/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-emerald-50">Plazo fijo 9% — 175 días</h2>
          <p className="text-emerald-200/80 text-sm">Información y condiciones del producto</p>
        </div>
      </div>

      <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Rentabilidad", value: "9.00% anual" },
              { title: "Plazo", value: "175 días" },
              { title: "Renovación", value: "No renovable" },
            ].map((b) => (
              <div key={b.title} className="bg-black/40 p-6 rounded-xl text-center border border-emerald-500/15">
                <p className="text-emerald-200/80 text-sm">{b.title}</p>
                <p className="text-emerald-50 font-bold text-xl">{b.value}</p>
              </div>
            ))}
          </div>

          <div className="text-emerald-200/80 space-y-2">
            <p>
              Depósito bancario con retorno fijo mediante préstamo participativo y cesión de la pignoración al cliente
              depositante. Importe mínimo recomendado 50.000&nbsp;€.
            </p>
            <p>Garantía bancaria del 100% del principal.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={goToDeposit} className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white">
              Iniciar Depósito
            </Button>
            <Button variant="outline" className="border-emerald-500/30 hover:bg-emerald-900/10">
              Descargar folleto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                DASHBOARD                                   */
/* -------------------------------------------------------------------------- */

type KycStatus = "Pendiente" | "Aprobado" | "Rechazado";

export default function Dashboard() {
  useScrollToTop();
  const [, setLocation] = useLocation();

  // ahora el menú tiene 6 entradas
  const [activeTab, setActiveTab] = useState<"inicio" | "perfil" | "productos" | "contratos" | "deposito" | "retiro">("inicio");

  const [showCalculator, setShowCalculator] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  // State for profile form data
  const [profileFormData, setProfileFormData] = useState({
    nombre: "",
    apellidos: "",
    telefono: "",
    fechaNacimiento: "",
    pais: "espana",
    direccion: "",
  });

  const [activeProductsView, setActiveProductsView] = useState<
    "default" | "mis-productos" | "historial" | "producto-detalle"
  >("default");
  const [activeProductsSubTab, setActiveProductsSubTab] = useState<"activos" | "completados" | "cancelados">("activos");

  // Simula si el usuario tiene una aportación activa (para permitir retiros)
  const [hasActiveDeposit, setHasActiveDeposit] = useState(true);

  const handleLogout = () => setLocation("/login");

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setProfilePhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDownloadStatement = async () => {
    try {
      await generateStatementPDF({
        cliente: "Juan Cliente",
        periodo: "Enero 2025",
        fecha: new Date().toLocaleDateString("es-ES"),
        capitalInvertido: 50000,
        rentabilidadAnualPct: 9.0,
        mesesTranscurridos: 3,
        mesesTotales: 12,
        beneficioAcumulado: 1125,
        valorTotalActual: 51125,
        detalleMensual: [
          { label: "Enero 2025", importe: 375 },
          { label: "Febrero 2025", importe: 375 },
          { label: "Marzo 2025", importe: 375 },
        ],
        proyeccion: { beneficioTotal: 4500, valorFinal: 54500 },
      });
      
      // Registrar actividad de descarga de estado de cuenta
      logActivity('Estado de cuenta descargado');
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF. Inténtalo de nuevo.");
    }
  };

  const handleCalculateInvestment = () => setShowCalculator(true);

  // Datos de la inversión (esto debería venir de la base de datos)
  const capitalInvertido = 50000;
  const mesesTranscurridos = 7;
  const mesesTotales = 24; // Ejemplo: contrato de 24 meses        
  
  // Cálculos de progreso
  const percentMeses = (mesesTranscurridos / Math.max(1, mesesTotales)) * 100;
  const mesesRestantes = Math.max(0, mesesTotales - mesesTranscurridos);
  
  // Para Capital Invertido: porcentaje de tiempo transcurrido del contrato
  const percentCapital = percentMeses; // Mismo cálculo basado en tiempo
  const beneficioEstimadoTotal = (capitalInvertido * 0.09 * mesesTotales) / 12; // 9% anual prorrateado
  
  // ===== KPIs =====
  const kpis = [
    { 
      title: "Capital Invertido", 
      value: `€${capitalInvertido.toLocaleString()}`, 
      change: `${Math.round(percentCapital)}% del período completado`, 
      trending: "up" as const 
    },
    { 
      title: "Progreso en Meses", 
      value: `Mes ${mesesTranscurridos} de ${mesesTotales}`, 
      change: `${Math.round(percentMeses)}% del período`, 
      trending: "up" as const 
    },
    { 
      title: "Beneficio Total Estimado", 
      value: `€${Math.round(beneficioEstimadoTotal).toLocaleString()}`, 
      change: "Al final del período", 
      trending: "up" as const 
    },
  ] as const;

  // Hook para obtener las actividades recientes del cliente (últimos 5 registros)
  const { data: recentActivityData } = useQuery({
    queryKey: ['/api/client/activity-logs'],
    enabled: true,
  });

  const recentActivityLogs = recentActivityData?.logs?.slice(0, 5) || [];

  // --- Mis productos (ejemplos) ---
  const productosActivos = [
    { nombre: "Fondo de Inversión Verde Europa", estado: "En curso", cantidad: "€5.000", fechaInicio: "12/05/2025", rentabilidad: "6.2% anual" },
    { nombre: "Plan Ahorro Flexible Plus", estado: "Activo", cantidad: "€2.500", fechaInicio: "01/07/2025", rentabilidad: "3.8% anual" },
    { nombre: "Depósito Estructurado Europa", estado: "En curso", cantidad: "€8.500", fechaInicio: "22/08/2025", rentabilidad: "5.1% anual" },
  ];

  const productosCompletados = [
    { nombre: "Bono Corporativo Energía Solar", estado: "Éxito", cantidad: "€10.000", fechaInicio: "10/03/2024", fechaFin: "10/03/2025", rentabilidadFinal: "5.5%" },
    { nombre: "Fondo Tecnología Asia", estado: "Éxito", cantidad: "€7.000", fechaInicio: "15/01/2023", fechaFin: "15/01/2024", rentabilidadFinal: "4.9%" },
    { nombre: "Letra del Tesoro España 12M", estado: "Éxito", cantidad: "€6.000", fechaInicio: "01/02/2023", fechaFin: "01/02/2024", rentabilidadFinal: "3.7%" },
  ];

  const productosCancelados = [
    { nombre: "Fondo Startups LatAm", estado: "Cancelado", cantidad: "€3.000", fechaCancelacion: "02/04/2025", motivo: "No se alcanzó el capital mínimo requerido" },
    { nombre: "Plan de Ahorro Salud", estado: "Cancelado", cantidad: "€1.500", fechaCancelacion: "20/06/2025", motivo: "Cancelado por el usuario antes del inicio" },
    { nombre: "Fondo Inmobiliario Urbano", estado: "Cancelado", cantidad: "€4.000", fechaCancelacion: "15/05/2025", motivo: "Documentación incompleta del cliente" },
  ];

  // ===== Helpers parsing =====
  const parseEuro = (s: string) => {
    const num = s.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const n = Number(num);
    return isNaN(n) ? 0 : n;
  };
  const parsePercent = (s?: string) => {
    if (!s) return 0;
    const num = s.replace(/[^\d,.-]/g, "").replace(",", ".");
    return Number(num) || 0;
  };
  const parseESDate = (s: string) => {
    const [d, m, y] = s.split("/").map((p) => parseInt(p, 10));
    return new Date(y, m - 1, d);
  };

  // ====== FILTROS: Mis Productos ======
  const [showMPFilters, setShowMPFilters] = useState(false);
  const [mpSort, setMpSort] = useState<"" | "cantidadDesc" | "cantidadAsc" | "fechaAsc" | "fechaDesc" | "rentDesc" | "rentAsc">("");
  const [mpFilters, setMpFilters] = useState({ search: "", cantidadMin: "", cantidadMax: "", fechaFrom: "", fechaTo: "", rentMin: "", rentMax: "" });


  // ====== FILTROS: Transacciones ======
  const [showTxFilters, setShowTxFilters] = useState(false);
  const [txSort, setTxSort] = useState<"" | "dateDesc" | "dateAsc" | "cantidadDesc" | "cantidadAsc">("");
  const [txFilters, setTxFilters] = useState({ search: "", tipo: "", estado: "", cantidadMin: "", cantidadMax: "", dateFrom: "", dateTo: "" });

  const transacciones = [
    { fecha: "2025-01-15", tipo: "Depósito", descripcion: "Depósito inicial producto 9%", cantidad: 50000, estado: "Completada" },
    { fecha: "2025-02-15", tipo: "Intereses", descripcion: "Intereses mensuales", cantidad: 375, estado: "Completada" },
    { fecha: "2025-03-10", tipo: "Retiro", descripcion: "Retiro parcial", cantidad: -1000, estado: "Pendiente" },
    { fecha: "2025-04-15", tipo: "Intereses", descripcion: "Intereses mensuales", cantidad: 375, estado: "Completada" },
  ];

  // ====== FILTROS: Contratos ======
  const [showCFilters, setShowCFilters] = useState(false);
  const [cSort, setCSort] = useState<"" | "dateDesc" | "dateAsc">("");
  const [cFilters, setCFilters] = useState({ search: "", estado: "", dateFrom: "", dateTo: "", tipo: "" });

  // ====== CONTROL DE TABS DE PERFIL ======
  const [profileActiveTab, setProfileActiveTab] = useState("personal");

  const contratosCliente = [
    { 
      titulo: "Depósito Bancario", 
      descripcion: "Confirmación de depósito a plazo fijo con detalles de inversión", 
      fecha: "2025-01-25", 
      categoria: "Producto",
      archivo: "/attached_assets/07. Depósito Bancario_1756335354455.pdf"
    },
    { 
      titulo: "Contrato de Colaboración Partner Para Captación de Inversores", 
      descripcion: "Acuerdo de colaboración comercial para asesores y partners", 
      fecha: "2025-01-25", 
      categoria: "Legal",
      archivo: "/attached_assets/08. CONTRATO DE COLABORACIÓN PARTNER PARA CAPTACIÓN DE INVERSORES_1756335354457.docx"
    },
  ];

  /* ======== KYC avanzado (perfil) ======== */
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // KYC data state
  const [kycFormData, setKycFormData] = useState({
    fullName: "",
    documentType: "dni",
    documentNumber: "",
    country: "España",
    documentsUrls: [] as string[],
  });
  const [kycDocs, setKycDocs] = useState<File[]>([]);
  
  // Document viewing states (similar to admin dashboard)
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [viewingDocuments, setViewingDocuments] = useState<string[] | null>(null);

  // Fetch user's KYC data
  const { data: kycData, isLoading: kycLoading } = useQuery({
    queryKey: ["/api/kyc/me"],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when user focuses window
  });

  // Fetch user's profile data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/me"],
    enabled: !!user,
  });

  // Create/Update KYC mutation
  const kycMutation = useMutation({
    mutationFn: async (data: any) => {
      const kycPayload = {
        ...data,
        documentsUrls: data.documentsUrls || [],
      };

      const method = kycData?.kyc ? 'PUT' : 'POST';
      const url = kycData?.kyc ? '/api/kyc/me' : '/api/kyc';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(kycPayload),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/me"] });
      // Registrar actividad de KYC - específico para actualización de documentos
      logActivity('Documentos KYC actualizados');
    },
  });

  // Mutación para actualizar el perfil
  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      // Registrar actividad de perfil actualizado
      logActivity('Perfil actualizado');
    },
  });

  // Función para registrar actividad del cliente
  const logActivity = async (action: string) => {
    try {
      await fetch('/api/client/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ action }),
      });
      // Invalidar las consultas del historial para mostrar la nueva actividad
      queryClient.invalidateQueries({ queryKey: ['/api/client/activity-logs'] });
    } catch (error) {
      console.error('Error registrando actividad:', error);
    }
  };

  // Update form data when KYC data is loaded
  useEffect(() => {
    if (kycData?.kyc) {
      setKycFormData({
        fullName: kycData.kyc.fullName || "",
        documentType: kycData.kyc.documentType || "dni",
        documentNumber: kycData.kyc.documentNumber || "",
        country: kycData.kyc.country || "España",
      });
    }
  }, [kycData]);

  // Update profile form data when user data is loaded
  useEffect(() => {
    if (userData?.user) {
      setProfileFormData({
        nombre: userData.user.name || "",
        apellidos: userData.user.apellidos || "",
        telefono: userData.user.telefono || "",
        fechaNacimiento: userData.user.fechaNacimiento || "",
        pais: userData.user.pais || "espana",
        direccion: userData.user.direccion || "",
      });
    }
  }, [userData]);

  const handleKycUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const accepted = files.filter((f) => {
      const okType = ["image/jpeg", "image/png", "application/pdf"].includes(f.type) || f.type === "";
      const okSize = f.size <= 10 * 1024 * 1024;
      return okType && okSize;
    });
    setKycDocs(accepted);
  };

  // This function is no longer needed as file management is handled by KycFileUpload component
  
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFormData.fullName || !kycFormData.documentNumber || !kycFormData.documentsUrls.length) return;
    
    try {
      await kycMutation.mutateAsync(kycFormData);
    } catch (error) {
      console.error('Error submitting KYC:', error);
    }
  };

  // Función para manejar el submit del perfil
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await profileMutation.mutateAsync(profileFormData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  // Initialize form data when KYC data is loaded
  useEffect(() => {
    if (kycData?.kyc) {
      setKycFormData({
        fullName: kycData.kyc.fullName || "",
        documentType: kycData.kyc.documentType || "dni",
        documentNumber: kycData.kyc.documentNumber || "",
        country: kycData.kyc.country || "España",
        documentsUrls: kycData.kyc.documentsUrls || [],
      });
    }
  }, [kycData]);

  // Get KYC status and messages
  const currentKyc = kycData?.kyc;
  const kycStatus = currentKyc?.status === "approved" ? "Aprobado" : 
                   currentKyc?.status === "rejected" ? "Rechazado" : "Pendiente";
  const kycFeedback = currentKyc?.rejectionReason || "";

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Document viewing functions (similar to admin dashboard)
  const handleViewDocuments = (documentsUrls: string[] | null) => {
    if (!documentsUrls || documentsUrls.length === 0) {
      alert("No hay documentos disponibles");
      return;
    }
    setViewingDocuments(documentsUrls);
    setShowDocumentsDialog(true);
  };

  const handleCloseDocumentsDialog = () => {
    setShowDocumentsDialog(false);
    setViewingDocuments(null);
  };

  const kycBadgeClass =
    kycStatus === "Aprobado"
      ? "bg-emerald-500 text-black"
      : kycStatus === "Rechazado"
      ? "bg-red-500 text-white"
      : "bg-amber-500 text-black";

  const kycMessage =
    kycStatus === "Aprobado"
      ? "¡Tu cuenta está verificada! Ya puedes operar sin límites."
      : kycStatus === "Rechazado"
      ? kycFeedback || "Hemos detectado inconsistencias. Vuelve a subir los documentos."
      : kycDocs.length
      ? "Tus documentos están en revisión. Te notificaremos al finalizar."
      : "Aún no has subido documentos. Sube tu DNI o pasaporte para iniciar la verificación.";

  return (
    <div
      className={[
        "relative min-h-screen text-white flex overflow-hidden",
        "bg-gradient-to-br from-black via-[#0A1713] to-[#0E2A1F]",
        "before:pointer-events-none before:absolute before:inset-0",
        "before:bg-[radial-gradient(80%_60%_at_110%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(60%_40%_at_-20%_110%,rgba(16,185,129,0.12),transparent)]",
      ].join(" ")}
    >
      {/* Sidebar */}
      <aside
        className={[
          "w-64 fixed h-full z-40 p-6",
          "bg-black/40 backdrop-blur-sm",
          "border-r border-emerald-500/15",
          "shadow-[0_0_0_1px_rgba(16,185,129,0.08),_0_20px_60px_-20px_rgba(16,185,129,0.25)]",
        ].join(" ")}
      >
        <div className="flex items-center space-x-3 mb-8">
          <img src={logoImg} alt="Nakama&Partners" className="w-8 h-8 drop-shadow-[0_0_14px_rgba(16,185,129,0.35)]" />
          <div>
            <h1 className="font-cormorant text-lg font-bold text-emerald-50">Nakama&Partners</h1>
            <p className="text-emerald-300 text-xs">Portal de Cliente</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: "inicio", label: "Resumen", icon: Calendar },
            { id: "perfil", label: "Perfil", icon: User },
            { id: "productos", label: "Productos", icon: Package },
            { id: "contratos", label: "Contratos", icon: FileText },
            { id: "deposito", label: "Depósito", icon: Banknote },
            { id: "retiro", label: "Retiro", icon: Wallet },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (item.id === "productos") setActiveProductsView("default");
              }}
              className={[
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                activeTab === (item.id as any)
                  ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-50 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.45)]"
                  : "text-emerald-200 hover:bg-emerald-900/10",
              ].join(" ")}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full mt-4 justify-start border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Cerrar sesión
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-64">
        {/* ====== PERFIL ====== */}
        {activeTab === "perfil" ? (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-emerald-50">Mi Perfil</h1>
              <p className="text-emerald-200/80">Gestiona tu información personal</p>
            </div>

            <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
              <CardContent className="p-6">
                <Tabs value={profileActiveTab} onValueChange={setProfileActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-emerald-500/15 rounded-xl">
                    <TabsTrigger
                      value="personal"
                      className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-50 rounded-lg"
                    >
                      Información Personal
                    </TabsTrigger>
                    <TabsTrigger
                      value="kyc"
                      className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-50 rounded-lg"
                    >
                      Estado KYC
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="mt-6">
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      {/* Profile Photo */}
                      <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-4">
                          <div className="w-32 h-32 rounded-full overflow-hidden bg-black/50 border-2 border-emerald-500/20 flex items-center justify-center">
                            {profilePhoto ? (
                              <img src={profilePhoto} alt="Foto de perfil" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-16 h-16 text-emerald-300" />
                            )}
                          </div>
                          <label
                            htmlFor="photo-upload"
                            className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-500 rounded-full p-2 cursor-pointer transition-colors"
                          >
                            <Camera className="w-4 h-4 text-white" />
                          </label>
                          <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </div>
                        <p className="text-emerald-200/80 text-sm text-center">Haz clic en el icono de cámara para subir tu foto</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="nombre" className="text-emerald-50">Nombre</Label>
                          <Input 
                            id="nombre" 
                            name="nombre" 
                            value={profileFormData.nombre}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, nombre: e.target.value }))}
                            className="bg-black/50 border-emerald-500/20 text-emerald-50" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="apellidos" className="text-emerald-50">Apellidos</Label>
                          <Input 
                            id="apellidos" 
                            name="apellidos" 
                            value={profileFormData.apellidos}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, apellidos: e.target.value }))}
                            className="bg-black/50 border-emerald-500/20 text-emerald-50" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="email" className="text-emerald-50">Correo Electrónico</Label>
                          <Input
                            id="email"
                            defaultValue="test@test.com"
                            disabled
                            className="bg-black/60 border-emerald-500/20 text-emerald-300/80 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <Label htmlFor="telefono" className="text-emerald-50">Número de Teléfono</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300/70" />
                            <Input
                              id="telefono"
                              name="telefono"
                              value={profileFormData.telefono}
                              onChange={(e) => setProfileFormData(prev => ({ ...prev, telefono: e.target.value }))}
                              placeholder="Ej: +34 646 123 456"
                              className="bg-black/50 border-emerald-500/20 text-emerald-50 pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="fecha-nacimiento" className="text-emerald-50">Fecha de Nacimiento</Label>
                          <Input 
                            id="fecha-nacimiento" 
                            name="fecha-nacimiento" 
                            value={profileFormData.fechaNacimiento}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                            className="bg-black/50 border-emerald-500/20 text-emerald-50" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="fecha-registro" className="text-emerald-50">Fecha de Registro</Label>
                          <Input
                            id="fecha-registro"
                            defaultValue="15/01/2024"
                            disabled
                            className="bg-black/60 border-emerald-500/20 text-emerald-300/80 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="pais" className="text-emerald-50">País</Label>
                          <select 
                            name="pais" 
                            value={profileFormData.pais}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, pais: e.target.value }))}
                            className="flex h-10 w-full rounded-md border border-emerald-500/20 bg-black/50 px-3 py-2 text-sm text-emerald-50 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="espana">España</option>
                            <option value="francia">Francia</option>
                            <option value="portugal">Portugal</option>
                            <option value="italia">Italia</option>
                            <option value="alemania">Alemania</option>
                          </select>
                        </div>
                        <div />
                      </div>

                      <div>
                        <Label htmlFor="direccion" className="text-emerald-50">Dirección</Label>
                        <Input
                          id="direccion"
                          name="direccion"
                          value={profileFormData.direccion}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, direccion: e.target.value }))}
                          className="bg-black/50 border-emerald-500/20 text-emerald-50"
                        />
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          disabled={profileMutation.isPending}
                          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold disabled:opacity-50"
                        >
                          {profileMutation.isPending ? "ACTUALIZANDO..." : "ACTUALIZAR INFORMACIÓN PERSONAL"}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  {/* ====== KYC ====== */}
                  <TabsContent value="kyc" className="mt-6">
                    <div className="bg-black/40 rounded-xl p-8 border border-emerald-500/15">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-emerald-500/20 rounded-full p-3">
                          <User className="h-8 w-8 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-emerald-50 mb-1">Verificación KYC</h3>
                          <p className="text-emerald-200/80">{kycMessage}</p>
                        </div>
                        <Badge className={`${kycBadgeClass} px-4 py-2 text-sm font-semibold`}>{kycStatus}</Badge>
                      </div>

                      {/* Documents Uploaded */}
                      {currentKyc?.documentsUrls && currentKyc.documentsUrls.length > 0 && (
                        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                          <h4 className="text-emerald-300 font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Documentos Subidos
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {currentKyc.documentsUrls.map((docUrl, index) => (
                              <div key={index} className="flex items-center justify-between bg-black/30 rounded-lg p-4 border border-emerald-500/15">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-emerald-400" />
                                  <div>
                                    <p className="text-emerald-50 text-sm font-medium">
                                      Documento {index + 1}
                                    </p>
                                    <p className="text-emerald-300/70 text-xs">
                                      {docUrl.split('/').pop()?.substring(0, 40)}...
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10"
                                  onClick={() => handleViewDocuments(currentKyc.documentsUrls)}
                                >
                                  Ver Documentos
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          {/* Quick View All Button */}
                          <div className="mt-4 pt-4 border-t border-emerald-500/20">
                            <Button
                              variant="outline"
                              className="w-full border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10"
                              onClick={() => handleViewDocuments(currentKyc.documentsUrls)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Ver Todos los Documentos
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* KYC Form */}
                      <div className="mt-2 bg-black/40 rounded-xl p-6 border border-emerald-500/15">
                        <form onSubmit={handleKycSubmit} className="space-y-6">
                          {/* Personal Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-emerald-50">Nombre Completo</Label>
                              <Input
                                value={kycFormData.fullName}
                                onChange={(e) => setKycFormData({ ...kycFormData, fullName: e.target.value })}
                                placeholder="Introduce tu nombre completo"
                                className="bg-black/50 border-emerald-500/20 text-emerald-50"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-emerald-50">Tipo de Documento</Label>
                              <Select
                                value={kycFormData.documentType}
                                onValueChange={(value) => setKycFormData({ ...kycFormData, documentType: value })}
                              >
                                <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dni">DNI</SelectItem>
                                  <SelectItem value="passport">Pasaporte</SelectItem>
                                  <SelectItem value="license">Carnet de Conducir</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-emerald-50">Número de Documento</Label>
                              <Input
                                value={kycFormData.documentNumber}
                                onChange={(e) => setKycFormData({ ...kycFormData, documentNumber: e.target.value })}
                                placeholder="Número del documento"
                                className="bg-black/50 border-emerald-500/20 text-emerald-50"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-emerald-50">País</Label>
                              <Input
                                value={kycFormData.country}
                                onChange={(e) => setKycFormData({ ...kycFormData, country: e.target.value })}
                                placeholder="País de residencia"
                                className="bg-black/50 border-emerald-500/20 text-emerald-50"
                                required
                              />
                            </div>
                          </div>

                          {/* Document Upload */}
                          <KycFileUpload 
                            onFilesUploaded={(urls) => setKycFormData({ ...kycFormData, documentsUrls: urls })}
                            currentFiles={kycFormData.documentsUrls || []}
                            disabled={kycStatus === "Aprobado"}
                          />

                          {/* Submit Button */}
                          {kycStatus !== "Aprobado" && (
                            <Button 
                              type="submit" 
                              disabled={kycMutation.isPending || !kycFormData.fullName || !kycFormData.documentNumber || !kycFormData.documentsUrls?.length}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                            >
                              {kycMutation.isPending ? "Enviando..." : 
                               kycData?.kyc ? "Actualizar documentos" : "Enviar documentos"}
                            </Button>
                          )}

                          {/* Status Messages */}
                          {kycStatus === "Pendiente" && currentKyc && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                              <p className="text-amber-300 text-sm">
                                Tus documentos están en revisión. Te notificaremos al finalizar.
                              </p>
                            </div>
                          )}
                          {kycStatus === "Rechazado" && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                              <p className="text-red-300 text-sm font-medium mb-2">Documentos rechazados</p>
                              <p className="text-red-200 text-sm">
                                {kycFeedback || "Revisa tus documentos y vuelve a subirlos."}
                              </p>
                            </div>
                          )}
                          {kycStatus === "Aprobado" && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                              <p className="text-emerald-300 text-sm">
                                ✅ Tu verificación KYC está completa. Ya puedes operar sin límites.
                              </p>
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "productos" ? (
          <div>
            {/* Encabezado Productos */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-emerald-50">Productos e Inversiones</h1>
              <p className="text-emerald-200/80">Gestiona tus productos disponibles e inversiones activas</p>
            </div>

            {/* ----------- Vista DETALLE de producto (info-only) ----------- */}
            {activeProductsView === "producto-detalle" ? (
              <ProductInfoView
                onBack={() => setActiveProductsView("default")}
                goToDeposit={() => setActiveTab("deposito")}
              />
            ) : null}

            {/* -------------------------- Vista por defecto -------------------------- */}
            {activeProductsView === "default" ? (
              <div className="mb-8">
                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                  <Button
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-50 hover:bg-emerald-900/10 hover:border-emerald-400 py-4 rounded-xl"
                    onClick={() => setActiveProductsView("mis-productos")}
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Mis Productos
                  </Button>
                  <Button
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-50 hover:bg-emerald-900/10 hover:border-emerald-400 py-4 rounded-xl"
                    onClick={() => setActiveProductsView("historial")}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Historial
                  </Button>
                </div>

                {/* Producto destacado centrado */}
                <div className="flex justify-center mb-8">
                  <Card className="bg-black/40 border border-emerald-500/15 hover:border-emerald-400 hover:shadow-[0_16px_40px_-20px_rgba(16,185,129,0.45)] transition-all rounded-2xl max-w-md w-full">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-emerald-50">Plazo fijo 9% 175 días</h2>
                        <Badge className="bg-emerald-500 text-black text-sm px-3 py-1">175 días</Badge>
                      </div>
                      <p className="text-emerald-200/80 mb-8 leading-relaxed">
                        Depósito bancario con un 9% de rentabilidad anual, mediante préstamo participativo y
                        cesión de la pignoración al cliente depositante.
                      </p>
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-4xl font-bold text-emerald-400">9.00%</p>
                          <p className="text-emerald-200/80 text-sm">Rentabilidad anual</p>
                        </div>
                        <Badge className="bg-emerald-900/30 text-emerald-200 border border-emerald-500/20">No renovable</Badge>
                      </div>
                      <Button
                        className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 text-lg"
                        onClick={() => setActiveProductsView("producto-detalle")}
                      >
                        VER DETALLES
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}

            {/* ----------------------------- Historial ----------------------------- */}
            {activeProductsView === "historial" ? (
              <HistorialActivityView onBack={() => setActiveProductsView("default")} />
            ) : null}


            {/* ------------------------------ Mis productos ------------------------------ */}
            {activeProductsView === "mis-productos" ? (
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveProductsView("default")}
                    className="border-emerald-500/30 text-emerald-50 hover:bg-emerald-900/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                  <h2 className="text-2xl font-bold text-emerald-50">Mis Productos</h2>
                </div>

                {/* Filtros Mis Productos */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowMPFilters(!showMPFilters)}
                      className="border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {showMPFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                    </Button>

                    {(Object.values(mpFilters).some((v) => v !== "") || mpSort !== "") && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setMpSort("");
                          setMpFilters({
                            search: "",
                            cantidadMin: "",
                            cantidadMax: "",
                            fechaFrom: "",
                            fechaTo: "",
                            rentMin: "",
                            rentMax: "",
                          });
                        }}
                        className="text-emerald-200 hover:text-emerald-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpiar Filtros
                      </Button>
                    )}
                  </div>

                  {showMPFilters && (
                    <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-emerald-50">Búsqueda</Label>
                            <Input
                              placeholder="Buscar por nombre…"
                              value={mpFilters.search}
                              onChange={(e) => setMpFilters({ ...mpFilters, search: e.target.value })}
                              className="bg-black/50 border-emerald-500/20 text-emerald-50"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-emerald-50">Cantidad (€)</Label>
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Mín"
                                value={mpFilters.cantidadMin}
                                onChange={(e) => setMpFilters({ ...mpFilters, cantidadMin: e.target.value })}
                                className="bg-black/50 border-emerald-500/20 text-emerald-50"
                              />
                              <Input
                                placeholder="Máx"
                                value={mpFilters.cantidadMax}
                                onChange={(e) => setMpFilters({ ...mpFilters, cantidadMax: e.target.value })}
                                className="bg-black/50 border-emerald-500/20 text-emerald-50"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-emerald-50">Rend. (%)</Label>
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Mín"
                                value={mpFilters.rentMin}
                                onChange={(e) => setMpFilters({ ...mpFilters, rentMin: e.target.value })}
                                className="bg-black/50 border-emerald-500/20 text-emerald-50"
                              />
                              <Input
                                placeholder="Máx"
                                value={mpFilters.rentMax}
                                onChange={(e) => setMpFilters({ ...mpFilters, rentMax: e.target.value })}
                                className="bg-black/50 border-emerald-500/20 text-emerald-50"
                              />
                            </div>
                            <p className="text-xs text-emerald-200/70">* En “Activos” usa “Rentabilidad Estimada”</p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-emerald-50">Fecha desde</Label>
                            <Input
                              type="date"
                              value={mpFilters.fechaFrom}
                              onChange={(e) => setMpFilters({ ...mpFilters, fechaFrom: e.target.value })}
                              className="bg-black/50 border-emerald-500/20 text-emerald-50"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-emerald-50">Fecha hasta</Label>
                            <Input
                              type="date"
                              value={mpFilters.fechaTo}
                              onChange={(e) => setMpFilters({ ...mpFilters, fechaTo: e.target.value })}
                              className="bg-black/50 border-emerald-500/20 text-emerald-50"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-emerald-50">Ordenar por</Label>
                            <Select value={mpSort} onValueChange={(v) => setMpSort(v as typeof mpSort)}>
                              <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                                <SelectValue placeholder="Sin orden" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cantidadDesc">Cantidad (Mayor a menor)</SelectItem>
                                <SelectItem value="cantidadAsc">Cantidad (Menor a mayor)</SelectItem>
                                <SelectItem value="fechaAsc">Fecha (Más antiguos)</SelectItem>
                                <SelectItem value="fechaDesc">Fecha (Más recientes)</SelectItem>
                                <SelectItem value="rentDesc">Rentabilidad (Mayor)</SelectItem>
                                <SelectItem value="rentAsc">Rentabilidad (Menor)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Tabs value={activeProductsSubTab} onValueChange={(value) => setActiveProductsSubTab(value as "activos" | "completados" | "cancelados")} className="mb-6">
                  <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-emerald-500/15 rounded-xl">
                    <TabsTrigger value="activos" className="data-[state=active]:bg-emerald-600/20 rounded-lg">
                      Activos
                    </TabsTrigger>
                    <TabsTrigger value="completados" className="data-[state=active]:bg-emerald-600/20 rounded-lg">
                      Completados
                    </TabsTrigger>
                    <TabsTrigger value="cancelados" className="data-[state=active]:bg-emerald-600/20 rounded-lg">
                      Cancelados
                    </TabsTrigger>
                  </TabsList>

                  {/* Activos */}
                  <TabsContent value="activos" className="mt-6">
                    <div className="space-y-4">
                      {productosActivos
                        .filter((p) => {
                          const q = mpFilters.search.toLowerCase();
                          const matchesSearch = !q || p.nombre.toLowerCase().includes(q);

                          const cantidad = parseEuro(p.cantidad);
                          const minC = mpFilters.cantidadMin ? parseFloat(mpFilters.cantidadMin) : -Infinity;
                          const maxC = mpFilters.cantidadMax ? parseFloat(mpFilters.cantidadMax) : Infinity;
                          const matchesCantidad = cantidad >= minC && cantidad <= maxC;

                          const rent = parsePercent(p.rentabilidad);
                          const minR = mpFilters.rentMin ? parseFloat(mpFilters.rentMin) : -Infinity;
                          const maxR = mpFilters.rentMax ? parseFloat(mpFilters.rentMax) : Infinity;
                          const matchesRent = rent >= minR && rent <= maxR;

                          const f = parseESDate(p.fechaInicio).getTime();
                          const fromOk = !mpFilters.fechaFrom || f >= new Date(mpFilters.fechaFrom).getTime();
                          const toOk = !mpFilters.fechaTo || f <= new Date(mpFilters.fechaTo).getTime();

                          return matchesSearch && matchesCantidad && matchesRent && fromOk && toOk;
                        })
                        .sort((a, b) => {
                          if (mpSort === "cantidadDesc") return parseEuro(b.cantidad) - parseEuro(a.cantidad);
                          if (mpSort === "cantidadAsc") return parseEuro(a.cantidad) - parseEuro(b.cantidad);
                          if (mpSort === "fechaAsc") return parseESDate(a.fechaInicio).getTime() - parseESDate(b.fechaInicio).getTime();
                          if (mpSort === "fechaDesc") return parseESDate(b.fechaInicio).getTime() - parseESDate(a.fechaInicio).getTime();
                          if (mpSort === "rentDesc") return parsePercent(b.rentabilidad) - parsePercent(a.rentabilidad);
                          if (mpSort === "rentAsc") return parsePercent(a.rentabilidad) - parsePercent(b.rentabilidad);
                          return 0;
                        })
                        .map((p, i) => (
                          <Card key={i} className="bg-black/40 border border-emerald-500/15 hover:border-emerald-400 transition-all rounded-xl">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-emerald-50 mb-2">{p.nombre}</h4>
                                  <Badge className="bg-emerald-500 text-black">{p.estado}</Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-emerald-400">{p.cantidad}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-emerald-200/80">Fecha de inicio</p>
                                  <p className="text-emerald-50 font-medium">{p.fechaInicio}</p>
                                </div>
                                <div>
                                  <p className="text-emerald-200/80">Rentabilidad Estimada</p>
                                  <p className="text-emerald-50 font-medium">{p.rentabilidad}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>

                  {/* Completados */}
                  <TabsContent value="completados" className="mt-6">
                    <div className="space-y-4">
                      {productosCompletados
                        .filter((p) => {
                          const q = mpFilters.search.toLowerCase();
                          const matchesSearch = !q || p.nombre.toLowerCase().includes(q);

                          const cantidad = parseEuro(p.cantidad);
                          const minC = mpFilters.cantidadMin ? parseFloat(mpFilters.cantidadMin) : -Infinity;
                          const maxC = mpFilters.cantidadMax ? parseFloat(mpFilters.cantidadMax) : Infinity;
                          const matchesCantidad = cantidad >= minC && cantidad <= maxC;

                          const rent = parsePercent(p.rentabilidadFinal);
                          const minR = mpFilters.rentMin ? parseFloat(mpFilters.rentMin) : -Infinity;
                          const maxR = mpFilters.rentMax ? parseFloat(mpFilters.rentMax) : Infinity;
                          const matchesRent = rent >= minR && rent <= maxR;

                          const f = parseESDate(p.fechaFin).getTime();
                          const fromOk = !mpFilters.fechaFrom || f >= new Date(mpFilters.fechaFrom).getTime();
                          const toOk = !mpFilters.fechaTo || f <= new Date(mpFilters.fechaTo).getTime();

                          return matchesSearch && matchesCantidad && matchesRent && fromOk && toOk;
                        })
                        .sort((a, b) => {
                          if (mpSort === "cantidadDesc") return parseEuro(b.cantidad) - parseEuro(a.cantidad);
                          if (mpSort === "cantidadAsc") return parseEuro(a.cantidad) - parseEuro(b.cantidad);
                          if (mpSort === "fechaAsc") return parseESDate(a.fechaFin).getTime() - parseESDate(b.fechaFin).getTime();
                          if (mpSort === "fechaDesc") return parseESDate(b.fechaFin).getTime() - parseESDate(a.fechaFin).getTime();
                          if (mpSort === "rentDesc") return parsePercent(b.rentabilidadFinal) - parsePercent(a.rentabilidadFinal);
                          if (mpSort === "rentAsc") return parsePercent(a.rentabilidadFinal) - parsePercent(b.rentabilidadFinal);
                          return 0;
                        })
                        .map((p, i) => (
                          <Card key={i} className="bg-black/40 border border-emerald-500/15 hover:border-emerald-400 transition-all rounded-xl">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-emerald-50 mb-2">{p.nombre}</h4>
                                  <Badge className="bg-blue-500 text-white">{p.estado}</Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-emerald-400">{p.cantidad}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-emerald-200/80">Inicio</p>
                                  <p className="text-emerald-50 font-medium">{p.fechaInicio}</p>
                                </div>
                                <div>
                                  <p className="text-emerald-200/80">Finalizado</p>
                                  <p className="text-emerald-50 font-medium">{p.fechaFin}</p>
                                </div>
                                <div>
                                  <p className="text-emerald-200/80">Rentabilidad Final</p>
                                  <p className="text-emerald-50 font-medium">{p.rentabilidadFinal}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>

                  {/* Cancelados */}
                  <TabsContent value="cancelados" className="mt-6">
                    <div className="space-y-4">
                      {productosCancelados
                        .filter((p) => {
                          const q = mpFilters.search.toLowerCase();
                          const matchesSearch = !q || p.nombre.toLowerCase().includes(q);

                          const cantidad = parseEuro(p.cantidad);
                          const minC = mpFilters.cantidadMin ? parseFloat(mpFilters.cantidadMin) : -Infinity;
                          const maxC = mpFilters.cantidadMax ? parseFloat(mpFilters.cantidadMax) : Infinity;
                          const matchesCantidad = cantidad >= minC && cantidad <= maxC;

                          const f = parseESDate(p.fechaCancelacion).getTime();
                          const fromOk = !mpFilters.fechaFrom || f >= new Date(mpFilters.fechaFrom).getTime();
                          const toOk = !mpFilters.fechaTo || f <= new Date(mpFilters.fechaTo).getTime();

                          return matchesSearch && matchesCantidad && fromOk && toOk;
                        })
                        .sort((a, b) => {
                          if (mpSort === "cantidadDesc") return parseEuro(b.cantidad) - parseEuro(a.cantidad);
                          if (mpSort === "cantidadAsc") return parseEuro(a.cantidad) - parseEuro(b.cantidad);
                          if (mpSort === "fechaAsc") return parseESDate(a.fechaCancelacion).getTime() - parseESDate(b.fechaCancelacion).getTime();
                          if (mpSort === "fechaDesc") return parseESDate(b.fechaCancelacion).getTime() - parseESDate(a.fechaCancelacion).getTime();
                          return 0;
                        })
                        .map((p, i) => (
                          <Card key={i} className="bg-black/40 border border-emerald-500/15 hover:border-emerald-400 transition-all rounded-xl">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-emerald-50 mb-2">{p.nombre}</h4>
                                  <Badge className="bg-red-500 text-white">{p.estado}</Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-red-400">{p.cantidad}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-4 text-sm">
                                <div>
                                  <p className="text-emerald-200/80">Fecha de cancelación</p>
                                  <p className="text-emerald-50 font-medium">{p.fechaCancelacion}</p>
                                </div>
                                <div>
                                  <p className="text-emerald-200/80">Motivo</p>
                                  <p className="text-emerald-50 font-medium italic">{p.motivo}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : null}




          </div>
        ) : activeTab === "contratos" ? (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-emerald-50">Contratos</h1>
              <p className="text-emerald-200/80">Gestiona y descarga tus contratos</p>
            </div>

            {/* Filtros Contratos */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCFilters(!showCFilters)}
                  className="border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showCFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </Button>

                {(Object.values(cFilters).some((v) => v !== "") || cSort !== "") && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCFilters({ search: "", estado: "", dateFrom: "", dateTo: "", tipo: "" });
                      setCSort("");
                    }}
                    className="text-emerald-200 hover:text-emerald-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>

              {showCFilters && (
                <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Búsqueda</Label>
                        <Input
                          placeholder="Buscar por título o descripción…"
                          value={cFilters.search}
                          onChange={(e) => setCFilters({ ...cFilters, search: e.target.value })}
                          className="bg-black/50 border-emerald-500/20 text-emerald-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Estado</Label>
                        <Select value={cFilters.estado} onValueChange={(v) => setCFilters({ ...cFilters, estado: v })}>
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Disponible">Disponible</SelectItem>
                            <SelectItem value="No disponible">No disponible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Categoría</Label>
                        <Select value={cFilters.tipo} onValueChange={(v) => setCFilters({ ...cFilters, tipo: v })}>
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Producto">Producto</SelectItem>
                            <SelectItem value="Legal">Legal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Desde</Label>
                        <Input
                          type="date"
                          value={cFilters.dateFrom}
                          onChange={(e) => setCFilters({ ...cFilters, dateFrom: e.target.value })}
                          className="bg-black/50 border-emerald-500/20 text-emerald-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Hasta</Label>
                        <Input
                          type="date"
                          value={cFilters.dateTo}
                          onChange={(e) => setCFilters({ ...cFilters, dateTo: e.target.value })}
                          className="bg-black/50 border-emerald-500/20 text-emerald-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Ordenar por</Label>
                        <Select value={cSort} onValueChange={(v) => setCSort(v as typeof cSort)}>
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Sin orden" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dateDesc">Fecha (Más recientes)</SelectItem>
                            <SelectItem value="dateAsc">Fecha (Más antiguos)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Listado de contratos filtrados */}
            <div className="space-y-4">
              {contratosCliente
                .filter((c) => {
                  const q = cFilters.search.toLowerCase();
                  const matchesSearch =
                    !q ||
                    c.titulo.toLowerCase().includes(q) ||
                    c.descripcion.toLowerCase().includes(q);

                  const matchesEstado = true; // Ya no hay estado
                  const matchesTipo = !cFilters.tipo || c.categoria === cFilters.tipo;

                  const t = new Date(c.fecha).getTime();
                  const fromOk = !cFilters.dateFrom || t >= new Date(cFilters.dateFrom).getTime();
                  const toOk = !cFilters.dateTo || t <= new Date(cFilters.dateTo).getTime();

                  return matchesSearch && matchesEstado && matchesTipo && fromOk && toOk;
                })
                .sort((a, b) => {
                  if (cSort === "dateDesc") return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
                  if (cSort === "dateAsc") return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
                  return 0;
                })
                .map((doc, index) => (
                  <Card key={index} className="bg-black/40 border border-emerald-500/15 hover:border-emerald-400 transition-all rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                              {doc.categoria === "Producto" ? (
                                <Building2 className="h-5 w-5 text-black" />
                              ) : (
                                <Handshake className="h-5 w-5 text-black" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-emerald-50">{doc.titulo}</h4>
                              <p className="text-emerald-200/80 text-sm">{doc.descripcion}</p>
                            </div>
                          </div>
                          <div className="text-sm mt-4">
                            <div>
                              <p className="text-emerald-200/80">Fecha</p>
                              <p className="text-emerald-50 font-medium">
                                {new Date(doc.fecha).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-6">
                          <Button
                            className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.archivo;
                              // Extraer la extensión del archivo del path
                              const extension = doc.archivo.split('.').pop() || 'pdf';
                              link.download = `${doc.titulo}.${extension}`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              
                              // Registrar actividad de descarga
                              logActivity(`Contrato descargado: ${doc.titulo}`);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {/* Placeholder si no hay resultados */}
              {contratosCliente
                .filter((c) => {
                  const q = cFilters.search.toLowerCase();
                  const matchesSearch =
                    !q ||
                    c.titulo.toLowerCase().includes(q) ||
                    c.descripcion.toLowerCase().includes(q);
                  const matchesEstado = true; // Ya no hay estado
                  const matchesTipo = !cFilters.tipo || c.categoria === cFilters.tipo;
                  const t = new Date(c.fecha).getTime();
                  const fromOk = !cFilters.dateFrom || t >= new Date(cFilters.dateFrom).getTime();
                  const toOk = !cFilters.dateTo || t <= new Date(cFilters.dateTo).getTime();
                  return matchesSearch && matchesEstado && matchesTipo && fromOk && toOk;
                }).length === 0 && (
                <Card className="bg-black/30 border border-emerald-500/15 transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/40 hover:shadow-lg hover:shadow-emerald-500/20 border-dashed rounded-2xl">
                  <CardContent className="p-8">
                    <div className="text-center text-emerald-200/80">
                      <Download className="h-12 w-12 mx-auto mb-4 text-emerald-400" />
                      <p className="text-lg mb-2 text-emerald-50/90">No hay contratos para los filtros aplicados</p>
                      <p className="text-sm">Ajusta los filtros para ver más resultados.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : activeTab === "deposito" ? (
          <DepositoView 
            setHasActiveDeposit={setHasActiveDeposit} 
            setActiveTab={setActiveTab}
            setProfileActiveTab={setProfileActiveTab}
          />
        ) : activeTab === "retiro" ? (
          <RetiroView hasActiveDeposit={hasActiveDeposit} />
        ) : (
          /* ------------------------------- INICIO (home) ------------------------------- */
          <div>
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-emerald-50">Dashboard</h1>
                <p className="text-emerald-200/80">Vista general de tu actividad</p>
              </div>
              <Button 
                onClick={handleDownloadStatement} 
                className="rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Estado de Cuenta
              </Button>
            </div>

            {/* KPIs (3 tarjetas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {kpis.map((kpi, i) => (
                <Card
                  key={i}
                  className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 hover:shadow-[0_16px_40px_-20px_rgba(16,185,129,0.45)] transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-200/80 text-sm">{kpi.title}</p>
                        <p className="text-2xl font-bold text-emerald-50">{kpi.value}</p>
                      </div>
                      <div className={`flex items-center space-x-1 ${kpi.trending === "up" ? "text-emerald-400" : "text-red-400"}`}>
                        {kpi.trending === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="text-sm">{kpi.change}</span>
                      </div>
                    </div>

                    {kpi.title === "Capital Invertido" && (
                      <ProgressBar percent={percentCapital} monthsRemaining={mesesRestantes} />
                    )}
                    {kpi.title === "Progreso en Meses" && (
                      <ProgressBar percent={percentMeses} monthsRemaining={mesesRestantes} />
                    )}
                    {kpi.title === "Beneficio Total Estimado" && (
                      <ProgressBar percent={percentMeses} monthsRemaining={mesesRestantes} />
                    )}

                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Producto destacado + gráfica (proyección a 10 años) */}
            <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 mb-8">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-emerald-50 mb-2">Un Producto Sólido, Simple y Rentable</h2>
                  <p className="text-emerald-200/80 max-w-3xl mx-auto">
                    Seguridad, rentabilidad y simplicidad. Ideal para hacer crecer tu capital de forma predecible.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { icon: <TrendingUp className="h-6 w-6 text-white" />, title: "Rentabilidad Garantizada", value: "9% Anual", note: "Retorno fijo" },
                    { icon: <TrendingUp className="h-6 w-6 text-white" />, title: "Capital Protegido", value: "100%", note: "Garantía bancaria" },
                    { icon: <Calendar className="h-6 w-6 text-white" />, title: "Flexibilidad", value: "1-5 años", note: "Plazos adaptables" },
                  ].map((b, idx) => (
                    <div
                      key={idx}
                      className="bg-black/40 p-6 rounded-xl text-center border border-emerald-500/15 hover:border-emerald-400 hover:shadow-[0_16px_40px_-20px_rgba(16,185,129,0.45)] transition-all rounded-xl">
                      <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center">
                        {b.icon}
                      </div>
                      <p className="text-emerald-200/80 text-sm">{b.title}</p>
                      <p className="text-emerald-50 font-bold text-lg">{b.value}</p>
                      <p className="text-emerald-200/70 text-xs">{b.note}</p>
                    </div>
                  ))}
                </div>

                {/* Proyección */}
                <div className="rounded-xl border border-emerald-500/15 bg-black/30 p-4">
                  <CompoundInterestChart />
                </div>
                </CardContent>
              </Card>

              {/* Botón Calcular Nueva Inversión */}
              <div className="mt-8 mb-6 flex justify-center">
                <Button
                  onClick={handleCalculateInvestment}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-3 text-lg"
                >
                  <Calculator className="h-5 w-5 mr-3" />
                  Calcular Nueva Inversión
                </Button>
              </div>

              {/* Actividad reciente */}
            <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-emerald-50">Actividad reciente</CardTitle>
                <CardDescription className="text-emerald-200/80">
                  Resumen de tus últimas acciones
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivityLogs.length > 0 ? (
                    recentActivityLogs.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between rounded-xl border border-emerald-500/10 bg-black/30 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-emerald-400" />
                          </div>
                          <p className="text-sm text-emerald-50">{activity.action}</p>
                        </div>

                        {/* Fecha y hora separados */}
                        <div className="flex items-center gap-3 text-xs text-emerald-200/70">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(activity.createdAt).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>⏰</span>
                            <span>
                              {new Date(activity.createdAt).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-emerald-200/60 py-4">
                      <p>No hay actividades recientes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>


              {/* Espacio para futuras acciones */}
              <div className="mt-8">
                {/* El botón de descargar estado de cuenta ahora está en la esquina superior derecha */}
              </div>
            </div>
          )}       
        </main>

        {/* Modales */}
        {showCalculator && <InvestmentCalculator onClose={() => setShowCalculator(false)} onLogActivity={logActivity} />}

        {/* Documents Dialog */}
        <Dialog open={showDocumentsDialog} onOpenChange={handleCloseDocumentsDialog}>
          <DialogContent className="bg-black/40 border border-emerald-500/15 text-emerald-50 max-w-4xl">
            <DialogHeader>
              <DialogTitle>Mis Documentos KYC</DialogTitle>
              <DialogDescription className="text-emerald-200/80">
                Documentos subidos para verificación
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {viewingDocuments && viewingDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingDocuments.map((docUrl, index) => (
                    <div key={index} className="border border-emerald-500/20 rounded-lg p-4 bg-black/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-emerald-200/80">
                          Documento {index + 1}
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-200">
                          {docUrl.toLowerCase().includes('.pdf') ? 'PDF' : 'Imagen'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-3">
                        <FileText className="w-16 h-16 text-emerald-400" />
                        <div className="text-sm text-emerald-200/80 text-center">
                          <p className="font-medium">{docUrl.split('/').pop()}</p>
                          <p className="text-xs text-emerald-200/60">
                            {docUrl.toLowerCase().includes('.pdf') ? 'Archivo PDF' : 'Imagen'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
                          onClick={() => {
                            // Create a temporary download link
                            const link = document.createElement('a');
                            link.href = docUrl;
                            link.download = docUrl.split('/').pop() || 'documento';
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-emerald-200/60">No hay documentos disponibles</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
}

// Componente para el historial de actividad del cliente
function HistorialActivityView({ onBack }: { onBack: () => void }) {
  // Hook para obtener las actividades del cliente
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['/api/client/activity-logs'],
    enabled: true,
  });

  const activityLogs = activityData?.logs || [];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-emerald-500/30 text-emerald-50 hover:bg-emerald-900/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h2 className="text-2xl font-bold text-emerald-50">Historial de Actividad</h2>
      </div>

      {/* Descripción */}
      <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 mb-6">
        <CardContent className="p-6">
          <p className="text-emerald-200/80">
            Aquí puedes ver un registro de todas las actividades realizadas en tu cuenta.
          </p>
        </CardContent>
      </Card>

      {/* Lista de actividades */}
      {isLoading ? (
        <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
          <CardContent className="p-6">
            <div className="text-center text-emerald-200/80">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Cargando historial de actividad...</p>
            </div>
          </CardContent>
        </Card>
      ) : activityLogs.length > 0 ? (
        <div className="space-y-4">
          {activityLogs.map((activity: any) => (
            <Card key={activity.id} className="bg-black/40 border border-emerald-500/15 hover:border-emerald-400 transition-all rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-emerald-50 mb-1">
                        {activity.action}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-emerald-200/80">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(activity.createdAt).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⏰</span>
                          <span>
                            {new Date(activity.createdAt).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-black/30 border border-emerald-500/15 transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/40 hover:shadow-lg hover:shadow-emerald-500/20 border-dashed rounded-2xl">
          <CardContent className="p-8">
            <div className="text-center text-emerald-200/80">
              <FileText className="h-12 w-12 mx-auto mb-4 text-emerald-400" />
              <p className="text-lg mb-2 text-emerald-50/90">No hay actividad registrada</p>
              <p className="text-sm">Cuando realices acciones en tu cuenta, aparecerán aquí.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

