# YanaGaman Admin Dashboard
## Backend API Integration Guide

---

## 📁 File Structure

```
yanagaman-admin/
├── index.html        — Admin dashboard UI (single-page app)
├── styles.css        — Branding + layout styles (Navy/Amber/Coral)
├── api.js            — Backend API layer (all endpoints + mock data)
├── app.js            — App logic: routing, state, UI rendering
└── README.md         — This file
```

---

## 🔌 API Endpoints (Backend Contract)

### Authentication  `POST /auth/login`
```json
Request:  { "email": "admin@yanagaman.lk", "password": "...", "role": "super_admin" }
Response: { "token": "jwt...", "user": { "id": "A001", "name": "...", "email": "..." }, "role": "super_admin" }
```

### Rides
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rides` | Paginated ride list (`?status=&search=&page=&limit=`) |
| GET | `/rides/:id` | Single ride details |
| PATCH | `/rides/:id/cancel` | Cancel a ride |
| GET | `/rides/live` | Currently active rides |
| GET | `/rides/stats` | Ride statistics by period |

### Users (Passengers)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Paginated user list |
| GET | `/users/:id` | User details |
| POST | `/users` | Create user |
| PATCH | `/users/:id/status` | Activate/suspend user |
| GET | `/users/stats` | User statistics |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/drivers` | Paginated driver list |
| GET | `/drivers/:id` | Driver details |
| PATCH | `/drivers/:id/approve` | Approve pending driver |
| PATCH | `/drivers/:id/status` | Update driver status |
| GET | `/drivers/stats` | Driver statistics |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | Paginated transactions |
| POST | `/payments/:id/refund` | Issue refund |
| GET | `/payments/summary` | Financial summary KPIs |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/revenue` | Revenue trend data (`?period=today\|week\|month`) |
| GET | `/reports/rides` | Ride count trend |
| GET | `/reports/vehicle-mix` | Donut chart data |
| GET | `/reports/export` | Export report (`?type=&format=pdf\|csv`) |

---

## 🔐 Role-Based Access Control (RBAC)

| Permission | Super Admin | Admin | Support | Finance |
|------------|:-----------:|:-----:|:-------:|:-------:|
| view_dashboard | ✅ | ✅ | ✅ | ✅ |
| manage_rides | ✅ | ✅ | ✅ | — |
| manage_users | ✅ | ✅ | — | — |
| manage_drivers | ✅ | ✅ | — | — |
| view_payments | ✅ | ✅ | — | ✅ |
| manage_payments | ✅ | — | — | ✅ |
| view_reports | ✅ | ✅ | ✅ | ✅ |
| generate_reports | ✅ | ✅ | — | ✅ |
| manage_roles | ✅ | — | — | — |
| manage_settings | ✅ | — | — | — |
| export_data | ✅ | ✅ | — | ✅ |

---

## 🚀 Go Live: Switch from Mock to Real API

In `api.js`, change one line:

```js
const API_CONFIG = {
  BASE_URL: 'https://api.yanagaman.lk/v1',  // ← Your production API URL
  MOCK_MODE: false,                           // ← Change true → false
};
```

All API calls will then hit your real backend. The module signatures are already production-ready.

---

## 🔗 Frontend Integration Points

### Authentication Flow
```
Login Form → AuthAPI.login() → JWT stored in sessionStorage
→ RBACModule.applyNavRestrictions() → Navigate to dashboard
```

### Booking Flow (from main app to admin)
```
Passenger books ride → POST /rides/book → Admin sees in RidesAPI.getLive()
Driver accepts → PATCH /rides/:id/accept → Status: active
Ride completes → PATCH /rides/:id/complete → PaymentsAPI triggered
```

### Payment Flow
```
Ride fare calculated → POST /payments/initiate
Payment confirmed (cash/card/wallet) → POST /payments/confirm
Driver payout batched daily → POST /payments/payout
Refund requested → POST /payments/:id/refund
```

---

## 🛠 Recommended Backend Stack

```
Node.js + Express   — REST API server
PostgreSQL          — Primary database (rides, users, drivers, payments)
Redis               — Session cache, live ride tracking
JWT                 — Authentication tokens
Socket.IO           — Real-time live ride updates
Payhere / eZ Cash   — Sri Lanka payment gateways
Firebase / FCM      — Push notifications
```

---

## 📱 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@yanagaman.lk | admin123 |
| Admin | admin@yanagaman.lk | admin123 |
| Support | admin@yanagaman.lk | admin123 |
| Finance | admin@yanagaman.lk | admin123 |

*Change role via the dropdown on the login screen.*
