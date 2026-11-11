import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import BookingModal from '../components/BookingModal';
import FloorPlan from '../components/FloorPlan';
import {
  Calendar,
  Search,
  Filter,
  Monitor,
  Users,
  Layers,
  LayoutGrid,
  RefreshCw
} from 'lucide-react';

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, DESK_FLEX, MEETING_ROOM
  const [floorFilter, setFloorFilter] = useState('ALL'); // ALL, Étage 1, Étage 2
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'plan'
  
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  async function loadResources() {
    setIsLoading(true);
    try {
      const params = { date: selectedDate };
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (floorFilter !== 'ALL') params.floor = floorFilter;

      const data = await api.booking.getResources(params);
      setResources(data.resources || []);
    } catch (err) {
      console.error('Erreur chargement des ressources:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
  }, [selectedDate, typeFilter, floorFilter]);

  // Client-side search filtering
  const filteredResources = resources.filter(r => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchName = r.name.toLowerCase().includes(query);
    const matchZone = r.zone?.toLowerCase().includes(query);
    const matchEquipment = r.equipment?.some(eq => eq.toLowerCase().includes(query));
    return matchName || matchZone || matchEquipment;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Réserver un espace de travail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Trouvez un poste flex office ou une salle de réunion équipée selon vos besoins
          </p>
        </div>

        {/* View toggle & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grille
            </button>
            <button
              onClick={() => setViewMode('plan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'plan'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Plan
            </button>
          </div>

          <button
            onClick={loadResources}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm hover:bg-slate-50 transition-colors"
            title="Rafraîchir les disponibilités"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              Date souhaitée
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-sky-600" />
              Catégorie d'espace
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="ALL">Tous les espaces (Bureaux & Salles)</option>
              <option value="DESK_FLEX">🖥️ Bureaux Flex Office</option>
              <option value="MEETING_ROOM">🤝 Salles de Réunion</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              Étage
            </label>
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="ALL">Tous les étages</option>
              <option value="Étage 1">Étage 1 (Open Space & Salles)</option>
              <option value="Étage 2">Étage 2 (Design, Dev & Focus)</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-sky-600" />
              Recherche équipement
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: 4K, Visio, assis-debout..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>
      </div>

      {/* Content based on viewMode */}
      {viewMode === 'plan' ? (
        <FloorPlan
          resources={filteredResources}
          selectedDate={selectedDate}
          onSelectResource={(r) => setSelectedResource(r)}
        />
      ) : (
        <>
          {filteredResources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">Aucun espace trouvé</h3>
              <p className="text-xs text-slate-500 mt-1">
                Essayez de modifier vos filtres ou de sélectionner une autre date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  selectedDate={selectedDate}
                  onBook={(res) => setSelectedResource(res)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Booking Modal */}
      {selectedResource && (
        <BookingModal
          resource={selectedResource}
          date={selectedDate}
          onClose={() => setSelectedResource(null)}
          onSuccess={() => {
            setSelectedResource(null);
            loadResources();
          }}
        />
      )}
    </div>
  );
}
