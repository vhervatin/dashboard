
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { PawPrint, LogOut, ShoppingBag, Home, User, Heart, Settings } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if not logged in
      toast.error('Você precisa fazer login para acessar esta página');
      navigate('/');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logout realizado com sucesso');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petshop-blue">
        <div className="animate-spin h-12 w-12 border-4 border-petshop-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-petshop-blue text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="sm" animated={false} />
            <h1 className="text-xl font-bold">Pet Paradise</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              Olá, <span className="font-semibold">{user?.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors duration-200"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-petshop-blue">Dashboard</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Online</span>
          </div>
          
          <p className="text-gray-600 mb-4">
            Bem-vindo ao seu painel de controle da Pet Paradise! Aqui você pode gerenciar seus produtos, pedidos e preferências.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center space-x-3 transition-transform hover:transform hover:scale-105 cursor-pointer">
              <div className="bg-blue-500 p-3 rounded-full text-white">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-medium text-blue-700">Produtos</h3>
                <p className="text-sm text-blue-600">Gerenciar catálogo</p>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-center space-x-3 transition-transform hover:transform hover:scale-105 cursor-pointer">
              <div className="bg-amber-500 p-3 rounded-full text-white">
                <Home size={20} />
              </div>
              <div>
                <h3 className="font-medium text-amber-700">Loja</h3>
                <p className="text-sm text-amber-600">Configurações da loja</p>
              </div>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex items-center space-x-3 transition-transform hover:transform hover:scale-105 cursor-pointer">
              <div className="bg-emerald-500 p-3 rounded-full text-white">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-medium text-emerald-700">Clientes</h3>
                <p className="text-sm text-emerald-600">Gerenciar clientes</p>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-center space-x-3 transition-transform hover:transform hover:scale-105 cursor-pointer">
              <div className="bg-purple-500 p-3 rounded-full text-white">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="font-medium text-purple-700">Favoritos</h3>
                <p className="text-sm text-purple-600">Itens favoritos</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-petshop-blue/5 rounded-lg p-6 text-center">
          <PawPrint className="w-12 h-12 mx-auto text-petshop-blue mb-4" />
          <h2 className="text-xl font-semibold text-petshop-blue mb-2">Versão de Demonstração</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Esta é uma versão demonstrativa do dashboard da Pet Paradise. 
            Para fazer login novamente, use:
          </p>
          <div className="mt-4 inline-block bg-white p-4 rounded-md border border-gray-200">
            <p><span className="font-semibold">Email:</span> admin@petshop.com</p>
            <p><span className="font-semibold">Senha:</span> 123456</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-petshop-blue text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm">
          © 2023 Pet Paradise. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
