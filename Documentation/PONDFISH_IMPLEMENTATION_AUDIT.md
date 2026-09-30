# PONDFISH ECOSYSTEM — PHASE 2 PRODUCT & IMPLEMENTATION AUDIT
**Document Status:** READ-ONLY COMPREHENSIVE TECHNICAL AUDIT  
**Audit Date:** October 01, 2026  
**Source of Truth:** `./Documentation/PondFish_Master_PRD_v2.md` and related `./Documentation/` specifications  
**Repository Scope:** `./backend`, `./public-website`, `./customer-app`, `./worker-portal`, `./admin-portal`, `./tv-portal`

---

## 1. EXECUTIVE SUMMARY

### 1.1 Purpose & Context
This audit was performed in response to operational maintainability concerns and observed functional gaps within the PondFish ecosystem. The primary objective is to measure the current codebase implementation against the locked functional specifications documented in `./Documentation/PondFish_Master_PRD_v2.md` and secondary technical architecture specifications.

This audit is **strictly read-only**. No source code, database schemas, package versions, React Native configurations, or test scripts were modified during this assessment.

### 1.2 Key Findings Summary
1. **Core Backend Strength:** The Express + Prisma backend (`./backend`) contains well-implemented core financial, stock reservation, and atomic checkout transaction modules. However, several critical administrative and operational endpoints are completely missing.
2. **Frontend Architectural Monoliths:** Every web and mobile portal frontend (`customer-app`, `worker-portal`, `admin-portal`, `tv-portal`) suffers from monolithic implementation patterns. Entire applications, state handlers, navigation flows, and API logic are stuffed into single `App.tsx` files (e.g., `customer-app/App.tsx` is 1,328 lines; `admin-portal/src/App.tsx` is 1,393 lines).
3. **Customer App Native Gaps:** The Customer Application (`./customer-app`) is structured as a basic web-like React Native shell rather than a native mobile application. It lacks native camera viewfinder integration for bill scanning (relying on a fallback text input for image URLs), lacks native QR code scanning, and fails to request required Android permissions (`CAMERA`, `READ_EXTERNAL_STORAGE`, `ACCESS_FINE_LOCATION`) in `AndroidManifest.xml`.
4. **Missing Admin & Worker Portal Modules:** Major documented PRD modules are entirely missing from the user interface, including Admin Customer Management (AP-08), Admin Subscription Management (AP-10), Admin Notifications (AP-13), Admin Freshness Rules (AP-05), Admin Store Settings (AP-16), Admin Reports Export (AP-14), Worker Customer Search (WP-06), and Worker Bill Scanner/AI Review (WP-07/WP-08).
5. **Database Model Alignment:** The Prisma schema (`backend/prisma/schema.prisma`) represents 22 entities, capturing most core models well. However, subscription weekly quantity ledgers, customer active/blocked status flags, and granular freshness duration configuration tables are absent.
6. **Environment & Build Risk:** The Android project (`./customer-app/android`) configures Java 8 (`JavaVersion.VERSION_1_8`), which conflicts with modern React Native 0.73 requirements (Java 17 / JDK 17).

---

## 2. CURRENT ARCHITECTURE

### 2.1 Ecosystem Communication Overview
The PondFish ecosystem currently consists of five client applications communicating with a single central Express backend and PostgreSQL database.

```
+-----------------------------------------------------------------------------------+
|                                 DATABASE & BACKEND                                |
|  [PostgreSQL DB] <---> [Prisma ORM] <---> [Express Server (port 3000 / 5000)]    |
|                                                  ^                                |
+--------------------------------------------------|--------------------------------+
                                                   |
         +-----------------------------------------+-----------------------------------------+
         |                        |                        |                        |        |
         v                        v                        v                        v        v
  [Customer App]           [Worker Portal]           [Admin Portal]            [TV Portal] [Public Website]
  (React Native 0.73)      (Vite + React)            (Vite + React)           (Vite + React) (Next.js 14)
  REST + Socket.io         REST + Socket.io          REST Only                REST + Socket.io REST Only
```

