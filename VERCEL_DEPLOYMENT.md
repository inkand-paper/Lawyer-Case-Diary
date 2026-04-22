# 🚀 Vercel Deployment & Environment Configuration

To deploy the **Lawyer Case Diary** platform to Vercel, follow this checklist to ensure the backend and database are perfectly connected.

## 🔑 Required Environment Variables

You must add these variables in the **Vercel Project Settings > Environment Variables** section.

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Your production database connection string (e.g., from Neon, Supabase, or AWS). |
| `JWT_SECRET` | `[RANDOM_STRING]` | A long, secure string (at least 32 characters) used to sign authentication tokens. |
| `NODE_ENV` | `production` | (Optional) Vercel sets this automatically. |

## 📦 Deployment Steps

1.  **Push Code**: Push your current workspace to a GitHub/GitLab repository.
2.  **Import Project**: In Vercel, click "New Project" and import your repository.
3.  **Configure Build**:
    *   Framework Preset: **Next.js**
    *   Root Directory: `./`
    *   Build Command: `npm run build` (This automatically runs `prisma generate`)
4.  **Add Env Vars**: Input the `DATABASE_URL` and `JWT_SECRET` as shown above.
5.  **Deploy**: Click "Deploy".

## 🗄️ Database Setup

If you are using a new database for production, you must run the migration to create the tables:

```bash
npx prisma migrate deploy
```
*Note: Vercel doesn't run `migrate deploy` by default. You can run this locally while pointing to your production DATABASE_URL, or use a "Post-Install" script in `package.json`.*

## 📱 Connecting to the Android App

Once deployed, your backend URL will be `https://your-project.vercel.app`. 

*   Use this as the **Base URL** in your Android app's networking client (Retrofit/Ktor).
*   Ensure all requests include the `Authorization: Bearer <token>` header obtained from the `/api/auth/login` endpoint.

---
**Need help?** Consult the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full endpoint details.
