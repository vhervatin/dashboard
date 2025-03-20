
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { Input } from '@/components/ui/input';
import { PawPrint, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
});

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Add loading animation effect
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: {
          email?: string;
          password?: string;
        } = {};
        
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof newErrors] = err.message;
          }
        });
        
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demonstration, let's consider valid credentials:
      if (formData.email === 'admin@petshop.com' && formData.password === '123456') {
        // Set user in localStorage (in a real app, you'd use a proper auth system)
        localStorage.setItem('user', JSON.stringify({ email: formData.email }));
        
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error('Credenciais inválidas');
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden login-gradient">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-24 h-24 rounded-full bg-petshop-gold opacity-10 animate-float"></div>
        <div className="absolute bottom-[20%] right-[10%] w-40 h-40 rounded-full bg-petshop-gold opacity-5 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] right-[20%] w-16 h-16 rounded-full bg-petshop-blue opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
        <PawPrint className="absolute top-[15%] right-[25%] w-12 h-12 text-white opacity-5 animate-float" style={{ animationDelay: '1.5s' }} />
        <PawPrint className="absolute bottom-[10%] left-[15%] w-16 h-16 text-white opacity-5 animate-float" style={{ animationDelay: '2.5s' }} />
      </div>
      
      {/* Login Form Container */}
      <div 
        className={`flex flex-col justify-center items-center p-8 transition-opacity duration-700 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center justify-center space-y-6 mb-8">
            <Logo animated size="md" className="animate-fade-in" />
            <h1 className="text-2xl font-bold text-white mt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Bem-vindo de volta!
            </h1>
            <p className="text-white/70 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              Faça login para acessar sua conta e gerenciar seus produtos
            </p>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="glass-card rounded-xl p-8 space-y-6 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 h-12 bg-white/10 border-white/20 text-white rounded-md input-focus-effect ${errors.email ? 'border-red-400' : 'focus:border-petshop-gold'}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 h-12 bg-white/10 border-white/20 text-white rounded-md input-focus-effect ${errors.password ? 'border-red-400' : 'focus:border-petshop-gold'}`}
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 bg-white/10 border-white/20 rounded focus:ring-petshop-gold text-petshop-gold"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-white/70">
                  Lembrar-me
                </label>
              </div>
              <a href="#" className="text-sm text-petshop-gold hover:text-white transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full button-hover-effect bg-petshop-gold hover:bg-amber-500 text-petshop-blue font-bold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-petshop-blue border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <PawPrint className="mr-2 h-5 w-5" />
              )}
              {isLoading ? "Entrando..." : "Login"}
            </button>

            <div className="text-center">
              <p className="text-white/70 text-sm">
                Ainda não tem uma conta?{" "}
                <a href="#" className="text-petshop-gold hover:text-white transition-colors">
                  Cadastre-se
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Image Container - Hidden on mobile, shown on medium screens and up */}
      <div className="hidden md:flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-petshop-blue/30 to-transparent z-10"></div>
        <img 
          src="/lovable-uploads/bc852a02-f2b9-4981-a30c-7c19e7e2829c.png" 
          alt="Cachorro feliz" 
          className={`w-full h-full object-cover transition-opacity duration-1000 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
    </div>
  );
};

export default Index;