### 2.2 Client-to-Backend Protocol Mapping
- **Customer Mobile App (`./customer-app`):** Communicates via REST APIs (`/customer/*`, `/public/*`) using Bearer JWT authentication stored in `@react-native-async-storage/async-storage`. Connects to Socket.io for `BOOKING_COMPLETED` and `TRANSACTION_COMPLETED` events.
- **Worker Tablet Portal (`./worker-portal`):** Communicates via REST APIs (`/worker/*`, `/public/*`) using Bearer JWT authentication stored in `localStorage`. Uses custom `authenticatedFetch` utility.
- **Admin Portal (`./admin-portal`):** Communicates via REST APIs (`/admin/*`) using Bearer JWT stored in `localStorage`. Uses centralized `apiFetch` wrapper. No active WebSocket connections.
- **Shop Transaction TV (`./tv-portal`):** Unauthenticated read-only client. Hydrates initial state via REST (`/public/transactions/recent`, `/public/gps/live`) and listens to Socket.io real-time broadcast channel for `TRANSACTION_COMPLETED` events.
- **Public Website (`./public-website`):** Next.js 14 SSR/SSG application calling `/public/*` endpoints.

---

## 3. CUSTOMER APP AUDIT

The customer app must be evaluated as a **Native Mobile Application**, not a web browser wrapper.

### 3.1 Requirement Evaluation against PRD

| Feature / Workflow | PRD Ref | Current Implementation Status | Notes / Gap Evidence |
| :--- | :--- | :--- | :--- |
| Mobile OTP Auth | CP-01 | **IMPLEMENTED** | Endpoints `/customer/auth/send-otp` and `/verify-otp` integrated with JWT persistence. |
| Home Dashboard | CP-02 | **PARTIALLY IMPLEMENTED** | Basic tile navigation exists in `App.tsx`, but layout is generic text buttons. |
| Fish Catalog & Filter | CP-03 | **IMPLEMENTED** | Category filter and text search over `/public/fish` and `/public/categories`. |
| Fish Details | CP-04 | **PARTIALLY IMPLEMENTED** | Rendered inside modal/tab; lacks full visual layout and freshness badge styling. |
| Quantity Selection | PRD 12.3 | **IMPLEMENTED** | Numeric input with validation (`kg`). |
| Booking Creation | CP-05 | **IMPLEMENTED** | Posts to `/customer/bookings`, immediate stock reservation. |
| Subscription Hub | CP-15 | **PARTIALLY IMPLEMENTED** | Displays active subscription balance and plan list; cannot purchase plans via UI. |
| Payment (Razorpay) | CP-10 | **PARTIALLY IMPLEMENTED** | `PaymentServiceAdapter` integrates `react-native-razorpay`; lacks breakdown of gateway fee & GST (CP-10). |
| Booking History | CP-14 | **IMPLEMENTED** | Fetches `/customer/bookings` with 48-hour countdown timer. |
| Booking Status & QR | CP-11 | **PARTIALLY IMPLEMENTED** | Renders SVG QR Code via `QRCodeView`; lacks manual status refresh control. |
| QR Code Scanner | PRD 3.2 | **MISSING** | App can render QR codes, but has no camera QR scanning component. |
| Camera / Bill Capture | CP-06 | **BROKEN** | No camera viewfinder or native image picker. User must type URL into text field (`file:///...`). |
| Bill Scanning / OCR | CP-07 | **PARTIALLY IMPLEMENTED** | Calls `/customer/bills/scan` API; UI falls back to manual Bill ID entry when OCR score < threshold. |
| Notifications | CP-17 | **MISSING** | No UI view or backend API integration for customer notifications. |
| GPS / Live Tracking | CP-16 | **PARTIALLY IMPLEMENTED** | Calls `/customer/gps/live`; displays raw coordinates and driver name without interactive map. |
| Android Permissions | PRD 26 | **BROKEN** | `AndroidManifest.xml` ONLY includes `INTERNET` permission. Missing `CAMERA` and `ACCESS_FINE_LOCATION`. |
| Offline / Network | PRD 1.2 | **PARTIALLY IMPLEMENTED** | Displays alert modals on fetch errors; no offline caching or queue. |

