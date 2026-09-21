# PONDFISH — MASTER AI CODING PROMPT

**Document:** PondFish Master AI Coding Prompt  
**Version:** 1.0  
**Status:** Implementation Execution Baseline  
**Scope:** Current MVP — Single Store + One Truck  
**Primary Purpose:** Instruct an AI coding agent / AI-assisted engineering environment to build the PondFish ecosystem from the approved project documentation set.  
**Primary Consumers:** AI coding agents, senior developers, frontend developers, backend developers, React Native developers, QA, DevOps and technical leads.

---

# 0. EXECUTION CONTRACT

You are the implementation agent for the **PondFish Digital Ecosystem**.

You are not being asked to invent a product.

You are being asked to **implement an already-specified product** from a controlled set of project documents.

Your job is to:

1. read the approved documentation;
2. understand the source-of-truth hierarchy;
3. build the system in dependency order;
4. preserve business truth;
5. implement the specified UI/UX;
6. implement all required states and failure paths;
7. integrate the applications through the shared backend;
8. test every critical business mutation;
9. never silently invent or change business rules;
10. produce maintainable, production-ready code.

The documentation is the specification.

The code is the implementation.

Do not treat the coding session as a product-discovery session unless a requirement is genuinely missing or contradictory.

---

# 1. PRODUCT IDENTITY

## 1.1 Product

**PondFish Digital Ecosystem**

PondFish is a fresh/live fish retail platform supporting:

- public fish discovery;
- physical-store purchases;
- online booking for selected fish;
- fish categories;
- inventory;
- freshness;
- discounts and offers;
- subscription plans;
- monetary Subscription Credit;
- weekly quantity limits;
- AI-assisted physical bill processing;
- Razorpay payments;
- worker tablet operations;
- admin operations;
- OneLap GPS tracking;
- customer-facing live tracking;
- real-time successful-transaction TV display;
- notifications;
- reporting;
- audit history.

The current MVP is:

```text
Single Store
+
One Truck
+
Customer Mobile Application
+
Public Website
+
Worker Web/Tablet Portal
+
Admin Web Portal
+
Shop Transaction TV
+
Shared Backend
+
Authoritative Relational Database
```

---

# 2. THE MOST IMPORTANT RULE

## ONE BUSINESS TRUTH

There is one PondFish business system.

The following are different interfaces over the same business system:

```text
PUBLIC WEBSITE
       |
CUSTOMER REACT NATIVE APP
       |
       v
SHARED BACKEND
       |
  +----+----+----+
  |    |    |    |
WORKER ADMIN  TV
PORTAL PORTAL DISPLAY
```

The interfaces must never become independent business systems.

The backend owns business truth.

The database owns transactional consistency.

Domain/business engines enforce rules.

Events communicate committed state changes.

Integrations provide external capabilities.

---

# 3. NON-NEGOTIABLE SOURCE-OF-TRUTH HIERARCHY

When documents appear to conflict, do not randomly choose.

Use the following authority model.

## 3.1 Business and implementation authority

```text
1. Backend / API Contract
2. Master PRD
3. Core Business Engines Specification
4. System & Technical Architecture
5. Database / ERD / Data Model
6. Integration Specification
7. Cross-System Validation / Error Specification
8. Design System / UI-UX Specification
9. Page-by-Page UI Specifications
10. Frontend / Application Architecture
11. QA / Test Specification
12. Deployment / DevOps Specification
13. This Master AI Coding Prompt
14. Implementation
```

Important:

This prompt is the **execution layer**.

It does not replace the source documents.

If a source document is more authoritative than this prompt, follow the source document.

---

# 4. APPROVED DOCUMENT SET

Before implementation begins, load and review the latest approved versions of the following documents.

## 4.1 Required documents

```text
PondFish_Master_PRD_v2.md

PondFish_System_Technical_Architecture_v1.md

PondFish_Frontend_Application_Architecture_v1.md

PondFish_API_Backend_Service_Specification_v1.md

PondFish_Core_Business_Engines_Specification_v1.md

PondFish_Complete_Design_System_UI_UX_Specification.md

PondFish_Page_By_Page_UI_Specification_Customer_React_Native_App.md

PondFish_Page_By_Page_UI_Specification_Worker_Tablet_Portal.md

PondFish_Page_By_Page_UI_Specification_Admin_Portal.md

PondFish_Page_By_Page_UI_Specification_Public_Website.md
(if present / latest approved equivalent)

PondFish_Page_By_Page_UI_Specification_TV.md
(if present / latest approved equivalent)

PondFish_Cross_System_Validation_Error_Specification_v1.md

PondFish_QA_Test_Specification_v1.md

PondFish_Deployment_DevOps_Specification_v1.md

Database / ERD / Data Model specification
Integration Specification
Roles & Permissions Specification
```

If the project repository uses different filenames, identify the equivalent approved documents by content and version.

Do not assume a missing file is unimportant.

---

# 5. DOCUMENT CONSUMPTION RULE

Before writing substantial code:

1. identify every available project specification;
2. determine its version;
3. determine whether it is current;
4. read its source-of-truth section;
5. build a dependency map;
6. identify contradictions;
7. identify unresolved TBDs;
8. create an implementation checklist;
9. only then begin implementation.

Do not start by generating random screens.

Do not start by generating a random database.

Do not start by generating API endpoints from imagination.

---

# 6. PRODUCT BOUNDARIES

## 6.1 Public Website

The Public Website is a public-facing web application.

It may show:

- fish categories;
- fish;
- fish images;
- descriptions;
- prices;
- physical store availability;
- online-booking eligibility;
- freshness information approved for public display;
- active discounts;
- subscription information;
- offers;
- business information;
- contact information.

It must not expose:

- internal inventory ledger;
- customer private information;
- worker information;
- private bill images;
- private payment records;
- customer subscription balances;
- internal administrative data.

### Public availability rule

A fish can be:

```text
Available in physical store
```

while being:

```text
Not available for online booking
```

These are different concepts.

The UI must display them separately.

The cart must only contain fish that are currently eligible for online booking.

---

# 7. CUSTOMER APPLICATION

## 7.1 Platform

The Customer product is a **native React Native application**.

Initial target:

```text
Android
```

Architecture must remain suitable for:

```text
iOS
```

Do not implement the customer application as a wrapped website unless the authoritative project documents are explicitly changed.

---

# 8. CUSTOMER AUTHENTICATION

Customer authentication is:

```text
Mobile Number
      ↓
OTP
      ↓
Authenticated Session
```

No customer password is required.

Support:

- invalid OTP;
- expired OTP;
- resend;
- resend countdown;
- attempt limits;
- network errors;
- session expiry;
- logout;
- secure session storage.

---

# 9. CUSTOMER PRIMARY NAVIGATION

Use the approved navigation from the customer page specification.

Typical primary destinations:

