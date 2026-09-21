# PONDFISH — CORE BUSINESS ENGINES SPECIFICATION

**Version:** 1.0  
**Status:** Implementation Blueprint  
**Document Type:** Shared Core Business Logic / Domain Engine Specification  
**Scope:** Current MVP — Single Store, One Truck  
**Primary Consumers:** Backend Engineering, Frontend Engineering, React Native Engineering, Worker Portal, Admin Portal, TV Portal, QA, DevOps, AI Coding Agents  
**Authority:** Derived from the locked PondFish Master PRD, system architecture, database model, API specification, portal specifications, and existing workflow documents.

---

# 0. DOCUMENT PURPOSE

This document defines the shared business engines that sit underneath every PondFish application surface.

The purpose is to prevent the same business rule from being reimplemented differently in:

- Public Website
- Customer React Native App
- Worker Tablet/Web Portal
- Admin Portal
- Shop Transaction TV
- Background Jobs
- External integrations

The applications request actions.

The business engines validate and execute those actions.

The database preserves authoritative state.

Events communicate committed state changes.

Integrations remain replaceable.

The UI must never become the source of truth for:

- inventory;
- online-booking eligibility;
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

# 1. SOURCE-OF-TRUTH HIERARCHY

When two implementation documents appear to disagree, use this order:

1. Backend/API Contract
2. Master PRD
3. Core Business Engines Specification
4. Application/System Architecture
5. Database/ERD
6. Design System
7. Page-by-Page UI Specification
8. Implementation

A client-side implementation must not silently create a new business rule.

If a new requirement changes business behavior:

1. identify the affected engine;
2. update the appropriate authoritative PRD/rule;
3. update API/database requirements if required;
4. update affected portal specifications;
5. update tests;
6. only then implement the UI/backend change.

---

# 2. SYSTEM LANDSCAPE

PondFish currently contains five application surfaces:

```text
PUBLIC WEBSITE
        |
        +----------------------+
                               |
CUSTOMER REACT NATIVE APP      |
        |                      |
        +----------+-----------+
                   |
              SHARED BACKEND
                   |
        +----------+-----------+
        |          |           |
 WORKER PORTAL  ADMIN       TV PORTAL
```

All surfaces use the same backend business engines.

## 2.1 Public Website

The website can display:

- categories;
- fish;
- fish images;
- descriptions;
- pricing;
- physical store availability;
- online-booking eligibility;
- freshness information appropriate for public display;
- active discounts;
- subscription information;
- business information;
- approved contact information.

The website must never expose:

- internal inventory ledger;
- customer information;
- worker information;
- private bill images;
- private payment records;
- subscription balances belonging to customers;
- internal administrative data.

## 2.2 Customer React Native App

The customer application uses the shared engines for:

- authentication;
- catalogue;
- online booking;
- cart;
- checkout;
- subscription;
- physical bill scanning;
- AI extraction;
- payment;
- transactions;
- QR booking tickets;
- booking history;
- GPS tracking;
- notifications.

## 2.3 Worker Portal

The worker portal uses the shared engines for:

- booking retrieval;
- booking completion;
- customer search;
- physical bill capture;
- AI bill extraction;
- manual bill correction;
- Bill ID validation;
- duplicate prevention;
- subscription calculation;
- payment handling;
- physical transaction finalization;
- transaction history;
- TV event publication.

The worker portal does not own business truth.

## 2.4 Admin Portal

Admin controls:

- fish;
- categories;
- inventory;
- freshness;
- discounts;
- subscriptions;
- customers;
- workers;
- bookings;
- transactions;
- GPS;
- notifications;
- public website content;
- settings;
- reports;
- audit.

Admin actions still pass through the same domain rules.

## 2.5 Shop Transaction TV

The TV is read-only.

It receives committed successful-transaction events.

The TV must never:

- authorize a transaction;
- approve payment;
- change inventory;
- change a booking;
- determine transaction success.

---

# 3. CORE ENGINE MAP

The initial core engine set is:

```text
01 Authentication Engine
02 Catalogue Engine
03 Fish & Category Engine
04 Inventory Engine
05 Freshness Engine
06 Availability Engine
07 Discount Engine
08 Subscription Engine
09 Cart & Checkout Calculation Engine
10 Booking Engine
11 QR Ticket Engine
12 Physical Bill Engine
13 AI Bill Extraction Engine
14 Transaction Engine
15 Payment Engine
16 Refund / Restoration Engine
17 GPS / Journey Engine
18 Notification Engine
19 Realtime Event Engine
20 Shop TV Projection Engine
21 Reporting Engine
22 Audit Engine
23 File Storage Engine
24 Background Job Engine
25 Idempotency / Concurrency Layer
26 Error / Recovery Engine
```

These engines are logical domains.

For the current MVP they may live inside a modular monolith rather than separate microservices.

---

# 4. ENGINE DESIGN PRINCIPLES

## 4.1 Backend Authority

Every critical business decision is made server-side.

The client may:

- display;
- validate obvious input;
- provide optimistic UX where safe;
- request an action;
- show returned state.

The client may not finalize critical state independently.

## 4.2 Atomic Mutations

Financial, inventory, booking, and subscription mutations must be atomic where they form one business operation.

Example:

```text
BEGIN TRANSACTION
    validate
    reserve/deduct
    update subscription
    create transaction
    create ledger records
    create audit record
COMMIT
```

If a required step fails:

```text
ROLLBACK
```

No partial successful business state should remain.

## 4.3 Idempotency

Retries are expected.

The same operation must not produce duplicate side effects.

Examples:

- duplicate Razorpay callback;
- repeated booking completion;
- repeated booking expiry;
- repeated TV event delivery;
- repeated notification job;
- repeated inventory release;
- repeated bill processing.

## 4.4 Historical Integrity

Past transactions must preserve the values that existed at the time of the transaction.

A later price change must not rewrite:

- historical fish name;
- historical quantity;
- historical unit price;
- historical discount;
- historical tax;
- subscription-covered amount;
- extra amount;
- total transaction value.

## 4.5 Ledger Principle

Balances must be explainable through ledger movements.

Do not rely only on:

```text
subscription.credit_balance
```

Preserve the movements that created that balance.

---

# 5. AUTHENTICATION ENGINE

## 5.1 Customer Authentication

Customer authentication is:

```text
Mobile Number
      ↓
OTP Request
      ↓
OTP Verification
      ↓
Profile Completion if Required
      ↓
Authenticated Session
```

No customer password is required in the current model.

## 5.2 Worker Authentication

Worker authentication uses:

- email;
- password;
- role/permission validation;
- session management.

## 5.3 Admin Authentication

Admin authentication uses:

- email;
- password;
- role/permission validation;
- session management;
- security controls defined by the Admin Security specification.

## 5.4 TV Authentication

TV uses restricted display authentication.

The TV session must not gain worker/admin mutation privileges.

## 5.5 Session Rules

The backend owns session validity.

Clients must handle:

- expired session;
- revoked session;
- invalid credentials;
- disabled user;
- network failure;
- retry.

---

# 6. CATALOGUE ENGINE

## 6.1 Purpose

The Catalogue Engine provides customer/public-facing fish information without exposing private operational data.

## 6.2 Catalogue Data

A catalogue item may contain:

- fish ID;
- fish name;
- category;
- image;
- description;
- base price;
- effective price;
- discount;
- physical availability;
- online-booking eligibility;
- freshness state where appropriate;
- active/inactive state.

## 6.3 Public Catalogue Rule

