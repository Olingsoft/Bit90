# Admin Backend API Documentation

This document describes the admin REST API endpoints used by the Bit90 admin dashboard.

**Base URL:** `{NEXT_PUBLIC_API_URL}` (default: `http://102.68.86.20:3001/`)

**Authentication:** HttpOnly cookie `admin_token` (JWT, 1h expiry). All protected routes require this cookie.

---

## Authentication

### POST `/admin/login`

Login as administrator.

**Body:**
```json
{ "phone": "0712345678", "password": "yourpassword" }
```

**Response:** `{ "success": true }` + sets `admin_token` cookie.

**Errors:** 400 (missing fields), 403 (not admin).

---

### POST `/admin/signup`

Create admin account (requires server `ADMIN_SIGNUP_SECRET`).

**Body:**
```json
{ "phone": "0712345678", "password": "yourpassword", "secret": "signup-secret" }
```

---

### GET `/admin/logout`

Clears `admin_token` cookie.

---

## Dashboard & Game Control (Super Admin)

### GET `/admin/`

Returns live Aviator state, crash queue, crash range, game config, and admin profile.

**Response:**
```json
{
  "publicState": { "phase": "flying", "multiplier": 1.42, "crashPoint": 2.15, "roundId": "...", "hash": "..." },
  "crashQueue": [{ "position": 1, "hash": "...", "crashPoint": 1.87 }],
  "crashRange": { "min": 1.0, "max": 10.0 },
  "game_config": { "crash_mode": "manual", "rtp_param": 0.97, "band_weights": {} },
  "admin": { "id": "...", "phone": "...", "role": "super_admin" }
}
```

---

### GET `/admin/config`

Read game configuration (crash_mode, rtp_param, band_weights).

---

### PUT `/admin/config`

Update game configuration. Partial updates supported.

**Body:**
```json
{ "crash_mode": "auto" | "manual", "rtp_param": 0.97, "band_weights": { "low": 50 } }
```

---

### PUT `/admin/crash-range`

Set manual crash range (Super Admin). Regenerates crash queue.

**Body:**
```json
{ "min": 1.0, "max": 10.0 }
```

---

## Users (Public — should be protected in production)

### GET `/users/`

List all platform users.

---

## Role-Based Access (Frontend)

| Role | Key Permissions |
|------|-----------------|
| Super Admin | Full access including Aviator Control |
| Finance Admin | Deposits, withdrawals, finance reports |
| Support Admin | Users, freeze, support tickets |
| KYC Admin | KYC review and approval |
| Marketing Admin | Bonuses, referrals, promos |
| System Admin | Payment gateways, server, settings |

**Aviator Control** (crash mode, range, next crash point queue) is restricted to **Super Admin** only.

---

## Security Features (Implemented / Planned)

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ Backend |
| Role-Based Access Control | ✅ Frontend |
| Session timeout (1h) | ✅ Frontend |
| Password hashing | ⚠️ Backend uses plaintext — migrate to bcrypt |
| 2FA | 🔲 UI placeholder in Settings |
| Audit logging | 🔲 Mock data in UI |
| CSRF / Rate limiting | 🔲 Server middleware recommended |

---

## Frontend Module Structure

```
app/admin/
├── page.tsx                 # Main admin shell
├── lib/
│   ├── types.ts             # TypeScript types
│   ├── rbac.ts              # Role & permission definitions
│   ├── api.ts               # API client helpers
│   └── mock-data.ts         # Demo data for unreleased endpoints
└── components/
    ├── ui/index.tsx         # Shared UI primitives
    ├── DashboardSection.tsx
    ├── AviatorControls.tsx  # Super Admin: mode, range, crash queue
    └── ManagementSections.tsx
```
