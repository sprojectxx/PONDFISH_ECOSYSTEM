# PONDFISH — QA / TEST SPECIFICATION

**Version:** 1.0  
**Status:** Implementation Test Blueprint  
**Document Type:** Functional, Business-Rule, Integration, System, Security, Performance, Recovery and Acceptance Test Specification  
**Scope:** Current MVP — Single Store + One Truck  
**Primary Consumers:** QA, Product, UI/UX, Frontend, Backend, React Native, Worker Portal, Admin Portal, Shop TV, DevOps, AI-assisted development teams

---

# 0. DOCUMENT PURPOSE

This document converts the locked PondFish product, architecture, data, API, portal, business-engine, integration, and cross-system rules into an executable QA strategy.

The purpose is not merely to test whether screens render.

QA must prove that:

- the same business truth is preserved across all interfaces;
- business rules are enforced by the backend/domain engines;
- critical mutations are atomic and idempotent;
- inventory and subscription credit are protected against concurrency;
- payment uncertainty is handled safely;
- successful transactions generate the correct TV event;
- external integrations remain isolated;
- network failures do not create false success;
- permissions are enforced server-side;
- historical records remain historically correct;
- public, customer, worker, admin and TV interfaces display the correct state;
- the React Native customer application and web portals behave consistently with the shared backend;
- deployment and recovery paths are testable.

The cross-system specification establishes the key principle:

> **Never let the UI guess what the backend has not confirmed.**

QA therefore validates authoritative backend state rather than trusting client appearance.

---

# 1. SOURCE-OF-TRUTH HIERARCHY

QA must test against the following authority order:

```text
Backend / API Contract
        ↓
Master PRD
        ↓
Core Business Engines
        ↓
System & Technical Architecture
        ↓
Database / ERD / Data Model
        ↓
Integration Specification
        ↓
Cross-System Validation / Error Specification
        ↓
Design System
        ↓
Page-by-Page UI Specifications
        ↓
Implementation
```

If a UI behavior appears to conflict with an authoritative business rule, QA must not silently accept the UI behavior.

The discrepancy must be recorded and routed back to the authoritative requirement.

---

# 2. SYSTEM UNDER TEST

The current PondFish ecosystem consists of:

```text
PUBLIC WEBSITE
        |
        v
CUSTOMER REACT NATIVE APP
        |
        v
     BACKEND
     /  |  \
    /   |   \
WORKER ADMIN  TV
PORTAL PORTAL DISPLAY
```

All surfaces use the shared backend.

No interface should communicate directly with another interface for business operations.

---

# 3. TESTING PRINCIPLES

## 3.1 Backend Is Authoritative

A visual success message does not prove a successful operation.

QA must verify the resulting backend/database state.

## 3.2 Business Rules Are Tested Centrally

A rule should be validated at the domain/API layer and then checked through every relevant consumer.

## 3.3 Critical Mutations Are Tested for Concurrency

This applies especially to:

- inventory;
- reservations;
- subscription credit;
- payments;
- booking creation;
- transaction finalization;
- refunds/restoration;
- QR completion.

## 3.4 Unknown Results Must Remain Unknown

For operations such as payment:

```text
Request sent
    ↓
Network interrupted
    ↓
Result unknown
```

The application must not automatically classify this as:

```text
FAILED
```

or:

```text
SUCCESS
```

until authoritative confirmation exists.

## 3.5 External Integrations Are Tested as Failure-Prone

QA must test:

- timeout;
- invalid response;
- unavailable provider;
- duplicate callback;
- stale data;
- rate limiting;
- authentication failure.

## 3.6 UI State Coverage Is Mandatory

Critical screens require testing for:

```text
Default
Loading
Empty
Success
Validation Error
Business Error
Network Error
Permission Error
Conflict
Disabled
Maintenance where applicable
```

---

# 4. TEST LEVELS

PondFish QA is divided into:

1. Unit Testing
2. Domain/Business Engine Testing
3. API Testing
4. Database Integrity Testing
5. Integration Testing
6. Contract Testing
7. Component Testing
8. Web UI Testing
9. React Native UI Testing
10. End-to-End Testing
11. Concurrency Testing
12. Idempotency Testing
13. Security Testing
14. Accessibility Testing
15. Performance Testing
16. Realtime Testing
17. Failure/Recovery Testing
18. Deployment Smoke Testing
19. Regression Testing
20. User Acceptance Testing

---

# 5. TEST ENVIRONMENT STRATEGY

At minimum:

```text
LOCAL / DEVELOPMENT
        ↓
TEST / QA
        ↓
STAGING
        ↓
PRODUCTION
```

Production testing must use approved smoke tests only.

Production must not be used for destructive test scenarios unless explicitly approved.

---

# 6. TEST DATA PRINCIPLES

Test data must be deterministic where possible.

Required test fixtures include:

### Users

- active customer;
- inactive customer;
- new customer;
- customer with subscription;
- customer without subscription;
- customer with exhausted credit;
- worker;
- active admin;
- unauthorized user.

### Fish

- available fish;
- unavailable fish;
- low-stock fish;
- physically available but online-booking-disabled fish;
- discounted fish;
- fish in multiple categories;
- archived fish.

### Inventory

- sufficient inventory;
- exact inventory;
- insufficient inventory;
- reserved inventory;
- zero available quantity;
- concurrent reservation scenario.

### Bookings

- pending booking;
- valid booking;
- expired booking;
- completed booking;
- cancelled booking;
- invalid QR booking.

### Payments

- successful;
- failed;
- pending;
- unknown;
- duplicate callback;
- amount mismatch;
- refund.

### Journeys

- created;
- active;
- customer tracking published;
- customer tracking disabled;
- arriving;
- arrived;
- stale GPS;
- completed.

---

# 7. TEST ID CONVENTION

Use stable IDs.

```text
UT-xxx       Unit
BE-xxx       Business Engine
API-xxx      API
DB-xxx       Database
INT-xxx      Integration
WEB-xxx      Public Website
CP-xxx       Customer App
WP-xxx       Worker Portal
AP-xxx       Admin Portal
TV-xxx       Shop TV
E2E-xxx      End-to-End
CON-xxx      Concurrency
IDM-xxx      Idempotency
SEC-xxx      Security
A11Y-xxx     Accessibility
PERF-xxx     Performance
REC-xxx      Recovery
DEP-xxx      Deployment
REG-xxx      Regression
UAT-xxx      Acceptance
```

