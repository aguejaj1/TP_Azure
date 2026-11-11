import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ServiceHealthBadge() {
  const [authHealth, setAuthHealth] = useState({ status: 'CHECKING', latency: 0 });
  const [bookingHealth, setBookingHealth] = useState({ status: 'CHECKING', latency: 0 });
  const [showDetails, setShowDetails] = useState(false);

  async function checkServices() {
    const auth = await api.auth.checkHealth();
    const booking = await api.booking.checkHealth();
    setAuthHealth(auth);
    setBookingHealth(booking);
  }

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 15000);
    return () => clearInterval(interval);
  }, []);

  const allUp = authHealth.status === 'UP' && bookingHealth.status === 'UP';

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-sm bg-white hover:bg-slate-50 border-slate-200"
        title="Architecture Microservices : Statut des APIs"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${allUp ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        <span className="hidden sm:inline text-slate-700">Microservices :</span>
        <span className={allUp ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
          {allUp ? '2/2 Opérationnels' : 'Inspection...'}
        </span>
      </button>

      {showDetails && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-semibold text-slate-900">Architecture Découplée</h4>
            <span className="text-[10px] text-slate-400">CI/CD & Cloud Ready</span>
          </div>

          <div className="space-y-3 mt-3">
            {/* Service 1 */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">1. Service Auth & Users</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  authHealth.status === 'UP' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {authHealth.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Port 5001 • JWT & Contrôle d'accès</p>
              {authHealth.latency ? <p className="text-[10px] text-emerald-600 mt-0.5">Latence : {authHealth.latency}ms</p> : null}
            </div>

            {/* Service 2 */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">2. Service Réservations</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  bookingHealth.status === 'UP' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {bookingHealth.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Port 5002 • Calendrier & Flex Desks</p>
              {bookingHealth.latency ? <p className="text-[10px] text-emerald-600 mt-0.5">Latence : {bookingHealth.latency}ms</p> : null}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Communication :</span>
              <span className="font-medium text-blue-600">REST HTTP / Docker Bridge</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
