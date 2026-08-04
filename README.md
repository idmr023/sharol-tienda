<<<<<<< HEAD
# Sharol Tienda 💍

Tienda de joyas y accesorios de **Sharol** ("Exclusividad & Estilo") con envíos a todo el Perú.
Construida con **Next.js 16 (App Router)**, **Prisma + SQLite**, **Tailwind CSS**, **Framer Motion** y **GSAP**.

## ✨ Características

- **Landing inmersiva**: hero cinematic con GSAP ScrollTrigger, showroom de productos con precio animado.
- **Tienda `/tienda`**: catálogo con **buscador**, filtros por **categoría y precio**, orden por precio y filtro de **favoritos**.
- **Vista rápida de producto**: galería multi-imagen, **zoom** al pasar el cursor, selector de cantidad y stock.
- **Favoritos (Wishlist)**: los usuarios con sesión guardan sus piezas favoritas y las consultan en la tienda.
- **Carrito de compras** con persistencia en `localStorage`, drawer animado y notificaciones toast.
- **Checkout** con validación de stock en transacción y **comprobante de pago subido** (YAPE/PLIN) que se guarda para verificación del admin.
- **Ciclo de vida de pedidos**: `SOLICITADO → CONFIRMADO → EN_PREPARACION → ENVIADO → ENTREGADO` (o `CANCELADO`), con **historial de cambios**, **número de seguimiento**, **notas internas** y **devolución automática de stock** al cancelar.
- **Panel de administración** (`/admin`): **dashboard con métricas** (ventas del mes, pedidos por atender, stock bajo, más vendidos), CRUD de productos con **multi-imagen**, categorías y gestión completa de pedidos con visualización del comprobante.
- **Cuentas y roles**: registro e inicio de sesión con autenticación segura. Solo el rol `ADMIN` (Sharol) ve y accede al panel de administración.
- **Reseñas protegidas**: solo usuarios con sesión iniciada publican reseñas (1–5 estrellas), guardadas en la base de datos y mostradas en la sección de testimonios.
- **Botón flotante de WhatsApp** integrado con el tema rose/dark.
- **25 tests unitarios** (Vitest), **CI** con GitHub Actions, lint y typecheck.

## 🚀 Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta los secretos JWT si quieres
npm run db:push        # sincroniza la base de datos con el schema
npm run db:seed        # crea categorías, productos, reseñas y el usuario admin
npm run dev            # http://localhost:3002
```

### Scripts

| Comando              | Descripción                                              |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`        | Servidor Next.js en `http://localhost:3002`              |
| `npm run dev:frontend` | Frontend + API routes (Next.js) en `:3002`             |
| `npm run dev:backend`  | Prisma Studio (panel de la base de datos)              |
| `npm run db:generate`  | Regenera el cliente Prisma (`--schema db/schema.prisma`) |
| `npm run db:push`      | Sincroniza la DB con el schema                          |
| `npm run db:seed`      | Carga datos iniciales (categorías, productos, reseñas, admin) |
| `npm run build`        | Build de producción                                     |
| `npm run start`        | Sirve el build en `:3002`                               |
| `npm run lint`         | ESLint                                                   |
| `npm run typecheck`    | `tsc --noEmit`                                           |
| `npm run test`         | Vitest (25 tests)                                        |

## 🔐 Autenticación y roles

Sistema RBAC adaptado del proyecto `ripnel-platform`, con seguridad de sesión tipo `dentista`:

- Roles: `ADMIN` y `CUSTOMER` (campo `role` en el modelo `User`).
- Contraseñas hasheadas con **scrypt + salt** y comparación `timingSafeEqual`.
- **JWT** access (15 min) + refresh (7 días) con **rotación de tokens** (single-use) y sesiones revocables en DB.
- Cookies **HttpOnly + SameSite=Strict + Secure** (en producción).
- **Rate limiting**: 5 intentos fallidos de login → bloqueo de 15 min por email + IP.
- El icono de **administración** solo es visible para `ADMIN`; las rutas `/api/admin/*` y las mutaciones de `/api/products` y `/api/categories` exigen `requireAdmin()`.

### Usuario admin por defecto (seed)

```
email:    sharol@sharol.tienda
password: SharolAdmin2026!
```

Configurables con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

### Endpoints de auth

