# Workspace

## Overview

Park Sense — Smart Parking Management System. A full-stack web application for finding, booking, and managing parking spaces with real-time availability, QR-based tickets, payment processing, and an admin dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, shadcn/ui, React Query, Wouter router)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: JWT (bcryptjs + jsonwebtoken)
- **QR Codes**: qrcode.react
- **Charts**: Recharts
- **Build**: esbuild (backend), Vite (frontend)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── park-sense/         # React + Vite frontend (previewPath: /)
│   └── api-server/         # Express API server
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (seed data, etc.)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

- **Real-time parking availability**: Color-coded slot grid (green=available, red=occupied)
- **Booking workflow**: Select lot → pick slot → choose time → book → pay → get QR
- **QR Ticket generation**: QR code displayed for confirmed bookings
- **Payment processing**: Supports credit card, debit card, UPI, wallet, cash
- **User feedback system**: Star ratings + comments for parking lots
- **Admin dashboard**: Stats, revenue, booking management
- **GPS coordinates**: Stored for each parking lot (map placeholder shown)

## Database Schema

- `users` — user accounts with roles (user, admin)
- `parking_lots` — lots with address, GPS, pricing, amenities
- `parking_slots` — individual slots per lot (standard, compact, handicapped, ev_charging)
- `bookings` — reservations with start/end times, status, QR code
- `payments` — payment records with method and transaction IDs
- `reviews` — star ratings and comments per lot

## Demo Accounts

- **Admin**: admin@parksense.com / password
- **User**: user@parksense.com / password

## Development

- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema: `pnpm --filter @workspace/db run push`
- Seed data: `pnpm --filter @workspace/scripts run seed`

## API Routes

All routes under `/api`:
- `POST /auth/login` — login/register
- `GET /auth/me` — current user
- `GET /parking-lots` — list lots (search, city, available filters)
- `GET /parking-lots/:id` — lot detail with slots
- `POST /parking-lots` — create lot (admin)
- `GET /parking-lots/:lotId/slots` — list slots
- `GET /bookings` — user's bookings
- `POST /bookings` — create booking
- `POST /bookings/:id/cancel` — cancel booking
- `GET /bookings/:id/qr` — get QR data
- `POST /payments` — process payment
- `GET /payments/history` — payment history
- `GET /reviews?lotId=X` — reviews for a lot
- `POST /reviews` — submit review
- `GET /admin/stats` — system stats (admin)
- `GET /admin/bookings` — all bookings (admin)