```text
Home
Browse
Bookings
Transactions
Profile
```

Prominent features include:

- Subscription;
- Scan Bill;
- Discounts;
- active GPS tracking when available.

Do not invent a second navigation model.

---

# 10. CUSTOMER CORE CAPABILITIES

Customer can:

- register;
- authenticate with mobile OTP;
- browse fish;
- browse categories;
- view fish details;
- add eligible fish to cart;
- book fish online;
- pay through Razorpay;
- view booking confirmation;
- use QR pickup ticket;
- view booking history;
- cancel eligible bookings;
- view subscription information;
- purchase/recharge subscriptions;
- view Subscription Credit;
- view weekly quantity;
- scan physical bills;
- upload bill images;
- review AI-extracted bill information;
- manually enter Bill ID when AI cannot read it;
- pay remaining physical-purchase amount through Razorpay;
- view transaction results;
- view transaction history/receipts;
- view live delivery tracking when published by Admin;
- receive notifications;
- manage permitted profile data;
- manage notification preferences;
- contact support;
- log out.

---

# 11. CUSTOMER APPLICATION MUST NOT

The customer application must not:

- manage inventory;
- change fish master data;
- configure fish;
- configure subscription plans;
- change prices;
- create discounts;
- publish GPS journeys;
- operate worker workflows;
- scan customer QR tickets as a worker;
- complete online bookings as a worker;
- process worker cash;
- modify business settings;
- perform administrative reporting.

---

# 12. CUSTOMER CATALOGUE RULES

The customer catalogue must show:

```text
Category
Fish
Image
Price
Discount
Physical availability
Online booking eligibility
```

Do not collapse physical availability and online-booking eligibility into one boolean.

A fish may be:

```text
Physical: AVAILABLE
Online: NOT BOOKABLE
```

The customer may view it, but must not add it to the online booking cart.

---

# 13. CART RULE

The cart is an online-booking cart.

Therefore:

```text
Only currently online-bookable fish may enter the cart.
```

At checkout, the backend must revalidate:

- fish still exists;
- fish is still active;
- online booking is still enabled;
- inventory is still sufficient;
- quantity is still allowed;
- price is still valid;
- discount is still valid;
- subscription coverage is still valid;
- booking rules are still satisfied.

Never trust the client cart as the final authority.

---

# 14. CHECKOUT RULE

Backend calculation is authoritative.

The UI may display:

- item quantity;
- item price;
- discount;
- subscription coverage;
- payable amount.

But the client must not decide the final amount.

Use:

```text
Client request
    ↓
Backend validation
    ↓
Backend calculation
    ↓
Authoritative result
    ↓
Payment / booking
```

---

# 15. WORKER PORTAL

The Worker Portal is a:

```text
Responsive Web Application
Tablet First
```

Primary purpose:

```text
Order Fulfillment
```

Worker workflow:

```text
Find booking
      ↓
Verify booking
      ↓
Prepare fish
      ↓
Handle additional payment if required
      ↓
Hand over fish
      ↓
Complete order
      ↓
QR becomes invalid
      ↓
Booking becomes completed
```

Prioritize:

- speed;
- clarity;
- large touch targets;
- low cognitive load;
- fast search;
- fast scanning;
- reliable error recovery.

---

# 16. WORKER CAPABILITIES

Worker can:

- authenticate;
- view pending bookings;
- search by customer name;
- search by phone number;
- search by Booking ID;
- scan booking QR;
- open booking details;
- view required order information;
- check payment state;
- handle permitted additional payment;
- complete eligible orders;
- view completed order history;
- view worker profile;
- log out.

Worker must not be given administrative controls.

---

# 17. ADMIN PORTAL

The Admin Portal is:

```text
CONTROL
+
VISIBILITY
+
CONFIGURATION
+
APPROVED INTERVENTION
+
REPORTING
+
AUDIT
```

It is not:

```text
Customer App
Worker App
Payment Gateway
POS
TV Controller
```

Admin responsibilities include:

- dashboard;
- fish management;
- categories;
- inventory;
- freshness;
- discounts;
- subscriptions;
- customers;
- workers;
- bookings;
- transactions;
- truck journeys;
- GPS publishing;
- notifications;
- public website content;
- business settings;
- reports;
- exports;
- audit logs;
- operational exceptions;
- admin security;
- profile;
- logout.

---

# 18. ADMIN HIGH-IMPACT ACTION RULE

Any Admin action materially affecting:

```text
Money
Stock
Customers
Bookings
Workers
GPS visibility
Public information
```

must be:

```text
Validated
+
Authorized
+
Traceable
+
Concurrency-safe where necessary
+
Recoverable
```

Historical records must not be silently rewritten.

Example:

Changing the current fish name must not change the fish name recorded in an already completed transaction.

---

# 19. SHOP TRANSACTION TV

The Shop TV is a:

```text
Read-only fullscreen web application
```

It displays successful transactions.

When a successful transaction is committed:

```text
Transaction Commit
      ↓
Committed Event
      ↓
Realtime Delivery
      ↓
TV Display
      ↓
Visual update
+
Bell / notification sound
```

The TV should display, according to the approved TV specification:

- customer name;
- transaction ID;
- fish name;
- quantity;
- bill number where applicable;
- paid amount / transaction amount as specified;
- time.

The success event must be generated from confirmed transaction state.

Do not trigger the TV from an optimistic frontend payment button.

---

# 20. TV SOUND RULE

For every successful transaction that should appear on TV:

```text
Visual notification
+
Bell / notification sound
```

The sound must occur after the committed transaction event is received.

It must not occur merely because a payment button was clicked.

The TV must handle:

- duplicate event prevention;
- reconnect;
- missed events according to the approved realtime/event design;
- browser autoplay restrictions where applicable;
- muted/unmuted state;
- event replay if specified;
- display failure;
- network failure.

---

# 21. BACKEND ARCHITECTURE

The initial backend is a modular monolith with supporting background workers and realtime services.

Logical domains include:

```text
Authentication
Customers
Workers
Admin
Fish
Categories
Inventory
Freshness
Discounts
Subscriptions
Bookings
Bill Processing
Transactions
Payments
GPS/Journey
Notifications
Reporting
Audit
Realtime
File Storage
Background Jobs
```

These are logical modules.

Do not create microservices merely because the domains have separate names.

---

# 22. DATABASE

The relational database is the transactional authority.

Critical financial/inventory/subscription mutations must be atomic.

The implementation must preserve:

- transaction integrity;
- inventory integrity;
- subscription credit integrity;
- booking integrity;
- payment references;
- audit history.

Database constraints should enforce important invariants where appropriate.

Do not move authoritative business logic into frontend state.

---

# 23. API

Production APIs are versioned.

Expected convention:

```text
/api/v1
```

Example:

```text
GET  /api/v1/fish
POST /api/v1/bookings
GET  /api/v1/transactions/{id}
```