---

# 8. UNIT TESTING

Unit tests must cover deterministic logic without external providers.

Examples:

- quantity validation;
- price calculation;
- discount calculation;
- subscription credit calculation;
- availability calculation;
- booking expiry calculation;
- QR status validation;
- permission evaluation;
- error mapping;
- state transition validation.

Unit tests must not be used as the only evidence for database or integration behavior.

---

# 9. CORE BUSINESS ENGINE TESTING

# 9.1 AUTHENTICATION ENGINE

Test:

- valid authentication;
- invalid authentication;
- expired token;
- revoked token;
- session refresh;
- logout;
- disabled account;
- wrong role;
- missing identity;
- malformed token.

Acceptance:

```text
No protected operation executes without valid authorization.
```

---

# 9.2 CATALOGUE ENGINE

Test:

- fish creation;
- fish update;
- fish availability flag;
- category assignment;
- multiple categories;
- archive;
- unarchive where supported;
- historical name preservation.

Critical historical test:

```text
Fish name = "Rohu"

Transaction completed.

Admin renames fish to "Rohu Premium".

Expected historical transaction:
"Rohu"
```

Historical records must not be rewritten by current catalogue edits.

---

# 9.3 INVENTORY ENGINE

The current inventory truth uses:

```text
Available = Physical - Reserved
```

Test:

### Case 1

```text
Physical = 20
Reserved = 5
Expected Available = 15
```

### Case 2

```text
Physical = 5
Reserved = 5
Expected Available = 0
```

### Case 3

```text
Reservation exceeds available
```

Expected:

```text
Rejected
No negative availability
No partial reservation
```

### Concurrency

Two customers attempt to reserve the last 1 kg simultaneously.

Expected:

```text
One reservation succeeds.
Other reservation fails safely.
```

No negative inventory.

---

# 9.4 ONLINE BOOKING ELIGIBILITY

Test distinction between:

```text
Physically available
```

and:

```text
Online-bookable
```

A fish may be physically present but unavailable for online booking.

The public website/customer app must follow the approved online-booking eligibility state.

---

# 9.5 FRESHNESS ENGINE

Test:

- freshness display;
- configured freshness state;
- expired freshness;
- missing freshness data;
- public display;
- customer display;
- admin configuration.

The same authoritative freshness value must be represented consistently.

---

# 9.6 DISCOUNT ENGINE

Test:

- active discount;
- inactive discount;
- future discount;
- expired discount;
- fish-specific discount;
- category discount where approved;
- calculation rounding;
- discount visibility on public website;
- discount visibility in customer app.

Test that an expired discount cannot reduce a new transaction.

---

# 9.7 SUBSCRIPTION ENGINE

Current plans include:

```text
Type 1:
₹2,000
2 kg/week

Type 2:
₹6,000
3 kg/week
```

Test:

- purchase;
- activation;
- valid credit;
- additional credit;
- weekly allowance;
- credit consumption;
- insufficient credit;
- exhaustion;
- restoration/refund;
- expiration;
- renewal;
- concurrent consumption.

Critical concurrency:

```text
Credit = 1 kg

Customer/worker performs two 1 kg operations simultaneously.
```

Expected:

```text
Only one succeeds.
```

No negative credit.

---

# 9.8 CART ENGINE

The cart is limited to fish that are eligible for online booking.

Test:

- add eligible fish;
- add unavailable fish;
- add online-booking-disabled fish;
- quantity increase;
- quantity decrease;
- remove;
- stale cart;
- price change;
- inventory change;
- discount change.

If a fish becomes unavailable before checkout:

```text
Checkout must revalidate.
```

---

# 9.9 CHECKOUT ENGINE

Test:

- valid cart;
- empty cart;
- stale cart;
- changed price;
- changed inventory;
- expired discount;
- invalid subscription state;
- payment initiation;
- payment failure;
- payment unknown;
- duplicate submission.

No checkout should rely only on values cached in the client.

---

# 9.10 BOOKING ENGINE

Test state transitions.

Conceptual:

```text
BOOKING_CREATED
      ↓
QR_GENERATED
      ↓
WORKER_RETRIEVES
      ↓
ORDER_COMPLETED
      ↓
QR_INVALIDATED
      ↓
ARCHIVED
```

Test:

- valid creation;
- invalid creation;
- expiry;
- cancellation;
- worker retrieval;
- completion;
- duplicate completion;
- invalid QR;
- already-completed QR;
- archived booking access.

---

# 9.11 QR ENGINE

Test:

- QR generation;
- valid scan;
- invalid scan;
- expired scan;
- already-used scan;
- duplicate scan;
- wrong booking;
- wrong worker context;
- post-completion scan.

A completed QR must not complete another order.

---

# 9.12 PHYSICAL BILL ENGINE

Test:

- valid bill;
- bill with multiple fish;
- bill with quantity;
- bill with total;
- missing field;
- unreadable bill;
- duplicate bill;
- already processed bill.

---

# 9.13 AI BILL EXTRACTION

AI extraction is not authoritative.

Test:

```text
Image
 ↓
AI extraction
 ↓
Validation
 ↓
Review/correction
 ↓
Transaction
```

Test:

- correct extraction;
- wrong fish;
- wrong quantity;
- wrong price;
- wrong total;
- missing Bill ID;
- blurry image;
- rotated image;
- unsupported image;
- timeout;
- provider outage;
- partial extraction.

Expected:

```text
AI error never directly causes financial/inventory mutation.
```

---

# 9.14 TRANSACTION ENGINE

Test:

- successful transaction;
- failed transaction;
- payment pending;
- payment unknown;
- physical transaction;
- online transaction;
- duplicate transaction;
- refund;
- restoration;
- audit record;
- historical data.

A transaction must only become successful after authoritative confirmation.

---

# 9.15 TV EVENT ENGINE

The TV is a projection surface, not a business authority.

Successful transaction flow:

```text
Transaction committed
        ↓
Committed event
        ↓
TV projection
        ↓
Customer name
Paid amount
Transaction details
        ↓
Bell / notification sound
```

Test:

- successful transaction;
- failed transaction;
- duplicate event;
- delayed event;
- TV offline;
- TV reconnect;
- sound enabled;
- sound unavailable;
- multiple rapid transactions.

