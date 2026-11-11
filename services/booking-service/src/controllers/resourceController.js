const ResourceModel = require('../models/resourceModel');
const BookingModel = require('../models/bookingModel');

async function getAllResources(req, res) {
  try {
    const { type, floor, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const resources = await ResourceModel.findAll({ type, floor });

    // Enrich with availability for the selected date
    const enriched = await Promise.all(
      resources.map(async (r) => {
        const bookings = await BookingModel.findByResourceAndDate(r.id, targetDate);
        const bookedSlots = bookings.map(b => b.timeSlot);
        const isFullDayBooked = bookedSlots.includes('FULL_DAY') || (bookedSlots.includes('MORNING') && bookedSlots.includes('AFTERNOON'));
        
        return {
          ...r,
          currentDate: targetDate,
          isAvailable: !isFullDayBooked,
          availableSlots: {
            morning: !bookedSlots.includes('FULL_DAY') && !bookedSlots.includes('MORNING'),
            afternoon: !bookedSlots.includes('FULL_DAY') && !bookedSlots.includes('AFTERNOON'),
            fullDay: bookedSlots.length === 0
          },
          bookingsToday: bookings
        };
      })
    );

    res.json({ success: true, count: enriched.length, resources: enriched });
  } catch (err) {
    console.error('Erreur récupération ressources:', err);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
}

async function getResourceById(req, res) {
  try {
    const resource = await ResourceModel.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Ressource non trouvée' });
    }
    res.json({ success: true, resource });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
}

async function checkAvailability(req, res) {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Paramètre ?date=YYYY-MM-DD requis' });
    }

    const resource = await ResourceModel.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Ressource non trouvée' });
    }

    const bookings = await BookingModel.findByResourceAndDate(id, date);
    const bookedSlots = bookings.map(b => b.timeSlot);

    res.json({
      success: true,
      resourceId: id,
      date,
      availableSlots: {
        MORNING: !bookedSlots.includes('FULL_DAY') && !bookedSlots.includes('MORNING'),
        AFTERNOON: !bookedSlots.includes('FULL_DAY') && !bookedSlots.includes('AFTERNOON'),
        FULL_DAY: bookedSlots.length === 0
      },
      existingBookings: bookings
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
}

async function createResource(req, res) {
  try {
    const { name, type, floor, zone, capacity, equipment } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'Nom et type requis' });
    }

    const newResource = await ResourceModel.create({
      name,
      type,
      floor,
      zone,
      capacity,
      equipment
    });

    res.status(201).json({ success: true, resource: newResource });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur création ressource' });
  }
}

module.exports = {
  getAllResources,
  getResourceById,
  checkAvailability,
  createResource
};
