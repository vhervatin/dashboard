import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Search, Filter, X } from 'lucide-react';

interface FilterBarProps {
  searchPlaceholder?: string;
  filters?: {
    label: string;
    options: { value: string; label: string }[];
  }[];
  onSearch?: (value: string) => void;
  onFilterChange?: (filter: string, value: string) => void;
  onClear?: () => void;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = 'Pesquisar...',
  filters = [],
  onSearch,
  onFilterChange,
  onClear,
  className
}: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 items-center', className)}>
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-8"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.label}
          onValueChange={(value) => onFilterChange?.(filter.label, value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {onClear && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
} 