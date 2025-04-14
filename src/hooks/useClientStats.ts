
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useClientStats() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalPets: 0,
    newClientsThisMonth: 0,
    monthlyGrowth: [],
    petBreeds: [],
    recentClients: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch total clients
      const { count: totalClients } = await supabase
        .from('dados_cliente')
        .select('*', { count: 'exact' });

      // Fetch total pets (assuming each client has at least one pet)
      const { count: totalPets } = await supabase
        .from('dados_cliente')
        .select('*', { count: 'exact' })
        .not('nome_pet', 'is', null);

      // Fetch new clients this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const { count: newClientsThisMonth } = await supabase
        .from('dados_cliente')
        .select('*', { count: 'exact' })
        .gte('created_at', firstDayOfMonth.toISOString());

      // Update stats
      setStats(currentStats => ({
        ...currentStats,
        totalClients: totalClients || 0,
        totalPets: totalPets || 0,
        newClientsThisMonth: newClientsThisMonth || 0,
      }));

    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erro ao atualizar estatísticas",
        description: "Ocorreu um erro ao atualizar as estatísticas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { stats, loading, refetchStats };
}

