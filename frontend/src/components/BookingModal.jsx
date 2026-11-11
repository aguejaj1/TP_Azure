import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Calendar, Clock, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export default function BookingModal({ resource, date, onClose, onSuccess }) {
  const [timeSlot, setTimeSlot] = useState(
    resource?.availableSlots?.fullDay
      ? 'FULL_DAY'
      : resource?.availableSlots?.morning
      ? 'MORNING'
      : 'AFTERNOON'
  );
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!resource) return null;

  const slots = resource.availableSlots || { morning: true, afternoon: true, fullDay: true };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.booking.createBooking({
        resourceId: resource.id,
        date,
        timeSlot,
        title: title.trim() || (resource.type === 'MEETING_ROOM' ? 'Réunion de travail' : 'Session Flex Office')
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Erreur lors de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-600">
              Confirmation de réservation
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{resource.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Impossible de valider la réservation</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Date info */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span className="font-medium">Date sélectionnée :</span>
            <span className="font-semibold text-slate-900">{date}</span>
          </div>

          {/* Time Slot Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Choisir le créneau horaire
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setTimeSlot('MORNING')}
                disabled={!slots.morning}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  timeSlot === 'MORNING'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-sm ring-1 ring-sky-600'
                    : slots.morning
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-semibold">Matin</span>
                <span className="text-[10px] opacity-75">08h30 - 12h30</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeSlot('AFTERNOON')}
                disabled={!slots.afternoon}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  timeSlot === 'AFTERNOON'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-sm ring-1 ring-sky-600'
                    : slots.afternoon
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-semibold">Après-midi</span>
                <span className="text-[10px] opacity-75">13h30 - 18h00</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeSlot('FULL_DAY')}
                disabled={!slots.fullDay}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  timeSlot === 'FULL_DAY'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-sm ring-1 ring-sky-600'
                    : slots.fullDay
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-semibold">Journée</span>
                <span className="text-[10px] opacity-75">08h30 - 18h00</span>
              </button>
            </div>
          </div>

          {/* Subject / Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Objet ou note (optionnel)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={resource.type === 'MEETING_ROOM' ? 'Ex: Brainstorming projet Q1' : 'Ex: Travail concentré'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Microservices Inter-communication badge */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Validation via <strong>Auth Service</strong> (JWT) & vérification anti-conflit sur <strong>Booking Service</strong>.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Validation microservice...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirmer la réservation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
