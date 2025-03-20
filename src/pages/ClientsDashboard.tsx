
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Smartphone, PawPrint, LineChart, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, PieChart, Pie, Cell } from 'recharts';

const ClientsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Dados simulados para os gráficos
  const monthlyCustomersData = [
    { month: 'Jan', clients: 40 },
    { month: 'Fev', clients: 45 },
    { month: 'Mar', clients: 55 },
    { month: 'Abr', clients: 60 },
    { month: 'Mai', clients: 68 },
    { month: 'Jun', clients: 75 },
    { month: 'Jul', clients: 82 },
    { month: 'Ago', clients: 90 },
    { month: 'Set', clients: 85 },
    { month: 'Out', clients: 92 },
    { month: 'Nov', clients: 100 },
    { month: 'Dez', clients: 110 },
  ];
  
  const petTypesData = [
    { name: 'Cachorros', value: 65, color: '#8B5CF6' },
    { name: 'Gatos', value: 25, color: '#EC4899' },
    { name: 'Aves', value: 5, color: '#F97316' },
    { name: 'Outros', value: 5, color: '#0EA5E9' },
  ];

  const petServicesData = [
    { name: 'Banho', value: 45 },
    { name: 'Tosa', value: 35 },
    { name: 'Consulta', value: 20 },
    { name: 'Vacinas', value: 30 },
    { name: 'Compras', value: 25 },
  ];
  
  const recentClientsData = [
    { id: 1, name: 'Ana Silva', phone: '(11) 99999-1234', pets: 2, lastVisit: '10/12/2023' },
    { id: 2, name: 'João Pereira', phone: '(11) 98888-5678', pets: 1, lastVisit: '05/12/2023' },
    { id: 3, name: 'Maria Oliveira', phone: '(11) 97777-9012', pets: 3, lastVisit: '01/12/2023' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <PawPrint className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Pet Paradise</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <Users className="h-6 w-6 text-petshop-blue dark:text-blue-400" />
            Dashboard de Clientes
          </h2>
          <Button className="bg-petshop-blue hover:bg-blue-700 text-white">
            <Users className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
        
        {/* Estatísticas em Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-500 dark:text-gray-400">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-gray-800 dark:text-white">110</div>
                <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Aumento de 12% este mês</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-500 dark:text-gray-400">Total de Pets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-gray-800 dark:text-white">187</div>
                <div className="rounded-full bg-pink-100 dark:bg-pink-900/30 p-2">
                  <PawPrint className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Média de 1.7 pets por cliente</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-500 dark:text-gray-400">Novos Clientes (Mês)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-gray-800 dark:text-white">18</div>
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                  <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+3 comparado ao mês anterior</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-500 dark:text-gray-400">Retorno Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-gray-800 dark:text-white">15d</div>
                <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-2">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Tempo médio entre visitas</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráficos e Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Crescimento de Clientes (2023)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    clients: {
                      label: 'Clientes',
                      theme: {
                        light: '#8B5CF6',
                        dark: '#A78BFA',
                      },
                    },
                  }}
                >
                  <AreaChart
                    data={monthlyCustomersData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="clientsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-clients)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--color-clients)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltipContent
                              className="bg-white dark:bg-gray-950 shadow-md"
                              payload={payload}
                            />
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clients"
                      stroke="var(--color-clients)"
                      strokeWidth={2}
                      fill="url(#clientsGradient)"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                <PawPrint className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                Tipos de Pets Atendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={petTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {petTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} pets`, 'Quantidade']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Serviços Mais Utilizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={petServicesData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12 }} 
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                      }}
                    />
                    <Bar dataKey="value" name="Clientes" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                Clientes Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Nome</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Pets</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Última Visita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClientsData.map((client) => (
                      <tr 
                        key={client.id} 
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/20"
                      >
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{client.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{client.phone}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40">
                            {client.pets} {client.pets > 1 ? 'pets' : 'pet'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{client.lastVisit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" className="text-sm">
                  Ver todos os clientes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClientsDashboard;