---

## 4. WORKER PORTAL AUDIT

| Feature / Requirement | PRD Ref | Current Implementation Status | Notes / Gap Evidence |
| :--- | :--- | :--- | :--- |
| Worker Auth | WP-01 | **IMPLEMENTED** | Mobile number + password authentication against `/worker/auth/login`. |
| Today's Bookings Queue | WP-02 | **IMPLEMENTED** | Lists active store bookings with status tabs (`ALL`, `PENDING`, `CONFIRMED`, `COMPLETED`). |
| Booking Search | WP-03 | **IMPLEMENTED** | Search input filters by booking ID, customer name, or phone via `/worker/bookings?search=...`. |
| Booking Details | WP-04 | **IMPLEMENTED** | Detailed breakdown of items, totals, customer info, and payment breakdown. |
| QR Code Scanning | WP-03 | **MISSING** | No camera/webcam QR code scanner integrated into tablet UI to quickly retrieve bookings. |
| Complete Online Booking | WP-05 | **IMPLEMENTED** | Handover complete button calls `/worker/bookings/:id/complete` and emits WebSocket event. |
| Customer Search | WP-06 | **MISSING** | Dedicated customer search screen/module (search by phone/name) is missing from tab list. |
| Bill Capture & AI Review | WP-07/08| **MISSING** | Worker tablet interface lacks bill capture, image upload, and AI OCR verification review views. |
| Cash Checkout | WP-09 | **PARTIALLY IMPLEMENTED** | In-store checkout tab exists, but only processes Cash (`/worker/transactions/collect-cash`). |
| Razorpay in Worker Flow | WP-09 | **MISSING** | Worker portal cannot trigger Razorpay checkout for customers without phones. |
| Worker Status & Session | PRD 4.3 | **PARTIALLY IMPLEMENTED** | JWT session handling is clean (handles 401), but worker shift status (active/inactive) is not shown. |

---

## 5. ADMIN PORTAL AUDIT

| Admin Module | PRD Ref | Implementation Status | Detailed Verification Notes |
| :--- | :--- | :--- | :--- |
| Executive Dashboard | AP-01 | **IMPLEMENTED** | ANALYTICS tab fetches total revenue, total orders, low stock count, active workers, active journeys. |
| Fish Management | AP-02 | **IMPLEMENTED** | FISH tab supports list, search, filter, create fish, edit unit price, online/physical flags, freshness state. |
| Category Management | AP-03 | **PARTIALLY IMPLEMENTED** | Categories retrieved and selectable in fish creation form; missing standalone CRUD screen. |
| Inventory Batches | AP-04 | **IMPLEMENTED** | INVENTORY tab allows receiving new stock batches (`/admin/inventory/receive`) and viewing batches/ledger. |
| Manual Adjustment / Wastage | AP-04 | **MISSING** | No UI or backend endpoints for manual stock correction, wastage, disposal, or scrap entries. |
| Freshness Rules Config | AP-05 | **MISSING** | No UI to configure per-fish freshness hour thresholds (0-24h, 24-48h, >48h) or viewing expired alerts. |
| Discounts Manager | AP-06 | **PARTIALLY IMPLEMENTED** | Backend has `/admin/discounts`, but Admin Portal UI has no screen to create/schedule flash sales. |
| GPS / Journeys | AP-07 | **IMPLEMENTED** | GPS tab allows creating journey, selecting truck/driver, starting, publishing to customer, and stopping. |
| Customer Management | AP-08 | **MISSING** | **Completely absent from Admin Portal.** No customer search, profile view, booking history, or block controls. |
| Worker Management | AP-09 | **IMPLEMENTED** | WORKERS tab allows creating worker accounts with phone/password and viewing registered workers. |
| Subscription Management | AP-10 | **MISSING** | **Completely absent from Admin Portal.** Cannot view plans, assign plans to customers, or edit credit. |
| Transaction Ledger | AP-11 | **PARTIALLY IMPLEMENTED** | TRANSACTIONS tab lists transactions; lacks filter by date, payment method, customer, or bill image modal. |
| Bookings Overview | AP-12 | **IMPLEMENTED** | BOOKINGS tab lists all bookings with status filter and search. |
| Notifications Manager | AP-13 | **MISSING** | **Completely absent from Admin Portal.** No ability to compose, broadcast, or schedule push notifications. |
| Reports & Export | AP-14 | **MISSING** | No dedicated reporting dashboard or CSV/Excel export functionality. |
| Audit Logs | AP-15 | **IMPLEMENTED** | AUDIT tab displays system audit trail (`/admin/audit-logs`). |
| System Settings | AP-16 | **MISSING** | **Completely absent from Admin Portal.** Cannot edit Razorpay fee %, GST %, or booking expiry hours. |

