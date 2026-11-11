// API Client for Decoupled Microservices Architecture

const TOKEN_KEY = 'flex_office_token';
const USER_KEY = 'flex_office_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

async function request(endpoint, options = {}) {
  const token = authStorage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Erreur serveur (${res.status})`);
    }
    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // MICROSERVICE 1: AUTHENTICATION & USERS
  auth: {
    login: async (email, password) => {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data.token) {
        authStorage.setToken(data.token);
        authStorage.setUser(data.user);
      }
      return data;
    },

    register: async (userData) => {
      const data = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (data.token) {
        authStorage.setToken(data.token);
        authStorage.setUser(data.user);
      }
      return data;
    },

    getProfile: () => request('/api/auth/profile'),

    getUsers: () => request('/api/auth/users'),

    checkHealth: async () => {
      try {
        const start = Date.now();
        const data = await request('/api/auth/health');
        return { status: 'UP', latency: Date.now() - start, data };
      } catch (err) {
        return { status: 'DOWN', error: err.message };
      }
    }
  },

  // MICROSERVICE 2: BOOKINGS & RESOURCES
  booking: {
    getResources: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/resources${query ? `?${query}` : ''}`);
    },

    getResourceAvailability: (id, date) => 
      request(`/api/resources/${id}/availability?date=${date}`),

    createResource: (resourceData) =>
      request('/api/resources', {
        method: 'POST',
        body: JSON.stringify(resourceData)
      }),

    getBookings: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/bookings${query ? `?${query}` : ''}`);
    },

    getMyBookings: () => request('/api/bookings/my'),

    createBooking: (bookingData) =>
      request('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      }),

    cancelBooking: (bookingId) =>
      request(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      }),

    getStats: () => request('/api/bookings/stats'),

    checkHealth: async () => {
      try {
        const start = Date.now();
        const data = await request('/api/bookings/health');
        return { status: 'UP', latency: Date.now() - start, data };
      } catch (err) {
        return { status: 'DOWN', error: err.message };
      }
    }
  }
};
