import percentLogo from "../../../attached_assets/logo porcentaje.png";
import securityLogo from "../../../attached_assets/logo seguridad.png";
import documentoLogo from "../../../attached_assets/documento.png";
import bancoLogo from "../../../attached_assets/banco.png";
import firmaLogo from "../../../attached_assets/firma.png";
import lupaLogo from "../../../attached_assets/lupa.png";

export default function Security() {
  const features = [
    {
      title: "Rentabilidad Fija del 9%",
      description: "Sin volatilidad, sin sorpresas. Un 9% anual garantizado por contrato."
    },
    {
      title: "Capital depositado en Banco",
      description: "Capital depositado en cuenta bancaria, sin riesgos de mercado."
    },
    {
      title: "Contrato Bancario Pignorado",
      description: "Revisado jurídicamente y avalado por estructuras bancarias de primer nivel."
    },
    {
      title: "Custodia en Bancos de Primer Nivel",
      description: "Emirates NBD, WIO Bank, ADCB Abu Dhabi Bank. Instituciones financieras sólidas y reguladas."
    },
    {
      title: "Firma Digital Jurídicamente Válida",
      description: "Validez jurídica internacional vía DocuSign® con trazabilidad completa."
    },
    {
      title: "Auditoría Externa y Trazabilidad",
      description: "Control total del proceso con auditoría externa y transparencia absoluta."
    }
  ];

  return (
    <section id="seguridad" className="pt-10 pb-6 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-georgia text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="block md:hidden">
              <span className="block max-w-[320px] mx-auto">Porque invertir en Renta fija</span>
              <span className="block max-w-[280px] mx-auto">nunca ha sido tan</span>
              <span className="block max-w-[200px] mx-auto"><span className="text-green">rentable y seguro</span></span>
            </span>
            <span className="hidden md:block">
              Porque invertir en Renta fija nunca ha sido tan<br />
              <span className="text-green">rentable y seguro</span>
            </span>
          </h2>
          <p className="text-xl text-silver-100 max-w-3xl mx-auto">
            <span className="block md:hidden max-w-[300px] mx-auto">
              <span className="block">Desde el primer contacto, mostramos</span>
              <span className="block">que esto no es una promesa,</span>
              <span className="block">es una estructura.</span>
            </span>
            <span className="hidden md:block">
              Desde el primer contacto, mostramos que esto no es una promesa, es una estructura.
            </span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-black/70 p-8 rounded-xl border border-silver-500/20 hover:border-[#344e41] transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#344e41]/20 cursor-pointer">
              <div className="w-16 h-16 bg-green/20 rounded-lg flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[#344e41]/30 mx-auto">
                {index === 0 ? (
                  <img 
                    src={percentLogo} 
                    alt="Porcentaje" 
                    className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  />
                ) : index === 1 ? (
                  <img 
                    src={securityLogo} 
                    alt="Seguridad" 
                    className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  />
                ) : index === 2 ? (
                  <img 
                    src={documentoLogo} 
                    alt="Documento" 
                    className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  />
                ) : index === 3 ? (
                  <img 
                    src={bancoLogo} 
                    alt="Banco" 
                    className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  />
                ) : index === 4 ? (
                  <img 
                    src={firmaLogo} 
                    alt="Firma" 
                    className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  />
                ) : index === 5 ? (
                  <img 
                    src={lupaLogo} 
                    alt="Lupa" 
                    className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  />
                ) : null}
              </div>
              <h3 className="font-georgia text-2xl font-semibold text-white mb-4 transition-colors duration-300 text-center">{feature.title}</h3>
              <p className={`${index < 3 ? 'text-white' : 'text-silver-100'} transition-colors duration-300 text-center`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
