# PONDFISH --- DATABASE, ERD & DATA MODEL SPECIFICATION

**Version:** 1.0\
**Status:** Architecture Baseline\
**Purpose:** Database and data-model foundation for implementation\
**Parent Documents:** PondFish Master PRD, PondFish System & Technical
Architecture v1.0

------------------------------------------------------------------------

# 1. Document Purpose

This document defines the persistent data model required for the
PondFish system.

It establishes:

-   Core entities
-   Table responsibilities
-   Primary keys
-   Foreign keys
-   Relationships
-   Important constraints
-   Transactional boundaries
-   Inventory modelling
-   Subscription modelling
-   Booking modelling
-   Bill and AI extraction modelling
-   Payment modelling
-   GPS journey modelling
-   Notification modelling
-   Audit modelling
-   Realtime/event records
-   Historical data requirements
-   Idempotency requirements

The database is the authoritative source for transactional business
state.

UI screens must never become the source of truth.

------------------------------------------------------------------------

# 2. Database Design Principles

## 2.1 Relational consistency

PondFish contains strong relationships between:

``` text
Customer
   ↓
Subscription
   ↓
Credit / Quantity Usage
   ↓
Booking / Transaction
   ↓
Payment
   ↓
Inventory
```

A relational database is therefore the baseline architecture.

## 2.2 Ledger-based financial data

Balances that affect money must be explainable through ledger entries.

Do not rely only on:

``` text
subscription.credit_balance = 3200
```

The system should also preserve the movements that produced the balance.

## 2.3 Historical snapshots

Transactions must preserve the values used at the time of purchase.

If a fish price later changes, an old transaction must not change.

Therefore transaction items store historical:

-   Fish name
-   Quantity
-   Unit price
-   Discount
-   Tax
-   Subscription-covered value
-   Extra amount

------------------------------------------------------------------------

# 3. High-Level ERD

``` text
                    ┌──────────────┐
                    │  CUSTOMERS   │
                    └──────┬───────┘
                           │
             ┌─────────────┼──────────────┐
             │             │              │
             ▼             ▼              ▼
      ┌────────────┐ ┌────────────┐ ┌──────────────┐
      │SUBSCRIPTIONS│ │ BOOKINGS   │ │ TRANSACTIONS │
      └─────┬──────┘ └─────┬──────┘ └──────┬───────┘
            │              │               │
      ┌─────▼─────┐  ┌─────▼──────┐  ┌─────▼──────┐
      │  CREDIT    │  │BOOKING     │  │TRANSACTION │
      │  LEDGER    │  │ITEMS       │  │ITEMS       │
      └────────────┘  └─────┬──────┘  └─────┬──────┘
                            │               │
                            └───────┬───────┘
                                    ▼
                              ┌────────────┐
                              │   FISH     │
                              └─────┬──────┘
                                    │
                         ┌──────────▼──────────┐
                         │ INVENTORY / BATCHES │
                         └─────────────────────┘

Transactions ───────→ Payments
Transactions ───────→ Bills
Transactions ───────→ Workers
Bookings ────────────→ Payments

Fish ────────────────→ Categories
Fish ────────────────→ Freshness Rules
Fish ────────────────→ Discounts

Admin ───────────────→ GPS Journeys
GPS Journeys ────────→ GPS Positions

All critical entities ─→ Audit Logs
Domain changes ───────→ Events / Realtime
```

------------------------------------------------------------------------

# 4. Identity and Access Tables

## 4.1 customers

Stores customer identity and profile.

### Key fields

  Field           Type        Purpose
  --------------- ----------- ----------------------
  id              UUID        Primary key
  mobile_number   VARCHAR     OTP login identifier
  name            VARCHAR     Customer name
  age             INTEGER     Customer age
  area            VARCHAR     Customer area
  status          ENUM        Active/inactive
  created_at      TIMESTAMP   Creation
  updated_at      TIMESTAMP   Last update

### Constraints

-   `mobile_number` unique.
-   Customer does not have a password.
-   Deactivation must not delete historical transactions.

------------------------------------------------------------------------

## 4.2 workers

  Field           Type        Purpose
  --------------- ----------- -----------------
  id              UUID        Primary key
  name            VARCHAR     Worker name
  email           VARCHAR     Login
  password_hash   VARCHAR     Secure password
  status          ENUM        Active/inactive
  created_at      TIMESTAMP   Creation
  updated_at      TIMESTAMP   Last update

Email must be unique.

------------------------------------------------------------------------

## 4.3 admins

  Field           Type        Purpose
  --------------- ----------- -----------------
  id              UUID        Primary key
  name            VARCHAR     Admin name
  email           VARCHAR     Login
  password_hash   VARCHAR     Secure password
  status          ENUM        Active/inactive
  created_at      TIMESTAMP   Creation
  updated_at      TIMESTAMP   Last update