Only successful committed transactions may trigger the success projection.

---

# 9.16 NOTIFICATION ENGINE

Test:

- event creation;
- recipient resolution;
- valid device;
- invalid device;
- provider failure;
- retry;
- duplicate notification event;
- multiple devices.

Notification failure must not roll back a successful business transaction.

---

# 9.17 GPS / JOURNEY ENGINE

Test:

- journey creation;
- location received;
- stale location;
- customer publication enabled;
- customer publication disabled;
- arrival;
- post-arrival closure;
- provider unavailable;
- reconnect.

Admin GPS access and customer GPS publication must be tested separately.

---

# 10. API TESTING

Every API endpoint must be tested for:

- valid request;
- invalid request;
- missing required field;
- invalid field type;
- invalid value;
- unauthenticated request;
- unauthorized role;
- nonexistent resource;
- stale resource;
- duplicate request;
- concurrency;
- server error;
- provider error where applicable.

---

# 11. API RESPONSE CONTRACT

Successful responses must match the API contract.

Errors must use stable machine-readable error codes.

Frontend must not branch on human-readable error text.

Test:

```text
Same error code
→ consistent UI behavior
```

across all clients.

---

# 12. DATABASE INTEGRITY TESTING

Verify:

- primary keys;
- foreign keys;
- unique constraints;
- nullability;
- indexes;
- transaction boundaries;
- historical snapshots;
- audit records;
- idempotency keys;
- provider references.

Test rollback:

```text
Mutation A succeeds
Mutation B fails
```

Expected:

```text
Atomic operation rolls back where defined.
```

No half-completed business state.

---

# 13. ATOMICITY TESTING

For critical operations:

```text
Validate
+
Reserve
+
Persist
+
Emit committed event
```

must follow the approved transaction boundary.

Test forced failure between stages.

Expected:

```text
No inconsistent business state.
```

---

# 14. IDEMPOTENCY TESTING

Critical operations must be safe against duplicate requests.

Test duplicate:

- booking request;
- payment callback;
- QR completion;
- transaction finalization;
- subscription consumption;
- refund;
- notification event;
- TV event.

Example:

```text
POST /booking
Idempotency-Key: ABC123

repeat request 10 times
```

Expected:

```text
One booking.
```

Not ten bookings.

---

# 15. CONCURRENCY TESTING

# 15.1 Last Inventory Unit

Two users attempt to book the last quantity.

Expected:

```text
one success
one conflict/failure
```

# 15.2 Subscription Credit

Two requests consume the same final credit.

Expected:

```text
one success
one safe rejection
```

# 15.3 Double Worker Completion

Two workers scan the same valid QR.

Expected:

```text
one completion
one conflict
```

# 15.4 Admin Inventory Update During Booking

Test simultaneous:

```text
booking reservation
+
admin inventory mutation
```

Expected result must follow the database/domain-engine concurrency rules.

# 15.5 Price/Discount Change During Checkout

Client begins checkout.

Admin changes discount.

Expected:

```text
server revalidation
```

No stale-price success.

---

# 16. PUBLIC WEBSITE TESTING

The public website is a public acquisition and catalogue surface.

Test:

- homepage;
- today's fish;
- categories;
- fish availability;
- online-bookable status;
- discounts;
- subscription information;
- about;
- contact;
- registration/app CTA;
- responsive behavior.

The public website must not expose:

- private inventory details;
- customer data;
- worker data;
- internal operational controls;
- payment credentials;
- private admin data.

---

# 17. ADMIN-CONTROLLED PUBLIC CONTENT

Because the landing website is connected to admin-controlled catalogue/discount state, test:

```text
Admin changes fish availability
        ↓
Backend state updates
        ↓
Public website reflects state
```

and:

```text
Admin activates discount
        ↓
Public website shows discount
```

Also test the reverse:

```text
Admin disables fish
        ↓
Public website shows unavailable
```

The website must not continue presenting unavailable fish as bookable.

---

# 18. CUSTOMER REACT NATIVE APP TESTING

The Customer App includes:

- authentication;
- home;
- fish marketplace;
- fish details;
- cart;
- booking;
- checkout;
- QR ticket;
- subscription;
- wallet/credit where applicable;
- notifications;
- booking history;
- profile;
- settings;
- tracking where applicable.

Each screen must be tested across:

```text
Default
Loading
Empty
Success
Validation Error
Business Error
Network Error
Permission Error
Conflict
Disabled
Maintenance where relevant
```

---

# 19. CUSTOMER APP AUTHENTICATION TESTS

Test:

- first login;
- OTP success;
- OTP failure;
- expired OTP;
- rate limit;
- logout;
- session expiration;
- token refresh;
- app restart;
- background/resume;
- unauthorized API access.

---

# 20. CUSTOMER CATALOGUE TESTS

Test:

- category filtering;
- search;
- fish details;
- available fish;
- unavailable fish;
- online-bookable fish;
- discounted fish;
- stale catalogue data;
- refresh.

A fish that is not online-bookable must not become bookable merely because the client has cached it.

---

# 21. CUSTOMER CART TESTS

Test:

- add;
- remove;
- quantity;
- empty cart;
- stale inventory;
- stale price;
- expired discount;
- online-booking eligibility;
- app restart;
- network interruption.

---

# 22. CUSTOMER CHECKOUT TESTS

Test complete successful journey:

```text
Catalogue
→ Fish
→ Cart
→ Checkout
→ Payment
→ Confirmation
→ Booking
→ QR
```

Verify database state after each critical step.

---

# 23. CUSTOMER PAYMENT UNCERTAINTY TEST

Simulate:

```text
Payment request
        ↓
Provider processes payment
        ↓
Network disconnects
```

Expected:

```text
UI shows payment status as uncertain/pending where applicable.
```

It must not:

```text
declare failure
OR
create duplicate payment
```

without authoritative status.

---

# 24. CUSTOMER QR TESTING

Test:

- display;
- refresh;
- expiry;
- completed state;
- cancelled state;
- offline display behavior;
- invalid state;
- duplicate worker scan.

---

# 25. CUSTOMER TRACKING TESTING

Test:

- journey not started;
- journey started;
- customer publication enabled;
- location updates;
- stale location;
- arrival;
- tracking closure;
- provider unavailable.

The customer must never see a stale GPS value presented as current.

---

# 26. WORKER PORTAL TESTING

