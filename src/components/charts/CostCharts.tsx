// components/charts/CostCharts.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CostChartsProps {
  costMetrics: {
    totalCosto: number;
    costoPromedioPorLlamada: number;
    costoPorMinuto: number;
    costoPorTipo: {
      inbound: number;
      outbound: number;
    };
    costoPorAgente: Array<{
      agente: string;
      costo: number;
      llamadas: number;
      costoPromedio: number;
    }>;
    costoPorDia: Array<{
      name: string;
      costo: number;
    }>;
    // NUEVAS MÉTRICAS PARA COSTOS POR PAÍS
    costoPorPais: Array<{
      pais: string;
      costo: number;
      llamadas: number;
      costoPromedio: number;
      porcentaje?: number;
      bandera?: string;
    }>;
    desgloseCostos: {
      totalRetell: number;
      totalLlamadas: number;
      porcentajeRetell?: number;
      porcentajeLlamada?: number;
    };
    tendenciaCostos?: Array<{
      fecha: string;
      costo: number;
      totalRetell: number;
      totalLlamadas: number;
    }>;
  };
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const COUNTRY_COLORS: { [key: string]: string } = {
  'CL': '#0033A0', // Azul Chile
  'AR': '#74ACDF', // Celeste Argentina
  'MX': '#006847', // Verde México
  'ES': '#AA151B', // Rojo España
  'Otros': '#666666' // Gris para otros
};

export const CostCharts = ({ costMetrics, loading = false }: CostChartsProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const agentData = costMetrics.costoPorAgente.map(agent => ({
    name: agent.agente,
    costo: agent.costo,
    llamadas: agent.llamadas
  }));

  const tipoData = [
    { name: 'Entrantes', costo: costMetrics.costoPorTipo.inbound },
    { name: 'Salientes', costo: costMetrics.costoPorTipo.outbound }
  ];

  const paisData = costMetrics.costoPorPais.map(pais => ({
    name: pais.pais,
    costo: pais.costo,
    llamadas: pais.llamadas,
    porcentaje: pais.porcentaje
  }));

  const desgloseData = [
    { name: 'Retell AI', value: costMetrics.desgloseCostos.totalRetell, porcentaje: costMetrics.desgloseCostos.porcentajeRetell },
    { name: 'Llamada', value: costMetrics.desgloseCostos.totalLlamadas, porcentaje: costMetrics.desgloseCostos.porcentajeLlamada }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas Principales de Costo - EXPANDIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costMetrics.totalCosto.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Costo acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo Promedio/Llamada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costMetrics.costoPromedioPorLlamada.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Por llamada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo Retell AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costMetrics.desgloseCostos.totalRetell.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">
              {costMetrics.desgloseCostos.porcentajeRetell.toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo Llamadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costMetrics.desgloseCostos.totalLlamadas.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">
              {costMetrics.desgloseCostos.porcentajeLlamada.toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Costos por País - NUEVO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de costos por país */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Costos por País</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paisData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, porcentaje }) => `${name}: ${porcentaje.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="costo"
                >
                  {paisData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COUNTRY_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(4)}`, 'Costo']}
                  labelFormatter={(label) => `País: ${label}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de barras por país */}
        <Card>
          <CardHeader>
            <CardTitle>Costo por País (Detallado)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`$${Number(value).toFixed(4)}`, 'Costo']}
                  labelFormatter={(label) => `País: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="costo" 
                  name="Costo Total"
                  fill="#3b82f6"
                />
                <Bar 
                  dataKey="llamadas" 
                  name="N° Llamadas"
                  fill="#10b981"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Desglose y Tendencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Desglose Retell vs Costo Llamada */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose de Costos: Retell AI vs Llamada</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={desgloseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, porcentaje }) => `${name}: ${porcentaje.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {desgloseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(4)}`, 'Costo']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendencia de costos en el tiempo */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Costos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costMetrics.tendenciaCostos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`$${Number(value).toFixed(4)}`, 'Costo']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="costo" 
                  stroke="#3b82f6" 
                  name="Costo Total"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="retellCost" 
                  stroke="#10b981" 
                  name="Costo Retell"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="llamadaCost" 
                  stroke="#f59e0b" 
                  name="Costo Llamada"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Originales (Modificados) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de costos por agente */}
        <Card>
          <CardHeader>
            <CardTitle>Costo por Agente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${Number(value).toFixed(4)}`, 'Costo']} />
                <Legend />
                <Bar dataKey="costo" fill="#3b82f6" name="Costo Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de costos por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Costo por Tipo de Llamada</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tipoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="costo"
                >
                  {tipoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${Number(value).toFixed(4)}`, 'Costo']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tablas Detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tabla de costos por país */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose de Costos por País</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">País</th>
                    <th className="text-right py-2">Llamadas</th>
                    <th className="text-right py-2">Costo Total</th>
                    <th className="text-right py-2">Costo Promedio</th>
                    <th className="text-right py-2">% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  {costMetrics.costoPorPais.map((pais, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium">{pais.pais}</td>
                      <td className="text-right py-2">{pais.llamadas}</td>
                      <td className="text-right py-2">${pais.costo.toFixed(4)}</td>
                      <td className="text-right py-2">${pais.costoPromedio.toFixed(4)}</td>
                      <td className="text-right py-2">{pais.porcentaje.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de costos por agente */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose de Costos por Agente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Agente</th>
                    <th className="text-right py-2">Llamadas</th>
                    <th className="text-right py-2">Costo Total</th>
                    <th className="text-right py-2">Costo Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {costMetrics.costoPorAgente.map((agent, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2">{agent.agente}</td>
                      <td className="text-right py-2">{agent.llamadas}</td>
                      <td className="text-right py-2">${agent.costo.toFixed(4)}</td>
                      <td className="text-right py-2">${agent.costoPromedio.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Costo por Día de la Semana */}
      <Card>
        <CardHeader>
          <CardTitle>Costos por Día de la Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {costMetrics.costoPorDia.map((dia, index) => (
              <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-sm">{dia.name}</div>
                <div className="text-lg font-bold">${dia.costo.toFixed(4)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};