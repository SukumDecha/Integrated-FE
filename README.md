# Integrated-FE

Vue 3 + Vite + Pinia storefront with authentication, brand and sale-item management, cart and orders, Cypress E2E, and Docker+Nginx deployment.

## Features

- Vue 3 (Composition API) with Vite and Tailwind CSS
- State management with Pinia (auth, cart, loader, toast)
- Authentication flows: login, register, verify email, forgot/reset password
- Brand and sale-item management (list, detail, add/edit)
- Cart with seller grouping, selection, quantity control, and checkout
- Per-user cart persistence in localStorage that survives re-login across accounts
- Orders pages (list/detail) and reusable UI components (XButton, XTable, XUpload, etc.)
- Cypress E2E tests
- Production deployment via Docker and Nginx with SPA routing under `/ssa1/`

## Tech stack

- Vue 3, Vite, Vue Router
- Pinia
- Tailwind CSS
- Cypress
- ESLint + Prettier
- Docker, Nginx

## Getting started

### Prerequisites

- Node.js 20+ and npm

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env.local` at the project root:

```bash
# API base used by fetch helper
VITE_API_BASE_URL=https://your-api.example.com

# Public base for building image/file URLs
VITE_BASE_URL=https://your-cdn-or-origin.example.com
```

Notes:

- The router uses `import.meta.env.BASE_URL` which comes from Vite `base`. In dev it's `/`, in UAT/Prod builds it is `/ssa1/` (see `vite.config.js`).

### Run in development

```bash
npm run dev
```

App runs with base `/` locally.

### Build

```bash
# Default vite build
npm run build

# With explicit modes and base=/ssa1/
npm run build:dev
npm run build:uat
npm run build:prod
```

Artifacts are emitted to `dist/`.

### Available scripts

```bash
npm run dev          # Start dev server
npm run build        # Build (base from Vite defaults)
npm run build:dev    # Build with base /ssa1/
npm run build:uat    # Build with base /ssa1/
npm run build:prod   # Build with base /ssa1/
npm run preview      # Preview production build
npm run lint         # ESLint with autofix
npm run format       # Prettier format src/
npm run cypress:open # Open Cypress runner
```

## Project structure

```text
├─ cypress/
│  ├─ e2e/
│  │  ├─ R2-Sprint-3/
│  │  └─ R2-Sprint-4/
│  └─ support/
├─ nginx/
│  └─ default.conf
├─ public/
│  └─ assets/
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ auth/ (LoginForm, RegisterForm)
│  │  ├─ brand/
│  │  ├─ cart/ (CartItemRow, CartSellerGroup, CartSummary)
│  │  ├─ common/ (XButton, XTable, XUpload, XToast, XPagination, XSpin, XTab)
│  │  ├─ layout/ (XNavbar, XFooter, AuthLayout, DefaultLayout, XBreadcrumb)
│  │  ├─ order/
│  │  └─ sale-item/
│  ├─ constants/
│  ├─ router/
│  ├─ services/
│  │  ├─ helper/api.js
│  │  └─ models/ (BaseResponse, PaginationResponse)
│  ├─ stores/ (auth.store, cart.store, loader.store, toast.store)
│  ├─ utils/ (DateUtils, ErrorUtils, ImageUtils, NumberUtils, StorageUtils, TextUtils)
│  └─ views/
│     ├─ auth/ (LoginView, RegisterView, VerifyEmailView, Forgot/Reset Password)
│     ├─ brand/
│     ├─ cart/
│     ├─ order/
│     ├─ sale-item/
│     └─ HomeView.vue, NotFoundView.vue
├─ Dockerfile
├─ docker-compose.yml
├─ vite.config.js
├─ package.json
└─ README.md
```

Alias `@` resolves to `src/` (see `vite.config.js`).

## Key implementation notes

### Per-user cart persistence (localStorage)

The cart store (`src/stores/cart.store.js`) now persists items per account using a namespaced key:

- Key format: `cart_items:<userId>` (falls back to `cart_items:guest` when not logged in)
- Cart hydrates automatically when authentication state changes (login/logout/switch user)
- All cart changes are saved to the active user’s key
- Legacy global key `cart_items` is migrated once to the current user’s key (then removed)

This enables multiple users on the same device to maintain distinct carts that survive re-login.

### API configuration

- All requests are made through `src/services/helper/api.js`
- `VITE_API_BASE_URL` is required (e.g., `https://api.example.com`)
- Access token is attached via `Authorization: Bearer` when available
- Automatic access-token refresh is supported; on failure, user is logged out

### Router base

- `base` is `/` in dev and `/ssa1/` for UAT/Prod builds
- Router history uses `import.meta.env.BASE_URL`

## Testing (Cypress)

```bash
npm run cypress:open
```

E2E specs live under `cypress/e2e/` grouped by sprints and test cases.

## Docker & deployment

### Build image

```bash
# BUILD_ENV can be: dev | uat | prod (maps to npm scripts)
docker build --build-arg BUILD_ENV=uat -t integrated-nginx:latest .
```

### Run with docker-compose

```bash
docker-compose up -d
```

Notes:

- `docker-compose.yml` expects an external volume `backend_uploads` and external network `integrated-network`.
- Create them if needed:

```bash
docker volume create backend_uploads
docker network create integrated-network
```

### Nginx

- Config is in `nginx/default.conf`
- SPA is served under `/ssa1/` with proper caching and index fallbacks
- API is proxied at `/itb-mshop/` to `integrated-backend:8080` on the same Docker network
- TLS certs are expected under `/ssl` inside the container (mounted from host)

## Conventions

- Use Composition API and `script setup` in Vue SFCs
- Centralize API calls in `src/services`
- Keep global state in Pinia stores under `src/stores`
- Reusable UI under `src/components/common`

## Troubleshooting

- Blank routes in UAT/Prod: ensure builds are run with base `/ssa1/` and Nginx config is deployed
- API 401/expired: verify refresh endpoint works and `VITE_API_BASE_URL` is correct
- Static images not loading: set `VITE_BASE_URL` to the correct origin

## License

This project is for educational purposes within the Integrated Project context.