---

## 6. TV PORTAL AUDIT

| Feature | PRD Ref | Implementation Status | Detailed Verification Notes |
| :--- | :--- | :--- | :--- |
| Successful Transactions Only | TV-01 | **IMPLEMENTED** | Filters and normalizes incoming transactions (`normalizeTransactionEvent`). Displays order ID, customer name, items, total. |
| Real-time Updates | TV-02 | **IMPLEMENTED** | Listens to Socket.io `TRANSACTION_COMPLETED` events. Plays Web Audio API chime on new transaction. |
| Operator Display | TV-03 | **IMPLEMENTED** | Displays transaction card feed with clear typography for store workers preparing orders. |
| Hydration & Reconnection | TV-05 | **IMPLEMENTED** | On mount/reconnect, fetches `/public/transactions/recent?limit=10` to avoid missing events after network drops. |

---

## 7. PUBLIC WEBSITE AUDIT

| Page / Requirement | PRD Ref | Implementation Status | Notes / Gap Evidence |
| :--- | :--- | :--- | :--- |
| Home Page | PW-01 | **IMPLEMENTED** | Next.js landing page (`index.tsx`) with hero, category showcase, freshness explanation, and subscription highlights. |
| Categories / Listing | PW-02 | **IMPLEMENTED** | Displays categories and fish catalog via `/public/fish`. |
| Fish Details | PW-03 | **IMPLEMENTED** | Page renders fish name, description, unit price, and freshness indicator. |
| Subscription Plans | PW-04 | **IMPLEMENTED** | Displays ₹2,000 and ₹6,000 subscription plan features and credit calculations. |
| Offers & Flash Sales | PW-05 | **IMPLEMENTED** | Fetches active discounts from `/public/discounts`. |
| About & Contact | PW-06/07| **IMPLEMENTED** | Static informational pages under `src/pages/about` and `src/pages/contact`. |
| Scope Boundaries | Scope 3.1 | **PARTIALLY INCORRECT** | Public site includes direct booking pages (`src/pages/booking`), which conflicts with PRD Section 3.1 (booking is exclusive to Customer App). |

---

## 8. BACKEND AUDIT

### 8.1 API Implementation & Service Mapping