Worker workflows include:

- login;
- QR scanner;
- booking retrieval;
- booking details;
- bill scanning;
- AI extraction;
- correction;
- payment/transaction workflow;
- completion;
- completed history where applicable.

---

# 27. WORKER QR TESTS

Test:

- valid QR;
- invalid QR;
- expired QR;
- already-completed QR;
- cancelled booking;
- wrong store;
- duplicate scan;
- concurrent scan.

Expected error must be actionable.

---

# 28. WORKER BILL SCANNING TESTS

Test:

```text
Scan bill
→ upload
→ extraction
→ review
→ correction
→ payment
→ transaction
→ completion
```

Every transition must be authoritative.

---

# 29. WORKER OPERATIONAL SPEED TEST

Because the Worker Portal is used during physical-store operations, test:

- minimal unnecessary navigation;
- fast QR scanning;
- fast booking retrieval;
- clear primary action;
- clear failure state;
- duplicate prevention;
- no ambiguous success state.

Performance must be evaluated under realistic store-network conditions.

---

# 30. ADMIN PORTAL TESTING

Admin responsibilities include:

- dashboard;
- inventory;
- bookings;
- transactions;
- truck/GPS;
- fish management;
- categories;
- discounts;
- subscriptions;
- customers;
- workers;
- notifications;
- website content;
- business settings;
- reports;
- audit;
- security;
- exceptions.

The Admin Portal must not duplicate customer/worker workflows.

---

# 31. ADMIN INVENTORY TESTS

Test:

- view inventory;
- update physical quantity;
- reservation effect;
- availability calculation;
- fish unavailable state;
- low stock;
- concurrent booking;
- historical transaction preservation;
- audit.

Every material inventory mutation must be validated, authorized and traceable.

---

# 32. ADMIN DISCOUNT TESTS

Test:

- create;
- activate;
- deactivate;
- schedule;
- expiry;
- fish/category scope;
- public website propagation;
- customer app propagation;
- checkout calculation.

---

# 33. ADMIN SUBSCRIPTION TESTS

Test:

- create plan;
- edit plan;
- activate/deactivate;
- customer subscription visibility;
- credit;
- usage;
- audit;
- historical preservation.

---

# 34. ADMIN CUSTOMER TESTS

Test:

- search;
- view;
- filters;
- subscription state;
- booking history;
- transaction history where authorized;
- account status;
- privacy boundaries.

---

# 35. ADMIN BOOKING TESTS

Test:

- online bookings;
- booking status;
- expiry;
- cancellation;
- filtering;
- search;
- detail;
- historical integrity.

Admin must not silently alter a completed financial transaction.

---

# 36. ADMIN TRANSACTION TESTS

Test:

- online transaction;
- physical transaction;
- successful;
- failed;
- pending;
- refunded/restored;
- detail;
- audit;
- historical immutability.

---

# 37. ADMIN GPS TESTS

Test:

- live GPS;
- stale GPS;
- journey state;
- customer publication toggle;
- arrival;
- post-arrival behavior;
- provider outage;
- audit.

---

# 38. ADMIN AUDIT TESTS

For every high-impact action verify:

```text
Who
What
When
Before
After
Why/reason where required
```

Test that normal users cannot modify audit records.

---

# 39. SHOP TV TESTING

The Shop TV is a projection surface.

Test:

- successful transaction display;
- customer name;
- paid amount;
- transaction information;
- bill number where specified;
- time;
- fish/quantity where specified;
- bell/notification sound;
- queue/order of events;
- duplicate event prevention;
- reconnect;
- offline;
- stale display.

---

# 40. TV SUCCESS EVENT TEST

Required:

```text
Transaction commits
      ↓
Success event published
      ↓
TV receives event
      ↓
Display updates
      ↓
Bell/notification sound
```

Invalid:

```text
Payment initiated
      ↓
TV success
```

Invalid:

```text
Payment failed
      ↓
TV success
```

---

# 41. TV DUPLICATE TEST

Send the same transaction event repeatedly.

Expected:

```text
One visible transaction event.
```

No repeated sound for the same event unless explicitly configured.

---

# 42. REALTIME TESTING

Test:

- event delivered;
- event delayed;
- event duplicated;
- event out of order;
- connection lost;
- connection restored;
- client reconnect;
- stale state;
- missed event recovery.

Where a missed event affects critical display state, the client must rehydrate from authoritative backend state.

---

# 43. NETWORK FAILURE TESTING

Test network loss at:

- application launch;
- catalogue loading;
- cart;
- checkout;
- payment;
- booking;
- QR;
- worker scanning;
- admin mutation;
- TV;
- GPS;
- notifications.

For every operation answer:

```text
Was the result known?
Was the request sent?
Did the server commit?
Can it be safely retried?
What does the user see?
```

---

# 44. MOBILE NETWORK TRANSITIONS

React Native app must be tested through:

```text
Wi-Fi
→ mobile data
→ no network
→ Wi-Fi
```

and:

```text
active
→ background
→ network changes
→ resume
```

The app must revalidate stale critical state.

---

# 45. 404 TESTING

Every web portal must have an intentional 404 state.

Test:

- unknown route;
- deleted route;
- malformed route;
- unauthorized route that should instead be 403;
- refresh on 404;
- navigation back.

404 must not expose stack traces or internal route information.

---

# 46. 403 TESTING

Test:

- authenticated but unauthorized user;
- worker accessing admin;
- customer accessing worker;
- admin-only route;
- hidden navigation;
- direct URL/API attempt.

Frontend hiding is insufficient.

Backend must enforce authorization.

---

# 47. 500 TESTING

Simulate unexpected server errors.

Expected:

- safe user message;
- retry where appropriate;
- request/correlation ID where supported;
- no stack trace;
- no secret exposure;
- server logs contain diagnostic information.

---

# 48. MAINTENANCE MODE TESTING

Enable maintenance mode.

Expected:

```text
User sees maintenance state
Critical mutations blocked
No false success
```

Verify appropriate public/customer/worker/admin behavior.

---

# 49. EMPTY STATE TESTING

Test:

- no fish;
- no bookings;
- no notifications;
- no transactions;
- no customers;
- no workers;
- no GPS journey;
- no reports;
- no search results.

Empty is not an error.

---

# 50. LOADING STATE TESTING

Test:

- initial page load;
- API delay;
- slow network;
- long-running operation;
- background refresh.

Avoid:

- frozen UI;
- duplicate spinners;
- impossible interactions;
- layout jumps where avoidable.

---

# 51. VALIDATION ERROR TESTING

Test every required field.

Validation must occur:

```text
Client
+
Backend
```

Client validation improves UX.

Backend validation preserves security and business correctness.

---

# 52. BUSINESS ERROR TESTING

Examples:

- insufficient inventory;
- unavailable fish;
- expired booking;
- exhausted subscription credit;
- invalid QR;
- duplicate transaction;
- payment amount mismatch;
- unauthorized action;
- stale resource.

Business errors must use stable machine-readable codes.

---

# 53. CONFLICT UI TESTING

When two actors modify the same resource:

```text
User A has stale data
User B updates resource
User A submits
```

Expected:

```text
Conflict response
+
safe UI
+
re-fetch option
```

Do not silently overwrite newer state.

---

# 54. PAYMENT INTEGRATION TESTING

Razorpay scenarios:

- success;
- failure;
- cancellation;
- timeout;
- invalid signature;
- duplicate callback;
- delayed callback;
- amount mismatch;
- provider outage;
- refund;
- duplicate refund.

Verify that provider failures cannot corrupt unrelated business state.

---

# 55. FIREBASE AUTH TESTING

Test:

- OTP success;
- invalid OTP;
- expired OTP;
- rate limit;
- provider unavailable;
- token expiry;
- token refresh;
- logout;
- multiple sessions where supported.

---

# 56. FIREBASE NOTIFICATION TESTING

Test:

- valid device;
- invalid token;
- multiple devices;
- provider failure;
- retry;
- duplicate event;
- notification content;
- deep-link behavior where implemented.

---

# 57. AI/OCR INTEGRATION TESTING

Test representative real-world bills:

- clear;
- low light;
- angled;
- folded;
- handwritten where applicable;
- partial;
- multiple items;
- long bill;
- unusual spacing;
- wrong totals.

The extraction layer must remain replaceable.

---

# 58. ONELAP INTEGRATION TESTING

Test:

- valid location;
- invalid response;
- stale location;
- timeout;
- provider outage;
- reconnect;
- wrong tracker;
- missing tracker;
- arrival;
- customer publication;
- customer closure.

Do not invent provider protocol behavior that is not documented.

---

# 59. FUTURE SI-810/POS TESTING

Direct POS/SI-810 integration is future scope.

When implemented, tests must include:

- connection;
- authentication;
- device discovery;
- bill received;
- weight received;
- duplicate bill;
- duplicate transaction;
- invalid payload;
- malformed payload;
- network interruption;
- device restart;
- provider retry;
- mapping to PondFish transaction;
- manual fallback if approved.

The future adapter must enter the existing transaction engine.

---

# 60. SECURITY TESTING

Test:

- authentication bypass;
- authorization bypass;
- IDOR;
- insecure direct object access;
- SQL injection;
- XSS;
- CSRF where applicable;
- request tampering;
- payment amount tampering;
- booking ID tampering;
- customer ID tampering;
- role manipulation;
- token manipulation;
- replay;
- brute force;
- rate limits;
- secret exposure;
- sensitive error leakage.

---

# 61. PAYMENT SECURITY TESTING

Attempt to modify:

```text
amount
currency
customer
booking
subscription
payment reference
```

from the client.

Expected:

```text
Server rejects tampered values.
```

---

# 62. ROLE/PERMISSION MATRIX TESTING

Minimum roles:

```text
Public
Customer
Worker
Admin
```

Test each protected resource with every role.

Example:

| Resource | Public | Customer | Worker | Admin |
|---|---:|---:|---:|---:|
| Public catalogue | ✓ | ✓ | ✓ | ✓ |
| Customer booking | — | ✓ | — | — |
| Worker completion | — | — | ✓ | — |
| Admin inventory mutation | — | — | — | ✓ |
| Admin audit | — | — | — | ✓ |
| Customer private data | — | Own | — | Authorized |
| Worker private data | — | — | Own/Allowed | Authorized |

Exact permission scope must follow the locked API/roles specification.

---

# 63. DATA PRIVACY TESTING

Verify that:

- public APIs do not return private data;
- customers see only permitted customer data;
- workers see only operationally necessary data;
- admins see data according to role;
- logs do not leak sensitive information;
- TV does not expose unnecessary private data.

---

# 64. ACCESSIBILITY TESTING

Test web and mobile interfaces for:

- text readability;
- contrast;
- touch target size;
- keyboard navigation where applicable;
- focus state;
- semantic labels;
- screen-reader labels;
- form error association;
- accessible loading state;
- accessible status messages;
- motion reduction where applicable.

Critical status must not rely on color alone.

---

# 65. RESPONSIVE TESTING

Web surfaces:

```text
Desktop
Tablet
Mobile browser where applicable
```

Test:

- navigation;
- tables;
- cards;
- forms;
- modals;
- drawers;
- charts;
- error states;
- 404;
- network state.

The Customer Portal is a React Native application and must be tested as a native mobile experience rather than assuming browser responsiveness is sufficient.

---

# 66. VISUAL REGRESSION TESTING

Visual regression should cover approved design-system states.

Compare:

- typography;
- spacing;
- card structure;
- buttons;
- inputs;
- badges;
- tables;
- navigation;
- modal;
- empty state;
- error state;
- loading state;
- 404;
- network error;
- maintenance.

The design system defines the visual language as:

```text
Fresh
Trustworthy
Modern
Premium
Local
```

QA must ensure implementation does not drift into an unrelated generic SaaS appearance.

---

# 67. PERFORMANCE TESTING

Measure:

- first meaningful render;
- API response time;
- catalogue loading;
- booking response;
- checkout response;
- QR retrieval;
- admin dashboard;
- transaction finalization;
- TV event latency;
- GPS update latency;
- notification processing.

Performance targets must be finalized in the deployment/performance baseline if not already contractually fixed.

Do not invent hard numeric acceptance thresholds where the source documents have not locked them.

---

# 68. LOAD TESTING

Test expected MVP operational loads and agreed future targets.

Focus on:

- catalogue reads;
- booking creation;
- inventory reads;
- checkout;
- payment callback processing;
- transaction creation;
- TV events;
- admin dashboard queries.

Load tests must verify correctness as well as throughput.

