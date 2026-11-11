const BookingModel = require('../models/bookingModel');
const ResourceModel = require('../models/resourceModel');
const AuthClient = require('../services/authClient');

// Create a new booking
async function createBooking(req, res) {
  try {
    const { resourceId, date, timeSlot, title } = req.body;

    if (!resourceId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Champs obligatoires manquants : resourceId, date, timeSlot'
      });
    }

    const validSlots = ['MORNING', 'AFTERNOON', 'FULL_DAY'];
    if (!validSlots.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        error: `Créneau invalide. Choix possibles: ${validSlots.join(', ')}`
      });
    }

    // Verify resource exists
    const resource = await ResourceModel.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Ressource introuvable'
      });
    }

    if (resource.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        error: 'Cette ressource est actuellement indisponible (maintenance)'
      });
    }

    // Check for conflict
    const conflictCheck = await BookingModel.hasConflict(resourceId, date, timeSlot);
    if (conflictCheck.hasConflict) {
      return res.status(409).json({
        success: false,
        error: `Conflit de réservation : cette ressource est déjà réservée pour le créneau ${conflictCheck.conflictingBooking.timeSlot} par ${conflictCheck.conflictingBooking.userName}`
      });
    }

    // User information from token (supplied by auth middleware or inter-service)
    const user = req.user;

    const booking = await BookingModel.create({
      resourceId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userDepartment: user.department || 'Général',
      date,
      timeSlot,
      title: title || (resource.type === 'MEETING_ROOM' ? 'Réunion d\'équipe' : 'Travail au bureau')
    });

    res.status(201).json({
      success: true,
      message: 'Réservation confirmée avec succès !',
      booking,
      resource
    });
  } catch (err) {
    console.error('Erreur création réservation:', err);
    res.status(500).json({ success: false, error: 'Erreur interne lors de la réservation' });
  }
}

// Get user's own bookings
async function getMyBookings(req, res) {
  try {
    const user = req.user;
    const bookings = await BookingModel.findAll({ userId: user.id });

    // Enrich with resource names
    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const resource = await ResourceModel.findById(b.resourceId);
        return {
          ...b,
          resourceName: resource ? resource.name : 'Ressource inconnue',
          resourceType: resource ? resource.type : 'DESK_FLEX',
          resourceFloor: resource ? resource.floor : '',
          resourceZone: resource ? resource.zone : ''
        };
      })
    );

    res.json({ success: true, count: enriched.length, bookings: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
}

// Get all bookings (with optional filters)
async function getAllBookings(req, res) {
  try {
    const { date, status } = req.query;
    const bookings = await BookingModel.findAll({ date, status });

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const resource = await ResourceModel.findById(b.resourceId);
        return {
          ...b,
          resourceName: resource ? resource.name : 'Ressource inconnue',
          resourceType: resource ? resource.type : 'DESK_FLEX',
          resourceFloor: resource ? resource.floor : ''
        };
      })
    );

    res.json({ success: true, count: enriched.length, bookings: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
}

// Cancel booking
async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Réservation non trouvée' });
    }

    // Only booking owner or admin/manager can cancel
    const user = req.user;
    const isOwner = booking.userId === user.id;
    const isPrivileged = ['ADMIN', 'MANAGER'].includes(user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        error: 'Vous ne pouvez annuler que vos propres réservations'
      });
    }

    await BookingModel.cancel(id);

    res.json({
      success: true,
      message: 'Réservation annulée avec succès',
      bookingId: id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'annulation' });
  }
}

// Stats & analytics
async function getStats(req, res) {
  try {
    const resources = await ResourceModel.findAll();
    const allBookings = await BookingModel.findAll({ status: 'CONFIRMED' });
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = allBookings.filter(b => b.date === today);

    const totalDesks = resources.filter(r => r.type === 'DESK_FLEX').length;
    const totalRooms = resources.filter(r => r.type === 'MEETING_ROOM').length;

    const desksBookedToday = todayBookings.filter(b => {
      const res = resources.find(r => r.id === b.resourceId);
      return res && res.type === 'DESK_FLEX';
    }).length;

    const roomsBookedToday = todayBookings.filter(b => {
      const res = resources.find(r => r.id === b.resourceId);
      return res && res.type === 'MEETING_ROOM';
    }).length;

    const occupancyRate = resources.length > 0
      ? Math.round((todayBookings.length / resources.length) * 100)
      : 0;

    res.json({
      success: true,
      date: today,
      stats: {
        totalResources: resources.length,
        totalDesks,
        totalRooms,
        activeBookingsToday: todayBookings.length,
        desksBookedToday,
        roomsBookedToday,
        availableDesksToday: Math.max(0, totalDesks - desksBookedToday),
        availableRoomsToday: Math.max(0, totalRooms - roomsBookedToday),
        occupancyRatePercent: Math.min(100, occupancyRate)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur calcul statistiques' });
  }
}

// Health check with Auth Service inter-service probe
async function healthCheck(req, res) {
  const authPing = await AuthClient.pingAuthService();

  res.json({
    status: 'UP',
    service: 'booking-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    microservices: {
      authServiceConnectivity: authPing.reachable ? 'CONNECTED' : 'UNREACHABLE_OR_FALLBACK',
      authServiceDetails: authPing
    },
    version: '1.0.0'
  });
}

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  getStats,
  healthCheck
};
