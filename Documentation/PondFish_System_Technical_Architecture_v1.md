# PONDFISH --- SYSTEM & TECHNICAL ARCHITECTURE DOCUMENT

**Version:** 1.0\
**Status:** Architecture Baseline\
**Related Document:** PondFish Master PRD v2.0

------------------------------------------------------------------------

## 1. Purpose

This document converts the locked PondFish Master PRD into a technical
architecture for UI/UX, frontend, React Native, backend, database,
integrations, QA and DevOps.

The architecture preserves the locked business workflows. It does not
redefine business rules.

## 2. Core Architecture Principles

### Backend is the source of truth

Portals must not independently decide payment success, subscription
balance, weekly usage, inventory availability, booking state,
transaction state, bill duplication or customer GPS visibility.

### Shared backend

All products use the same backend and authoritative database:

``` text
Public Website ─────┐
Customer App ───────┤
Worker Portal ──────┤──→ PondFish Backend → Database
Admin Portal ───────┤
TV Portal ──────────┘
```

### Domain-centered design

Core domains:

1.  Authentication
2.  Customers
3.  Workers
4.  Admin
5.  Fish
6.  Categories
7.  Inventory
8.  Freshness
9.  Discounts
10. Subscriptions
11. Bookings
12. Bill Processing
13. Transactions
14. Payments
15. GPS/Journey
16. Notifications
17. Reporting
18. Audit
19. Realtime
20. File Storage
21. Background Jobs

### Transactional integrity

Financial, inventory and subscription mutations must be atomic.

------------------------------------------------------------------------

## 3. High-Level System

``` text
                         ┌──────────────────────┐
                         │    PUBLIC WEBSITE    │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │ CUSTOMER REACT NATIVE│
                         │       APP            │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
      ┌───────▼───────┐     ┌───────▼───────┐     ┌──────▼──────┐
      │ WORKER PORTAL │     │ ADMIN PORTAL   │     │  TV PORTAL  │
      └───────┬───────┘     └───────┬───────┘     └──────┬──────┘
              └─────────────────────┼─────────────────────┘
                                    │
                           ┌────────▼────────┐
                           │ API / BACKEND   │
                           └────────┬────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       │                            │                            │
 ┌─────▼─────┐                ┌─────▼─────┐                ┌─────▼─────┐
 │   DOMAIN  │                │ DATABASE  │                │EVENT/JOBS │
 │  MODULES  │                │           │                │           │
 └───────────┘                └───────────┘                └───────────┘

External: Razorpay | AI Bill Service | OneLap | Push/SMS/WhatsApp
```

------------------------------------------------------------------------

## 4. Application Layers

### Presentation

-   Public website
-   Customer React Native app
-   Worker tablet web app
-   Admin web app
-   Transaction TV web app

Responsibilities:

-   UI
-   Navigation
-   Client validation
-   API calls
-   Loading/error/empty states
-   Realtime presentation

The presentation layer must not own authoritative business calculations.

### API Layer

Responsibilities:

-   Authentication
-   Authorization
-   Validation
-   Rate limiting
-   Request normalization
-   Domain-service invocation
-   Consistent responses
-   Correlation/request IDs

------------------------------------------------------------------------

## 5. Authentication and RBAC

### Customer

``` text
Mobile Number → OTP → Verification → Session
```

No customer password.

### Worker

``` text
Admin-created Email + Password → Authentication → Worker Session
```

### Admin

``` text
Email + Password → Authentication → Admin Session
```

### Roles

``` text
PUBLIC
CUSTOMER
WORKER
ADMIN
TV
```

Every protected endpoint checks authentication, role, resource access
and action permission.

------------------------------------------------------------------------

## 6. Domain Modules

### Fish and Categories

Own:

-   Fish
-   Categories
-   Price
-   Images
-   Active state
-   Online-booking eligibility

### Inventory

Own:

-   Physical quantity
-   Reserved quantity
-   Available quantity
-   Inventory ledger
-   Receiving
-   Sales
-   Reservation release
-   Wastage/disposal
-   Manual corrections

Invariant:

``` text
Available = Physical - Reserved
```

### Freshness

``` text
Received → Green → Grey → Red
```

Durations are configurable per fish.

Freshness affects display, online availability, discounts and admin
alerts, but must not automatically destroy physical inventory.

### Discounts

Admin controls fish, discount value/type, start/end and status.

``` text
Draft → Scheduled → Active → Ended
```

### Subscriptions

Subscription uses separate ledgers:

1.  Subscription account
2.  Monetary Subscription Credit ledger
3.  Weekly quantity usage ledger

