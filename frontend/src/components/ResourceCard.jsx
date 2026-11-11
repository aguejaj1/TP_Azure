import React from 'react';
import { Monitor, Users, MapPin, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ResourceCard({ resource, onBook, selectedDate }) {
  const isDesk = resource.type === 'DESK_FLEX';
  const slots = resource.availableSlots || { morning: true, afternoon: true, fullDay: true };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div className="p-5">
        {/* Header: Type badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              isDesk
                ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                : 'bg-purple-50 text-purple-700 border border-purple-200/50'
            }`}
          >
            {isDesk ? '🖥️ Bureau Flex' : '🤝 Salle Réunion'}
          </span>

          <div className="flex items-center gap-1.5 text-xs">
            {resource.isAvailable ? (
              <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Disponible
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-full">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Complet
              </span>
            )}
          </div>
        </div>

        {/* Name & Location */}
        <h3 className="font-bold text-slate-900 text-base mb-1">{resource.name}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {resource.floor} • {resource.zone}
          </span>
          {!isDesk && (
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {resource.capacity} pers.
            </span>
          )}
        </div>

        {/* Equipment Badges */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Équipements</div>
          <div className="flex flex-wrap gap-1.5">
            {resource.equipment && resource.equipment.map((eq, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg"
              >
                <Monitor className="w-3 h-3 text-slate-500" />
                {eq}
              </span>
            ))}
          </div>
        </div>

        {/* Slot Availability Pills */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center justify-between">
            <span>Créneaux ({selectedDate})</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div
              className={`py-1 rounded-md border font-medium ${
                slots.morning
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
              }`}
            >
              Matin
            </div>
            <div
              className={`py-1 rounded-md border font-medium ${
                slots.afternoon
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
              }`}
            >
              Après-midi
            </div>
            <div
              className={`py-1 rounded-md border font-medium ${
                slots.fullDay
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
              }`}
            >
              Journée
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {slots.fullDay ? 'Journée complète libre' : resource.isAvailable ? 'Créneau partiel dispo' : 'Aucun créneau'}
        </span>
        <button
          onClick={() => onBook(resource)}
          disabled={!resource.isAvailable}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
            resource.isAvailable
              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 hover:shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Réserver
        </button>
      </div>
    </div>
  );
}