The public website can show all active fish according to category.

The display must distinguish:

```text
Available in Store
```

from:

```text
Available for Online Booking
```

These are not the same state.

## 6.4 Dynamic Website Relationship

Admin changes to:

- fish;
- categories;
- prices;
- discounts;
- availability;
- online-booking setting

must flow to the public catalogue through the backend.

The public UI does not maintain a second catalogue database.

---

# 7. FISH & CATEGORY ENGINE

## 7.1 Fish Management

Admin can manage:

- fish name;
- category;
- image;
- description;
- price;
- active/inactive state;
- online-booking eligibility;
- freshness configuration.

## 7.2 Category Management

Categories organize fish for:

- public website;
- customer app;
- search/filter;
- browsing.

Categories are not subscription eligibility groups.

## 7.3 Fish State

Recommended conceptual state:

```text
ACTIVE
INACTIVE
```

Additional availability is calculated from other engines.

A fish being ACTIVE does not mean it is automatically bookable.

---

# 8. INVENTORY ENGINE

## 8.1 Purpose

The Inventory Engine is responsible for quantity truth.

The baseline model maintains:

```text
Physical Quantity
Reserved Quantity
Available Quantity
```

Invariant:

```text
Available Quantity = Physical Quantity - Reserved Quantity
```

## 8.2 Inventory Ledger

Inventory movements include:

- stock received;
- online reservation;
- reservation release;
- physical sale;
- booking completion;
- manual increase;
- manual decrease;
- wastage;
- disposal;
- correction.

Every movement must be traceable.

## 8.3 Inventory Invariants

The engine must never:

- reserve more than available;
- deduct below zero;
- release the same reservation twice;
- deduct the same sale twice;
- create unexplained quantity.

## 8.4 Physical Quantity

Physical quantity represents stock recorded for the store.

Example:

```text
Rohu
Physical: 10.0 kg
Reserved: 6.0 kg
Available: 4.0 kg
```

## 8.5 Reservation

When a valid online booking is finalized:

```text
Available
    ↓
Reserved
```

The reserved quantity is no longer available to another online booking.

## 8.6 Reservation Release

When a booking is cancelled or expires:

```text
Reserved
    ↓
Available
```

Example:

```text
Before:
Physical = 10 kg
Reserved = 6 kg
Available = 4 kg

Booking releases 2 kg

After:
Physical = 10 kg
Reserved = 4 kg
Available = 6 kg
```

This is a reservation release, not a new stock receipt.

## 8.7 Booking Completion

The implementation must preserve the intended inventory lifecycle.

The exact distinction between reservation release and physical deduction must remain consistent with the database transaction model.

No UI may invent an additional deduction.

## 8.8 Physical Sale

A physical transaction deducts inventory only through the finalized transaction path.

The bill being captured does not by itself mean the inventory mutation has succeeded.

## 8.9 Concurrent Inventory Update

Two customers may attempt to book the final quantity simultaneously.

The backend must serialize/guard the mutation so that:

```text
available = 1 kg

Customer A requests 1 kg
Customer B requests 1 kg
```

cannot produce:

```text
reserved = 2 kg
```

when only 1 kg exists.

One operation must succeed and the other must receive an authoritative availability error.

---

# 9. AVAILABILITY ENGINE

## 9.1 Online Booking Eligibility

A fish is online-bookable only if:

```text
Fish active
AND
online_booking_enabled
AND
inventory available
AND
freshness permits online sale
AND
not blocked by admin
```

## 9.2 Physical Availability vs Online Availability

These states are separate.

Example:

```text
Physical:
0.5 kg

Online:
Unavailable
```

A fish can be present in the shop while not being eligible for online booking.

## 9.3 Public Website

The website may show:

```text
Available in Store
```

and separately:

```text
Online Booking Available
```

The customer must not infer online-bookability from physical stock alone.

## 9.4 Cart Eligibility

Only online-bookable fish may be added to the online booking cart.

If a fish becomes unavailable after it entered the cart:

```text
Cart
  ↓
Checkout revalidation
  ↓
Unavailable
  ↓
Remove/adjust item
  ↓
Explain change to customer
```

The cart is not a reservation.

---

# 10. FRESHNESS ENGINE

## 10.1 Baseline Lifecycle

The baseline freshness concept is:

```text
RECEIVED
   ↓
GREEN / FRESH
   ↓
GREY / AGING
   ↓
RED / EXPIRED
   ↓
ADMIN REVIEW
```

Default conceptual timing:

```text
0–24h   → GREEN
24–48h  → GREY
>48h    → RED
```

Freshness durations are configurable per fish.

## 10.2 Green

Green means:

- normal selling;
- normal pricing unless another discount applies;
- eligible for online sale if all other rules pass.

## 10.3 Grey

Grey means:

- may continue selling;
- discount is optional;
- Admin controls whether a discount is applied;
- scheduled/flash discount can be used.

## 10.4 Red

Red means:

- remove from online availability;
- notify Admin;
- do not automatically delete physical stock;
- do not automatically assume physical unusability.

Admin may choose:

1. remove permanently;
2. continue physical-store sale temporarily if appropriate;
3. mark disposed/wastage.

All decisions must be auditable.

## 10.5 Freshness Job

Background processing should evaluate freshness transitions.

A freshness job must be idempotent.

Running it twice must not:

- create duplicate state transitions;
- create duplicate alerts;
- create duplicate discounts;
- create duplicate audit entries.

---

# 11. DISCOUNT ENGINE

## 11.1 Purpose

The Discount Engine determines the effective discount applicable to a fish at a specific time.

## 11.2 Supported Discount Types

Current requirements include:

- percentage discount;
- fixed discount;
- scheduled campaign;
- flash sale.

## 11.3 Discount Lifecycle

```text
DRAFT
  ↓
SCHEDULED
  ↓
ACTIVE
  ↓
ENDED
```

An Admin may also stop an active campaign according to the Admin rules.

## 11.4 Effective Discount

Discount calculation must be deterministic.

The system must never silently stack incompatible discounts.

## 11.5 Expired Discount

When a campaign ends:

```text
discount = inactive
fish remains available
```

provided all other fish rules still allow sale.

## 11.6 Public Website

The website may show:

- original price;
- active discount;
- effective price;
- validity where appropriate.

The public client must use backend-calculated effective pricing.

## 11.7 Checkout

At checkout the backend revalidates:

- base price;
- active discount;
- effective price;
- campaign status.

A stale client price must never authorize a transaction.

---

# 12. SUBSCRIPTION ENGINE

## 12.1 Purpose

The Subscription Engine controls:

- subscription plans;
- weekly quantity;
- subscription credit;
- eligibility;
- deductions;
- restoration;
- purchase history;
- expiry.

## 12.2 Current Plans

Current locked plan values:

| Plan | Price | Weekly Fish Quantity |
|---|---:|---:|
| Type 1 | ₹2,000 | 2 kg |
| Type 2 | ₹6,000 | 3 kg |

The subscription entitlement is quantity-based, measured in kg.

## 12.3 Fish Eligibility

The subscription is not tied to a particular fish type.

A customer can use the weekly quantity on available eligible fish according to booking rules.

Example:

```text
Type 1 remaining = 2 kg

Option A:
2 kg Rohu

Option B:
1 kg Rohu
+
1 kg Katla
```

The subscription quantity is measured in kg, not fish type.

## 12.4 Subscription State

Conceptual states:

```text
ACTIVE
EXPIRED
CANCELLED / TERMINATED where supported
```

