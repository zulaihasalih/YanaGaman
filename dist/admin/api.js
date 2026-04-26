/**
 * ══════════════════════════════════════════════════════════════
 *  YANAGAMAN ADMIN — api.js
 *  Backend API Layer — Modular, Reusable, Well-Commented
 *
 *  Architecture: REST API client + Mock data layer
 *  In production: replace MOCK_MODE=false and set BASE_URL
 *  Supports: Auth, Rides, Users, Drivers, Payments, Reports, RBAC
 * ══════════════════════════════════════════════════════════════
 */

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const API_CONFIG = {
  BASE_URL: 'https://api.yanagaman.lk/v1',   // Production API base
  MOCK_MODE: true,                             // Toggle: true = mock data, false = real API
  TIMEOUT_MS: 10000,
  TOKEN_KEY: 'yg_admin_token',
  ROLE_KEY:  'yg_admin_role',
  USER_KEY:  'yg_admin_user',
};


/* ─────────────────────────────────────────────
   TOKEN HELPERS
───────────────────────────────────────────── */
const Auth = {
  /** Store JWT + role after successful login */
  setSession(token, user, role) {
    sessionStorage.setItem(API_CONFIG.TOKEN_KEY, token);
    sessionStorage.setItem(API_CONFIG.ROLE_KEY, role);
    sessionStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(user));
  },
  getToken() { return sessionStorage.getItem(API_CONFIG.TOKEN_KEY); },
  getRole()  { return sessionStorage.getItem(API_CONFIG.ROLE_KEY); },
  getUser()  { const u = sessionStorage.getItem(API_CONFIG.USER_KEY); return u ? JSON.parse(u) : null; },
  clear()    { sessionStorage.removeItem(API_CONFIG.TOKEN_KEY); sessionStorage.removeItem(API_CONFIG.ROLE_KEY); sessionStorage.removeItem(API_CONFIG.USER_KEY); },
  isAuthenticated() { return !!this.getToken(); },
};


/* ─────────────────────────────────────────────
   CORE HTTP CLIENT
   Wraps fetch with auth headers, timeout, error handling
───────────────────────────────────────────── */
async function apiRequest(method, endpoint, body = null) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.status === 401) { Auth.clear(); window.location.reload(); return; }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    console.error(`[API] ${method} ${endpoint}`, err.message);
    throw err;
  }
}

const api = {
  get:    (url)           => apiRequest('GET',    url),
  post:   (url, data)     => apiRequest('POST',   url, data),
  put:    (url, data)     => apiRequest('PUT',    url, data),
  patch:  (url, data)     => apiRequest('PATCH',  url, data),
  delete: (url)           => apiRequest('DELETE', url),
};


