import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Smartphone, ShoppingBag, Clipboard, PawPrint } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    return <div className="min-h-screen flex items-center justify-center bg-petshop-blue">
        <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
      </div>;
  }
  const handleCardClick = (route: string) => {
    // Futuramente navegará para rotas específicas
    console.log(`Navegando para: ${route}`);
  };
  return <div className="min-h-screen bg-gray-100">
      <header className="bg-petshop-blue text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Pet Paradise</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              Bem-vindo, {user?.user_metadata?.name || user?.email}
            </Badge>
            <Button variant="outline" onClick={signOut} className="border-white text-white bg-gray-950 hover:bg-gray-800">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-800">
          Painel Administrativo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Card 1 - Gestão de Clientes */}
          <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl" onClick={() => handleCardClick('customers')}>
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-6 w-6" />
                Clientes
              </CardTitle>
              <CardDescription className="text-blue-100">
                Gerenciamento de cadastros
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="bg-blue-100 p-6 rounded-full">
                  <Smartphone className="h-14 w-14 text-blue-500 animate-pulse" />
                </div>
              </div>
              <p className="text-gray-600 text-center">
                Cadastre, edite e gerencie todos os clientes e seus pets.
              </p>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg border-t flex justify-center py-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
                Acessar área de clientes
              </Badge>
            </CardFooter>
          </Card>

          {/* Card 2 - Vendas */}
          <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl" onClick={() => handleCardClick('sales')}>
            <CardHeader className="pb-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-lg">
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
                <div className="bg-amber-100 p-6 rounded-full">
                  <ShoppingBag className="h-14 w-14 text-amber-500 animate-float" />
                </div>
              </div>
              <p className="text-gray-600 text-center">
                Registre vendas, controle estoque e gerencie produtos.
              </p>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg border-t flex justify-center py-3">
              <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-100">
                Acessar área de vendas
              </Badge>
            </CardFooter>
          </Card>

          {/* Card 3 - Serviços */}
          <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl" onClick={() => handleCardClick('services')}>
            <CardHeader className="pb-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
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
                <div className="bg-green-100 p-6 rounded-full">
                  <Clipboard className="h-14 w-14 text-green-500 animate-bounce" />
                </div>
              </div>
              <p className="text-gray-600 text-center">
                Agende serviços, gerencie atendimentos e monitore horários.
              </p>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg border-t flex justify-center py-3">
              <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100">
                Acessar área de serviços
              </Badge>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>;
};
export default Dashboard;