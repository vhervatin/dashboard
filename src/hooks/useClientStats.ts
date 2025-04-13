
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientStats {
  totalClients: number;
  newClientsThisMonth: number;
  averageReturn: number;
  totalPets: number;
}

export const useClientStats = () => {
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    newClientsThisMonth: 0, // This was the issue: 'number = 0' was incorrectly written
    averageReturn: 15, // Default value
    totalPets: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClientStats = async () => {
    try {
      setLoading(true);
      
      // Get total clients count
      const { count: totalClients, error: countError } = await supabase
        .from('dados_cliente')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Get new clients from this month
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const { count: newClientsThisMonth, error: newClientsError } = await supabase
        .from('dados_cliente')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());
      
      if (newClientsError) throw newClientsError;
      
      // Calculate total pets (assuming each client has at least one pet)
      // This is an estimation since we don't have a separate pets table
      const { data: clientsWithPetInfo, error: petsError } = await supabase
        .from('dados_cliente')
        .select('nome_pet');
      
      if (petsError) throw petsError;
      
      // Count non-null pet names as a proxy for total pets
      const totalPets = clientsWithPetInfo.filter(client => client.nome_pet).length;
      
      setStats({
        totalClients: totalClients || 0,
        newClientsThisMonth: newClientsThisMonth || 0,
        averageReturn: 15, // Currently hardcoded, would need calculation from actual visit data
        totalPets: totalPets
      });
      
    } catch (error) {
      console.error('Error fetching client statistics:', error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Ocorreu um erro ao buscar as estatísticas de clientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchClientStats
  };
};
