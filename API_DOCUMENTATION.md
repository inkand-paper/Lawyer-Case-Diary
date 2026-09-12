# Lawyer Case Diary — API Reference

This document covers every API route in this codebase as of commit `900cd52`,
verified directly against the route handlers, validators, and Prisma schema —
not aspirational. It supersedes `docs/API_USAGE_GUIDE.md` and
`docs/ANDROID_INTEGRATION.md`, both of which described endpoints and an
architecture that no longer match what's actually built; consider those two
files deprecated.

**Base URL**: `https://lawyer-case-diary.vercel.app`

## Authentication

There are two independent ways to authenticate. Both work by sending an
`Authorization: Bearer <value>` header — the backend distinguishes them
automatically (a JWT contains dots; a raw API key doesn't).

### Option A — JWT access token + refresh token (what login/register issue)

1. `POST /api/auth/login` returns a short-lived **access token** (1 hour) and
   a **refresh token** in the JSON body (see Auth section below).
2. Send `Authorization: Bearer <access_token>` on every request.
3. When you get a `401`, call `POST /api/auth/refresh` with the refresh token
   to get a new pair. Refresh tokens are not single-use in this API — reuse
   the same one until you get a new one back.
4. There's no server-side "log out everywhere" for JWTs short of rotating
   `JWT_SECRET` — logout just clears client-side state and the cookie.

**Historical note for context**: until a recent fix, `login` and `refresh`
only put the refresh token in an httpOnly cookie, never in the JSON body —
which meant native clients (this Android app) had no way to obtain one at
all, and every mobile session died ~1hr after login with no recovery. That's
fixed as of commit `fa5e03b`; both endpoints now include `refreshToken` in
the response body.

### Option B — Long-lived API key (recommended for a mobile app)

`POST /api/settings/keys` (while authenticated) issues a permanent key in the
form `lcd_<48 hex chars>`, returned **once**, in plaintext, only at creation
time — only its hash is stored server-side, so if you lose it you must revoke
and generate a new one. Use it exactly like a JWT:
`Authorization: Bearer lcd_xxxxxxxxxxxxxxxx...`

This never expires and needs no refresh dance — genuinely simpler for a
mobile client. The tradeoff: it doesn't rotate, and there's no equivalent of
short-lived-token blast-radius limiting if it leaks. Whether that tradeoff is
worth it for this app is a product decision, not made for you here.

### What each endpoint accepts

Every endpoint below that requires auth accepts **either** a valid JWT or a
valid API key in the `Authorization: Bearer` header, unless noted otherwise.
A few endpoints (`hearings/calendar`) were written cookie-first but do go
through the same `getAuthContext()` helper, so Bearer auth works there too.

## Response envelope

Every endpoint below uses this shape **except** `POST /api/billing/checkout`
(returns `{ url }` directly — a Stripe Checkout redirect URL, not wrapped).

**Success:**
```json
{ "success": true, "message": "Human-readable message.", "data": { ... } }
```

**Error:**
```json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "...", "details": null } }
```

Common `code` values: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN`
(403), `NOT_FOUND` (404), `SERVER_ERROR` (500).

**Gotcha worth knowing if you're using a generic response wrapper class**:
the top-level `message` field only exists on *success* responses. On errors,
the message is nested at `error.message`. If you deserialize into a single
type expecting `message` at the top level always, you'll silently get `null`
on every error and see nothing but generic HTTP status text — this was a
real, pervasive bug in this Android app until fixed; see
`ErrorParsing.kt` / `parsedErrorMessage()` for the fix if you're
implementing a client from scratch.

## Rate limiting

Honest state of it: only two endpoints have an explicit, enforced limit —
`POST /api/auth/forgot-password` and `POST /api/auth/resend-verification`,
both capped at **3 requests per 15 minutes** (keyed by IP for the former,
email for the latter). Nothing else in this API has a per-route rate limit,
and there's no blanket rate limit applied at the proxy/middleware level
either. Don't assume the backend will protect you from hammering an
endpoint — build reasonable client-side throttling (e.g. debounce search
calls) regardless.

## Idempotency

Only `POST /api/hearings` supports an `Idempotency-Key` header (any string
you generate client-side, e.g. a UUID per user action). Send the same key on
a retry and you'll get the cached original response back (`X-Idempotency-Cache:
HIT` header) instead of creating a duplicate — the key is scoped per-user and
expires after 24h. No other creation endpoint (cases, clients, payments,
notes) has this — if you need retry-safety on those, handle it client-side
(e.g. disable the submit control while a request is in flight, which is
simpler and sufficient for a single-user mobile client).

---

## Auth

### `POST /api/auth/register`
No auth required.

**Body**: `{ name, email, password (min 8 chars) }`

**Response `data`**: `{ id, name, email, token }` — no `refreshToken`. This
is deliberate: registration issues a short-lived (1 hour), non-refreshable
"verify your email" session. There's no way to stay logged in past that hour
without actually verifying and then calling `/api/auth/login` for a real,
refreshable session.

### `POST /api/auth/login`
No auth required.

**Body**: `{ email, password }`

**Response `data`**: `{ id, name, email, role, plan, token, refreshToken }`

Fails with `UNAUTHORIZED` if the account's email isn't verified yet.

### `POST /api/auth/refresh`
**Body**: `{ refreshToken }`

**Response `data`**: `{ id, name, email, token, refreshToken }` — a new
access token and a new refresh token both come back; persist the new
refresh token, don't keep reusing the old one indefinitely.

### `POST /api/auth/logout`
Requires auth. Clears the server-side cookie (irrelevant for Bearer-auth
clients) — for a native client this is mostly a no-op beyond clearing your
own local session state.

### `POST /api/auth/verify`
No auth required.

**Body**: `{ email, code }` — `code` is the 6-digit code emailed at
registration, valid 24h.

**Response**: standard envelope, `data: null` on success.

### `POST /api/auth/resend-verification`
No auth required. Rate limited: 3 / 15min per email.

**Body**: `{ email }`

Always returns success (won't reveal whether the account exists or is
already verified beyond a generic message) — this is deliberate, don't treat
a success response as confirmation the email exists.

### `POST /api/auth/forgot-password`
No auth required. Rate limited: 3 / 15min per IP.

**Body**: `{ email }`

Always returns 200 regardless of whether the account exists (prevents
account enumeration). Sends a password-reset link via email, valid 1 hour.
There's no API endpoint to *complete* the reset from a raw token+password
pair callable independently — completing the flow currently only works via
the web `/reset-password?token=...` page. Building a native in-app reset
flow would require Android App Links deep-linking (domain verification via
`assetlinks.json`) to intercept that emailed link, which isn't set up.

### `POST /api/auth/reset-password`
No auth required.

**Body**: `{ token, password }` — `token` comes from the emailed link.

---

## Cases

### `GET /api/cases?search=&status=`
Requires auth. Returns cases owned by you, or shared to your chamber if
you're in one. `search` matches title/case number/court (case-insensitive).
`status` filters `ACTIVE`/`CLOSED`.

**Response `data`**: `Case[]`, each with `client` included.

### `POST /api/cases`
**Body** (`caseSchema`): `{ title (min 2), caseNumber (min 1), courtName
(min 2), clientId (UUID, required), judgeName?, description?, status?
("ACTIVE"|"CLOSED") }`

`clientId` must belong to you.

### `GET /api/cases/{id}`
Returns the case with `client`, `hearings`, `notes`, and `payments` all
included in one call — plan your Android data layer around this: you get
the full case detail in a single request, no need to hit notes/payments
endpoints separately just to populate a detail screen.

### `PUT /api/cases/{id}`
**Body**: partial `caseSchema` (all fields optional — send only what changed).

### `DELETE /api/cases/{id}`
**This does not delete the case.** It sets `status: "CLOSED"`. Legal records
are never hard-deleted in this system, by design — cases and clients are
both permanently retained (see below). If your Android UI calls this a
"delete," relabel it "close" or "archive" to match what actually happens;
the response message says exactly this now (`"Case closed and archived. It
remains accessible in your records."`) but earlier versions of this API
claimed "permanently removed," which was simply false.

### `POST /api/cases/{id}/notes`
**Body**: `{ content }`

**Response `data`**: the created `Note { id, caseId, content, createdAt, updatedAt }`

### `PATCH /api/cases/{id}/notes/{noteId}`
**Body**: `{ content }`

### `DELETE /api/cases/{id}/notes/{noteId}`

### `POST /api/cases/{id}/payments`
**Body**: `{ amount (positive number), method? }` — valid `method` values:
`CASH`, `CHECK`, `CARD`, `BANK_TRANSFER`; anything else silently falls back
to `CASH` server-side rather than rejecting the request, so validate this
client-side if you want the user to know their input was ignored.

**Note**: there is no `notes` field on payments, despite an earlier version
of the schema accepting one — it was validated but never actually persisted
anywhere (no such column exists on the `Payment` model). Removed from the
schema entirely as of commit `bb78c3f` rather than continuing to silently
discard it.

**Response `data`**: the created `Payment { id, caseId, amount, paymentDate, method, status, createdAt, updatedAt }`

### `DELETE /api/cases/{id}/payments/{paymentId}`

### `POST /api/cases/{id}/share`
No body. Shares the case with your own chamber (requires you to own the
case and be in a chamber — `FORBIDDEN` otherwise). There's no "unshare"
endpoint currently.

### `GET /api/cases/{id}/documents`
Returns metadata for all documents recorded against the case (`Document[]`),
requires ownership or chamber membership on the case.

### `POST /api/cases/{id}/documents`
**Body**: `{ name (1-500 chars), fileUrl (valid URL), size (positive int,
max 100MB in bytes), type }`

**This endpoint does not handle file upload itself** — `fileUrl` must
already point to a hosted file somewhere. Don't wire an Android file picker
directly to this endpoint expecting it to accept raw file bytes; you'd need
to upload to wherever the actual storage lives first (not yet identified —
check how the web frontend currently uploads documents, if it does at all)
and pass that resulting URL here.

### `GET /api/public/cases/{caseNumber}`
**No auth required at all.** Public lookup by case number — for a "check
your case status" feature without requiring the lawyer's client to have an
account. Response is deliberately reduced:
```json
{ "title": "...", "caseNumber": "...", "courtName": "...", "status": "ACTIVE",
  "hearings": [ { "hearingDate": "...", "nextDate": "..." } ] }
```
Notably: no client info, no judge name, no case description, and hearing
notes are explicitly excluded (there's a code comment confirming this is a
deliberate security decision, not an oversight) — only the last 5 hearing
dates. Don't add fields to whatever you display here beyond what's actually
returned.

---

## Clients

### `GET /api/clients?search=`
Requires auth. Returns clients you own (or that belong to your chamber).

### `POST /api/clients`
**Body**: `{ name, email?, phone?, address? }`

### `PUT /api/clients/{id}`

### `DELETE /api/clients/{id}`
**Always fails.** Hard-deleting a client is prohibited by system policy (the
same "never lose legal records" principle as cases) — this endpoint exists
but is intentionally a dead end, returning `403 FORBIDDEN` with a message
explaining why, telling you to close the client's cases instead. Until
commit `900cd52` this returned a generic, unhelpful `500` instead of the
actual reason — if you're testing against an older deployment you may see
that instead. Don't build a "delete client" button that expects success;
there's no working soft-delete for clients (unlike cases, which do have a
working `CLOSED` status) — closing their associated cases individually is
the only supported path.

