import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Phone, Mail, MapPin } from 'lucide-react';

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive' | 'pending';
    lastInteraction?: Date;
    avatar?: string;
  };
  onClick?: () => void;
  className?: string;
}

const statusMap = {
  active: { label: 'Ativo', variant: 'success' as const },
  inactive: { label: 'Inativo', variant: 'error' as const },
  pending: { label: 'Pendente', variant: 'warning' as const },
};

export function ClientCard({
  client,
  onClick,
  className
}: ClientCardProps) {
  const status = statusMap[client.status];

  return (
    <Card
      className={cn(
        'hover:shadow-lg transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar
          src={client.avatar}
          name={client.name}
          size="lg"
        />
        <div className="flex-1">
          <CardTitle className="text-lg">{client.name}</CardTitle>
          <StatusBadge status={status.variant}>
            {status.label}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{client.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{client.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{client.address}</span>
        </div>
        {client.lastInteraction && (
          <div className="text-xs text-muted-foreground mt-2">
            Última interação: {new Date(client.lastInteraction).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 