------------------------------------------------------------------------

# 5. Fish Catalogue

## 5.1 categories

  Field           Type
  --------------- -----------
  id              UUID
  name            VARCHAR
  description     TEXT
  image_url       TEXT
  display_order   INTEGER
  active          BOOLEAN
  created_at      TIMESTAMP
  updated_at      TIMESTAMP

A category contains multiple fish.

------------------------------------------------------------------------

## 5.2 fish

  Field                    Type        Purpose
  ------------------------ ----------- ----------------------
  id                       UUID        Primary key
  category_id              UUID        Category
  name                     VARCHAR     Fish name
  description              TEXT        Description
  image_url                TEXT        Product image
  unit_price               DECIMAL     Current price
  online_booking_enabled   BOOLEAN     Can be booked online
  active                   BOOLEAN     Catalogue status
  created_at               TIMESTAMP   Creation
  updated_at               TIMESTAMP   Update

### Important

Online booking eligibility is controlled by Admin.

The cart may contain only fish where:

``` text
active = true
AND online_booking_enabled = true
```

Availability is separately validated against inventory.

------------------------------------------------------------------------

# 6. Fish Freshness

## 6.1 fish_freshness_rules

Defines configurable freshness durations.

  Field               Type
  ------------------- -----------
  id                  UUID
  fish_id             UUID
  green_until_hours   DECIMAL
  grey_until_hours    DECIMAL
  red_after_hours     DECIMAL
  active              BOOLEAN
  created_by          UUID
  created_at          TIMESTAMP
  updated_at          TIMESTAMP

Example:

``` text
0–24 hours → Green
24–48 hours → Grey
48+ hours → Red
```

The values are configurable per fish.

------------------------------------------------------------------------

## 6.2 inventory_batches

A physical fish arrival/stock batch.

  Field                Type
  -------------------- -----------
  id                   UUID
  fish_id              UUID
  received_quantity    DECIMAL
  remaining_quantity   DECIMAL
  received_at          TIMESTAMP
  freshness_status     ENUM
  status               ENUM
  created_at           TIMESTAMP
  updated_at           TIMESTAMP

This table allows freshness to be calculated from the physical batch
rather than only from the fish master record.

------------------------------------------------------------------------

# 7. Inventory

## 7.1 inventory

Current operational inventory summary.

  Field                Type
  -------------------- -----------
  id                   UUID
  fish_id              UUID
  physical_quantity    DECIMAL
  reserved_quantity    DECIMAL
  available_quantity   DECIMAL
  updated_at           TIMESTAMP

Invariant:

``` text
available_quantity =
physical_quantity - reserved_quantity
```

The exact implementation may calculate available quantity instead of
storing it, but the business invariant must remain true.

------------------------------------------------------------------------

## 7.2 inventory_ledger

Immutable inventory movement history.

  Field            Type
  ---------------- -----------
  id               UUID
  fish_id          UUID
  batch_id         UUID
  movement_type    ENUM
  quantity         DECIMAL
  reference_type   VARCHAR
  reference_id     UUID
  performed_by     UUID
  created_at       TIMESTAMP

Movement types may include:

``` text
RECEIVED
RESERVED
RESERVATION_RELEASED
SOLD
ADJUSTED
DISPOSED
WASTAGE
```

Inventory corrections must not silently overwrite history.

------------------------------------------------------------------------

# 8. Discounts

## 8.1 discount_campaigns

  Field            Type
  ---------------- -----------
  id               UUID
  name             VARCHAR
  description      TEXT
  discount_type    ENUM
  discount_value   DECIMAL
  start_at         TIMESTAMP
  end_at           TIMESTAMP
  status           ENUM
  created_by       UUID
  created_at       TIMESTAMP
  updated_at       TIMESTAMP

Statuses:

``` text
DRAFT
SCHEDULED
ACTIVE
ENDED
CANCELLED
```

------------------------------------------------------------------------

## 8.2 discount_campaign_items

  Field         Type
  ------------- -----------
  id            UUID
  campaign_id   UUID
  fish_id       UUID
  created_at    TIMESTAMP

This allows a campaign to apply to selected fish.

------------------------------------------------------------------------

# 9. Subscriptions

## 9.1 subscription_plans

  Field                   Type
  ----------------------- -----------
  id                      UUID
  name                    VARCHAR
  price                   DECIMAL
  weekly_quantity_limit   DECIMAL
  duration_days           INTEGER
  active                  BOOLEAN
  created_at              TIMESTAMP
  updated_at              TIMESTAMP

Example business plans:

