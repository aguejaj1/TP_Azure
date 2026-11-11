const { Pool } = require('pg');
const config = require('../config');

let pool = null;
let usePostgres = false;
let memoryBookings = [];

function getTodayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

const defaultSeedBookings = [
  {
    id: 'book-seed-1',
    resourceId: 'res-desk-1',
    userId: 'user-emp-1',
    userName: 'Alice Dupont',
    userEmail: 'alice@company.com',
    userDepartment: 'Ingénierie',
    date: getTodayStr(),
    timeSlot: 'FULL_DAY',
    title: 'Journée de dev sprint',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'book-seed-2',
    resourceId: 'res-room-1',
    userId: 'user-manager-1',
    userName: 'Sophie Martin',
    userEmail: 'manager@company.com',
    userDepartment: 'Marketing',
    date: getTodayStr(),
    timeSlot: 'MORNING',
    title: 'Comité de direction Q4',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'book-seed-3',
    resourceId: 'res-desk-3',
    userId: 'user-emp-2',
    userName: 'Bob Tremblay',
    userEmail: 'bob@company.com',
    userDepartment: 'Design & Produit',
    date: getTomorrowStr(),
    timeSlot: 'AFTERNOON',
    title: 'Revue maquettes UX',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  }
];

function slotsOverlap(slot1, slot2) {
  if (slot1 === 'FULL_DAY' || slot2 === 'FULL_DAY') return true;
  return slot1 === slot2;
}

async function initDB() {
  if (config.DATABASE_URL) {
    try {
      pool = new Pool({
        connectionString: config.DATABASE_URL,
        ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(64) PRIMARY KEY,
          resource_id VARCHAR(64) NOT NULL,
          user_id VARCHAR(64) NOT NULL,
          user_name VARCHAR(128) NOT NULL,
          user_email VARCHAR(128) NOT NULL,
          user_department VARCHAR(128),
          date VARCHAR(32) NOT NULL,
          time_slot VARCHAR(32) NOT NULL,
          title VARCHAR(255),
          status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const res = await pool.query('SELECT COUNT(*) FROM bookings');
      if (parseInt(res.rows[0].count, 10) === 0) {
        for (const b of defaultSeedBookings) {
          await pool.query(
            `INSERT INTO bookings (id, resource_id, user_id, user_name, user_email, user_department, date, time_slot, title, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [b.id, b.resourceId, b.userId, b.userName, b.userEmail, b.userDepartment, b.date, b.timeSlot, b.title, b.status, b.createdAt]
          );
        }
      }
      usePostgres = true;
      console.log('✅ [Booking Service] Connecté à PostgreSQL (Bookings).');
    } catch (err) {
      console.warn('⚠️ [Booking Service] Erreur PostgreSQL (Bookings), bascule sur mémoire :', err.message);
      memoryBookings = [...defaultSeedBookings];
      usePostgres = false;
    }
  } else {
    memoryBookings = [...defaultSeedBookings];
    usePostgres = false;
  }
}

const BookingModel = {
  init: initDB,

  async hasConflict(resourceId, date, timeSlot, excludeBookingId = null) {
    const activeBookings = await this.findByResourceAndDate(resourceId, date);
    for (const b of activeBookings) {
      if (excludeBookingId && b.id === excludeBookingId) continue;
      if (b.status === 'CONFIRMED' && slotsOverlap(b.timeSlot, timeSlot)) {
        return {
          hasConflict: true,
          conflictingBooking: b
        };
      }
    }
    return { hasConflict: false };
  },

  async findByResourceAndDate(resourceId, date) {
    if (usePostgres && pool) {
      const res = await pool.query(
        'SELECT id, resource_id as "resourceId", user_id as "userId", user_name as "userName", user_email as "userEmail", user_department as "userDepartment", date, time_slot as "timeSlot", title, status, created_at as "createdAt" FROM bookings WHERE resource_id = $1 AND date = $2 AND status = $3',
        [resourceId, date, 'CONFIRMED']
      );
      return res.rows;
    }
    return memoryBookings.filter(b => b.resourceId === resourceId && b.date === date && b.status === 'CONFIRMED');
  },

  async findAll(filters = {}) {
    if (usePostgres && pool) {
      let query = 'SELECT id, resource_id as "resourceId", user_id as "userId", user_name as "userName", user_email as "userEmail", user_department as "userDepartment", date, time_slot as "timeSlot", title, status, created_at as "createdAt" FROM bookings WHERE 1=1';
      const params = [];
      if (filters.date) {
        params.push(filters.date);
        query += ` AND date = $${params.length}`;
      }
      if (filters.userId) {
        params.push(filters.userId);
        query += ` AND user_id = $${params.length}`;
      }
      if (filters.status) {
        params.push(filters.status);
        query += ` AND status = $${params.length}`;
      }
      query += ' ORDER BY date DESC, created_at DESC';
      const res = await pool.query(query, params);
      return res.rows;
    }

    let items = [...memoryBookings];
    if (filters.date) items = items.filter(b => b.date === filters.date);
    if (filters.userId) items = items.filter(b => b.userId === filters.userId);
    if (filters.status) items = items.filter(b => b.status === filters.status);
    return items.sort((a, b) => b.date.localeCompare(a.date));
  },

  async findById(id) {
    if (usePostgres && pool) {
      const res = await pool.query(
        'SELECT id, resource_id as "resourceId", user_id as "userId", user_name as "userName", user_email as "userEmail", user_department as "userDepartment", date, time_slot as "timeSlot", title, status, created_at as "createdAt" FROM bookings WHERE id = $1',
        [id]
      );
      return res.rows[0] || null;
    }
    return memoryBookings.find(b => b.id === id) || null;
  },

  async create(data) {
    const newBooking = {
      id: 'book-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
      resourceId: data.resourceId,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      userDepartment: data.userDepartment || 'Général',
      date: data.date,
      timeSlot: data.timeSlot,
      title: data.title || 'Réservation Flex Office',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    if (usePostgres && pool) {
      await pool.query(
        `INSERT INTO bookings (id, resource_id, user_id, user_name, user_email, user_department, date, time_slot, title, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newBooking.id,
          newBooking.resourceId,
          newBooking.userId,
          newBooking.userName,
          newBooking.userEmail,
          newBooking.userDepartment,
          newBooking.date,
          newBooking.timeSlot,
          newBooking.title,
          newBooking.status,
          newBooking.createdAt
        ]
      );
    } else {
      memoryBookings.push(newBooking);
    }

    return newBooking;
  },

  async cancel(id) {
    if (usePostgres && pool) {
      const res = await pool.query(
        'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id, status',
        ['CANCELLED', id]
      );
      return res.rowCount > 0;
    }
    const b = memoryBookings.find(x => x.id === id);
    if (!b) return false;
    b.status = 'CANCELLED';
    return true;
  },

  resetForTests() {
    memoryBookings = [...defaultSeedBookings];
  }
};

module.exports = BookingModel;
