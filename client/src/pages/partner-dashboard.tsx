import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KycFileUpload } from "@/components/KycFileUpload";
import {
  Users,
  TrendingUp,
  DollarSign,
  Crown,
  Briefcase,
  BarChart3,
  UserPlus,
  Calendar,
  LogOut,
  Star,
  User,
  FileText,
  Download,
  Filter,
  X,
  Camera,
  Phone,
  Trash2,
  PlusCircle,
  Banknote,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Hash,
  HelpCircle,
  RefreshCw,
  Archive,
} from "lucide-react";
import logoImg from "@/assets/Logo-removeBG_1752488347081.png";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import CompoundInterestChart from "@/components/compound-interest-chart";

/* -------------------------------------------------------------------------- */
/*                             Tipos para Depósito                            */
/* -------------------------------------------------------------------------- */
type Metodo = "banco" | "crypto";
type PasoBanco = "Pendiente" | "Conciliado" | "Asignado";
type PasoCrypto = "Detectado" | "Confirmado" | "Asignado";

/* -------------------------------------------------------------------------- */
/*                               VISTA: DEPÓSITO                              */
/* -------------------------------------------------------------------------- */
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

  // Consulta del estado KYC real
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
/*                                VISTA: RETIRO                               */
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
/*                                DASHBOARD PARTNER                           */
/* -------------------------------------------------------------------------- */

type Client = {
  id: string;
  name: string;
  investment: number;
  returns: number;
  tier: string;
  status: "Activo" | "Vencido";
  depositDate: string; // yyyy-mm-dd
  maturityDate: string; // yyyy-mm-dd
  compoundInterest: boolean;
  email: string;
  phone: string;
  pais: string;
  sexo: "Hombre" | "Mujer";
};

type KycStatus = "Pendiente" | "Aprobado" | "Rechazado";