Use stable error codes.

Do not make frontend logic depend on human-readable error messages.

Expected success envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Expected error envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields",
    "details": []
  },
  "request_id": "req_xxx"
}
```

---

# 24. API CLIENT RULE

Frontend applications must use a centralized API/service layer.

Do not construct arbitrary HTTP requests directly inside random components.

The shared client should handle:

- base URL;
- authentication;
- token/session handling;
- token refresh where applicable;
- request IDs;
- timeouts;
- uploads;
- response parsing;
- stable error mapping;
- network failure handling;
- retry rules where safe.

---

# 25. BUSINESS ENGINE RULE

Applications request actions.

Domain engines enforce rules.

Database preserves truth.

Events communicate committed state.

Integrations remain replaceable.

This principle applies to:

```text
Public Website
Customer App
Worker Portal
Admin Portal
TV
Background Jobs
External Integrations
```

---

# 26. CRITICAL BUSINESS TRUTH

The UI must never become the authority for:

- inventory;
- online booking eligibility;
- pricing;
- discounts;
- subscription credit;
- weekly subscription quantity;
- payment success;
- booking status;
- transaction success;
- freshness state;
- GPS publication;
- notification delivery.

---

# 27. UNKNOWN RESULT RULE

Never convert an unknown result into a false failure or false success.

Example:

```text
Payment Request Sent
        ↓
Network Interrupted
        ↓
Result Unknown
```

The UI must not immediately say:

```text
Payment Failed
```

or:

```text
Payment Successful
```

until authoritative confirmation exists.

The UI should provide an appropriate pending/verification state and allow the approved recovery path.

---

# 28. IDEMPOTENCY

Critical mutations must be idempotent where duplicate requests could create duplicate effects.

Important examples:

- payment processing;
- booking creation;
- transaction finalization;
- subscription purchase;
- subscription credit mutation;
- inventory reservation;
- refunds/restoration;
- QR completion;
- background jobs;
- webhook processing;
- realtime event processing where duplicate delivery is possible.

A retry must not create duplicate business effects.

---

# 29. CONCURRENCY

Explicitly test and implement concurrency protection for:

- inventory;
- online reservations;
- subscription credit;
- weekly quantity;
- payments;
- booking creation;
- transaction finalization;
- refunds/restoration;
- QR completion.

Do not rely on the frontend to prevent races.

---

# 30. PAYMENT

Razorpay is the current online payment provider.

Payment verification must occur server-side.

Never treat:

```text
Frontend callback received
```

as equivalent to:

```text
Payment verified
```

Payment state must come from the backend/payment integration workflow.

Never store secrets in:

- frontend code;
- React Native bundle;
- public website;
- TV;
- Git repository;
- client-visible configuration.

---

# 31. SUBSCRIPTIONS

Subscription is represented using monetary Subscription Credit.

Current plans include:

```text
₹2,000
₹6,000
```

The architecture must support future plans.

New valid credit adds to existing valid credit according to the approved business rules.

Subscription credit and weekly quantity are separate concepts.

Never merge them into one frontend field.

The backend owns:

- eligibility;
- credit;
- usage;
- quantity limits;
- deduction;
- restoration;
- validity.

---

# 32. INVENTORY

Inventory is authoritative backend/database state.

Online booking must reserve eligible inventory atomically.

Do not perform:

```text
Read inventory
↓
Frontend decides enough
↓
Create booking
```

as the authoritative workflow.

Instead:

```text
Request
↓
Backend validation
↓
Atomic reservation
↓
Booking creation
```

Inventory restoration must follow the approved booking cancellation/expiry rules.

---

# 33. FRESHNESS

Freshness is a business state.

Do not implement freshness merely as a UI badge.

Freshness transitions, thresholds and discount consequences must follow the approved business engine specification.

Historical transactions must preserve their historical truth.

---

# 34. DISCOUNTS

Discount state comes from backend data.

The frontend must not decide whether a discount is currently active.

Discount visibility must respect:

- start time;
- end time;
- active state;
- backend validity;
- fish eligibility;
- approved business rules.

---

# 35. PUBLIC WEBSITE DYNAMIC CONTENT

The landing/public website must consume live approved backend data for:

```text
Fish
Categories
Physical availability
Online booking eligibility
Active discounts
Offers
Business information
```

The landing page may show fish even when they are not online-bookable, but must clearly distinguish:

```text
Available in Store
```

from:

```text
Available for Online Booking
```

The online cart must only accept online-bookable fish.

---

# 36. AI BILL PROCESSING

AI bill processing is an assistive workflow.

AI extraction is not automatically authoritative.

The system should:

```text
Capture bill
    ↓
Upload
    ↓
AI extraction
    ↓
Show extracted fields
    ↓
Worker/customer review
    ↓
Correction if necessary
    ↓
Backend validation
    ↓
Transaction processing
```

The system must handle:

- unreadable image;
- partial extraction;
- wrong bill number;
- wrong quantity;
- wrong fish;
- duplicate bill;
- unsupported bill;
- provider timeout;
- provider failure;
- low-confidence extraction;
- manual Bill ID fallback.

Never allow AI output to silently bypass business validation.

---

# 37. BILL DUPLICATION

Duplicate bill processing must be prevented by the backend/database.

The UI may warn about a duplicate.

The backend must enforce the invariant.

---

# 38. QR TICKETS

QR validity is backend controlled.

Successful booking produces the approved QR pickup ticket.

Worker completion invalidates the QR according to the business workflow.

The client must not simply mark a QR invalid locally.

---

# 39. GPS / ONELAP

OneLap is an external integration.

Keep it behind an adapter/service boundary.

Admin visibility and customer GPS publication are separate concerns.

Customer GPS must only be visible when the approved publication state allows it.

Automatic post-arrival stopping must follow the approved configuration.

Never expose raw internal GPS data unnecessarily.

---

# 40. NOTIFICATIONS

Notifications are secondary to business transactions.

A notification failure must not roll back a successful business transaction.

Example:

```text
Transaction commits
      ↓
Transaction is successful
      ↓
Notification attempt
      ↓
Notification fails
```

The transaction remains successful.

The notification can be retried according to the approved job/retry strategy.

---

# 41. REALTIME

Realtime is for communicating committed state changes.

Do not publish business events before the underlying transaction is committed.

For important realtime events:

```text
Business Mutation
      ↓
Database Commit
      ↓
Outbox / Event Record
      ↓
Realtime Publisher
      ↓
