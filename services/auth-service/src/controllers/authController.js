const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const config = require('../config');

// Register
async function register(req, res) {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nom, adresse email et mot de passe sont obligatoires'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      role: role || 'EMPLOYEE',
      department: department || 'Général'
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      token,
      user
    });
  } catch (err) {
    console.error('Erreur inscription:', err);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
}

// Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides (email introuvable)'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides (mot de passe incorrect)'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Erreur connexion:', err);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
}

// Profile
async function getProfile(req, res) {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
}

// Inter-service: Verify Token endpoint
// Used by booking-service to validate an Authorization header
async function verifyToken(req, res) {
  try {
    const token = req.body.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(400).json({ success: false, valid: false, error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, valid: false, error: 'Utilisateur associé introuvable' });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, valid: false, error: 'Token expiré ou invalide', details: err.message });
  }
}

// Get user by ID (used by booking-service for enrichment)
async function getUserById(req, res) {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
}

// List all users
async function getAllUsers(req, res) {
  try {
    const users = await UserModel.findAll();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
}

// Health Check
function healthCheck(req, res) {
  res.json({
    status: 'UP',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: UserModel.isPostgresActive() ? 'PostgreSQL' : 'In-Memory/Seeded',
    version: '1.0.0'
  });
}

module.exports = {
  register,
  login,
  getProfile,
  verifyToken,
  getUserById,
  getAllUsers,
  healthCheck
};