Only an active subscription can provide subscription coverage.

## 12.5 Weekly Quantity

Calculation:

```text
Remaining Weekly Quantity
=
Weekly Allowance
-
Eligible Quantity Used
+
Applicable Restorations
```

Example:

```text
Type 2 allowance = 3 kg
Used = 1 kg
Remaining = 2 kg
```

## 12.6 Subscription Credit

Subscription Credit represents monetary value available for applicable covered transactions.

Credit must be ledger-based.

Every credit movement needs:

- source;
- amount;
- related entity;
- timestamp;
- actor/system;
- reference;
- reason.

## 12.7 Subscription Purchase

Subscription purchases may originate from:

```text
ONLINE
ADMIN
```

Admin purchase may use:

```text
CASH
RAZORPAY
```

All sources update the same subscription credit ledger.

## 12.8 Subscription Activation

Purchase flow:

```text
Plan Selected
    ↓
Payment
    ↓
Server Verification
    ↓
Subscription Activated/Updated
    ↓
Credit Added
    ↓
Weekly Allowance Initialized
    ↓
History Recorded
    ↓
Notification
```

Payment verification must succeed before the purchase is treated as successful.

## 12.9 Subscription Expiry

Expiry does not automatically renew the subscription.

Flow:

```text
Expired
   ↓
New purchase
   ↓
New subscription period
```

## 12.10 Booking Coverage

At checkout:

```text
Active Subscription?
       |
       +-- No → normal payment calculation
       |
       +-- Yes
             ↓
       calculate weekly quantity
             ↓
       calculate covered quantity
             ↓
       calculate covered monetary value
             ↓
       calculate remaining payable amount
```

## 12.11 Insufficient Weekly Quantity

If requested quantity exceeds remaining allowance:

The engine must calculate the supported split according to the locked booking rules.

Example:

```text
Remaining weekly quantity = 1 kg
Requested = 2 kg

Covered = 1 kg
Additional quantity = 1 kg
```

The exact monetary calculation remains backend-authoritative.

## 12.12 Insufficient Credit

If the customer's subscription credit cannot cover the applicable covered value, the engine must not silently create a negative balance.

The booking/payment path must return a clear business error or calculate the permitted additional payment according to the locked workflow.

## 12.13 Subscription Restoration

On a qualifying booking cancellation/expiry:

```text
restore applicable weekly quantity
restore applicable subscription credit
create reversal ledger records
```

Never edit the original ledger entry.

Create a compensating reversal.

## 12.14 Restoration Idempotency

A booking restored once must not be restored twice.

Required protection:

```text
booking restoration status
+
unique restoration reference/idempotency key
```

---

# 13. CART & CHECKOUT CALCULATION ENGINE

## 13.1 Cart Principle

The cart is not a reservation.

While items remain in the cart:

- inventory remains available to others;
- prices can change;
- discounts can expire;
- online eligibility can change.

## 13.2 Checkout Revalidation

Before booking/payment authorization, revalidate:

- fish active state;
- online-booking eligibility;
- inventory;
- quantity;
- current price;
- current discount;
- subscription state;
- weekly quantity;
- subscription credit;
- applicable fees/taxes where configured.

## 13.3 Calculation Order

Recommended logical calculation:

```text
Cart Items
    ↓
Validate Items
    ↓
Resolve Current Price
    ↓
Resolve Active Discount
    ↓
Calculate Item Totals
    ↓
Resolve Subscription
    ↓
Calculate Subscription Coverage
    ↓
Calculate Remaining Payable
    ↓
Resolve Payment Requirement
    ↓
Return Authoritative Checkout Summary
```

The client displays this result.

It does not recalculate final financial truth independently.

---

# 14. BOOKING ENGINE

## 14.1 Purpose

The Booking Engine manages online customer bookings.

## 14.2 Booking Trigger

A booking begins when the customer submits a valid checkout.

## 14.3 Master Booking Flow

```text
Fish Marketplace
      ↓
Fish Details
      ↓
Cart
      ↓
Checkout
      ↓
Availability Revalidation
      ↓
Subscription Calculation
      ↓
Payment Calculation
      ↓
Razorpay if Required
      ↓
Server Payment Verification
      ↓
Booking Creation
      ↓
Inventory Reservation
      ↓
Booking Confirmation
      ↓
QR Ticket
      ↓
Store Collection
      ↓
Worker Scans/Searches
      ↓
Worker Completes
      ↓
Customer Notification
      ↓
Booking History
```

## 14.4 Worker Boundary

The Worker Portal must not be part of booking creation.

Correct responsibility:

```text
Customer
  ↓
Books + pays
  ↓
System creates booking
  ↓
Worker fulfills booking
```

## 14.5 Booking States

Conceptual state machine:

```text
CREATED
   ↓
CONFIRMED
   ↓
READY_FOR_COLLECTION
   ↓
COMPLETED
```

Alternative terminal paths:

```text
CONFIRMED → CANCELLED
CONFIRMED → EXPIRED
```

The exact API state names must remain consistent with the backend contract.

## 14.6 Booking Expiry

Current validity:

```text
48 hours
```

When expiry occurs:

- booking becomes expired;
- QR becomes invalid;
- reservation is released;
- applicable subscription quantity is restored;
- applicable subscription credit is restored;
- applicable paid amount is handled according to the locked restoration rule;
- booking history is updated;
- notification may be sent.

## 14.7 Expiry Authority

The backend expiry process is authoritative.

The mobile/web client must not locally expire a booking merely because its local timer reaches zero.

## 14.8 Expiry Race Condition

Example:

```text
09:59 customer arrives
10:00 booking expiry threshold
10:00 worker presses Complete
```

The backend must perform final booking-state validation.

If already expired:

```text
completion rejected
```

If completion committed before expiry:

```text
booking remains completed
```

This prevents:

- fulfilling expired bookings;
- expiring already completed bookings.

## 14.9 Cancellation

Cancellation must:

- validate current state;
- prevent duplicate cancellation;
- release reservation when applicable;
- restore subscription usage when applicable;
- restore subscription credit when applicable;
- handle applicable payment/refund rules;
- invalidate QR;
- preserve history;
- audit the action.

---

# 15. QR TICKET ENGINE

## 15.1 Purpose

The QR ticket identifies a valid booking for collection.

## 15.2 QR Creation

QR is generated only after successful booking creation.

## 15.3 QR Validation

Worker scanning must validate server-side:

- booking exists;
- QR belongs to booking;
- booking is active;
- booking is not expired;
- booking is not cancelled;
- booking is not already completed.

## 15.4 QR Invalidation

QR becomes invalid when:

- booking is cancelled;
- booking expires;
- booking is completed.

A previously valid QR must never become valid again.

## 15.5 Duplicate Completion

Two workers scanning the same booking concurrently must not complete it twice.

Backend state transition must be atomic.

---

# 16. PHYSICAL BILL ENGINE

## 16.1 Purpose

The Physical Bill Engine manages store purchases created outside the online booking flow.

## 16.2 Physical Purchase Flow

```text
Physical Purchase
      ↓
Printed Bill
      ↓
Bill Capture / Scan
      ↓
AI Extraction
      ↓
Review
      ↓
Bill ID Validation
      ↓
Duplicate Check
      ↓
Subscription Calculation
      ↓
Payment Calculation
      ↓
Cash or Razorpay
      ↓
Server Verification
      ↓
Atomic Transaction Finalization
      ↓
Inventory Deduction
      ↓
Transaction Stored
      ↓
Successful Event
      ↓
TV
```

