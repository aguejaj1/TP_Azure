const jwt = require('jsonwebtoken');
const config = require('../config');

function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token d\'authentification manquant ou format invalide'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token expiré ou non valide',
      details: err.message
    });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Non authentifié' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Accès refusé. Rôle requis: [${allowedRoles.join(', ')}], rôle actuel: ${req.user.role}`
      });
    }
    next();
  };
}

module.exports = {
  verifyAuth,
  requireRole
};
