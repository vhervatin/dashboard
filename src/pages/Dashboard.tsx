import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Smartphone, ShoppingBag, Clipboard, PawPrint, Users, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const {
    user,
    signOut,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-petshop-blue dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
      </div>;
  }
  
  const handleCardClick = (route: string) => {
    navigate(`/${route}`);
  };
  
  return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Pet Paradise</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              Bem-vindo, {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
            <Button variant="outline" onClick={signOut} className="border-white text-white bg-gray-950/50 hover:bg-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-800 dark:text-gray-100 transition-colors duration-300">
          Painel Administrativo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Card 1 - Gestão de Métricas */}
          <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => handleCardClick('metrics')}>
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-6 w-6" />
                Métricas
              </CardTitle>
              <CardDescription className="text-blue-100">
                Estatísticas e indicadores
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full relative">
                  <LineChart className="h-14 w-14 text-blue-500 dark:text-blue-400" />
                  <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                    110
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">Total de Registros</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">110</span>
                  </div>
                  <Progress value={85} className="h-2 bg-blue-100 dark:bg-blue-900/30">
                    <div className="h-full bg-blue-500 dark:bg-blue-600 rounded-full" />
                  </Progress>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">Novos Dados (Mês)</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">+18</span>
                  </div>
                  <Progress value={65} className="h-2 bg-blue-100 dark:bg-blue-900/30">
                    <div className="h-full bg-blue-500 dark:bg-blue-600 rounded-full" />
                  </Progress>
                </div>
                <div className="flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Análise de indicadores disponível</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50">
                Acessar dashboard de métricas
              </Badge>
            </CardFooter>
          </Card>

          {/* Card 2 - Vendas */}
          <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => handleCardClick('sales')}>
            <CardHeader className="pb-2 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6" />
                Vendas
              </CardTitle>
              <CardDescription className="text-amber-100">
                Controle de vendas e estoque
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-6 rounded-full">
                  <ShoppingBag className="h-14 w-14 text-amber-500 dark:text-amber-400 animate-float" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Registre vendas, controle estoque e gerencie produtos.
              </p>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
              <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50">
                Acessar área de vendas
              </Badge>
            </CardFooter>
          </Card>

          {/* Card 3 - Serviços */}
          <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => handleCardClick('services')}>
            <CardHeader className="pb-2 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="h-6 w-6" />
                Serviços
              </CardTitle>
              <CardDescription className="text-green-100">
                Banho, tosa e atendimentos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
                  <Clipboard className="h-14 w-14 text-green-500 dark:text-green-400 animate-bounce" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Agende serviços, gerencie atendimentos e monitore horários.
              </p>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50">
                Acessar área de serviços
              </Badge>
            </CardFooter>
          </Card>

          {/* Card 4 - CRM de Clientes (New) */}
          <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={() => handleCardClick('clients')}>
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Clientes
              </CardTitle>
              <CardDescription className="text-purple-100">
                CRM e gerenciamento
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-6 rounded-full">
                  <Users className="h-14 w-14 text-purple-500 dark:text-purple-400 animate-bounce" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Gerencie seus clientes, histórico e relacionamentos.
              </p>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/50">
                Acessar CRM de clientes
              </Badge>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>;
};
export default Dashboard;