## 16.3 Bill Fields

Relevant normalized data may include:

- Bill ID;
- bill image;
- customer;
- fish;
- quantity;
- unit price;
- subtotal;
- discount;
- total;
- timestamp;
- worker;
- extraction confidence;
- manual corrections.

## 16.4 Bill ID

Bill ID is a critical duplicate-protection key.

A Bill ID associated with a successful transaction cannot be processed again.

## 16.5 Failed Bill Attempt

A failed/incomplete attempt must not permanently block the Bill ID unless a successful transaction already exists for it.

This allows retry after:

- AI failure;
- payment failure;
- network failure;
- user correction.

---

# 17. AI BILL EXTRACTION ENGINE

## 17.1 Purpose

The AI engine extracts information from a physical bill image.

## 17.2 AI Is Not the Final Authority

AI extraction is an assistive process.

The extracted values must be reviewed/validated before transaction finalization.

## 17.3 Extraction Candidates

AI may attempt to identify:

- Bill ID;
- fish names;
- quantities;
- prices;
- totals.

## 17.4 Extraction Confidence

Each extracted field should have a confidence/result state where supported.

Potential states:

```text
CONFIDENT
REVIEW_REQUIRED
UNREADABLE
MISSING
```

## 17.5 Manual Correction

Worker/customer-assisted workflow must permit correction of extracted data before final transaction.

The system must preserve:

- original extraction;
- corrected value;
- who corrected it;
- when;
- reason where required.

## 17.6 Poor Image

Handle:

- blurry image;
- rotated image;
- partial bill;
- unreadable Bill ID;
- missing values.

Fallback:

```text
Retry Capture
      ↓
Manual Bill ID / Correction
      ↓
Validation
```

## 17.7 Unknown Fish

If AI extracts an unknown fish:

```text
Do not silently map it to another fish.
```

Require correction/validation.

## 17.8 Total Mismatch

If:

```text
sum(line items) != bill total
```

the transaction must enter a review/error path.

Do not silently force the totals to match.

---

# 18. TRANSACTION ENGINE

## 18.1 Purpose

The Transaction Engine creates the authoritative record of successful financial/physical business events.

## 18.2 Transaction Finalization

Successful physical transaction:

```text
Validated Bill
    ↓
Validated Customer
    ↓
Validated Subscription
    ↓
Validated Payment
    ↓
Inventory Mutation
    ↓
Subscription Ledger Mutation
    ↓
Transaction Record
    ↓
Audit
    ↓
Successful Event
```

The required financial/inventory steps must commit atomically.

## 18.3 Transaction Success

Transaction success is determined by backend business logic.

It is not determined by:

- UI toast;
- payment SDK callback alone;
- TV acknowledgement;
- notification success.

## 18.4 Historical Snapshot

Transaction items preserve the purchase-time values.

Later fish changes must not alter historical transaction data.

## 18.5 Transaction Sources

Conceptually:

```text
ONLINE_BOOKING
PHYSICAL_STORE
SUBSCRIPTION_PURCHASE
```

Exact enum names follow the API/database contract.

## 18.6 Transaction Search

Admin/worker views can search according to their permissions.

TV receives only the approved successful-transaction projection.

---

# 19. PAYMENT ENGINE

## 19.1 Supported Payment Paths

Current flows include:

- Razorpay;
- worker-assisted cash where permitted.

## 19.2 Razorpay Principle

The frontend/payment SDK callback is not sufficient to declare success.

Correct pattern:

```text
Create Payment Intent/Order
      ↓
Razorpay
      ↓
Customer/Worker Payment
      ↓
Gateway Callback
      ↓
Backend Verification
      ↓
Validate Amount/Reference/Signature
      ↓
Finalize Business Transaction
```

## 19.3 Payment Failure

Possible states:

- failed;
- cancelled;
- timeout;
- abandoned;
- pending verification.

The UI must not show final success until backend confirmation.

## 19.4 Duplicate Callback

A duplicate callback must be safe.

If the payment is already finalized:

```text
return existing finalized state
```

Do not create another:

- payment;
- transaction;
- inventory deduction;
- TV event.

## 19.5 Delayed Verification

If payment is pending:

```text
Payment Pending
      ↓
Backend verification/reconciliation
      ↓
Successful OR Failed
```

The client must not invent a result.

## 19.6 App/Browser Closure

If the customer closes the app/browser after payment:

The backend remains authoritative.

On reopening, retrieve transaction/payment state from backend.

---

# 20. CASH PAYMENT ENGINE

## 20.1 Scope

Cash payment is available only through the current Worker Portal physical-store workflow.

## 20.2 Cash Flow

```text
Bill Confirmed
    ↓
Subscription Calculation
    ↓
Remaining Payable
    ↓
Worker Selects Cash
    ↓
Backend Validates Worker Permission
    ↓
Transaction Finalized
```

## 20.3 Cash Safety

Worker must not be able to:

- mark an arbitrary amount as paid;
- bypass bill validation;
- bypass subscription calculation;
- bypass inventory rules;
- create a duplicate successful transaction.

---

# 21. REFUND / RESTORATION ENGINE

## 21.1 Principle

Cancellation/expiry restoration is not deletion.

The system preserves original records and creates reversal/restoration records.

## 21.2 Booking Restoration

Conceptual sequence:

```text
Booking
   ↓
Verify not already restored
   ↓
Release inventory
   ↓
Restore subscription quantity
   ↓
Restore subscription credit
   ↓
Restore applicable paid value according to business rule
   ↓
Create ledger records
   ↓
Mark restoration complete
```

## 21.3 Idempotency

A restoration must never run twice.

## 21.4 Payment Distinction

Preserve distinctions between:

- original booking amount;
- additional payment;
- subscription-covered value;
- refunded amount;
- restored subscription credit.

## 21.5 Razorpay Refunds

Where the locked business rule requires direct Razorpay refund, associate the refund with the original payment.

Do not create a fake payment transaction just to represent a refund.

---

# 22. GPS / JOURNEY ENGINE

## 22.1 Purpose

The Journey Engine manages truck journeys and controlled publication of GPS tracking.

## 22.2 OneLap Boundary

OneLap is isolated behind an integration adapter.

The core business system must not become tightly coupled to provider-specific GPS structures.

## 22.3 Journey Flow

```text
Truck Starts Journey
      ↓
OneLap GPS Active
      ↓
Backend Receives/Processes Location
      ↓
Admin Tracking
      ↓
Admin Publishes Customer Tracking
      ↓
Authorized Customers Receive Realtime Location
      ↓
Truck Arrives
      ↓
Configured Post-Arrival Period
      ↓
Customer Tracking Stops
```

## 22.4 Admin vs Customer GPS

Admin visibility and customer publication are separate.

Admin may continue seeing the journey after customer publication ends.

## 22.5 Stale Location

If GPS updates stop:

```text
last known location
+
stale indicator
```

must be used rather than pretending the location is current.

## 22.6 Provider Failure

OneLap outage must not corrupt booking or transaction data.

GPS should degrade independently.

---

# 23. NOTIFICATION ENGINE

## 23.1 Purpose

Notifications communicate business events.

Notifications are downstream of the business event.

## 23.2 Critical Principle

Notification failure must not roll back the underlying successful business transaction.

Example:

```text
Transaction Successful
       ↓
Transaction committed
       ↓
Notification attempted
       ↓
Notification fails
```