Consumers
```

Consumers must tolerate duplicate delivery and reconnect.

---

# 42. GLOBAL UI STATE MODEL

Every meaningful operation must consider:

```text
Initial
Loading
Success
Empty
Validation Error
Business Error
Network Error
Permission Error
Retry
```

Where relevant also support:

```text
Conflict
Unauthorized
Forbidden
Not Found
Maintenance
Unknown / Pending
Offline
Session Expired
Integration Unavailable
```

Never build only the happy path.

---

# 43. ERROR PRINCIPLE

Never let the UI guess what the backend has not confirmed.

Never turn an unknown result into a false failure or false success.

Stable backend error codes must map to human-friendly UI messages.

Technical diagnostics should be available through request IDs/logs where appropriate.

Do not expose secrets, stack traces or internal infrastructure details to users.

---

# 44. UI DESIGN SYSTEM

The approved PondFish visual direction is:

```text
Fresh
Trustworthy
Modern
Premium
Local
```

PondFish should feel like:

```text
A well-designed physical fish store brought online
```

It should not feel like:

```text
A generic SaaS template
A generic AI-generated landing page
An over-decorated dashboard
A template marketplace clone
```

---

# 45. UI IMPLEMENTATION RULE

The Design System is an implementation document, not a mood board.

Follow its:

- color tokens;
- typography;
- spacing;
- component rules;
- buttons;
- cards;
- forms;
- navigation;
- states;
- responsive rules;
- accessibility rules;
- interaction behavior.

Do not introduce random component styles.

Do not introduce a second design language.

---

# 46. VISUAL CONSISTENCY

Across the ecosystem:

```text
Public Website
Customer App
Worker Portal
Admin Portal
TV
```

the exact layout does not need to be identical.

The **design language** must be consistent.

The information architecture should remain appropriate to each surface.

Customer mobile is optimized for:

```text
thumb reach
short tasks
clear hierarchy
touch targets
mobile reading
```

Worker is optimized for:

```text
speed
touch
glanceability
low cognitive load
```

Admin is optimized for:

```text
dense operational information
control
filtering
tables
audit
```

TV is optimized for:

```text
distance
high visibility
minimal interaction
real-time awareness
```

---

# 47. ACCESSIBILITY

Implementation must consider:

- sufficient contrast;
- readable typography;
- visible focus;
- touch target size;
- semantic labels;
- keyboard navigation where applicable;
- screen reader compatibility where applicable;
- error identification;
- form labels;
- non-color-only status indicators.

Never use color as the only method of communicating state.

---

# 48. RESPONSIVE WEB

Public Website:

```text
Mobile
Tablet
Desktop
```

Worker:

```text
Tablet First
Desktop Compatible
```

Admin:

```text
Desktop First
Tablet Compatible
```

TV:

```text
Fullscreen fixed-display experience
```

Do not merely shrink desktop layouts to mobile.

Use the approved responsive behavior in the Design System and page specifications.

---

# 49. PAGE IMPLEMENTATION STANDARD

Every significant page/state must be implemented with the applicable:

1. Page ID
2. Page name
3. Purpose
4. Access / role
5. Entry points
6. Exit points
7. UI structure
8. Data displayed
9. Fields
10. Actions
11. Main workflow
12. Validation
13. Loading
14. Empty
15. Success
16. Error
17. Retry
18. Confirmation
19. Permission
20. Backend dependency
21. Cross-portal effect
22. Audit requirement
23. Edge cases
24. Responsive behavior
25. Acceptance criteria

If the specification defines a state, implement it.

---

# 50. SYSTEM ERROR PAGES

Web applications must implement approved designs for at least:

```text
404
403
500
Network Failure
Maintenance
Conflict
Session Expired
Unauthorized
Offline / Reconnect
```

Do not leave browser-default error pages.

Do not show raw framework errors.

---

# 51. LOADING STATES

Use skeletons or appropriate progress states where specified.

Do not block the entire application unnecessarily.

Avoid flashing empty content before data arrives.

Use optimistic UI only where explicitly safe.

Critical business mutations should prefer confirmed-state updates.

---

# 52. EMPTY STATES

Every list that can legitimately contain zero items needs an intentional empty state.

Examples:

```text
No bookings
No transactions
No discounts
No notifications
No search results
No fish in category
No completed orders
No active journey
```

Empty does not mean error.

---

# 53. NETWORK FAILURE

Network failure must be distinguishable from:

```text
Business rejection
Validation failure
Permission failure
Not found
```

Provide:

- useful user message;
- retry;
- preserved input where safe;
- no false success;
- no duplicate mutation on retry.

For payment-like operations, preserve unknown state rather than blindly retrying a financial mutation.

---

# 54. CODE ORGANIZATION

Follow feature/domain-oriented structure.

Do not create one giant component.

Do not create one giant backend controller.

Do not create random utility files without ownership.

Prefer:

```text
domain
feature
service
component
screen
state
validation
test
```

boundaries.

---

# 55. FRONTEND ARCHITECTURE

Expected layered structure:

```text
Presentation
      ↓
Feature Modules
      ↓
State Management
      ↓
API / Service Layer
      ↓
Backend
```

Shared utilities should cover:

- types;
- constants;
- validation;
- permissions;
- error mapping;
- money formatting;
- date/time formatting;
- network utilities.

---

# 56. CUSTOMER REACT NATIVE ARCHITECTURE

Expected:

```text
React Native
    ↓
Navigation
    ↓
Screen / Feature Modules
    ↓
State Management
    ↓
API / Service Layer
    ↓
Backend
```

Supporting capabilities:

- OTP;
- secure session storage;
- API client;
- realtime;
- push notifications;
- camera;
- image upload;
- GPS/map UI;
- Razorpay;
- error mapping;
- network handling.

---

# 57. WEB APPLICATION ARCHITECTURE

Public, Worker, Admin and TV should use the technology defined by the approved frontend architecture.

Current direction:

```text
Public Website:
Next.js / React / TypeScript / Tailwind

Worker:
React / TypeScript / Tailwind

Admin:
React or Next.js / TypeScript / Tailwind

TV:
React / Next.js / TypeScript fullscreen

