import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EvolutionCardProps {
  goal: {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    deadline: Date;
    status: 'on-track' | 'at-risk' | 'completed' | 'not-started';
    milestones: {
      title: string;
      completed: boolean;
      date?: Date;
    }[];
  };
  className?: string;
}

const statusMap = {
  'on-track': { label: 'No Prazo', variant: 'success' as const },
  'at-risk': { label: 'Em Risco', variant: 'warning' as const },
  'completed': { label: 'Concluído', variant: 'success' as const },
  'not-started': { label: 'Não Iniciado', variant: 'neutral' as const },
};

export function EvolutionCard({
  goal,
  className
}: EvolutionCardProps) {
  const status = statusMap[goal.status];
  const progressPercentage = (goal.progress / goal.target) * 100;

  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{goal.title}</CardTitle>
          <span className="text-xs text-muted-foreground">
            Prazo: {format(goal.deadline, 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{goal.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progresso</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Marcos</h4>
          <ul className="space-y-2">
            {goal.milestones.map((milestone, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    milestone.completed
                      ? 'bg-green-500'
                      : 'bg-muted'
                  )}
                />
                <span className={cn(
                  milestone.completed && 'text-muted-foreground line-through'
                )}>
                  {milestone.title}
                </span>
                {milestone.date && (
                  <span className="text-xs text-muted-foreground">
                    {format(milestone.date, 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 