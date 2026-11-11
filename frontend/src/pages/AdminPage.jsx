import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShieldAlert,
  Users,
  PlusCircle,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  Monitor
} from 'lucide-react';

export default function AdminPage() {
  const [allBookings, setAllBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('bookings'); // bookings, add-resource, users
  const [isLoading, setIsLoading] = useState(false);

  // New resource form state
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'DESK_FLEX',
    floor: 'Étage 1',
    zone: 'Zone Open Space',
    capacity: 1,
    equipment: 'Double écran, Prise USB-C'
  });
  const [formMsg, setFormMsg] = useState(null);

  async function loadAdminData() {
    setIsLoading(true);
    try {
      const [bookingsRes, usersRes, statsRes] = await Promise.all([
        api.booking.getBookings(),
        api.auth.getUsers().catch(() => ({ users: [] })),
        api.booking.getStats()
      ]);
      setAllBookings(bookingsRes.bookings || []);
      setUsersList(usersRes.users || []);
      setStats(statsRes.stats);
    } catch (err) {
      console.error('Erreur chargement admin:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      const equipmentArray = newResource.equipment
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await api.booking.createResource({
        ...newResource,
        capacity: parseInt(newResource.capacity, 10),
        equipment: equipmentArray
      });

      setFormMsg({ type: 'success', text: `Ressource "${newResource.name}" ajoutée au parc avec succès !` });
      setNewResource({
        name: '',
        type: 'DESK_FLEX',
        floor: 'Étage 1',
        zone: 'Zone Open Space',
        capacity: 1,
        equipment: 'Double écran, Prise USB-C'
      });
      loadAdminData();
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message || 'Erreur lors de la création' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            Panneau d'Administration & Gestion des Espaces
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervisez les flux de réservations, le parc de matériel et la liste des employés
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('bookings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'bookings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Toutes les réservations ({allBookings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('add-resource')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'add-resource' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            + Ajouter un espace
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Utilisateurs ({usersList.length})
          </button>
        </div>
      </div>

      {/* Subtab: Bookings */}
      {activeSubTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Flux des réservations d'entreprise (Microservice 2)
            </h3>
            <span className="text-xs text-slate-500">
              Total {allBookings.length} réservations enregistrées
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employé</th>
                  <th className="py-3 px-4">Département</th>
                  <th className="py-3 px-4">Espace</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Créneau</th>
                  <th className="py-3 px-4">Objet</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.userName}</td>
                    <td className="py-3 px-4 text-slate-600">{b.userDepartment || 'Général'}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{b.resourceName}</td>
                    <td className="py-3 px-4 text-slate-600">{b.date}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{b.timeSlot}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-[180px] truncate">{b.title || '-'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab: Add Resource */}
      {activeSubTab === 'add-resource' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
            <PlusCircle className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ajouter un nouveau poste ou une salle</h3>
              <p className="text-xs text-slate-500">Mettez à disposition un nouvel équipement au catalogue</p>
            </div>
          </div>

          {formMsg && (
            <div
              className={`mb-4 p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                formMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{formMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateResource} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom de l'espace
              </label>
              <input
                type="text"
                required
                value={newResource.name}
                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                placeholder="Ex: Poste D1 - Zone Sud ou Salle Galaxie"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type d'espace
                </label>
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="DESK_FLEX">Bureau Flex Office</option>
                  <option value="MEETING_ROOM">Salle de Réunion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Capacité (personnes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newResource.capacity}
                  onChange={(e) => setNewResource({ ...newResource, capacity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Étage
                </label>
                <select
                  value={newResource.floor}
                  onChange={(e) => setNewResource({ ...newResource, floor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="Étage 1">Étage 1</option>
                  <option value="Étage 2">Étage 2</option>
                  <option value="Étage 3">Étage 3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Zone / Aile
                </label>
                <input
                  type="text"
                  value={newResource.zone}
                  onChange={(e) => setNewResource({ ...newResource, zone: e.target.value })}
                  placeholder="Ex: Pôle Dev ou Aile Est"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Équipements (séparés par des virgules)
              </label>
              <input
                type="text"
                value={newResource.equipment}
                onChange={(e) => setNewResource({ ...newResource, equipment: e.target.value })}
                placeholder="Double écran 27, Dock USB-C, Chaise ergonomique"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 transition-all"
            >
              Créer la ressource
            </button>
          </form>
        </div>
      )}

      {/* Subtab: Users */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Employés enregistrés (Récupérés depuis Microservice Auth & Users)
            </h3>
            <span className="text-xs text-slate-500">{usersList.length} comptes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Département</th>
                  <th className="py-3 px-4">Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 text-slate-700">{u.department}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800">
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