---

# 69. STRESS TESTING

Push critical systems beyond expected load.

Observe:

- database contention;
- connection pool exhaustion;
- API queueing;
- event delay;
- notification backlog;
- CPU/memory;
- error rate;
- recovery behavior.

No stress test should result in silent financial corruption.

---

# 70. TV EVENT LATENCY TEST

For a successful transaction:

```text
Transaction commit timestamp
        ↓
TV display timestamp
```

Measure the event-to-display delay.

The actual accepted latency target should be finalized by product/engineering before performance sign-off.

---

# 71. GPS LATENCY TEST

Measure:

```text
Provider timestamp
        ↓
Backend receipt
        ↓
Customer/Admin visibility
```

Also verify stale-location handling.

---

# 72. NOTIFICATION LATENCY TEST

Measure:

```text
Business event
        ↓
Notification creation
        ↓
Provider submission
        ↓
Device receipt
```

Provider delivery time must not be treated as the business transaction time.

---

# 73. RECOVERY TESTING

# 73.1 Backend Restart

During:

- catalogue read;
- booking;
- transaction;
- TV event;
- GPS update.

Expected:

```text
Committed state survives.
```

# 73.2 Database Restart

Verify:

- committed transactions preserved;
- idempotency records preserved;
- audit records preserved;
- no duplicate side effects after recovery.

# 73.3 Realtime Reconnect

Client reconnects and rehydrates authoritative state.

# 73.4 Provider Recovery

After external provider outage:

```text
provider recovers
→ integration recovers
→ system resumes safely
```

No duplicate business mutation.

---

# 74. MOBILE APP RECOVERY TESTING

Test:

```text
App killed during:
- login
- checkout
- payment
- booking
- QR
- tracking
```

On restart:

```text
retrieve authoritative state
```

Do not assume the previous local UI state represents backend truth.

---

# 75. BACKGROUND/RESUME TESTING

Test:

```text
App foreground
→ background
→ booking changes elsewhere
→ foreground
```

Expected:

```text
critical data revalidated
```

---

# 76. REGRESSION TEST STRATEGY

Every release should execute:

## Smoke

- login;
- catalogue;
- booking;
- payment;
- worker completion;
- transaction;
- TV display;
- admin inventory.

## Core Regression

- subscriptions;
- discounts;
- inventory;
- QR;
- notifications;
- GPS;
- audit.

## Full Regression

- all portal pages;
- all critical states;
- all integrations;
- security;
- accessibility;
- performance;
- recovery.

---

# 77. END-TO-END GOLDEN PATH

## Online Customer Journey

```text
Public Website
      ↓
Customer App
      ↓
Login
      ↓
Browse Fish
      ↓
Select Bookable Fish
      ↓
Cart
      ↓
Checkout
      ↓
Payment
      ↓
Booking
      ↓
QR
      ↓
Worker Scan
      ↓
Booking Retrieval
      ↓
Completion
      ↓
Transaction
      ↓
Committed Event
      ↓
TV Display + Bell
```

QA must verify the complete chain.

---

# 78. END-TO-END SUBSCRIPTION JOURNEY

```text
Customer
 ↓
Select Subscription
 ↓
Payment
 ↓
Subscription Credit
 ↓
Book Fish
 ↓
Credit Consumption
 ↓
Transaction
```

Verify credit and transaction state at every authoritative boundary.

---

# 79. END-TO-END PHYSICAL BILL JOURNEY

```text
Fish weighed
 ↓
Bill generated
 ↓
Bill scanned
 ↓
AI extraction
 ↓
Review
 ↓
Payment
 ↓
Transaction
 ↓
TV event
```

AI extraction must never bypass validation.

---

# 80. END-TO-END ADMIN → PUBLIC WEBSITE

```text
Admin
 ↓
Fish/discount configuration
 ↓
Backend
 ↓
Public Website
```

Verify correct propagation and cache invalidation/revalidation.

---

# 81. END-TO-END ADMIN → CUSTOMER APP

```text
Admin inventory/discount change
 ↓
Backend
 ↓
Customer app refresh/revalidation
```

Verify that stale cached data does not allow invalid booking.

---

# 82. END-TO-END JOURNEY

```text
Admin creates/starts journey
 ↓
OneLap
 ↓
Backend
 ↓
Customer tracking publication
 ↓
Customer sees location
 ↓
Arrival
 ↓
Customer tracking closes
```

Verify Admin remains authoritative for publication controls.

---

# 83. TESTING ERROR TAXONOMY

QA must cover the shared error classes:

```text
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
NOT_FOUND
CONFLICT
BUSINESS_RULE_ERROR
PAYMENT_ERROR
PAYMENT_UNKNOWN
INTEGRATION_ERROR
NETWORK_ERROR
TIMEOUT
RATE_LIMITED
SERVER_ERROR
MAINTENANCE
STALE_DATA
```

Exact error codes must come from the API contract.

Do not invent production error codes casually during frontend implementation.

---

# 84. ERROR UI ACCEPTANCE

Every error state should answer:

```text
What happened?
Is the result known?
Can I retry?
What should I do next?
```

For operational users:

```text
Did the previous action complete?
```

For administrators:

```text
What business state exists now?
Is action required?
```

---

# 85. TEST CASE TEMPLATE

Every detailed test case should contain:

```text
Test ID
Title
Requirement Reference
Preconditions
Test Data
Steps
Expected Result
Actual Result
Priority
Severity
Environment
Evidence
Status
```

---

# 86. TEST PRIORITY

## P0 — Critical

Examples:

- payment corruption;
- duplicate transaction;
- negative inventory;
- negative subscription credit;
- unauthorized financial action;
- false successful transaction;
- duplicate refund;
- historical financial corruption.

P0 failures block release.

## P1 — High

Examples:

- booking failure;
- QR completion failure;
- TV success event failure;
- major admin mutation failure;
- authentication failure.

## P2 — Medium

Examples:

- secondary filtering;
- notification display;
- reporting issues;
- non-critical UI behavior.

## P3 — Low

Examples:

- minor visual defects;
- non-blocking copy issues.

---

# 87. DEFECT SEVERITY

| Severity | Meaning |
|---|---|
| Critical | Financial/security/data corruption or system unusable |
| High | Major workflow broken |
| Medium | Important feature degraded |
| Low | Minor defect |
| Cosmetic | Visual-only issue |

