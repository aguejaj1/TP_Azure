import React, { useState } from 'react';
import { Layers, Monitor, Users, Check, Clock, X } from 'lucide-react';

export default function FloorPlan({ resources, onSelectResource, selectedDate }) {
  const [selectedFloor, setSelectedFloor] = useState('Étage 1');

  const filteredResources = resources.filter(r => r.floor === selectedFloor);
  const desks = filteredResources.filter(r => r.type === 'DESK_FLEX');
  const rooms = filteredResources.filter(r => r.type === 'MEETING_ROOM');

  const getStatusColor = (resource) => {
    if (!resource.isAvailable) {
      return {
        bg: 'bg-rose-50 border-rose-200 text-rose-800 hover:border-rose-300',
        badge: 'bg-rose-100 text-rose-700',
        label: 'Complet'
      };
    }
    if (resource.availableSlots && (!resource.availableSlots.morning || !resource.availableSlots.afternoon)) {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-300',
        badge: 'bg-amber-100 text-amber-700',
        label: 'Partiel'
      };
    }
    return {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-300',
      badge: 'bg-emerald-100 text-emerald-700',
      label: 'Libre'
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Floor selector & legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            Plan interactif des espaces
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cliquez sur un bureau ou une salle pour réserver ({selectedDate})
          </p>
        </div>

        {/* Floor buttons */}
        <div className="flex items-center gap-2">
          {['Étage 1', 'Étage 2'].map(floor => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedFloor === floor
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-slate-600 border-b border-slate-100 mb-6">
        <span className="text-[11px] font-semibold text-slate-400 uppercase">Légende :</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Disponible toute la journée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> Disponible 1 demi-journée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" /> Occupé / Réservé
        </span>
      </div>

      {/* Office Floor Visual Grid */}
      <div className="space-y-6">
        {/* Flex Desks Area */}
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-sky-600" />
            Zone Open Space & Postes Flex
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {desks.map(desk => {
              const status = getStatusColor(desk);
              return (
                <div
                  key={desk.id}
                  onClick={() => onSelectResource(desk)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${status.bg}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900">{desk.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.badge}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mb-2">{desk.zone}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    {desk.equipment?.join(' • ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meeting Rooms Area */}
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-600" />
            Salles de Réunion & Box Confidentiels
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rooms.map(room => {
              const status = getStatusColor(room);
              return (
                <div
                  key={room.id}
                  onClick={() => onSelectResource(room)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${status.bg}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{room.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({room.capacity} pers.)</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.badge}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mb-2">{room.zone}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    {room.equipment?.join(' • ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
