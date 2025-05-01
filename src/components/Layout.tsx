import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, PlusCircle, Banknote, BarChart3, Target } from 'lucide-react';

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
};

const NavItem = ({ to, icon, label, active }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-blue-100 text-blue-600'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="text-current">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">СемБюджет</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              to="/expenses" 
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Расходы
            </Link>
            <Link 
              to="/income" 
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Доходы
            </Link>
            <Link 
              to="/summary" 
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Итоги
            </Link>
            <Link 
              to="/goals" 
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Цели
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar (mobile: bottom nav) */}
        <div className="md:w-64 md:flex-shrink-0 md:border-r border-gray-200 bg-white md:h-auto">
          <div className="md:py-8 md:px-6 hidden md:block">
            <nav className="flex flex-col gap-2">
              <NavItem
                to="/"
                icon={<Wallet size={20} />}
                label="Обзор"
                active={currentPath === '/'}
              />
              <NavItem
                to="/expenses"
                icon={<PlusCircle size={20} />}
                label="Расходы"
                active={currentPath === '/expenses'}
              />
              <NavItem
                to="/income"
                icon={<Banknote size={20} />}
                label="Доходы"
                active={currentPath === '/income'}
              />
              <NavItem
                to="/summary"
                icon={<BarChart3 size={20} />}
                label="Итоги"
                active={currentPath === '/summary'}
              />
              <NavItem
                to="/goals"
                icon={<Target size={20} />}
                label="Цели"
                active={currentPath === '/goals'}
              />
            </nav>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4">
        <div className="flex justify-between">
          <Link to="/" className="flex flex-col items-center p-2">
            <Wallet size={24} className={currentPath === '/' ? 'text-blue-600' : 'text-gray-500'} />
            <span className="text-xs mt-1">Обзор</span>
          </Link>
          <Link to="/expenses" className="flex flex-col items-center p-2">
            <PlusCircle size={24} className={currentPath === '/expenses' ? 'text-blue-600' : 'text-gray-500'} />
            <span className="text-xs mt-1">Расходы</span>
          </Link>
          <Link to="/income" className="flex flex-col items-center p-2">
            <Banknote size={24} className={currentPath === '/income' ? 'text-blue-600' : 'text-gray-500'} />
            <span className="text-xs mt-1">Доходы</span>
          </Link>
          <Link to="/summary" className="flex flex-col items-center p-2">
            <BarChart3 size={24} className={currentPath === '/summary' ? 'text-blue-600' : 'text-gray-500'} />
            <span className="text-xs mt-1">Итоги</span>
          </Link>
          <Link to="/goals" className="flex flex-col items-center p-2">
            <Target size={24} className={currentPath === '/goals' ? 'text-blue-600' : 'text-gray-500'} />
            <span className="text-xs mt-1">Цели</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;