/* ═══════════════════════════════════════════════
   MOCK DATA STORE
   Simulates a backend DB for development/demo
═══════════════════════════════════════════════ */
const MockDB = {

  /* ── ADMIN USERS (RBAC) ── */
  admins: [
    { id:'A001', name:'Zulaikha Salih',  email:'admin@yanagaman.lk',   role:'super_admin', lastLogin:'2025-07-16 09:12', status:'active' },
    { id:'A002', name:'Nuwan Perera',    email:'nuwan@yanagaman.lk',   role:'admin',       lastLogin:'2025-07-15 14:30', status:'active' },
    { id:'A003', name:'Thisari Madavi',  email:'support@yanagaman.lk', role:'support',     lastLogin:'2025-07-16 08:45', status:'active' },
    { id:'A004', name:'Kamal Fernando',  email:'finance@yanagaman.lk', role:'finance',     lastLogin:'2025-07-14 11:00', status:'active' },
    { id:'A005', name:'Ruvini Jayamal',  email:'ruvini@yanagaman.lk',  role:'support',     lastLogin:'2025-07-13 16:20', status:'suspended' },
  ],

  /* ── PASSENGERS ── */
  users: [
    { id:'U001', name:'Kasun Bandara',    phone:'+94 77 123 4567', email:'kasun@gmail.com',    rides:48, spent:125400, joined:'2024-03-10', status:'active' },
    { id:'U002', name:'Malsha Fernando',  phone:'+94 71 987 6543', email:'malsha@yahoo.com',   rides:23, spent:58900,  joined:'2024-05-22', status:'active' },
    { id:'U003', name:'Roshan Kumara',    phone:'+94 76 555 1234', email:'roshan@outlook.com', rides:7,  spent:18200,  joined:'2024-11-01', status:'pending' },
    { id:'U004', name:'Nathasha Silva',   phone:'+94 70 444 5678', email:'nat@gmail.com',      rides:112,spent:312500, joined:'2023-08-15', status:'active' },
    { id:'U005', name:'Dinesh Wickrama',  phone:'+94 72 333 9012', email:'din@gmail.com',      rides:5,  spent:12100,  joined:'2025-01-10', status:'suspended' },
    { id:'U006', name:'Amali Perera',     phone:'+94 75 222 3456', email:'amali@gmail.com',    rides:31, spent:78600,  joined:'2024-07-04', status:'active' },
    { id:'U007', name:'Saman Jayawardena',phone:'+94 77 111 7890', email:'saman@gmail.com',    rides:19, spent:44300,  joined:'2024-09-18', status:'active' },
    { id:'U008', name:'Priya Ratnayake',  phone:'+94 71 000 2345', email:'priya@gmail.com',    rides:65, spent:189200, joined:'2023-12-01', status:'active' },
  ],

  /* ── DRIVERS ── */
  drivers: [
    { id:'D001', name:'Gayan Madushanka', phone:'+94 77 901 2345', vehicle:'Toyota Prius (WP CAB-4521)',   type:'sedan',  rating:4.8, rides:892, earned:1856000, status:'online',   joined:'2023-06-01' },
    { id:'D002', name:'Thilak Rathnavel', phone:'+94 71 802 3456', vehicle:'Bajaj RE (WP 3W-8834)',        type:'tuk',    rating:4.6, rides:1204,earned:980000,  status:'on_trip',  joined:'2023-04-12' },
    { id:'D003', name:'Nimal Fernando',   phone:'+94 76 703 4567', vehicle:'Suzuki Alto (WP CAR-2219)',    type:'nano',   rating:4.7, rides:543, earned:720000,  status:'offline',  joined:'2024-01-20' },
    { id:'D004', name:'Chaminda Silva',   phone:'+94 70 604 5678', vehicle:'Honda CB (WP BIKE-7721)',      type:'bike',   rating:4.5, rides:2100,earned:1200000, status:'online',   joined:'2023-03-08' },
    { id:'D005', name:'Asitha Gamage',    phone:'+94 72 505 6789', vehicle:'Toyota KDH (WP VAN-1155)',     type:'van',    rating:4.9, rides:387, earned:2100000, status:'offline',  joined:'2024-05-11' },
    { id:'D006', name:'Jeewantha Mendis', phone:'+94 75 406 7890', vehicle:'Bajaj RE (WP 3W-5567)',        type:'tuk',    rating:3.2, rides:89,  earned:145000,  status:'pending',  joined:'2025-07-01' },
    { id:'D007', name:'Pradeep Kumara',   phone:'+94 77 307 8901', vehicle:'Suzuki Wagon R (WP CAR-9988)', type:'mini',   rating:4.4, rides:631, earned:890000,  status:'on_trip',  joined:'2023-09-15' },
    { id:'D008', name:'Bandula Hettiarachchi', phone:'+94 71 208 9012', vehicle:'Toyota Prius (WP CAB-7733)', type:'sedan', rating:4.7, rides:456, earned:1340000, status:'suspended', joined:'2024-02-28' },
  ],

  /* ── RIDES ── */
  rides: [
    { id:'RD-10082', passenger:'Kasun Bandara',  driver:'Gayan Madushanka', vehicle:'Sedan',  from:'Colombo 03',     to:'Nugegoda',       fare:850,  status:'completed', time:'2025-07-16 09:15', duration:'28 min', distance:'8.4 km' },
    { id:'RD-10081', passenger:'Malsha Fernando',driver:'Thilak Rathnavel', vehicle:'Tuk',    from:'Pettah',         to:'Maradana',       fare:280,  status:'completed', time:'2025-07-16 08:50', duration:'12 min', distance:'2.1 km' },
    { id:'RD-10080', passenger:'Nathasha Silva', driver:'Gayan Madushanka', vehicle:'Sedan',  from:'Rajagiriya',     to:'Battaramulla',   fare:490,  status:'active',    time:'2025-07-16 09:05', duration:'—',      distance:'3.8 km' },
    { id:'RD-10079', passenger:'Roshan Kumara',  driver:'Chaminda Silva',   vehicle:'Bike',   from:'Borella',        to:'Colombo 07',     fare:220,  status:'active',    time:'2025-07-16 09:02', duration:'—',      distance:'1.9 km' },
    { id:'RD-10078', passenger:'Amali Perera',   driver:'Pradeep Kumara',   vehicle:'Mini',   from:'Homagama',       to:'Maharagama',     fare:640,  status:'active',    time:'2025-07-16 08:58', duration:'—',      distance:'5.2 km' },
    { id:'RD-10077', passenger:'Saman Jayawardena',driver:'Nimal Fernando', vehicle:'Nano',   from:'Dehiwala',       to:'Mt. Lavinia',    fare:360,  status:'cancelled', time:'2025-07-16 08:30', duration:'—',      distance:'—'      },
    { id:'RD-10076', passenger:'Dinesh Wickrama',driver:'Asitha Gamage',    vehicle:'Van',    from:'Katunayake',     to:'Colombo 01',     fare:3800, status:'completed', time:'2025-07-15 22:10', duration:'58 min', distance:'34.2 km'},
    { id:'RD-10075', passenger:'Priya Ratnayake',driver:'Gayan Madushanka', vehicle:'Sedan',  from:'Colombo 05',     to:'Kelaniya',       fare:1200, status:'completed', time:'2025-07-15 18:45', duration:'45 min', distance:'16.3 km'},
    { id:'RD-10074', passenger:'Kasun Bandara',  driver:'Chaminda Silva',   vehicle:'Bike',   from:'Colombo 07',     to:'Slave Island',   fare:180,  status:'completed', time:'2025-07-15 17:20', duration:'8 min',  distance:'1.1 km' },
    { id:'RD-10073', passenger:'Malsha Fernando',driver:'Thilak Rathnavel', vehicle:'Tuk',    from:'Maradana',       to:'Fort',           fare:320,  status:'cancelled', time:'2025-07-15 14:00', duration:'—',      distance:'—'      },
    { id:'RD-10072', passenger:'Nathasha Silva', driver:'Pradeep Kumara',   vehicle:'Mini',   from:'Nugegoda',       to:'Colombo 03',     fare:720,  status:'completed', time:'2025-07-15 11:30', duration:'30 min', distance:'9.1 km' },
    { id:'RD-10071', passenger:'Amali Perera',   driver:'Asitha Gamage',    vehicle:'Van',    from:'Galle Face',     to:'Katunayake',     fare:4200, status:'completed', time:'2025-07-15 05:30', duration:'62 min', distance:'36.8 km'},
    { id:'RD-10070', passenger:'Priya Ratnayake',driver:'Nimal Fernando',   vehicle:'Nano',   from:'Battaramulla',   to:'Rajagiriya',     fare:380,  status:'pending',   time:'2025-07-16 09:20', duration:'—',      distance:'3.2 km' },
    { id:'RD-10069', passenger:'Roshan Kumara',  driver:'Gayan Madushanka', vehicle:'Sedan',  from:'Colombo 06',     to:'Wellawatte',     fare:280,  status:'pending',   time:'2025-07-16 09:18', duration:'—',      distance:'2.4 km' },
    { id:'RD-10068', passenger:'Saman Jayawardena',driver:'Chaminda Silva', vehicle:'Bike',   from:'Kirulapone',     to:'Borella',        fare:260,  status:'completed', time:'2025-07-14 16:10', duration:'14 min', distance:'2.8 km' },
  ],

  /* ── PAYMENTS ── */
  payments: [
    { id:'TXN-20145', user:'Kasun Bandara',    type:'ride',   amount:850,  method:'Cash',    status:'completed', rideId:'RD-10082', date:'2025-07-16 09:43' },
    { id:'TXN-20144', user:'Malsha Fernando',  type:'ride',   amount:280,  method:'eZ Cash', status:'completed', rideId:'RD-10081', date:'2025-07-16 09:02' },
    { id:'TXN-20143', user:'Nathasha Silva',   type:'payout', amount:18600,method:'Bank',    status:'pending',   rideId:'—',        date:'2025-07-16 00:00' },
    { id:'TXN-20142', user:'Amali Perera',     type:'ride',   amount:4200, method:'Card',    status:'completed', rideId:'RD-10071', date:'2025-07-15 07:32' },
    { id:'TXN-20141', user:'Saman Jayawardena',type:'refund', amount:320,  method:'eZ Cash', status:'completed', rideId:'RD-10073', date:'2025-07-15 14:30' },
    { id:'TXN-20140', user:'Priya Ratnayake',  type:'ride',   amount:1200, method:'Card',    status:'completed', rideId:'RD-10075', date:'2025-07-15 19:30' },
    { id:'TXN-20139', user:'Roshan Kumara',    type:'promo',  amount:200,  method:'Promo',   status:'applied',   rideId:'RD-10072', date:'2025-07-15 11:30' },
    { id:'TXN-20138', user:'Kasun Bandara',    type:'ride',   amount:180,  method:'Cash',    status:'completed', rideId:'RD-10074', date:'2025-07-15 17:28' },
    { id:'TXN-20137', user:'Nimal Fernando',   type:'payout', amount:24500,method:'Bank',    status:'completed', rideId:'—',        date:'2025-07-14 00:00' },
    { id:'TXN-20136', user:'Dinesh Wickrama',  type:'ride',   amount:3800, method:'Card',    status:'completed', rideId:'RD-10076', date:'2025-07-15 23:08' },
    { id:'TXN-20135', user:'Malsha Fernando',  type:'refund', amount:280,  method:'eZ Cash', status:'processing',rideId:'RD-10077', date:'2025-07-16 08:35' },
    { id:'TXN-20134', user:'Amali Perera',     type:'ride',   amount:640,  method:'FriMi',   status:'pending',   rideId:'RD-10078', date:'2025-07-16 09:15' },
  ],

  /* ── NOTIFICATIONS ── */
  notifications: [
    { icon:'🚗', text:'New ride request in Colombo 07', time:'2 min ago' },
    { icon:'⚠️', text:'Driver Jeewantha pending approval', time:'15 min ago' },
    { icon:'💳', text:'Payout of LKR 18,600 pending', time:'1 hr ago' },
    { icon:'🚨', text:'Ride RD-10077 cancelled by user', time:'2 hrs ago' },
  ],
};


