import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  FileCheck,
  Package,
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  LogOut,
  BarChart3,
  Download,
  Filter,
  X,
  User as UserIcon,
  Crown,
  Calendar,
  History,
  TrendingUp,
  Minus,
  UserCheck,
  Euro,
  Target,
  UserMinus,
  Handshake,
  AlertTriangle,
  Clock,
  CheckCircle,
  Shield,
  Timer,
  DollarSign,
  Activity,
  Users2,
  TrendingDown
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import logoImg from "@/assets/Logo-removeBG_1753542032142.png";
import { generateAdminStatementPDF } from "@/utils/generateAdminStatementPDF";

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalContracts: number;
  pendingKyc: number;
  rejectedKyc: number;
}

interface KycData {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  country: string;
  status: "approved" | "pending" | "rejected";
  documentsUrls: string[] | null;
  rejectionReason: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  sponsor: string | null;
  grade: string;
  verificationStatus: string;
  createdAt: string;
  gender?: string | null; // se rellenará automáticamente
}

interface ProductData {
  id: number;
  name: string;
  interestRate: string;
  termDays: number;
  minAmount: string;
  maxAmount: string;
  status: string;
  autoRenewal: boolean;
  contractTemplate: string | null;
}

interface ContractData {
  id: number;
  userId: number;
  userName: string;
  productId: number;
  productName: string;
  amount: string;
  status: string;
  createdAt: string;
}

interface MonthlyEvolutionData {
  month: string;
  capital: number;
  clients: number;
  revenue: number;
  retention: number;
}

interface BusinessHealth {
  status: 'green' | 'yellow' | 'red';
  percentage: number;
  contractsAtRiskPercentage: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");

