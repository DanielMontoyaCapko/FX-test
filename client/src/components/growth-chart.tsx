import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GrowthChartProps {
  initialAmount?: number;
  years?: number;
  rate?: number;
  showTitle?: boolean;
  className?: string;
}

export default function GrowthChart({ 
  initialAmount = 100000, 
  years = 10, 
  rate = 0.09,
  showTitle = true,
  className = ""
}: GrowthChartProps) {
  // Generate data points for the chart
  const data = [];
  for (let year = 0; year <= years; year++) {
    const amount = initialAmount * Math.pow(1 + rate, year);
    data.push({
      year: year,
      amount: Math.round(amount),
      formatted: `€${Math.round(amount).toLocaleString()}`
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const gain = value - initialAmount;
      const gainPercentage = ((value - initialAmount) / initialAmount * 100).toFixed(1);
      
      return (
        <div className="bg-black/90 p-4 rounded-lg border border-gold/30 backdrop-blur-sm">
          <p className="text-white font-semibold mb-2">Año {label}</p>
          <p className="text-green text-lg font-bold mb-1">
            €{value.toLocaleString()}
          </p>
          <p className="text-green-400 text-sm">
            +€{gain.toLocaleString()} ({gainPercentage}%)
          </p>
          <p className="text-silver-100 text-xs mt-1">
            Rendimiento acumulado
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-black/70 rounded-xl p-6 border border-silver-500/20 ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <h3 className="font-playfair text-2xl font-bold text-white mb-2">
            Proyección de Crecimiento - 9% Anual
          </h3>
          <p className="text-silver-100 text-sm">
            Inversión inicial: €{initialAmount.toLocaleString()} • Tasa fija: {(rate * 100)}% anual
          </p>
        </div>
      )}
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="year" 
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(value) => `Año ${value}`}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#DAA520" 
              strokeWidth={3}
              dot={{ fill: '#DAA520', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#DAA520', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-black/50 p-3 rounded-lg">
          <div className="text-green font-bold text-lg">
            ${data[years].amount.toLocaleString()}
          </div>
          <div className="text-silver-100 text-xs">Valor final</div>
        </div>
        <div className="bg-black/50 p-3 rounded-lg">
          <div className="text-green-400 font-bold text-lg">
            +${(data[years].amount - initialAmount).toLocaleString()}
          </div>
          <div className="text-silver-100 text-xs">Ganancia total</div>
        </div>
        <div className="bg-black/50 p-3 rounded-lg">
          <div className="text-blue-400 font-bold text-lg">
            {((data[years].amount - initialAmount) / initialAmount * 100).toFixed(0)}%
          </div>
          <div className="text-silver-100 text-xs">Rendimiento total</div>
        </div>
      </div>
    </div>
  );
}