``` text
Type 1 → ₹2,000
Type 2 → ₹6,000
```

The exact plan values should be configuration, not hardcoded in frontend
code.

------------------------------------------------------------------------

## 9.2 customer_subscriptions

  Field                  Type
  ---------------------- -----------
  id                     UUID
  customer_id            UUID
  plan_id                UUID
  start_at               TIMESTAMP
  expires_at             TIMESTAMP
  status                 ENUM
  credit_balance         DECIMAL
  weekly_quantity_used   DECIMAL
  weekly_period_start    DATE
  created_at             TIMESTAMP
  updated_at             TIMESTAMP

### Important

The current balance fields are convenience/current-state fields.

The authoritative explanation comes from ledger tables.

------------------------------------------------------------------------

# 10. Subscription Credit Ledger

## 10.1 subscription_credit_ledger

Every monetary subscription change is recorded.

  Field             Type
  ----------------- -----------
  id                UUID
  subscription_id   UUID
  entry_type        ENUM
  amount            DECIMAL
  balance_after     DECIMAL
  reference_type    VARCHAR
  reference_id      UUID
  description       TEXT
  created_at        TIMESTAMP

Entry types:

``` text
PURCHASE
PURCHASE_ONLINE
PURCHASE_ADMIN_CASH
PURCHASE_ADMIN_RAZORPAY
PURCHASE_TOPUP
TRANSACTION_DEDUCTION
BOOKING_REFUND
CANCELLATION_RESTORE
EXPIRY_RESTORE
ADJUSTMENT
```

------------------------------------------------------------------------

# 11. Subscription Quantity Usage

## 11.1 subscription_usage_ledger

  Field             Type
  ----------------- -----------
  id                UUID
  subscription_id   UUID
  fish_id           UUID
  quantity          DECIMAL
  usage_type        ENUM
  reference_type    VARCHAR
  reference_id      UUID
  period_start      DATE
  created_at        TIMESTAMP

Usage types:

``` text
PURCHASE
BOOKING
RESTORE
ADJUSTMENT
```

This supports weekly quantity limits.

------------------------------------------------------------------------

# 12. Subscription Eligibility

Fish eligibility should be represented explicitly rather than using
vague conceptual Type A/Type B labels.

## 12.1 subscription_plan_fish

  Field        Type
  ------------ -----------
  id           UUID
  plan_id      UUID
  fish_id      UUID
  enabled      BOOLEAN
  created_at   TIMESTAMP

This allows Admin to determine exactly which fish a plan covers.

------------------------------------------------------------------------

# 13. Online Bookings

## 13.1 bookings

  Field                 Type
  --------------------- -----------
  id                    UUID
  booking_number        VARCHAR
  customer_id           UUID
  status                ENUM
  subtotal              DECIMAL
  discount_amount       DECIMAL
  subscription_amount   DECIMAL
  extra_amount          DECIMAL
  total_amount          DECIMAL
  payment_status        ENUM
  expires_at            TIMESTAMP
  completed_at          TIMESTAMP
  cancelled_at          TIMESTAMP
  created_at            TIMESTAMP
  updated_at            TIMESTAMP

Booking statuses:

``` text
CREATED
PAYMENT_PENDING
CONFIRMED
READY_FOR_COLLECTION
COMPLETED
CANCELLED
EXPIRED
```

------------------------------------------------------------------------

## 13.2 booking_items

  Field                   Type
  ----------------------- -----------
  id                      UUID
  booking_id              UUID
  fish_id                 UUID
  quantity                DECIMAL
  unit_price              DECIMAL
  discount_amount         DECIMAL
  subscription_quantity   DECIMAL
  subscription_amount     DECIMAL
  extra_quantity          DECIMAL
  extra_amount            DECIMAL
  created_at              TIMESTAMP

Historical prices are stored here.

------------------------------------------------------------------------

# 14. Bills

## 14.1 bills

The physical bill identity.

  Field                 Type
  --------------------- -----------
  id                    UUID
  bill_number           VARCHAR
  bill_image_id         UUID
  extraction_status     ENUM
  confirmation_status   ENUM
  processing_status     ENUM
  scanned_by_type       ENUM
  scanned_by_id         UUID
  created_at            TIMESTAMP
  updated_at            TIMESTAMP

### Critical constraint

A successfully processed bill number must be unique.

Recommended logical rule:

``` text
UNIQUE(bill_number)
```

If business requirements later allow repeated bill numbers across
separate stores, uniqueness must become store-scoped. The current
single-store architecture can use bill number uniqueness.

------------------------------------------------------------------------

# 15. Bill AI Extraction

