# CC Report — Developer & Technical Documentation

> Enterprise Credit Card Usage Reporting System  
> Stack: React · Node.js · Express · PostgreSQL · Prisma ORM · JWT

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Prerequisites](#5-prerequisites)
6. [Installation & Setup](#6-installation--setup)
7. [Environment Configuration](#7-environment-configuration)
8. [Database Setup](#8-database-setup)
9. [Running the Application](#9-running-the-application)
10. [Authentication System](#10-authentication-system)
11. [API Reference](#11-api-reference)
12. [Export System (PDF & Excel)](#12-export-system-pdf--excel)
13. [Activity Logging](#13-activity-logging)
14. [Production Deployment](#14-production-deployment)
15. [Active Directory Migration Guide](#15-active-directory-migration-guide)
16. [Microsoft SQL Server Migration Guide](#16-microsoft-sql-server-migration-guide)
17. [Security Considerations](#17-security-considerations)

---

## 1. Project Overview

**CC Report** is an internal web application for managing and reporting corporate credit card (kartu kredit direksi) expenditures. It was migrated from a legacy Laravel system to a modern Node.js + React stack.

**Core Features:**
- Secure login with JWT authentication and refresh token rotation
- Dashboard with real-time statistics and activity charts
- Director (Direksi) management with multiple credit card support
- Monthly credit card report creation and tracking
- Inline transaction management per report
- Export to formatted PDF and Excel (matching official PT ASABRI document format)
- Full activity log with filtering, pagination, and search
- Admin-controlled user management with RBAC

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser (React SPA)                  │
│  React 18 + Vite │ React Router v7 │ lucide-react icons     │
│  AuthContext (JWT in memory) │ ToastContext (UI feedback)    │
└─────────────────────────────┬───────────────────────────────┘
                              │  HTTP/HTTPS (REST API)
                              │  Access Token: Authorization: Bearer
                              │  Refresh Token: httpOnly Cookie
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Nginx Reverse Proxy (Production)           │
│  HTTPS termination │ Static file serving │ API proxying     │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js + Express Backend                  │
│  Port: 5000                                                 │
│  ├── Middleware: Helmet, CORS, Rate Limit, Cookie Parser    │
│  ├── Auth Middleware: JWT verification + role check         │
│  ├── Validation: Zod schemas per route                      │
│  ├── Services: auth.service.js (swappable for AD)          │
│  └── Controllers: auth, directors, reports, transactions,  │
│       users, dashboard, activityLog                         │
└─────────────────────────────┬───────────────────────────────┘
                              │  Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           PostgreSQL Database (port 5432)                    │
│  Tables: User, Director, CreditCard, Report,               │
│          Transaction, ActivityLog                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | React | 18.x | UI framework |
| Frontend Build | Vite | 6.x | Dev server + bundler |
| Frontend Routing | React Router | 7.x | Client-side routing |
| Frontend Icons | lucide-react | 0.465.x | Icon library |
| HTTP Client | Axios | 1.7.x | API calls + interceptors |
| PDF Export | jsPDF + autotable | 4.x / 5.x | Client-side PDF generation |
| Excel Export | ExcelJS + file-saver | 4.x | Client-side Excel generation |
| Backend Runtime | Node.js | 18+ | JavaScript runtime |
| Backend Framework | Express | 4.x | HTTP server |
| ORM | Prisma | 6.x | Database access |
| Database | PostgreSQL | 14+ | Relational database |
| Authentication | jsonwebtoken | 9.x | JWT issuance and verification |
| Password Hashing | bcryptjs | 2.x | Secure password hashing |
| Validation | Zod | 4.x | Schema validation |
| Security Headers | Helmet | 8.x | HTTP security headers |
| Rate Limiting | express-rate-limit | 8.x | Brute-force protection |
| Cookies | cookie-parser | 1.x | HttpOnly cookie handling |

---

## 4. Project Structure

```
CC Report/
├── .env                      # Environment variables (NEVER commit)
├── .env.example              # Template — safe to commit
├── .gitignore                # Root gitignore
├── nginx.conf.example        # Production Nginx configuration
├── User Manual.md            # End-user documentation
│
├── backend/
│   ├── .gitignore
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Prisma migration history
│   └── src/
│       ├── server.js         # Express app + middleware setup
│       ├── db.js             # Prisma client singleton
│       ├── controllers/      # HTTP request handlers (one per domain)
│       │   ├── auth.controller.js
│       │   ├── directors.controller.js
│       │   ├── reports.controller.js
│       │   ├── transactions.controller.js
│       │   ├── users.controller.js
│       │   ├── dashboard.controller.js
│       │   └── activityLog.controller.js
│       ├── services/         # Business logic layer
│       │   ├── auth.service.js          # Swappable for AD
│       │   └── AD_INTEGRATION_GUIDE.js  # Migration reference
│       ├── middleware/
│       │   ├── auth.js       # JWT verify + role guard
│       │   └── validate.js   # Zod schema middleware
│       ├── routes/           # Route definitions (one per domain)
│       └── utils/
│           ├── activityLogger.js  # Audit trail logging
│           └── reportMapper.js    # Data transformation
│
└── client/
    ├── .gitignore
    ├── package.json
    └── src/
        ├── App.jsx           # Root component + routing + route guards
        ├── main.jsx          # React entry point
        ├── index.css         # Global design system (CSS variables)
        ├── api/
        │   └── axios.js      # Axios instance + auto-refresh interceptor
        ├── context/
        │   ├── AuthContext.jsx   # Global auth state
        │   └── ToastContext.jsx  # Global toast notifications
        ├── components/
        │   ├── Layout.jsx        # Page wrapper with Sidebar
        │   ├── Sidebar.jsx       # Navigation sidebar
        │   ├── CustomSelect.jsx  # Reusable dropdown
        │   └── ExportModal.jsx   # PDF/Excel export form
        ├── pages/                # One file per page/route
        └── utils/
            ├── helpers.js        # Formatting utilities
            ├── exportPdf.js      # jsPDF generation logic
            └── exportExcel.js    # ExcelJS generation logic
```

---

## 5. Prerequisites

| Requirement | Minimum Version |
|---|---|
| Node.js | 18.x LTS |
| npm | 9.x |
| PostgreSQL | 14.x |
| Git | Any recent version |

---

## 6. Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Irsanngrh/CCREPORT.git
cd "CC Report"
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Step 4: Configure Environment Variables
```bash
# From the project root
cp .env.example .env
# Edit .env with your actual values
```

---

## 7. Environment Configuration

Edit the root `.env` file:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cc_report?schema=public"

# JWT Secrets (generate strong random strings — see note below)
JWT_SECRET="your-strong-secret-here"
JWT_REFRESH_SECRET="your-different-strong-secret-here"

# Server port
PORT=5000

# Frontend URL for CORS (development)
CLIENT_URL="http://localhost:5173"

# Environment
NODE_ENV="development"
```

**Generating strong secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Security Note:** Never commit `.env` to version control. Use `.env.example` as the template.

---

## 8. Database Setup

### Create the Database
```sql
CREATE DATABASE cc_report;
```

### Initialize Schema
The schema is managed by Prisma. To apply it:

```bash
cd backend

# Push schema to database (development)
npm run db:push

# Or run migrations (after baseline is set up)
npx prisma migrate deploy
```

### Schema Overview

```
User ──(1:N)──► ActivityLog
Director ──(1:N)──► CreditCard
Director ──(1:N)──► Report
CreditCard ──(1:N)──► Report
Report ──(1:N)──► Transaction
```

**Key Design Decisions:**
- All monetary fields (`creditLimit`, `totalAmount`, `amount`) use `Decimal(15,2)` for precision
- `@@unique([directorId, creditCardId, month, year])` prevents duplicate reports
- `onDelete: Cascade` ensures referential integrity throughout
- `ActivityLog` has 4 indexes (`userId`, `action`, `entity`, `createdAt`) for query performance

### Seed Default Admin User
After schema init, create the first admin user:
```bash
cd backend
node -e "
import('./src/db.js').then(({default: prisma}) => {
  const bcrypt = await import('bcryptjs');
  const pass = await bcrypt.hash('admin123', 12);
  await prisma.user.create({ data: { username: 'admin', password: pass, role: 'admin' } });
  console.log('Admin created');
  process.exit(0);
});
"
```

---

## 9. Running the Application

### Development Mode

**Terminal 1 — Backend:**
```bash
cd backend
npm start        # Uses: node src/server.js
# Or for hot-reload:
npm run dev      # Uses: nodemon src/server.js
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev      # Vite dev server at http://localhost:5173
```

### Production Build

```bash
cd client
npm run build    # Output: client/dist/
```

Then serve `client/dist/` via Nginx and run the backend with:
```bash
NODE_ENV=production node src/server.js
```

---

## 10. Authentication System

### Flow Overview

```
Login Request
     │
     └─► auth.service.loginWithCredentials()
              │ Verify password with bcrypt
              │ Generate Access Token (JWT, 15min)
              │ Generate Refresh Token (JWT, 7d)
              │ Store Refresh Token in DB (User.refreshToken)
              ▼
         Set httpOnly cookie (refresh_token, 7d)
         Return Access Token in response body
              │
              ▼
   Frontend stores Access Token in JS memory
   (NOT localStorage — immune to XSS attacks)
              │
              └─► All API calls: Authorization: Bearer <accessToken>
```

### Token Refresh (Auto)
When any API request returns `401 TOKEN_EXPIRED`, the Axios interceptor automatically:
1. Posts to `/api/auth/refresh` (refresh token sent as cookie — no JS access)
2. Gets a new access token
3. Queues all failed requests and replays them with the new token

### Logout & Token Revocation
On logout, the refresh token is set to `null` in the database, preventing reuse even if the client still holds a copy.

### Route Protection
| Route guard | File | Protection |
|---|---|---|
| `ProtectedRoute` | App.jsx | Requires any authenticated user |
| `AdminRoute` | App.jsx | Requires `role = 'admin'` |
| `authenticate` | middleware/auth.js | Backend JWT verification |
| `requireAdmin` | middleware/auth.js | Backend admin role check |

---

## 11. API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login with username + password |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token |
| POST | `/api/auth/logout` | Cookie | Revoke refresh token |
| GET | `/api/auth/me` | Bearer | Get current user info |

### Directors
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/directors` | Bearer | List all directors |
| GET | `/api/directors/:id` | Bearer | Get director by ID |
| POST | `/api/directors` | Bearer | Create director |
| PUT | `/api/directors/:id` | Bearer | Update director |
| DELETE | `/api/directors/:id` | Bearer | Delete director |

### Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reports` | Bearer | List reports (filterable) |
| GET | `/api/reports/:id` | Bearer | Get report by ID |
| GET | `/api/reports/detail/:name/:m/:y/:last4` | Bearer | Get by URL slug |
| POST | `/api/reports` | Bearer | Create report |
| PUT | `/api/reports/:id` | Bearer | Update report |
| DELETE | `/api/reports/:id` | Bearer | Delete report |
| POST | `/api/reports/:id/log-export/:format` | Bearer | Log export action |

### Transactions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/reports/:reportId/transactions` | Bearer | Add transaction |
| PUT | `/api/transactions/:id` | Bearer | Update transaction |
| DELETE | `/api/transactions/:id` | Bearer | Delete transaction |

### Users (Admin Only)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |
| POST | `/api/users/me/change-password` | Bearer | Change own password |

### Dashboard & Logs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Bearer | Dashboard statistics |
| GET | `/api/logs` | Admin | Activity logs (filterable) |
| GET | `/api/logs/filters` | Admin | Filter options |

---

## 12. Export System (PDF & Excel)

Both exports are **client-side** — generated entirely in the browser without any server rendering.

### PDF Export (`client/src/utils/exportPdf.js`)
- **Library:** `jspdf` + `jspdf-autotable`
- **Output:** Official PT ASABRI format with logo, recap table, terbilang (amount in words), and two-column signature block
- **Filename:** `Laporan CC {Director} {Month} {Year} - {Last4CC}.pdf`
- **Preview:** Opens in a new browser tab before download

### Excel Export (`client/src/utils/exportExcel.js`)
- **Library:** `ExcelJS` + `file-saver`
- **Output:** Formatted `.xlsx` with merged cells, borders, embedded logo
- **Filename:** Same naming pattern as PDF

### Export Flow
1. User clicks "Ekspor Laporan" on the report detail page
2. `ExportModal` opens — user fills in report number, PO number, signatory names
3. User clicks "Unduh PDF" or "Unduh Excel"
4. File is generated in-browser and downloaded automatically
5. Export action is logged via `POST /api/reports/:id/log-export/:format`

---

## 13. Activity Logging

All significant actions are logged to the `ActivityLog` table via `logActivity()` in `src/utils/activityLogger.js`.

### Logged Actions
| Category | Actions |
|---|---|
| Authentication | `LOGIN`, `LOGOUT` |
| Directors | `CREATE_DIRECTOR`, `UPDATE_DIRECTOR`, `DELETE_DIRECTOR` |
| Reports | `CREATE_REPORT`, `UPDATE_REPORT`, `DELETE_REPORT` |
| Transactions | `CREATE_TRANSACTION`, `UPDATE_TRANSACTION`, `DELETE_TRANSACTION` |
| Users | `CREATE_USER`, `UPDATE_USER`, `DELETE_USER`, `CHANGE_PASSWORD` |
| Exports | `EXPORT_PDF`, `EXPORT_EXCEL` |

### Log Security
- Logging errors are silently caught — they never crash the main request flow
- Only `admin` users can view logs via `/api/logs`

---

## 14. Production Deployment

### 1. Build Frontend
```bash
cd client && npm run build
```

### 2. Configure Environment
```bash
# Set NODE_ENV on the server
NODE_ENV=production node src/server.js
```

Production changes activated automatically:
- `secure: true` on refresh token cookie (HTTPS only)
- `sameSite: 'strict'` on cookie (CSRF protection)

### 3. Configure Nginx
Copy `nginx.conf.example` to `/etc/nginx/sites-available/cc-report` and update:
- `server_name` to your actual domain
- SSL certificate paths
- `root` to the path of `client/dist`

```bash
sudo ln -s /etc/nginx/sites-available/cc-report /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Process Manager (PM2)
```bash
npm install -g pm2
cd backend
pm2 start src/server.js --name cc-report-api --env production
pm2 save && pm2 startup
```

---

## 15. Active Directory Migration Guide

The authentication system is designed for easy AD swap. All credential verification is isolated in `auth.service.js`.

### What to Change
Only **one function** needs to be replaced: `loginWithCredentials()` in `src/services/auth.service.js`.

See `src/services/AD_INTEGRATION_GUIDE.js` for the complete example with `ldapjs`.

### What Stays the Same
- JWT token generation (`generateTokens`)
- Token rotation and revocation
- `auth.controller.js` (no changes needed)
- All route protection middleware
- All frontend auth logic

### Required Dependencies
```bash
npm install ldapjs
```

### Additional Environment Variables
```env
LDAP_URL="ldap://your-ad-server.company.local"
LDAP_BASE_DN="dc=company,dc=local"
```

**Estimated migration effort:** 2–4 working days (one backend developer familiar with LDAP)

---

## 16. Microsoft SQL Server Migration Guide

The Prisma schema is designed to be compatible with MSSQL. Migration requires minimal changes.

### Step 1: Update `schema.prisma`
```prisma
// Change this:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// To this:
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}
```

### Step 2: Update `DATABASE_URL`
```env
DATABASE_URL="sqlserver://your-server;database=cc_report;user=sa;password=YOUR_PASSWORD;encrypt=true"
```

### Step 3: Regenerate Prisma Client
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### Known Considerations
- **Collation:** MSSQL case-insensitive collation must support the `mode: 'insensitive'` filter used in activity log search. Use `Latin1_General_CI_AS` or equivalent.
- **`Decimal(15,2)`:** Compatible with MSSQL `DECIMAL(15,2)` — no changes needed.
- **`@default(autoincrement())`:** Maps to `IDENTITY(1,1)` in MSSQL — fully compatible.
- **`onDelete: Cascade`:** Supported in MSSQL via foreign key constraints.

**Estimated migration effort:** 1–2 working days

---

## 17. Security Considerations

| Area | Implementation |
|---|---|
| Password storage | bcrypt with cost factor 12 |
| Access token | JWT, 15-minute expiry, memory-only storage |
| Refresh token | JWT, 7-day expiry, httpOnly + secure + sameSite cookie |
| Token revocation | DB-backed: `refreshToken = null` on logout |
| Rate limiting | 20 req/15min on auth, 200 req/15min general |
| Security headers | Helmet.js (X-Frame-Options, HSTS, nosniff, etc.) |
| Input validation | Zod schemas on all write endpoints |
| CORS | Restricted to `CLIENT_URL` only |
| SQL injection | Prevented by Prisma parameterized queries |
| XSS | React auto-escapes output; no `dangerouslySetInnerHTML` |

### Checklist Before Production
- [ ] Rotate all secrets in `.env` before first deployment
- [ ] Verify `.env` is NOT tracked in git history
- [ ] Set `NODE_ENV=production` on the server
- [ ] Configure SSL certificate on Nginx
- [ ] Restrict database access to server IP only
- [ ] Enable PostgreSQL connection pooling (PgBouncer) for scale