The transaction remains successful.

## 23.3 Notification Flow

```text
Business Event
      ↓
Notification Engine
      ↓
Notification Record
      ↓
Provider
      ↓
Customer Device
```

## 23.4 Notification Events

Examples:

- booking confirmed;
- booking cancelled;
- booking expired;
- transaction receipt;
- subscription purchase;
- subscription update;
- GPS journey published;
- GPS journey arrived/closed.

## 23.5 Duplicate Notification Protection

Use event IDs/idempotency keys.

A retried job must not create duplicate notifications unless the notification policy explicitly allows multiple sends.

## 23.6 Invalid Recipient

If the recipient is invalid:

- record failure;
- retry when appropriate;
- do not roll back the business transaction;
- surface operational failure to Admin where required.

---

# 24. REALTIME EVENT ENGINE

## 24.1 Purpose

Realtime events communicate committed state changes to clients.

## 24.2 Transaction Event

Required flow:

```text
Transaction Committed
       ↓
Successful Transaction Event
       ↓
TV Projection
       ↓
TV Displays
       ↓
Bell/Notification Sound
```

The TV acknowledgement never controls transaction success.

## 24.3 GPS Event

```text
OneLap Update
       ↓
Backend Journey State
       ↓
Authorized Realtime Clients
```

## 24.4 Event Envelope

Recommended event structure:

```json
{
  "event_id": "evt_xxx",
  "event_type": "transaction.successful",
  "occurred_at": "ISO-8601",
  "aggregate_type": "transaction",
  "aggregate_id": "txn_xxx",
  "version": 1,
  "data": {}
}
```

## 24.5 Event Idempotency

Consumers must store or otherwise recognize processed event IDs where duplicate delivery is possible.

---

# 25. SHOP TV PROJECTION ENGINE

## 25.1 Purpose

The TV shows successful transactions to shop staff in real time.

## 25.2 TV Query

TV history is limited to successful transactions for the active business day.

Conceptual query:

```text
status = SUCCESSFUL
AND successful_at belongs to current business day
ORDER BY successful_at DESC
```

## 25.3 Display Fields

The TV displays:

- Customer Name;
- Transaction ID;
- Fish Name;
- Quantity;
- Bill Number;
- Time;
- Successful Paid Amount.

It must not display internal payment gateway details.

## 25.4 New Transaction Event

When a transaction succeeds:

```text
Transaction committed
       ↓
Event emitted
       ↓
TV receives event
       ↓
New transaction appears
       ↓
Bell/notification sound plays
```

The sound should clearly signal a new successful transaction.

## 25.5 Sound Behavior

The sound is a UX signal for workers.

It must not:

- authorize a transaction;
- indicate payment before backend success;
- block transaction completion.

Recommended behavior:

```text
New successful event
       ↓
Visual highlight
       +
Short notification/bell sound
```

## 25.6 TV Offline

If TV is disconnected:

- transaction remains successful;
- event may be replayed/reconciled;
- TV refresh retrieves current business-day successful transactions.

## 25.7 Duplicate Event

A duplicate event must not create two visible transaction records.

The TV projection layer should deduplicate by event/transaction ID.

## 25.8 Browser Refresh

After refresh:

```text
TV authenticates
      ↓
Fetch current business-day successful transactions
      ↓
Subscribe to realtime
```

This ensures historical display recovery.

## 25.9 New Business Day

A new business day starts a new display history.

Previous-day transactions remain in backend history but are not shown as current-day TV entries.

---

# 26. REPORTING ENGINE

## 26.1 Purpose

Reporting reads authoritative business records without becoming a second transaction system.

## 26.2 Reports

Current report domains include:

- sales;
- transactions;
- inventory;
- subscriptions;
- bookings;
- discounts;
- operational summaries.

## 26.3 Historical Integrity

Reports must use historical transaction snapshots.

A current fish price must not retroactively change old sales reports.

## 26.4 Export

Supported export requirements may include:

- CSV;
- Excel-compatible output.

Exports must respect Admin permissions.

## 26.5 Large Reports

Large reports should use background generation where necessary.

The report job must be idempotent.

---

# 27. AUDIT ENGINE

## 27.1 Purpose

The Audit Engine preserves traceability for important actions.

## 27.2 Audit Events

Audit important actions such as:

- inventory adjustment;
- fish change;
- category change;
- price change;
- discount creation/change;
- subscription administrative adjustment;
- booking cancellation;
- transaction administrative action;
- freshness decision;
- customer block/deactivation;
- worker change;
- GPS publication control;
- notification campaign;
- settings changes.

## 27.3 Audit Record

Recommended fields:

```text
audit_id
actor_type
actor_id
action
entity_type
entity_id
before_state
after_state
reason
request_id
created_at
```

## 27.4 Immutability

Audit history should not be editable through normal Admin UI.

---

# 28. FILE STORAGE ENGINE

## 28.1 Purpose

Stores:

- bill images;
- fish images;
- other approved media.

## 28.2 Access Control

Private bill images must not be publicly exposed.

Use controlled access.

## 28.3 Bill Image Lifecycle

```text
Capture
 ↓
Upload
 ↓
Validate
 ↓
Store
 ↓
Link to Bill
 ↓
Transaction History
```

## 28.4 Upload Failure

If image upload fails:

- do not pretend the image is stored;
- allow retry;
- preserve enough context to safely retry;
- do not create duplicate bill records.

---

# 29. BACKGROUND JOB ENGINE

## 29.1 Purpose

Background jobs handle work that should not block critical user interactions.

Examples:

- booking expiry;
- freshness transitions;
- notification delivery;
- report generation;
- reconciliation;
- event replay;
- cleanup;
- integration polling where required.

## 29.2 Job Requirements

Every critical job must be:

- idempotent;
- retryable;
- observable;
- auditable where appropriate.

## 29.3 Retry Strategy

Recommended conceptual sequence:

```text
Attempt
 ↓
Failure
 ↓
Retry with backoff
 ↓
Success
```

After maximum retries:

```text
Dead-letter / operational failure
```

The exact queue/retry infrastructure belongs to deployment/backend implementation.

---

# 30. IDEMPOTENCY & CONCURRENCY ENGINE

## 30.1 Why This Exists

PondFish has multiple sources of repeated requests:

- user double-click;
- network retry;
- browser retry;
- mobile retry;
- gateway callback retry;
- background job retry;
- realtime duplicate;
- concurrent workers.

## 30.2 Critical Idempotent Operations

At minimum:

- payment callback;
- booking creation where retry semantics require it;
- booking completion;
- booking cancellation;
- booking expiry;
- inventory release;
- inventory deduction;
- subscription restoration;
- notification send;
- TV event processing;
- report job creation.

## 30.3 Request Idempotency

Where applicable:

```text
Idempotency-Key
+
authenticated actor
+
operation scope
```

must identify the logical operation.

## 30.4 Database Constraints

Important uniqueness rules should be protected by the database, not only by application code.

Examples:

- successful Bill ID;
- event ID;
- restoration reference;
- payment provider reference;
- booking QR identifier where applicable.

---

# 31. ERROR & RECOVERY ENGINE

## 31.1 Error Classes

The system distinguishes:

```text
VALIDATION_ERROR
BUSINESS_RULE_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
NOT_FOUND
CONFLICT
PAYMENT_ERROR
INTEGRATION_ERROR
NETWORK_ERROR
INTERNAL_ERROR
```

## 31.2 Stable Error Codes

Frontend clients must use stable machine-readable error codes.