## 15.1 bill_extractions

  Field                   Type
  ----------------------- -----------
  id                      UUID
  bill_id                 UUID
  model_name              VARCHAR
  model_version           VARCHAR
  extracted_bill_number   VARCHAR
  extracted_total         DECIMAL
  confidence              DECIMAL
  raw_result              JSON
  extraction_status       ENUM
  created_at              TIMESTAMP

AI output is not authoritative.

------------------------------------------------------------------------

## 15.2 bill_extraction_items

  Field             Type
  ----------------- -----------
  id                UUID
  extraction_id     UUID
  fish_name_raw     VARCHAR
  matched_fish_id   UUID
  quantity          DECIMAL
  unit_price        DECIMAL
  line_total        DECIMAL
  confidence        DECIMAL
  created_at        TIMESTAMP

This preserves exactly what the AI extracted.

------------------------------------------------------------------------

# 16. Bill Images

## 16.1 files

Generic metadata for stored files.

  Field              Type
  ------------------ -----------
  id                 UUID
  storage_provider   VARCHAR
  storage_key        TEXT
  file_name          VARCHAR
  mime_type          VARCHAR
  file_size          BIGINT
  visibility         ENUM
  created_at         TIMESTAMP

Bill images should use:

``` text
visibility = PRIVATE
```

------------------------------------------------------------------------

# 17. Physical Transactions

## 17.1 transactions

The central successful/failed transaction record.

  Field                 Type
  --------------------- ---------------
  id                    UUID
  transaction_number    VARCHAR
  customer_id           UUID
  worker_id             UUID
  booking_id            UUID nullable
  bill_id               UUID nullable
  transaction_type      ENUM
  status                ENUM
  subtotal              DECIMAL
  discount_amount       DECIMAL
  subscription_amount   DECIMAL
  extra_amount          DECIMAL
  gateway_fee           DECIMAL
  gateway_gst           DECIMAL
  total_amount          DECIMAL
  payment_method        ENUM
  successful_at         TIMESTAMP
  created_at            TIMESTAMP
  updated_at            TIMESTAMP

Transaction types:

``` text
PHYSICAL_PURCHASE
ONLINE_BOOKING
```

Statuses:

``` text
PENDING
PROCESSING
SUCCESSFUL
FAILED
CANCELLED
```

------------------------------------------------------------------------

# 18. Transaction Items

## 18.1 transaction_items

  Field                   Type
  ----------------------- -----------
  id                      UUID
  transaction_id          UUID
  fish_id                 UUID
  fish_name_snapshot      VARCHAR
  quantity                DECIMAL
  unit_price              DECIMAL
  gross_amount            DECIMAL
  discount_amount         DECIMAL
  subscription_quantity   DECIMAL
  subscription_amount     DECIMAL
  extra_quantity          DECIMAL
  extra_amount            DECIMAL
  created_at              TIMESTAMP

------------------------------------------------------------------------

# 19. Payments

## 19.1 payments

  Field                 Type
  --------------------- ---------------
  id                    UUID
  transaction_id        UUID
  booking_id            UUID nullable
  provider              VARCHAR
  provider_order_id     VARCHAR
  provider_payment_id   VARCHAR
  amount                DECIMAL
  gateway_fee           DECIMAL
  gateway_gst           DECIMAL
  status                ENUM
  payment_method        ENUM
  paid_at               TIMESTAMP
  created_at            TIMESTAMP
  updated_at            TIMESTAMP

Payment status:

``` text
CREATED
PENDING
SUCCESS
FAILED
REFUNDED
```

------------------------------------------------------------------------

# 20. Cash Payments

Cash is permitted only through the Worker Portal physical-store flow.

The payment record must identify:

``` text
worker_id
amount
transaction_id
payment_method = CASH
```

Admin-generated subscription purchases can also record the responsible
admin and source.

------------------------------------------------------------------------

# 21. Razorpay Idempotency

External provider identifiers must be unique where supplied.

Examples:

``` text
provider_order_id
provider_payment_id
```

A webhook received multiple times must update one payment rather than
create duplicates.

------------------------------------------------------------------------

# 22. TV Transaction Display

The TV does not require a separate business transaction table.

It reads successful transaction records.

## 22.1 transaction_display_events

Optional event/outbox record.

  Field            Type
  ---------------- --------------------
  id               UUID
  transaction_id   UUID
  event_type       VARCHAR
  emitted_at       TIMESTAMP
  delivered_at     TIMESTAMP nullable

Displayed information:

-   Customer name
-   Transaction ID
-   Fish name
-   Quantity
-   Bill number
-   Time
-   Successful paid amount

The TV is read-only.

------------------------------------------------------------------------

# 23. Business-Day TV History

TV history is grouped by business day.

The system can derive:

``` text
business_date
```

from successful transaction timestamps and configured business timezone.

