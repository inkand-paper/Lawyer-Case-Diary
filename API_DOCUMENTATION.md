# ⚖️ Lawyer Case Diary — API Intelligence & Documentation

Welcome to the **Judicial Core API**. This document outlines the professional interface for the Lawyer Case Diary SaaS platform, designed for seamless integration with Web, Android, and iOS clients.

## 🔒 Security Protocol (Authentication)

The API utilizes a dual-mode authentication system to ensure 100% compatibility across all device types.

### 1. Web Mode (Stateful)
*   **Mechanism**: HTTP-Only Secure Cookies (`token`).
*   **Use Case**: Browser-based dashboard interaction.

### 2. Mobile Mode (Stateless)
*   **Mechanism**: JWT Bearer Tokens.
*   **Header**: `Authorization: Bearer <your_token>`
*   **Use Case**: Android App, iOS App, or External Services.

---

## 📡 Core Endpoints

All requests should be sent with `Content-Type: application/json`.

### 1. Authentication
*   **POST** `/api/auth/login`: Authenticate and receive a token.
*   **POST** `/api/auth/register`: Enroll a new practitioner.
*   **GET** `/api/me`: Retrieve current practitioner's identity profile.

### 2. Case Registry
*   **GET** `/api/cases`: Fetch all litigation files owned by the practitioner.
*   **POST** `/api/cases`: Initialize a new case record.
*   **GET** `/api/cases/[id]`: Deep-fetch a specific case with all history.
*   **PUT** `/api/cases/[id]`: Update case status or metadata.
*   **DELETE** `/api/cases/[id]`: Permanently remove a case (Cascading cleanup active).

### 3. Client Directory
*   **GET** `/api/clients`: Retrieve the full legal entity registry.
*   **POST** `/api/clients`: Register a new client entity.
*   **PUT** `/api/clients/[id]`: Modify client contact intelligence.
*   **DELETE** `/api/clients/[id]`: Remove a client (Cascading cleanup active).

### 4. Judicial Docket (Hearings)
*   **GET** `/api/hearings`: Fetch the global timeline of court sessions.
*   **POST** `/api/hearings`: Schedule a new procedural hearing.
*   **GET** `/api/notifications/upcoming`: Fetch sessions starting within T-minus 60 minutes.

### 5. System Intelligence
*   **GET** `/api/stats`: Retrieve real-time dashboard metrics (Active Cases, Today's Hearings, Pending Load).

---

## 🛠️ Implementation Example (Android/Retrofit)

```kotlin
// Example Kotlin interface for Android integration
interface JudicialApi {
    @GET("api/cases")
    suspend fun getCases(@Header("Authorization") token: String): Response<CaseListResponse>
}
```

---

## 🚀 Deployment Integrity

When deploying to production (e.g., **Vercel**), ensure the following:

1.  **Strict HTTPS**: The API rejects non-encrypted traffic in production.
2.  **CORS Policy**: Configured to allow requests from your verified domains.
3.  **Environment Sync**: `JWT_SECRET` must be high-entropy (min 32 chars).

---

## ⚠️ Standard Error Responses

The API uses standardized JSON error objects:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Session expired or missing Bearer token.",
    "details": null
  }
}
```

**Common Codes:**
*   `BAD_REQUEST`: Validation failure (check Zod schema).
*   `NOT_FOUND`: Record doesn't exist in your scoped registry.
*   `SERVER_ERROR`: Database or protocol failure.

---
*© 2026 Antigravity Judicial Systems. Professional Legal SaaS Core.*