/* ═══════════════════════════════════════════════
   API ENDPOINTS
   Each module exposes clean methods that either
   call the real API or return mock data.
═══════════════════════════════════════════════ */

/* ── AUTH MODULE ── */
const AuthAPI = {
  /**
   * POST /auth/login
   * @param {string} email
   * @param {string} password
   * @param {string} role
   * @returns {Promise<{token, user, role}>}
   */
  async login(email, password, role) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(600);
      // Mock: accept any credentials for demo
      if (!email || !password) throw new Error('Email and password required');
      const user = { id: 'A001', name: email.split('@')[0].replace(/\./g,' '), email };
      const token = 'mock_jwt_' + Date.now();
      return { token, user, role };
    }
    return api.post('/auth/login', { email, password, role });
  },

  /**
   * POST /auth/logout
   */
  async logout() {
    if (API_CONFIG.MOCK_MODE) { await delay(200); return { success: true }; }
    return api.post('/auth/logout');
  },

  /**
   * POST /auth/refresh
   */
  async refreshToken() {
    if (API_CONFIG.MOCK_MODE) return { token: 'mock_jwt_refreshed_' + Date.now() };
    return api.post('/auth/refresh');
  },
};


/* ── RIDES MODULE ── */
const RidesAPI = {
  /**
   * GET /rides?status=&search=&page=&limit=
   * Returns paginated ride list with optional filters
   */
  async getAll({ status = '', search = '', page = 1, limit = 10 } = {}) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(300);
      let data = [...MockDB.rides];
      if (status) data = data.filter(r => r.status === status);
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(r =>
          r.id.toLowerCase().includes(q) ||
          r.passenger.toLowerCase().includes(q) ||
          r.driver.toLowerCase().includes(q)
        );
      }
      return paginate(data, page, limit);
    }
    return api.get(`/rides?status=${status}&search=${search}&page=${page}&limit=${limit}`);
  },

  /**
   * GET /rides/:id — fetch single ride with full detail
   */
  async getById(id) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(200);
      const ride = MockDB.rides.find(r => r.id === id);
      if (!ride) throw new Error('Ride not found');
      return ride;
    }
    return api.get(`/rides/${id}`);
  },

  /**
   * PATCH /rides/:id/cancel — admin cancels a ride
   */
  async cancel(id, reason = '') {
    if (API_CONFIG.MOCK_MODE) {
      await delay(400);
      const ride = MockDB.rides.find(r => r.id === id);
      if (ride) ride.status = 'cancelled';
      return { success: true, id, reason };
    }
    return api.patch(`/rides/${id}/cancel`, { reason });
  },

  /**
   * GET /rides/live — returns currently active rides
   */
  async getLive() {
    if (API_CONFIG.MOCK_MODE) {
      await delay(200);
      return MockDB.rides.filter(r => r.status === 'active');
    }
    return api.get('/rides/live');
  },

  /**
   * GET /rides/stats — summary counts
   */
  async getStats(period = 'month') {
    if (API_CONFIG.MOCK_MODE) {
      await delay(300);
      const multipliers = { today: 1, week: 7, month: 30 };
      const m = multipliers[period] || 30;
      return {
        total:     1482 * (m / 30),
        active:    3,
        completed: 1390 * (m / 30),
        cancelled: 89 * (m / 30),
        pending:   2,
      };
    }
    return api.get(`/rides/stats?period=${period}`);
  },
};