Customer:
React Native / TypeScript
```

Do not change the stack merely for personal preference.

If the repository already has an approved stack, preserve it.

---

# 58. NO UNDOCUMENTED DEPENDENCIES

Do not add:

- random SaaS providers;
- hidden APIs;
- unapproved analytics;
- random authentication providers;
- personal developer accounts;
- undocumented databases;
- undocumented storage;
- undocumented queues;
- undocumented hosting.

Every production dependency must be documented.

---

# 59. EXTERNAL INTEGRATIONS

Current integrations include:

```text
Razorpay
Firebase
OneLap
AI/OCR provider
```

Future:

```text
POS
SI-801 / weighing machine
```

Integrations must be isolated behind service/adapter boundaries.

Future POS integration must not require rewriting the transaction engine.

---

# 60. SECURITY

Never commit:

- API keys;
- service-role keys;
- database passwords;
- Razorpay secrets;
- Firebase private credentials;
- OneLap secrets;
- AI provider secrets;
- JWT signing secrets;
- private certificates;
- mobile signing keys.

Use environment-specific secret storage.

---

# 61. AUTHORIZATION

Authentication proves identity.

Authorization determines permission.

Enforce permissions server-side.

Frontend route guards improve UX but are not security boundaries.

Admin/worker/customer permissions must never be trusted from client state alone.

---

# 62. AUDIT

Audit high-impact administrative and business actions.

Audit records should preserve:

- actor;
- action;
- target;
- timestamp;
- relevant before/after information where approved;
- request/context identifiers where appropriate.

Never make audit logging dependent only on frontend logging.

---

# 63. HISTORICAL INTEGRITY

Historical financial and operational records must remain historically correct.

Do not retroactively change:

- completed transaction amounts;
- historical fish names where snapshots are required;
- historical quantities;
- historical payment references;
- completed booking data;
- audit history.

Current master data and historical snapshots are separate concepts.

---

# 64. DATABASE MIGRATIONS

All schema changes must be version-controlled.

Never manually alter production schema without a documented migration.

Migration must be:

```text
Created
Reviewed
Tested
Applied to Development
Applied to Staging
Validated
Approved
Applied to Production
```

Where rollback is unsafe, provide a forward-fix strategy.

---

# 65. DEPLOYMENT ENVIRONMENTS

Use:

```text
Development
Staging
Production
```

They must be separated.

Never use production credentials in development.

Never point development at production database.

---

# 66. CI/CD

Normal deployment flow:

```text
Source
  ↓
CI
  ↓
Build
  ↓
Automated Tests
  ↓
Staging
  ↓
QA
  ↓
Approval
  ↓
Production
  ↓
Smoke Test
  ↓
Monitoring
```

No undocumented manual production step should be required for normal deployment.

---

# 67. MOBILE RELEASE

React Native Android/iOS releases must use controlled signing and release configuration.

Separate:

```text
Development
Staging
Production
```

configuration.

Do not put production secrets into mobile source.

Use appropriate:

- Android application ID;
- iOS bundle ID;
- signing;
- environment configuration;
- API base URL;
- Firebase configuration;
- release notes;
- versioning.

---

# 68. TV DEPLOYMENT

TV should be deployed as a controlled web application.

Provide:

- fullscreen mode;
- reconnect handling;
- automatic refresh/recovery where safe;
- authentication/configuration according to approved TV specification;
- sound handling;
- event deduplication;
- display recovery.

If the TV browser reloads, it must return to a usable display state without manual code intervention.

---

# 69. OBSERVABILITY

Production must provide appropriate:

- application logs;
- API logs;
- database monitoring;
- background job monitoring;
- realtime monitoring;
- integration monitoring;
- error tracking;
- health checks;
- deployment visibility.

Never log secrets.

Avoid logging full payment credentials or sensitive customer data.

---

# 70. HEALTH CHECKS

Provide appropriate health/readiness checks.

Distinguish:

```text
Application is running
```

from:

```text
Application is ready to perform business operations
```

where infrastructure supports that distinction.

Do not expose sensitive dependency information publicly.

---

# 71. BACKUPS

Backups must be:

- automated where supported;
- protected;
- monitored;
- restorable;
- periodically tested.

A backup that has never been restored is not considered fully validated.

---

# 72. RECOVERY

The system must support recovery from:

- application deployment failure;
- database failure;
- provider failure;
- realtime failure;
- network failure;
- credential rotation;
- TV disconnection;
- mobile reconnect;
- backup restoration.

Recovery must preserve business truth.

---

# 73. ROLLBACK

Rollback must consider:

```text
Application version
Database migration
API compatibility
Mobile version compatibility
Realtime event compatibility
External integration compatibility
```

Do not blindly roll back the database if destructive migrations have already executed.

Use forward migration when required.

---

# 74. RELEASE GATES

Before production:

```text
Build passes
Tests pass
Lint passes
Type checks pass
Security checks pass
Database migration validated
API contract validated
Critical workflows validated
Payment flow validated
Inventory concurrency validated
Subscription validated
Booking validated
TV event validated
Realtime reconnect validated
Notification behavior validated
Authentication validated
Authorization validated
Mobile build validated
Deployment smoke tests passed
```

---

# 75. QA PRINCIPLE

QA is not only:

```text
Does the screen look correct?
```

QA must prove:

- business truth;
- backend authority;
- atomicity;
- idempotency;
- concurrency safety;
- payment safety;
- inventory safety;
- subscription safety;
- booking correctness;
- AI extraction safety;
- GPS correctness;
- realtime correctness;
- notification behavior;
- authentication;
- authorization;
- responsive behavior;
- accessibility;
- security;
- recovery;
- deployment smoke tests.

---

# 76. TEST PYRAMID

Use appropriate levels:

```text
Unit Tests
    ↓
Domain/Service Tests
    ↓
API Tests
    ↓
Integration Tests
    ↓
Portal/App Tests
    ↓
End-to-End Tests
    ↓