```
FRONTEND CALL -------------> ENDPOINT --------------------------> CONTROLLER / MODULE ---------------> DB MODEL
Customer OTP Request        POST /customer/auth/send-otp         AuthModule.sendOTP                   Customer
Customer OTP Verify         POST /customer/auth/verify-otp       AuthModule.verifyOTP                 Customer
Customer Bookings           POST /customer/bookings              BookingModule.createBooking          Booking, BookingItem, InventoryBatch
Customer Bill Scan          POST /customer/bills/scan            BillProcessingModule.scanBill        Bill, AIExtractionLog
Worker Login                POST /worker/auth/login              AuthModule.workerLogin               Worker
Worker Cash Checkout        POST /worker/transactions/collect-cash TransactionModule.processStoreCheckout Transaction, InventoryBatch, Customer
Admin Login                 POST /admin/auth/login               AuthModule.adminLogin                Admin
Admin Receive Stock         POST /admin/inventory/receive        InventoryModule.receiveStockBatch    InventoryBatch, InventoryLedger
Admin GPS Start             POST /admin/gps/journey/start        GPSModule.startJourney               GPSJourney
Razorpay Webhook            POST /public/webhooks/razorpay       PaymentModule.handleRazorpayWebhook  Payment, Booking, Transaction
```

### 8.2 API Gap Analysis
- **Missing APIs:**
  - `GET /customer/notifications` & `PUT /customer/notifications/:id/read` (Customer notifications)
  - `POST /customer/bookings/:id/cancel` (Customer booking cancellation)
  - `GET /worker/customers?search=...` (Worker customer search)
  - `POST /worker/bills/scan` (Worker-assisted bill scanning for customers without phones)
  - `GET /admin/customers`, `GET /admin/customers/:id`, `PUT /admin/customers/:id/status` (Admin Customer management)
  - `GET /admin/subscriptions`, `POST /admin/subscriptions/assign` (Admin Subscription management)
  - `POST /admin/inventory/adjust`, `POST /admin/inventory/dispose` (Manual stock corrections & disposal)
  - `GET /admin/freshness/rules`, `POST /admin/freshness/rules` (Freshness rule configuration)
  - `POST /admin/notifications/broadcast` (Admin notification push)
  - `GET /admin/reports/export` (CSV/Excel data exporter)
- **Disconnected / Unused APIs:**
  - `GET /public/transactions/recent` is called by TV portal, but uses a hardcoded fallback limit of 10.
  - `POST /admin/gps/position` exists for mock testing, but no adapter exists for live OneLap GPS webhooks/polling.

---

## 9. DATABASE AUDIT

### 9.1 Schema Alignment (`backend/prisma/schema.prisma`)
The PostgreSQL schema contains 22 Prisma models:
`Customer`, `Worker`, `Admin`, `Category`, `Fish`, `FreshnessRule`, `Discount`, `InventoryBatch`, `InventoryLedger`, `SubscriptionPlan`, `Subscription`, `SubscriptionCreditLedger`, `Booking`, `BookingItem`, `Bill`, `AIExtractionLog`, `Transaction`, `TransactionItem`, `Payment`, `GPSJourney`, `GPSPosition`, `Notification`, `AuditLog`, `RealtimeEvent`, `Setting`, `WebhookEvent`.

### 9.2 Schema Gaps vs PRD Business Entities
1. **Subscription Weekly Limits:** Model `Subscription` has a `weeklyQtyUsed` float field, but lacks a reset timestamp or ledger table to track weekly limit resets (PRD Section 9.5).
2. **Customer Account Status:** Model `Customer` lacks an `active` or `isBlocked` boolean field required for Admin customer management (PRD AP-08).
3. **OneLap Integration Adapter Data:** Model `GPSJourney` lacks fields for origin location, fixed store destination, ETA calculations, or post-arrival timer timestamps (PRD Section 22.1).
4. **Wastage & Scrap Types:** Enum `InventoryChangeType` has `RECEIVING`, `BOOKING_RESERVATION`, `BOOKING_RELEASE`, `SALE`, `ADJUSTMENT`. It is missing `WASTAGE` and `DISPOSAL` enum values required by PRD Section 13.2.

---

## 10. TEST AUDIT

### 10.1 Complete Test Suite Classification