/* ── USERS MODULE ── */
const UsersAPI = {
  /**
   * GET /users?status=&search=&page=&limit=
   */
  async getAll({ status = '', search = '', page = 1, limit = 10 } = {}) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(300);
      let data = [...MockDB.users];
      if (status) data = data.filter(u => u.status === status);
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(u =>
          u.name.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.email.toLowerCase().includes(q)
        );
      }
      return paginate(data, page, limit);
    }
    return api.get(`/users?status=${status}&search=${search}&page=${page}&limit=${limit}`);
  },

  /**
   * GET /users/:id
   */
  async getById(id) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(200);
      return MockDB.users.find(u => u.id === id);
    }
    return api.get(`/users/${id}`);
  },

  /**
   * POST /users — create new user
   */
  async create(userData) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(500);
      const newUser = { id: 'U' + (MockDB.users.length + 1).toString().padStart(3,'0'), ...userData, rides: 0, spent: 0, joined: today(), status: 'active' };
      MockDB.users.unshift(newUser);
      return newUser;
    }
    return api.post('/users', userData);
  },

  /**
   * PATCH /users/:id/status — activate or suspend user
   */
  async updateStatus(id, status) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(400);
      const u = MockDB.users.find(u => u.id === id);
      if (u) u.status = status;
      return { success: true, id, status };
    }
    return api.patch(`/users/${id}/status`, { status });
  },

  /**
   * GET /users/stats
   */
  async getStats() {
    if (API_CONFIG.MOCK_MODE) {
      await delay(200);
      return { total: MockDB.users.length, active: MockDB.users.filter(u => u.status === 'active').length, suspended: MockDB.users.filter(u => u.status === 'suspended').length, newThisMonth: 2 };
    }
    return api.get('/users/stats');
  },
};


