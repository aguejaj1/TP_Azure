import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import FloorPlan from '../components/FloorPlan';
import BookingModal from '../components/BookingModal';
import {
  Monitor,
  Users,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  GitBranch,
  Cloud,
  Server,
  Database
} from 'lucide-react';

export default function DashboardPage({ setActiveTab }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [resources, setResources] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  async function loadDashboardData() {
    try {
      const [statsRes, resRes, myRes] = await Promise.all([
        api.booking.getStats(),
        api.booking.getResources({ date: today }),
        api.booking.getMyBookings()
      ]);
      setStats(statsRes.stats);
      setResources(resRes.resources || []);
      setMyBookings(myRes.bookings || []);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const activeMyBookingsCount = myBookings.filter(b => b.status === 'CONFIRMED').length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-sky-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Flex Office Entreprise • Espace Collaboratif</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-2 text-sm text-sky-100/90 leading-relaxed">
            Réservez un bureau pour votre journée de concentration ou organisez votre prochaine réunion d'équipe en toute simplicité.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('booking')}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2"
            >
              Réserver un bureau ou une salle
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition-all"
            >
              Mes réservations ({activeMyBookingsCount})
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-400 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Bureaux dispo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Bureaux disponibles</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats?.availableDesksToday ?? '...'} / {stats?.totalDesks ?? '...'}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">Aujourd'hui ({today})</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Monitor className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: Salles dispo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Salles de réunion</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats?.availableRoomsToday ?? '...'} / {stats?.totalRooms ?? '...'}
            </h3>
            <span className="text-[11px] text-purple-600 font-medium">Capacité 1 à 12 pers.</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: Taux d'occupation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Taux d'occupation</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats?.occupancyRatePercent ?? 0}%
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {stats?.activeBookingsToday ?? 0} réservations actives
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 4: Mes réservations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Mes réservations</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {activeMyBookingsCount}
            </h3>
            <span className="text-[11px] text-sky-600 font-medium">À venir pour vous</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cloud & Microservices Architecture Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
              <Cloud className="w-4 h-4" />
              <span>Architecture Cloud Microservices Découplée</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Deux API autonomes communicantes avec CI/CD automatisé
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Ce système illustre l'isolation des responsabilités (Auth & Users vs Réservations), la vérification de token inter-services et le déploiement continu sur Azure App Service via GitHub Actions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
            {/* Service Auth */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Server className="w-4 h-4" />
                <span>Service Auth</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">Port 5001</div>
              <div className="text-[10px] text-slate-400">JWT, Utilisateurs & Rôles</div>
            </div>

            {/* Service Booking */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                <Server className="w-4 h-4" />
                <span>Service Booking</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">Port 5002</div>
              <div className="text-[10px] text-slate-400">Anti-conflits & Calendrier</div>
            </div>

            {/* Pipeline CI/CD */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <GitBranch className="w-4 h-4" />
                <span>CI/CD Pipeline</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">GitHub Actions / PaaS</div>
              <div className="text-[10px] text-slate-400">Tests, Docker & Azure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Floor Plan */}
      <FloorPlan
        resources={resources}
        selectedDate={today}
        onSelectResource={(r) => setSelectedResource(r)}
      />

      {/* Booking Modal */}
      {selectedResource && (
        <BookingModal
          resource={selectedResource}
          date={today}
          onClose={() => setSelectedResource(null)}
          onSuccess={() => {
            setSelectedResource(null);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
}
