# Firebase Realtime Database

This document describes how **this repository** reads and writes data. There is no schema file in the codebase; behavior is defined by `src/YanaGaman.jsx` and `src/firebase.js`.

## Paths overview

| Path | Description |
|------|-------------|
| `users/{uid}` | User profile object (`uid` = Firebase Auth user id) |
| `emergency/{uid}` | Emergency contacts for that user |

Passwords are stored only in **Firebase Authentication**, not in Realtime Database.

---

## `users/{uid}`

Single object per authenticated user.

### Fields always present in written records

Creation flows write at least:

- `name` (string)
- `email` (string)
- `phone` (string)
- `city` (string)
- `role` (string: `"passenger"` or `"driver"` from the signup/register forms)

### Signup modal (full) — passenger

Additionally:

- `pickup`, `dropLocation` (strings)
- `sameEveningRoutine` (boolean)
- `companyName` (string, optional)

### Signup modal (full) — driver

Additionally:

- `vehicleType` (string)
- `vehicleNumber` (string; may be `"Company Vehicle"` when not using own vehicle)
- `companyName` (string, optional)

### Register page (simplified)

Writes only:

`{ name, email, phone, city, role }`

### Login

Reads `users/{uid}`. If missing, the client uses an in-memory fallback and does not create the node in the flows shown in code (new users should use signup or register so the node exists).

### Dashboard updates

- Profile: `update` with `editData` seeded from the existing node; editable fields in the UI include `name`, `phone`, `city`, `companyName` (when applicable).
- Route (passengers): `update` with `pickup`, `dropLocation`, `sameEveningRoutine`.

### UI note

The dashboard treats `role === "passenger"` or `role === "rider"` as passenger; only `"passenger"` is written by current forms.

---

## `emergency/{uid}`

Contacts are saved with `set` on the entire path using a **JavaScript array**. Realtime Database stores that as an object with numeric string keys (`"0"`, `"1"`, …).

Each element:

| Field | Type | Notes |
|-------|------|--------|
| `name` | string | Required to save |
| `phone` | string | Required to save |
| `relation` | string | Optional (e.g. family relationship) |

The app loads contacts with `Object.values(snapshot)` so the structure is treated as a list.

---

## Security rules

Rules are **not** versioned in this repo. Configure them in the Firebase console so that, at minimum:

- Each user can read/write only their own `users/{uid}` and `emergency/{uid}` when `auth.uid === uid`.

Adjust stricter rules (e.g. immutable `email`) as your product requires.