/* ── DRIVERS MODULE ── */
const DriversAPI = {
  /**
   * GET /drivers?status=&search=&page=&limit=
   */
  async getAll({ status = '', search = '', page = 1, limit = 10 } = {}) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(300);
      let data = [...MockDB.drivers];
      if (status) data = data.filter(d => d.status === status);
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(d =>
          d.name.toLowerCase().includes(q) ||
          d.phone.includes(q) ||
          d.vehicle.toLowerCase().includes(q)
        );
      }
      return paginate(data, page, limit);
    }
    return api.get(`/drivers?status=${status}&search=${search}&page=${page}&limit=${limit}`);
  },

  /**
   * GET /drivers/:id
   */
  async getById(id) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(200);
      return MockDB.drivers.find(d => d.id === id);
    }
    return api.get(`/drivers/${id}`);
  },

  /**
   * PATCH /drivers/:id/approve
   */
  async approve(id) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(500);
      const d = MockDB.drivers.find(d => d.id === id);
      if (d) d.status = 'offline';
      return { success: true, id };
    }
    return api.patch(`/drivers/${id}/approve`);
  },

  /**
   * PATCH /drivers/:id/status
   */
  async updateStatus(id, status) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(400);
      const d = MockDB.drivers.find(d => d.id === id);
      if (d) d.status = status;
      return { success: true, id, status };
    }
    return api.patch(`/drivers/${id}/status`, { status });
  },

  /**
   * GET /drivers/stats
   */
  async getStats() {
    if (API_CONFIG.MOCK_MODE) {
      await delay(200);
      const drivers = MockDB.drivers;
      return {
        total:    drivers.length,
        online:   drivers.filter(d => d.status === 'online').length,
        on_trip:  drivers.filter(d => d.status === 'on_trip').length,
        offline:  drivers.filter(d => d.status === 'offline').length,
        pending:  drivers.filter(d => d.status === 'pending').length,
      };
    }
    return api.get('/drivers/stats');
  },
};


