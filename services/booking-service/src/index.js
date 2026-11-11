const express = require('express');
const cors = require('cors');
const config = require('./config');
const ResourceModel = require('./models/resourceModel');
const BookingModel = require('./models/bookingModel');
const resourceRoutes = require('./routes/resourceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[BOOKING-SERVICE] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'Booking Service (Gestion des Réservations Flex Office & Salles)',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/bookings/health',
      resources: 'GET /api/resources',
      bookings: 'GET /api/bookings',
      myBookings: 'GET /api/bookings/my',
      stats: 'GET /api/bookings/stats'
    }
  });
});

// Routes
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route non trouvée sur Booking Service' });
});

async function startServer() {
  await ResourceModel.init();
  await BookingModel.init();

  const server = app.listen(config.PORT, () => {
    console.log(`🚀 [Booking Service] En écoute sur le port ${config.PORT}`);
    console.log(`🔗 Connexion Auth Service configurée vers : ${config.AUTH_SERVICE_URL}`);
  });
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Échec du démarrage de Booking Service:', err);
    process.exit(1);
  });
}

module.exports = { app, startServer };
