import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MapPin, Users } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    participants: string[];
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
  };
  onClick?: () => void;
  className?: string;
}

const priorityMap = {
  low: { label: 'Baixa', variant: 'info' as const },
  medium: { label: 'Média', variant: 'warning' as const },
  high: { label: 'Alta', variant: 'error' as const },
};

const statusMap = {
  scheduled: { label: 'Agendado', variant: 'info' as const },
  'in-progress': { label: 'Em Andamento', variant: 'warning' as const },
  completed: { label: 'Concluído', variant: 'success' as const },
  cancelled: { label: 'Cancelado', variant: 'error' as const },
};

export function EventCard({
  event,
  onClick,
  className
}: EventCardProps) {
  const priority = priorityMap[event.priority];
  const status = statusMap[event.status];

  return (
    <Card
      className={cn(
        'hover:shadow-lg transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <div className="flex items-center gap-2">
            <StatusBadge status={priority.variant}>
              {priority.label}
            </StatusBadge>
            <StatusBadge status={status.variant}>
              {status.label}
            </StatusBadge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {event.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(event.startTime, 'HH:mm', { locale: ptBR })} -{' '}
              {format(event.endTime, 'HH:mm', { locale: ptBR })}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{event.participants.length} participantes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 