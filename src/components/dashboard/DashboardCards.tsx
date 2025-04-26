import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useClientStats } from '@/hooks/useClientStats';
import { useConversations } from '@/hooks/useConversations';
import { useEffect } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

function DashboardCard({
  title,
  value,
  icon: Icon,
  trend,
  description
}: DashboardCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs md:text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-xl md:text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span className={trend.isPositive ? "text-green-500" : "text-red-500"}>
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </span>
            {" "}em relação ao mês anterior
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardCards() {
  const { stats, loading: statsLoading, refetchStats } = useClientStats();
  const { conversations, loading: conversationsLoading, fetchConversations } = useConversations();

  // Fetch initial data
  useEffect(() => {
    refetchStats();
    fetchConversations();
  }, [refetchStats, fetchConversations]);

  const cardsData = [
    {
      title: 'Total de Clientes',
      value: statsLoading ? '...' : stats.totalClients,
      icon: Users,
      trend: { value: 0, isPositive: true },
      description: 'Clientes ativos no sistema'
    },
    {
      title: 'Chats Ativos',
      value: conversationsLoading ? '...' : conversations.length,
      icon: MessageSquare,
      trend: { value: 0, isPositive: true },
      description: 'Conversas em andamento'
    },
    {
      title: 'Tempo Médio de Resposta',
      value: '2m 30s',
      icon: Clock,
      trend: { value: 0, isPositive: true },
      description: 'Tempo médio de atendimento'
    },
    {
      title: 'Taxa de Conversão',
      value: '100%',
      icon: CheckCircle2,
      trend: { value: 0, isPositive: true },
      description: 'Leads convertidos em clientes'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
      {cardsData.map((card, index) => (
        <DashboardCard key={index} {...card} />
      ))}
    </div>
  );
} 