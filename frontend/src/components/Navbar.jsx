import React from 'react';
import { useAuth } from '../context/AuthContext';
import ServiceHealthBadge from './ServiceHealthBadge';
import { LayoutDashboard, CalendarRange, BookmarkCheck, ShieldAlert, LogOut, Building2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'booking', label: 'Réserver un espace', icon: CalendarRange },
    { id: 'my-bookings', label: 'Mes Réservations', icon: BookmarkCheck },
  ];

  if (user && ['ADMIN', 'MANAGER'].includes(user.role)) {
    navItems.push({ id: 'admin', label: 'Administration', icon: ShieldAlert });
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">FlexOffice</span>
                <span className="bg-sky-100 text-sky-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                  Microservices
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none">Bureaux Flex & Salles de réunion</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Header items */}
          <div className="flex items-center gap-3">
            <ServiceHealthBadge />

            {/* User Profile Pill */}
            {user && (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {user.department} • <span className="text-sky-600 font-medium">{user.role}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center text-xs">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-1 text-xs font-medium ${
                  isActive ? 'text-sky-600' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