---

# 88. RELEASE BLOCKERS

Release must be blocked for:

- unauthorized financial mutation;
- duplicate successful transaction;
- negative inventory caused by race;
- negative subscription credit;
- false payment success;
- false transaction success;
- broken authentication;
- critical security vulnerability;
- data corruption;
- audit failure on required high-impact action;
- TV showing uncommitted successful transaction;
- production migration failure.

---

# 89. ACCEPTANCE CRITERIA

A feature is QA-complete only when:

- functional tests pass;
- business rules pass;
- API tests pass;
- database integrity passes;
- permission tests pass;
- error states pass;
- loading/empty/success states pass;
- concurrency tests pass where applicable;
- idempotency tests pass where applicable;
- integration tests pass;
- responsive/mobile tests pass;
- accessibility checks pass for applicable surfaces;
- security checks pass;
- performance checks meet approved targets;
- regression passes;
- acceptance criteria are signed off.

---

# 90. CLIENT UAT STRATEGY

Client UAT should focus on real business journeys:

1. View available fish.
2. View discount.
3. Register/login.
4. Purchase/use subscription.
5. Book fish.
6. Complete payment.
7. Generate QR.
8. Worker scans.
9. Complete order.
10. Verify TV success display and bell.
11. Admin updates inventory.
12. Verify public/customer availability.
13. Start truck journey.
14. Publish tracking.
15. Verify customer tracking.
16. Complete arrival.
17. Verify customer tracking closure.
18. Review reports/audit.

---

# 91. UAT EVIDENCE

For each UAT journey capture:

- test ID;
- date;
- environment;
- actor;
- screenshots/video where appropriate;
- transaction/booking references;
- expected result;
- actual result;
- client approval.

---

# 92. QA TRACEABILITY

Each major requirement must map to:

```text
Requirement
   ↓
Business Rule
   ↓
API/Engine
   ↓
UI
   ↓
Test Case
   ↓
Evidence
   ↓
Acceptance
```

No critical business rule should exist without at least one executable test.

---

# 93. CROSS-PORTAL TRACEABILITY

For shared business events:

```text
Admin Change
→ Backend
→ Public Website
→ Customer App
```

and:

```text
Customer Booking
→ Backend
→ Worker
→ Transaction
→ TV
→ Admin
```

QA must test both the initiating surface and affected surfaces.

---

# 94. DATA CONSISTENCY TESTING

For important records compare:

```text
UI
vs
API
vs
Database
```

Examples:

- inventory;
- booking status;
- subscription credit;
- payment status;
- transaction status;
- GPS publication state.

UI must never display a business state that contradicts authoritative backend state after refresh/revalidation.

---

# 95. CACHE / STALE DATA TESTING

Test:

```text
Client caches fish availability
Admin disables fish
Customer attempts booking
```

Expected:

```text
Backend rejects stale booking if no longer eligible.
UI receives authoritative state.
```

The stale client must not override newer backend state.

---

# 96. SEARCH/FILTER TESTING

For all relevant portals:

- exact match;
- partial match;
- case differences;
- empty result;
- special characters;
- pagination;
- sorting;
- filter combination;
- reset filters;
- stale search;
- unauthorized records.

---

# 97. PAGINATION TESTING

Test:

- first page;
- middle page;
- last page;
- empty page;
- deleted record between pages;
- changing filters;
- changing sort;
- large dataset.

---

# 98. REPORTING TESTING

Verify:

- totals;
- filters;
- date ranges;
- transaction inclusion;
- failed transaction exclusion where required;
- export consistency;
- permission boundaries;
- historical integrity.

Exports must not include unauthorized data.

---

# 99. AUDIT TESTING

Verify that audit records are generated for required high-impact actions.

Test:

```text
Action
→ audit event
```

and failure:

```text
Action rejected
→ appropriate audit behavior according to audit policy
```

Audit records must remain protected from ordinary mutation.

---

# 100. NOTIFICATION TESTING

Verify event-to-notification mapping:

```text
Business Event
      ↓
Notification Engine
      ↓
Recipient
      ↓
Provider
```

A notification must not independently create business state.

---

# 101. INTEGRATION RECONCILIATION TESTING

## Razorpay

Create controlled mismatch:

```text
Provider status ≠ PondFish status
```

Expected:

```text
Reconciliation identifies discrepancy.
```

It must not silently create an unrelated transaction.

## OneLap

Provider stale state should be visible as stale rather than silently treated as current.

---

# 102. FAILURE INJECTION

QA should use controlled failure injection for:

- database failure;
- API timeout;
- provider timeout;
- malformed provider response;
- network loss;
- realtime disconnect;
- notification failure;
- AI failure;
- GPS failure.

Every failure injection must have a defined recovery expectation.

---

# 103. OBSERVABILITY TESTING

When an important failure occurs, verify that engineering can correlate:

```text
User action
↓
Request ID
↓
API
↓
Domain engine
↓
Database
↓
Integration
↓
Event
```

Sensitive values must not be exposed in logs.

---

# 104. LOGGING TESTS

Verify that logs contain enough information for diagnosis:

- timestamp;
- operation;
- request/correlation ID;
- actor context where appropriate;
- business reference;
- provider reference where applicable;
- result;
- error code.

Verify absence of:

- secrets;
- OTP;
- private credentials;
- unnecessary sensitive data.

---

# 105. SECURITY REGRESSION

Security tests must be rerun after:

- auth changes;
- role changes;
- payment changes;
- API changes;
- database changes;
- integration changes;
- major frontend changes.

---

# 106. DATABASE MIGRATION TESTING

Before deployment:

1. backup/rollback strategy validated;
2. migration runs successfully;
3. existing records preserved;
4. constraints valid;
5. indexes valid;
6. application compatibility verified;
7. rollback tested where applicable.

---

# 107. DEPLOYMENT SMOKE TEST

After deployment:

```text
Health check
↓
Authentication
↓
Catalogue
↓
Availability
↓
Booking
↓
Payment test/sandbox where applicable
↓
Worker workflow
↓
Transaction
↓
TV event
↓
Admin
```

Only approved non-destructive production tests should be used in production.

---

# 108. ROLLBACK TESTING

Verify:

- application rollback;
- database rollback strategy;
- configuration rollback;
- integration credential rollback;
- feature flag rollback where implemented.

