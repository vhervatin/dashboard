import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentCard } from '@/components/ui/ContentCard';
import { LineChart, Users, Smartphone, PawPrint } from 'lucide-react';
import { useClientStats } from '@/hooks/useClientStats';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';

// Import components
import DashboardHeader from '@/components/metrics/DashboardHeader';
import StatCard from '@/components/metrics/StatCard';
import ClientGrowthChart from '@/components/metrics/ClientGrowthChart';
import PetTypesChart from '@/components/metrics/PetTypesChart';
import ServicesBarChart from '@/components/metrics/ServicesBarChart';
import RecentClientsTable from '@/components/metrics/RecentClientsTable';

const MetricsDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { stats, loading, refetchStats } = useClientStats();
  
  // Initialize real-time updates for the metrics dashboard
  useDashboardRealtime();
  
  // Fetch data when component mounts
  useEffect(() => {
    refetchStats();
  }, [refetchStats]);
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petshop-blue dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Use real data for monthly customers growth
  const monthlyCustomersData = stats.monthlyGrowth?.length > 0 
    ? stats.monthlyGrowth 
    : [
        { month: 'Jan', clients: 0 },
        { month: 'Fev', clients: 0 },
        { month: 'Mar', clients: 0 },
        { month: 'Abr', clients: 0 },
        { month: 'Mai', clients: 0 },
        { month: 'Jun', clients: 0 },
        { month: 'Jul', clients: 0 },
        { month: 'Ago', clients: 0 },
        { month: 'Set', clients: 0 },
        { month: 'Out', clients: 0 },
        { month: 'Nov', clients: 0 },
        { month: 'Dez', clients: 0 }
      ];
  
  // Use pet breed data from the API instead of hardcoded data
  const petBreedsData = stats.petBreeds?.length > 0 
    ? stats.petBreeds 
    : [
        { name: 'Não especificado', value: 100, color: '#8B5CF6' }
      ];

  const petServicesData = [
    { name: 'Banho', value: 45 },
    { name: 'Tosa', value: 35 },
    { name: 'Consulta', value: 20 },
    { name: 'Vacinas', value: 30 },
    { name: 'Compras', value: 25 },
  ];
  
  // Use real client data from the database
  const recentClientsData = stats.recentClients?.length > 0
    ? stats.recentClients
    : [
        { id: 1, name: 'Carregando...', phone: '...', pets: 0, lastVisit: '...' }
      ];

  return (
    <PageLayout>
      <div className="space-y-8">
        <PageHeader
          title="Métricas"
          description="Acompanhe as métricas e indicadores do seu negócio"
        />
        
        <ContentCard title="Visão Geral">
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
              
              {/* Gráficos e Tabelas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ClientGrowthChart data={monthlyCustomersData} loading={loading} />
                <PetTypesChart data={petBreedsData} loading={loading} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ServicesBarChart data={petServicesData} />
                <RecentClientsTable clients={recentClientsData} loading={loading} />
              </div>
            </main>
          </div>
        </ContentCard>
        
        <ContentCard title="Gráficos e Análises">
          {/* Mantenha o conteúdo existente aqui */}
          // ... existing code ...
        </ContentCard>
      </div>
    </PageLayout>
  );
};

export default MetricsDashboard;