Production Smoke Tests
```

Do not make every test an expensive E2E test.

---

# 77. BUSINESS ENGINE TESTING

Every business engine should have direct tests.

Important engines include:

- authentication;
- catalogue;
- inventory;
- freshness;
- discount;
- subscription;
- booking;
- payment;
- transaction;
- bill processing;
- GPS;
- notification;
- realtime;
- audit.

---

# 78. CRITICAL E2E FLOWS

At minimum validate:

## Customer online booking

```text
Browse
→
Eligible fish
→
Cart
→
Checkout
→
Backend validation
→
Payment
→
Booking
→
Reservation
→
Confirmation
→
QR
```

## Worker online booking completion

```text
Find/scan booking
→
Verify
→
Prepare
→
Complete
→
QR invalid
→
Booking completed
```

## Physical bill

```text
Bill capture
→
AI extraction
→
Review
→
Validation
→
Subscription calculation
→
Payment if needed
→
Transaction commit
→
TV event
→
TV visual
+
bell
```

## GPS

```text
Truck journey
→
OneLap data
→
Admin visibility
→
Admin publishes
→
Customer visibility
→
Arrival
→
Publication ends
```

---

# 79. CLIENT REVIEW PRINCIPLE

The current PRD and documentation are also used for client review.

However, once a requirement is approved and implementation begins, do not use client presentation convenience as a reason to weaken technical correctness.

The implementation must follow the approved business and technical truth.

---

# 80. STITCH / UI GENERATION RULE

When using Stitch or another UI generation system:

1. feed it the Design System;
2. feed it the relevant page specification;
3. specify the platform;
4. specify the required states;
5. specify responsive behavior;
6. specify realistic data;
7. specify the PondFish visual direction;
8. do not let the tool invent business workflows.

Generated UI is a starting artifact.

It must be reconciled against the approved design specification before implementation.

---

# 81. AI CODING AGENT RULES

AI agents must:

- read before editing;
- inspect existing code before creating files;
- reuse existing utilities;
- reuse existing components;
- preserve existing conventions;
- avoid duplicate abstractions;
- avoid duplicate API clients;
- avoid duplicate business logic;
- avoid unnecessary dependencies;
- update tests with behavior changes;
- update documentation when architecture changes;
- run relevant checks after modifications.

Do not rewrite the project merely because a cleaner architecture is personally preferred.

---

# 82. BEFORE CREATING A NEW FILE

Ask internally:

```text
Does an existing file already perform this responsibility?
```

If yes:

```text
Reuse / extend it.
```

If no:

```text
Create a new file with one clear responsibility.
```

Do not create files merely to make the directory appear organized.

---

# 83. BEFORE ADDING A NEW DEPENDENCY

Check:

1. Is it already installed?
2. Can existing project code solve the requirement?
3. Is the dependency compatible with the approved architecture?
4. Does it create security risk?
5. Does it increase bundle size significantly?
6. Does it create licensing concerns?
7. Does it create a new external runtime dependency?
8. Is it necessary?

Only then add it.

---

# 84. BEFORE CHANGING ARCHITECTURE

If implementation reveals an architectural problem:

1. identify the issue;
2. identify affected source documents;
3. determine whether the change affects business truth;
4. determine affected APIs;
5. determine affected database;
6. determine affected portals;
7. determine affected QA;
8. determine affected deployment;
9. document the change;
10. only then implement it.

Do not silently change architecture.

---

# 85. NO BUSINESS LOGIC IN UI

Do not put authoritative logic into:

```text
React components
React Native components
Tailwind classes
client state
navigation
local storage
TV display state
```

UI may provide:

```text
presentation
input validation
UX feedback
navigation
temporary state
```

Business authority remains backend/domain/database.

---

# 86. NO DUPLICATED BUSINESS RULES

Do not implement the same rule separately in:

```text
Customer App
Worker Portal
Admin Portal
Public Website
Backend
TV
```

If multiple interfaces need the same rule:

```text
Central business engine
+
API result
```

Consumers render the result.

---

# 87. FRONTEND CACHE RULE

Caching may improve performance.

Caching must never override authoritative current business state for critical operations.

Do not use stale cache to:

- confirm payment;
- confirm inventory;
- confirm booking;
- confirm subscription credit;
- confirm transaction;
- confirm QR validity.

---

# 88. OFFLINE RULE

Offline behavior must be intentional.

For safe read-only screens:

```text
Cached data may be shown with stale indication where appropriate.
```

For critical mutations:

```text
Do not silently queue financial/business actions
unless explicitly specified.
```

Never make offline state look like confirmed backend state.

---

# 89. TIME AND MONEY

Use centralized utilities for:

- currency;
- decimal handling;
- date/time;
- timezone;
- rounding.

Do not use floating-point arithmetic casually for financial calculations.

Backend remains authoritative for final amounts.

---

# 90. FILE UPLOADS

File uploads must:

- validate file type;
- validate file size;
- use secure storage;
- use appropriate access controls;
- avoid exposing private files publicly;
- handle interrupted uploads;
- provide useful failure messages.

Bill images are sensitive operational data and must not become public assets.

---

# 91. LOGGING RULES

Never log:

- passwords;
- OTP values;
- secret keys;
- payment credentials;
- private tokens;
- full sensitive customer data unnecessarily.

Use:

```text
request_id
transaction_id
booking_id
user_id / actor reference
```

where appropriate and privacy-safe.

---

# 92. ERROR DIAGNOSTICS

User-facing message:

```text
Simple
Clear
Actionable
```

Developer diagnostics:

```text
Error code
Request ID
Stack trace
Provider response
Database details
```

but only in controlled logs.

Never expose developer diagnostics to end users.

---

# 93. PERFORMANCE

Do not optimize blindly.

Measure first.

Prioritize:

- API latency;
- database queries;
- image loading;
- mobile startup;
- bundle size;
- large tables;
- catalogue rendering;
- realtime event handling;
- TV display stability.

Do not introduce premature infrastructure complexity.

---

# 94. SCALABILITY

The MVP is:

```text
Single Store
One Truck
```

Architecture should allow future:

```text
Multiple stores
Multiple trucks
POS
Weighing machine
Additional roles
```

without unnecessarily implementing those features now.

---

# 95. FUTURE POS / SI-801

Future POS/weighing-machine integration must enter through an adapter.

Do not couple the transaction engine directly to a future hardware vendor.

The current worker workflow must remain operational without POS integration.

---

# 96. DEVELOPMENT ORDER

Use the approved architecture build order:

```text
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

The exact order may be adjusted only when dependency analysis proves another order is necessary.

Do not build all UIs as disconnected mockups and postpone backend truth until the end.

---

# 97. FOUNDATION PHASE

Establish:

- repository structure;
- environment strategy;
- TypeScript/Python/project standards as applicable;
- linting;
- formatting;
- testing;
- CI baseline;
- configuration;
- API client;
- database connection;
- logging;
- error framework;
- authentication foundation;
- shared types where appropriate.

---

# 98. DATABASE PHASE

Implement:

- schema;
- constraints;
- indexes;
- relationships;
- audit structures;
- transaction boundaries;
- migration system.

Validate:

```text
Foreign keys
Unique constraints
Concurrency constraints
Historical integrity
Indexes
```

before building dependent business flows.

---

# 99. AUTHENTICATION AND RBAC

Implement:

```text
Customer
Worker
Admin
TV
```

according to approved authentication rules.

Customer:

```text
Mobile + OTP
```

Worker/Admin:

```text
Email + Password
```

TV:

```text
Restricted display authentication/configuration
```

Role boundaries must be enforced server-side.

---

# 100. CATALOGUE

Implement:

- categories;
- fish master data;
- public catalogue;
- images;
- descriptions;
- pricing;
- online booking eligibility;
- physical availability.

Ensure historical transaction snapshots are preserved.

---

# 101. INVENTORY

Implement authoritative inventory operations.

Test:

```text
Normal booking
Concurrent booking
Insufficient inventory
Cancellation restoration
Expiry restoration
Physical sale interaction
Admin adjustment
```

---

# 102. FRESHNESS AND DISCOUNTS

Implement freshness state and discount logic according to the approved business engine.

Ensure public/customer displays consume backend state.

Do not duplicate discount calculations in clients.

---

# 103. SUBSCRIPTION

Implement:

- plans;
- purchase/recharge;
- Subscription Credit;
- weekly quantity;
- eligibility;
- deduction;
- restoration where applicable;
- transaction/audit history.

Test concurrent use.

---

# 104. PAYMENT

Implement:

- payment creation;
- provider interaction;
- verification;
- webhook handling where applicable;
- idempotency;
- payment uncertainty;
- reconciliation;
- failure handling.

---

# 105. TRANSACTION ENGINE

The transaction engine is central.

