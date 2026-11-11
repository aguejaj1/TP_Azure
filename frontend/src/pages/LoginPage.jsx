import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Building2, Shield, User, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage({ onNavigateToRegister }) {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Identifiants invalides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setIsLoading(true);
    setError(null);
    try {
      await demoLogin(role);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-sky-500/25 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">FlexOffice Enterprise</h2>
        <p className="mt-1 text-sm text-slate-400">
          Système de réservation de bureaux flex & salles de réunion
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-900/60 text-sky-300 border border-sky-700/50">
          <span>Architecture Microservices & CI/CD Azure</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-slate-200">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Connexion Démo en 1-clic :</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('employee1')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800">Alice (Employé)</div>
                <div className="text-[10px] text-slate-500">Ingénierie</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('employee2')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800">Bob (Employé)</div>
                <div className="text-[10px] text-slate-500">Design & UX</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('manager')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800">Sophie (Manager)</div>
                <div className="text-[10px] text-slate-500">Marketing</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs bg-slate-50"
              >
                <div className="font-semibold text-slate-800">Admin Système</div>
                <div className="text-[10px] text-slate-500">IT & Facilities</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Vous n'avez pas de compte ?{' '}
            <button
              onClick={onNavigateToRegister}
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              Créer un profil employé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
