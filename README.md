# Online Fertilizer Distribution Management System for Farmers in Ethiopia (OFDMS)
### የኢትዮጵያ አርሶ አደሮች የመስመር ላይ የማዳበሪያ ማከፋፈያ አስተዳደር ሥርዓት

OFDMS is a secure, responsive, bilingual (English and Amharic) full-stack web application designed to digitize the distribution of agricultural fertilizers (specifically Di-Ammonium Phosphate / DAP and Granular Urea) to farmers across Ethiopia.

---

## 1. System Architecture & Role Ecosystem

The platform enforces Role-Based Access Control (RBAC) connecting five key agricultural stakeholders:

1. **General Manager (`manager`)**:
   - High-level overview: Total registered farmers, physical DAP/Urea stocks, active requests, verified income, distributed quintals.
   - Financial oversight: Authorizes procurement budgets, operational expenses, and employee/laborer wages.
   - Price management: Sets official subsidized price per quintal of DAP and Urea with effective dates.
   - Audit reporting: Exports verified inventory, distribution, and financial statements to CSV or printable format.
   - Privileged personnel: Provisions staff accounts (Office Manager, Agricultural Expert, Laborer).

2. **Office Manager (`office_manager`)**:
   - Inventory receiving: Registers inbound supplier shipments (e.g. from EABC via Djibouti port) into an immutable ledger.
   - Farmer demand consolidation: Aggregates expert-approved farmer needs by crop and fertilizer type into procurement proposals.
   - Price publication: Reviews and broadcasts Manager's approved prices to farmers.
   - Payment verification: Inspects uploaded bank transfer / Telebirr slips, verifies farmer identity and amount, and prevents duplicate reference submission.
   - Distribution dispatch: Creates distribution orders and assigns them to warehouse laborers with pickup dates and depot locations.
   - Bilingual communications: Broadcasts announcements in English and Amharic.

3. **Agricultural Expert (`agricultural_expert`)**:
   - Agronomic evaluations: Reviews farmer crop types, land plot dimensions in hectares, and soil characteristics (Vertisol, Nitisol, Cambisol).
   - Endorsement: Approves, rejects, or requests changes with mandatory written agronomic explanations.
   - Configurable recommendations: Defines dynamic crop-specific application rates per hectare (not hardcoded).
   - Farmer guidance: Endorses bilingual guidelines for DAP basal application and Urea split top-dressing.

4. **Warehouse Laborer (`laborer`)**:
   - Mobile-first depot interface: Looks up farmer vouchers by ID or phone number.
   - Physical distribution execution: Records actual disbursed quintals (enforcing that distributed volume cannot exceed authorized quota).
   - Farmer acknowledgment: Captures signed confirmation before releasing bags.
   - Stock ledger safeguard: Enforces exactly-once inventory deduction and prevents negative stock balances.
   - Discrepancy logs: Submits damaged bag and moisture loss reports.

5. **Farmer (`farmer`)**:
   - Profile & plots: Registers agricultural land plots in hectares with soil types and agricultural seasons (Meher, Belg, Irrigation).
   - Fertilizer requirement form: Interactive calculator with real-time ETB price estimation based on official price gazette.
   - Request tracking: Full visibility across 11 lifecycle stages with visual stepper.
   - Payment submission: Securely uploads payment receipts with bank reference and amount.
   - Digital pickup vouchers: Printable collection vouchers with depot location and assigned laborer.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js 18 + Vite
- **Styling**: Tailwind CSS with custom Ethiopian agricultural palette
- **Routing**: React Router v6 with strict RBAC guards
- **State & HTTP**: React Context API (Auth, Language, Notifications) + Axios with HTTP-only cookies and Bearer token fallback
- **Localization**: `i18next` and `react-i18next` with full English and Amharic dictionaries and Google Fonts (`Noto Sans Ethiopic`)
- **Visuals & Charts**: Recharts, Lucide React icons

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose (16 normalized, indexed schemas)
- **Authentication**: JWT stored in secure HTTP-only cookies, password hashing with bcryptjs
- **Security**: Rate limiting (`express-rate-limit`), Helmet headers, CORS credentials whitelist
- **File Uploads**: Multer with MIME validation (JPEG, PNG, WEBP, PDF) and role-scoped document access
- **Notifications & Mail**: Nodemailer with graceful development console logging fallback

---