Do not rely only on human-readable text.

## 31.3 Network Error

Network failure means:

```text
Operation result unknown
```

unless the backend has confirmed the result.

The UI must not automatically assume failure if a financial mutation may have reached the server.

## 31.4 Conflict

Examples:

- stock changed;
- booking already completed;
- fish no longer bookable;
- discount ended;
- subscription changed;
- duplicate Bill ID.

Return a business conflict and require fresh authoritative state.

---

# 32. CROSS-ENGINE ONLINE BOOKING TRANSACTION

## 32.1 Full Flow

```text
Customer
  ↓
Catalogue
  ↓
Fish Selection
  ↓
Cart
  ↓
Checkout Calculation
  ↓
Availability Engine
  ↓
Subscription Engine
  ↓
Payment Engine
  ↓
Booking Engine
  ↓
Inventory Reservation
  ↓
QR Engine
  ↓
Notification Engine
```

## 32.2 Critical Rule

All financial and inventory decisions are backend authoritative.

## 32.3 Booking Completion

```text
Worker
  ↓
Booking Lookup
  ↓
QR/Booking Validation
  ↓
State Validation
  ↓
Complete Booking
  ↓
Commit
  ↓
Customer Notification
```

---

# 33. CROSS-ENGINE PHYSICAL PURCHASE TRANSACTION

## 33.1 Full Flow

```text
Physical Bill
  ↓
File Storage
  ↓
AI Extraction
  ↓
Worker/Customer Review
  ↓
Bill Validation
  ↓
Duplicate Bill Check
  ↓
Subscription Engine
  ↓
Payment Engine
  ↓
Transaction Engine
  ↓
Inventory Engine
  ↓
Subscription Ledger
  ↓
Audit
  ↓
Realtime Event
  ↓
TV Projection
```

## 33.2 Critical Commit

The business transaction must not be considered successful until the required atomic finalization succeeds.

---

# 34. CROSS-ENGINE SUBSCRIPTION PURCHASE

```text
Plan Selection
      ↓
Payment
      ↓
Server Verification
      ↓
Subscription Update
      ↓
Credit Ledger Entry
      ↓
Weekly Allowance Setup
      ↓
Transaction/History
      ↓
Notification
```

If payment verification fails:

```text
Subscription remains unchanged
```

unless a controlled reconciliation process later confirms success.

---

# 35. CROSS-ENGINE BOOKING CANCELLATION

```text
Cancel Request
      ↓
Booking State Validation
      ↓
Atomic Cancellation
      ↓
Inventory Reservation Release
      ↓
Subscription Quantity Restoration
      ↓
Subscription Credit Restoration
      ↓
Applicable Paid Value Restoration
      ↓
QR Invalidation
      ↓
Audit
      ↓
Notification
```

Notification failure must not undo the cancellation.

---

# 36. CROSS-ENGINE BOOKING EXPIRY

```text
Expiry Job
      ↓
Lock/Validate Booking
      ↓
Already Completed?
   ┌──┴──┐
  YES    NO
   |      |
 STOP   Already Expired?
           |
        ┌──┴──┐
       YES    NO
        |      |
       STOP   EXPIRE
                ↓
        Invalidate QR
                ↓
        Release Inventory
                ↓
        Restore Subscription
                ↓
        Record Ledger Reversals
                ↓
        Update History
                ↓
        Emit Event
                ↓
        Notification
```

The process is idempotent.

---

# 37. CROSS-ENGINE TV TRANSACTION EVENT

```text
Successful Transaction Commit
          ↓
event_id generated
          ↓
Realtime Event
          ↓
TV Consumer
          ↓
Deduplicate
          ↓
Project Transaction
          ↓
Visual Highlight
          ↓
Bell / Notification Sound
```

If TV is offline:

```text
Transaction still successful
```

On reconnect:

```text
TV fetches current-day successful history
+
subscribes to new realtime events
```

---

# 38. CROSS-ENGINE GPS EVENT

```text
OneLap
  ↓
GPS Adapter
  ↓
Normalized Location
  ↓
Journey State
  ↓
Admin Visibility
  ↓
Customer Publication if Enabled
  ↓
Realtime
```

A GPS outage must not change payment, booking, or inventory state.

---

# 39. PUBLIC WEBSITE ↔ ADMIN RELATIONSHIP

The public website is dynamic for operational catalogue data.

Admin changes can affect:

```text
Admin
  ├── Fish
  ├── Category
  ├── Price
  ├── Discount
  ├── Online Booking Flag
  └── Availability
       ↓
Shared Backend
       ↓
Public Website
       +
Customer App
```

The website should show:

- all active fish by category;
- store availability;
- online-booking availability;
- active discounts.

The website must not expose internal administrative details.

---

# 40. CUSTOMER APP ↔ ADMIN RELATIONSHIP

Customer-facing availability is derived from backend truth.

Admin can affect:

- fish active state;
- inventory;
- online-booking flag;
- freshness;
- discount;
- subscription plan configuration.

Customer app receives the resulting state.

It does not cache business truth indefinitely.

---

# 41. WORKER ↔ TV RELATIONSHIP

The worker does not manually send transactions to TV.

Correct flow:

```text
Worker completes physical transaction
       ↓
Backend transaction succeeds
       ↓
Successful event
       ↓
TV
```

This guarantees TV represents successful backend transactions rather than worker intent.

---

# 42. ADMIN ↔ TV RELATIONSHIP

Admin may inspect transaction history and operational state.

Admin does not manually create a TV success event as a substitute for a real transaction.

TV events originate from committed successful transactions.

---

# 43. INVENTORY ↔ SUBSCRIPTION RELATIONSHIP

These are separate domains.

Inventory answers:

```text
How much fish exists / is reserved?
```

Subscription answers:

```text
How much weekly quantity and monetary credit does the customer have?
```

A booking may consume both.

Both mutations must remain consistent.

---

# 44. INVENTORY ↔ PAYMENT RELATIONSHIP

Payment success does not automatically mean inventory can be deducted without validation.

Final business operation must verify:

- correct amount;
- correct item;
- valid inventory;
- valid booking/transaction;
- no duplicate operation.

---

# 45. PAYMENT ↔ TV RELATIONSHIP

TV reacts only after transaction success.

Therefore:

```text
Payment attempt
≠
TV event
```

Instead:

```text
Verified Payment
+
Successful Transaction Commit
=
TV Event
```

---

# 46. NOTIFICATION ↔ BUSINESS STATE RELATIONSHIP

Notifications communicate state.

They do not create state.

Incorrect:

```text
Send "Booking Expired"
↓
Expire booking
```

Correct:

```text
Backend expires booking
↓
Booking state committed
↓
Send "Booking Expired"
```

---

# 47. ENGINE STATE OWNERSHIP MATRIX

| Domain | Authoritative Engine | Database State | Client May Decide? |
|---|---|---|---|
| Fish | Fish Engine | Yes | No |
| Category | Fish/Category Engine | Yes | No |
| Inventory | Inventory Engine | Yes | No |
| Freshness | Freshness Engine | Yes | No |
| Availability | Availability Engine | Yes | No |
| Discount | Discount Engine | Yes | No |
| Subscription | Subscription Engine | Yes | No |
| Cart | Client + Checkout Engine | Checkout server truth | No final financial truth |
| Booking | Booking Engine | Yes | No |
| QR | QR Engine | Yes | No |
| Bill | Bill Engine | Yes | No |
| AI extraction | AI Bill Engine | Yes | No final transaction truth |
| Payment | Payment Engine | Yes | No |
| Transaction | Transaction Engine | Yes | No |
| GPS | Journey Engine | Yes | No |
| Notification | Notification Engine | Yes | No |
| TV | TV Projection Engine | Projection/cache | No |
| Audit | Audit Engine | Yes | No |
| Reports | Reporting Engine | Read model/query | No |