Credit and weekly quantity must never be treated as one value.

------------------------------------------------------------------------

## 7. Subscription Calculation Service

Input:

-   Customer
-   Fish lines
-   Quantities
-   Prices
-   Active subscription
-   Weekly usage
-   Credit balance

Output:

-   Eligible quantity
-   Covered quantity
-   Subscription value
-   Weekly used
-   Weekly remaining
-   Credit used
-   Credit remaining
-   Extra quantity
-   Extra amount
-   Final payable

The result must be auditable and reproducible.

------------------------------------------------------------------------

## 8. Bill and AI Architecture

Current system:

``` text
SI-801 weighing machine
        ↓
Printed Bill
        ↓
Customer / Worker
        ↓
Bill Image
        ↓
Private File Storage
        ↓
AI Extraction
        ↓
Structured Bill Data
        ↓
Human Confirmation
```

The SI-801 is **not directly integrated with PondFish in the current
phase**.

AI extraction is advisory. It cannot directly create a successful
transaction, deduct inventory, deduct subscription credit or declare
payment successful.

If Bill ID cannot be read, the customer/worker must manually enter it.

### Duplicate Bill protection

A successful Bill ID must be unique at database level.

``` text
Scan → Extract → Duplicate Check
                  ├─ Already successful → Reject
                  └─ New → Continue
```

Concurrency protection is mandatory.

------------------------------------------------------------------------

## 9. Physical Transaction Architecture

``` text
Bill Image
 ↓
AI Extraction
 ↓
Validation
 ↓
Customer/Worker Confirmation
 ↓
Subscription Calculation
 ↓
Payment Calculation
 ↓
Payment
 ↓
Server Verification
 ↓
Atomic Finalization
 ├─ Transaction
 ├─ Items
 ├─ Inventory
 ├─ Subscription Credit
 ├─ Weekly Usage
 ├─ Payment
 ├─ Worker linkage
 └─ Audit
 ↓
Commit
 ↓
Successful Event
 ├─ TV
 ├─ Notifications
 └─ Reporting
```

Cash is available only in the Worker Portal physical-store workflow.

Worker ID and cash amount must be stored against the transaction.

------------------------------------------------------------------------

## 10. Payment Architecture

Razorpay is external to the core transaction database.

``` text
Customer/Worker
 ↓
Backend creates payment/order
 ↓
Razorpay
 ↓
Customer payment
 ↓
Razorpay response/webhook
 ↓
Backend verification
 ↓
Payment marked successful
 ↓
Transaction finalization
```

The frontend callback alone is never sufficient.

Current configuration:

``` text
Gateway fee = 2%
GST on gateway fee = 18%
```

The fee and GST values must be configurable business settings.

------------------------------------------------------------------------

## 11. Online Booking Architecture

Only fish explicitly enabled for online booking can enter the cart.

``` text
Fish
 ↓
Eligibility
 ↓
Cart
 ↓
Availability revalidation
 ↓
Subscription calculation
 ↓
Payment
 ↓
Booking creation
 ↓
Inventory reservation
 ↓
Worker dashboard
 ↓
Customer collection
 ↓
Worker Complete
```

Reservation model:

``` text
Physical Stock
Reserved Stock
Available Stock
```

Booking success immediately reserves stock.

Booking completion consumes the reservation.

Cancellation/expiry releases the reservation.

Booking expiry is 48 hours and must restore applicable inventory, weekly
quantity and Subscription Credit. Applicable Razorpay-paid booking
amount is restored into Subscription Credit according to the locked PRD
rule.

All restoration jobs must be idempotent.

------------------------------------------------------------------------

## 12. Customer App Architecture

Technology: **React Native**.

``` text
React Native
 ├─ OTP Authentication
 ├─ API Client
 ├─ Secure Session Storage
 ├─ State Management
 ├─ Realtime Client
 ├─ Push Notifications
 ├─ Camera
 ├─ Image Upload
 └─ GPS/Map UI
```

Android is the initial target; architecture remains suitable for iOS.

The app uses the same backend and business rules as the web portals.

------------------------------------------------------------------------

## 13. Worker Portal Architecture

Tablet-optimized web application.

Main domains:

-   Login
-   Today's bookings
-   Booking search
-   Booking details
-   Booking completion
-   Customer search
-   Bill capture
-   AI review
-   Subscription calculation
-   Razorpay
-   Worker cash
-   Transaction result/history

The worker must not access Admin-only functions.

------------------------------------------------------------------------

## 14. Admin Portal Architecture

Operational groups:

``` text
Operations
 ├─ Dashboard
 ├─ Inventory
 ├─ Fish
 ├─ Categories
 ├─ Freshness
 ├─ Discounts
 └─ Bookings

Customers
 ├─ Customers
 └─ Subscriptions

Finance
 └─ Transactions / Payments

Logistics
 └─ GPS Journeys

Communication
 └─ Notifications

Governance
 ├─ Workers
 ├─ Reports
 ├─ Audit
 └─ Settings
```

Sensitive admin mutations create audit records.

------------------------------------------------------------------------

## 15. Transaction TV Architecture

The TV is a separate read-only web application.

Only successful transactions are displayed.

``` text
Successful Transaction
 ↓
Commit
 ↓
Realtime Event
 ↓
TV
 ↓
Display
 ↓
Bell/Notification Sound
```

The TV cannot:

-   Create transactions
-   Approve payments
-   Modify inventory
-   Modify subscriptions
-   Complete bookings

### Reconnection

On startup/reconnection:

``` text
Authenticate
 ↓
Fetch current business-day successful transactions
 ↓
Render history
 ↓
Subscribe to new successful events
```

This prevents missed transactions after network loss or TV restart.

------------------------------------------------------------------------

## 16. Realtime Architecture

Required realtime areas:

-   Successful transaction TV
-   Customer GPS tracking
-   Admin GPS updates where applicable

Logical channels may be:

``` text
transactions:successful
gps:journey:{journey_id}
notifications:customer:{customer_id}
```

Private channels require authorization.

Realtime events must have unique IDs and be idempotent.

------------------------------------------------------------------------

## 17. Event Architecture

Important events:

``` text
TransactionSucceeded
BookingCreated
BookingCompleted
BookingCancelled
BookingExpired
PaymentSucceeded
PaymentFailed
SubscriptionPurchased
SubscriptionCreditChanged
InventoryChanged
FreshnessChanged
DiscountStarted
DiscountEnded
JourneyStarted
GPSPublished
JourneyArrived
CustomerTrackingEnded
NotificationCreated
```

Events communicate committed state changes. They do not replace the
authoritative database.

------------------------------------------------------------------------

## 18. Background Jobs

Required jobs:

-   Booking expiry
-   Freshness evaluation
-   Discount scheduling
-   Notification scheduling/retry
-   GPS synchronization where required
-   Customer tracking shutdown
-   Reporting aggregation
-   Cleanup
-   Reconciliation

Jobs must be retryable, idempotent, observable and logged.

------------------------------------------------------------------------

## 19. OneLap GPS Architecture

OneLap is the GPS provider.

Use an adapter:

``` text
PondFish GPS Service
        ↓
GPS Provider Adapter
        ↓
OneLap
```

This prevents OneLap-specific structures from spreading throughout the
system.

### Journey

Admin:

1.  Creates journey
2.  Selects fish and quantities
3.  Selects origin
4.  Uses fixed store destination
5.  Starts journey
6.  Monitors GPS
7.  Publishes customer tracking

Customer sees GPS only after Admin publishes it.

### Arrival

``` text
GPS/Geofence
 ↓
Arrived
 ↓
Server timestamp
 ↓
Post-arrival tracking window
 ↓
Customer tracking ends automatically
```

The post-arrival window is approximately 30--60 minutes and should be
configurable.

Admin GPS visibility continues independently.

GPS failure shows the last valid location/time or unavailable state. It
must not stop unrelated business operations.

------------------------------------------------------------------------

## 20. Notifications

``` text
Domain Event
 ↓
Notification Rules
 ↓
Notification Job
 ↓
Push / SMS / WhatsApp
```

Notification failure must not roll back a successful business
transaction.

Notifications include:

-   Booking
-   Payment
-   Subscription
-   Fish arrival
-   GPS publication
-   Tracking end
-   Discounts
-   Flash offers
-   Announcements

------------------------------------------------------------------------

## 21. File Storage

Files include:

-   Fish images
-   Bill images
-   Approved assets

Bill images must be private.

``` text
Authorized upload
 ↓
Private object storage
 ↓
Database metadata
```

Large image binaries should not be stored directly in transactional
database rows where avoidable.

------------------------------------------------------------------------

## 22. Database Architecture

A relational database is recommended because the system requires strong
relationships and transactional consistency.

Core entities:

``` text
Customers
Workers
Admins
Categories
Fish
Inventory
Inventory Ledger
Freshness Batches
Discount Campaigns
Subscriptions
Subscription Credit Ledger
Subscription Usage Ledger
Bookings
Booking Items
Transactions
Transaction Items
Payments
Bills
Bill Images
GPS Journeys
GPS Positions/Current State
Notifications
Notification Deliveries
Audit Logs
Business Settings
Realtime/Event Records
```

