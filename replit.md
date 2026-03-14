# Marketplace Regional

A full-stack regional marketplace platform connecting small local shops (lojistas) with customers (clientes), with an admin panel for platform management.

## Architecture

- **Frontend**: React 19 + Vite 7 + TailwindCSS 4 + shadcn/ui
- **Backend**: Express + tRPC (served via Vite middleware in dev)
- **Database**: PostgreSQL (Replit built-in) via Drizzle ORM
- **Auth**: Manus OAuth (requires VITE_OAUTH_PORTAL_URL, VITE_APP_ID, OAUTH_SERVER_URL, JWT_SECRET)
- **Language**: TypeScript throughout

## Project Structure

```
client/         React frontend (Vite root)
server/         Express backend + tRPC routers
  _core/        Core infrastructure (auth, OAuth, vite, env, trpc)
  db.ts         Database query helpers
  routers.ts    tRPC router definitions
shared/         Shared types and utilities
drizzle/        DB schema (PostgreSQL) and migrations metadata
```

## Running the App

The dev server runs as a single Express process serving both API and Vite frontend:

```bash
PORT=5000 pnpm dev
```

This runs on port 5000. The workflow is configured as "Start application".

## Database

Uses Replit's built-in PostgreSQL. Schema includes:
- users, categories, stores, products, customers
- orders, orderItems, reviews, deliveryZones, systemSettings

Custom enums: `role` (user/store/admin), `order_status` (pending/preparing/sent/delivered/cancelled)

## Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `VITE_OAUTH_PORTAL_URL` - Manus OAuth portal URL
- `VITE_APP_ID` - Manus application ID  
- `OAUTH_SERVER_URL` - Manus OAuth server URL
- `JWT_SECRET` - JWT signing secret
- `OWNER_OPEN_ID` - OpenID of the admin user

## User Roles

- **admin** (administrador): Full platform management
- **store** (lojista): Manage own products and orders
- **user** (cliente): Browse catalog, place orders

## Key Features

- Role-based access control via tRPC procedures
- Haversine distance calculation for delivery zones
- Automatic 10% commission calculation
- Delivery fee calculation based on distance
- Admin dashboard with platform statistics
