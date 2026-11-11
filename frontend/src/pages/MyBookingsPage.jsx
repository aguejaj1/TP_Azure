import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  BookmarkCheck
} from 'lucide-react';

export default function MyBookingsPage({ setActiveTab }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, CANCELLED
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState(null);

  async function loadBookings() {
    setIsLoading(true);
    try {
      const data = await api.booking.getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Erreur chargement mes réservations:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir libérer ce bureau / annuler cette réservation ?')) {
      return;
    }

    setCancellingId(id);
    try {
      await api.booking.cancelBooking(id);
      setMessage({ type: 'success', text: 'Réservation annulée avec succès. L\'espace est de nouveau disponible.' });
      loadBookings();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Impossible d\'annuler la réservation' });
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'ACTIVE') return b.status === 'CONFIRMED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  const getSlotLabel = (slot) => {
    switch (slot) {
      case 'MORNING': return 'Matin (08h30 - 12h30)';
      case 'AFTERNOON': return 'Après-midi (13h30 - 18h00)';
      case 'FULL_DAY': return 'Journée entière (08h30 - 18h00)';
      default: return slot;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-sky-600" />
            Mes Réservations Flex Office
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos postes réservés, libérez un bureau en avance ou consultez l'historique
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Toutes ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Actives ({bookings.filter(b => b.status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setFilter('CANCELLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'CANCELLED' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Annulées ({bookings.filter(b => b.status === 'CANCELLED').length})
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs font-bold ml-2">×</button>
        </div>
      )}

      {/* Bookings List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500">
          <span className="w-6 h-6 border-2 border-sky-600/30 border-t-sky-600 rounded-full inline-block animate-spin mb-2" />
          <p className="text-xs">Chargement de vos réservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-sky-50 flex items-center justify-center text-sky-600 mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">Aucune réservation trouvée</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Vous n'avez pas de réservation active pour le moment. Réservez votre poste pour votre prochaine venue au bureau.
          </p>
          <button
            onClick={() => setActiveTab('booking')}
            className="mt-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all inline-flex items-center gap-1.5"
          >
            Réserver maintenant
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isConfirmed ? 'border-slate-200/90 hover:border-slate-300' : 'border-slate-200 bg-slate-50/60 opacity-75'
                }`}
              >
                {/* Left: Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        b.resourceType === 'DESK_FLEX'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {b.resourceType === 'DESK_FLEX' ? '🖥️ Bureau Flex' : '🤝 Salle Réunion'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{b.resourceName}</h3>
                    <span
                      className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Confirmé
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-500" />
                          Annulé
                        </>
                      )}
                    </span>
                  </div>

                  {b.title && (
                    <p className="text-xs text-slate-700 font-medium">
                      Objet : {b.title}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {getSlotLabel(b.timeSlot)}
                    </span>
                    {b.resourceFloor && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {b.resourceFloor}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                {isConfirmed && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancellingId === b.id}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {cancellingId === b.id ? 'Annulation...' : 'Libérer la place'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
