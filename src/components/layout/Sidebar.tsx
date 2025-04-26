import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BookOpen,
  BarChart2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Menu,
  X,
  Send
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/chats', icon: MessageSquare, label: 'Chats' },
  { path: '/clients', icon: Users, label: 'Clientes' },
  { path: '/knowledge', icon: BookOpen, label: 'Conhecimento' },
  { path: '/evolution', icon: BarChart2, label: 'Evolution' },
  { path: '/schedule', icon: Calendar, label: 'Agenda' },
  { path: '/campanha', icon: Send, label: 'Campanha' },
];

const bottomMenuItems = [
  { path: '/config', icon: Settings, label: 'Configurações' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  // Fechar menu mobile quando a tela for redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Botão do menu mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground md:hidden"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed md:relative h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-40',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo e Botão de Colapso */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            {!isCollapsed && (
              <span className="text-xl font-bold">Administrador</span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Menu Principal */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={20} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Menu Inferior */}
          <div className="border-t border-sidebar-border p-4">
            <ul className="space-y-1">
              {bottomMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={20} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-red-500/10"
                >
                  <LogOut size={20} />
                  {!isCollapsed && <span>Sair</span>}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
} 