---

## Hearings

### `GET /api/hearings?date=&caseId=`
Requires auth. `date` filters to hearings on a specific day.

### `POST /api/hearings`
**Body**: `{ caseId, hearingDate (ISO datetime), nextDate?, notes? }`

Supports `Idempotency-Key` header (see above) — the only creation endpoint
in this API that does.

### `GET /api/hearings/{id}`
**Known gap**: this checks `case.userId` ownership only, not chamber
membership — so a hearing on a case shared with your chamber (via
`cases/{id}/share`) may 404 here for chamber members other than the case
owner, even though the same hearing shows up fine in the `GET /api/hearings`
list (which does check chamber membership). Inconsistent, not fixed as of
this writing — worth knowing if you build a "tap a hearing to see detail"
screen and get confusing 404s for shared-case hearings.

### `PUT /api/hearings/{id}`

### `DELETE /api/hearings/{id}`
This one **does** hard-delete (hearings aren't treated as protected legal
records the way cases/clients are).

### `GET /api/hearings/calendar`
Returns a raw `.ics` file (iCalendar format, `Content-Type:
text/calendar`), not JSON — meant for subscribing an external calendar app
to your hearing schedule via URL. Not really an "API call and parse JSON"
endpoint; if you want this in Android, the practical approach is fetching
the raw text and either handing it to an Intent for the user's calendar
app, or just skipping it since hearings are already viewable in-app via the
endpoints above. Low priority.