## 3. Getting Started & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB (Local instance `mongodb://localhost:27017` or MongoDB Atlas URI)
- Git

### Step 1: Clone and Setup Environment Variables

```bash
cd "Online Frtilizer Distribition System in Ethiopia"

# Backend configuration
cd server
cp .env.example .env
```

Ensure `server/.env` contains your MongoDB URI:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ofdms
JWT_SECRET=ofdms_secure_ethiopian_fertilizer_distribution_secret_key_2026
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Step 2: Install Backend Dependencies & Seed Database

```bash
cd server
npm install

# Pre-populate 5 ready-to-test role accounts, crops, products, prices, and sample requests:
npm run seed
```

### Step 3: Install Frontend Dependencies

```bash
cd ../client
npm install
```

### Step 4: Run the Application

In terminal 1 (Backend):
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
# API Base: http://localhost:5000/api/v1
# Health Check: http://localhost:5000/api/health
```

In terminal 2 (Frontend):
```bash
cd client
npm run dev
# Frontend starts at http://localhost:5173
```

---

## 4. Ready-to-Test Demo Accounts

The database seeder provisions 5 active role accounts with pre-configured Ethiopian agricultural cooperative data:

| Role | Email | Password | Primary Module |
|---|---|---|---|
| **General Manager** | `manager@ofdms.et` | `Manager@123` | Strategic KPIs, Financials, Price Setting, Procurement Approval |
| **Office Manager** | `officemanager@ofdms.et` | `Office@123` | Inventory Receiving, Demand Consolidation, Payment Verification |
| **Agricultural Expert** | `agriexpert@ofdms.et` | `Expert@123` | Agronomic Request Reviews, Crop Recommendation Standards |
| **Warehouse Laborer** | `laborer@ofdms.et` | `Laborer@123` | Physical Bag Handovers, Farmer Signature, Stock Deduction |
| **Farmer** | `farmer@ofdms.et` | `Farmer@123` | Plot Registration, DAP/Urea Requests, Receipt Upload, Pickup Vouchers |

> **Evaluation Tip**: On the `/login` page, click any of the **Quick Test Role Buttons** to populate credentials and test that role's interface immediately.

---

## 5. End-to-End Workflow Demonstration

1. **Farmer Experience**:
   - Log in as `farmer@ofdms.et`.
   - Go to **My Land Plots** and verify the registered 1.5 ha plot.
   - Go to **Fertilizer Requirement Form**, select crop (e.g. Teff), and submit for review.
2. **Agricultural Expert Experience**:
   - Log in as `agriexpert@ofdms.et`.
   - Go to **Agronomic Reviews**, inspect plot dimensions and soil context, and approve the requested DAP and Urea quota.
3. **Office Manager Experience**:
   - Log in as `officemanager@ofdms.et`.
   - Go to **Demand Consolidation** to observe the newly approved demand.
   - Go to **Payment Verification** to inspect and verify farmer payment receipts.
   - Go to **Distribution Orders** to create a pickup dispatch order and assign a laborer.
4. **General Manager Experience**:
   - Log in as `manager@ofdms.et`.
   - Go to **Financial Management** to review cashflow and approve operational expenses or laborer wages.
   - Go to **Fertilizer Prices** to update official DAP or Urea prices per quintal.
5. **Laborer Experience**:
   - Log in as `laborer@ofdms.et`.
   - View assigned order, click **Execute Handover**, check the farmer acknowledgment signature box, and confirm.
   - Inventory is atomically deducted in the ledger and the farmer's order status transitions to `completed`.

---

## 6. Testing & Quality Assurance

Run the automated backend test suite:

```bash
cd server
npm test
```

The test runner validates:
- Password hashing & verification
- RBAC 5-role configuration
- Inventory ledger negative stock prevention
- Anti-double-spend guard preventing duplicate inventory deductions

To validate frontend bundle compilation:
```bash
cd client
npm run build
```

---

## 7. Production Deployment Instructions

### Backend (Render / Railway / VPS)
1. Push the repository to GitHub.
2. Create a Node.js Web Service with root directory set to `server`.
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Set environment variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`).

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Create a project pointing to `client`.
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Configure environment variable for production API URL if separated.

---

## 8. License
Developed for the Ethiopian Agricultural Cooperatives & Smallholder Farmers.
All rights reserved.
#   O n l i n e - F e r t i l i z e r - D i s t r i b u t i o n - S y s t e m - i n - E t h i o p i a  
 