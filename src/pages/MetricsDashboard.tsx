
import React from 'react';
import { LineChart, Users, Smartphone, PawPrint, Clock } from 'lucide-react';
import { useClientStats } from '@/hooks/useClientStats';

// Import components
import DashboardHeader from '@/components/metrics/DashboardHeader';
import StatCard from '@/components/metrics/StatCard';
import ClientGrowthChart from '@/components/metrics/ClientGrowthChart';
import PetTypesChart from '@/components/metrics/PetTypesChart';
import ServicesBarChart from '@/components/metrics/ServicesBarChart';
import RecentClientsTable from '@/components/metrics/RecentClientsTable';

const MetricsDashboard = () => {
  const { stats, loading } = useClientStats();
  
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
    { month: 'Dez', clients: stats.totalClients || 110 },
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
      <DashboardHeader />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <LineChart className="h-6 w-6 text-petshop-blue dark:text-blue-400" />
            Dashboard de Métricas
          </h2>
        </div>
        
        {/* Estatísticas em Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total de Clientes"
            value={stats.totalClients}
            icon={<Users />}
            trend={`Aumento de ${Math.round((stats.newClientsThisMonth / (stats.totalClients - stats.newClientsThisMonth || 1)) * 100)}% este mês`}
            loading={loading}
            iconBgClass="bg-purple-100 dark:bg-purple-900/30"
            iconTextClass="text-purple-600 dark:text-purple-400"
          />
          
          <StatCard 
            title="Total de Pets"
            value={stats.totalPets}
            icon={<PawPrint />}
            trend={`Média de ${(stats.totalPets / (stats.totalClients || 1)).toFixed(1)} pets por cliente`}
            loading={loading}
            iconBgClass="bg-pink-100 dark:bg-pink-900/30"
            iconTextClass="text-pink-600 dark:text-pink-400"
          />
          
          <StatCard 
            title="Novos Clientes (Mês)"
            value={stats.newClientsThisMonth}
            icon={<Smartphone />}
            trend={`+${stats.newClientsThisMonth} comparado ao mês anterior`}
            loading={loading}
            iconBgClass="bg-blue-100 dark:bg-blue-900/30"
            iconTextClass="text-blue-600 dark:text-blue-400"
          />
          
          <StatCard 
            title="Retorno Médio"
            value={`${stats.averageReturn}d`}
            icon={<Clock />}
            trend="Tempo médio entre visitas"
            iconBgClass="bg-orange-100 dark:bg-orange-900/30"
            iconTextClass="text-orange-600 dark:text-orange-400"
          />
        </div>
        
        {/* Gráficos e Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ClientGrowthChart data={monthlyCustomersData} />
          <PetTypesChart data={petTypesData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServicesBarChart data={petServicesData} />
          <RecentClientsTable clients={recentClientsData} />
        </div>
      </main>
    </div>
  );
};

export default MetricsDashboard;
