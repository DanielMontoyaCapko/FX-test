import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useState, useEffect } from "react";

import Home from "@/pages/home";
import Inversiones from "@/pages/inversiones";
import Nosotros from "@/pages/nosotros";
import Calculadora from "@/pages/calculadora";
import Contacto from "@/pages/contacto";
import Login from "@/pages/login";
import DashboardRouter from "@/pages/dashboard-router";
import AvisoLegal from "@/pages/aviso-legal";
import PoliticaUso from "@/pages/politica-uso";
import PoliticaCookies from "@/pages/politica-cookies";
import PoliticaSeguridad from "@/pages/politica-seguridad";
import ProteccionDatos from "@/pages/proteccion-datos";
import ProteccionDatosDetallada from "@/pages/proteccion-datos-detallada";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/inversiones" component={Inversiones} />
      <Route path="/nosotros" component={Nosotros} />
      <Route path="/calculadora" component={Calculadora} />
      <Route path="/contacto" component={Contacto} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={DashboardRouter} />
      <Route path="/aviso-legal" component={AvisoLegal} />
      <Route path="/politica-uso" component={PoliticaUso} />
      <Route path="/politica-cookies" component={PoliticaCookies} />
      <Route path="/politica-seguridad" component={PoliticaSeguridad} />
      <Route path="/proteccion-datos" component={ProteccionDatos} />
      <Route path="/proteccion-datos-detallada" component={ProteccionDatosDetallada} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Small delay to allow for smooth transition
    setTimeout(() => {
      setShowContent(true);
    }, 300);
  };

  // Show loading screen on first visit
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('nakama-visited');
    if (hasVisited) {
      // Skip loading screen if already visited in this session
      setIsLoading(false);
      setShowContent(true);
    }
  }, []);

  // Mark as visited when loading completes
  useEffect(() => {
    if (!isLoading && showContent) {
      sessionStorage.setItem('nakama-visited', 'true');
    }
  }, [isLoading, showContent]);

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
