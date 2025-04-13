
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientStats {
  totalClients: number;
  newClientsThisMonth: number;
  averageReturn: number;
  totalPets: number;
  petBreeds: { name: string; value: number; color: string }[];
}

// Colors for the pet breeds chart
const BREED_COLORS = [
  '#8B5CF6',  // Purple
  '#EC4899',  // Pink
  '#F97316',  // Orange
  '#0EA5E9',  // Blue
  '#10B981',  // Green
  '#F59E0B',  // Amber
  '#6366F1',  // Indigo
  '#EF4444',  // Red
  '#84CC16',  // Lime
  '#14B8A6',  // Teal
];

export const useClientStats = () => {
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    newClientsThisMonth: 0,
    averageReturn: 15, // Default value
    totalPets: 0,
    petBreeds: []
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
      
      // Fetch pet breed data
      const { data: petBreedData, error: petBreedError } = await supabase
        .from('dados_cliente')
        .select('raca_pet');
      
      if (petBreedError) throw petBreedError;
      
      // Process pet breed data
      const breedCounts: Record<string, number> = {};
      
      // Count occurrences of each breed
      petBreedData.forEach(item => {
        const breed = item.raca_pet || 'Não especificado';
        breedCounts[breed] = (breedCounts[breed] || 0) + 1;
      });
      
      // Convert to array format needed for chart
      const breedChartData = Object.entries(breedCounts)
        .map(([name, value], index) => ({
          name,
          value,
          color: BREED_COLORS[index % BREED_COLORS.length]
        }))
        .sort((a, b) => b.value - a.value) // Sort by count descending
        .slice(0, 8); // Limit to top 8 breeds for better visualization
      
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
        totalPets: totalPets,
        petBreeds: breedChartData
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