Historical transaction records must preserve the required business
snapshots.

------------------------------------------------------------------------

## 23. Database Transaction Boundaries

Physical purchase finalization:

``` text
BEGIN
 ↓
Validate Bill
 ↓
Validate Inventory
 ↓
Validate Subscription
 ↓
Validate Payment
 ↓
Create Transaction
 ↓
Create Items
 ↓
Deduct Inventory
 ↓
Deduct Credit
 ↓
Record Weekly Usage
 ↓
Record Payment
 ↓
Record Audit
 ↓
COMMIT
```

Failure of any required mutation causes rollback.

------------------------------------------------------------------------

## 24. Concurrency Control

Critical resources require database-level concurrency protection.

### Inventory

Two simultaneous purchases cannot consume the same final quantity.

### Bill

Two scans cannot finalize one Bill ID twice.

### Subscription

Two simultaneous transactions cannot spend the same credit.

### Booking

Two customers cannot reserve the same last available quantity.

Mechanisms:

-   Database transactions
-   Row-level locking where required
-   Unique constraints
-   Atomic updates
-   Idempotency keys

------------------------------------------------------------------------

## 25. Idempotency

Required for:

-   Payment callbacks
-   Payment verification
-   Transaction finalization
-   Booking creation
-   Booking cancellation
-   Booking expiry
-   Inventory restoration
-   Subscription restoration
-   TV events
-   Notification processing

Example:

``` text
Idempotency-Key: TXN-REQUEST-001
```

Repeating the request must not create a second transaction.

------------------------------------------------------------------------

## 26. API Error Architecture

Consistent response:

``` json
{
  "success": false,
  "error": {
    "code": "BILL_ALREADY_PROCESSED",
    "message": "This bill has already been successfully processed."
  },
  "request_id": "REQ-..."
}
```

Frontend should use error codes for deterministic behavior.

Recommended categories:

-   AUTHENTICATION_ERROR
-   AUTHORIZATION_ERROR
-   VALIDATION_ERROR
-   RESOURCE_NOT_FOUND
-   CONFLICT
-   PAYMENT_ERROR
-   INVENTORY_ERROR
-   SUBSCRIPTION_ERROR
-   AI_PROCESSING_ERROR
-   GPS_ERROR
-   INTEGRATION_ERROR
-   RATE_LIMIT_ERROR
-   SERVER_ERROR

------------------------------------------------------------------------

## 27. Observability

Important requests require:

-   Request ID
-   Actor ID where appropriate
-   Action
-   Timestamp
-   Result
-   Error code
-   Correlation ID

Important integrations should be traceable:

``` text
Request
 → Domain Service
 → Database
 → External Provider
 → Event
```

------------------------------------------------------------------------

## 28. Security Architecture

### Application

-   HTTPS
-   Secure session/token handling
-   Password hashing
-   OTP rate limiting
-   API rate limiting
-   RBAC
-   Input validation

### Payment

-   Server-side verification
-   Secure webhook validation
-   No card credential storage

### GPS

-   OneLap credentials server-side
-   Customer receives only authorized published journey data

### Files

-   Private bill images
-   Authorized retrieval

### Database

-   Least privilege
-   Restricted credentials
-   Backups
-   Controlled migrations

------------------------------------------------------------------------

## 29. Cache Architecture

Suitable cache candidates:

-   Public fish listing
-   Categories
-   Static configuration
-   Non-critical display data

Never use stale cache as the authority for:

-   Payment
-   Inventory deduction
-   Subscription credit
-   Weekly quantity
-   Booking reservation
-   Transaction success

------------------------------------------------------------------------

## 30. Reporting Architecture

Reports derive from authoritative records.

Reports:

-   Revenue
-   Successful/failed transactions
-   Fish sales
-   Subscription sales
-   Inventory
-   Wastage
-   Worker cash
-   Bookings
-   GPS journey activity

Reporting must not mutate transactional records.

------------------------------------------------------------------------

## 31. Audit Architecture

Audit record:

``` text
Actor
Role
Action
Entity
Entity ID
Previous State
New State
Timestamp
Request ID
Relevant device/IP metadata where appropriate
```

Critical admin operations are auditable.

------------------------------------------------------------------------

## 32. Future POS + SI-801 Architecture

### Current

``` text
SI-801
 ↓
Printed Bill
 ↓
Customer/Worker Scan
 ↓
PondFish
```

### Future

``` text
SI-801
 ↓
POS
 ↓
PondFish Integration Adapter
 ↓
Transaction Engine
```

The transaction engine should remain stable; the input/integration layer
changes.