/* ── PAYMENTS MODULE ── */
const PaymentsAPI = {
  /**
   * GET /payments?type=&search=&page=&limit=
   */
  async getAll({ type = '', search = '', page = 1, limit = 10 } = {}) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(300);
      let data = [...MockDB.payments];
      if (type) data = data.filter(p => p.type === type);
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(p => p.id.toLowerCase().includes(q) || p.user.toLowerCase().includes(q));
      }
      return paginate(data, page, limit);
    }
    return api.get(`/payments?type=${type}&search=${search}&page=${page}&limit=${limit}`);
  },

  /**
   * POST /payments/:id/refund
   */
  async refund(id, amount, reason) {
    if (API_CONFIG.MOCK_MODE) {
      await delay(600);
      return { success: true, refundId: 'REF-' + Date.now(), amount, reason };
    }
    return api.post(`/payments/${id}/refund`, { amount, reason });
  },

  /**
   * GET /payments/summary — for KPI cards
   */
  async getSummary(period = 'month') {
    if (API_CONFIG.MOCK_MODE) {
      await delay(200);
      const multipliers = { today: 1, week: 7, month: 30 };
      const m = multipliers[period] || 30;
      return {
        totalRevenue:   Math.round(4856000 * (m / 30)),
        platformCut:    Math.round(971200  * (m / 30)),
        driverPayouts:  Math.round(3884800 * (m / 30)),
        totalRefunds:   Math.round(28400   * (m / 30)),
        avgFare:        850,
        cashPercent:    42,
        cardPercent:    31,
        walletPercent:  27,
      };
    }
    return api.get(`/payments/summary?period=${period}`);
  },
};


/* ── REPORTS MODULE ── */
const ReportsAPI = {
  /**
   * GET /reports/revenue?from=&to=&period=
   * Returns time-series data for charts
   */
  async getRevenueTrend(period = 'month') {
    if (API_CONFIG.MOCK_MODE) {
      await delay(400);
      return generateTrendData(period, 'revenue');
    }
    return api.get(`/reports/revenue?period=${period}`);
  },

  async getRideTrend(period = 'month') {
    if (API_CONFIG.MOCK_MODE) {
      await delay(400);
      return generateTrendData(period, 'rides');
    }
    return api.get(`/reports/rides?period=${period}`);
  },

  /**
   * GET /reports/vehicle-mix — pie chart data
   */
  async getVehicleMix() {
    if (API_CONFIG.MOCK_MODE) {
      await delay(200);
      return [
        { label: 'Sedan',  value: 34, color: '#F5A623' },
        { label: 'Tuk',    value: 28, color: '#1A2440' },
        { label: 'Mini',   value: 17, color: '#4DA6FF' },
        { label: 'Bike',   value: 12, color: '#2ECC7A' },
        { label: 'Van',    value:  9, color: '#E85D5D' },
      ];
    }
    return api.get('/reports/vehicle-mix');
  },

  /**
   * GET /reports/export?type=&format=pdf|csv
   */
  async export(type, format = 'csv') {
    if (API_CONFIG.MOCK_MODE) {
      await delay(800);
      return { url: `#mock-export-${type}.${format}`, message: 'Export ready' };
    }
    return api.get(`/reports/export?type=${type}&format=${format}`);
  },
};