No destructive reset is required.

Historical successful transactions remain in the database.

------------------------------------------------------------------------

# 24. GPS Journeys

## 24.1 gps_journeys

  Field                      Type
  -------------------------- -----------
  id                         UUID
  journey_number             VARCHAR
  created_by                 UUID
  provider                   VARCHAR
  provider_journey_id        VARCHAR
  origin                     JSON
  destination                JSON
  status                     ENUM
  tracking_published         BOOLEAN
  published_at               TIMESTAMP
  arrived_at                 TIMESTAMP
  customer_tracking_end_at   TIMESTAMP
  created_at                 TIMESTAMP
  updated_at                 TIMESTAMP

Destination is the configured PondFish store.

------------------------------------------------------------------------

# 25. GPS Journey Fish

## 25.1 gps_journey_items

  Field        Type
  ------------ -----------
  id           UUID
  journey_id   UUID
  fish_id      UUID
  quantity     DECIMAL
  created_at   TIMESTAMP

Admin selects fish and quantities before publishing the journey.

------------------------------------------------------------------------

# 26. GPS Location Data

## 26.1 gps_positions

Depending on OneLap capabilities, PondFish may store current position
and/or historical position references.

  Field                Type
  -------------------- --------------------
  id                   UUID
  journey_id           UUID
  latitude             DECIMAL
  longitude            DECIMAL
  speed                DECIMAL nullable
  heading              DECIMAL nullable
  recorded_at          TIMESTAMP
  provider_timestamp   TIMESTAMP nullable

If OneLap remains the historical GPS source, PondFish does not need to
duplicate unlimited raw GPS history unnecessarily.

------------------------------------------------------------------------

# 27. Customer GPS Publication

Customer visibility is separate from Admin visibility.

The journey can have:

``` text
Admin tracking = ACTIVE
Customer tracking = ACTIVE
```

Later:

``` text
Admin tracking = ACTIVE
Customer tracking = ENDED
```

This is important because GPS remains active for Admin even after
customer tracking automatically stops.

------------------------------------------------------------------------

# 28. Notifications

## 28.1 notifications

  Field               Type
  ------------------- ---------------
  id                  UUID
  customer_id         UUID nullable
  worker_id           UUID nullable
  admin_id            UUID nullable
  notification_type   VARCHAR
  title               VARCHAR
  body                TEXT
  reference_type      VARCHAR
  reference_id        UUID
  created_at          TIMESTAMP

------------------------------------------------------------------------

## 28.2 notification_deliveries

  Field                 Type
  --------------------- -----------
  id                    UUID
  notification_id       UUID
  channel               ENUM
  status                ENUM
  provider_message_id   VARCHAR
  sent_at               TIMESTAMP
  delivered_at          TIMESTAMP
  failed_at             TIMESTAMP
  error_message         TEXT

Channels:

``` text
PUSH
SMS
WHATSAPP
IN_APP
```

------------------------------------------------------------------------

# 29. Audit Logs

## 29.1 audit_logs

  Field         Type
  ------------- -----------
  id            UUID
  actor_type    ENUM
  actor_id      UUID
  action        VARCHAR
  entity_type   VARCHAR
  entity_id     UUID
  old_data      JSON
  new_data      JSON
  request_id    VARCHAR
  created_at    TIMESTAMP

Critical operations must be auditable.

Examples:

``` text
Admin changes inventory
Admin changes fish price
Admin changes freshness duration
Admin starts GPS journey
Admin publishes GPS tracking
Admin assigns subscription
Worker records cash payment
Worker confirms bill
Transaction succeeds
Booking cancelled
Booking expired
```

------------------------------------------------------------------------

# 30. System Events / Outbox

## 30.1 domain_events

  Field            Type
  ---------------- --------------------
  id               UUID
  event_type       VARCHAR
  aggregate_type   VARCHAR
  aggregate_id     UUID
  payload          JSON
  status           ENUM
  created_at       TIMESTAMP
  processed_at     TIMESTAMP nullable
  retry_count      INTEGER

This supports reliable communication to:

-   TV realtime
-   Notifications
-   Background jobs
-   Reporting
-   Integrations

------------------------------------------------------------------------

# 31. Idempotency Records

## 31.1 idempotency_keys

  Field               Type
  ------------------- ---------------
  id                  UUID
  key                 VARCHAR
  actor_id            UUID nullable
  operation           VARCHAR
  request_hash        VARCHAR
  response_snapshot   JSON
  created_at          TIMESTAMP
  expires_at          TIMESTAMP

Unique constraint:

``` text
UNIQUE(actor_id, key, operation)
```

------------------------------------------------------------------------

# 32. Business Settings

