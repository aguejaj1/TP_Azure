const express = require('express');
const cors = require('cors');
const config = require('./config');
const UserModel = require('./models/userModel');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[AUTH-SERVICE] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Root & Health
app.get('/', (req, res) => {
  res.json({
    service: 'Auth Service (Gestion Utilisateurs & JWT)',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/auth/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile',
      verify: 'POST /api/auth/verify',
      users: 'GET /api/auth/users'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route non trouvée sur Auth Service' });
});

// Start server function
async function startServer() {
  await UserModel.init();
  const server = app.listen(config.PORT, () => {
    console.log(`🚀 [Auth Service] En écoute sur le port ${config.PORT}`);
    console.log(`🔑 Comptes de test disponibles :`);
    console.log(`   - Admin:    admin@company.com / admin123`);
    console.log(`   - Manager:  manager@company.com / manager123`);
    console.log(`   - Employé:  alice@company.com / alice123`);
    console.log(`   - Employé:  bob@company.com / bob123`);
  });
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Échec du démarrage de Auth Service:', err);
    process.exit(1);
  });
}

module.exports = { app, startServer };