  // React Query for data fetching
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
  });

  const { data: kycData, isLoading: isLoadingKyc } = useQuery({
    queryKey: ["/api/admin/kyc"],
    enabled: !!user && user.role === "admin",
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/admin/products"],
    enabled: !!user && user.role === "admin",
  });

  const { data: contractsData, isLoading: isLoadingContracts } = useQuery({
    queryKey: ["/api/admin/contracts"],
    enabled: !!user && user.role === "admin",
  });

  const { data: auditLogsData, isLoading: isLoadingAuditLogs } = useQuery({
    queryKey: ["/api/admin/audit-logs"],
    enabled: !!user && user.role === "admin",
  });

  const { data: financialKpisData, isLoading: isLoadingKpis } = useQuery({
    queryKey: ["/api/admin/financial-kpis"],
    enabled: !!user && user.role === "admin",
  });

  // Combined loading state
  const loading = isLoadingUsers || isLoadingKyc || isLoadingProducts || isLoadingContracts || isLoadingAuditLogs || isLoadingKpis;

  // Business Health Helper Functions
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthMessage = (status: string, percentage: number) => {
    switch (status) {
      case 'green': 
        return `Crecimiento estable (${percentage}% cumplimiento objetivos)`;
      case 'yellow': 
        return `Riesgo medio (${percentage}% cumplimiento objetivos)`;
      case 'red': 
        return `Riesgo alto (${percentage}% cumplimiento objetivos)`;
      default: 
        return 'Estado desconocido';
    }
  };

  // KYC Review Mutation
  const kycReviewMutation = useMutation({
    mutationFn: async ({ kycId, status, rejectionReason }: { kycId: number; status: string; rejectionReason?: string }) => {
      const response = await fetch(`/api/admin/kyc/${kycId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, rejectionReason }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc"] });
      // Also invalidate user-specific KYC queries in case user is viewing dashboard
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/me"] });
    },
  });

  // Derived data
  const users = usersData?.users || [];
  const kyc = kycData?.kyc || [];
  const products = productsData?.products || [];
  const contracts = contractsData?.contracts || [];
  const auditLogs = auditLogsData?.logs || [];
  const financialKpis = financialKpisData?.kpis || null;
  
  const stats = {
    totalUsers: users.length,
    totalProducts: products.length,
    totalContracts: contracts.length,
    pendingKyc: kyc.filter((k: KycData) => k.status === "pending").length,
    rejectedKyc: kyc.filter((k: KycData) => k.status === "rejected").length,
  };

  // ===== SEARCH & FILTER STATES =====
  // Usuarios
  const [userSearch, setUserSearch] = useState("");
  const [showUserFilters, setShowUserFilters] = useState(false);
  const [userFilters, setUserFilters] = useState({
    role: "",
    grade: "",
    verificationStatus: "",
    sponsor: "",
    gender: "", // filtro de género
    dateFrom: "",
    dateTo: "",
  });
  const [userSort, setUserSort] = useState<"" | "created_desc" | "created_asc" | "name_asc" | "name_desc">("");

  // KYC
  const [kycSearch, setKycSearch] = useState("");
  const [kycFilter, setKycFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [showKycFilters, setShowKycFilters] = useState(false);
  const [kycAdvancedFilters, setKycAdvancedFilters] = useState({
    documentType: "",
    country: "",
    dateFrom: "",
    dateTo: "",
  });
  const [kycSort, setKycSort] = useState<"" | "created_desc" | "created_asc" | "name_asc" | "name_desc">("");

  // 🔹 NUEVO: filtro específico por Estado (Aprobado / Rechazado) en filtros avanzados
  const [kycStateAr, setKycStateAr] = useState<"" | "approved" | "rejected">("");

  // Productos
  const [productSearch, setProductSearch] = useState("");
  const [showProductFilters, setShowProductFilters] = useState(false);
  const [productFilters, setProductFilters] = useState({
    status: "",
    autoRenewal: "",
    rateMin: "",
    rateMax: "",
    termMin: "",
    termMax: "",
    amountMin: "",
    amountMax: "",
  });
  const [productSort, setProductSort] = useState<"" | "rate_desc" | "rate_asc" | "term_desc" | "term_asc">("");

  // Contratos
  const [contractSearch, setContractSearch] = useState("");
  const [showContractFilters, setShowContractFilters] = useState(false);
  const [contractFilters, setContractFilters] = useState({
    status: "",
    productName: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
  });
  const [contractSort, setContractSort] = useState<"" | "date_desc" | "date_asc" | "amount_desc" | "amount_asc">("");

  // Dialog states
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [editingKyc, setEditingKyc] = useState<KycData | null>(null);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [viewingDocuments, setViewingDocuments] = useState<string[] | null>(null);
  
  // KYC Review states
  const [kycReviewStatus, setKycReviewStatus] = useState<"approved" | "rejected">("approved");
  const [rejectionReason, setRejectionReason] = useState("");

  // User Profile Modal states
  const [showUserProfileDialog, setShowUserProfileDialog] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    sponsor: "",
    grade: "Bronze",
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    interestRate: "",
    termDays: "",
    minAmount: "",
    maxAmount: "",
    status: "active",
    autoRenewal: false,
    contractTemplate: "",
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/login");
      return;
    }
  }, [user]);

  // ====== Normalización / Inferencia de género ======
  const stripAccents = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const normalizeGender = (g: any): "" | "Hombre" | "Mujer" | "Otro" => {
    if (g == null) return "";
    const s = String(g).trim().toLowerCase();
    if (["hombre", "male", "m", "masculino"].includes(s)) return "Hombre";
    if (["mujer", "female", "f", "femenino"].includes(s)) return "Mujer";
    return "Otro";
  };

  // Overrides explícitos por nombre
  const NAME_GENDER_OVERRIDES: Record<string, "Hombre" | "Mujer"> = {
    juan: "Hombre",
    maria: "Mujer",
    maría: "Mujer",
  };

  const guessGenderFromName = (fullName: string): "Hombre" | "Mujer" | "Otro" => {
    if (!fullName) return "Otro";
    const first = stripAccents(fullName.split(/\s+/)[0].toLowerCase());
    return NAME_GENDER_OVERRIDES[first] ?? "Otro";
  };

  const ensureUsersHaveGender = (list: UserData[]): UserData[] =>
    list.map((u) => {
      const normalized = normalizeGender(u.gender);
      return {
        ...u,
        gender: normalized || guessGenderFromName(u.name),
      };
    });



  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const handleDownloadAdminPDF = async () => {
    try {
      console.log('Iniciando descarga de PDF admin...');
      
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      
      const adminData = {
        fecha: currentDate.toLocaleDateString('es-ES'),
        periodo: currentMonth,
        totalUsers: stats.totalUsers,
        totalProducts: stats.totalProducts,
        totalContracts: stats.totalContracts,
        pendingKyc: stats.pendingKyc,
        financialKpis: financialKpis ? {
          totalAUM: financialKpis.totalAUM,
          newCapitalMonth: financialKpis.newCapitalMonth,
          withdrawnCapitalMonth: financialKpis.withdrawnCapitalMonth,
          netCapitalGrowth: financialKpis.netCapitalGrowth,
          averageInvestment: financialKpis.averageInvestment,
          activeClients: financialKpis.activeClients,
          clientRetention: financialKpis.clientRetention,
          monthlyEvolution: financialKpis.monthlyEvolution
        } : undefined,
        kycStats: kycChartData,
        contractsStats: contractsChartData
      };

      console.log('Datos del admin para PDF:', adminData);
      
      await generateAdminStatementPDF(adminData);
      
      console.log('PDF admin descargado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF admin:', error);
      alert('Error al generar el PDF. Por favor revisa la consola para más detalles.');
    }
  };

  // Chart data
  const kycChartData = [
    { name: "Aprobados", value: kyc.filter((k) => k.status === "approved").length, color: "#22c55e" },
    { name: "Pendientes", value: kyc.filter((k) => k.status === "pending").length, color: "#f59e0b" },
    { name: "Rechazados", value: kyc.filter((k) => k.status === "rejected").length, color: "#ef4444" },
  ];

  const contractsChartData = [
    { name: "Activos", value: contracts.filter((c) => c.status === "active").length, color: "#22c55e" },
    { name: "Listos", value: contracts.filter((c) => c.status === "ready_to_start").length, color: "#f59e0b" },
    { name: "Completados", value: contracts.filter((c) => c.status === "completed").length, color: "#3b82f6" },
  ];

  // Helpers
  const endOfDay = (d: string) => {
    const t = new Date(d);
    t.setHours(23, 59, 59, 999);
    return t;
  };
  const fmtEur = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  // Unique values for dropdowns
  const userGrades = Array.from(new Set(users.map((u) => u.grade).filter(Boolean))) as string[];
  const userGenders = Array.from(
    new Set(users.map((u) => (normalizeGender(u.gender) || guessGenderFromName(u.name))).filter(Boolean))
  ) as string[];
  const kycCountries = ["España", "Francia", "Portugal", "Italia", "Alemania"];
  const kycDocTypes = Array.from(new Set(kyc.map((k) => k.documentType).filter(Boolean))) as string[];
  const contractProductNames = Array.from(new Set(contracts.map((c) => c.productName).filter(Boolean))) as string[];

  // ===== FILTERED COLLECTIONS =====
  // Usuarios
  const filteredUsers = users
    .filter(
      (u) =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.id.toString().includes(userSearch)
    )
    .filter((u) => (userFilters.role ? u.role === userFilters.role : true))
    .filter((u) => (userFilters.grade ? u.grade === userFilters.grade : true))
    .filter((u) =>
      userFilters.verificationStatus ? u.verificationStatus === userFilters.verificationStatus : true
    )
    .filter((u) =>
      userFilters.sponsor ? (u.sponsor || "").toLowerCase().includes(userFilters.sponsor.toLowerCase()) : true
    )
    .filter((u) =>
      userFilters.gender ? (normalizeGender(u.gender) || guessGenderFromName(u.name)) === userFilters.gender : true
    )
    .filter((u) =>
      userFilters.dateFrom ? new Date(u.createdAt) >= new Date(userFilters.dateFrom) : true
    )
    .filter((u) => (userFilters.dateTo ? new Date(u.createdAt) <= endOfDay(userFilters.dateTo) : true))
    .sort((a, b) => {
      if (userSort === "created_desc") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (userSort === "created_asc") return +new Date(a.createdAt) - +new Date(b.createdAt);
      if (userSort === "name_asc") return a.name.localeCompare(b.name);
      if (userSort === "name_desc") return b.name.localeCompare(a.name);
      return 0;
    });

  // KYC
  const filteredKyc = kyc
    .filter((k) => {
      const matchesSearch =
        k.fullName.toLowerCase().includes(kycSearch.toLowerCase()) ||
        k.documentNumber.toLowerCase().includes(kycSearch.toLowerCase()) ||
        k.id.toString().includes(kycSearch);
      const matchesStatus = kycFilter === "all" || k.status === kycFilter;
      return matchesSearch && matchesStatus;
    })
    .filter((k) => (kycAdvancedFilters.documentType ? k.documentType === kycAdvancedFilters.documentType : true))
    .filter((k) => (kycAdvancedFilters.country ? k.country === kycAdvancedFilters.country : true))
    .filter((k) =>
      kycAdvancedFilters.dateFrom ? new Date(k.createdAt) >= new Date(kycAdvancedFilters.dateFrom) : true
    )
    .filter((k) =>
      kycAdvancedFilters.dateTo ? new Date(k.createdAt) <= endOfDay(kycAdvancedFilters.dateTo) : true
    )
    // 🔹 Aplicar Estado Aprobado/Rechazado (ignora pendientes)
    .filter((k) => (kycStateAr ? k.status === kycStateAr : true))
    .sort((a, b) => {
      if (kycSort === "created_desc") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (kycSort === "created_asc") return +new Date(a.createdAt) - +new Date(b.createdAt);
      if (kycSort === "name_asc") return a.fullName.localeCompare(b.fullName);
      if (kycSort === "name_desc") return b.fullName.localeCompare(a.fullName);
      return 0;
    });

  // Productos
  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.id.toString().includes(productSearch)
    )
    .filter((p) => (productFilters.status ? p.status === productFilters.status : true))
    .filter((p) =>
      productFilters.autoRenewal === ""
        ? true
        : productFilters.autoRenewal === "true"
        ? p.autoRenewal
        : !p.autoRenewal
    )
    .filter((p) => {
      const rate = parseFloat(p.interestRate);
      const min = productFilters.rateMin ? parseFloat(productFilters.rateMin) : -Infinity;
      const max = productFilters.rateMax ? parseFloat(productFilters.rateMax) : Infinity;
      return rate >= min && rate <= max;
    })
    .filter((p) => {
      const term = p.termDays || 0;
      const min = productFilters.termMin ? parseInt(productFilters.termMin) : -Infinity;
      const max = productFilters.termMax ? parseInt(productFilters.termMax) : Infinity;
      return term >= min && term <= max;
    })
    .filter((p) => {
      const minAmt = parseInt(p.minAmount || "0");
      const maxAmt = parseInt(p.maxAmount || "0");
      const fMin = productFilters.amountMin ? parseInt(productFilters.amountMin) : -Infinity;
      const fMax = productFilters.amountMax ? parseInt(productFilters.amountMax) : Infinity;
      return (minAmt >= fMin && minAmt <= fMax) || (maxAmt >= fMin && maxAmt <= fMax);
    })
    .sort((a, b) => {
      if (productSort === "rate_desc") return parseFloat(b.interestRate) - parseFloat(a.interestRate);
      if (productSort === "rate_asc") return parseFloat(a.interestRate) - parseFloat(b.interestRate);
      if (productSort === "term_desc") return (b.termDays || 0) - (a.termDays || 0);
      if (productSort === "term_asc") return (a.termDays || 0) - (b.termDays || 0);
      return 0;
    });

  // Contratos
  const filteredContracts = contracts
    .filter(
      (c) =>
        c.userName.toLowerCase().includes(contractSearch.toLowerCase()) ||
        c.productName.toLowerCase().includes(contractSearch.toLowerCase()) ||
        c.id.toString().includes(contractSearch)
    )
    .filter((c) => (contractFilters.status ? c.status === contractFilters.status : true))
    .filter((c) => (contractFilters.productName ? c.productName === contractFilters.productName : true))
    .filter((c) =>
      contractFilters.dateFrom ? new Date(c.createdAt) >= new Date(contractFilters.dateFrom) : true
    )
    .filter((c) =>
      contractFilters.dateTo ? new Date(c.createdAt) <= endOfDay(contractFilters.dateTo) : true
    )
    .filter((c) => {
      const amt = parseInt(c.amount || "0");
      const min = contractFilters.amountMin ? parseInt(contractFilters.amountMin) : -Infinity;
      const max = contractFilters.amountMax ? parseInt(contractFilters.amountMax) : Infinity;
      return amt >= min && amt <= max;
    })
    .sort((a, b) => {
      if (contractSort === "date_desc") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (contractSort === "date_asc") return +new Date(a.createdAt) - +new Date(b.createdAt);
      if (contractSort === "amount_desc") return parseInt(b.amount) - parseInt(a.amount);
      if (contractSort === "amount_asc") return parseInt(a.amount) - parseInt(b.amount);
      return 0;
    });

  // ===== CRUD handlers (sin cambios relevantes) =====
  const handleCreateUser = async () => {
    try {
      if (!newUser.name || !newUser.email) {
        alert("Por favor complete todos los campos obligatorios");
        return;
      }
      if (!editingUser && (!newUser.password || newUser.password.length < 6)) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      const token = localStorage.getItem("token");
      let url = "/api/admin/users";
      let method = "POST";
      let body: any = { ...newUser };

      if (editingUser) {
        url = `/api/admin/users/${editingUser.id}`;
        method = "PUT";
        if (!newUser.password) {
          const { password, ...rest } = body;
          body = rest;
        }
      }

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert(editingUser ? "Usuario actualizado exitosamente" : "Usuario creado exitosamente");
        handleCloseUserDialog();
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo procesar el usuario"}`);
      }
    } catch (error) {
      console.error("Error creating/updating user:", error);
      alert("Error de conexión al procesar usuario");
    }
  };

  const handleCreateProduct = async () => {
    try {
      if (
        !newProduct.name ||
        !newProduct.interestRate ||
        !newProduct.termDays ||
        !newProduct.minAmount ||
        !newProduct.maxAmount
      ) {
        alert("Por favor complete todos los campos obligatorios");
        return;
      }
      if (isNaN(parseInt(newProduct.termDays)) || parseInt(newProduct.termDays) <= 0) {
        alert("El plazo debe ser un número válido mayor a 0");
        return;
      }

      const token = localStorage.getItem("token");
      let url = "/api/admin/products";
      let method = "POST";

      if (editingProduct) {
        url = `/api/admin/products/${editingProduct.id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...newProduct, termDays: parseInt(newProduct.termDays as any) }),
      });

      if (response.ok) {
        alert(editingProduct ? "Producto actualizado exitosamente" : "Producto creado exitosamente");
        handleCloseProductDialog();
        queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo procesar el producto"}`);
      }
    } catch (error) {
      console.error("Error creating/updating product:", error);
      alert("Error de conexión al procesar producto");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("¿Está seguro de que desea eliminar este usuario?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        alert("Usuario eliminado exitosamente");
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo eliminar el usuario"}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error de conexión al eliminar usuario");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("¿Está seguro de que desea eliminar este producto?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        alert("Producto eliminado exitosamente");
        queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo eliminar el producto"}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error de conexión al eliminar producto");
    }
  };

  const handleEditUser = (u: UserData) => {
    setEditingUser(u);
    setNewUser({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      sponsor: u.sponsor || "",
      grade: u.grade,
    });
    setShowUserDialog(true);
  };

  const handleEditProduct = (p: ProductData) => {
    setEditingProduct(p);
    setNewProduct({
      name: p.name,
      interestRate: p.interestRate,
      termDays: p.termDays.toString(),
      minAmount: p.minAmount,
      maxAmount: p.maxAmount,
      status: p.status,
      autoRenewal: p.autoRenewal,
      contractTemplate: p.contractTemplate || "",
    });
    setShowProductDialog(true);
  };

  const handleUpdateKycStatus = async (kycId: number, newStatus: "approved" | "pending" | "rejected") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/kyc/${kycId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert(
          `Estado KYC actualizado a ${
            newStatus === "approved" ? "Aprobado" : newStatus === "rejected" ? "Rechazado" : "Pendiente"
          }`
        );
        queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc"] });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo actualizar el estado KYC"}`);
      }
    } catch (error) {
      console.error("Error updating KYC status:", error);
      alert("Error de conexión al actualizar estado KYC");
    }
  };

  const handleUpdateContractStatus = async (
    contractId: number,
    newStatus: "active" | "ready_to_start" | "completed" | "cancelled"
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/contracts/${contractId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const statusText = {
          active: "Activo",
          ready_to_start: "Listo para Iniciar",
          completed: "Completado",
          cancelled: "Cancelado",
        };
        alert(`Estado del contrato actualizado a ${statusText[newStatus]}`);
        queryClient.invalidateQueries({ queryKey: ["/api/admin/contracts"] });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo actualizar el estado del contrato"}`);
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      alert("Error de conexión al actualizar estado del contrato");
    }
  };

  const handleCloseUserDialog = () => {
    setShowUserDialog(false);
    setEditingUser(null);
    setNewUser({ name: "", email: "", password: "", role: "client", sponsor: "", grade: "Bronze" });
  };

  const handleCloseProductDialog = () => {
    setShowProductDialog(false);
    setEditingProduct(null);
    setNewProduct({
      name: "",
      interestRate: "",
      termDays: "",
      minAmount: "",
      maxAmount: "",
      status: "active",
      autoRenewal: false,
      contractTemplate: "",
    });
  };

  const handleEditKyc = (k: KycData) => {
    setEditingKyc(k);
    setShowKycDialog(true);
  };

  const handleViewDocuments = (documentsUrls: string[] | null) => {
    if (!documentsUrls || documentsUrls.length === 0) {
      alert("No hay documentos disponibles para este registro KYC");
      return;
    }
    setViewingDocuments(documentsUrls);
    setShowDocumentsDialog(true);
  };

  const handleCloseDocumentsDialog = () => {
    setShowDocumentsDialog(false);
    setViewingDocuments(null);
  };
  const handleCloseKycDialog = () => {
    setShowKycDialog(false);
    setEditingKyc(null);
    setKycReviewStatus("approved");
    setRejectionReason("");
  };

  const handleUpdateKycForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKyc) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/kyc/${editingKyc.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: editingKyc.status }),
      });

      if (response.ok) {
        alert(
          `Estado KYC actualizado a ${
            editingKyc.status === "approved" ? "Aprobado" : editingKyc.status === "rejected" ? "Rechazado" : "Pendiente"
          }`
        );
        handleCloseKycDialog();
        queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc"] });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo actualizar el estado KYC"}`);
      }
    } catch (error) {
      console.error("Error updating KYC:", error);
      alert("Error de conexión al actualizar KYC");
    }
  };

  const handleEditContract = (c: any) => {
    setEditingContract(c);
    setShowContractDialog(true);
  };
  const handleCloseContractDialog = () => {
    setShowContractDialog(false);
    setEditingContract(null);
  };
  const handleUpdateContractForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/contracts/${editingContract.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: editingContract.status }),
      });

      if (response.ok) {
        const statusText = {
          active: "Activo",
          ready_to_start: "Listo para Iniciar",
          completed: "Completado",
          cancelled: "Cancelado",
        } as const;
        alert(`Estado del contrato actualizado a ${statusText[editingContract.status as keyof typeof statusText]}`);
        handleCloseContractDialog();
        queryClient.invalidateQueries({ queryKey: ["/api/admin/contracts"] });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo actualizar el estado del contrato"}`);
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      alert("Error de conexión al actualizar contrato");
    }
  };

  // ===== Navegación a FICHA de usuario (mejora botón "ver") =====
  const openUserProfileById = async (id: number) => {
    try {
      setLoadingUserProfile(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/user-profile/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        return;
      }

      const data = await response.json();
      setSelectedUserProfile(data.profile);
      setShowUserProfileDialog(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      alert('Error al obtener el perfil del usuario');
    } finally {
      setLoadingUserProfile(false);
    }
  };

  const openUserProfileByName = (fullName: string) => {
    const u = users.find((x) => x.name.toLowerCase() === fullName.toLowerCase());
    if (!u) {
      alert("No se encontró un usuario con ese nombre.");
      return;
    }
    openUserProfileById(u.id);
  };

  if (loading) {
    return (
      <div
        className={[
          "relative min-h-screen flex items-center justify-center",
          "bg-gradient-to-br from-black via-[#0A1713] to-[#0E2A1F]",
          "before:pointer-events-none before:absolute before:inset-0",
          "before:bg-[radial-gradient(80%_60%_at_110%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(60%_40%_at_-20%_110%,rgba(16,185,129,0.12),transparent)]",
        ].join(" ")}
      >
        <div className="text-emerald-50 text-xl">Cargando panel de administración...</div>
      </div>
    );
  }

  return (
    <div
      className={[
        "relative min-h-screen text-white",
        "bg-gradient-to-br from-black via-[#0A1713] to-[#0E2A1F]",
        "before:pointer-events-none before:absolute before:inset-0",
        "before:bg-[radial-gradient(80%_60%_at_110%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(60%_40%_at_-20%_110%,rgba(16,185,129,0.12),transparent)]",
      ].join(" ")}
    >
      {/* Sidebar */}
      <aside
        className={[
          "fixed left-0 top-0 h-full w-64 z-40 p-6",
          "bg-black/40 backdrop-blur-sm",
          "border-r border-emerald-500/15",
          "shadow-[0_0_0_1px_rgba(16,185,129,0.08),_0_20px_60px_-20px_rgba(16,185,129,0.25)]",
        ].join(" ")}
      >
        <div className="flex items-center space-x-3 mb-8">
          <img src={logoImg} alt="Nakama&Partners" className="h-10 w-auto drop-shadow-[0_0_14px_rgba(16,185,129,0.35)]" />
          <div>
            <h2 className="text-xl font-bold text-emerald-50">Admin Panel</h2>
            <p className="text-emerald-200/80 text-sm">{user?.name}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "usuarios", label: "Usuarios", icon: Users },
            { id: "kyc", label: "KYC", icon: FileCheck },
            { id: "productos", label: "Productos", icon: Package },
            { id: "contratos", label: "Contratos", icon: FileText },
            { id: "auditoria", label: "Blog de Actividad", icon: History },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={[
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                activeTab === item.id
                  ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-50 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.45)]"
                  : "text-emerald-200 hover:bg-emerald-900/10",
              ].join(" ")}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {activeTab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-emerald-50">Panel de Administración</h1>
              <Button
                onClick={handleDownloadAdminPDF}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Estado de Cuenta PDF
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              {[
                { label: "Usuarios Totales", value: stats.totalUsers, icon: Users, targetTab: "usuarios" },
                { label: "Productos Totales", value: stats.totalProducts, icon: Package, targetTab: "productos" },
                { label: "Contratos Totales", value: stats.totalContracts, icon: FileText, targetTab: "contratos" },
                { label: "KYC Pendientes", value: stats.pendingKyc, icon: FileCheck, warn: true, targetTab: "kyc" },
                { label: "KYC Rechazados", value: stats.rejectedKyc, icon: AlertTriangle, warn: true, targetTab: "kyc" },
              ].map(({ label, value, icon: Icon, warn, targetTab }, i) => (
                <Card
                  key={i}
                  className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                  onClick={() => setActiveTab(targetTab)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-200/80 text-sm font-medium">{label}</p>
                        <p className="text-emerald-50 text-3xl font-bold">{value}</p>
                        <p className="text-emerald-400 text-xs">Click para ver detalles</p>
                      </div>
                      <Icon className={`w-8 h-8 ${warn ? "text-amber-400" : "text-emerald-400"}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-emerald-50">Estado KYC</CardTitle>
                  <CardDescription className="text-emerald-200/80">Distribución de estados</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={kycChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {kycChartData.map((entry, index) => (
                          <Cell key={`cell-kyc-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-emerald-50">Estado Contratos</CardTitle>
                  <CardDescription className="text-emerald-200/80">Distribución de estados</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={contractsChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {contractsChartData.map((entry, index) => (
                          <Cell key={`cell-ct-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Financial KPIs Section */}
            {financialKpis && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-emerald-50 mb-6">KPIs Financieros</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Capital Total Gestionado</p>
                          <p className="text-emerald-50 text-2xl font-bold">€{financialKpis.totalAUM.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Capital Nuevo del Mes</p>
                          <p className="text-emerald-50 text-2xl font-bold">€{financialKpis.newCapitalMonth.toLocaleString()}</p>
                        </div>
                        <Plus className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Capital Retirado del Mes</p>
                          <p className="text-emerald-50 text-2xl font-bold">€{financialKpis.withdrawnCapitalMonth.toLocaleString()}</p>
                        </div>
                        <Minus className="w-8 h-8 text-red-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Ratio Crecimiento Mensual</p>
                          <p className={`text-2xl font-bold ${financialKpis.monthlyGrowthRatio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {financialKpis.monthlyGrowthRatio >= 0 ? '+' : ''}{financialKpis.monthlyGrowthRatio.toFixed(2)}%
                          </p>
                        </div>
                        <BarChart3 className={`w-8 h-8 ${financialKpis.monthlyGrowthRatio >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Rentabilidad Media Carteras</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.averagePortfolioReturn.toFixed(2)}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Liquidez 30 días</p>
                          <p className="text-emerald-50 text-2xl font-bold">€{financialKpis.liquidity30Days.toLocaleString()}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Liquidez 60 días</p>
                          <p className="text-emerald-50 text-2xl font-bold">€{financialKpis.liquidity60Days.toLocaleString()}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Liquidez 90 días</p>
                          <p className="text-emerald-50 text-2xl font-bold">€{financialKpis.liquidity90Days.toLocaleString()}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-red-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Client KPIs Section */}
            {financialKpis && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-emerald-50 mb-6">KPIs de Clientes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Clientes Activos</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.clientKpis?.activeClients || 0}</p>
                        </div>
                        <Users className="w-8 h-8 text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Altas Nuevas del Mes</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.clientKpis?.newClientsMonth || 0}</p>
                        </div>
                        <Plus className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Ticket Medio por Cliente</p>
                          <p className="text-emerald-50 text-2xl font-bold">€{financialKpis.clientKpis?.averageTicketPerClient?.toLocaleString() || 0}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">KYC Pendientes</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.clientKpis?.pendingKyc || 0}</p>
                          <p className="text-emerald-200/60 text-xs">({((financialKpis.clientKpis?.pendingKycPercentage) || 0).toFixed(1)}%)</p>
                        </div>
                        <FileCheck className="w-8 h-8 text-amber-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">KYC Rechazados</p>
                          <p className="text-emerald-50 text-2xl font-bold">{stats.rejectedKyc}</p>
                          <p className="text-emerald-200/60 text-xs">({((stats.rejectedKyc / (stats.pendingKyc + stats.rejectedKyc)) * 100 || 0).toFixed(1)}%)</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Renovaciones vs No Renovaciones</p>
                          <p className="text-emerald-50 text-lg font-bold">
                            {((financialKpis.clientKpis?.renewalRate) || 0).toFixed(1)}% renovaciones
                          </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-200/80">Renovaciones:</span>
                          <span className="text-emerald-50">{financialKpis.clientKpis?.renewals || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-200/80">No renovaciones:</span>
                          <span className="text-emerald-50">{financialKpis.clientKpis?.nonRenewals || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Top 10 Clientes por Capital</p>
                        </div>
                        <Crown className="w-8 h-8 text-yellow-400" />
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(financialKpis.clientKpis?.topClients || []).slice(0, 5).map((client: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-emerald-200/80 truncate mr-2">{client.name || `Cliente ${index + 1}`}</span>
                            <span className="text-emerald-50 font-medium">€{client.totalAmount?.toLocaleString() || 0}</span>
                          </div>
                        ))}
                        {(financialKpis.clientKpis?.topClients?.length || 0) > 5 && (
                          <p className="text-emerald-200/60 text-xs mt-2">... y {(financialKpis.clientKpis?.topClients?.length || 0) - 5} más</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Partner KPIs Section */}
            {financialKpis && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-emerald-50 mb-6">KPIs de Partners</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Partners Activos</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.partnerKpis?.activePartners || 0}</p>
                        </div>
                        <UserCheck className="w-8 h-8 text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Nuevos Partners del Mes</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.partnerKpis?.newPartnersMonth || 0}</p>
                        </div>
                        <Plus className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Comisiones Generadas (Mes)</p>
                          <p className="text-emerald-50 text-2xl font-bold">€{financialKpis.partnerKpis?.totalCommissionsMonth?.toLocaleString() || 0}</p>
                        </div>
                        <Euro className="w-8 h-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Ratio Conversión Partner→Cliente</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.partnerKpis?.partnerConversionRatio?.toFixed(1) || 0}</p>
                          <p className="text-emerald-200/60 text-xs">clientes por partner</p>
                        </div>
                        <Target className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Top 10 Partners por Volumen</p>
                        </div>
                        <Handshake className="w-8 h-8 text-purple-400" />
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(financialKpis.partnerKpis?.topPartners || []).slice(0, 5).map((partner: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-emerald-200/80 truncate mr-2">{partner.name || `Partner ${index + 1}`}</span>
                            <span className="text-emerald-50 font-medium">€{partner.totalVolume?.toLocaleString() || 0}</span>
                          </div>
                        ))}
                        {(financialKpis.partnerKpis?.topPartners?.length || 0) > 5 && (
                          <p className="text-emerald-200/60 text-xs mt-2">... y {(financialKpis.partnerKpis?.topPartners?.length || 0) - 5} más</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Partners Inactivos</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.partnerKpis?.inactivePartners || 0}</p>
                          <p className="text-emerald-200/60 text-xs">sin captación en 3 meses</p>
                        </div>
                        <UserMinus className="w-8 h-8 text-orange-400" />
                      </div>
                      <div className="mt-4">
                        <p className="text-emerald-200/80 text-xs">
                          Requieren seguimiento para reactivación
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Operational/Risk KPIs Section */}
            {financialKpis && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-emerald-50 mb-6">KPIs Operativos / Riesgo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Contratos Vencen 30 días</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.operationalKpis?.contractsExpiring30Days || 0}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-amber-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Contratos Vencen 60 días</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.operationalKpis?.contractsExpiring60Days || 0}</p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Contratos Vencen 90 días</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.operationalKpis?.contractsExpiring90Days || 0}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-red-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Incidencias Abiertas</p>
                          <p className="text-emerald-50 text-2xl font-bold">{financialKpis.operationalKpis?.openIncidents || 0}</p>
                        </div>
                        <FileCheck className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Completitud KYC</p>
                          <p className="text-emerald-50 text-2xl font-bold">{(financialKpis.operationalKpis?.kycCompletionRate || 0).toFixed(1)}%</p>
                          <p className="text-emerald-200/60 text-xs">clientes verificados</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Strategic/Business KPIs Section */}
            {financialKpis && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-emerald-50 mb-6">KPIs Estratégicos / de Negocio</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Tasa de Retención de Clientes</p>
                          <p className="text-emerald-50 text-2xl font-bold">{(financialKpis.strategicKpis?.clientRetentionRate || 0).toFixed(1)}%</p>
                          <p className="text-emerald-200/60 text-xs">clientes que renuevan</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Tasa de Crecimiento de Clientes</p>
                          <p className={`text-2xl font-bold ${(financialKpis.strategicKpis?.clientGrowthRate || 0) >= 0 ? 'text-emerald-50' : 'text-red-50'}`}>
                            {(financialKpis.strategicKpis?.clientGrowthRate || 0) >= 0 ? '+' : ''}{(financialKpis.strategicKpis?.clientGrowthRate || 0).toFixed(1)}%
                          </p>
                          <p className="text-emerald-200/60 text-xs">(altas - bajas) / total clientes</p>
                        </div>
                        <BarChart3 className={`w-8 h-8 ${(financialKpis.strategicKpis?.clientGrowthRate || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-emerald-200/80 text-sm font-medium">Ingresos Totales Generados (YTD)</p>
                          <p className="text-emerald-50 text-2xl font-bold">€{(financialKpis.strategicKpis?.totalRevenueYTD || 0).toLocaleString()}</p>
                          <p className="text-emerald-200/60 text-xs">fees + comisiones + margen</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Business Health Traffic Light */}
            {financialKpis?.businessHealth && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-emerald-50 mb-6">Semáforo de Salud del Negocio</h2>
                <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${
                          financialKpis.businessHealth.status === 'green' ? 'border-green-400 bg-green-400/20' :
                          financialKpis.businessHealth.status === 'yellow' ? 'border-yellow-400 bg-yellow-400/20' :
                          'border-red-400 bg-red-400/20'
                        }`}>
                          <div className={`w-12 h-12 rounded-full ${
                            financialKpis.businessHealth.status === 'green' ? 'bg-green-400' :
                            financialKpis.businessHealth.status === 'yellow' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}></div>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${getHealthColor(financialKpis.businessHealth.status)}`}>
                            {financialKpis.businessHealth.status.toUpperCase()}
                          </p>
                          <p className="text-emerald-200/80 text-sm">
                            {getHealthMessage(financialKpis.businessHealth.status, financialKpis.businessHealth.percentage)}
                          </p>
                          {financialKpis.businessHealth.contractsAtRiskPercentage > 0 && (
                            <p className="text-emerald-200/60 text-xs mt-1">
                              {financialKpis.businessHealth.contractsAtRiskPercentage.toFixed(1)}% del capital en contratos próximos a vencer
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Monthly Evolution Charts */}
            {financialKpis?.monthlyEvolution && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-emerald-50 mb-6">Evolución Mensual</h2>
                <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                  <CardContent className="p-8 space-y-8">
                    {/* Capital Evolution */}
                    <div>
                      <h4 className="text-emerald-50 text-lg font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        Capital Gestionado
                      </h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={financialKpis.monthlyEvolution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [`€${value.toLocaleString()}`, 'Capital']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="capital" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Clients Evolution */}
                    <div>
                      <h4 className="text-emerald-50 text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users2 className="w-5 h-5 text-blue-400" />
                        Número de Clientes
                      </h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={financialKpis.monthlyEvolution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [value, 'Clientes']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="clients" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Revenue Evolution */}
                    <div>
                      <h4 className="text-emerald-50 text-lg font-semibold mb-4 flex items-center gap-2">
                        <Euro className="w-5 h-5 text-yellow-400" />
                        Ingresos Mensuales
                      </h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={financialKpis.monthlyEvolution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" tickFormatter={(value) => `€${value.toLocaleString()}`} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [`€${value.toLocaleString()}`, 'Ingresos']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#F59E0B" 
                            strokeWidth={3}
                            dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Retention Evolution */}
                    <div>
                      <h4 className="text-emerald-50 text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-400" />
                        Tasa de Retención
                      </h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={financialKpis.monthlyEvolution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [`${value}%`, 'Retención']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="retention" 
                            stroke="#8B5CF6" 
                            strokeWidth={3}
                            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ====== USUARIOS ====== */}
        {activeTab === "usuarios" && (
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-3xl font-bold text-emerald-50">Gestión de Usuarios</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUserFilters((v) => !v)}
                  className="border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showUserFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </Button>
                {(Object.values(userFilters).some((v) => v) || userSort || userSearch) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUserFilters({
                        role: "",
                        grade: "",
                        verificationStatus: "",
                        sponsor: "",
                        gender: "",
                        dateFrom: "",
                        dateTo: "",
                      });
                      setUserSort("");
                      setUserSearch("");
                    }}
                    className="text-emerald-200 hover:text-emerald-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                )}
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
                  onClick={() => {
                    setEditingUser(null);
                    setNewUser({ name: "", email: "", password: "", role: "client", sponsor: "", grade: "Bronze" });
                    setShowUserDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Usuario
                </Button>
              </div>
            </div>

            {/* Búsqueda rápida */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200/80 w-4 h-4" />
                <Input
                  placeholder="Buscar por ID, nombre o email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10 bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                />
              </div>
            </div>

            {/* Panel de filtros avanzados */}
            {showUserFilters && (
              <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 mb-6">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Orden</Label>
                      <Select value={userSort} onValueChange={(v) => setUserSort(v as any)}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Sin orden" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created_desc">Fecha creación: más reciente</SelectItem>
                          <SelectItem value="created_asc">Fecha creación: más antiguo</SelectItem>
                          <SelectItem value="name_asc">Nombre A-Z</SelectItem>
                          <SelectItem value="name_desc">Nombre Z-A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Rol</Label>
                      <Select value={userFilters.role} onValueChange={(v) => setUserFilters({ ...userFilters, role: v })}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Cliente</SelectItem>
                          <SelectItem value="partner">Asesor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Grado</Label>
                      <Select value={userFilters.grade} onValueChange={(v) => setUserFilters({ ...userFilters, grade: v })}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          {userGrades.length === 0 ? (
                            <>
                              <SelectItem value="Bronze">Bronze</SelectItem>
                              <SelectItem value="Silver">Silver</SelectItem>
                              <SelectItem value="Gold">Gold</SelectItem>
                              <SelectItem value="Platinum">Platinum</SelectItem>
                            </>
                          ) : (
                            userGrades.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por Género (no se muestra en tabla) */}
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Género</Label>
                      <Select
                        value={userFilters.gender}
                        onValueChange={(v) => setUserFilters({ ...userFilters, gender: v })}
                      >
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          {userGenders.length === 0 ? (
                            <>
                              <SelectItem value="Hombre">Hombre</SelectItem>
                              <SelectItem value="Mujer">Mujer</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                            </>
                          ) : (
                            userGenders.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Verificación</Label>
                      <Select
                        value={userFilters.verificationStatus}
                        onValueChange={(v) => setUserFilters({ ...userFilters, verificationStatus: v })}
                      >
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verified">Verificado</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Patrocinador</Label>
                      <Input
                        placeholder="Nombre/email patrocinador"
                        value={userFilters.sponsor}
                        onChange={(e) => setUserFilters({ ...userFilters, sponsor: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Desde</Label>
                      <Input
                        type="date"
                        value={userFilters.dateFrom}
                        onChange={(e) => setUserFilters({ ...userFilters, dateFrom: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Hasta</Label>
                      <Input
                        type="date"
                        value={userFilters.dateTo}
                        onChange={(e) => setUserFilters({ ...userFilters, dateTo: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabla de usuarios (SIN columna de género) */}
            <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-emerald-500/15">
                      <tr>
                        {[
                          "ID",
                          "Nombre",
                          "Email",
                          "Rol",
                          "Patrocinador",
                          "Grado",
                          "Estado",
                          "Fecha",
                          "Acciones",
                        ].map((h) => (
                          <th key={h} className="text-left p-4 text-emerald-200/80 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-emerald-500/10">
                          <td className="p-4 text-emerald-50">{u.id}</td>
                          <td className="p-4 text-emerald-50">{u.name}</td>
                          <td className="p-4 text-emerald-50">{u.email}</td>
                          <td className="p-4">
                            <Badge
                              variant={
                                u.role === "admin" ? "destructive" : u.role === "partner" ? "default" : "secondary"
                              }
                              className={
                                u.role === "admin"
                                  ? "bg-red-500 text-white"
                                  : u.role === "partner"
                                  ? "bg-emerald-500 text-black"
                                  : "bg-emerald-900/30 text-emerald-200"
                              }
                            >
                              {u.role === "admin" ? "Administrador" : u.role === "partner" ? "Asesor" : "Usuario"}
                            </Badge>
                          </td>
                          <td className="p-4 text-emerald-50">{u.sponsor || "-"}</td>
                          <td className="p-4 text-emerald-50">{u.grade}</td>
                          <td className="p-4">
                            <Badge
                              variant={u.verificationStatus === "verified" ? "default" : "secondary"}
                              className={
                                u.verificationStatus === "verified"
                                  ? "bg-emerald-500 text-black"
                                  : "bg-emerald-900/30 text-emerald-200"
                              }
                            >
                              {u.verificationStatus === "verified" ? "Verificado" : "Pendiente"}
                            </Badge>
                          </td>
                          <td className="p-4 text-emerald-50">
                            {new Date(u.createdAt).toLocaleDateString("es-ES")}
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={u.role === "admin"}
                                className={`border-emerald-500/20 ${u.role === "admin" ? "text-gray-500 cursor-not-allowed opacity-50" : "text-emerald-50"}`}
                                onClick={() => u.role !== "admin" && openUserProfileById(u.id)}
                                title={u.role === "admin" ? "No disponible para administradores" : "Ver ficha del usuario"}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-500/20 text-emerald-50"
                                onClick={() => handleEditUser(u)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/20 text-red-400"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-emerald-200/80">
                            Sin resultados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Dialog Crear/Editar Usuario */}
            <Dialog open={showUserDialog} onOpenChange={handleCloseUserDialog}>
              <DialogContent className="bg-black/40 border border-emerald-500/15 text-emerald-50">
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}</DialogTitle>
                  <DialogDescription className="text-emerald-200/80">
                    {editingUser ? "Modifique los datos del usuario" : "Complete los datos para crear un nuevo usuario"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre
                    </Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="col-span-3 bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="col-span-3 bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="col-span-3 bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Rol
                    </Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger className="col-span-3 bg-black/50 border-emerald-500/20 text-emerald-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="partner">Asesor</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sponsor" className="text-right">
                      Patrocinador
                    </Label>
                    <Input
                      id="sponsor"
                      value={newUser.sponsor}
                      onChange={(e) => setNewUser({ ...newUser, sponsor: e.target.value })}
                      className="col-span-3 bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateUser}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
                  >
                    {editingUser ? "Actualizar Usuario" : "Crear Usuario"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* ====== KYC ====== */}
        {activeTab === "kyc" && (
          <div>
            <h1 className="text-3xl font-bold text-emerald-50 mb-4">Gestión KYC</h1>

            {/* Búsqueda + estado */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200/80 w-4 h-4" />
                <Input
                  placeholder="Buscar por ID, nombre o número de documento..."
                  value={kycSearch}
                  onChange={(e) => setKycSearch(e.target.value)}
                  className="pl-10 bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                />
              </div>
              <Select value={kycFilter} onValueChange={(v: any) => setKycFilter(v)}>
                <SelectTrigger className="w-full md:w-48 bg-black/50 border-emerald-500/20 text-emerald-50">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Controles filtros avanzados */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => setShowKycFilters((v) => !v)}
                className="border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showKycFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
              {(kycFilter !== "all" ||
                Object.values(kycAdvancedFilters).some((v) => v) ||
                kycStateAr ||
                kycSort ||
                kycSearch) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setKycFilter("all");
                    setKycAdvancedFilters({ documentType: "", country: "", dateFrom: "", dateTo: "" });
                    setKycStateAr("");
                    setKycSort("");
                    setKycSearch("");
                  }}
                  className="text-emerald-200 hover:text-emerald-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar Filtros
                </Button>
              )}
            </div>

            {showKycFilters && (
              <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 mb-6">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Orden</Label>
                      <Select value={kycSort} onValueChange={(v) => setKycSort(v as any)}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Sin orden" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created_desc">Fecha: más reciente</SelectItem>
                          <SelectItem value="created_asc">Fecha: más antiguo</SelectItem>
                          <SelectItem value="name_asc">Nombre A-Z</SelectItem>
                          <SelectItem value="name_desc">Nombre Z-A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Tipo de Documento</Label>
                      <Select
                        value={kycAdvancedFilters.documentType}
                        onValueChange={(v) => setKycAdvancedFilters({ ...kycAdvancedFilters, documentType: v })}
                      >
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          {kycDocTypes.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">País</Label>
                      <Select
                        value={kycAdvancedFilters.country}
                        onValueChange={(v) => setKycAdvancedFilters({ ...kycAdvancedFilters, country: v })}
                      >
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          {kycCountries.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Desde</Label>
                      <Input
                        type="date"
                        value={kycAdvancedFilters.dateFrom}
                        onChange={(e) => setKycAdvancedFilters({ ...kycAdvancedFilters, dateFrom: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Hasta</Label>
                      <Input
                        type="date"
                        value={kycAdvancedFilters.dateTo}
                        onChange={(e) => setKycAdvancedFilters({ ...kycAdvancedFilters, dateTo: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>

                    {/* Estado (A/R) — al final */}
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Estado (A/R)</Label>
                      <Select value={kycStateAr} onValueChange={(v: any) => setKycStateAr(v)}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Aprobado</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabla KYC */}
            <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-emerald-500/15">
                      <tr>
                        {["ID", "Nombre", "Tipo Doc", "Número", "País", "Estado", "Fecha", "Acciones"].map((h) => (
                          <th key={h} className="text-left p-4 text-emerald-200/80 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKyc.map((record) => (
                        <tr key={record.id} className="border-b border-emerald-500/10">
                          <td className="p-4 text-emerald-50">{record.id}</td>
                          <td className="p-4 text-emerald-50">{record.fullName}</td>
                          <td className="p-4 text-emerald-50">{record.documentType.toUpperCase()}</td>
                          <td className="p-4 text-emerald-50">{record.documentNumber}</td>
                          <td className="p-4 text-emerald-50">{record.country}</td>
                          <td className="p-4">
                            <Badge
                              className={
                                record.status === "approved"
                                  ? "bg-emerald-500 text-black"
                                  : record.status === "pending"
                                  ? "bg-amber-500 text-black"
                                  : "bg-red-500 text-white"
                              }
                            >
                              {record.status === "approved"
                                ? "Aprobado"
                                : record.status === "pending"
                                ? "Pendiente"
                                : "Rechazado"}
                            </Badge>
                          </td>
                          <td className="p-4 text-emerald-50">
                            {new Date(record.createdAt).toLocaleDateString("es-ES")}
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-500/20 text-emerald-50"
                                onClick={() => handleEditKyc(record)}
                                title="Editar estado KYC"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredKyc.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-emerald-200/80">
                            Sin resultados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ====== PRODUCTOS ====== */}
        {activeTab === "productos" && (
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-3xl font-bold text-emerald-50">Gestión de Productos</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowProductFilters((v) => !v)}
                  className="border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showProductFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </Button>
                {(Object.values(productFilters).some((v) => v) || productSort || productSearch) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setProductFilters({
                        status: "",
                        autoRenewal: "",
                        rateMin: "",
                        rateMax: "",
                        termMin: "",
                        termMax: "",
                        amountMin: "",
                        amountMax: "",
                      });
                      setProductSort("");
                      setProductSearch("");
                    }}
                    className="text-emerald-200 hover:text-emerald-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                )}
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProduct({
                      name: "",
                      interestRate: "",
                      termDays: "",
                      minAmount: "",
                      maxAmount: "",
                      status: "active",
                      autoRenewal: false,
                      contractTemplate: "",
                    });
                    setShowProductDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </div>

            {/* Búsqueda rápida productos */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200/80 w-4 h-4" />
                <Input
                  placeholder="Buscar por ID o nombre de producto..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10 bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                />
              </div>
            </div>

            {/* Panel filtros productos */}
            {showProductFilters && (
              <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 mb-6">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Orden</Label>
                      <Select value={productSort} onValueChange={(v) => setProductSort(v as any)}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Sin orden" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rate_desc">Tasa: mayor a menor</SelectItem>
                          <SelectItem value="rate_asc">Tasa: menor a mayor</SelectItem>
                          <SelectItem value="term_desc">Plazo: mayor a menor</SelectItem>
                          <SelectItem value="term_asc">Plazo: menor a mayor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Estado</Label>
                      <Select
                        value={productFilters.status}
                        onValueChange={(v) => setProductFilters({ ...productFilters, status: v })}
                      >
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Auto Renovación</Label>
                      <Select
                        value={productFilters.autoRenewal}
                        onValueChange={(v) => setProductFilters({ ...productFilters, autoRenewal: v })}
                      >
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Sí</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Tasa (%) mín</Label>
                      <Input
                        placeholder="Ej: 5"
                        value={productFilters.rateMin}
                        onChange={(e) => setProductFilters({ ...productFilters, rateMin: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Tasa (%) máx</Label>
                      <Input
                        placeholder="Ej: 12"
                        value={productFilters.rateMax}
                        onChange={(e) => setProductFilters({ ...productFilters, rateMax: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Plazo mín (días)</Label>
                      <Input
                        type="number"
                        placeholder="Ej: 30"
                        value={productFilters.termMin}
                        onChange={(e) => setProductFilters({ ...productFilters, termMin: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Plazo máx (días)</Label>
                      <Input
                        type="number"
                        placeholder="Ej: 365"
                        value={productFilters.termMax}
                        onChange={(e) => setProductFilters({ ...productFilters, termMax: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Monto mín (€)</Label>
                      <Input
                        type="number"
                        placeholder="Ej: 50000"
                        value={productFilters.amountMin}
                        onChange={(e) => setProductFilters({ ...productFilters, amountMin: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Monto máx (€)</Label>
                      <Input
                        type="number"
                        placeholder="Ej: 1000000"
                        value={productFilters.amountMax}
                        onChange={(e) => setProductFilters({ ...productFilters, amountMax: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabla productos */}
            <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-emerald-500/15">
                      <tr>
                        {[
                          "ID",
                          "Nombre",
                          "Tasa",
                          "Plazo",
                          "Monto Min",
                          "Monto Max",
                          "Estado",
                          "Auto Renovación",
                          "Contrato",
                          "Acciones",
                        ].map((h) => (
                          <th key={h} className="text-left p-4 text-emerald-200/80 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-emerald-500/10">
                          <td className="p-4 text-emerald-50">{product.id}</td>
                          <td className="p-4 text-emerald-50">{product.name}</td>
                          <td className="p-4 text-emerald-50">{product.interestRate}%</td>
                          <td className="p-4 text-emerald-50">{product.termDays} días</td>
                          <td className="p-4 text-emerald-50">€{parseInt(product.minAmount).toLocaleString()}</td>
                          <td className="p-4 text-emerald-50">€{parseInt(product.maxAmount).toLocaleString()}</td>
                          <td className="p-4">
                            <Badge
                              className={product.status === "active" ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}
                            >
                              {product.status === "active" ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={product.autoRenewal ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}>
                              {product.autoRenewal ? "Sí" : "No"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="outline" className="border-emerald-500/20 text-emerald-50">
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-500/20 text-emerald-50"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/20 text-red-400"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={10} className="p-6 text-center text-emerald-200/80">
                            Sin resultados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Dialog Crear/Editar Producto */}
            <Dialog open={showProductDialog} onOpenChange={handleCloseProductDialog}>
              <DialogContent className="bg-black/40 border border-emerald-500/15 text-emerald-50 max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
                  <DialogDescription className="text-emerald-200/80">
                    {editingProduct
                      ? "Modifique los datos del producto financiero"
                      : "Complete los datos para crear un nuevo producto financiero"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                  {[
                    { id: "productName", label: "Nombre", value: newProduct.name, key: "name" },
                    { id: "interestRate", label: "Tasa (%)", value: newProduct.interestRate, key: "interestRate", placeholder: "9.00" },
                    { id: "termDays", label: "Plazo (días)", value: newProduct.termDays, key: "termDays", type: "number", placeholder: "365" },
                    { id: "minAmount", label: "Monto Mín (€)", value: newProduct.minAmount, key: "minAmount", placeholder: "50000" },
                    { id: "maxAmount", label: "Monto Máx (€)", value: newProduct.maxAmount, key: "maxAmount", placeholder: "1000000" },
                  ].map((f) => (
                    <div key={f.id} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={f.id} className="text-right">
                        {f.label}
                      </Label>
                      <Input
                        id={f.id}
                        type={(f as any).type || "text"}
                        value={(newProduct as any)[f.key]}
                        onChange={(e) => setNewProduct({ ...newProduct, [f.key]: e.target.value } as any)}
                        className="col-span-3 bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                        placeholder={(f as any).placeholder}
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="productStatus" className="text-right">
                      Estado
                    </Label>
                    <Select value={newProduct.status} onValueChange={(value) => setNewProduct({ ...newProduct, status: value })}>
                      <SelectTrigger className="col-span-3 bg-black/50 border-emerald-500/20 text-emerald-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="autoRenewal" className="text-right">
                      Auto Renovación
                    </Label>
                    <div className="col-span-3">
                      <Switch
                        id="autoRenewal"
                        checked={newProduct.autoRenewal}
                        onCheckedChange={(checked) => setNewProduct({ ...newProduct, autoRenewal: checked })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="contractTemplate" className="text-right mt-2">
                      Template Contrato
                    </Label>
                    <Textarea
                      id="contractTemplate"
                      value={newProduct.contractTemplate}
                      onChange={(e) => setNewProduct({ ...newProduct, contractTemplate: e.target.value })}
                      className="col-span-3 bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                      placeholder="Template del contrato..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateProduct}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
                  >
                    {editingProduct ? "Actualizar Producto" : "Crear Producto"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* ====== CONTRATOS ====== */}
        {activeTab === "contratos" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <h1 className="text-3xl font-bold text-emerald-50">Gestión de Contratos</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowContractFilters((v) => !v)}
                  className="border-emerald-500/20 text-emerald-50 hover:bg-emerald-900/10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showContractFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </Button>
                {(Object.values(contractFilters).some((v) => v) || contractSort || contractSearch) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setContractFilters({ status: "", productName: "", dateFrom: "", dateTo: "", amountMin: "", amountMax: "" });
                      setContractSort("");
                      setContractSearch("");
                    }}
                    className="text-emerald-200 hover:text-emerald-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            </div>

            {/* Búsqueda rápida contratos */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200/80 w-4 h-4" />
                <Input
                  placeholder="Buscar por ID, usuario o producto..."
                  value={contractSearch}
                  onChange={(e) => setContractSearch(e.target.value)}
                  className="pl-10 bg-black/50 border-emerald-500/20 text-emerald-50 placeholder:text-emerald-200/60"
                />
              </div>
            </div>

            {/* Panel filtros contratos */}
            {showContractFilters && (
              <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 mb-6">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Orden</Label>
                      <Select value={contractSort} onValueChange={(v) => setContractSort(v as any)}>
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Sin orden" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date_desc">Fecha: más reciente</SelectItem>
                          <SelectItem value="date_asc">Fecha: más antiguo</SelectItem>
                          <SelectItem value="amount_desc">Monto: mayor a menor</SelectItem>
                          <SelectItem value="amount_asc">Monto: menor a mayor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Estado</Label>
                      <Select
                        value={contractFilters.status}
                        onValueChange={(v) => setContractFilters({ ...contractFilters, status: v })}
                      >
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ready_to_start">Listo para Iniciar</SelectItem>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Producto</Label>
                      <Select
                        value={contractFilters.productName}
                        onValueChange={(v) => setContractFilters({ ...contractFilters, productName: v })}
                      >
                        <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          {contractProductNames.map((n) => (
                            <SelectItem key={n} value={n}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Desde</Label>
                      <Input
                        type="date"
                        value={contractFilters.dateFrom}
                        onChange={(e) => setContractFilters({ ...contractFilters, dateFrom: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Hasta</Label>
                      <Input
                        type="date"
                        value={contractFilters.dateTo}
                        onChange={(e) => setContractFilters({ ...contractFilters, dateTo: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-emerald-50">Monto mín (€)</Label>
                      <Input
                        type="number"
                        placeholder="Ej: 10000"
                        value={contractFilters.amountMin}
                        onChange={(e) => setContractFilters({ ...contractFilters, amountMin: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-emerald-50">Monto máx (€)</Label>
                      <Input
                        type="number"
                        placeholder="Ej: 500000"
                        value={contractFilters.amountMax}
                        onChange={(e) => setContractFilters({ ...contractFilters, amountMax: e.target.value })}
                        className="bg-black/50 border-emerald-500/20 text-emerald-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabla contratos */}
            <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-emerald-500/15">
                      <tr>
                        {["ID", "Usuario", "Producto", "Monto", "Estado", "Fecha", "Acciones"].map((h) => (
                          <th key={h} className="text-left p-4 text-emerald-200/80 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContracts.map((contract) => (
                        <tr key={contract.id} className="border-b border-emerald-500/10">
                          <td className="p-4 text-emerald-50">{contract.id}</td>
                          <td className="p-4 text-emerald-50">{contract.userName}</td>
                          <td className="p-4 text-emerald-50">{contract.productName}</td>
                          <td className="p-4 text-emerald-50">€{parseInt(contract.amount).toLocaleString()}</td>
                          <td className="p-4">
                            <Badge
                              className={
                                contract.status === "active"
                                  ? "bg-emerald-500 text-black"
                                  : contract.status === "ready_to_start"
                                  ? "bg-amber-500 text-black"
                                  : contract.status === "completed"
                                  ? "bg-blue-500 text-white"
                                  : contract.status === "cancelled"
                                  ? "bg-emerald-900/30 text-emerald-200"
                                  : "bg-emerald-900/30 text-emerald-200"
                              }
                            >
                              {contract.status === "active"
                                ? "Activo"
                                : contract.status === "ready_to_start"
                                ? "Listo para Iniciar"
                                : contract.status === "completed"
                                ? "Completado"
                                : contract.status === "cancelled"
                                ? "Cancelado"
                                : contract.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-emerald-50">
                            {new Date(contract.createdAt).toLocaleDateString("es-ES")}{" "}
                            {new Date(contract.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-500/20 text-emerald-50"
                                title="Ver ficha del usuario"
                                onClick={() => openUserProfileById(contract.userId)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-500/20 text-emerald-50"
                                onClick={() => handleEditContract(contract)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredContracts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-emerald-200/80">
                            Sin resultados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ====== BLOG DE ACTIVIDAD (AUDITORIA) ====== */}
        {activeTab === "auditoria" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <h1 className="text-3xl font-bold text-emerald-50">Blog de Actividad</h1>
              <div className="flex items-center gap-2 text-emerald-200/80">
                <History className="w-5 h-5" />
                <span>Registro de todas las actividades administrativas</span>
              </div>
            </div>

            {isLoadingAuditLogs ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_20px_60px_-20px_rgba(16,185,129,0.25)]">
                <CardContent className="p-6">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-emerald-300/50 mx-auto mb-4" />
                      <p className="text-emerald-200/80 text-lg mb-2">No hay actividades registradas</p>
                      <p className="text-emerald-200/60">Las actividades administrativas aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {auditLogs.map((log: any) => {
                        const actionColors = {
                          CREATE: "bg-green-500/20 text-green-300 border-green-500/30",
                          UPDATE: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                          DELETE: "bg-red-500/20 text-red-300 border-red-500/30",
                          REVIEW: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                        };
                        
                        const actionIcons = {
                          CREATE: Plus,
                          UPDATE: Edit,
                          DELETE: Trash2,
                          REVIEW: Eye,
                        };
                        
                        const ActionIcon = actionIcons[log.action as keyof typeof actionIcons] || Eye;
                        const actionColor = actionColors[log.action as keyof typeof actionColors] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
                        
                        return (
                          <div key={log.id} className="border border-emerald-500/15 rounded-lg p-4 bg-black/20">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`p-2 rounded-lg border ${actionColor}`}>
                                  <ActionIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-emerald-50">{log.adminName || 'Administrador'}</span>
                                    <span className="text-emerald-200/60">•</span>
                                    <span className="text-emerald-200/80 text-sm">{log.adminEmail}</span>
                                  </div>
                                  <p className="text-emerald-200/90 mb-2">{log.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-emerald-200/60">
                                    <div className="flex items-center gap-1">
                                      <span>Entidad:</span>
                                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                                        {log.entityType}
                                      </Badge>
                                    </div>
                                    {log.entityId && (
                                      <div className="flex items-center gap-1">
                                        <span>ID:</span>
                                        <code className="bg-black/50 px-2 py-1 rounded text-emerald-300">
                                          {log.entityId}
                                        </code>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Changes Details */}
                                  {(log.oldValues || log.newValues) && (
                                    <details className="mt-3">
                                      <summary className="text-emerald-300 cursor-pointer hover:text-emerald-200 text-sm">
                                        Ver detalles de cambios
                                      </summary>
                                      <div className="mt-2 p-3 bg-black/30 rounded border border-emerald-500/15">
                                        {log.oldValues && (
                                          <div className="mb-2">
                                            <div className="text-xs text-emerald-200/60 mb-1">Valores anteriores:</div>
                                            <pre className="text-xs text-emerald-200/80 overflow-x-auto">
                                              {JSON.stringify(JSON.parse(log.oldValues), null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                        {log.newValues && (
                                          <div>
                                            <div className="text-xs text-emerald-200/60 mb-1">Valores nuevos:</div>
                                            <pre className="text-xs text-emerald-200/80 overflow-x-auto">
                                              {JSON.stringify(JSON.parse(log.newValues), null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    </details>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-sm text-emerald-200/60">
                                <div>{new Date(log.createdAt).toLocaleDateString("es-ES")}</div>
                                <div>{new Date(log.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</div>
                                {log.ipAddress && (
                                  <div className="text-xs mt-1">IP: {log.ipAddress}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ====== FICHA DETALLADA DE USUARIO ====== */}
        {activeTab === "usuario_ficha" && selectedUser && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-emerald-50">{selectedUser.name}</h1>
                  <p className="text-emerald-200/80">{selectedUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={selectedUser.role === "partner" ? "bg-emerald-500 text-black" : "bg-emerald-900/30 text-emerald-200"}>
                  {selectedUser.role === "admin" ? "Administrador" : selectedUser.role === "partner" ? "Asesor" : "Cliente"}
                </Badge>
                <Badge className="bg-emerald-900/30 text-emerald-200 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {selectedUser.grade}
                </Badge>
                <Badge className={selectedUser.verificationStatus === "verified" ? "bg-emerald-500 text-black" : "bg-amber-500 text-black"}>
                  {selectedUser.verificationStatus === "verified" ? "Verificado" : "Pendiente"}
                </Badge>
              </div>
            </div>

            {/* KPIs del cliente */}
            {(() => {
              const userContracts = contracts.filter((c) => c.userId === selectedUser.id);
              const activeAmt = userContracts
                .filter((c) => c.status === "active" || c.status === "ready_to_start")
                .reduce((sum, c) => sum + (parseInt(c.amount || "0") || 0), 0);
              const completedAmt = userContracts
                .filter((c) => c.status === "completed")
                .reduce((sum, c) => sum + (parseInt(c.amount || "0") || 0), 0);
              const lastDeposit = userContracts
                .slice()
                .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

              const kycMatch = kyc.find((k) => k.fullName.toLowerCase() === selectedUser.name.toLowerCase());

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: "Capital invertido", value: fmtEur(activeAmt) },
                      { label: "Contratos activos", value: userContracts.filter((c) => c.status === "active").length.toString() },
                      { label: "Completados", value: userContracts.filter((c) => c.status === "completed").length.toString() },
                      {
                        label: "Último depósito",
                        value: lastDeposit ? new Date(lastDeposit.createdAt).toLocaleDateString("es-ES") : "-",
                      },
                    ].map(({ label, value }, i) => (
                      <Card key={i} className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                        <CardContent className="p-6">
                          <p className="text-emerald-200/80 text-sm">{label}</p>
                          <p className="text-emerald-50 text-2xl font-bold">{value}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Datos personales y estado KYC */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                      <CardHeader>
                        <CardTitle className="text-emerald-50">Datos personales</CardTitle>
                        <CardDescription className="text-emerald-200/80">
                          Información básica del cliente
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-emerald-200/80 text-sm">Nombre</p>
                          <p className="text-emerald-50 font-medium">{selectedUser.name}</p>
                        </div>
                        <div>
                          <p className="text-emerald-200/80 text-sm">Email</p>
                          <p className="text-emerald-50 font-medium">{selectedUser.email}</p>
                        </div>
                        <div>
                          <p className="text-emerald-200/80 text-sm">Patrocinador</p>
                          <p className="text-emerald-50 font-medium">{selectedUser.sponsor || "-"}</p>
                        </div>
                        <div>
                          <p className="text-emerald-200/80 text-sm">Género (inferido)</p>
                          <p className="text-emerald-50 font-medium">
                            {normalizeGender(selectedUser.gender) || guessGenderFromName(selectedUser.name)}
                          </p>
                        </div>
                        <div>
                          <p className="text-emerald-200/80 text-sm">Fecha de alta</p>
                          <p className="text-emerald-50 font-medium">
                            {new Date(selectedUser.createdAt).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <div>
                          <p className="text-emerald-200/80 text-sm">Rol</p>
                          <p className="text-emerald-50 font-medium">
                            {selectedUser.role === "admin" ? "Administrador" : selectedUser.role === "partner" ? "Asesor" : "Cliente"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                      <CardHeader>
                        <CardTitle className="text-emerald-50">Verificación KYC</CardTitle>
                        <CardDescription className="text-emerald-200/80">
                          Estado y documento del cliente
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Badge
                            className={
                              kycMatch
                                ? kycMatch.status === "approved"
                                  ? "bg-emerald-500 text-black"
                                  : kycMatch.status === "pending"
                                  ? "bg-amber-500 text-black"
                                  : "bg-red-500 text-white"
                                : "bg-emerald-900/30 text-emerald-200"
                            }
                          >
                            {kycMatch
                              ? kycMatch.status === "approved"
                                ? "Aprobado"
                                : kycMatch.status === "pending"
                                ? "Pendiente"
                                : "Rechazado"
                              : "Sin registro KYC"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-emerald-200/80 text-sm">Tipo Documento</p>
                          <p className="text-emerald-50 font-medium">{kycMatch?.documentType?.toUpperCase() || "-"}</p>
                        </div>
                        <div>
                          <p className="text-emerald-200/80 text-sm">Número</p>
                          <p className="text-emerald-50 font-medium">{kycMatch?.documentNumber || "-"}</p>
                        </div>
                        <div>
                          <p className="text-emerald-200/80 text-sm">País</p>
                          <p className="text-emerald-50 font-medium">{kycMatch?.country || "-"}</p>
                        </div>
                        <div>
                          <p className="text-emerald-200/80 text-sm">Fecha de registro</p>
                          <p className="text-emerald-50 font-medium">
                            {kycMatch ? new Date(kycMatch.createdAt).toLocaleDateString("es-ES") : "-"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Contratos del cliente */}
                  <Card className="bg-black/40 border border-emerald-500/15 rounded-2xl transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20">
                    <CardHeader>
                      <CardTitle className="text-emerald-50">Contratos del cliente</CardTitle>
                      <CardDescription className="text-emerald-200/80">
                        Detalle de depósitos, productos y estado
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {contracts.filter((c) => c.userId === selectedUser.id).length === 0 ? (
                        <div className="text-emerald-200/80">Este usuario no tiene contratos registrados.</div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {contracts
                            .filter((c) => c.userId === selectedUser.id)
                            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                            .map((contract) => (
                              <Card
                                key={contract.id}
                                className="bg-black/30 border border-emerald-500/15 hover:bg-black/40 transition-all rounded-2xl"
                              >
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="text-emerald-50 font-semibold text-lg">{contract.productName}</h3>
                                      <p className="text-emerald-200/80">ID: {contract.id}</p>
                                    </div>
                                    <Badge
                                      className={
                                        contract.status === "active"
                                          ? "bg-emerald-500 text-black"
                                          : contract.status === "ready_to_start"
                                          ? "bg-amber-500 text-black"
                                          : contract.status === "completed"
                                          ? "bg-blue-500 text-white"
                                          : "bg-emerald-900/30 text-emerald-200"
                                      }
                                    >
                                      {contract.status === "active"
                                        ? "Activo"
                                        : contract.status === "ready_to_start"
                                        ? "Listo para Iniciar"
                                        : contract.status === "completed"
                                        ? "Completado"
                                        : "Cancelado"}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                      <p className="text-emerald-200/80 text-sm">Capital</p>
                                      <p className="text-emerald-50 font-bold text-xl">{fmtEur(parseInt(contract.amount || "0"))}</p>
                                    </div>
                                    <div>
                                      <p className="text-emerald-200/80 text-sm">Fecha</p>
                                      <p className="text-emerald-50 font-medium">
                                        {new Date(contract.createdAt).toLocaleDateString("es-ES")}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex gap-2">
                                    <Button variant="outline" className="border-emerald-500/20 text-emerald-50">
                                      <FileText className="w-4 h-4 mr-2" />
                                      Ver contrato
                                    </Button>
                                    <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white">
                                      <Download className="w-4 h-4 mr-2" />
                                      Descargar PDF
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="mt-8">
                    <Button
                      variant="outline"
                      className="border-emerald-500/20 text-emerald-50"
                      onClick={() => {
                        setActiveTab("usuarios");
                        setSelectedUser(null);
                        setLocation("/admin/usuarios");
                      }}
                    >
                      Volver a Usuarios
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ====== DIALOGS EDIT ====== */}
        {/* KYC Review Dialog */}
        <Dialog open={showKycDialog} onOpenChange={handleCloseKycDialog}>
          <DialogContent className="bg-black/40 border border-emerald-500/15 text-emerald-50 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Revisar Documentos KYC</DialogTitle>
              <DialogDescription className="text-emerald-200/80">
                Revisar y aprobar/rechazar documentos para {editingKyc?.fullName}
              </DialogDescription>
            </DialogHeader>
            {editingKyc && (
              <div className="space-y-6">
                {/* User Information */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-black/30 rounded-lg border border-emerald-500/15">
                  <div>
                    <Label className="text-emerald-300 text-sm">Usuario</Label>
                    <div className="text-emerald-50">{editingKyc.fullName}</div>
                  </div>
                  <div>
                    <Label className="text-emerald-300 text-sm">Email</Label>
                    <div className="text-emerald-50">{editingKyc.userEmail}</div>
                  </div>
                  <div>
                    <Label className="text-emerald-300 text-sm">Documento</Label>
                    <div className="text-emerald-50">
                      {editingKyc.documentType.toUpperCase()} - {editingKyc.documentNumber}
                    </div>
                  </div>
                  <div>
                    <Label className="text-emerald-300 text-sm">País</Label>
                    <div className="text-emerald-50">{editingKyc.country}</div>
                  </div>
                </div>

                {/* Documents */}
                {editingKyc.documentsUrls && editingKyc.documentsUrls.length > 0 && (
                  <div>
                    <Label className="text-emerald-300 text-sm mb-2 block">Documentos Subidos</Label>
                    <div className="space-y-2">
                      {editingKyc.documentsUrls.map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-black/30 rounded border border-emerald-500/15">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-50">{url.split('/').pop()}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-emerald-500/20 text-emerald-50"
                            onClick={() => handleViewDocuments(editingKyc.documentsUrls)}
                          >
                            Ver
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Form */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-emerald-300 text-sm mb-2 block">Decisión</Label>
                    <Select
                      value={kycReviewStatus}
                      onValueChange={(value: "approved" | "rejected") => setKycReviewStatus(value)}
                    >
                      <SelectTrigger className="bg-black/50 border-emerald-500/20 text-emerald-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                        <SelectItem value="approved">✅ Aprobar</SelectItem>
                        <SelectItem value="rejected">❌ Rechazar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {kycReviewStatus === "rejected" && (
                    <div>
                      <Label className="text-emerald-300 text-sm mb-2 block">
                        Motivo del Rechazo <span className="text-red-400">*</span>
                      </Label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Describe el motivo del rechazo..."
                        className="w-full h-24 p-3 bg-black/50 border border-emerald-500/20 rounded text-emerald-50 placeholder-emerald-400/60 resize-none"
                        required
                      />
                    </div>
                  )}
                </div>

                <DialogFooter className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseKycDialog} 
                    className="border-emerald-500/20"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={async () => {
                      if (kycReviewStatus === "rejected" && !rejectionReason.trim()) {
                        alert("Por favor, proporciona un motivo para el rechazo");
                        return;
                      }
                      
                      try {
                        await kycReviewMutation.mutateAsync({
                          kycId: editingKyc.id,
                          status: kycReviewStatus,
                          rejectionReason: kycReviewStatus === "rejected" ? rejectionReason : undefined,
                        });
                        handleCloseKycDialog();
                      } catch (error) {
                        console.error('Error reviewing KYC:', error);
                      }
                    }}
                    disabled={kycReviewMutation.isPending}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
                  >
                    {kycReviewMutation.isPending ? "Procesando..." : 
                     kycReviewStatus === "approved" ? "Aprobar Documentos" : "Rechazar Documentos"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Contract Edit Dialog */}
        <Dialog open={showContractDialog} onOpenChange={handleCloseContractDialog}>
          <DialogContent className="bg-black/40 border border-emerald-500/15 text-emerald-50">
            <DialogHeader>
              <DialogTitle>Editar Estado de Contrato</DialogTitle>
              <DialogDescription className="text-emerald-200/80">
                Modificar el estado del contrato para {editingContract?.userName}
              </DialogDescription>
            </DialogHeader>
            {editingContract && (
              <form onSubmit={handleUpdateContractForm}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">ID</Label>
                    <div className="col-span-3 text-emerald-200/90">{editingContract.id}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Usuario</Label>
                    <div className="col-span-3 text-emerald-200/90">{editingContract.userName}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Producto</Label>
                    <div className="col-span-3 text-emerald-200/90">{editingContract.productName}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Monto</Label>
                    <div className="col-span-3 text-emerald-200/90">€{parseInt(editingContract.amount).toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Fecha Creación</Label>
                    <div className="col-span-3 text-emerald-200/90">
                      {new Date(editingContract.createdAt).toLocaleDateString("es-ES")}{" "}
                      {new Date(editingContract.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contractStatus" className="text-right">
                      Estado
                    </Label>
                    <Select
                      value={editingContract.status}
                      onValueChange={(value: "active" | "ready_to_start" | "completed" | "cancelled") =>
                        setEditingContract({ ...editingContract, status: value })
                      }
                    >
                      <SelectTrigger className="col-span-3 bg-black/50 border-emerald-500/20 text-emerald-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/40 border-emerald-500/15 text-emerald-50">
                        <SelectItem value="ready_to_start">Listo para Iniciar</SelectItem>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseContractDialog} className="border-emerald-500/20">
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white">
                    Actualizar Estado
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Documents Viewer Dialog */}
        <Dialog open={showDocumentsDialog} onOpenChange={handleCloseDocumentsDialog}>
          <DialogContent className="bg-black/40 border border-emerald-500/15 text-emerald-50 max-w-4xl">
            <DialogHeader>
              <DialogTitle>Documentos KYC</DialogTitle>
              <DialogDescription className="text-emerald-200/80">
                Documentos subidos por el cliente
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
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-emerald-300/50 mx-auto mb-4" />
                  <p className="text-emerald-200/80">No hay documentos disponibles</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleCloseDocumentsDialog} className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Profile Modal */}
        <Dialog open={showUserProfileDialog} onOpenChange={setShowUserProfileDialog}>
          <DialogContent className="bg-black/90 border-emerald-500/20 text-emerald-50 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-emerald-200 text-xl">
                Perfil de Usuario
              </DialogTitle>
              <DialogDescription className="text-emerald-200/60">
                Información detallada del usuario
              </DialogDescription>
            </DialogHeader>
            
            {loadingUserProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-emerald-200">Cargando perfil...</div>
              </div>
            ) : selectedUserProfile ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-emerald-200 font-medium">ID Usuario</Label>
                    <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                      {selectedUserProfile.id}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-200 font-medium">Nombre</Label>
                    <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                      {selectedUserProfile.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-200 font-medium">Email</Label>
                    <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                      {selectedUserProfile.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-200 font-medium">Rol</Label>
                    <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg">
                      <Badge className={
                        selectedUserProfile.role === "admin" 
                          ? "bg-red-500/20 text-red-200"
                          : selectedUserProfile.role === "partner"
                          ? "bg-blue-500/20 text-blue-200"
                          : "bg-emerald-500/20 text-emerald-200"
                      }>
                        {selectedUserProfile.role === "admin" ? "Administrador" :
                         selectedUserProfile.role === "partner" ? "Partner" : "Cliente"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-200 font-medium">Grado</Label>
                    <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                      {selectedUserProfile.grade || "No asignado"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-200 font-medium">Sponsor</Label>
                    <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                      {selectedUserProfile.sponsor || "No asignado"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-200 font-medium">Estado de Verificación</Label>
                    <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg">
                      <Badge className={
                        selectedUserProfile.verificationStatus === "verified"
                          ? "bg-emerald-500/20 text-emerald-200"
                          : selectedUserProfile.verificationStatus === "pending"
                          ? "bg-amber-500/20 text-amber-200"
                          : "bg-red-500/20 text-red-200"
                      }>
                        {selectedUserProfile.verificationStatus === "verified" ? "Verificado" :
                         selectedUserProfile.verificationStatus === "pending" ? "Pendiente" : "No verificado"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-200 font-medium">Fecha de Registro</Label>
                    <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                      {new Date(selectedUserProfile.createdAt).toLocaleDateString("es-ES")}
                    </div>
                  </div>
                </div>

                {/* KYC Information if available */}
                {(selectedUserProfile.fullName || selectedUserProfile.documentType) && (
                  <div className="border-t border-emerald-500/20 pt-6">
                    <h4 className="text-emerald-200 font-medium mb-4">Información KYC</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUserProfile.fullName && (
                        <div className="space-y-2">
                          <Label className="text-emerald-200 font-medium">Nombre Completo</Label>
                          <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                            {selectedUserProfile.fullName}
                          </div>
                        </div>
                      )}
                      {selectedUserProfile.documentType && (
                        <div className="space-y-2">
                          <Label className="text-emerald-200 font-medium">Tipo de Documento</Label>
                          <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                            {selectedUserProfile.documentType}
                          </div>
                        </div>
                      )}
                      {selectedUserProfile.documentNumber && (
                        <div className="space-y-2">
                          <Label className="text-emerald-200 font-medium">Número de Documento</Label>
                          <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                            {selectedUserProfile.documentNumber}
                          </div>
                        </div>
                      )}
                      {selectedUserProfile.country && (
                        <div className="space-y-2">
                          <Label className="text-emerald-200 font-medium">País</Label>
                          <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                            {selectedUserProfile.country}
                          </div>
                        </div>
                      )}
                      {selectedUserProfile.kycStatus && (
                        <div className="space-y-2">
                          <Label className="text-emerald-200 font-medium">Estado KYC</Label>
                          <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg">
                            <Badge className={
                              selectedUserProfile.kycStatus === "approved"
                                ? "bg-emerald-500/20 text-emerald-200"
                                : selectedUserProfile.kycStatus === "pending"
                                ? "bg-amber-500/20 text-amber-200"
                                : "bg-red-500/20 text-red-200"
                            }>
                              {selectedUserProfile.kycStatus === "approved" ? "Aprobado" :
                               selectedUserProfile.kycStatus === "pending" ? "Pendiente" : "Rechazado"}
                            </Badge>
                          </div>
                        </div>
                      )}
                      {selectedUserProfile.kycCreatedAt && (
                        <div className="space-y-2">
                          <Label className="text-emerald-200 font-medium">Fecha KYC</Label>
                          <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg text-emerald-50">
                            {new Date(selectedUserProfile.kycCreatedAt).toLocaleDateString("es-ES")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-emerald-200/60">
                No se pudo cargar el perfil del usuario
              </div>
            )}
            
            <DialogFooter>
              <Button 
                onClick={() => setShowUserProfileDialog(false)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