## 32.1 business_settings

  Field           Type
  --------------- -----------
  id              UUID
  setting_key     VARCHAR
  setting_value   JSON
  updated_by      UUID
  updated_at      TIMESTAMP

Examples:

``` text
booking_expiry_hours = 48
post_arrival_customer_tracking_minutes = configurable
gateway_fee_percent = 2
gateway_gst_percent = 18
business_timezone
store_location
```

------------------------------------------------------------------------

# 33. Entity Relationships

## Customer

``` text
Customer 1 ─── N Subscriptions
Customer 1 ─── N Bookings
Customer 1 ─── N Transactions
Customer 1 ─── N Notifications
```

## Subscription

``` text
Subscription 1 ─── N Credit Ledger
Subscription 1 ─── N Usage Ledger
Subscription N ─── N Fish
```

## Fish

``` text
Category 1 ─── N Fish
Fish 1 ─── N Inventory Batches
Fish 1 ─── 1 Inventory Summary
Fish 1 ─── N Inventory Ledger
Fish 1 ─── N Freshness Rules
Fish N ─── N Discount Campaigns
Fish N ─── N Subscription Plans
```

## Booking

``` text
Booking 1 ─── N Booking Items
Booking 1 ─── N Payments
Booking 0/1 ─── 1 Transaction
```

## Transaction

``` text
Transaction 1 ─── N Transaction Items
Transaction 1 ─── N Payments
Transaction 0/1 ─── 1 Bill
Transaction N ─── 1 Worker
Transaction N ─── 1 Customer
```

------------------------------------------------------------------------

# 34. Transaction Finalization Database Boundary

Physical transaction:

``` text
BEGIN TRANSACTION

1. Lock/check Bill
2. Check Bill uniqueness
3. Validate fish
4. Validate inventory
5. Validate subscription
6. Validate weekly quantity
7. Validate payment
8. Create transaction
9. Create transaction items
10. Deduct inventory
11. Create inventory ledger entries
12. Deduct subscription credit
13. Create credit ledger entries
14. Create usage ledger entries
15. Create payment record
16. Mark Bill successful
17. Create domain event
18. Create audit record

COMMIT
```

If a required step fails:

``` text
ROLLBACK
```

No partial successful transaction must remain.

------------------------------------------------------------------------

# 35. Booking Reservation Boundary

``` text
BEGIN

Check booking
 ↓
Check fish online eligibility
 ↓
Check available inventory
 ↓
Increase reserved quantity
 ↓
Create booking items
 ↓
Create booking
 ↓
Create payment state
 ↓
COMMIT
```

If payment must be completed before reservation according to the
implementation flow, reservation must be held with an explicit temporary
state and expiry.

The implementation must never expose reserved quantity as freely
available stock.

------------------------------------------------------------------------

# 36. Booking Cancellation / Expiry Restoration

When a booking is cancelled or expires:

``` text
Booking
 ↓
Verify not already restored
 ↓
Release inventory reservation
 ↓
Restore applicable subscription quantity
 ↓
Restore applicable subscription credit
 ↓
Restore applicable Razorpay-paid amount into Subscription Credit
 ↓
Create restoration ledger records
 ↓
Mark restoration completed
```

This operation must be idempotent.

------------------------------------------------------------------------

# 37. Subscription Purchase Sources

There are two main administrative sources:

``` text
ONLINE
ADMIN
```

Admin subscription purchase can be:

``` text
CASH
RAZORPAY
```

All sources update the same customer subscription credit balance through
ledger entries.

------------------------------------------------------------------------

# 38. Customer Subscription Renewal

Subscription expiry does not automatically renew.

Flow:

``` text
Expired
 ↓
Customer approaches Admin / uses permitted purchase flow
 ↓
New purchase
 ↓
New subscription period
```

Existing business rules regarding adding credits must be preserved.

------------------------------------------------------------------------

# 39. Inventory Freshness Lifecycle

``` text
Received
 ↓
Green
 ↓
Grey
 ↓
Red
 ↓
Admin Review
 ├─ Continue Physical Sale
 ├─ Remove / Dispose
 └─ Mark Wastage
```

Red does not automatically mean immediate database deletion.

The fish may remain available for physical store handling until Admin
decides.

It must be removed from online availability at the Red/expired stage
according to the locked workflow.

------------------------------------------------------------------------

# 40. Online Availability Logic

A fish is online-bookable only if:

``` text
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

The exact available quantity shown publicly may differ from
physical-store display requirements.

------------------------------------------------------------------------

# 41. Physical Store Availability

Physical store inventory may show partial quantity.

Example:

``` text
Available: 0.5 kg
```

Online booking may still be unavailable if the fish does not satisfy
online booking rules.

Therefore:

``` text
Physical Availability ≠ Online Booking Eligibility
```

------------------------------------------------------------------------

# 42. Landing Website Data

The public website may consume:

``` text
Fish
Category
Availability status
Active discounts
```

It must not expose:

-   Customer information
-   Subscription data
-   Internal inventory ledger
-   Worker information
-   Payment records
-   Private bill images

------------------------------------------------------------------------

# 43. TV Data Query

TV should query only successful transactions for the active business
day.

Conceptual query:

``` text
transactions
WHERE status = SUCCESSFUL
AND successful_at belongs to current business day
ORDER BY successful_at DESC
```

Returned display fields:

``` text
Customer Name
Transaction ID
Fish Name
Quantity
Bill Number
Time
Successful Paid Amount
```

The TV must not expose internal payment gateway details.

------------------------------------------------------------------------

# 44. Data Retention

Do not delete transactional history simply because:

-   Fish is inactive
-   Customer is inactive
-   Subscription expires
-   Booking is completed
-   Discount ends
-   Worker is deactivated

Historical financial and audit records must remain available according
to the project's retention policy.

------------------------------------------------------------------------

# 45. Indexing Strategy

Important indexes:

``` text
customers.mobile_number
workers.email
admins.email

fish.category_id
fish.online_booking_enabled

inventory.fish_id
inventory_batches.fish_id
inventory_batches.freshness_status

bookings.customer_id
bookings.status
bookings.expires_at
bookings.booking_number

transactions.customer_id
transactions.worker_id
transactions.status
transactions.successful_at
transactions.transaction_number

payments.provider_payment_id
payments.provider_order_id

bills.bill_number
bills.processing_status

subscription_credit_ledger.subscription_id
subscription_usage_ledger.subscription_id

gps_journeys.status
gps_journeys.provider_journey_id

notifications.customer_id
domain_events.status
```

Composite indexes should be added for frequent query combinations after
observing real workloads.

------------------------------------------------------------------------

# 46. Unique Constraints

At minimum:

``` text
customers.mobile_number
workers.email
admins.email

bookings.booking_number
transactions.transaction_number

bills.bill_number

payments.provider_payment_id
payments.provider_order_id

domain_events.id
idempotency_keys(actor_id, key, operation)
```

Where nullable provider identifiers are used, uniqueness must follow the
database's nullable-column behavior.

------------------------------------------------------------------------

# 47. Monetary Data Rules

Use fixed-precision decimal types.

Do not use floating-point values for:

-   Prices
-   Payments
-   Credits
-   Discounts
-   Fees
-   GST
-   Refunds

Recommended:

``` text
DECIMAL(12,2)
```

Quantities may require greater precision:

``` text
DECIMAL(12,3)
```

depending on weighing-machine precision.

------------------------------------------------------------------------

# 48. Time Rules

Store timestamps consistently, preferably in UTC.

Display in the configured PondFish business timezone.

Freshness calculation must use the actual receipt timestamp.

Business-day TV grouping must use the configured business timezone.

------------------------------------------------------------------------

# 49. Soft Deletion

For business entities where historical relationships matter, prefer:

``` text
active = false
```

or status fields instead of physical deletion.

Do not delete:

-   Transactions
-   Payments
-   Ledger entries
-   Audit logs

------------------------------------------------------------------------

# 50. Future POS Integration Compatibility

The current database must not depend directly on a specific POS vendor.

Future flow:

``` text
POS
 ↓
POS Adapter
 ↓
Bill/Transaction Input Service
 ↓
Existing Transaction Engine
```

Existing tables such as:

``` text
bills
transactions
transaction_items
payments
```

remain the core system.

------------------------------------------------------------------------

# 51. Migration Strategy

Database changes must be version controlled.

Every schema change should have:

``` text
Migration ID
Description
Up migration
Down/rollback strategy where practical
Data migration if required
Validation
```

Production migrations must be tested in staging first.

------------------------------------------------------------------------

# 52. Data Integrity Rules

The following rules are mandatory:

1.  A successful transaction must have a valid customer.
2.  A successful physical transaction must have a worker.
3.  A successful transaction must have transaction items.
4.  Successful online transactions must reference their booking where
    applicable.
5.  A successful bill cannot be processed twice.
6.  Subscription deductions must have ledger entries.
7.  Inventory deductions must have inventory ledger entries.
8.  Payment success must be verified server-side.
9.  Booking restoration must not happen twice.
10. Inventory reservations must be reversible.
11. Historical transaction prices must not change.
12. Audit records must not be silently overwritten.
13. Customer GPS access must be separated from Admin GPS access.

------------------------------------------------------------------------

# 53. Recommended Physical Database Structure

``` text
pond_fish
│
├── identity
│   ├── customers
│   ├── workers
│   └── admins
│
├── catalogue
│   ├── categories
│   ├── fish
│   ├── fish_freshness_rules
│   └── discount_campaigns
│
├── inventory
│   ├── inventory
│   ├── inventory_batches
│   └── inventory_ledger
│
├── subscriptions
│   ├── subscription_plans
│   ├── customer_subscriptions
│   ├── subscription_plan_fish
│   ├── subscription_credit_ledger
│   └── subscription_usage_ledger
│
├── bookings
│   ├── bookings
│   └── booking_items
│
├── billing
│   ├── files
│   ├── bills
│   ├── bill_extractions
│   └── bill_extraction_items
│
├── transactions
│   ├── transactions
│   ├── transaction_items
│   └── payments
│
├── logistics
│   ├── gps_journeys
│   ├── gps_journey_items
│   └── gps_positions
│
├── communications
│   ├── notifications
│   └── notification_deliveries
│
└── platform
    ├── audit_logs
    ├── domain_events
    ├── idempotency_keys
    └── business_settings