| Workspace | Test File | Classification | Workflow / Business Value |
| :--- | :--- | :--- | :--- |
| `backend` | `paymentAtomicity.test.ts` | **CRITICAL WORKFLOW** | High. Validates atomic DB commits, inventory deduction, and Razorpay payment lock. |
| `backend` | `storeCheckoutIntegration.test.ts` | **CRITICAL WORKFLOW** | High. Validates worker cash checkout, bill linking, and inventory updates. |
| `backend` | `workerPortalWorkflow.test.ts` | **INTEGRATION** | High. Validates worker login, booking queue search, and completion. |
| `backend` | `adminPortalWorkflow.test.ts` | **INTEGRATION** | Medium. Validates fish creation, stock receiving, worker creation, audit logs. |
| `backend` | `storeCheckoutValidation.test.ts` | **UNIT** | Medium. Validates checkout input parameters and stock limits. |
| `backend` | `securityFixesRegression.test.ts` | **INTEGRATION** | High. Regression suite for JWT RBAC and input injection. |
| `backend` | `authSecurityHardening.test.ts` | **UNIT** | Medium. Password hashing and OTP generation tests. |
| `backend` | `razorpayWebhook.test.ts` | **CRITICAL WORKFLOW** | High. Idempotent webhook verification and payment matching. |
| `backend` | `financialLedger.test.ts` | **CRITICAL WORKFLOW** | High. Subscription credit ledgers and remaining balance calculations. |
| `backend` | `workerCreation.test.ts` | **UNIT** | Low. Duplicate test for worker password hashing. |
| `backend` | `publicHydrationAndEvents.test.ts` | **INTEGRATION** | Low. Tests public API responses. |
| `customer-app` | `customerJourney.test.ts` | **INTEGRATION** | High. Tests mobile app booking and payment workflow state machine. |
| `customer-app` | `paymentService.test.ts` | **UNIT** | Medium. Tests Razorpay payment adapter state conversions. |
| `customer-app` | `authStorage.test.ts` | **UNIT** | Low. Mocks AsyncStorage JWT persistence. |
| `customer-app` | `apiConfig.test.ts` | **UNIT** | Low. Validates API URL resolution. |
| `customer-app` | `QRCodeView.test.ts` | **UI** | Low. Snapshot/render test for SVG QR component. |
| `worker-portal` | `sessionHandling.test.ts` | **INTEGRATION** | High. Validates 401 session expiration and token purge handling. |
| `worker-portal` | `authStorage.test.ts` | **UNIT** | Low. Mocks localStorage calls. |
| `admin-portal` | `adminWorkflow.test.ts` | **INTEGRATION** | Medium. Validates tab navigation state loading. |
| `admin-portal` | `apiConfig.test.ts` | **UNIT** | Low. Validates API URL resolution. |
| `admin-portal` | `authStorage.test.ts` | **UNIT** | Low. Mocks localStorage calls. |
| `tv-portal` | `tvPortal.test.ts` | **INTEGRATION** | High. Tests transaction event normalization and Socket.io listener state. |
| `public-website` | *None* | **MISSING** | No tests exist for the Next.js public website. |

---

## 11. ANDROID / CUSTOMER APP DEVELOPMENT ENVIRONMENT

### 11.1 Configuration Inspection

```groovy
// customer-app/android/build.gradle & app/build.gradle
compileSdkVersion = 33
targetSdkVersion  = 33
minSdkVersion     = 21
buildToolsVersion = "33.0.1"
ndkVersion        = "25.1.8937393"
kotlinVersion     = "1.8.0"
gradleVersion     = "8.3"
reactNativeVer    = "0.73.4"
```

