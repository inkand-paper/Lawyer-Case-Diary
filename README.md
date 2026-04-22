# ⚖️ Lawyer Case Diary — Professional Judicial SaaS

**Lawyer Case Diary** is a high-fidelity, production-grade SaaS platform designed for legal practitioners to manage litigation files, client relationships, and court dockets with mathematical precision. Built with a strict monochrome aesthetic, it offers a "mission-critical" interface for modern law firms.

---

## 🚀 System Architecture

The platform is built on a modern, secure stack designed for high-concurrency and real-time synchronization:

*   **Core**: Next.js 15 (App Router)
*   **Database**: PostgreSQL (via Supabase)
*   **ORM**: Prisma (Type-safe database interactions)
*   **Auth**: Secure JWT + HttpOnly Cookies + Bearer Tokens (Mobile Ready)
*   **Optimization**: Next.js Optimizer Suite (Instant Cache Revalidation)
*   **Styling**: Vanilla CSS with a Strict Monochrome Design System

---

## ⚡ Cache Revalidation (Optimizer Suite)

The project integrates the **Next.js Optimizer Suite** to solve the "Stale Data" problem. 

### How it works:
1.  When you create/update a record (e.g., a New Case), the backend calls the `revalidateTags` utility in `src/lib/optimizer.ts`.
2.  This sends a secure signal to the Optimizer Suite (configured via `OPTIMIZER_URL` in `.env`).
3.  The Optimizer instantly purges the specific data cache in your live Vercel deployment.
4.  **Result**: Your dashboard updates instantly without needing a page refresh.

**Tags used in the system:**
*   `cases`: Global case registry.
*   `clients`: Global client registry.
*   `dashboard`: Main statistics and charts.
*   `case:[id]`: Deep cache for a specific case file.

---

## 📱 Mobile & Android Integration

The backend is architected to power native mobile apps out-of-the-box.

### 🔑 Authentication for Mobile
Instead of cookies, mobile apps use **API Keys** or **JWT Bearer Tokens**.
*   **API Keys**: Generate these in **Settings > Security**.
*   **Usage**: Send the key in the header: `Authorization: Bearer <your_key>`.

### 📡 Key APIs for Mobile
| Feature | Endpoint | Description |
| :--- | :--- | :--- |
| **Authentication** | `POST /api/auth/login` | Obtain a JWT token. |
| **Cases** | `GET /api/cases` | List all legal files. |
| **Hearings** | `GET /api/hearings` | View the judicial docket. |
| **Notifications** | `GET /api/notifications/upcoming` | Get alerts for hearings within 60 mins. |
| **Stats** | `GET /api/stats` | Dashboard metrics. |

---

## 🛠️ Global Search Intelligence

The platform features a **Unified Registry Search**. 
*   **Location**: The search bar in the top header.
*   **Logic**: It uses a `SearchContext` to communicate with the active page. 
*   **Behavior**: Typing in the header instantly filters the table/list on your current page (Cases, Clients, or Hearings).

---

## 📦 Deployment Checklist

1.  **Environment**: Set `DATABASE_URL` and `JWT_SECRET` in Vercel.
2.  **Database**: Run `npx prisma migrate deploy` to sync your Supabase schema.
3.  **Optimizer**: Ensure `OPTIMIZER_URL` and `OPTIMIZER_KEY` are set for real-time UI updates.

---

## 📁 Project Structure

```text
src/
├── app/              # Next.js Routes & APIs
├── components/       # UI Components (Drawers, Forms, Nav)
├── context/          # Global State (Search, Auth)
├── lib/              
│   ├── services/     # Business Logic (Case/Client operations)
│   ├── auth-server/  # Security & Identity logic
│   └── db/           # Database Client
└── prisma/           # Database Schema & Migrations
```

---
*© 2026 Antigravity Judicial Systems. Professional Legal SaaS Core.*