export default function PartnerDashboard() {
  useScrollToTop();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("resumen");

  // Foto y teléfono (como en el dashboard de clientes)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("646 123 456");

  // Tooltip responsive: right en desktop, bottom en móvil
  const [tooltipSide, setTooltipSide] = useState<"right" | "bottom">("bottom");
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setTooltipSide(mq.matches ? "right" : "bottom");
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);


  // 👇 Necesario para habilitar Retiro cuando el depósito queda "Asignado"
  const [hasActiveDeposit, setHasActiveDeposit] = useState<boolean>(false);

  // ===== KYC: estado y manejadores =====
  const queryClient = useQueryClient();
  
  // Dialog states for document viewing
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [viewingDocuments, setViewingDocuments] = useState<string[] | null>(null);

  // KYC form data
  const [kycFormData, setKycFormData] = useState({
    fullName: "",
    documentType: "dni" as "dni" | "passport",
    documentNumber: "",
    country: "España",
    documentsUrls: [] as string[],
  });

  // Fetch KYC data
  const { data: kycData, isLoading: kycLoading } = useQuery({
    queryKey: ["/api/kyc/me"],
    enabled: !!user,
  });

  // KYC mutation
  const kycMutation = useMutation({
    mutationFn: async (formData: typeof kycFormData) => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/kyc/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error updating KYC");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/me"] });
    },
  });

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

  // KYC submit handler
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFormData.fullName || !kycFormData.documentNumber || !kycFormData.documentsUrls.length) return;
    
    try {
      await kycMutation.mutateAsync(kycFormData);
    } catch (error) {
      console.error('Error submitting KYC:', error);
    }
  };

  // Get KYC status and messages
  const currentKyc = kycData?.kyc;
  const kycStatus = currentKyc?.status === "approved" ? "Aprobado" : 
                   currentKyc?.status === "rejected" ? "Rechazado" : "Pendiente";
  const kycFeedback = currentKyc?.rejectionReason || "";
  const kycDocs = kycFormData.documentsUrls;

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

  // Document viewing functions
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

  // Filtros CLIENTES
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    inversionMin: "",
    inversionMax: "",
    gananciasMin: "",
    gananciasMax: "",
    pais: "",
    sexo: "",
    estado: "",
  });
  const [sortOrder, setSortOrder] = useState<"" | "asc" | "desc">("");
  // Filtro rápido por tarjetas
  const [quickFilter, setQuickFilter] =
    useState<"all" | "activos" | "compuesto" | "vencidos">("all");


  // Filtros CONTRATOS
  const [showContractFilters, setShowContractFilters] = useState(false);
  const [contractSort, setContractSort] = useState<"" | "amountDesc" | "amountAsc" | "endAsc" | "endDesc">("");
  const [contractQuickFilter, setContractQuickFilter] = useState<"all" | "vigentes" | "vencidos">("all");
  const [contractFilters, setContractFilters] = useState({
    search: "",
    status: "",
    type: "",
    tier: "",
    amountMin: "",
    amountMax: "",
    signedFrom: "",
    signedTo: "",
    vencimiento: "",
  });

  // Google Calendar (herramientas)
  const [gcalView, setGcalView] = useState<"month" | "week" | "agenda">("month");
  const [gcalTz, setGcalTz] = useState<string>("Europe/Madrid");
  const gcalPublicSrc = "es.spain%23holiday%40group.v.calendar.google.com";
  const gcalMode = useMemo(
    () => (gcalView === "agenda" ? "AGENDA" : gcalView === "week" ? "WEEK" : "MONTH"),
    [gcalView]
  );
  const gcalEmbedUrl = useMemo(
    () =>
      `https://calendar.google.com/calendar/embed?src=${gcalPublicSrc}&ctz=${encodeURIComponent(
        gcalTz
      )}&mode=${gcalMode}&wkst=1&showTitle=0&showPrint=0&showCalendars=0&showTabs=1&bgcolor=%230A1713`,
    [gcalMode, gcalTz]
  );
  const handleOpenGoogleCalendar = () => {
    window.open("https://calendar.google.com/calendar/u/0/r", "_blank", "noopener,noreferrer");
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setProfilePhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ======== CLIENTES: estado, alta y eliminación ========
  const todayISO = new Date().toISOString().slice(0, 10);
  const nextYearISO = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .slice(0, 10);

  const [clients, setClients] = useState<Client[]>([
    {
      id: "c1",
      name: "María González",
      investment: 150000,
      returns: 13500,
      tier: "Premium",
      status: "Activo",
      depositDate: "2024-01-15",
      maturityDate: "2026-01-15",
      compoundInterest: true,
      email: "maria.gonzalez@email.com",
      phone: "+34 666 123 456",
      pais: "España",
      sexo: "Mujer",
    },
    {
      id: "c2",
      name: "Carlos Ruiz",
      investment: 75000,
      returns: 6750,
      tier: "Standard",
      status: "Vencido",
      depositDate: "2024-03-10",
      maturityDate: "2024-12-10",
      compoundInterest: false,
      email: "carlos.ruiz@email.com",
      phone: "+34 666 789 012",
      pais: "Francia",
      sexo: "Hombre",
    },
    {
      id: "c3",
      name: "Ana López",
      investment: 200000,
      returns: 18000,
      tier: "Premium",
      status: "Activo",
      depositDate: "2024-08-20",
      maturityDate: "2026-08-20",
      compoundInterest: true,
      email: "ana.lopez@email.com",
      phone: "+34 666 345 678",
      pais: "Portugal",
      sexo: "Mujer",
    },
    {
      id: "c4",
      name: "Miguel Santos",
      investment: 120000,
      returns: 10800,
      tier: "Premium",
      status: "Vencido",
      depositDate: "2023-11-15",
      maturityDate: "2024-11-15",
      compoundInterest: true,
      email: "miguel.santos@email.com",
      phone: "+34 666 987 654",
      pais: "España",
      sexo: "Hombre",
    },
  ]);

  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState<Omit<Client, "id">>({
    name: "",
    investment: 50000,
    returns: 0,
    tier: "Standard",
    status: "Activo",
    depositDate: todayISO,
    maturityDate: nextYearISO,
    compoundInterest: true,
    email: "",
    phone: "",
    pais: "España",
    sexo: "Hombre",
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;
    setClients((prev) => [{ id: `c${Date.now()}`, ...newClient }, ...prev]);
    setNewClient({
      name: "",
      investment: 50000,
      returns: 0,
      tier: "Standard",
      status: "Activo",
      depositDate: todayISO,
      maturityDate: nextYearISO,
      compoundInterest: true,
      email: "",
      phone: "",
      pais: "España",
      sexo: "Hombre",
    });
    setShowAddClient(false);
  };

  // ✅ Doble verificación para eliminación
  const handleDeleteClient = (id: string, name: string) => {
    const first = confirm(`¿Seguro que quieres eliminar a "${name}"?`);
    if (!first) return;
    const second = confirm(
      `Última confirmación.\nEsta acción eliminará permanentemente a "${name}" y no se puede deshacer.\n¿Confirmas la eliminación?`
    );
    if (!second) return;
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // KPIs de clientes (para tarjetas rápidas y otras vistas)
  const statsClients = useMemo(() => {
    const total = clients.length;
    const activos = clients.filter((c) => c.status === "Activo").length;
    const comp = clients.filter((c) => c.compoundInterest).length;
    const vencidos = clients.filter((c) => {
      const days = Math.ceil((new Date(c.maturityDate).getTime() - Date.now()) / 86400000);
      return days <= 0 || c.status === "Vencido";
    }).length;
    return { total, activos, comp, vencidos };
  }, [clients]);

  // 📊 Estadísticas superiores del dashboard RESUMEN alimentadas por los clientes
  const resumenStats = useMemo(() => {
    const activeClients = clients.filter((c) => c.status === "Activo");
    const activeVolume = activeClients.reduce((sum, c) => sum + c.investment, 0);
    const expiringSoon = activeClients.filter((c) => {
      const days = Math.ceil((new Date(c.maturityDate).getTime() - Date.now()) / 86400000);
      return days > 0 && days <= 30;
    }).length;
    return { activeClients: activeClients.length, activeVolume, expiringSoon };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const list = clients
      .filter((client) => {
        const inversionMin = filters.inversionMin ? parseFloat(filters.inversionMin) : 0;
        const inversionMax = filters.inversionMax ? parseFloat(filters.inversionMax) : Infinity;
        const gananciasMin = filters.gananciasMin ? parseFloat(filters.gananciasMin) : 0;
        const gananciasMax = filters.gananciasMax ? parseFloat(filters.gananciasMax) : Infinity;

        // para detectar vencidos por fecha o estado
        const daysLeft = Math.ceil((new Date(client.maturityDate).getTime() - Date.now()) / 86400000);
        const isExpired = daysLeft <= 0 || client.status === "Vencido";

        const matchQuick =
          quickFilter === "all" ||
          (quickFilter === "activos" && client.status === "Activo") ||
          (quickFilter === "compuesto" && client.compoundInterest) ||
          (quickFilter === "vencidos" && isExpired);

        return (
          client.investment >= inversionMin &&
          client.investment <= inversionMax &&
          client.returns >= gananciasMin &&
          client.returns <= gananciasMax &&
          (filters.pais === "" || client.pais === filters.pais) &&
          (filters.sexo === "" || client.sexo === filters.sexo) &&
          (filters.estado === "" || client.status === filters.estado) &&
          matchQuick
        );
      })
      .sort((a, b) => {
        if (sortOrder === "desc") return b.investment - a.investment;
        if (sortOrder === "asc") return a.investment - b.investment;
        return 0;
      });

    return list;
  }, [clients, filters, sortOrder, quickFilter]);

  // días hasta comisión (para KPI de pagos)
  const calculateDaysToCommission = () => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const nextPayoutDate =
      currentDay <= 15 ? new Date(currentYear, currentMonth, 15) : new Date(currentYear, currentMonth + 1, 15);
    const daysDiff = Math.ceil((nextPayoutDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return daysDiff;
  };

  const partnerStats = {
    monthlyCommission: 15650,
    ytdCommission: 186200,
    nextTierProgress: 79,
    daysToCommission: calculateDaysToCommission(),
    tier: "Elite Partner",
  };

  // ====== CONTROL DE TABS DE PERFIL ======
  const [profileActiveTab, setProfileActiveTab] = useState("personal");

  return (
    <div
      className={[
        "relative min-h-screen text-white flex",
        "bg-gradient-to-br from-black via-[#0A1713] to-[#0E2A1F]",
        "before:pointer-events-none before:absolute before:inset-0",
        "before:bg-[radial-gradient(80%_60%_at_110%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(60%_40%_at_-20%_110%,rgba(16,185,129,0.12),transparent)]",
      ].join(" ")}
    >
      {/* Sidebar */}
      <aside
        className={[
          "w-64 fixed h-full p-6",
          "bg-black/40 backdrop-blur-sm",
          "border-r border-emerald-500/15",
          "shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_20px_60px_-20px_rgba(16,185,129,0.25)]",
        ].join(" ")}
      >
        <div className="flex items-center space-x-3 mb-8">
          <img src={logoImg} alt="Nakama&Partners" className="w-10 h-10 drop-shadow-[0_0_14px_rgba(16,185,129,0.35)]" />
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { key: "perfil", label: "Perfil", icon: User },
            { key: "resumen", label: "Resumen", icon: BarChart3 },
            { key: "clientes", label: "Clientes", icon: Users },
            { key: "contratos", label: "Contratos", icon: FileText },
            { key: "herramientas", label: "Herramientas", icon: Briefcase },
            { key: "deposito", label: "Depósito", icon: Banknote },
            { key: "retiro", label: "Retiro", icon: Wallet },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={[
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                activeTab === key
                  ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-50 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.45)]"
                  : "text-emerald-200 hover:bg-emerald-900/10",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}

          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-emerald-200 hover:text-emerald-50 hover:bg-emerald-900/10 mt-2"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Cerrar sesión
          </Button>
        </nav>

        {/* Badge estado */}
        <div className="mt-auto pt-8">
          <div className="bg-gradient-to-r from-emerald-600/15 to-emerald-400/10 border border-emerald-500/25 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-50 text-sm font-medium">{partnerStats.tier}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 ml-64">
        {/* ===== PERFIL ===== */}
        {activeTab === "perfil" && (
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
                    <form className="space-y-6">
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
                          <Input id="nombre" defaultValue="Test" className="bg-black/50 border-emerald-500/20 text-emerald-50" />
                        </div>
                        <div>
                          <Label htmlFor="apellidos" className="text-emerald-50">Apellidos</Label>
                          <Input id="apellidos" defaultValue="Placeholder" className="bg-black/50 border-emerald-500/20 text-emerald-50" />
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
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="Ej: +34 646 123 456"
                              className="bg-black/50 border-emerald-500/20 text-emerald-50 pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="fecha-nacimiento" className="text-emerald-50">Fecha de Nacimiento</Label>
                          <Input id="fecha-nacimiento" defaultValue="25/02/1962" className="bg-black/50 border-emerald-500/20 text-emerald-50" />
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
                          <Select defaultValue="espana">
                            <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                              <SelectItem value="espana">España</SelectItem>
                              <SelectItem value="francia">Francia</SelectItem>
                              <SelectItem value="portugal">Portugal</SelectItem>
                              <SelectItem value="italia">Italia</SelectItem>
                              <SelectItem value="alemania">Alemania</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div />
                      </div>

                      <div>
                        <Label htmlFor="direccion" className="text-emerald-50">Dirección</Label>
                        <Input
                          id="direccion"
                          defaultValue="Calle Nueva Era 45, 2ºA, 08035 Barcelona"
                          className="bg-black/50 border-emerald-500/20 text-emerald-50"
                        />
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold"
                        >
                          ACTUALIZAR INFORMACIÓN PERSONAL
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

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
        )}

        {/* ===== RESUMEN ===== */}
        {activeTab === "resumen" && (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-emerald-50 mb-2">
                Hola, {user?.name?.split(" ")[0] ?? "Partner"}
              </h1>
              <p className="text-emerald-200/80 text-lg mb-6">Bienvenido a tu panel de control ejecutivo</p>

              {/* KPI grid (3 tarjetas) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                  {
                    label: "Comisiones Este Mes",
                    value: `$${partnerStats.monthlyCommission.toLocaleString()}`,
                    note: "¡Excelente rendimiento!",
                    icon: DollarSign,
                  },
                  {
                    label: "Total Año 2025",
                    value: `$${(partnerStats.ytdCommission / 1000).toFixed(0)}K`,
                    note: "Objetivo: $250K (75% completado)",
                    icon: Star,
                  },
                  {
                    label: partnerStats.daysToCommission === 1 ? "Día para Cobro" : "Días para Cobro",
                    value: `${partnerStats.daysToCommission}`,
                    note:
                      partnerStats.daysToCommission <= 0
                        ? "¡Hoy es día de pago!"
                        : partnerStats.daysToCommission === 1
                        ? "Mañana es día de pago"
                        : "Próximo pago de comisiones",
                    icon: Calendar,
                  },
                ].map(({ label, value, note, icon: Icon }, i) => (
                  <Card
                    key={i}
                    className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">{label}</p>
                          <p className="text-emerald-50 text-3xl font-bold">{value}</p>
                          <p className="text-emerald-400 text-xs">{note}</p>
                        </div>
                        <Icon className="w-8 h-8 text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>


            </div>

            {/* Métricas superiores DINÁMICAS basadas en clientes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Clientes Activos", value: resumenStats.activeClients, icon: Users, clickable: true },
                {
                  label: "Volumen Activo",
                  value: `$${resumenStats.activeVolume.toLocaleString()}`,
                  icon: TrendingUp,
                  clickable: false,
                },
                { label: "Por vencer (≤30 días)", value: resumenStats.expiringSoon, icon: UserPlus, clickable: false },
              ].map(({ label, value, icon: Icon, clickable }, i) => (
                <Card 
                  key={i} 
                  className={`bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 ${
                    clickable ? 'cursor-pointer hover:bg-black/50 hover:border-emerald-500/25 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.2)]' : ''
                  }`}
                  onClick={clickable ? () => setActiveTab("clientes") : undefined}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-200/80 text-sm font-medium">{label}</p>
                        <p className="text-emerald-50 text-3xl font-bold">{value}</p>
                        <p className="text-emerald-400 text-xs">
                          {clickable ? "Click para ver detalles" : "Actualizado"}
                        </p>
                      </div>
                      <Icon className="w-8 h-8 text-emerald-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Chart */}
            <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 mb-8">
              <CardHeader>
                <CardTitle className="text-emerald-50">
                  <span className="inline-flex items-center gap-4">
                    Comparación: Con Interés vs Sin Interés Compuesto
                    {/*<TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-8 h-8 text-emerald-300/90 hover:text-emerald-300 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent
                          side={tooltipSide}
                          align={tooltipSide === "right" ? "start" : "center"}
                          sideOffset={tooltipSide === "right" ? 12 : 8}
                          avoidCollisions={tooltipSide === "right" ? false : true}
                          className="max-w-[260px] md:max-w-[420px] lg:max-w-[440px] p-3 md:p-4 text-sm md:text-base leading-relaxed bg-black/100 text-emerald-50 border border-emerald-500/25 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
                        >
                          El interés compuesto reinvierte automáticamente los intereses generados,
                          así cada período calculas intereses sobre el capital inicial + los intereses previos.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>*/}
                  </span>
                </CardTitle>
                <CardDescription className="text-emerald-200/80">
                  Visualización del crecimiento de €50,000 con 9% anual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompoundInterestChart initialAmount={50000} rate={0.09} years={10} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== CLIENTES ===== */}
        {activeTab === "clientes" && (
          <div>
            <h1 className="text-3xl font-bold text-emerald-50 mb-2">Gestión de Clientes</h1>
            <p className="text-emerald-200/80 mb-6">Administra tu cartera de inversores y gestiona renovaciones</p>

            {/* Filtros */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </Button>

                {(Object.values(filters).some((v) => v !== "") || sortOrder !== "") && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilters({
                        inversionMin: "",
                        inversionMax: "",
                        gananciasMin: "",
                        gananciasMax: "",
                        pais: "",
                        sexo: "",
                        estado: "",
                      });
                      setSortOrder("");
                      setQuickFilter("all");
                    }}
                    className="text-emerald-200 hover:text-emerald-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>

              {showFilters && (
                <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Orden */}
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Ordenar por inversión</Label>
                        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "asc" | "desc")}>
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Sin orden" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desc">Mayor a menor</SelectItem>
                            <SelectItem value="asc">Menor a mayor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-emerald-50">Inversión Inicial</Label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Mín"
                            value={filters.inversionMin}
                            onChange={(e) => setFilters({ ...filters, inversionMin: e.target.value })}
                            className="bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                          />
                          <Input
                            placeholder="Máx"
                            value={filters.inversionMax}
                            onChange={(e) => setFilters({ ...filters, inversionMax: e.target.value })}
                            className="bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-emerald-50">Dinero Ganado</Label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Mín"
                            value={filters.gananciasMin}
                            onChange={(e) => setFilters({ ...filters, gananciasMin: e.target.value })}
                            className="bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                          />
                          <Input
                            placeholder="Máx"
                            value={filters.gananciasMax}
                            onChange={(e) => setFilters({ ...filters, gananciasMax: e.target.value })}
                            className="bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-emerald-50">País</Label>
                        <Select value={filters.pais} onValueChange={(value) => setFilters({ ...filters, pais: value })}>
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Seleccionar país" />
                          </SelectTrigger>
                          <SelectContent>
                            {["España", "Francia", "Portugal", "Italia", "Alemania"].map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-emerald-50">Sexo</Label>
                        <Select value={filters.sexo} onValueChange={(value) => setFilters({ ...filters, sexo: value })}>
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Seleccionar sexo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hombre">Hombre</SelectItem>
                            <SelectItem value="Mujer">Mujer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-emerald-50">Estado</Label>
                        <Select value={filters.estado} onValueChange={(value) => setFilters({ ...filters, estado: value })}>
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Vencido">Vencido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Stats rápidos (dinámicos) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { key: "all",       value: String(statsClients.total),   label: "Total Clientes" },
                { key: "activos",   value: String(statsClients.activos), label: "Activos" },
                { key: "compuesto", value: String(statsClients.comp),    label: "Con Interés Compuesto" },
                { key: "vencidos",  value: String(statsClients.vencidos),label: "Vencidos" },
              ].map(({ key, value, label }) => {
                const active = quickFilter === (key as typeof quickFilter);
                const baseBorder =
                  key === "activos"   ? "border-emerald-500/25" :
                  key === "compuesto" ? "border-amber-500/20" :
                  key === "vencidos"  ? "border-red-500/20"   :
                                        "border-emerald-500/15";
                const baseText =
                  key === "activos"   ? "text-emerald-400" :
                  key === "compuesto" ? "text-amber-400"   :
                  key === "vencidos"  ? "text-red-400"     :
                                        "text-emerald-50";

                return (
                  <Card
                    key={key}
                    role="button"
                    onClick={() => setQuickFilter(key as typeof quickFilter)}
                    className={[
                      "bg-black/40 rounded-2xl cursor-pointer select-none transition-all border",
                      baseBorder,
                      active ? "ring-1 ring-emerald-400/60" : "",
                      "hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_10px_30px_-12px_rgba(16,185,129,0.35)]",
                    ].join(" ")}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`text-2xl font-bold ${baseText}`}>{value}</div>
                      <p className="text-emerald-200/80 text-sm">{label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Cartera */}
            <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
              {/* Encabezado izquierda + botón */}
              <CardHeader className="items-start">
                <CardTitle className="text-emerald-50">Cartera de Clientes</CardTitle>
                <CardDescription className="text-emerald-200/80">
                  Información detallada para seguimiento y renovaciones
                </CardDescription>
                <div className="mt-4">
                  <Button
                    variant={showAddClient ? "outline" : "default"}
                    onClick={() => setShowAddClient((v) => !v)}
                    className={showAddClient ? "border-emerald-500/25" : "bg-emerald-600 hover:bg-emerald-500"}
                  >
                    {showAddClient ? <X className="w-4 h-4 mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                    {showAddClient ? "Cancelar" : "Añadir cliente"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {/* Formulario alta */}
                {showAddClient && (
                  <form
                    onSubmit={handleAddClient}
                    className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4 bg-black/30 p-4 rounded-xl border border-emerald-500/15"
                  >
                    <div className="space-y-1">
                      <Label className="text-emerald-50">Nombre</Label>
                      <Input
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-emerald-50">Email</Label>
                      <Input
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-emerald-50">Teléfono</Label>
                      <Input
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-emerald-50">Inversión (€)</Label>
                      <Input
                        type="number"
                        value={newClient.investment}
                        onChange={(e) => setNewClient({ ...newClient, investment: parseFloat(e.target.value || "0") })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                        min={0}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-emerald-50">Rendimientos (€)</Label>
                      <Input
                        type="number"
                        value={newClient.returns}
                        onChange={(e) => setNewClient({ ...newClient, returns: parseFloat(e.target.value || "0") })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                        min={0}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-emerald-50">Tier</Label>
                      <Select value={newClient.tier} onValueChange={(v) => setNewClient({ ...newClient, tier: v })}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Elite">Elite</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-emerald-50">Estado</Label>
                      <Select value={newClient.status} onValueChange={(v: "Activo" | "Vencido") => setNewClient({ ...newClient, status: v })}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Vencido">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-emerald-50">Fecha Depósito</Label>
                      <Input
                        type="date"
                        value={newClient.depositDate}
                        onChange={(e) => setNewClient({ ...newClient, depositDate: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-emerald-50">Fecha Vencimiento</Label>
                      <Input
                        type="date"
                        value={newClient.maturityDate}
                        onChange={(e) => setNewClient({ ...newClient, maturityDate: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-emerald-50">País</Label>
                      <Select value={newClient.pais} onValueChange={(v) => setNewClient({ ...newClient, pais: v })}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="País" />
                        </SelectTrigger>
                        <SelectContent>
                          {["España", "Francia", "Portugal", "Italia", "Alemania"].map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-emerald-50">Sexo</Label>
                      <Select value={newClient.sexo} onValueChange={(v: "Hombre" | "Mujer") => setNewClient({ ...newClient, sexo: v })}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Sexo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hombre">Hombre</SelectItem>
                          <SelectItem value="Mujer">Mujer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-emerald-50">Interés Compuesto</Label>
                      <Select
                        value={newClient.compoundInterest ? "si" : "no"}
                        onValueChange={(v) => setNewClient({ ...newClient, compoundInterest: v === "si" })}
                      >
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Sí / No" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="si">Sí</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  </form>
                )}

                {/* Lista de clientes */}
                <div className="space-y-6">
                  {filteredClients.map((client) => {
                    const daysToMaturity = Math.ceil(
                      (new Date(client.maturityDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                    );
                    const isNearMaturity = daysToMaturity <= 30 && daysToMaturity > 0;
                    const isExpired = daysToMaturity <= 0;

                    return (
                      <Card
                        key={client.id}
                        className={`relative bg-black/30 border ${
                          isNearMaturity ? "border-amber-500/50" : isExpired ? "border-red-500/50" : "border-emerald-500/15"
                        } hover:bg-black/40 transition-all rounded-2xl`}
                      >
                        {/* Eliminar */}
                        <div className="absolute top-3 right-3 z-[1]">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                            title="Eliminar cliente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Info */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-full flex items-center justify-center">
                                  <span className="text-emerald-400 font-semibold">
                                    {client.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-emerald-50 font-semibold text-lg">{client.name}</h3>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs border-emerald-500/25 text-emerald-200">
                                      {client.tier}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs border ${
                                        client.status === "Activo"
                                          ? "border-emerald-500/40 text-emerald-300"
                                          : isNearMaturity
                                          ? "border-amber-500/40 text-amber-300"
                                          : "border-emerald-500/25 text-emerald-200"
                                      }`}
                                    >
                                      {client.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 text-sm">
                                <p className="text-emerald-200/80">{client.email}</p>
                                <p className="text-emerald-200/80">{client.phone}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs border-emerald-500/20 text-emerald-200/90">
                                    {client.pais}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs border-emerald-500/20 text-emerald-200/90">
                                    {client.sexo}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Detalles */}
                            <div className="space-y-4">
                              <div>
                                <p className="text-emerald-200/80 text-sm">Inversión Inicial</p>
                                <p className="text-emerald-50 font-bold text-2xl">${client.investment.toLocaleString()}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-emerald-200/80">Fecha Depósito</p>
                                    <p className="text-emerald-50 font-medium">
                                      {new Date(client.depositDate).toLocaleDateString("es-ES")}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-emerald-200/80">Interés Compuesto</p>
                                    <p className={`font-medium ${client.compoundInterest ? "text-emerald-400" : "text-amber-400"}`}>
                                      {client.compoundInterest ? "Sí" : "No"}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-emerald-200/80">Fecha Vencimiento</p>
                                  <p className="text-emerald-50 font-medium">
                                    {new Date(client.maturityDate).toLocaleDateString("es-ES")}
                                  </p>
                                  <p
                                    className={`text-sm font-medium ${
                                      isExpired ? "text-red-400" : isNearMaturity ? "text-amber-400" : "text-emerald- 400"
                                    }`}
                                  >
                                    {isExpired
                                      ? "Vencido"
                                      : isNearMaturity
                                      ? `Vence en ${daysToMaturity} días`
                                      : `${daysToMaturity} días restantes`}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Rendimientos + acciones */}
                            <div className="space-y-4">
                              <div>
                                <p className="text-emerald-200/80 text-sm">Rendimientos</p>
                                <p className="text-emerald-400 font-extrabold text-3xl">
                                  +${client.returns.toLocaleString()}
                                </p>
                              </div>

                              <div className="space-y-2">
                                {(isNearMaturity || isExpired) && (
                                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm">
                                    Gestionar Renovación
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  className="w-full text-emerald-50 border-emerald-500/20 hover:bg-emerald-900/10 text-sm"
                                >
                                  Ver Detalle Completo
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== CONTRATOS ===== */}
        {activeTab === "contratos" && (
          <div>
            <h1 className="text-3xl font-bold text-emerald-50 mb-2">Contratos Firmados</h1>
            <p className="text-emerald-200/80 mb-6">Accede y descarga todos tus contratos y documentos legales</p>

            {/* Filtros Contratos */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowContractFilters(!showContractFilters)}
                  className="border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showContractFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </Button>

                {(Object.values(contractFilters).some((v) => v !== "") || contractSort !== "" || contractQuickFilter !== "all") && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setContractFilters({
                        search: "",
                        status: "",
                        type: "",
                        tier: "",
                        amountMin: "",
                        amountMax: "",
                        signedFrom: "",
                        signedTo: "",
                        vencimiento: "",
                      });
                      setContractSort("");
                      setContractQuickFilter("all");
                    }}
                    className="text-emerald-200 hover:text-emerald-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>

              {showContractFilters && (
                <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Búsqueda */}
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Búsqueda</Label>
                        <Input
                          placeholder="Buscar por cliente o tipo de contrato…"
                          value={contractFilters.search}
                          onChange={(e) => setContractFilters({ ...contractFilters, search: e.target.value })}
                          className="bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                        />
                      </div>

                      {/* Estado */}
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Estado del Contrato</Label>
                        <Select
                          value={contractFilters.status}
                          onValueChange={(value) => setContractFilters({ ...contractFilters, status: value })}
                        >
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Todos los estados" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vigente">Vigente</SelectItem>
                            <SelectItem value="Vencido">Vencido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tipo */}
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Tipo de Producto</Label>
                        <Select
                          value={contractFilters.type}
                          onValueChange={(value) => setContractFilters({ ...contractFilters, type: value })}
                        >
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Todos los tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inversión Estructurada">Inversión Estructurada</SelectItem>
                            <SelectItem value="Plan de Ahorro">Plan de Ahorro</SelectItem>
                            <SelectItem value="Inversión Patrimonial">Inversión Patrimonial</SelectItem>
                            <SelectItem value="Contrato Marco">Contrato Marco</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tier del Cliente */}
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Categoría del Cliente</Label>
                        <Select
                          value={contractFilters.tier}
                          onValueChange={(value) => setContractFilters({ ...contractFilters, tier: value })}
                        >
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Todas las categorías" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                            <SelectItem value="Elite">Elite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Importe Invertido */}
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Importe Invertido (€)</Label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Mínimo"
                            value={contractFilters.amountMin}
                            onChange={(e) => setContractFilters({ ...contractFilters, amountMin: e.target.value })}
                            className="bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                          />
                          <Input
                            placeholder="Máximo"
                            value={contractFilters.amountMax}
                            onChange={(e) => setContractFilters({ ...contractFilters, amountMax: e.target.value })}
                            className="bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                          />
                        </div>
                      </div>

                      {/* Orden */}
                      <div className="space-y-2">
                        <Label className="text-emerald-50">Ordenar por</Label>
                        <Select value={contractSort} onValueChange={(v) => setContractSort(v as typeof contractSort)}>
                          <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                            <SelectValue placeholder="Sin orden específico" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amountDesc">Mayor importe invertido</SelectItem>
                            <SelectItem value="amountAsc">Menor importe invertido</SelectItem>
                            <SelectItem value="endAsc">Próximos a vencer</SelectItem>
                            <SelectItem value="endDesc">Vencimiento más lejano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Lista de contratos */}
            {(() => {
              const contractsData = [
                {
                  cliente: "María González Martín",
                  type: "Inversión Estructurada",
                  tier: "Premium",
                  amount: 250000,
                  status: "Vigente",
                  signedDate: "2024-06-15",
                  endDate: "2025-06-15",
                  fileUrl: "#",
                  duracion: "12 meses",
                  comision: 8500,
                  renovaciones: 2,
                },
                {
                  cliente: "Carlos Ruiz Fernández",
                  type: "Plan de Ahorro",
                  tier: "Standard",
                  amount: 85000,
                  status: "Vigente",
                  signedDate: "2024-03-10",
                  endDate: "2025-03-10",
                  fileUrl: "#",
                  duracion: "12 meses",
                  comision: 3200,
                  renovaciones: 1,
                },
                {
                  cliente: "Ana López Santos",
                  type: "Inversión Patrimonial",
                  tier: "Elite",
                  amount: 500000,
                  status: "Vencido",
                  signedDate: "2023-08-20",
                  endDate: "2024-08-20",
                  fileUrl: "#",
                  duracion: "12 meses",
                  comision: 18000,
                  renovaciones: 0,
                },
                {
                  cliente: "Miguel Santos Torres",
                  type: "Contrato Marco",
                  tier: "Premium",
                  amount: 180000,
                  status: "Vencido",
                  signedDate: "2023-11-15",
                  endDate: "2024-11-15",
                  fileUrl: "#",
                  duracion: "12 meses",
                  comision: 6200,
                  renovaciones: 3,
                },
              ];

              const q = contractFilters.search.trim().toLowerCase();
              const min = contractFilters.amountMin ? parseFloat(contractFilters.amountMin) : -Infinity;
              const max = contractFilters.amountMax ? parseFloat(contractFilters.amountMax) : Infinity;
              const from = contractFilters.signedFrom ? new Date(contractFilters.signedFrom) : null;
              const to = contractFilters.signedTo ? new Date(contractFilters.signedTo) : null;
              const vencLimit = contractFilters.vencimiento ? parseInt(contractFilters.vencimiento, 10) : null;

              const filtered = contractsData
                .filter((c) => {
                  const matchSearch =
                    !q ||
                    c.cliente.toLowerCase().includes(q) ||
                    c.type.toLowerCase().includes(q);
                  const matchStatus = !contractFilters.status || c.status === contractFilters.status;
                  const matchType = !contractFilters.type || c.type === contractFilters.type;
                  const matchTier = !contractFilters.tier || c.tier === contractFilters.tier;
                  const matchAmount = c.amount >= min && c.amount <= max;

                  const signed = new Date(c.signedDate);
                  const matchFrom = !from || signed >= from;
                  const matchTo = !to || signed <= to;

                  const end = new Date(c.endDate);
                  const daysLeft = Math.ceil((end.getTime() - Date.now()) / 86400000);
                  const matchVenc = !vencLimit || (daysLeft > 0 && daysLeft <= vencLimit);

                  // Aplicar filtro rápido
                  const matchQuickFilter =
                    contractQuickFilter === "all" ||
                    (contractQuickFilter === "vigentes" && c.status === "Vigente") ||
                    (contractQuickFilter === "vencidos" && c.status === "Vencido");

                  return (
                    matchSearch &&
                    matchStatus &&
                    matchType &&
                    matchTier &&
                    matchAmount &&
                    matchFrom &&
                    matchTo &&
                    matchVenc &&
                    matchQuickFilter
                  );
                })
                .sort((a, b) => {
                  if (contractSort === "amountDesc") return b.amount - a.amount;
                  if (contractSort === "amountAsc") return a.amount - b.amount;
                  if (contractSort === "endAsc") return +new Date(a.endDate) - +new Date(b.endDate);
                  if (contractSort === "endDesc") return +new Date(b.endDate) - +new Date(a.endDate);
                  return 0;
                });

              return (
                <div className="space-y-4">
                  {/* Tarjetas de filtro rápido */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { key: "all", value: String(filtered.length), label: "Total Contratos" },
                      { key: "vigentes", value: String(filtered.filter(c => c.status === "Vigente").length), label: "Vigentes" },
                      { key: "vencidos", value: String(filtered.filter(c => c.status === "Vencido").length), label: "Vencidos" },
                    ].map(({ key, value, label }) => {
                      const active = contractQuickFilter === (key as typeof contractQuickFilter);
                      const baseBorder =
                        key === "vigentes" ? "border-emerald-500/25" :
                        key === "vencidos" ? "border-red-500/20" :
                                            "border-emerald-500/15";
                      const baseText =
                        key === "vigentes" ? "text-emerald-400" :
                        key === "vencidos" ? "text-red-400" :
                                            "text-emerald-50";

                      return (
                        <Card
                          key={key}
                          role="button"
                          onClick={() => setContractQuickFilter(key as typeof contractQuickFilter)}
                          className={[
                            "bg-black/40 rounded-2xl cursor-pointer select-none transition-all border",
                            baseBorder,
                            active ? "ring-1 ring-emerald-400/60" : "",
                            "hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_10px_30px_-12px_rgba(16,185,129,0.35)]",
                          ].join(" ")}
                        >
                          <CardContent className="p-4 text-center">
                            <div className={`text-2xl font-bold ${baseText}`}>{value}</div>
                            <p className="text-emerald-200/80 text-sm">{label}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-emerald-50">Listado de Contratos</h3>
                    <p className="text-emerald-200/80">
                      {filtered.length} contrato{filtered.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {filtered.map((c, index) => {
                      const end = new Date(c.endDate);
                      const daysLeft = Math.ceil((end.getTime() - Date.now()) / 86400000);
                      const isNear = daysLeft <= 30 && daysLeft > 0;
                      const isExpired = daysLeft <= 0;
                      const isVigente = c.status === "Vigente";

                      return (
                        <Card
                          key={`${c.cliente}-${index}`}
                          className={`bg-black/30 ${
                            isVigente ? "border-2 border-emerald-400" : 
                            isExpired ? "border border-red-500/50" : 
                            "border border-emerald-500/15"
                          } rounded-xl hover:bg-black/40 transition-colors`}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              {/* Cliente y Tipo */}
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`p-3 rounded-xl ${
                                  isVigente ? "bg-emerald-500/20 border border-emerald-500/30" : 
                                  isExpired ? "bg-red-500/20 border border-red-500/30" : 
                                  "bg-gray-500/20 border border-gray-500/30"
                                }`}>
                                  <FileText className={`w-6 h-6 ${
                                    isVigente ? "text-emerald-400" : 
                                    isExpired ? "text-red-400" : 
                                    "text-gray-400"
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-emerald-50 font-bold text-lg">{c.cliente}</p>
                                  <p className="text-emerald-200/80 text-sm font-medium">{c.type}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs border ${
                                        isVigente ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" : 
                                        isExpired ? "border-red-500/40 text-red-300 bg-red-500/10" : 
                                        "border-gray-500/40 text-gray-300 bg-gray-500/10"
                                      }`}
                                    >
                                      {c.status}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs border-emerald-500/25 text-emerald-200">
                                      {c.tier}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Información Financiera */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                                <div>
                                  <p className="text-emerald-200/60 text-xs font-medium uppercase tracking-wide">Importe Invertido</p>
                                  <p className="text-emerald-50 font-bold text-lg">
                                    €{c.amount.toLocaleString()}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="text-emerald-200/60 text-xs font-medium uppercase tracking-wide">Inicio del Contrato</p>
                                  <p className="text-emerald-50 font-medium">
                                    {new Date(c.signedDate).toLocaleDateString("es-ES")}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="text-emerald-200/60 text-xs font-medium uppercase tracking-wide">Vencimiento</p>
                                  <p className="text-emerald-50 font-medium">
                                    {end.toLocaleDateString("es-ES")}
                                  </p>
                                  <p
                                    className={`text-xs font-medium ${
                                      isExpired ? "text-red-400" : isNear ? "text-amber-400" : "text-emerald-400"
                                    }`}
                                  >
                                    {isExpired
                                      ? "Vencido"
                                      : daysLeft === 1
                                      ? "Mañana"
                                      : daysLeft <= 0
                                      ? "—"
                                      : `En ${daysLeft} días`}
                                  </p>
                                </div>
                              </div>

                              {/* Acciones */}
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-emerald-500/25 text-emerald-50 hover:bg-emerald-900/10"
                                  onClick={() => window.open(c.fileUrl, "_blank", "noopener,noreferrer")}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Descargar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ===== HERRAMIENTAS ===== */}
        {activeTab === "herramientas" && (
          <div>
            <h1 className="text-3xl font-bold text-emerald-50 mb-2">Herramientas de Partner</h1>
            <p className="text-emerald-200/80 mb-6">Gestión de agenda, material de marketing y recursos para partners</p>

            <Tabs defaultValue="calendario" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-emerald-500/15">
                <TabsTrigger value="calendario" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-50">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendario
                </TabsTrigger>
                <TabsTrigger value="material" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-50">
                  <Download className="w-4 h-4 mr-2" />
                  Material Descargable
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendario" className="mt-6">
                <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-emerald-400" />
                        <div>
                          <CardTitle className="text-emerald-50">Google Calendar</CardTitle>
                          <CardDescription className="text-emerald-200/80">
                            Consulta festivos y organiza tus citas
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {/* Vista */}
                        <div className="w-40">
                          <Select value={gcalView} onValueChange={(v) => setGcalView(v as "month" | "week" | "agenda")}>
                            <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                              <SelectValue placeholder="Vista" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="month">Mes</SelectItem>
                              <SelectItem value="week">Semana</SelectItem>
                              <SelectItem value="agenda">Agenda</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Zona horaria */}
                        <div className="w-56">
                          <Select value={gcalTz} onValueChange={(v) => setGcalTz(v)}>
                            <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                              <SelectValue placeholder="Zona horaria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                              <SelectItem value="Europe/Lisbon">Europe/Lisbon</SelectItem>
                              <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                              <SelectItem value="UTC">UTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          onClick={handleOpenGoogleCalendar}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Abrir Google Calendar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl overflow-hidden border border-emerald-500/15">
                      <iframe
                        title="Calendario público"
                        src={gcalEmbedUrl}
                        className="w-full h-[720px]"
                        style={{ border: 0 }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="material" className="mt-6">
                <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Download className="w-6 h-6 text-emerald-400" />
                      <div>
                        <CardTitle className="text-emerald-50">Material Descargable</CardTitle>
                        <CardDescription className="text-emerald-200/80">
                          PDFs de marketing, presentaciones y plantillas de contratos estándar
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Marketing Materials */}
                    <div>
                      <h4 className="text-emerald-50 font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-emerald-400" />
                        Material de Marketing
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: "Brochure Nakama&Partners 2025", size: "2.4 MB", type: "PDF", desc: "Presentación corporativa completa" },
                          { name: "Presentación Productos", size: "8.1 MB", type: "PPTX", desc: "Catálogo de inversiones disponibles" },
                          { name: "Infografías Rentabilidad", size: "1.2 MB", type: "PDF", desc: "Gráficos comparativos de rendimiento" },
                          { name: "Material Redes Sociales", size: "5.7 MB", type: "ZIP", desc: "Banners, posts y contenido digital" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-emerald-500/10 hover:bg-black/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-emerald-400" />
                              <div>
                                <p className="text-emerald-50 font-medium">{item.name}</p>
                                <p className="text-emerald-200/60 text-sm">{item.desc}</p>
                                <p className="text-emerald-200/40 text-xs">{item.type} • {item.size}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-emerald-500/20 text-emerald-300 hover:bg-emerald-900/10"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Descargar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contract Templates */}
                    <div>
                      <h4 className="text-emerald-50 font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        Plantillas de Contratos
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: "Contrato Inversión Estructurada", size: "186 KB", type: "DOCX", desc: "Contrato estándar para inversiones estructuradas" },
                          { name: "Plan de Ahorro Estándar", size: "142 KB", type: "DOCX", desc: "Plantilla para planes de ahorro regulares" },
                          { name: "Inversión Patrimonial Elite", size: "203 KB", type: "DOCX", desc: "Contrato para clientes de alta patrimonial" },
                          { name: "Acuerdo Marco Partner", size: "167 KB", type: "PDF", desc: "Documento base de colaboración comercial" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-emerald-500/10 hover:bg-black/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-emerald-400" />
                              <div>
                                <p className="text-emerald-50 font-medium">{item.name}</p>
                                <p className="text-emerald-200/60 text-sm">{item.desc}</p>
                                <p className="text-emerald-200/40 text-xs">{item.type} • {item.size}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-emerald-500/20 text-emerald-300 hover:bg-emerald-900/10"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Descargar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-6 border-t border-emerald-500/15">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          variant="outline"
                          className="flex-1 border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Descargar Todo el Material de Marketing
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Descargar Todas las Plantillas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* ===== DEPÓSITO ===== */}
        {activeTab === "deposito" && (
          <DepositoView 
            setHasActiveDeposit={setHasActiveDeposit} 
            setActiveTab={setActiveTab}
            setProfileActiveTab={setProfileActiveTab}
          />
        )}

        {/* ===== RETIRO ===== */}
        {activeTab === "retiro" && (
          <RetiroView hasActiveDeposit={hasActiveDeposit} />
        )}
      </main>

      {/* Modal para ver documentos */}
      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="max-w-4xl bg-black/95 border border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="text-emerald-50">Documentos KYC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {viewingDocuments?.map((docUrl, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-emerald-500/15">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-50">Documento {index + 1}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(docUrl, '_blank')}
                  className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleCloseDocumentsDialog} className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/10">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

