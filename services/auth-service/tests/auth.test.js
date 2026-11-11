const request = require('supertest');
const { app } = require('../src/index');
const UserModel = require('../src/models/userModel');

beforeAll(async () => {
  await UserModel.init();
});

beforeEach(() => {
  UserModel.resetForTests();
});

describe('Auth Service - Microservice Tests', () => {
  test('GET /api/auth/health devrait renvoyer le statut UP', async () => {
    const res = await request(app).get('/api/auth/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('auth-service');
  });

  test('POST /api/auth/login réussit avec les identifiants Alice', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@company.com',
        password: 'alice123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@company.com');
    expect(res.body.user.role).toBe('EMPLOYEE');
  });

  test('POST /api/auth/login échoue avec un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@company.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register crée un nouvel employé avec succès', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Claire Dupont',
        email: 'claire@company.com',
        password: 'clairepass123',
        department: 'Finance'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('claire@company.com');
    expect(res.body.user.role).toBe('EMPLOYEE');
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/register renvoie 409 si email déjà utilisé', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Double Alice',
        email: 'alice@company.com',
        password: 'secretpassword123'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/verify vérifie le token pour les autres microservices', async () => {
    // 1. Obtenir un token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@company.com',
        password: 'alice123'
      });
    const token = loginRes.body.token;

    // 2. Vérifier via endpoint inter-service
    const verifyRes = await request(app)
      .post('/api/auth/verify')
      .send({ token });

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.valid).toBe(true);
    expect(verifyRes.body.user.id).toBe('user-emp-1');
  });

  test('GET /api/auth/profile renvoie le profil avec token valide', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@company.com', password: 'admin123' });
    const token = loginRes.body.token;

    const profileRes = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.statusCode).toBe(200);
    expect(profileRes.body.user.role).toBe('ADMIN');
  });

  test('GET /api/auth/users refuse l\'accès à un employé et l\'autorise à l\'admin', async () => {
    // Employé
    const empLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@company.com', password: 'alice123' });
    const empRes = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${empLogin.body.token}`);
    expect(empRes.statusCode).toBe(403);

    // Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@company.com', password: 'admin123' });
    const adminRes = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${adminLogin.body.token}`);
    expect(adminRes.statusCode).toBe(200);
    expect(adminRes.body.count).toBeGreaterThan(0);
  });
});
