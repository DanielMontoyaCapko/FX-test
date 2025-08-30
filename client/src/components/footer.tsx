import { Linkedin, Youtube, Instagram } from "lucide-react";
import logoImg from "@/assets/Logo-removeBG_1752488347081.png";

export default function Footer() {
  return (
    <footer className="gradient-dark border-t border-silver-500/20 py-6">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logoImg} alt="Nakama&Partners" className="w-8 h-8" />
              <span className="font-cormorant text-lg font-semibold text-white">Nakama&Partners</span>
            </div>
            <p className="text-silver-100 text-sm">
              Protegiendo patrimonios con estructura, transparencia y rentabilidad fija.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Enlaces Legales</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/aviso-legal" className="text-silver-100 hover:text-green transition-colors">Aviso Legal</a></li>
              <li><a href="/politica-uso" className="text-silver-100 hover:text-green transition-colors">Política de uso</a></li>
              <li><a href="/politica-seguridad" className="text-silver-100 hover:text-green transition-colors">Política de seguridad</a></li>
              <li><a href="/proteccion-datos" className="text-silver-100 hover:text-green transition-colors">Protección Datos Básico</a></li>
              <li><a href="/politica-cookies" className="text-silver-100 hover:text-green transition-colors">Política de cookies</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Información</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-silver-100 hover:text-green transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="text-silver-100 hover:text-green transition-colors">Contrato Descargable</a></li>
              <li><a href="#" className="text-silver-100 hover:text-green transition-colors">Contacto Legal</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contacto</h3>
            <p className="text-silver-100 text-sm mb-2">info@nakamapartners.com</p>
            <p className="text-silver-100 text-sm mb-4">+34 675 558 429</p>

            <div className="flex space-x-4">
              <a href="#" className="text-silver-100 hover:text-green transition-colors">
                <Linkedin className="text-xl w-5 h-5" />
              </a>
              <a href="#" className="text-silver-100 hover:text-green transition-colors">
                <Youtube className="text-xl w-5 h-5" />
              </a>
              <a href="#" className="text-silver-100 hover:text-green transition-colors">
                <Instagram className="text-xl w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-silver-500/20 pt-8 text-center">
          <p className="text-silver-100 text-sm">© 2025 Nakama&Partners. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}