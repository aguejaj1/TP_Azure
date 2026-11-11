import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <span className="w-8 h-8 border-3 border-sky-400/30 border-t-sky-400 rounded-full inline-block animate-spin" />
          <p className="text-xs text-slate-400">Chargement de la session FlexOffice...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <LoginPage onNavigateToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
        {activeTab === 'booking' && <BookingPage />}
        {activeTab === 'my-bookings' && <MyBookingsPage setActiveTab={setActiveTab} />}
        {activeTab === 'admin' && <AdminPage />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FlexOffice Enterprise © 2026 • Architecture Microservices Découplée</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Auth Service (5001)</span>
            <span>•</span>
            <span>Booking Service (5002)</span>
            <span>•</span>
            <span className="text-sky-600 font-medium">CI/CD Azure App Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
