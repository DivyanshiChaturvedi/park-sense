# ParkSense – Smart Parking Management System

> Full-stack parking management system · React + Express 5 + PostgreSQL + Drizzle ORM · JWT Auth · Real-time slot tracking · QR ticket generation · Role-based admin dashboard
---

## Features

- **Real-time slot availability** — live slot grid showing available, occupied, and selected spots
- **City-based search** — find parking lots by city name, lot name, or address
- **Slot booking workflow** — pick a slot, set date/time/duration, enter vehicle number
- **Payment gateway (simulated)** — credit card, debit card, UPI, and digital wallet flows
- **QR ticket generation** — scannable QR code generated per confirmed booking
- **GPS coordinates** — latitude/longitude stored for every parking lot
- **User review & rating system** — submit star ratings and written reviews per lot
- **Admin dashboard** — revenue stats, occupancy donut chart, recent bookings table
- **JWT authentication** — secure register/login with bcryptjs-hashed passwords
- **Smart currency detection** — automatically shows ₹ for Indian cities, $ for others
- **Booking management** — cancel pending bookings, view QR for confirmed ones
- **Role-based access** — `user` and `admin` roles with protected routes

---

## Tech Stack

### Frontend (`artifacts/park-sense`)
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Dev server & bundler |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| shadcn/ui + Radix UI | Component library |
| Wouter | Client-side routing |
| TanStack Query | Server state / data fetching |
| React Hook Form + Zod | Form validation |
| date-fns | Date formatting |
| qrcode.react | QR code rendering |
| Framer Motion | Animations |
| Lucide React | Icons |

### Backend (`artifacts/api-server`)
| Technology | Purpose |
|---|---|
| Express 5 | HTTP server |
| TypeScript | Type safety |
| jsonwebtoken | JWT auth |
| bcryptjs | Password hashing |
| Pino | Structured JSON logging |
| CORS + cookie-parser | Middleware |
| Zod | Request validation |

### Database & ORM
| Technology | Purpose |
|---|---|
| PostgreSQL | Relational database |
| Drizzle ORM | Type-safe ORM |
| drizzle-zod | Auto-generate Zod schemas from DB schema |

### Monorepo
| Technology | Purpose |
|---|---|
| pnpm workspaces | Package management |
| Turborepo | Build orchestration |
| Shared packages | `@workspace/db`, `@workspace/api-zod`, `@workspace/api-client-react` |

---

## Project Structure

```
parksense/
├── artifacts/
│   ├── park-sense/              # React + Vite frontend
│   │   └── src/
│   │       ├── pages/           # All route pages
│   │       │   ├── home.tsx
│   │       │   ├── find-parking.tsx
│   │       │   ├── lot-detail.tsx
│   │       │   ├── my-bookings.tsx
│   │       │   ├── payment.tsx
│   │       │   ├── qr-ticket.tsx
│   │       │   ├── admin-dashboard.tsx
│   │       │   └── login.tsx
│   │       ├── components/
│   │       │   └── layout/      # Sidebar, main layout
│   │       └── lib/
│   │           ├── auth-context.tsx   # JWT auth context
│   │           └── currency.ts        # Smart currency formatter
│   │
│   └── api-server/              # Express 5 backend
│       └── src/
│           ├── routes/
│           │   ├── auth.ts          # POST /api/auth/register, /login
│           │   ├── parking-lots.ts  # GET /api/parking-lots, /:id
│           │   ├── parking-slots.ts # GET /api/parking-lots/:id/slots
│           │   ├── bookings.ts      # CRUD /api/bookings
│           │   ├── payments.ts      # POST /api/payments
│           │   ├── reviews.ts       # GET/POST /api/reviews
│           │   └── admin.ts         # GET /api/admin/stats, /bookings
│           └── lib/
│               ├── auth-middleware.ts  # JWT verification middleware
│               └── logger.ts           # Pino logger setup
│
└── lib/
    ├── db/                      # Drizzle ORM schema & connection
    │   └── src/schema/
    │       ├── users.ts
    │       ├── parking-lots.ts
    │       ├── parking-slots.ts
    │       ├── bookings.ts
    │       ├── payments.ts
    │       └── reviews.ts
    ├── api-zod/                 # Shared Zod request/response schemas
    └── api-client-react/        # Auto-generated TanStack Query hooks
```

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| name | text | |
| email | text | unique |
| password_hash | text | bcryptjs |
| phone | text | nullable |
| role | enum | `user` \| `admin` |
| created_at | timestamp | |

### `parking_lots`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| name | text | |
| address | text | |
| city | text | Used for currency detection |
| latitude | real | GPS coordinate |
| longitude | real | GPS coordinate |
| total_slots | integer | |
| price_per_hour | real | Stored as raw number (₹ or $ shown in UI) |
| image_url | text | nullable |
| is_open | boolean | default true |
| open_time / close_time | text | e.g. "06:00", "23:00" |
| amenities | text[] | Array of strings |

### `parking_slots`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| lot_id | FK → parking_lots | |
| slot_number | text | e.g. "A1", "B12" |
| slot_type | enum | `standard` \| `ev_charging` \| `handicapped` |
| is_available | boolean | |

### `bookings`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| user_id | FK → users | |
| slot_id | FK → parking_slots | |
| lot_id | FK → parking_lots | |
| status | enum | `pending` → `confirmed` → `active` → `completed` \| `cancelled` |
| start_time / end_time | timestamp | |
| total_amount | real | price_per_hour × duration |
| qr_code | text | JSON string for QR |
| vehicle_number | text | |

