# Lawyer Case Diary — Architecture Guide

A professional SaaS platform for elite legal practitioners. Built with **Next.js 16 (App Router)**, **Prisma Postgres**, and a **Service-First** backend pattern.

---

## Folder Structure

```
src/
├── app/
│   ├── api/                    # All backend API routes
│   │   ├── auth/
│   │   │   ├── login/          # POST — Credential verification, JWT issuance
│   │   │   └── register/       # POST — New practitioner enrollment
│   │   ├── cases/
│   │   │   ├── route.ts        # GET (all), POST (create)
│   │   │   └── [id]/route.ts   # GET (single), PUT (update), DELETE (remove)
│   │   ├── clients/
│   │   │   ├── route.ts        # GET (all), POST (create)
│   │   │   └── [id]/route.ts   # GET (single), PUT (update), DELETE (remove)
│   │   ├── hearings/
│   │   │   ├── route.ts        # GET (all), POST (create)
│   │   │   └── [id]/route.ts   # GET (single), PUT (update), DELETE (remove)
│   │   ├── me/route.ts         # GET — Authenticated session profile
│   │   └── stats/route.ts      # GET — Real-time dashboard intelligence
│   ├── dashboard/              # Protected dashboard pages
│   ├── login/                  # Authentication pages
│   └── register/
├── components/
│   ├── dashboard/              # Dashboard-specific components
│   └── ui/                     # Shared UI primitives
└── lib/
    ├── auth-server.ts          # Centralized server-side JWT verification helper
    ├── auth.ts                 # Password hashing + JWT signing utilities
    ├── db.ts                   # Prisma Client singleton with PG Adapter
    ├── logger.ts               # Persistent DB + console logging
    ├── optimizer.ts            # Cache revalidation helper
    ├── api-response.ts         # Standardized response wrappers
    ├── validators/index.ts     # All Zod schemas (create + partial update variants)
    └── services/
        ├── case.service.ts     # Full CRUD for Case records
        ├── client.service.ts   # Full CRUD for Client records
        └── hearing.service.ts  # Full CRUD for Hearing records (+ auto-reminders)
```

---

## Architectural Principles

### 1. Service-First Pattern
Business logic lives **exclusively** in `src/lib/services/`. API routes are thin: they only handle authentication, validation, and response formatting. This keeps the codebase testable and separation-of-concerns strict.

```
API Route (Thin) → Validator (Zod) → Service (Logic) → Prisma (DB)
```

### 2. Centralized Authentication
All API routes use `getAuthUser()` from `src/lib/auth-server.ts`. This eliminates the duplicated `jwtVerify` logic that was previously scattered across every route file.

```typescript
// Usage in any API route:
const userId = await getAuthUser();
if (!userId) return apiErrors.UNAUTHORIZED();
```

### 3. Standardized Error Handling (`apiErrors`)
All error responses use the `apiErrors` factory from `api-response.ts` for consistent JSON formatting:
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "..." } }
```

### 4. Zod Validation Schema Variants
Every entity has two schemas:
- **`entitySchema`** — Strict, for POST (create) operations.
- **`entityUpdateSchema`** — Partial (`.partial()`), for PUT (update) operations.

### 5. Ownership Isolation
Every database query includes `userId` in the `where` clause. A user can **never** access or modify another user's legal records.

---

## UI Design Standards ("Constant Shape")

- **Container Radius:** Always `rounded-[2.5rem]`
- **Input/Button Radius:** Always `rounded-2xl`
- **Color Palette:** `indigo-600` accent on `zinc-950` / `black` backgrounds
- **Typography:** `font-black`, `tracking-tighter` for headings; `text-zinc-500` for labels
- **Animations:** `framer-motion` for all transitions; no raw `@keyframes`

---

## Environment Variables

| Variable       | Required | Description                            |
| -------------- | -------- | -------------------------------------- |
| `DATABASE_URL` | ✅       | Prisma Postgres pooled connection URL  |
| `JWT_SECRET`   | ✅       | Secret for signing session tokens      |
| `NODE_ENV`     | ✅       | Set to `production` for secure cookies |
