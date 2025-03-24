
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, PawPrint, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Evolution = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleCreateInstance = () => {
    toast({
      title: "Instância criada!",
      description: "Uma nova instância Evolution foi criada com sucesso.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <PawPrint className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Pet Paradise</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <Link className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            Conectar Evolution
          </h2>
        </div>
        
        <div className="max-w-xl mx-auto">
          {/* Create Instance Card */}
          <Card className="dark:bg-gray-800 shadow-lg border-green-100 dark:border-green-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Plus className="h-5 w-5" />
                Criar Nova Instância
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">
                  Nova Instância Evolution
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Crie uma nova instância para integrar seu WhatsApp com a Evolution. 
                  Cada instância representa uma conexão única com um número de WhatsApp.
                </p>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="instance-name">Nome da Instância</Label>
                  <Input 
                    id="instance-name" 
                    placeholder="Ex: Atendimento Principal" 
                    className="dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleCreateInstance}
                  className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Instância
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Evolution;