------------------------------------------------------------------------

## 33. Deployment Architecture

Logical production structure:

``` text
Internet
 ↓
Reverse Proxy / Load Balancer
 ↓
Web Apps + API
 ↓
Application Services
 ↓
Database
 ├─ Backup
 └─ Monitoring

Background Workers
Realtime Service
File Storage
```

External providers remain outside the infrastructure boundary.

------------------------------------------------------------------------

## 34. Environment Strategy

Minimum environments:

``` text
Development
Staging
Production
```

Each environment requires separate:

-   Database
-   Secrets
-   Payment credentials
-   External integration credentials where supported

Production secrets must never be committed to source control.

------------------------------------------------------------------------

## 35. CI/CD

``` text
Commit
 ↓
Lint
 ↓
Unit Tests
 ↓
Build
 ↓
Security Checks
 ↓
Integration Tests
 ↓
Staging
 ↓
E2E Tests
 ↓
Approved Production Deployment
```

Database migrations are version-controlled.

------------------------------------------------------------------------

## 36. Backup and Recovery

Critical data includes:

-   Customers
-   Subscriptions
-   Credit ledger
-   Weekly usage
-   Transactions
-   Payments
-   Bookings
-   Inventory
-   Audit logs

Backups and restoration procedures must be tested.

------------------------------------------------------------------------

## 37. Performance Direction

Optimize:

-   Fish browsing
-   Customer home
-   Worker booking search
-   Bill processing
-   Transaction finalization
-   Admin tables
-   TV realtime updates

AI and external integrations should not block unrelated system
operations.

------------------------------------------------------------------------

## 38. Architecture Decision Record

### AD-01 --- Shared Backend

All portals share one backend.

### AD-02 --- Customer Technology

React Native.

### AD-03 --- Worker/Admin/Public Technology

Web applications.

### AD-04 --- TV

Separate read-only web application.

### AD-05 --- Backend Shape

Modular monolith + background workers + realtime for the initial system.

### AD-06 --- Database

Relational database for transactional consistency.

### AD-07 --- Integrations

Razorpay, OneLap and AI are isolated behind service/adapter boundaries.

### AD-08 --- Future POS

POS/SI-801 integration enters through an adapter and does not replace
the core transaction engine.

------------------------------------------------------------------------

## 39. Recommended Build Order

``` text
01 Foundation
02 Database
03 Authentication
04 RBAC
05 Fish / Categories
06 Inventory
07 Freshness
08 Discounts
09 Subscription
10 Payment
11 Transaction Engine
12 Bill / AI
13 Booking
14 Worker Portal
15 Admin Portal
16 Public Website
17 Customer React Native App
18 Realtime
19 TV
20 OneLap GPS
21 Notifications
22 Reporting
23 Audit
24 Security Hardening
25 E2E Testing
26 Deployment
```

------------------------------------------------------------------------

## 40. Architecture Acceptance Criteria

The architecture is ready when:

-   All portals have defined backend boundaries.
-   No portal owns critical business truth.
-   Inventory is transactionally safe.
-   Subscription credit and quantity are separate.
-   Payment verification is server-side.
-   Bill duplication is database protected.
-   Booking reservation and restoration are atomic.
-   TV receives successful transactions in realtime.
-   TV recovers after disconnection.
-   GPS publication is separate from Admin GPS visibility.
-   Customer GPS automatically ends after the configured post-arrival
    period.
-   OneLap is isolated behind an integration adapter.
-   Future POS/SI-801 integration does not require rewriting the
    transaction engine.
-   Notification failures cannot roll back business transactions.
-   Critical administrative actions are auditable.
-   Background jobs are idempotent.
-   Security boundaries are enforced server-side.

------------------------------------------------------------------------

## 41. Relationship to Next Documents

This document becomes the foundation for:

``` text
Master PRD
    ↓
System Architecture
    ↓
Database / ERD
    ↓
API Specification
    ↓
Integration Specification
    ↓
UI/UX Design System
    ↓
Page Specification
    ↓
Frontend Architecture
    ↓
Backend Implementation Specification
    ↓
Testing / QA
    ↓
Deployment / DevOps
    ↓
Master AI Coding Prompt
```

No later document should silently contradict the Master PRD or this
architecture.

------------------------------------------------------------------------

# FINAL ARCHITECTURE PRINCIPLE

**Applications request actions. Domain services enforce rules. The
database preserves truth. Events communicate committed state changes.
Integrations remain replaceable.**

This allows PondFish to move from the current tablet-based worker
workflow to future POS + weighing-machine integration without rebuilding
the core business system.

## DOCUMENT END
