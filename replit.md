# Workspace

## Overview

Marketplace Local para lojinhas de bairro (eletrônicos, livraria, roupas, adega, etc.).
pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifacts/marketplace)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **State**: Zustand (cart state)
- **Build**: esbuild (CJS bundle)

## Features

### Marketplace Local (BairroMarket)
- 3 painéis acessíveis via barra de navegação persistente (sem login):
  - **/cliente** - Painel do Cliente: busca lojas/produtos por categoria, carrinho, pedidos
  - **/lojista** - Painel do Lojista: seleciona sua loja, gerencia produtos e pedidos
  - **/admin** - Painel do Administrador: estatísticas, gerencia lojas e pedidos

### Categorias disponíveis
Eletrônicos, Livraria, Roupas, Adega, Padaria, Farmácia, Mercadinho, Petshop

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── marketplace/        # React + Vite frontend (BairroMarket)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── categories.ts
│           ├── stores.ts
│           ├── products.ts
│           └── orders.ts
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/marketplace` (`@workspace/marketplace`)

React + Vite frontend. Routes:
- `/` → redirect to /cliente
- `/cliente` → Painel do Cliente
- `/lojista` → Painel do Lojista
- `/admin` → Painel do Administrador

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes in `src/routes/`:
- `categories.ts` — GET /api/categories
- `stores.ts` — CRUD /api/stores, /api/stores/:id
- `products.ts` — CRUD /api/products, /api/stores/:storeId/products
- `orders.ts` — CRUD /api/orders, /api/stores/:storeId/orders
- `stats.ts` — GET /api/stats

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`)
- Run migrations: `pnpm --filter @workspace/db run push`

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`).

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
