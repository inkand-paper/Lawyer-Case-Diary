# ⚖️ Lawyer Case Diary — Professional Judicial SaaS

**Lawyer Case Diary** is a high-fidelity, production-grade SaaS platform designed for legal practitioners to manage litigation files, client relationships, and court dockets with mathematical precision. Built with a strict monochrome aesthetic, it offers a "mission-critical" interface for modern law firms.

---

## 🚀 System Architecture

The platform is built on a modern, secure stack designed for high-concurrency and real-time synchronization:

*   **Core**: Next.js 15 (App Router)
*   **Database**: PostgreSQL (via Supabase)
*   **ORM**: Prisma 7 (Type-safe database interactions)
*   **Containerization**: Docker & Docker Compose (Multi-stage production builds)
*   **Auth**: Secure JWT + HttpOnly Cookies + Bearer Tokens (Mobile Ready)
*   **Collaboration**: Multi-user "Chambers" (Teams) with Shared Data Access
*   **Styling**: Vanilla CSS with a Strict Monochrome Design System

---

## 🏢 Chamber (Team) Collaboration Protocol

The system now supports **Chamber-based shared workspaces**. 
- **Shared Access**: Lawyers within the same Chamber can view and manage the same cases and clients.
- **Privacy**: Data is scoped by `chamberId`. If a user is not in a Chamber, data remains private to their `userId`.
- **Invitations**: Practitioners can invite other lawyers via email to join their Chamber (Requires Premium/Ultimate plan).

---

## 📦 Containerization & Deployment

The app is fully Dockerized for consistent deployment across environments.

### Running with Docker Compose:
```bash
docker-compose up --build
```

### Build Details:
- **Dockerfile**: Uses a multi-stage build to minimize image size (Node 20 Alpine).
- **Standalone Mode**: Configured in `next.config.ts` for optimal cloud performance.

---

## 📱 Mobile & Android Integration

The backend is architected to power native mobile apps out-of-the-box.

### 🔑 Authentication for Mobile
Instead of cookies, mobile apps use **API Keys** or **JWT Bearer Tokens**.
*   **API Keys**: Generate these in **Settings > Security**.
*   **Usage**: Send the key in the header: `Authorization: Bearer <your_key>`.

---

## 🛡️ Legal & License

**PROPRIETARY SOFTWARE - ALL RIGHTS RESERVED**

This project is the exclusive property of **Tahsin Abir / Lawyer Case Diary System**.
- **Usage**: Unauthorized use of the backend, database schemas, or case management logic is strictly prohibited.
- **Privacy**: This system holds sensitive legal case records. Unauthorized access or replication can lead to legal prosecution.
- **License**: Full details can be found in the [LICENSE](./LICENSE) file.

---
*© 2026 Tahsin Abir / Lawyer Case Diary System. Professional Legal SaaS Core.*
