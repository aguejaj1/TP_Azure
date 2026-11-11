const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app } = require('../src/index');
const config = require('../src/config');
const ResourceModel = require('../src/models/resourceModel');
const BookingModel = require('../src/models/bookingModel');

// Generate test token
function makeTestToken(user) {
  return jwt.sign(
    {
      id: user.id || 'user-emp-1',
      email: user.email || 'alice@company.com',
      name: user.name || 'Alice Dupont',
      role: user.role || 'EMPLOYEE',
      department: user.department || 'Ingénierie'
    },
    config.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

beforeAll(async () => {
  await ResourceModel.init();
  await BookingModel.init();
});

beforeEach(() => {
  ResourceModel.resetForTests();
  BookingModel.resetForTests();
});

describe('Booking Service - Microservice Tests', () => {
  test('GET /api/bookings/health renvoie statut UP', async () => {
    const res = await request(app).get('/api/bookings/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('booking-service');
  });

  test('GET /api/resources liste les bureaux et les salles', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.resources.length).toBeGreaterThanOrEqual(10);
    
    // Check desk and room existence
    const desks = res.body.resources.filter(r => r.type === 'DESK_FLEX');
    const rooms = res.body.resources.filter(r => r.type === 'MEETING_ROOM');
    expect(desks.length).toBeGreaterThan(0);
    expect(rooms.length).toBeGreaterThan(0);
  });

  test('GET /api/resources?type=MEETING_ROOM filtre par type', async () => {
    const res = await request(app).get('/api/resources?type=MEETING_ROOM');
    expect(res.statusCode).toBe(200);
    expect(res.body.resources.every(r => r.type === 'MEETING_ROOM')).toBe(true);
  });

  test('POST /api/bookings crée une nouvelle réservation avec succès', async () => {
    const token = makeTestToken({ id: 'user-emp-2', name: 'Bob Tremblay' });
    const targetDate = '2026-11-20';

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resourceId: 'res-desk-2',
        date: targetDate,
        timeSlot: 'MORNING',
        title: 'Session Focus matin'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.resourceId).toBe('res-desk-2');
    expect(res.body.booking.timeSlot).toBe('MORNING');
    expect(res.body.booking.userId).toBe('user-emp-2');
  });

  test('POST /api/bookings empêche le surbooking (détection de conflit)', async () => {
    const token = makeTestToken({ id: 'user-emp-1', name: 'Alice Dupont' });
    const targetDate = '2026-11-25';

    // Première réservation : Matin
    const res1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resourceId: 'res-room-2',
        date: targetDate,
        timeSlot: 'MORNING',
        title: 'Point d\'étape client'
      });
    expect(res1.statusCode).toBe(201);

    // Tentative de réserver TOUTE LA JOURNÉE sur la même salle au même jour -> Conflit !
    const res2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resourceId: 'res-room-2',
        date: targetDate,
        timeSlot: 'FULL_DAY',
        title: 'Séminaire'
      });
    expect(res2.statusCode).toBe(409);
    expect(res2.body.success).toBe(false);
    expect(res2.body.error).toContain('Conflit de réservation');
  });

  test('GET /api/bookings/my renvoie les réservations de l\'utilisateur connecté', async () => {
    const token = makeTestToken({ id: 'user-emp-1', name: 'Alice Dupont' });

    const res = await request(app)
      .get('/api/bookings/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.bookings)).toBe(true);
  });

  test('DELETE /api/bookings/:id annule la réservation', async () => {
    const token = makeTestToken({ id: 'user-emp-1', name: 'Alice Dupont' });

    // Annuler la réservation seed-1 d'Alice
    const res = await request(app)
      .delete('/api/bookings/book-seed-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Vérifier statut
    const checkRes = await request(app)
      .get('/api/bookings?status=CANCELLED')
      .set('Authorization', `Bearer ${token}`);
    const cancelled = checkRes.body.bookings.find(b => b.id === 'book-seed-1');
    expect(cancelled).toBeDefined();
    expect(cancelled.status).toBe('CANCELLED');
  });

  test('GET /api/bookings/stats renvoie les statistiques du parc de bureaux et salles', async () => {
    const res = await request(app).get('/api/bookings/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalResources).toBeGreaterThanOrEqual(10);
    expect(res.body.stats.totalDesks).toBeGreaterThanOrEqual(6);
    expect(res.body.stats.totalRooms).toBeGreaterThanOrEqual(4);
    expect(res.body.stats).toHaveProperty('occupancyRatePercent');
  });
});
