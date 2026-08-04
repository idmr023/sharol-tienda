<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sharol Tienda — Conventions for Agents

Tienda de joyas de **Sharol**. Next.js 16 (App Router) + React 19 + Prisma 6 + SQLite + Tailwind CSS 4 + Framer Motion + GSAP.

## Architecture

Layered separation with path aliases (no `@/` — it's not configured):

- `@backend/*` → business logic & data access
- `@frontend/*` → UI components, contexts, lib
- `@db/*` → Prisma client singleton

```
app/        pages + API routes
backend/    db.ts (singleton) · repositories/ (data) · services/ (business logic) · validation/ (+ tests)
frontend/   components/ · context/ · lib/ (cart, types, utils, constants)
db/         schema.prisma · dev.db · seed.ts
```

## Breaking-convention gotchas (Next 16 / this repo)

- `cookies()` is **async**: always `const cookieStore = await cookies()`. Same for `setAuthCookies()` / `clearAuthCookies()` in `backend/services/authSession.ts`.
- Server Components vs Client Components: interactive components must be `'use client'`.
- `fetch` of own API routes is NOT cached (dynamic) — use `next: { revalidate: 0 }` or read from the DB directly in Server Components.
- Lint rule `react-hooks/set-state-in-effect` errors on synchronous `setState` inside `useEffect`. Fix by mounting a subcomponent fresh (state in initializer) or by splitting the effect; don't just suppress.
- Never call `setState` synchronously in a render body or effect.

## Commands

```bash
npm run typecheck     # tsc --noEmit (run after every change)
npm run lint          # ESLint — must end with "0 errors"
npm test              # Vitest — 25 tests
npm run db:push       # sync SQLite schema
npm run db:seed       # categories, products, reviews, admin user
npm run build         # production build
npm run dev           # http://localhost:3002
```

## Auth & roles (RBAC)

- Roles: `ADMIN` / `CUSTOMER` on `User.role`.
- Passwords: **scrypt + salt + timingSafeEqual** (`backend/services/authService.ts`).
- JWT access (15 min) + refresh (7 days) with **rotation**; sessions in DB (SHA-256 hashed refresh token).
- Cookies: `sharol_access_token` / `sharol_refresh_token`, HttpOnly + SameSite=Strict + Secure (prod).
- Login lockout: 5 failed attempts / 15 min per email + IP (`LoginAttempt`).
- Guards in `backend/services/authSession.ts`: `getCurrentUser()`, `requireAuth()`, `requireAdmin()`.
- Password recovery: 6-digit code (demo) hashed (SHA-256) in `PasswordResetToken`, TTL 30 min, single-use, revokes all sessions on success (`createPasswordResetToken` / `resetPasswordWithCode`).
- `User.phone` (7–12 dígitos, obligatorio en registro); `AuthUser` incluye `phone`.
- Admin seed: `sharol@sharol.tienda` / `SharolAdmin2026!` (env-overridable).
- Admin-only UI: the admin icon in `frontend/components/MagneticNavbar.tsx` renders only when `role === 'ADMIN'`.

## Data model (db/schema.prisma)

`User` (role, phone, passwordHash, wishlist, orders, resetTokens) · `Session` (refresh token rotation) · `LoginAttempt` (lockout) · `PasswordResetToken` (tokenHash único, TTL 30 min, cascade) · `Category` · `Product` (price Float, stock, images multi, featured) · `Order` (status pipeline SOLICITADO→ENTREGADO, voucherUrl, tracking, adminNote, userId opcional → SetNull) · `OrderItem` (stock validated in transaction) · `OrderStatusHistory` (audit of status changes, cascade) · `WishlistItem` (unique userId+productId, cascade) · `Review` (name, city, rating 1–5, comment ≤500, optional userId → SetNull).

Los pedidos hechos con sesión quedan vinculados a `Order.userId`; el cliente los ve en "Mis Compras" (`/api/user/orders`). Perfil editable en `/api/user/profile` (GET/PATCH).

## Order lifecycle

`SOLICITADO → CONFIRMADO → EN_PREPARACION → ENVIADO → ENTREGADO` (+ `CANCELADO` restores stock). PATCH `/api/admin/orders/[id]` also handles `tracking` and `adminNote`. Statuses are centralized in `backend/validation/orders.ts` (ORDER_STATUSES); labels/colors in `frontend/lib/orderStatus.ts`.

## Style

Dark theme `#0d0d0d`, rose accents, Playfair Display (serif) + Inter (sans). WhatsApp: **916 663 318**.

## Documentation

- README.md is maintained — update it when adding endpoints, scripts, or architecture changes.
- When asked, connect the repo to the codebase-memory-mcp knowledge graph via `codebase-memory-mcp_index_repository` (project: `sharol-tienda`).
