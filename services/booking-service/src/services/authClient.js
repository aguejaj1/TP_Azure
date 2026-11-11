const config = require('../config');
const jwt = require('jsonwebtoken');

// Inter-service client to communicate with Auth Service
const AuthClient = {
  /**
   * Verify token with Auth Service over HTTP REST
   */
  async verifyTokenWithAuthService(token) {
    if (!token) return { valid: false, error: 'Token manquant' };

    try {
      // Use native fetch (available in Node 18+)
      const response = await fetch(`${config.AUTH_SERVICE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          valid: true,
          user: data.user,
          source: 'AUTH_MICROSERVICE_HTTP'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          valid: false,
          error: errorData.error || 'Token rejeté par le microservice Auth'
        };
      }
    } catch (networkError) {
      // Fallback: If Auth Service is unreachable (e.g. standalone test or network partition),
      // we can verify the shared JWT secret directly to maintain high availability.
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        return {
          valid: true,
          user: decoded,
          source: 'FALLBACK_JWT_LOCAL'
        };
      } catch (err) {
        return { valid: false, error: 'Token invalide ou Auth Service injoignable' };
      }
    }
  },

  /**
   * Get user details by ID from Auth Service
   */
  async getUserById(userId) {
    try {
      const response = await fetch(`${config.AUTH_SERVICE_URL}/api/auth/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
    } catch (e) {
      console.warn(`[Booking Service] Impossible de joindre Auth Service pour l'utilisateur ${userId}:`, e.message);
    }
    return null;
  },

  /**
   * Ping Auth Service for health / connectivity check
   */
  async pingAuthService() {
    try {
      const start = Date.now();
      const response = await fetch(`${config.AUTH_SERVICE_URL}/api/auth/health`);
      const latency = Date.now() - start;
      if (response.ok) {
        const data = await response.json();
        return { reachable: true, latency: `${latency}ms`, status: data.status };
      }
      return { reachable: false, status: response.status };
    } catch (err) {
      return { reachable: false, error: err.message };
    }
  }
};

module.exports = AuthClient;