### `payments`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| booking_id | FK → bookings | |
| amount | real | |
| status | enum | `pending` \| `completed` \| `failed` |
| payment_method | enum | `credit_card` \| `debit_card` \| `upi` \| `wallet` \| `cash` |
| transaction_id | text | UUID generated on success |

### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| user_id | FK → users | |
| lot_id | FK → parking_lots | |
| rating | integer | 1–5 |
| comment | text | nullable |

---

## API Endpoints

### Auth
```
POST   /api/auth/register      Body: { name, email, password }
POST   /api/auth/login         Body: { email, password }
GET    /api/auth/me            Header: Authorization: Bearer <token>
```

### Parking Lots
```
GET    /api/parking-lots       Query: ?search=mumbai
GET    /api/parking-lots/:id   Returns lot details + available slot count + rating
```

### Parking Slots
```
GET    /api/parking-lots/:id/slots   Query: ?slotType=ev_charging
```

### Bookings (🔒 Auth required)
```
POST   /api/bookings           Body: { slotId, startTime, endTime, vehicleNumber }
GET    /api/bookings           Returns current user's bookings
GET    /api/bookings/:id       Single booking details
DELETE /api/bookings/:id       Cancel a booking
GET    /api/bookings/:id/qr    QR code data for a confirmed booking
```

### Payments (🔒 Auth required)
```
POST   /api/payments           Body: { bookingId, paymentMethod, amount }
```

### Reviews (🔒 Auth required for POST)
```
GET    /api/reviews?lotId=1    Get reviews for a lot
POST   /api/reviews            Body: { lotId, rating, comment }
```

### Admin (🔒 Admin role required)
```
GET    /api/admin/stats        Revenue, active bookings, slot counts
GET    /api/admin/bookings     All bookings (paginated)
```

---

## Smart Currency Detection

The app automatically detects the city of a parking lot and displays the correct currency symbol.

**File:** `artifacts/park-sense/src/lib/currency.ts`

```ts
// Returns ₹ for Indian cities, $ for others
getCurrencySymbol("Mumbai")   // → "₹"
getCurrencySymbol("London")   // → "$"

// Formats amount with correct symbol
formatPrice(50, "Delhi")      // → "₹50"
formatPrice(50, "New York")   // → "$50.00"

// Includes /hr suffix
formatPricePerHour(80, "Chennai")  // → "₹80/hr"
```

The function checks against a list of 60+ Indian cities. Adding a non-Indian city to the database will automatically display `$` prices for that lot without any code change.

---

## Seeded Data

The database comes pre-seeded with **10 parking lots** across major Indian cities:

| City | Lot Name | Price/hr |
|---|---|---|
| Mumbai | BKC Parking Complex | ₹80 |
| Mumbai | Andheri Metro Parking | ₹50 |
| Delhi | Connaught Place Parking | ₹60 |
| Delhi | Saket District Centre | ₹55 |
| Bangalore | MG Road Metro Parking | ₹70 |
| Bangalore | Electronic City Parking | ₹40 |
| Hyderabad | HITEC City Tech Park | ₹65 |
| Chennai | T. Nagar Central | ₹45 |
| Pune | FC Road Parking Hub | ₹35 |
| Kolkata | Park Street Parking | ₹30 |

### Demo Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@parksense.com | password |
| User | user@parksense.com | password |

---

## Pages

| Route | Page | Auth |
|---|---|---|
| `/` | Home / Landing | No |
| `/find` | Find Parking (search + lot cards) | No |
| `/lots/:id` | Lot Detail (slot grid + booking form) | No (book requires auth) |
| `/bookings` | My Bookings (active + history tabs) | Yes |
| `/bookings/:id/pay` | Payment (method selection + order summary) | Yes |
| `/bookings/:id/qr` | QR Ticket (scannable pass) | Yes |
| `/admin` | Admin Dashboard (stats + recent bookings) | Admin only |
| `/login` | Login / Register | No |

---

## How Booking Works

```
User → Select Lot → Pick Slot (visual grid) → Fill Date/Time/Duration/Vehicle
     → POST /api/bookings  (status: "pending")
     → Redirect to /bookings/:id/pay
     → Select payment method → POST /api/payments
     → Booking status becomes "confirmed"
     → Redirect to /bookings/:id/qr
     → View QR ticket (scannable at parking entrance)
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL 14+

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/parksense.git
cd parksense

# 2. Install dependencies
pnpm install

# 3. Set environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# 4. Push schema to database
pnpm --filter @workspace/db run push

# 5. Seed the database
pnpm --filter @workspace/db run seed

# 6. Start the API server
pnpm --filter @workspace/api-server run dev

# 7. Start the frontend
pnpm --filter @workspace/park-sense run dev
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:3001`.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/parksense` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `my-secret-key-here` |
| `PORT` | API server port (default 3001) | `3001` |
| `NODE_ENV` | Environment | `development` \| `production` |

---

## How Currency Changes by Location

When a new parking lot is added in a city like "London" or "New York", the frontend will automatically:
1. Detect the city name from the lot data
2. Look it up in the Indian city list (`lib/currency.ts`)
3. Display `$` instead of `₹` for all price fields on that lot's card, detail page, and booking summary

No code changes are needed to add new currencies — just add the lot with the correct city name.

---

## License

MIT — free to use, modify, and distribute.
