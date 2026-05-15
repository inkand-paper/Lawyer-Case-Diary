# ⚖️ Lawyer Case Diary — Ultimate Production Test Guide

This document provides the complete suite of tests to verify the backend's readiness for SaaS production and Android integration.

---

## 🔑 0. Setup & Authentication
Run this first to establish your session token.

```powershell
$baseUrl = "http://localhost:3000/api"
$authBody = @{ email = "tabir8431@gmail.com"; password = "12345678" } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $authBody -ContentType "application/json"
$token = $login.data.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "✅ Session established. Token acquired." -ForegroundColor Green
```

---

## 📡 1. API Route Validation
Verify that all core business modules are synchronized and responding.

```powershell
# Profile & Stats
Invoke-RestMethod -Uri "$baseUrl/me" -Method Get -Headers $headers | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/stats" -Method Get -Headers $headers | ConvertTo-Json

# Case Registry
$cases = Invoke-RestMethod -Uri "$baseUrl/cases" -Method Get -Headers $headers
$caseId = $cases.data[0].id
Invoke-RestMethod -Uri "$baseUrl/cases/$caseId" -Method Get -Headers $headers | ConvertTo-Json

# Client Directory
$clients = Invoke-RestMethod -Uri "$baseUrl/clients" -Method Get -Headers $headers
$clientId = $clients.data[0].id
Invoke-RestMethod -Uri "$baseUrl/clients/$clientId" -Method Get -Headers $headers | ConvertTo-Json

# Hearings & Notifications
Invoke-RestMethod -Uri "$baseUrl/hearings" -Method Get -Headers $headers | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/notifications/upcoming" -Method Get -Headers $headers | ConvertTo-Json

# Chambers & Invites
Invoke-RestMethod -Uri "$baseUrl/chambers" -Method Get -Headers $headers | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/chambers/invites" -Method Get -Headers $headers | ConvertTo-Json

# Administrative Management (If Admin role)
# Note: These will return 403 for Lawyer role
Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get -Headers $headers | ConvertTo-Json

# Account Settings & API Keys
Invoke-RestMethod -Uri "$baseUrl/settings/keys" -Method Get -Headers $headers | ConvertTo-Json

# System Health & Auth Lifecycle
Invoke-RestMethod -Uri "$baseUrl/health" -Method Get | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/logout" -Method Post -Headers $headers | ConvertTo-Json
```

---

## 🛡️ 2. Security Audits

### A. RBAC (Admin Exclusivity)
Verify that your lawyer account cannot access administrative audit logs.

```powershell
try {
    Invoke-RestMethod -Uri "$baseUrl/admin/audit" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "❌ FAIL: Lawyer accessed Admin logs!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ PASS: RBAC Blocked unauthorized access (403 Forbidden)" -ForegroundColor Green
    }
}
```

### B. Rate Limiting (The Shield)
Verify the API protects itself from rapid-fire abuse.

```powershell
Write-Host "Testing Rate Limit (100 req/min)..."
for ($i=1; $i -le 110; $i++) {
    try {
        $null = Invoke-RestMethod -Uri "$baseUrl/stats" -Method Get -Headers $headers -ErrorAction Stop
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host "✅ PASS: Rate limited hit at request $i" -ForegroundColor Green
            break
        }
    }
}
```

### C. Idempotency (Mobile Reliability)
Verify that duplicate requests don't create duplicate database records.

```powershell
$iKey = [Guid]::NewGuid().ToString()
$hHeaders = $headers.Clone(); $hHeaders["Idempotency-Key"] = $iKey
$hBody = @{ caseId=$caseId; hearingDate=(Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ssZ"); notes="Idemp Test" } | ConvertTo-Json

Write-Host "Sending duplicate creation requests..."
$res1 = Invoke-RestMethod -Uri "$baseUrl/hearings" -Method Post -Headers $hHeaders -Body $hBody -ContentType "application/json"
$res2 = Invoke-RestMethod -Uri "$baseUrl/hearings" -Method Post -Headers $hHeaders -Body $hBody -ContentType "application/json"

if ($res1.data.id -eq $res2.data.id) {
    Write-Host "✅ PASS: Idempotency active (IDs matched)" -ForegroundColor Green
}
```

---

## 🔐 3. Privacy Compliance (GDPR)

### A. Data Portability (Article 20)
Download your complete legal archive.

```powershell
$archive = Invoke-RestMethod -Uri "$baseUrl/me/export" -Method Get -Headers $headers
$archive | ConvertTo-Json -Depth 10 | Out-File "legal_archive_export.json"
Write-Host "✅ PASS: Archive generated: legal_archive_export.json" -ForegroundColor Green
```

### B. Right to Erasure (Article 17)
*Warning: This will delete your test account data.*

```powershell
# Invoke-RestMethod -Uri "$baseUrl/me/forget" -Method Delete -Headers $headers
# Write-Host "✅ PASS: Account and all associated records erased." -ForegroundColor Yellow
```

---

## 🗄️ 4. Database Integrity

### A. Password Hashing
Verify that your database never stores plain-text credentials.

```powershell
# Run in your DB Console (Supabase/PSQL):
# SELECT email, "passwordHash" FROM "User" WHERE email = 'tabir8431@gmail.com';
#
# ✅ Expected: $2a$10$... (A long scrambled string)
# ❌ FAIL: 12345678 (Plain text)
```

### B. Audit Trail
Verify that your actions were logged for security auditing.

```powershell
# Note: You must log in as an ADMIN to run this, or check the DB table 'Log' directly.
# SELECT * FROM "Log" ORDER BY "createdAt" DESC LIMIT 5;
```

---

## 🚀 5. Next Steps
1. **Frontend Web**: Log in at `http://localhost:3000/login` and verify the dashboard metrics match the `/api/stats` output.
2. **Android App**: Use the same `token` format in your Retrofit/OkHttp headers: `Authorization: Bearer <TOKEN>`.
