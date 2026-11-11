const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const config = require('../config');

// In-memory fallback store
let memoryUsers = [];
let pool = null;
let usePostgres = false;

// Default demo users
const defaultSeedUsers = [
  {
    id: 'user-admin-1',
    name: 'Admin Système',
    email: 'admin@company.com',
    passwordHash: bcrypt.hashSync('admin123', 8),
    role: 'ADMIN',
    department: 'IT & Facilities',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-manager-1',
    name: 'Sophie Martin',
    email: 'manager@company.com',
    passwordHash: bcrypt.hashSync('manager123', 8),
    role: 'MANAGER',
    department: 'Marketing',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-emp-1',
    name: 'Alice Dupont',
    email: 'alice@company.com',
    passwordHash: bcrypt.hashSync('alice123', 8),
    role: 'EMPLOYEE',
    department: 'Ingénierie',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-emp-2',
    name: 'Bob Tremblay',
    email: 'bob@company.com',
    passwordHash: bcrypt.hashSync('bob123', 8),
    role: 'EMPLOYEE',
    department: 'Design & Produit',
    createdAt: new Date().toISOString()
  }
];

// Initialize DB
async function initDB() {
  if (config.DATABASE_URL) {
    try {
      pool = new Pool({
        connectionString: config.DATABASE_URL,
        ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128) NOT NULL,
          email VARCHAR(128) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(32) NOT NULL DEFAULT 'EMPLOYEE',
          department VARCHAR(128),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Seed if empty
      const res = await pool.query('SELECT COUNT(*) FROM users');
      if (parseInt(res.rows[0].count, 10) === 0) {
        for (const u of defaultSeedUsers) {
          await pool.query(
            'INSERT INTO users (id, name, email, password_hash, role, department, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [u.id, u.name, u.email, u.passwordHash, u.role, u.department, u.createdAt]
          );
        }
      }
      usePostgres = true;
      console.log('✅ [Auth Service] Connecté à PostgreSQL.');
    } catch (err) {
      console.warn('⚠️ [Auth Service] Impossible de se connecter à PostgreSQL, bascule sur la base mémoire :', err.message);
      memoryUsers = [...defaultSeedUsers];
      usePostgres = false;
    }
  } else {
    memoryUsers = [...defaultSeedUsers];
    usePostgres = false;
  }
}

// User model operations
const UserModel = {
  init: initDB,

  async findByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (usePostgres && pool) {
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        department: row.department,
        createdAt: row.created_at
      };
    }
    return memoryUsers.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findById(id) {
    if (usePostgres && pool) {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        department: row.department,
        createdAt: row.created_at
      };
    }
    const user = memoryUsers.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  async create({ name, email, password, role = 'EMPLOYEE', department = 'General' }) {
    const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const passwordHash = await bcrypt.hash(password, 8);
    const createdAt = new Date().toISOString();
    const newUser = {
      id,
      name,
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role.toUpperCase(),
      department,
      createdAt
    };

    if (usePostgres && pool) {
      await pool.query(
        'INSERT INTO users (id, name, email, password_hash, role, department, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [newUser.id, newUser.name, newUser.email, newUser.passwordHash, newUser.role, newUser.department, newUser.createdAt]
      );
    } else {
      memoryUsers.push(newUser);
    }

    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  },

  async findAll() {
    if (usePostgres && pool) {
      const res = await pool.query('SELECT id, name, email, role, department, created_at as "createdAt" FROM users ORDER BY created_at DESC');
      return res.rows;
    }
    return memoryUsers.map(({ passwordHash, ...safeUser }) => safeUser);
  },

  isPostgresActive() {
    return usePostgres;
  },

  resetForTests() {
    memoryUsers = [...defaultSeedUsers];
  }
};

module.exports = UserModel;
