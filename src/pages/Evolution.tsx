
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, PawPrint, Database, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Evolution = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
        
        <div className="max-w-2xl mx-auto">
          <Card className="dark:bg-gray-800 shadow-lg border-blue-100 dark:border-blue-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Database className="h-5 w-5" />
                Configuração da Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Chave de API</Label>
                  <Input 
                    id="api-key" 
                    placeholder="Digite sua chave de API da Evolution" 
                    className="dark:bg-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input 
                    id="endpoint" 
                    placeholder="https://api.evolution.com/v1" 
                    className="dark:bg-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="store-id">ID da Loja</Label>
                  <Input 
                    id="store-id" 
                    placeholder="Digite o ID da sua loja" 
                    className="dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="pt-4 space-y-4">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                  <Link className="mr-2 h-4 w-4" />
                  Conectar
                </Button>
                
                <Button variant="outline" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Testar Conexão
                </Button>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mt-6">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Informações para Conexão
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Ao conectar seu sistema com a Evolution, você terá acesso a sincronização de dados, 
                  estoque, pedidos e clientes. Certifique-se de usar uma chave de API válida para 
                  garantir uma conexão segura.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Evolution;
