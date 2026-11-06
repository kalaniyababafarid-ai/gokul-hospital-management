# GOKUL HOSPITAL — Full-Stack Hospital Website & Hospital Management System

Official full-stack web platform and role-protected Hospital Management System (HMS) for **GOKUL HOSPITAL**.

## Brand & Visual Identity
- **Hospital Name:** GOKUL HOSPITAL
- **Primary Brand Palette:**
  - Deep Medical Blue: `#123B67`
  - Secondary Healthcare Blue: `#1685B8`
  - Accent Healing Teal: `#19B7A5`
  - Soft Background: `#F5F9FC`
  - Pure White Surface: `#FFFFFF`
  - Dark Slate Text: `#243447`
- **Typography:** Plus Jakarta Sans (Display/Headings), Public Sans (Clinical/Body), IBM Plex Mono (Booking IDs, Token Numbers, Timestamps, INR `₹` Fees).

---

## Architecture Overview
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, React Router v7, Lucide Icons.
- **Backend:** Node.js + Express (`server.ts`) serving `/api/*` REST endpoints and Vite middleware on Port `3000`.
- **Database:** Concurrency-safe, transactional persistent JSON store (`server/data/gokul_hospital_db.json`) with automatic seeding, slot locks, and audit logging. Reference Firebase Firestore security rules (`firestore.rules`), composite indexes (`firestore.indexes.json`), and blueprint (`firebase-blueprint.json`) are included in the repository root for optional cloud Firestore deployment.
- **Authentication & RBAC:** Scrypt password hashing + HMAC-SHA256 signed bearer tokens with strict Role-Based Access Control across 4 roles (`patient`, `doctor`, `receptionist`, `admin`).
- **AI Assistant:** Server-side Gemini (`@google/genai`) non-diagnostic Hospital Navigation & Department Guide (`/api/ai/assistant`) with emergency fallback.

---

## Pre-Seeded Role Accounts (For Testing & Demonstration)

| Role | Email | Password | Portal Route |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gokulhospital.in` | `Admin@123` | `/admin-dashboard` |
| **Doctor** | `dr.sharma@gokulhospital.in` | `Doctor@123` | `/doctor-dashboard` |
| **Receptionist** | `reception@gokulhospital.in` | `Reception@123` | `/receptionist-dashboard` |
| **Patient** | `patient@gokulhospital.in` | `Patient@123` | `/patient-dashboard` |

---

## Public Website Pages (30 Routes)
1. `/` — Home Page (18 complete clinical & institutional sections)
2. `/about` — About Gokul Hospital
3. `/overview` — Hospital Overview & Infrastructure
4. `/mission-vision` — Mission, Vision & Clinical Values
5. `/departments` — Medical Departments Directory (15 Specialties)
6. `/departments/:slug` — Individual Department Detail Page
7. `/doctors` — Doctors Directory
8. `/find-doctor` — Find a Doctor Live Filter
9. `/doctors/:slug` — Individual Doctor Profile & Live Slot Availability
10. `/services` — Hospital Clinical & Diagnostic Services
11. `/facilities` — Patient & Inpatient Facilities
12. `/emergency` — 24/7 Emergency & Trauma Care
13. `/book-appointment` — Concurrency-Safe Online Appointment Booking
14. `/health-packages` — Preventive Health Checkup Packages
15. `/testimonials` — Verified Patient Stories & Testimonials
16. `/gallery` — Campus & Infrastructure Gallery
17. `/blogs` — Health Articles & Clinical Awareness Blogs
18. `/blogs/:slug` — Individual Health Blog Article
19. `/faq` — Frequently Asked Questions
20. `/contact` — Contact Us, Inquiry Form & Hospital Map Directions
21. `/search` — Global Search Results (Doctors, Departments, Services, Packages, Blogs)
22. `/login` — Role-Aware Login Portal
23. `/register` — Patient Registration Portal
24. `/forgot-password` — Password Recovery Request
25. `/reset-password` — Token-Verified Password Reset
26. `/privacy-policy` — Patient Privacy Policy
27. `/terms-and-conditions` — Hospital Terms & Conditions
28. `/cancellation-policy` — Appointment Cancellation & Refund Policy
29. `/unauthorized` — 403 Unauthorized Access Page
30. `*` — 404 Page Not Found

---

## Installation & Local Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and configure any optional credentials:
   ```bash
   cp .env.example .env
   ```
   - `GEMINI_API_KEY`: Used by `/api/ai/assistant` for the non-diagnostic Hospital AI Guide (automatically falls back to deterministic department triage if omitted).
   - `SESSION_SECRET`: Secret key used to sign authentication tokens.
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Optional credentials if enabling live online payment gateway checkout instead of Pay-at-Hospital / Sandbox receipt mode.

3. **Run Development Server (Port 3000):**
   ```bash
   npm run dev
   ```

4. **Run Automated API & RBAC Integration Tests:**
   ```bash
   npm test
   ```

5. **Production Build & Start:**
   ```bash
   npm run build
   npm start
   ```