### 11.2 Environment Conflicts & Issues
1. **Java Compatibility Hazard:** `build.gradle` defines `JavaVersion.VERSION_1_8` (Java 8). React Native 0.73+ and Android Gradle Plugin 8.x require **JDK 17**. Building with Java 8 will fail during compilation.
2. **Hermes / JSC Ambiguity:** `gradle.properties` sets `hermesEnabled=true`, but `app/build.gradle` contains legacy fallback logic selecting `jscFlavor = 'org.webkit:android-jsc:+'` when hermes flags are not resolved.
3. **Missing Native Permissions:** `AndroidManifest.xml` lacks `<uses-permission android:name="android.permission.CAMERA" />` and `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />`.

---

## 12. UI/UX AUDIT

### 12.1 Visual & Structural Deficiencies
1. **Monolithic UI Files:** All frontend portals lack structured component directories (`components/`, `screens/`, `layouts/`). Instead, entire screens are rendered inside monolithic conditional statements in `App.tsx`.
2. **Generic Placeholder UI:** The Customer App and Worker Portal use raw React Native `<Text>` and `<TouchableOpacity>` primitives without design system tokens, micro-animations, or glassmorphism aesthetic guidelines specified in `PondFish_Complete_Design_System_UI_UX_Specification.md`.
3. **Bill Scanning Manual Text Fallback:** Rather than opening a native camera viewfinder or gallery picker, the Customer App displays a `<TextInput placeholder="e.g. file:///camera/receipt_001.jpg">`.
4. **Missing Visual Modals & Feedback:** Admin Portal lacks modal windows for inventory adjustments, fish edit forms, customer details, or bill image inspection.

---

## 13. REQUIREMENTS TRACEABILITY MATRIX

| Requirement | Source Doc | Portal | Expected Behavior | Current Status | Evidence / File | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| OTP Login | PRD CP-01 | Customer App | Request & verify 6-digit SMS OTP | **IMPLEMENTED** | `customer-app/App.tsx#L513` | CRITICAL |
| Online Booking | PRD 12.3 | Customer App | Reserve eligible fish, deduct stock | **IMPLEMENTED** | `backend/src/modules/bookingModule.ts#L30` | CRITICAL |
| Native Camera Bill Scan | PRD CP-06 | Customer App | Open camera viewfinder & capture receipt | **BROKEN** | `customer-app/App.tsx#L1099` | CRITICAL |
| Camera Permission | PRD 26 | Customer App | Prompt for camera permission at runtime | **MISSING** | `customer-app/android/.../AndroidManifest.xml` | CRITICAL |
| Cash Checkout | PRD 7.0 | Worker Portal | Collect cash, record worker ID, emit event | **IMPLEMENTED** | `backend/src/routes/workerRoutes.ts#L62` | CRITICAL |
| QR Code Scanner | PRD WP-03 | Worker Portal | Scan booking QR code via camera | **MISSING** | `worker-portal/src/App.tsx` | HIGH |
| Worker Bill Scanner | PRD WP-07 | Worker Portal | Upload & AI process bill for phone-less customer | **MISSING** | `worker-portal/src/App.tsx` | HIGH |
| Customer Management | PRD AP-08 | Admin Portal | View, search, edit, block customer profiles | **MISSING** | `admin-portal/src/App.tsx` | HIGH |
| Subscription Admin | PRD AP-10 | Admin Portal | Manage plans, assign subscriptions, edit credits | **MISSING** | `admin-portal/src/App.tsx` | HIGH |
| Inventory Wastage | PRD 13.2 | Admin Portal | Record fish disposal, adjust stock balances | **MISSING** | `backend/prisma/schema.prisma#L17` | HIGH |
| Real-time TV Display | PRD TV-01 | TV Portal | Auto-display successful sales with audio chime | **IMPLEMENTED** | `tv-portal/src/App.tsx#L209` | MEDIUM |
| Public Discovery | PRD PW-01 | Public Web | Showcase available fish, prices, freshness | **IMPLEMENTED** | `public-website/src/pages/index.tsx` | MEDIUM |
| Push Notifications | PRD 24 | Admin/Customer| Send in-app & push alerts for orders | **MISSING** | `backend/src/routes/customerRoutes.ts` | MEDIUM |