---

# 48. NON-FUNCTIONAL REQUIREMENTS

## 48.1 Consistency

Inventory, subscription, payment and transaction state must remain consistent after retries and concurrency.

## 48.2 Reliability

A downstream failure must not corrupt an already committed business transaction.

## 48.3 Security

Authorization must be enforced server-side.

## 48.4 Observability

Critical operations should produce:

- request ID;
- event ID where applicable;
- actor;
- timestamps;
- structured logs;
- error code;
- correlation information.

## 48.5 Performance

Read-heavy catalogue operations should be optimized without weakening transactional correctness.

Critical mutations should favor correctness over unsafe optimistic shortcuts.

---

# 49. REQUIRED BUSINESS ERROR SCENARIOS

The engines must explicitly support:

## Inventory

- insufficient stock;
- last-unit race;
- reservation conflict;
- duplicate release;
- duplicate deduction;
- negative quantity attempt.

## Subscription

- no subscription;
- expired subscription;
- insufficient weekly allowance;
- insufficient credit;
- invalid plan;
- duplicate credit addition;
- duplicate restoration.

## Booking

- fish no longer bookable;
- inventory changed;
- booking expired;
- booking cancelled;
- booking already completed;
- invalid transition;
- duplicate completion.

## Bill

- blurry bill;
- AI failure;
- missing Bill ID;
- unreadable Bill ID;
- duplicate successful Bill ID;
- unknown fish;
- quantity mismatch;
- price mismatch;
- total mismatch.

## Payment

- failure;
- timeout;
- cancel;
- duplicate callback;
- delayed verification;
- provider outage;
- app closed after payment.

## GPS

- provider unavailable;
- stale location;
- reconnection;
- false-arrival risk;
- customer publication disabled.

## TV

- network loss;
- browser refresh;
- TV restart;
- missed event;
- duplicate event;
- new business day.

## Notification

- provider failure;
- retry;
- duplicate event;
- invalid recipient.

---

# 50. ENGINE ACCEPTANCE CRITERIA

The Core Business Engines specification is considered implemented correctly when:

### Architecture

- [ ] No portal owns critical business truth.
- [ ] Business logic is centralized in shared engines.
- [ ] Current MVP can operate as a modular monolith.
- [ ] Integrations remain isolated behind adapters.

### Inventory

- [ ] Physical, reserved and available quantities are maintained.
- [ ] Available = physical - reserved.
- [ ] Reservation cannot exceed available.
- [ ] Negative stock cannot be created.
- [ ] Release is idempotent.
- [ ] Deduction is idempotent.
- [ ] Inventory movements are auditable.

### Freshness

- [ ] Freshness state is calculated from backend timestamps/configuration.
- [ ] Red fish is removed from online availability.
- [ ] Physical handling remains an Admin decision.
- [ ] Freshness transitions are auditable.

### Discounts

- [ ] Active discount is backend-controlled.
- [ ] Expired campaigns stop affecting price.
- [ ] Discount stacking is deterministic.
- [ ] Checkout revalidates discount.

### Subscription

- [ ] Type 1 = ₹2,000 / 2 kg weekly.
- [ ] Type 2 = ₹6,000 / 3 kg weekly.
- [ ] Weekly quantity is measured in kg.
- [ ] Subscription is not restricted to a fish type.
- [ ] Credit is ledger-based.
- [ ] Expired subscription cannot provide coverage.
- [ ] Restoration is idempotent.

### Booking

- [ ] Only online-bookable fish can be booked.
- [ ] Cart does not reserve stock.
- [ ] Checkout revalidates availability.
- [ ] Booking validity is 48 hours.
- [ ] Expiry is backend-controlled.
- [ ] Cancellation is atomic.
- [ ] Completion is atomic.
- [ ] Duplicate completion is blocked.
- [ ] QR becomes invalid after terminal state.

### Bill/AI

- [ ] Bill ID is duplicate-protected.
- [ ] AI extraction is reviewable.
- [ ] Manual correction is supported.
- [ ] Failed attempts remain retryable unless successfully processed.
- [ ] Historical extraction/correction information can be audited.

### Payments

- [ ] Payment is server-verified.
- [ ] Duplicate callbacks are safe.
- [ ] Payment failure cannot create successful transactions.
- [ ] App/browser closure does not corrupt payment state.

### Transactions

- [ ] Finalization is atomic.
- [ ] Historical values are preserved.
- [ ] Successful transaction event is emitted only after commit.
- [ ] TV failure cannot roll back transaction success.

### TV

- [ ] Only successful transactions appear.
- [ ] New transactions appear in realtime.
- [ ] New successful transactions trigger a short bell/notification sound.
- [ ] Duplicate events are deduplicated.
- [ ] TV recovers after refresh/disconnection.
- [ ] Business-day history is separated.

### GPS

- [ ] OneLap is isolated behind an adapter.
- [ ] Admin tracking and customer publication are separate.
- [ ] Customer tracking closes after configured arrival period.
- [ ] Stale locations are identifiable.
- [ ] GPS failure cannot corrupt financial workflows.

### Notifications

- [ ] Notifications are downstream.
- [ ] Notification failure cannot roll back business success.
- [ ] Duplicate sends are controlled.
- [ ] Failed delivery is observable.

### Audit

- [ ] Critical administrative actions are audited.
- [ ] Original and resulting state can be traced where required.
- [ ] Audit records are not casually editable.

---

# 51. QA MASTER MATRIX

## 51.1 Inventory Concurrency

| Test | Expected |
|---|---|
| Two users book final quantity | Only valid quantity succeeds |
| Cancellation releases reservation | Quantity becomes bookable |
| Expiry releases reservation | Quantity becomes bookable |
| Release job runs twice | Quantity released once |
| Deduction retry | Deducted once |
| Negative adjustment | Rejected/controlled |

## 51.2 Subscription

| Test | Expected |
|---|---|
| Type 1 new purchase | 2 kg weekly allowance |
| Type 2 new purchase | 3 kg weekly allowance |
| Use partial quantity | Remaining quantity decreases correctly |
| Use full quantity | Remaining becomes zero |
| Expire subscription | No new coverage |
| Restore cancelled booking | Quantity/credit restored once |
| Duplicate restore | No second restoration |

## 51.3 Booking

| Test | Expected |
|---|---|
| Valid booking | Created |
| Fish becomes unavailable before checkout | Booking rejected |
| Booking expires | Expired |
| Expiry twice | One effect |
| Cancel active booking | Cancelled |
| Cancel completed booking | Rejected |
| Complete expired booking | Rejected |
| Complete twice | Second completion rejected |

## 51.4 Physical Transaction

| Test | Expected |
|---|---|
| Valid bill | Can proceed |
| Blurry bill | Retry/review |
| Missing Bill ID | Manual entry |
| Duplicate successful Bill ID | Rejected |
| Payment success | Transaction finalized |
| Payment failure | Not successful |
| Duplicate callback | No duplicate transaction |
| TV unavailable | Transaction remains successful |

## 51.5 TV