It must coordinate:

```text
Customer
Fish
Inventory
Subscription
Payment
Transaction
Audit
Realtime
Notification
```

Do not allow UI code to orchestrate authoritative financial mutations.

---

# 106. BILL / AI

Implement AI as an adapter/service.

The AI provider can fail.

The core business system must remain correct if:

```text
AI unavailable
AI timeout
AI low confidence
AI returns partial result
AI returns incorrect result
```

---

# 107. BOOKING

Implement:

```text
Eligibility
Reservation
Payment
Creation
Confirmation
QR
Expiry
Cancellation
Restoration
Completion
```

The exact state machine must follow the approved booking/business-engine specification.

Do not invent alternative states.

---

# 108. WORKER PORTAL IMPLEMENTATION

Build only after the underlying booking/transaction APIs are sufficiently stable.

Implement:

- login;
- dashboard;
- today's bookings;
- search;
- QR scanning;
- booking detail;
- bill capture;
- AI review;
- payment;
- completion;
- completed history;
- profile;
- logout;
- all required error/empty/loading states.

---

# 109. ADMIN PORTAL IMPLEMENTATION

Implement the approved admin IA.

Core modules:

```text
Operations
  Dashboard
  Inventory
  Bookings
  Transactions
  Truck & GPS

Catalog & Commercial
  Fish Management
  Discounts
  Subscriptions

People
  Customers
  Workers

Communication
  Notifications
  Website Content

Business
  Business Settings
  Reports & Exports

Governance
  Audit Logs
  Admin Security

Account
  Profile
  Logout
```

---

# 110. PUBLIC WEBSITE IMPLEMENTATION

Build public website after catalogue/public API behavior is stable.

The website must dynamically consume approved data.

Important:

```text
Fish availability
Discounts
Categories
Online-booking eligibility
```

must not be hardcoded into static frontend data if the approved architecture says these are backend-controlled.

---

# 111. CUSTOMER APP IMPLEMENTATION

Build the native React Native app using the same API and business rules.

Implement:

- onboarding/auth;
- home;
- browse;
- categories;
- fish details;
- cart;
- checkout;
- booking;
- QR;
- bookings;
- transactions;
- subscription;
- bill scan;
- AI review;
- payment;
- GPS;
- notifications;
- profile;
- support;
- settings;
- all global states.

---

# 112. REALTIME IMPLEMENTATION

Implement realtime only around committed state changes.

Important:

```text
Transaction commit
      ↓
Event
      ↓
TV
```

not:

```text
Payment button
      ↓
TV
```

---

# 113. TV IMPLEMENTATION

TV must:

- authenticate;
- connect;
- display successful transactions;
- play notification/bell sound;
- avoid duplicate displays;
- recover from disconnect;
- recover from page reload;
- handle event replay/deduplication according to approved design;
- remain readable from store viewing distance.

---

# 114. NOTIFICATIONS

Implement notification generation from backend events/jobs.

Do not make the frontend responsible for deciding whether a notification should exist.

Handle provider failure independently.

---

# 115. REPORTING

Reports must read authoritative data.

Do not calculate financial reports using incomplete frontend state.

Exports must follow permission and audit rules.

---

# 116. AUDIT

Implement audit at the backend/domain level for critical actions.

Do not depend on:

```text
console.log()
```

as an audit system.

---

# 117. SECURITY HARDENING

Before release validate:

- authentication;
- authorization;
- rate limiting where required;
- input validation;
- file upload security;
- secrets;
- CORS;
- CSRF where applicable;
- session security;
- API abuse;
- injection;
- SQL safety;
- dependency vulnerabilities;
- mobile secure storage;
- admin security;
- TV access.

---

# 118. TESTING PHASE

Run:

```text
Unit
Integration
API
Database
Concurrency
Idempotency
Payment
Subscription
Inventory
Booking
AI
GPS
Realtime
Notification
Authentication
Authorization
Responsive
React Native
Accessibility
Security
Performance
Failure/Recovery
E2E
Regression
```

---

# 119. TEST DATA

Use realistic but non-sensitive test data.

Create deterministic test fixtures for:

- fish;
- categories;
- inventory;
- customers;
- workers;
- admins;
- subscriptions;
- bookings;
- transactions;
- discounts;
- GPS;
- bills.

Do not use real customer/payment data in development.

---

# 120. PRODUCTION DATA PROTECTION

Never use production customer/payment data for local testing unless explicitly approved and appropriately anonymized.

---

# 121. DEPLOYMENT

Follow the approved Deployment/DevOps Specification.

Minimum lifecycle:

```text
Development
→
CI
→
Staging
→
QA
→
Approval
→
Production
→
Smoke Test
→
Monitoring
```

---

# 122. RELEASE CHECKLIST

Before declaring release complete:

## Business

- [ ] Fish catalogue works
- [ ] Availability works
- [ ] Online-booking eligibility works
- [ ] Discounts work
- [ ] Subscription works
- [ ] Inventory works
- [ ] Booking works
- [ ] Payment works
- [ ] Transaction works
- [ ] Bill AI works
- [ ] Worker completion works
- [ ] QR invalidation works
- [ ] TV event works
- [ ] GPS works
- [ ] Notifications work
- [ ] Audit works

## Frontend

- [ ] Public Website
- [ ] Customer App
- [ ] Worker
- [ ] Admin
- [ ] TV
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Network states
- [ ] Permission states
- [ ] 404/403/500
- [ ] Responsive behavior
- [ ] Accessibility

## Engineering

- [ ] Type checks
- [ ] Lint
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Security checks
- [ ] Migration checks
- [ ] Build checks

## Operations

- [ ] Environment variables
- [ ] Secrets
- [ ] Database backup
- [ ] Monitoring
- [ ] Logging
- [ ] Alerts
- [ ] Rollback plan
- [ ] Smoke tests
- [ ] Recovery test

---

# 123. CHANGE MANAGEMENT

If a requirement changes:

```text
Requirement Change
        ↓
Identify source document
        ↓
Update authoritative requirement
        ↓
Identify affected documents
        ↓
Update API/database/business engine if needed
        ↓
Update UI/page specification
        ↓
Update QA
        ↓
Update deployment if affected
        ↓
Implement
```

Do not patch only the UI and leave the documentation inconsistent.

---

# 124. CONTRADICTION HANDLING

If two documents conflict:

1. stop implementation of the conflicting behavior;
2. identify both documents;
3. identify versions;
4. identify authority level;
5. explain the conflict precisely;
6. do not invent a resolution;
7. request a project decision if the hierarchy does not resolve it.

Do not silently choose whichever document is easier to implement.

---

# 125. TBD HANDLING

If the documentation says:

```text
TBD
Not Locked
Deployment Decision
Future Scope
Provider Decision
```

do not invent a value.

Use a clearly marked configuration placeholder or implementation boundary.