---

## Chambers (multi-lawyer collaboration)

A "chamber" is a shared workspace for a group of lawyers. Requires
`ULTIMATE` plan or `ADMIN` role to create one.

### `GET /api/chambers`
Returns your chamber, or `null` if you're not in one.

### `POST /api/chambers`
**Body**: `{ name }`

### `GET /api/chambers/invites`
**Read this carefully — it's not what the name suggests.** This returns
invitations addressed **to** the currently logged-in user (filtered by
`email == your own email` server-side) — i.e. "chambers that have invited
you to join," not "invitations you've sent as a chamber owner." There is no
endpoint to list outgoing invites you've sent. Each item includes a nested
`chamber: { name }`.

A real bug existed in this Android app because of this exact confusion: the
UI labeled this list "Sent Invitations" and displayed `invite.email` (always
just your own email, on every row) instead of which chamber invited you —
fixed in commit `6ff6a2e`, now labeled "Your Invitations" and shows
`chamber.name` with working accept/decline actions.

### `POST /api/chambers/invites`
Requires being a chamber owner/admin. **Body**: `{ email, role }` (`role`:
`ADMIN`|`MEMBER`) — invites someone by email to your chamber.

### `PATCH /api/chambers/invites/{id}`
**Body**: `{ action: "ACCEPT" | "DECLINE" }`