Never assume application rollback can reverse already committed financial state.

---

# 109. AI CODING-AGENT QA RULES

## Rule 01

Every new business mutation requires tests.

## Rule 02

Never test only the happy path.

## Rule 03

For every critical mutation include:

```text
success
failure
duplicate
concurrency
network uncertainty
authorization
```

## Rule 04

Never use frontend-only tests to prove backend business correctness.

## Rule 05

Never mock away the entire business engine when testing critical workflows.

## Rule 06

Integration mocks must also have real integration/sandbox coverage where available.

## Rule 07

Never change an existing test merely to make incorrect implementation pass.

## Rule 08

When a requirement changes, update:

```text
requirement
→ implementation
→ tests
```

## Rule 09

Do not invent a business rule to resolve a failing test.

## Rule 10

Test database invariants, not only API responses.

## Rule 11

Critical operations must have idempotency/concurrency tests.

## Rule 12

Unknown payment state must never be tested as automatic failure.

## Rule 13

TV success must only follow committed successful transaction state.

## Rule 14

AI extraction must never be treated as financial authority.

## Rule 15

Future POS/SI-810 integration must reuse the transaction engine.

## Rule 16

Do not create an offline transaction queue unless it becomes an explicitly approved requirement.

## Rule 17

Do not skip 404, 403, 500, network, maintenance, empty, loading and conflict states.

## Rule 18

When an API error code is missing from the contract, stop and identify the contract change rather than inventing a permanent code.

---

# 110. QA CHECKLIST — CORE BUSINESS

- [ ] Authentication
- [ ] Catalogue
- [ ] Categories
- [ ] Inventory
- [ ] Availability
- [ ] Freshness
- [ ] Discounts
- [ ] Subscription
- [ ] Cart
- [ ] Checkout
- [ ] Booking
- [ ] QR
- [ ] Physical bill
- [ ] AI extraction
- [ ] Payment
- [ ] Transaction
- [ ] Refund/restoration
- [ ] GPS
- [ ] Notifications
- [ ] Realtime
- [ ] TV
- [ ] Audit
- [ ] Reports

---

# 111. QA CHECKLIST — SYSTEM STATES

- [ ] Loading
- [ ] Empty
- [ ] Success
- [ ] Validation error
- [ ] Business error
- [ ] Network error
- [ ] Authentication error
- [ ] Authorization error
- [ ] 404
- [ ] 403
- [ ] 500
- [ ] Conflict
- [ ] Stale
- [ ] Disabled
- [ ] Maintenance
- [ ] Provider failure
- [ ] Unknown payment state
- [ ] Realtime disconnected

---

# 112. QA CHECKLIST — SECURITY

- [ ] Authentication
- [ ] Authorization
- [ ] Role isolation
- [ ] IDOR
- [ ] Input validation
- [ ] Injection
- [ ] XSS
- [ ] CSRF where applicable
- [ ] Rate limiting
- [ ] Replay
- [ ] Secret handling
- [ ] Sensitive logging
- [ ] Payment tampering
- [ ] Data privacy

---

# 113. QA CHECKLIST — MOBILE

- [ ] Android
- [ ] iOS
- [ ] authentication
- [ ] background/resume
- [ ] network transitions
- [ ] permissions
- [ ] notifications
- [ ] camera/bill scan
- [ ] QR display
- [ ] tracking
- [ ] deep links where applicable
- [ ] accessibility
- [ ] device-size coverage

---

# 114. QA CHECKLIST — WEB

- [ ] Public website
- [ ] Worker Portal
- [ ] Admin Portal
- [ ] desktop
- [ ] tablet
- [ ] mobile browser where applicable
- [ ] navigation
- [ ] forms
- [ ] tables
- [ ] filters
- [ ] 404
- [ ] 403
- [ ] 500
- [ ] network state
- [ ] maintenance
- [ ] accessibility

---

# 115. QA CHECKLIST — TV

- [ ] successful transaction
- [ ] customer name
- [ ] paid amount
- [ ] transaction details
- [ ] sound
- [ ] duplicate prevention
- [ ] reconnect
- [ ] event delay
- [ ] stale state
- [ ] display recovery

---

# 116. RELEASE READINESS CHECKLIST

Before release:

```text
[ ] Critical requirements tested
[ ] P0 defects = 0
[ ] P1 defects reviewed/approved
[ ] Payment verified
[ ] Inventory concurrency verified
[ ] Subscription concurrency verified
[ ] Booking concurrency verified
[ ] QR duplicate protection verified
[ ] TV committed-event behavior verified
[ ] Auth verified
[ ] Authorization verified
[ ] Integration failures tested
[ ] Network failures tested
[ ] Recovery tested
[ ] Security baseline passed
[ ] Accessibility baseline passed
[ ] Performance baseline passed
[ ] Regression passed
[ ] Deployment smoke passed
[ ] UAT approved
```

---

# 117. FINAL QA PRINCIPLE

PondFish QA is not complete when every button works.

It is complete when:

```text
USER ACTION
    ↓
API
    ↓
DOMAIN RULE
    ↓
DATABASE TRUTH
    ↓
COMMITTED EVENT
    ↓
OTHER SYSTEMS
    ↓
USER-VISIBLE STATE
```

all remain consistent under:

```text
success
failure
duplicate requests
concurrent requests
network interruption
provider outage
stale data
reconnect
authorization boundaries
```

The system must preserve one business truth across:

```text
Public Website
Customer React Native App
Worker Portal
Admin Portal
Shop TV
Backend
Database
External Integrations
```

The UI communicates state.

The backend owns state.

The database preserves state.

Events communicate committed state.

Integrations provide capabilities.

QA proves that these boundaries remain intact.

---

# 118. NEXT DOCUMENT

The next implementation artifact is:

```text
DEPLOYMENT / DEVOPS SPECIFICATION
```

It should convert the locked application, database, integrations, security, QA and operational requirements into:

- environments;
- infrastructure;
- deployment topology;
- CI/CD;
- secrets;
- database migrations;
- domains/DNS;
- SSL;
- monitoring;
- backups;
- rollback;
- logging;
- production configuration;
- mobile release;
- web deployment;
- TV deployment;
- disaster recovery;
- operational runbooks.

The **Master AI Coding Prompt remains the final documentation artifact**, because it must reference the locked versions of all preceding documents.

---

# DOCUMENT END
