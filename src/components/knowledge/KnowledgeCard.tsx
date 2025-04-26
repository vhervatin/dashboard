import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tag } from '@/components/ui/Tag';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KnowledgeCardProps {
  article: {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    lastUpdated: Date;
    author: string;
    views: number;
  };
  onClick?: () => void;
  className?: string;
}

export function KnowledgeCard({
  article,
  onClick,
  className
}: KnowledgeCardProps) {
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
          <CardTitle className="text-lg">{article.title}</CardTitle>
          <span className="text-xs text-muted-foreground">
            {format(article.lastUpdated, 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{article.category}</span>
          <span>•</span>
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.views} visualizações</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {article.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 