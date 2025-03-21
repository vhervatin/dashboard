
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PauseDurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration: number, unit: string) => void;
  phoneNumber: string;
}

const PauseDurationDialog = ({ isOpen, onClose, onConfirm, phoneNumber }: PauseDurationDialogProps) => {
  const [duration, setDuration] = useState<string>('30');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationValue = parseInt(duration);
    if (isNaN(durationValue) || durationValue <= 0) return;
    onConfirm(durationValue, 'seconds');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Por quanto tempo pausar o bot?</DialogTitle>
          <DialogDescription>
            Defina a duração em segundos para pausar o bot para {phoneNumber}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (segundos)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PauseDurationDialog;