---

## 14. CRITICAL GAPS

The following issues currently prevent the PondFish ecosystem from functioning as a production-grade product:

1. **Customer App Lack of Native Camera Integration:** The bill scanning workflow relies on typing local file path strings in a text input. It cannot be deployed to mobile devices without integrating `react-native-image-picker` or `react-native-vision-camera`.
2. **Missing Android Permissions:** Camera and location permissions are missing from `AndroidManifest.xml`, causing device runtime crashes if native modules are invoked.
3. **Missing Admin Customer & Subscription Management:** Admins cannot view customers, resolve subscription issues, override credits, or inspect customer history.
4. **Missing Worker Bill Capture & QR Scanning:** Store workers cannot assist customers without phones or scan physical booking QR codes.
5. **Monolithic Codebases:** Maintaining 1,300+ line `App.tsx` files creates massive merge conflicts, makes automated UI testing impossible, and severely hinders development velocity.

---

## 15. RECOMMENDED PHASE ORDER

To achieve codebase stability without risky full rewrites, execution should follow this sequence:

- **Phase 0 — Codebase Decomposition & Component Structure**
  Decompose monolithic `App.tsx` files into structured routes, screens, and reusable UI components for `customer-app`, `worker-portal`, and `admin-portal`.
- **Phase 1 — Requirements & Database Schema Realignment**
  Update Prisma schema to support subscription weekly reset ledgers, customer active/blocked flags, inventory wastage types, and freshness rules.
- **Phase 2 — Backend API Completion**
  Implement missing endpoints: Admin Customers, Admin Subscriptions, Admin Inventory Adjustment/Wastage, Worker Customer Search, and Customer Notifications.
- **Phase 3 — Customer Mobile App Native Integration**
  Add native camera picker, native QR scanner, runtime permission hooks, and `AndroidManifest.xml` permission declarations.
- **Phase 4 — Worker Tablet Portal Enhancements**
  Integrate webcam QR scanning, customer search, and worker-assisted bill capture/AI review workflows.
- **Phase 5 — Admin Operations Modules**
  Build Admin UI screens for Customer Management, Subscription Management, Notifications, and System Settings.
- **Phase 6 — TV Portal & Public Website Refinement**
  Polish TV transaction celebration graphics and realign Public Website route boundaries.
- **Phase 7 — Test Suite Expansion**
  Add missing integration tests for public website and new administrative endpoints.

---

## 16. TYPESCRIPT → JAVASCRIPT ASSESSMENT

### 16.1 Complexity Analysis
TypeScript is currently used across all workspaces (`backend`, `customer-app`, `worker-portal`, `admin-portal`, `tv-portal`, `public-website`).

### 16.2 Recommendation: DO NOT Convert to Plain JavaScript
- **Financial & Inventory Protection:** TypeScript interfaces (`TransactionItem`, `SubscriptionPlan`, `BookingResult`) enforce exact calculation fields (gateway fees, GST, unit prices, credit balances). Converting to JavaScript increases the risk of runtime type coercion bugs in currency calculations.
- **API Contract Enforcement:** Shared types prevent drift between backend DTOs and frontend state.
- **Simplification Strategy:** Rather than stripping TypeScript, simplify by refactoring large files into modular components with explicit types.

---

## 17. FINAL RECOMMENDATION

### Immediate First Step
**Execute Phase 0 (Component & Route Structure Decomposition):**  
Before adding missing features or fixing camera dependencies, refactor `customer-app/App.tsx`, `worker-portal/src/App.tsx`, and `admin-portal/src/App.tsx` into clean, standard React/React Native folder structures (`/src/screens`, `/src/components`, `/src/navigation`). This will isolate workflows, eliminate Maintainability Debt, and make feature implementation straightforward.

---

### Audit Verification Notice
At the conclusion of this audit, `git status` was executed to verify that no tracked project source files were modified, added, or deleted. Working tree remains clean.