Do not make up:

- hosting provider;
- server size;
- exact pricing;
- undocumented provider capability;
- unsupported hardware;
- API fields not defined by the contract.

---

# 126. EXISTING CODE HANDLING

If a repository already contains code:

1. inspect it;
2. identify working features;
3. identify architecture;
4. identify technical debt;
5. preserve working business behavior;
6. refactor only when necessary;
7. do not overwrite everything automatically.

Before deleting code, determine whether it is used.

---

# 127. GENERATED UI HANDLING

If Stitch/AI generated UI differs from the approved Design System:

```text
Approved Design System wins.
```

If generated UI differs from a page specification:

```text
Approved page specification wins.
```

Generated design is not a business authority.

---

# 128. CODE QUALITY

Code must be:

- readable;
- typed where the language supports it;
- modular;
- testable;
- secure;
- observable;
- maintainable.

Avoid:

- giant components;
- giant controllers;
- duplicate API logic;
- duplicate validation;
- magic numbers;
- magic strings;
- hidden side effects;
- unnecessary global state.

---

# 129. COMMENTS

Comments should explain:

```text
Why
```

not:

```text
What the code obviously does
```

Use comments for:

- business invariants;
- concurrency decisions;
- security boundaries;
- integration quirks;
- non-obvious recovery behavior.

---

# 130. COMMITS / CHANGE UNITS

Keep changes logically grouped.

Prefer:

```text
feat: booking reservation
fix: payment uncertainty handling
feat: worker QR completion
test: inventory concurrency
refactor: centralized API error mapping
```

Do not combine unrelated changes.

---

# 131. FINAL IMPLEMENTATION PRINCIPLE

The PondFish system should be understandable as:

```text
Applications request actions.
        ↓
Domain engines enforce rules.
        ↓
Database preserves truth.
        ↓
Events communicate committed state.
        ↓
Integrations provide capabilities.
        ↓
Interfaces render confirmed state.
```

---

# 132. FINAL AI AGENT BEHAVIOR

When asked to implement a feature, follow this sequence:

```text
1. Identify the requirement.
2. Identify the authoritative source.
3. Identify affected domain.
4. Identify affected API.
5. Identify affected database state.
6. Identify affected portals.
7. Identify affected UI states.
8. Identify affected tests.
9. Identify deployment implications.
10. Inspect existing code.
11. Reuse existing abstractions.
12. Implement backend/business behavior first when required.
13. Implement clients.
14. Implement error/recovery paths.
15. Add tests.
16. Run checks.
17. Review against source documents.
18. Report exactly what changed.
```

---

# 133. FINAL RESPONSE FORMAT FOR CODING TASKS

After implementation, report:

## Changed

List files/features changed.

## Business Behavior

Explain the actual behavior implemented.

## API / Database

List affected contracts/schema/migrations.

## UI

List affected screens and states.

## Tests

List tests executed and results.

## Remaining

List unresolved/TBD items only.

## Risks

List actual implementation risks.

Do not claim completion if tests were not run.

Do not claim integration success if the external provider was not available.

---

# 134. DO NOT SAY "DONE" WITHOUT VERIFICATION

Before saying a task is complete, verify the relevant acceptance criteria.

At minimum:

```text
Code compiles
+
Relevant tests pass
+
Relevant UI states exist
+
API contract works
+
Business rule is enforced server-side
+
No known source-document contradiction
```

If verification cannot be performed, state:

```text
Implemented but not fully verified.
```

---

# 135. FINAL PRODUCT ACCEPTANCE MODEL

PondFish is ready only when:

```text
Business Truth
+
Correct UI
+
Correct API
+
Correct Database
+
Correct Integrations
+
Correct Error Handling
+
Correct QA
+
Correct Deployment
+
Correct Recovery
+
Correct Audit
```

all align.

A visually complete application is not a completed PondFish system.

A backend that works but has incorrect UI states is not complete.

A UI that looks correct but guesses business state is not complete.

A successful payment that does not produce the correct committed transaction and TV event is not complete.

---

# 136. FINAL PROHIBITIONS

The AI coding agent must NOT:

- invent business rules;
- invent financial calculations;
- invent inventory behavior;
- invent subscription behavior;
- invent booking states;
- invent payment success;
- trust client payment success;
- trust client inventory;
- trust client authorization;
- expose private data;
- hardcode secrets;
- create undocumented production infrastructure;
- create duplicate business logic;
- bypass the backend;
- directly modify production databases;
- silently change architecture;
- silently change the product scope;
- use production data for development;
- remove audit requirements;
- skip error states;
- skip network states;
- skip concurrency testing;
- skip idempotency;
- trigger TV success before transaction commitment;
- treat AI extraction as authoritative;
- treat external integration success as business truth;
- claim tests passed when they did not run;
- claim deployment succeeded when it was not verified.

---

# 137. MASTER IMPLEMENTATION LOOP

Use this loop for every feature:

```text
READ
 ↓
UNDERSTAND
 ↓
TRACE AUTHORITY
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
TEST
 ↓
VERIFY
 ↓
DOCUMENT
 ↓
REVIEW
```

Never:

```text
GUESS
 ↓
CODE
 ↓
HOPE
```

---

# 138. FINAL SYSTEM MAP

```text
                         PONDFISH
                            |
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
   PUBLIC WEBSITE     CUSTOMER APP       OPERATIONS
                       React Native          |
                                             |
                              +--------------+--------------+
                              |              |              |
                              v              v              v
                           WORKER          ADMIN            TV
                           PORTAL          PORTAL         DISPLAY
                              \              |              /
                               \             |             /
                                +------------+------------+
                                             |
                                             v
                                  PONDFISH BACKEND
                                             |
             +-------------------------------+-------------------------------+
             |               |               |               |               |
             v               v               v               v               v
          DATABASE       BUSINESS         REALTIME        BACKGROUND      FILE
                        ENGINES            EVENTS           JOBS          STORAGE
             |
             +-------------------+-------------------+------------------+
             |                   |                   |                  |
             v                   v                   v                  v
         RAZORPAY             FIREBASE            ONELAP              AI/OCR
```

---

# 139. FINAL BUSINESS TRUTH MODEL

```text
USER ACTION
    ↓
AUTHORIZATION
    ↓
VALIDATION
    ↓
DOMAIN ENGINE
    ↓
TRANSACTION / DATABASE
    ↓
COMMITTED STATE
    ↓
EVENT
    ↓
CONSUMERS
    ├── Customer
    ├── Worker
    ├── Admin
    ├── TV
    └── Notifications
```

The UI communicates the state.

The backend owns the state.

The database preserves the state.

The event system communicates committed state.

---

# 140. FINAL RULE

**Build PondFish as one coherent business system with multiple interfaces — not as multiple applications that happen to look connected.**

Every implementation decision must preserve that principle.

# DOCUMENT END
