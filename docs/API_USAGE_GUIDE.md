# Lawyer Case Diary — API Usage Guide

> All endpoints require authentication via an `httpOnly` session cookie (`token`).  
> Obtain a token by calling `POST /api/auth/login`, then all subsequent requests from the browser will be automatically authenticated.  
> For server-to-server testing with `curl`, use `-c cookies.txt` to persist and `-b cookies.txt` to send the cookie.

---

## 🔐 Authentication

### Register a New Practitioner
```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "name": "Adv. Abir Ahmed",
    "email": "abir@chamber.com",
    "password": "SecurePass123"
  }'
```

### Login
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "abir@chamber.com",
    "password": "SecurePass123"
  }'
```

### Get Session Profile
```bash
curl -s http://localhost:3000/api/me -b cookies.txt
```

---

## 📁 Cases

### List All Cases
```bash
curl -s http://localhost:3000/api/cases -b cookies.txt
```

### Create a Case
> ⚠️ You need a `clientId` first. Register a client (below) and use their `id`.
```bash
curl -s -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Defendant vs. State",
    "caseNumber": "HHC-2025-001",
    "courtName": "High Court of Justice",
    "judgeName": "Hon. Justice Rahman",
    "clientId": "<CLIENT_UUID_HERE>",
    "description": "Criminal defense proceeding."
  }'
```

### Get a Single Case (with Hearings, Notes, Payments)
```bash
curl -s http://localhost:3000/api/cases/<CASE_ID> -b cookies.txt
```

### Update a Case
```bash
curl -s -X PUT http://localhost:3000/api/cases/<CASE_ID> \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{ "status": "ACTIVE", "judgeName": "Hon. Justice Islam" }'
```

### Delete a Case
```bash
curl -s -X DELETE http://localhost:3000/api/cases/<CASE_ID> -b cookies.txt
```

---

## 👤 Clients

### List All Clients
```bash
curl -s http://localhost:3000/api/clients -b cookies.txt
```

### Create a Client
```bash
curl -s -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Mr. Kamal Hossain",
    "phone": "+880 1700 000001",
    "email": "kamal@email.com",
    "address": "123 Gulshan, Dhaka"
  }'
```

### Get a Single Client (with Case History)
```bash
curl -s http://localhost:3000/api/clients/<CLIENT_ID> -b cookies.txt
```

### Update a Client
```bash
curl -s -X PUT http://localhost:3000/api/clients/<CLIENT_ID> \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{ "phone": "+880 1800 000002", "address": "456 Dhanmondi, Dhaka" }'
```

### Delete a Client
```bash
curl -s -X DELETE http://localhost:3000/api/clients/<CLIENT_ID> -b cookies.txt
```

---

## ⚖️ Hearings

### List All Hearings (Chronological)
```bash
curl -s http://localhost:3000/api/hearings -b cookies.txt
```

### Schedule a Hearing
> `hearingDate` must be an ISO 8601 datetime string.
```bash
curl -s -X POST http://localhost:3000/api/hearings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "caseId": "<CASE_UUID_HERE>",
    "hearingDate": "2025-06-15T10:00:00.000Z",
    "nextDate": "2025-07-20T10:00:00.000Z",
    "notes": "Witness examination scheduled."
  }'
```

### Get a Single Hearing
```bash
curl -s http://localhost:3000/api/hearings/<HEARING_ID> -b cookies.txt
```

### Update a Hearing
```bash
curl -s -X PUT http://localhost:3000/api/hearings/<HEARING_ID> \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{ "notes": "Hearing adjourned. New date set.", "nextDate": "2025-08-01T10:00:00.000Z" }'
```

### Delete a Hearing
```bash
curl -s -X DELETE http://localhost:3000/api/hearings/<HEARING_ID> -b cookies.txt
```

---

## 📊 Dashboard Intelligence

### Get Live Stats
```bash
curl -s http://localhost:3000/api/stats -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "activeCases": 5,
      "verifiedClients": 12,
      "upcomingHearings": 3,
      "uptime": "99.9%"
    },
    "recentActions": [...]
  }
}
```

---

## 🧪 JavaScript/Fetch Test Script

You can paste this into your browser console while on `localhost:3000` after logging in:

```javascript
// Full CRUD Live Test — Run in browser console on localhost:3000

async function testAPI() {
  console.log("--- 1. Creating Client ---");
  const clientRes = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: "Test Client", phone: "+880 1700 000099" })
  });
  const { data: client } = await clientRes.json();
  console.log("Client created:", client);

  console.log("--- 2. Creating Case ---");
  const caseRes = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "Test v. State",
      caseNumber: "TEST-001",
      courtName: "Test Court",
      clientId: client.id
    })
  });
  const { data: caseRecord } = await caseRes.json();
  console.log("Case created:", caseRecord);

  console.log("--- 3. Scheduling Hearing ---");
  const hearingRes = await fetch('/api/hearings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      caseId: caseRecord.id,
      hearingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  });
  const { data: hearing } = await hearingRes.json();
  console.log("Hearing scheduled:", hearing);

  console.log("--- 4. Dashboard Stats ---");
  const stats = await fetch('/api/stats').then(r => r.json());
  console.log("Live Stats:", stats.data.stats);

  console.log("✅ Full CRUD Test Complete!");
}

testAPI();
```

---

## Standard Response Format

All endpoints return consistent JSON:

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "..." } }
```

### Error Codes

| Code             | HTTP | Meaning                          |
| ---------------- | ---- | -------------------------------- |
| `UNAUTHORIZED`   | 401  | No session / invalid token       |
| `FORBIDDEN`      | 403  | Insufficient permissions         |
| `BAD_REQUEST`    | 400  | Validation failed                |
| `NOT_FOUND`      | 404  | Record not found / unauthorized  |
| `SERVER_ERROR`   | 500  | Internal system failure          |