**There is no `DELETE` for this resource** — only `PATCH`. A prior version
of this Android app had a `deleteInvite()` call wired to `DELETE
/api/chambers/invites/{id}`, which doesn't exist and would always return
`405`; fixed in commit `6ff6a2e`.

Accepting fails if you're already in a chamber — you can only act on an
invite while chamber-less. Structure your UI accordingly: this list is only
ever actionable in the "you have no chamber yet" state, not the "you're
already in one" state.

### `GET /api/chambers/messages`
Returns the last 50 messages in your chamber's chat, oldest first. `403`s if
you're not in a chamber. Each message includes a nested `user: { id, name,
role }`.

### `POST /api/chambers/messages`
**Body**: `{ content }` (1–2000 chars)

No real-time push — the web client polls this every 5 seconds; the Android
app does the same.

---

## Billing

### `POST /api/billing/checkout`
Returns `{ url }` **directly, not wrapped in the standard envelope** — a
Stripe Checkout hosted-page URL to redirect the user to.

**Important consideration before wiring this into Android**: mixing Stripe
web checkout into a native app for digital subscriptions can run into
Google Play's billing policy, which generally requires Google Play Billing
for in-app digital purchases/subscriptions (with some exceptions depending
on content type). This is a policy question worth resolving before shipping
a "Subscribe" button that opens this URL — it's not purely a technical
integration decision.

### `POST /api/billing/webhook`
Server-to-server Stripe callback. Not relevant to any client app — included
here only for completeness.

---

## Account / Profile

### `GET /api/me`
Returns your own profile: `{ id, name, email, role, plan, emailVerified,
createdAt }`

### `PATCH /api/me`
**Body**: `{ name?, email? }` — at least one required. Does **not** handle
password changes. A comment in the route source says "use
`/api/auth/change-password` for that" — **that endpoint does not exist**
anywhere in this codebase. As of now there is no way to change your
password while logged in at all; the only path to a new password is the
forgot-password → emailed-link flow. Don't build a "change password"
settings screen expecting a working endpoint until this gap is closed on
the backend.

### `GET /api/me/export`
GDPR-style data export — returns your full profile plus nested clients and
cases as one large JSON blob. Slow-ish, not meant to be called often.

### `DELETE /api/me/forget`
**Not `POST`** — this is a `DELETE` request with no body. GDPR "right to
erasure." Unlike everywhere else in this API, this **genuinely,
irreversibly hard-deletes everything**: your hearings, notes, payments,
cases, clients, API keys, and your user record, all in one transaction.
This directly contradicts the "cases and clients are never hard-deleted"
policy that `DELETE /api/cases/{id}` and `DELETE /api/clients/{id}` both
enforce elsewhere — GDPR erasure is a deliberate, explicit exception to that
policy, not a bug, but worth being very deliberate about how (or whether)
you expose this in a mobile UI given how final it is. There's no
confirmation step server-side; whatever confirmation flow exists needs to
live entirely in your client.

---

## Settings

### `GET /api/settings/keys`
Lists your API keys (id, name, createdAt, lastUsedAt — never the actual key
value, which is never retrievable after creation).

### `POST /api/settings/keys`
**Body**: `{ name }`

**Response `data`**: `{ id, name, key }` — `key` is the raw, usable
`lcd_...` value and is **only ever returned this once**. Store it
immediately; there's no way to retrieve it again later, only revoke and
generate a new one.

### `DELETE /api/settings/keys`
**Body**: `{ id }` (not a path param — send the key's id in the request body). Revokes it immediately.

---

## Dashboard data

### `GET /api/stats`
**Response `data`**:
```json
{
  "stats": {
    "activeCases": 0,
    "verifiedClients": 0,
    "upcomingHearings": 0,
    "uptime": "99.9%",
    "emailVerified": true
  },
  "recentActions": [ /* your 5 most recently created cases, each with client included */ ]
}
```
Two things worth knowing: `upcomingHearings` actually counts every hearing
from the start of today onward (not just today), despite the name sounding
like "the next one." And `uptime: "99.9%"` is a hardcoded string, not a real
metric — don't surface it to users as if it reflects anything live.

### `GET /api/notifications/upcoming`
Hearings starting within the next 60 minutes. Good candidate for a periodic
background check if you want local push-style reminders on Android (this
API has no server-push mechanism of its own — you'd poll this).

### `GET /api/reminders`
**Read-only — there is no `POST /api/reminders`.** Whatever populates the
`Reminder` table happens somewhere other than this route (a scheduled job,
directly in the database, or it's simply not a currently-used feature). If
you want reminder creation from the Android app, that's backend work that
doesn't exist yet, not a client-side integration task.

---

## Admin (ADMIN role only)

Not relevant to a typical lawyer-facing mobile client — included for
completeness. All three require `role: "ADMIN"`.

### `GET /api/admin/audit`
Audit log of actions across the system.

### `GET /api/admin/users`
List all users.

### `GET /api/admin/users/{id}` / `PATCH` / `DELETE`
`PATCH` **body**: `{ plan?, role? }` — `plan`: `FREE`|`ESSENTIAL`|
`EXECUTIVE`|`ULTIMATE`, `role`: `ADMIN`|`LAWYER`|`MEMBER`. Has a
self-demotion guard (an admin can't demote themselves via this endpoint).
`DELETE` here **does** hard-delete the user record (`db.user.delete()`) —
unlike clients/cases, users aren't protected from permanent removal at this
layer. Worth confirming this doesn't throw a foreign-key error given a
user's cases/clients likely reference them, before relying on it.

---

## Health

### `GET /api/health`
No auth. Basic liveness check — useful for confirming the Android app can
reach the deployment at all before debugging further, or for a startup
connectivity check.

---

## Known gaps for a complete Android integration

Summarized from the notes above, in one place for planning purposes:

- No native password-reset completion (needs Android App Links)
- No password-change endpoint at all — a code comment references
  `/api/auth/change-password`, which does not exist anywhere in this codebase
- Document/file upload storage provider not yet identified — the
  `documents` endpoint only records metadata for an already-hosted file
- `GET /api/hearings/{id}` doesn't check chamber membership, only ownership
- No endpoint to list *outgoing* chamber invites you've sent
- No "unshare a case from chamber" endpoint
- `GET /api/reminders` is read-only — no creation endpoint exists
- Rate limiting exists on only 2 of 37 routes
- Stripe billing needs a Play Store policy decision before wiring into the
  app, not just an integration decision
- `DELETE /api/me/forget` is a real, deliberate exception to this API's
  otherwise-consistent "never hard-delete legal records" policy — worth
  extra UI care given how final and different in kind it is from every
  other delete-like action in the app
