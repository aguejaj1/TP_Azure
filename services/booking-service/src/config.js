require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5002,
  JWT_SECRET: process.env.JWT_SECRET || 'flex-office-super-secret-jwt-key-2026',
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  DATABASE_URL: process.env.DATABASE_URL || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