| Test | Expected |
|---|---|
| Successful transaction | Appears |
| Failed transaction | Does not appear |
| Duplicate event | One display |
| TV refresh | Current-day history restored |
| Network disconnect | Existing state retained/recovered |
| New transaction after reconnect | Appears |
| New business day | Previous-day list not mixed into current day |
| Successful transaction | Bell sound plays once per accepted event |

---

# 52. IMPLEMENTATION RULES FOR AI CODING AGENTS

AI coding agents must follow these rules.

## Rule 01 — Do Not Duplicate Business Logic

Do not implement subscription calculations independently in:

- React Native;
- Worker;
- Admin;
- Website.

Use shared API/domain behavior.

## Rule 02 — Backend Is Authoritative

Never trust client-calculated:

- price;
- discount;
- payment success;
- inventory;
- subscription credit;
- booking status.

## Rule 03 — Do Not Create Fake Success

Do not show final success before backend confirmation.

## Rule 04 — Preserve Idempotency

Every mutation that can be retried must be designed for safe retry.

## Rule 05 — Preserve History

Never overwrite historical transaction values because current catalogue data changed.

## Rule 06 — Do Not Use Notifications as State Mutations

Notifications communicate committed state.

## Rule 07 — Do Not Use TV as Transaction Authority

TV is a projection.

## Rule 08 — Do Not Use Local Timers as Business Authority

Booking expiry and freshness transitions must be backend-controlled.

## Rule 09 — Do Not Bypass Database Constraints

Critical uniqueness and consistency must be enforced at database level where appropriate.

## Rule 10 — Preserve Existing Workflow

If implementation needs a new business rule, update the specification before coding it.

---

# 53. FRONTEND IMPLEMENTATION CONTRACT

Every client operation should map to:

```text
UI Action
   ↓
Feature Handler
   ↓
API Client
   ↓
Backend Endpoint
   ↓
Domain Engine
   ↓
Database Transaction
   ↓
Event
   ↓
Client State Refresh / Realtime Update
```

The frontend should handle:

- loading;
- success;
- validation errors;
- business errors;
- network errors;
- permission errors;
- conflict errors;
- retry.

The frontend should not contain hidden business authority.

---

# 54. API IMPLEMENTATION CONTRACT

All production APIs use versioning such as:

```text
/api/v1
```

Recommended response shape:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Error:

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

Clients must depend on stable error codes rather than only message strings.

---

# 55. DATABASE IMPLEMENTATION CONTRACT

The database is the authoritative transactional state store.

It must support:

- relational consistency;
- foreign keys;
- unique constraints;
- transactional boundaries;
- ledger records;
- historical snapshots;
- idempotency records;
- audit records;
- event records where required.

The database must not depend on UI state to preserve business truth.

---

# 56. EVENT IMPLEMENTATION CONTRACT

Events should represent committed state changes.

Examples:

```text
booking.created
booking.cancelled
booking.expired
booking.completed

transaction.successful
transaction.failed

subscription.activated
subscription.updated

inventory.changed

gps.location.updated
journey.customer_tracking.started
journey.customer_tracking.ended

notification.created
```

Exact event names should be aligned with the final API/realtime specification before production implementation.

---

# 57. INTEGRATION BOUNDARIES

## Razorpay

Used for payment processing.

Business logic must remain inside PondFish.

## OneLap

Used for GPS location data.

Provider-specific structures remain inside the GPS adapter.

## AI/OCR

Used for bill extraction.

AI output is input to the review/validation process, not final business truth.

## Notification Provider

Used to deliver notifications.

Provider failure must not corrupt core transactions.

---

# 58. FUTURE POS + SI-801 INTEGRATION

Current MVP:

```text
SI-801 / weighing process
       ↓
External bill
       ↓
Worker bill capture
       ↓
PondFish processing
```

There is currently no direct POS/weighing-machine integration.

Future:

```text
SI-801
   ↓
POS
   ↓
PondFish Adapter
   ↓
Normalized Bill / Transaction Model
   ↓
Existing Transaction Engine
```

The future integration must not create a parallel transaction engine.

The following must remain consistent:

- Bill ID;
- customer;
- fish;
- quantity;
- physical bill amount;
- subscription coverage;
- extra amount;
- payment;
- transaction;
- worker;
- inventory;
- audit;
- TV event.

---

# 59. CURRENT MVP EXCLUSIONS

The following are not core MVP requirements unless separately approved:

- multiple stores;
- multiple trucks;
- multiple worker permission tiers;
- direct POS integration;
- direct weighing-machine integration;
- advanced worker analytics;
- offline transaction queue;
- printer integration;
- worker-controlled inventory editing;
- worker subscription management;
- worker GPS management;
- worker notification campaigns.

Future additions must preserve the existing engines and business rules.

---

# 60. FINAL MASTER ENGINE FLOW

```text
                         ┌────────────────────┐
                         │   AUTHENTICATION    │
                         └─────────┬──────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │     CATALOGUE / FISH        │
                    │        / CATEGORY           │
                    └──────────────┬──────────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               │                   │                   │
               ▼                   ▼                   ▼
          INVENTORY            FRESHNESS           DISCOUNT
               │                   │                   │
               └───────────────────┼───────────────────┘
                                   │
                           AVAILABILITY ENGINE
                                   │
                 ┌─────────────────┴────────────────┐
                 │                                  │
                 ▼                                  ▼
          ONLINE BOOKING                     PHYSICAL BILL
                 │                                  │
                 ▼                                  ▼
          CHECKOUT ENGINE                    AI EXTRACTION
                 │                                  │
                 ▼                                  ▼
          SUBSCRIPTION ENGINE                BILL VALIDATION
                 │                                  │
                 └─────────────────┬────────────────┘
                                   │
                             PAYMENT ENGINE
                                   │
                                   ▼
                          TRANSACTION ENGINE
                                   │
                     ┌─────────────┼─────────────┐
                     │             │             │
                     ▼             ▼             ▼
                INVENTORY     SUBSCRIPTION     AUDIT
                MUTATION         LEDGER
                     │             │
                     └──────┬──────┘
                            ▼
                    TRANSACTION COMMIT
                            │
             ┌──────────────┼────────────────┐
             │              │                │
             ▼              ▼                ▼
          REALTIME      NOTIFICATION       REPORTING
             │
             ▼
         SHOP TV
             │
             ▼
      VISUAL + BELL SOUND
```

---

# 61. FINAL PRINCIPLE

The PondFish system should be implemented around one central principle:

> **Applications request actions. Domain engines enforce rules. The database preserves truth. Events communicate committed state changes. Integrations remain replaceable.**

This principle is more important than any individual UI implementation.

The Public Website, Customer React Native App, Worker Portal, Admin Portal and Shop TV should therefore behave as different interfaces over the same business system rather than five independent systems.

---

# 62. NEXT ARTIFACTS

After this Core Business Engines Specification, the remaining implementation-oriented documents should proceed in dependency order:

```text
CORE BUSINESS ENGINES
        ↓
INTEGRATION SPECIFICATION
        ↓
CROSS-SYSTEM VALIDATION / ERROR SPECIFICATION
        ↓
QA / TEST SPECIFICATION
        ↓
DEPLOYMENT / DEVOPS SPECIFICATION
        ↓
MASTER AI CODING PROMPT
        ↓
IMPLEMENTATION
```

The Master AI Coding Prompt should be created last because it must reference the locked versions of the PRD, architecture, database, API, UI/page specifications, core engines, integrations, QA and deployment rules.

---

# DOCUMENT END
