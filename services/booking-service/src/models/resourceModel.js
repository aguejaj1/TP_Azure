const { Pool } = require('pg');
const config = require('../config');

let pool = null;
let usePostgres = false;
let memoryResources = [];

const defaultSeedResources = [
  {
    id: 'res-desk-1',
    name: 'Poste A1 - Open Space',
    type: 'DESK_FLEX',
    floor: 'Étage 1',
    zone: 'Open Space Nord',
    capacity: 1,
    equipment: ['Double écran 27"', 'Prise USB-C 65W', 'Chaise ergonomique Herman Miller'],
    status: 'AVAILABLE'
  },
  {
    id: 'res-desk-2',
    name: 'Poste A2 - Open Space',
    type: 'DESK_FLEX',
    floor: 'Étage 1',
    zone: 'Open Space Nord',
    capacity: 1,
    equipment: ['Écran 34" Ultrawide incurvé', 'Dock station universelle'],
    status: 'AVAILABLE'
  },
  {
    id: 'res-desk-3',
    name: 'Poste B1 - Espace Silence',
    type: 'DESK_FLEX',
    floor: 'Étage 1',
    zone: 'Zone Silence',
    capacity: 1,
    equipment: ['Bureau assis-debout motorisé', 'Double écran 24"', 'Casque réducteur de bruit'],
    status: 'AVAILABLE'
  },
  {
    id: 'res-desk-4',
    name: 'Poste B2 - Espace Silence',
    type: 'DESK_FLEX',
    floor: 'Étage 1',
    zone: 'Zone Silence',
    capacity: 1,
    equipment: ['Écran 27" 4K', 'Lampe de bureau réglable', 'Chaise ergonomique'],
    status: 'AVAILABLE'
  },
  {
    id: 'res-desk-5',
    name: 'Poste C1 - Lab Créatif',
    type: 'DESK_FLEX',
    floor: 'Étage 2',
    zone: 'Pôle Design & Dev',
    capacity: 1,
    equipment: ['Bureau assis-debout motorisé', 'Écran calibré 32" 4K', 'Double bras articulé'],
    status: 'AVAILABLE'
  },
  {
    id: 'res-desk-6',
    name: 'Poste C2 - Pôle Tech',
    type: 'DESK_FLEX',
    floor: 'Étage 2',
    zone: 'Pôle Design & Dev',
    capacity: 1,
    equipment: ['Double écran 27"', 'Dock Thunderbolt 4', 'Connexion RJ45 10Gbps'],
    status: 'AVAILABLE'
  },
  {
    id: 'res-room-1',
    name: 'Salle Titan (Conseil)',
    type: 'MEETING_ROOM',
    floor: 'Étage 1',
    zone: 'Aile Réunions',
    capacity: 12,
    equipment: ['Double écran 75"', 'Caméra visio 4K intelligente (suivi auto)', 'Tableau blanc interactif', 'Micro-pieuvres'],
    status: 'AVAILABLE'
  },
  {
    id: 'res-room-2',
    name: 'Salle Boréal (Brainstorm)',
    type: 'MEETING_ROOM',
    floor: 'Étage 1',
    zone: 'Aile Réunions',
    capacity: 6,
    equipment: ['TV 65"', 'Barre de visio Teams/Zoom', 'Grand tableau blanc émaillé'],
    status: 'AVAILABLE'
  },
  {
    id: 'res-room-3',
    name: 'Salle Nebula (Workshop)',
    type: 'MEETING_ROOM',
    floor: 'Étage 2',
    zone: 'Aile Projets',
    capacity: 4,
    equipment: ['TV 55"', 'Système visio sans fil', 'Mur d\'affichage post-it'],
    status: 'AVAILABLE'
  },
  {
    id: 'res-room-4',
    name: 'Box Phone & Focus 1',
    type: 'MEETING_ROOM',
    floor: 'Étage 2',
    zone: 'Espace Silence',
    capacity: 1,
    equipment: ['Cabine insonorisée 40dB', 'Écran d\'appoint 24"', 'Ventilation silencieuse'],
    status: 'AVAILABLE'
  }
];

async function initDB() {
  if (config.DATABASE_URL) {
    try {
      pool = new Pool({
        connectionString: config.DATABASE_URL,
        ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      await pool.query(`
        CREATE TABLE IF NOT EXISTS resources (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128) NOT NULL,
          type VARCHAR(32) NOT NULL,
          floor VARCHAR(64) NOT NULL,
          zone VARCHAR(64),
          capacity INT NOT NULL DEFAULT 1,
          equipment JSONB NOT NULL DEFAULT '[]',
          status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE'
        );
      `);

      const res = await pool.query('SELECT COUNT(*) FROM resources');
      if (parseInt(res.rows[0].count, 10) === 0) {
        for (const r of defaultSeedResources) {
          await pool.query(
            'INSERT INTO resources (id, name, type, floor, zone, capacity, equipment, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [r.id, r.name, r.type, r.floor, r.zone, r.capacity, JSON.stringify(r.equipment), r.status]
          );
        }
      }
      usePostgres = true;
      console.log('✅ [Booking Service] Connecté à PostgreSQL (Resources).');
    } catch (err) {
      console.warn('⚠️ [Booking Service] Erreur PostgreSQL (Resources), bascule sur mémoire :', err.message);
      memoryResources = [...defaultSeedResources];
      usePostgres = false;
    }
  } else {
    memoryResources = [...defaultSeedResources];
    usePostgres = false;
  }
}

const ResourceModel = {
  init: initDB,

  async findAll(filters = {}) {
    let items = [];
    if (usePostgres && pool) {
      let query = 'SELECT * FROM resources WHERE 1=1';
      const params = [];
      if (filters.type) {
        params.push(filters.type);
        query += ` AND type = $${params.length}`;
      }
      if (filters.floor) {
        params.push(filters.floor);
        query += ` AND floor = $${params.length}`;
      }
      const res = await pool.query(query, params);
      items = res.rows.map(r => ({
        ...r,
        equipment: typeof r.equipment === 'string' ? JSON.parse(r.equipment) : r.equipment
      }));
    } else {
      items = [...memoryResources];
      if (filters.type) {
        items = items.filter(r => r.type === filters.type);
      }
      if (filters.floor) {
        items = items.filter(r => r.floor === filters.floor);
      }
    }
    return items;
  },

  async findById(id) {
    if (usePostgres && pool) {
      const res = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        ...r,
        equipment: typeof r.equipment === 'string' ? JSON.parse(r.equipment) : r.equipment
      };
    }
    return memoryResources.find(r => r.id === id) || null;
  },

  async create(data) {
    const newRes = {
      id: 'res-' + (data.type === 'MEETING_ROOM' ? 'room-' : 'desk-') + Date.now().toString(36),
      name: data.name,
      type: data.type || 'DESK_FLEX',
      floor: data.floor || 'Étage 1',
      zone: data.zone || 'Espace Principal',
      capacity: parseInt(data.capacity, 10) || 1,
      equipment: data.equipment || [],
      status: 'AVAILABLE'
    };

    if (usePostgres && pool) {
      await pool.query(
        'INSERT INTO resources (id, name, type, floor, zone, capacity, equipment, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [newRes.id, newRes.name, newRes.type, newRes.floor, newRes.zone, newRes.capacity, JSON.stringify(newRes.equipment), newRes.status]
      );
    } else {
      memoryResources.push(newRes);
    }
    return newRes;
  },

  resetForTests() {
    memoryResources = [...defaultSeedResources];
  }
};

module.exports = ResourceModel;
