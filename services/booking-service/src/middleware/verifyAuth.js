const AuthClient = require('../services/authClient');

async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token d\'authentification manquant dans l\'entête Authorization'
    });
  }

  const token = authHeader.split(' ')[1];
  const result = await AuthClient.verifyTokenWithAuthService(token);

  if (!result.valid) {
    return res.status(401).json({
      success: false,
      error: result.error || 'Authentification échouée'
    });
  }

  req.user = result.user;
  req.authSource = result.source;
  next();
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
