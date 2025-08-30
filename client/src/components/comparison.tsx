export default function Comparison() {
  const data = [
    {
      product: "Depósito Tradicional",
      return: "2-3%",
      risk: "Bajo",
      liquidity: "Alta",
      guarantee: "Sí",
      riskColor: "text-green",
      liquidityColor: "text-green",
      guaranteeColor: "text-green"
    },
    {
      product: "Fondo Conservador",
      return: "4-6%",
      risk: "Medio",
      liquidity: "Media",
      guarantee: "Parcial",
      riskColor: "text-yellow-400",
      liquidityColor: "text-yellow-400",
      guaranteeColor: "text-yellow-400"
    },
    {
      product: "Nakama&Partners",
      return: "9%",
      risk: "Nula",
      liquidity: "Alta",
      guarantee: "Sí (Pignorado)",
      riskColor: "text-green",
      liquidityColor: "text-green",
      guaranteeColor: "text-green",
      highlighted: true
    }
  ];

  return (
    <section className="py-10 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-georgia text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="text-emerald-400">Comparativa</span> con Otras Opciones de Inversión
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full bg-black/70 rounded-xl border border-silver-500/20">
            <thead>
              <tr className="border-b border-silver-500/30">
                <th className="text-left p-6 text-white font-georgia text-xl">Producto</th>
                <th className="text-center p-6 text-white font-georgia text-xl">Rentabilidad</th>
                <th className="text-center p-6 text-white font-georgia text-xl">Riesgo</th>
                <th className="text-center p-6 text-white font-georgia text-xl">Liquidez</th>
                <th className="text-center p-6 text-white font-georgia text-xl">Garantía Jurídica</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-silver-500/20 ${row.highlighted ? 'bg-green/10 border border-green/30' : ''}`}
                >
                  <td className={`p-6 ${row.highlighted ? 'text-white font-semibold' : 'text-silver-100'}`}>
                    {row.product}
                  </td>
                  <td className={`p-6 text-center ${row.highlighted ? 'text-green font-bold text-xl' : 'text-silver-100'}`}>
                    {row.return}
                  </td>
                  <td className={`p-6 text-center ${row.riskColor} ${row.highlighted ? 'font-semibold' : ''}`}>
                    {row.risk}
                  </td>
                  <td className={`p-6 text-center ${row.liquidityColor} ${row.highlighted ? 'font-semibold' : ''}`}>
                    {row.liquidity}
                  </td>
                  <td className={`p-6 text-center ${row.guaranteeColor} ${row.highlighted ? 'font-semibold' : ''}`}>
                    {row.guarantee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