/* ── RBAC MODULE ── */
const RBACModule = {
  /** Role permission definitions */
  roles: {
    super_admin: {
      label: 'Super Admin',
      description: 'Full platform access — all modules, all actions.',
      permissions: ['view_dashboard','manage_rides','manage_users','manage_drivers','view_payments','manage_payments','view_reports','generate_reports','manage_roles','manage_settings','export_data'],
    },
    admin: {
      label: 'Admin',
      description: 'Operational access — rides, users, drivers, reports.',
      permissions: ['view_dashboard','manage_rides','manage_users','manage_drivers','view_payments','view_reports','generate_reports','export_data'],
    },
    support: {
      label: 'Support Agent',
      description: 'Read-only rides and users; can cancel rides.',
      permissions: ['view_dashboard','manage_rides','view_users','view_reports'],
    },
    finance: {
      label: 'Finance Manager',
      description: 'Payments, payouts, and financial reports only.',
      permissions: ['view_dashboard','view_payments','manage_payments','view_reports','generate_reports','export_data'],
    },
  },

  /** Check if current admin has a specific permission */
  can(permission) {
    const role = Auth.getRole();
    const roleConfig = this.roles[role];
    if (!roleConfig) return false;
    return roleConfig.permissions.includes(permission);
  },

  /** Hide nav items not accessible to current role */
  applyNavRestrictions() {
    const role = Auth.getRole();
    if (role !== 'super_admin') {
      const rolesNav = document.getElementById('nav-roles');
      const rolesLabel = document.getElementById('nav-admin-label');
      if (rolesNav)  rolesNav.style.display  = 'none';
      if (rolesLabel && role === 'support') rolesLabel.style.display = 'none';
    }
  },

  /** Get admin users */
  async getAdmins() {
    await delay(200);
    return MockDB.admins;
  },

  /** Add admin user */
  async addAdmin(data) {
    await delay(500);
    const newAdmin = { id: 'A' + (MockDB.admins.length + 1).toString().padStart(3,'0'), ...data, lastLogin: 'Never', status: 'active' };
    MockDB.admins.push(newAdmin);
    return newAdmin;
  },
};


/* ─────────────────────────────────────────────
   UTILITY FUNCTIONS
───────────────────────────────────────────── */

/** Simulate API latency */
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Paginate an array */
function paginate(data, page, limit) {
  const total = data.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { data: data.slice(start, start + limit), total, page, pages, limit };
}

/** Get today's date as YYYY-MM-DD */
function today() {
  return new Date().toISOString().split('T')[0];
}

/** Generate chart trend data */
function generateTrendData(period, type) {
  const isRevenue = type === 'revenue';
  if (period === 'today') {
    const labels = ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
    return { labels, values: labels.map(() => isRevenue ? rand(5000, 50000) : rand(2, 20)) };
  }
  if (period === 'week') {
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return { labels, values: labels.map(() => isRevenue ? rand(80000, 250000) : rand(40, 120)) };
  }
  // month
  const labels = Array.from({length: 30}, (_, i) => `Jul ${i + 1}`);
  return { labels, values: labels.map(() => isRevenue ? rand(50000, 300000) : rand(20, 80)) };
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

/** Format LKR currency */
function fmtLKR(n) {
  if (n >= 1000000) return 'LKR ' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return 'LKR ' + (n / 1000).toFixed(0) + 'K';
  return 'LKR ' + n.toLocaleString();
}

/** Format number with commas */
function fmtNum(n) { return Number(n).toLocaleString(); }

/** Render star rating */
function renderStars(r) {
  const full  = Math.floor(r);
  const half  = r % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/** Status badge HTML */
function badge(status) {
  return `<span class="badge badge-${status}">${status.replace('_',' ')}</span>`;
}

/** Capitalize first letter */
function cap(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

/* Export everything to global scope for use in app.js */
window.API_CONFIG = API_CONFIG;
window.Auth       = Auth;
window.AuthAPI    = AuthAPI;
window.RidesAPI   = RidesAPI;
window.UsersAPI   = UsersAPI;
window.DriversAPI = DriversAPI;
window.PaymentsAPI= PaymentsAPI;
window.ReportsAPI = ReportsAPI;
window.RBACModule = RBACModule;
window.MockDB     = MockDB;
window.fmtLKR     = fmtLKR;
window.fmtNum     = fmtNum;
window.renderStars= renderStars;
window.badge      = badge;
window.cap        = cap;
window.delay      = delay;