| Método | Ruta                     | Descripción                                           |
| ------ | ------------------------ | ----------------------------------------------------- |
| POST   | `/api/auth/register`     | Crear cuenta (rol CUSTOMER; requiere `phone`)         |
| POST   | `/api/auth/login`        | Iniciar sesión (JWT + cookies)                        |
| POST   | `/api/auth/logout`       | Cerrar sesión y revocar refresh token                 |
| GET    | `/api/auth/me`           | Sesión actual (rota tokens si expiró)                 |
| POST   | `/api/auth/forgot-password` | Solicita código de recuperación de 6 dígitos       |
| POST   | `/api/auth/reset-password`  | Valida código y cambia contraseña (revoca sesiones) |

> **Nota:** no hay integración de correos. En `forgot-password`, si la cuenta existe, el código se devuelve en `demoCode` (flujo demo). En producción se enviaría por email.

### Perfil de usuario (requiere sesión)

| Método | Ruta                 | Descripción                          |
| ------ | -------------------- | ------------------------------------ |
| GET    | `/api/user/profile`  | Datos del perfil (name, email, phone)|
| PATCH  | `/api/user/profile`  | Actualiza perfil (`name`, `email`, `phone`) |
| GET    | `/api/user/orders`   | Pedidos del usuario con items, estados e historial |

### Reseñas

| Método | Ruta            | Descripción                                    |
| ------ | --------------- | ---------------------------------------------- |
| GET    | `/api/reviews`  | Lista reseñas (más recientes primero)          |
| POST   | `/api/reviews`  | Publica reseña (requiere sesión; name, city, rating 1–5, comment) |

### Favoritos (requiere sesión)

| Método | Ruta                      | Descripción                       |
| ------ | ------------------------- | --------------------------------- |
| GET    | `/api/wishlist`           | Lista de ids de productos favoritos |
| POST   | `/api/wishlist`           | Agrega favorito (`{ productId }`) |
| DELETE | `/api/wishlist/[productId]` | Quita el favorito               |

### Pedidos y administración

| Método | Ruta                          | Descripción                                       |
| ------ | ----------------------------- | ------------------------------------------------- |
| POST   | `/api/orders`                 | Crea pedido (estado `SOLICITADO`, guarda voucher; vincula `userId` si hay sesión) |
| GET    | `/api/admin/orders`           | Lista pedidos con items e historial               |
| PATCH  | `/api/admin/orders/[id]`      | Cambia `status`/`tracking`/`adminNote`; al cancelar devuelve stock |
| GET    | `/api/admin/dashboard`        | Métricas: ventas del mes, pendientes, stock bajo, más vendidos |

### Estados de pedido

`SOLICITADO` (recién registrado) → `CONFIRMADO` (pago verificado) → `EN_PREPARACION` → `ENVIADO` (con número de seguimiento) → `ENTREGADO`. También `CANCELADO` (restaura el stock automáticamente). Cada cambio queda registrado en el historial del pedido.

## 🗂️ Arquitectura

Separación limpia en `backend/`, `frontend/` y `db/` con aliases `@backend/*`, `@frontend/*` y `@db/*`.

```
sharol-tienda/
├── app/                  # Rutas Next.js (páginas + API routes)
│   ├── admin/            # Panel de administración
│   ├── api/              # auth, reviews, products, categories, orders
│   ├── carrito/          # Carrito
│   ├── checkout/         # Checkout
│   ├── layout.tsx        # Providers: AuthProvider + CartProvider
│   └── page.tsx          # Landing
├── backend/
│   ├── db.ts             # Cliente Prisma singleton
│   ├── repositories/     # Acceso a datos (product, category, order, user, review)
│   ├── services/         # Lógica de negocio (order, auth, sesiones)
│   └── validation/       # Validación de entrada + tests
├── frontend/
│   ├── components/       # Navbar, CartDrawer, AccountModal, ReviewModal, ProductCard, WhatsApp...
│   ├── context/          # AuthContext, CartContext, WishlistContext
│   └── lib/              # cart, constants, types, utils, orderStatus + tests
├── db/
│   ├── schema.prisma     # Modelos: User, Session, LoginAttempt, PasswordResetToken, Category, Product, Order, OrderItem, OrderStatusHistory, WishlistItem, Review
│   ├── dev.db            # SQLite
│   └── seed.ts
├── public/               # Imágenes y logo
└── .github/workflows/ci.yml
```

## 📦 Stack principal

Next.js 16 · React 19 · Prisma 6 · SQLite · Tailwind CSS 4 · Framer Motion · GSAP · lucide-react · jsonwebtoken · Vitest

## 🎨 Estilo

Tema oscuro (`#0d0d0d`) con acentos rose, tipografías Playfair Display (serif) + Inter (sans).
WhatsApp de contacto: **916 663 318**.
=======
# sharol-tienda
>>>>>>> e16c3b294728e6dfa7d768fc2cbd390f6e6254f9