```

------------------------------------------------------------------------

# 54. Database-to-Portal Responsibility

  -----------------------------------------------------------------------
  Portal                              Main Data Access
  ----------------------------------- -----------------------------------
  Public Website                      Fish, categories, availability,
                                      discounts

  Customer App                        Customer, fish, cart, bookings,
                                      subscriptions, transactions, GPS,
                                      notifications

  Worker Portal                       Bookings, customers, bills,
                                      transactions, cash payments

  Admin Portal                        All operational/admin data

  TV Portal                           Successful transaction display data
                                      only
  -----------------------------------------------------------------------

The backend remains the authorization boundary.

------------------------------------------------------------------------

# 55. ERD Summary

``` text
CUSTOMER
 ├── SUBSCRIPTION
 │    ├── CREDIT LEDGER
 │    └── USAGE LEDGER
 │
 ├── BOOKING
 │    └── BOOKING ITEM ─── FISH
 │
 └── TRANSACTION
      ├── TRANSACTION ITEM ─── FISH
      ├── PAYMENT
      └── BILL
           ├── BILL IMAGE
           └── AI EXTRACTION
                └── EXTRACTION ITEMS

FISH
 ├── CATEGORY
 ├── INVENTORY
 ├── INVENTORY BATCH
 ├── FRESHNESS RULE
 ├── DISCOUNT
 └── SUBSCRIPTION PLAN ELIGIBILITY

ADMIN
 └── GPS JOURNEY
      ├── JOURNEY ITEMS ─── FISH
      └── GPS POSITIONS

TRANSACTION
 └── DOMAIN EVENT
      ├── TV
      └── NOTIFICATION

EVERY CRITICAL MUTATION
 └── AUDIT LOG
```

------------------------------------------------------------------------

# 56. Database Acceptance Criteria

The database specification is considered implementation-ready when:

-   Every portal's required data has an owning entity.
-   Customers, workers and admins are separated.
-   Fish and categories are normalized.
-   Inventory has both current state and movement history.
-   Freshness is configurable per fish.
-   Discounts can be scheduled.
-   Subscription credit and quantity usage are separate ledgers.
-   Subscription fish eligibility is explicit.
-   Online bookings reserve inventory.
-   Booking restoration is represented.
-   Bill images can be privately stored.
-   AI extraction is separately stored from confirmed bill data.
-   Duplicate bills are database protected.
-   Transactions preserve historical values.
-   Razorpay identifiers are traceable.
-   Cash payments identify the responsible worker.
-   GPS journeys can contain multiple fish and quantities.
-   Customer GPS visibility can end independently from Admin tracking.
-   Notifications and delivery attempts are traceable.
-   Audit records exist for critical mutations.
-   Domain events support realtime communication.
-   Idempotency is supported.
-   Monetary values use fixed precision.
-   Critical foreign-key relationships are enforced.
-   Indexes support operational queries.
-   The structure remains compatible with future POS + SI-801
    integration.

------------------------------------------------------------------------

# 57. Next Architecture Artifact

The next document should be:

**PONDFISH --- API & Backend Service Specification**

It will convert this database model into:

``` text
Authentication APIs
Customer APIs
Fish APIs
Inventory APIs
Subscription APIs
Booking APIs
Bill/AI APIs
Transaction APIs
Payment APIs
Worker APIs
Admin APIs
GPS APIs
Notification APIs
Realtime events
Webhook endpoints
Error codes
Request/response structures
Authorization rules
Idempotency rules
```

The API specification must follow this data model and the locked PRD
rather than independently redefining business logic.

------------------------------------------------------------------------

# DOCUMENT END
