# PONDFISH DIGITAL ECOSYSTEM --- MASTER PRD

**Version:** 2.0 --- Master Build\
**Status:** Detailed Draft / Workflow Locked\
**Prepared for:** PondFish Client, SProjectX, UI/UX, Engineering, QA,
DevOps and AI-assisted development teams

------------------------------------------------------------------------

## 1. DOCUMENT PURPOSE

This Product Requirements Document is the master functional
specification for the PondFish digital ecosystem.

It defines the product scope, portals, modules, workflows, business
rules, integrations, page behavior, validation, success/error/empty
states, security, testing, deployment dependencies and future scope.

The document is intentionally detailed so it can first support the
creation of the product skeleton/UI and later guide engineering
implementation.

### 1.1 Single Source of Truth

Every business workflow is defined once. Portal documents describe how
users access a workflow but must not independently redefine financial,
inventory, subscription, payment, booking or GPS rules.

The backend is authoritative for all critical business decisions.

### 1.2 Page Documentation Standard

Each important page must define, where applicable:

-   Purpose
-   Access/role
-   Entry points
-   Displayed data
-   Actions
-   Main workflow
-   Validation
-   Loading state
-   Empty state
-   Success state
-   Error state
-   Retry behavior
-   Permission rules
-   Backend dependency
-   Audit requirement
-   Edge cases
-   Acceptance criteria

------------------------------------------------------------------------

# 2. PRODUCT OVERVIEW

PondFish is a fresh/live fish retail platform supporting:

-   Public fish discovery
-   Physical-store purchases
-   Online booking for selected fish
-   Subscription plans
-   Monetary Subscription Credit
-   Weekly quantity limits
-   Inventory
-   Fish categories
-   Fish freshness
-   Discounts and flash offers
-   AI-assisted physical bill processing
-   Razorpay payments
-   Worker tablet operations
-   Admin operations
-   OneLap GPS tracking
-   Customer-facing live tracking
-   Real-time successful transaction TV
-   Notifications
-   Reporting
-   Audit history

The business supports both physical store purchases and online bookings.
Subscription logic is shared between them.

------------------------------------------------------------------------

# 3. PLATFORM SCOPE

## 3.1 Public Website

A web application for public visitors.

It shows:

-   Fish categories
-   Fish
-   Store availability
-   Freshness status
-   Active discounts
-   Subscription plans
-   Offers
-   Business information
-   Contact information

Availability and discounts are dynamically controlled by Admin/backend
data.

## 3.2 Customer Application

The customer product is planned as a React Native mobile application,
with Android first and an architecture suitable for iOS.

The application uses the same backend, APIs and business rules as the
ecosystem.

Customer authentication is mobile OTP; no customer password is required.

## 3.3 Worker Portal

A web application optimized for a tablet.

The current phase uses the tablet, **not a POS system**.

Worker operations include:

-   Today's bookings
-   Booking search
-   Customer search
-   Bill capture
-   AI bill extraction review
-   Subscription calculation
-   Razorpay where applicable
-   Worker-only cash collection
-   Physical transaction processing
-   Online booking completion

## 3.4 Admin Portal

Web-based operational control center for:

-   Fish
-   Categories
-   Inventory
-   Freshness
-   Discounts
-   Customers
-   Workers
-   Subscriptions
-   Transactions
-   Bookings
-   GPS
-   Notifications
-   Website content
-   Reports
-   Audit
-   Business settings

## 3.5 Shop Transaction TV

Separate read-only web interface.

Only successful transactions are shown.

The TV automatically updates in real time and is not part of transaction
authorization.

------------------------------------------------------------------------

# 4. USER ROLES

## 4.1 Public Visitor

Can browse public information only.

## 4.2 Customer

Uses OTP authentication and can:

-   Browse fish
-   Book eligible fish
-   Scan physical bills
-   Confirm AI extraction
-   Use subscription benefits
-   Pay through Razorpay
-   View receipts
-   View transactions
-   View bookings
-   View subscription
-   View notifications
-   View live tracking when published
-   Manage permitted profile data

## 4.3 Worker

Uses Admin-created email/password credentials.

Can perform approved store operations. Worker identity must be linked to
worker-assisted transactions.

## 4.4 Admin

Controls business operations and configuration.

## 4.5 TV

Read-only display identity.

------------------------------------------------------------------------

# 5. MASTER PORTAL STRUCTURE

``` text
PONDFISH
├── PUBLIC WEBSITE
│   ├── Home
│   ├── Categories
│   ├── Fish Listing
│   ├── Fish Details
│   ├── Subscription Plans
│   ├── Offers
│   ├── About
│   └── Contact
│
├── CUSTOMER MOBILE APP
│   ├── OTP Authentication
│   ├── Home
│   ├── Fish / Categories
│   ├── Fish Details
│   ├── Online Booking / Cart
│   ├── Scan Bill
│   ├── AI Bill Review
│   ├── Subscription Breakdown
│   ├── Payment
│   ├── Transaction Result
│   ├── Transaction History
│   ├── Purchase & Booking History
│   ├── Subscription
│   ├── GPS Tracking
│   ├── Notifications
│   └── Profile
│
├── WORKER TABLET PORTAL
│   ├── Login
│   ├── Dashboard / Today's Bookings
│   ├── Booking Search
│   ├── Booking Details
│   ├── Complete Booking
│   ├── Customer Search
│   ├── Bill Capture
│   ├── AI Review
│   ├── Subscription / Payment
│   └── Transaction Result / History
│
├── ADMIN PORTAL
│   ├── Login
│   ├── Dashboard
│   ├── Fish
│   ├── Categories
│   ├── Inventory
│   ├── Freshness
│   ├── Discounts
│   ├── GPS / Journeys
│   ├── Customers
│   ├── Workers
│   ├── Subscriptions
│   ├── Transactions
│   ├── Bookings
│   ├── Notifications
│   ├── Reports
│   ├── Audit Logs
│   └── Settings
│
└── SHOP TRANSACTION TV
    └── Successful Transactions / Current Business Day
```

------------------------------------------------------------------------

# 6. MASTER PHYSICAL TRANSACTION WORKFLOW

## 6.1 Customer Has Phone

``` text
Fish purchased at store
→ SI-801 weighing machine produces bill
→ Customer receives bill
→ Customer opens Scan Bill
→ Bill image captured
→ AI extracts bill details
→ Bill ID checked
→ Duplicate successful Bill ID checked
→ Extracted details displayed
→ Customer confirms
→ Subscription eligibility calculated
→ Weekly quantity checked
→ Subscription Credit checked
→ Remaining amount calculated
→ Razorpay fee + GST calculated if required
→ Customer pays
→ Server verifies payment
→ Transaction finalized atomically
→ Inventory deducted
→ Subscription ledgers updated
→ Transaction stored
→ Bill image stored
→ Successful event emitted
→ TV updates in real time
→ Digital receipt/history available
```

### Confirmation Rule

No final payment/subscription/inventory mutation occurs before the
extracted bill is confirmed.

If AI extraction is incorrect, the customer scans again.

Manual line-item correction is not part of the locked customer flow.

If Bill ID cannot be read, the Bill ID must be manually entered.

------------------------------------------------------------------------

# 7. WORKER-ASSISTED PHYSICAL PURCHASE

Used when the customer has no phone.

``` text
Worker searches customer
→ Select customer
→ Capture bill
→ AI extraction
→ Review
→ Bill ID validation
→ Duplicate check
→ Subscription calculation
→ Remaining amount
→ Razorpay OR Cash
→ Successful transaction
→ Inventory deduction
→ Subscription update
→ TV update
```

### Cash Rule

Cash is available **only in the Worker Portal physical-store flow**.

Worker ID is recorded against the cash transaction.

Customer self-service does not have a cash option.

------------------------------------------------------------------------

# 8. AI BILL PROCESSING

## 8.1 Extracted Data

AI attempts to extract:

-   Bill ID/number
-   Fish names
-   Quantity per fish
-   Price
-   Line totals
-   Total bill amount
-   Other relevant printed information

## 8.2 AI Is Not Final Authority

``` text
AI extraction
→ Human review
→ Confirm?
   ├── Yes → continue
   └── No  → scan again
```

## 8.3 Bill ID

If unreadable:

``` text
AI cannot read Bill ID
→ Manual Bill ID entry
→ Validation
→ Duplicate check
```

## 8.4 Duplicate Protection

One Bill ID can have only one successful finalized physical transaction.

A second successful attempt with the same Bill ID is rejected.

Failed/cancelled/incomplete attempts do not permanently block retry
unless a successful transaction already exists.

The database must enforce uniqueness safely under concurrent requests.

------------------------------------------------------------------------

# 9. SUBSCRIPTION ENGINE

## 9.1 Plans

Current plans include:

-   ₹2,000
-   ₹6,000

The architecture must support additional plans.

## 9.2 Subscription Credit

Subscription Credit is monetary value.

Example:

``` text
Customer buys ₹5,000 subscription
→ ₹5,000 credit added
```

New credit is added to existing valid credit; it never overwrites the
previous balance.

## 9.3 Coverage Calculation

Every purchase checks:

1.  Active subscription
2.  Fish eligibility under that plan
3.  Remaining weekly quantity
4.  Available Subscription Credit

Then calculates:

-   Eligible quantity
-   Covered quantity
-   Subscription value used
-   Weekly quantity used
-   Weekly quantity remaining
-   Credit used
-   Credit remaining
-   Uncovered/extra quantity
-   Extra amount
-   Remaining payable amount

There is no actual Type-A/Type-B fish classification. Those were
explanatory examples only.

## 9.4 Insufficient Credit

``` text
Eligible quantity exists
→ Use remaining Subscription Credit
→ Calculate remainder
→ Collect remainder
```

Customer: Razorpay only.

Worker-assisted: Razorpay or cash.

## 9.5 Weekly Quantity vs Credit

Weekly quantity and monetary credit are separate ledgers.

## 9.6 Subscription Purchase

### Customer Online

``` text
Select plan
→ Razorpay
→ Server verification
→ Activate
→ Add credit
→ Record ledger
```

### Admin

``` text
Search customer
→ Select plan
→ Select payment source
→ Confirm
→ Activate/add
→ Add credit
→ Record payment source and ledger
```

Admin payment sources include Cash and Razorpay where applicable.

## 9.7 Expiry

Subscription does not auto-renew in the current workflow. Customer
manually renews.

------------------------------------------------------------------------

# 10. PAYMENT ENGINE

## 10.1 Razorpay

Razorpay is used for online payment where required.

Payment success must be verified server-side.

Client-side success alone is never sufficient.

## 10.2 Charges

Current reference configuration:

-   Razorpay fee = 2%
-   GST on Razorpay fee = 18%

``` text
Base payable
+ 2% gateway fee
+ 18% GST on gateway fee
= Final payable
```

Example:

``` text
Base = ₹100
Fee = ₹2
GST = ₹0.36
Final = ₹102.36
```

Rates must remain configurable.

## 10.3 Payment States

-   Pending
-   Successful
-   Failed
-   Cancelled where applicable

Pending/failed must not be treated as successful.

------------------------------------------------------------------------

# 11. TRANSACTION ENGINE

## 11.1 Physical Transaction States

-   Initiated
-   Bill Scanned
-   Awaiting Confirmation
-   Processing
-   Payment Pending
-   Successful
-   Failed
-   Cancelled

## 11.2 Atomic Finalization

Before commit, backend revalidates:

-   Bill ID
-   Inventory
-   Payment state
-   Subscription credit
-   Weekly quantity
-   Customer status

Within the authoritative transaction:

-   Create transaction
-   Create line items
-   Deduct inventory
-   Deduct credit
-   Record weekly usage
-   Record payment linkage
-   Record worker where applicable
-   Record ledger/audit information

Only after commit:

-   Publish TV event
-   Send notifications
-   Update reporting/event projections

## 11.3 Transaction Record

At minimum:

-   Transaction ID
-   Customer
-   Bill ID
-   Bill image
-   Fish line items
-   Quantity
-   Prices
-   Total
-   Subscription quantity/value
-   Extra quantity/value
-   Payment method
-   Razorpay ID where applicable
-   Cash amount where applicable
-   Worker ID where applicable
-   Gateway fee
-   GST on gateway fee
-   Final paid amount
-   Status
-   Server timestamp
-   Audit/correlation reference

------------------------------------------------------------------------

# 12. ONLINE BOOKING

## 12.1 Eligibility

Only fish explicitly enabled by Admin for online booking can be booked.

A fish may be physically available but unavailable online.

## 12.2 Cart

Cart accepts only online-bookable fish.

## 12.3 Booking Flow

``` text
Customer selects eligible fish
→ Select quantity
→ Review cart
→ Validate availability
→ Subscription calculation
→ Payment calculation
→ Razorpay if required
→ Server verification
→ Booking created
→ Inventory immediately reserved
→ Worker sees booking
```

## 12.4 Worker Search

Search by:

-   Booking ID
-   Customer name
-   Phone
-   Total payment amount

## 12.5 Collection

``` text
Booking Created
→ Confirmed
→ Pending Collection
→ Customer arrives
→ Worker finds booking
→ Fish handed over
→ Worker clicks Complete
→ Completed
```

Only online bookings require Worker completion.

Physical scan-bill transactions do not require completion.

## 12.6 Expiry

Booking expires after **48 elapsed hours from creation**.

On expiry:

-   Status becomes Expired
-   Reserved inventory restored
-   Weekly quantity restored
-   Subscription Credit restored
-   Applicable Razorpay-paid booking amount is added to Subscription
    Credit
-   Event/audit written
-   Customer notified where configured

## 12.7 Cancellation

Cancellation is supported and has no cancellation fee.

Restoration follows the same principles:

-   Inventory
-   Weekly quantity
-   Subscription Credit
-   Applicable Razorpay-paid amount → Subscription Credit

The original transaction/cancellation history remains traceable.

Managed delivery is not part of the current platform.

------------------------------------------------------------------------

# 13. INVENTORY ENGINE

## 13.1 Quantity Model

Maintain:

-   Physical quantity
-   Reserved quantity
-   Available quantity

Recommended invariant:

`Available = Physical - Reserved`

## 13.2 Inventory Ledger

Movement types:

-   Stock received
-   Online reservation
-   Reservation release
-   Physical sale
-   Booking completion
-   Manual increase
-   Manual decrease
-   Wastage
-   Disposal
-   Correction

## 13.3 Atomicity

Never:

-   Reserve more than available
-   Deduct below zero
-   Release one reservation twice
-   Deduct one sale twice

## 13.4 Partial Inventory

Physical store may show quantities such as 0.5 kg.

The online booking interface does not need to expose unsupported partial
quantities merely because that physical quantity exists.

------------------------------------------------------------------------

# 14. FISH AND CATEGORY MANAGEMENT

Admin manages:

-   Fish
-   Categories
-   Images
-   Descriptions
-   Price
-   Active/inactive state
-   Online booking eligibility
-   Freshness configuration
-   Inventory

Categories organize fish for public website and customer app.

Categories are not subscription eligibility groups.

------------------------------------------------------------------------

# 15. FRESHNESS MANAGEMENT

## 15.1 Baseline

Default concept:

``` text
0–24h   → GREEN / FRESH
24–48h  → GREY / AGING
>48h    → RED / EXPIRED
```

Freshness durations are configurable per fish.

## 15.2 Green

-   Normal selling
-   Normal pricing unless another discount applies

## 15.3 Grey

-   May continue selling
-   Discount is optional
-   Admin controls discount
-   Scheduled/flash discount is supported

## 15.4 Red

When expired/red:

-   Remove from online availability
-   Notify Admin
-   Do not automatically declare physical unusability

Admin chooses:

1.  Remove permanently
2.  Continue physical-store sale temporarily if suitable
3.  Mark disposed/wastage

All decisions are auditable.

------------------------------------------------------------------------

# 16. DISCOUNTS

Admin can:

-   Select fish
-   Set percentage/fixed discount
-   Set start/end
-   Schedule campaign
-   Create flash sale
-   Stop campaign

When a campaign ends, the fish remains available if otherwise valid.

Discounts must resolve deterministically and must not silently stack.

------------------------------------------------------------------------

# 17. PUBLIC WEBSITE PAGE REQUIREMENTS

## PW-01 Home

Displays:

-   Hero
-   Fish/category highlights
-   Available fish
-   Freshness
-   Active discounts
-   Subscription promotion
-   Business introduction
-   Relevant arrival/tracking promotion

Dynamic fish availability and discounts are backend controlled.

## PW-02 Categories / Fish Listing

Shows:

-   Category
-   Fish
-   Image
-   Price
-   Store availability
-   Freshness
-   Discount
-   Online booking eligibility

## PW-03 Fish Details

Shows:

-   Name
-   Image
-   Description
-   Category
-   Price
-   Availability
-   Freshness
-   Discount
-   Online booking option if enabled

## PW-04 Subscription Plans

Shows:

-   Plan
-   Price
-   Benefits
-   Weekly limits
-   Eligibility information
-   Credit concept

## PW-05 Offers

Shows active offers, flash discounts and validity.

## PW-06 About

Approved business information.

## PW-07 Contact

Approved store contact information.

------------------------------------------------------------------------

# 18. CUSTOMER APP PAGE REQUIREMENTS

## CP-01 OTP Authentication

Flow:

``` text
Mobile number
→ Request OTP
→ Verify OTP
→ Session
```

States:

-   Invalid number
-   OTP expired
-   Incorrect OTP
-   Too many attempts
-   Resend cooldown
-   Network failure
-   Success

## CP-02 Home

Primary actions:

-   Scan Bill
-   Online Booking
-   Fish
-   Subscription
-   Live Tracking
-   Notifications
-   Recent activity

## CP-03 Fish Discovery

Shows categories, fish, price, availability, freshness, discounts and
booking eligibility.

## CP-04 Fish Details

Shows complete fish information and online booking action where allowed.

## CP-05 Online Booking / Cart

Only online-eligible fish can be added.

Inventory is revalidated at checkout.

## CP-06 Scan Bill

Camera/capture/upload.

Errors:

-   Camera permission denied
-   Blurry image
-   Unsupported image
-   AI failure
-   Unreadable bill

## CP-07 AI Bill Review

Shows extracted:

-   Bill number
-   Fish
-   Quantity
-   Price
-   Line totals
-   Total

Actions:

-   Confirm
-   Scan Again

## CP-08 Manual Bill ID

Shown when AI cannot read the Bill ID.

## CP-09 Subscription Breakdown

Shows:

-   Total bill
-   Eligible fish
-   Covered quantity
-   Uncovered quantity
-   Weekly used
-   Weekly remaining
-   Credit used
-   Credit remaining
-   Remaining payable

## CP-10 Payment

``` text
Base amount
→ Gateway fee
→ GST on gateway fee
→ Final amount
→ Razorpay
→ Server verification
```

Cash is unavailable.

## CP-11 Transaction Result

Shows:

-   Customer
-   Transaction ID
-   Bill number
-   Fish
-   Actual quantity
-   Total
-   Subscription quantity/value
-   Extra quantity/value
-   Payment method
-   Payment reference
-   Date/time

## CP-12 Pending/Failed

Where valid:

-   Continue
-   Retry
-   Remove/cancel pending transaction

## CP-13 Transaction History

Must show the complete transaction log:

-   Successful
-   Failed
-   Pending
-   Cancelled/removed where retained

## CP-14 Purchase & Booking History

Combined:

-   Physical store purchases
-   Online bookings

Filters:

-   All
-   Physical Store
-   Online Booking
-   Date/date range
-   Status

## CP-15 Subscription

Shows:

-   Current plan
-   Weekly limit
-   Used/remaining quantity
-   Credit/remaining credit
-   History
-   Expiry

## CP-16 GPS Tracking

Only available after Admin publishes.

States:

-   Not published
-   Live
-   Location temporarily unavailable
-   Arrived/processing
-   Tracking ended

Shows live location, ETA, journey state and last update where available.

## CP-17 Notifications

Shows:

-   Booking
-   Payment
-   Subscription
-   Fish arrival
-   GPS publication
-   Discounts
-   Flash offers
-   Announcements

Supports read/unread and relevant deep links.

## CP-18 Profile

Shows permitted customer data.

Phone change requires OTP verification.

------------------------------------------------------------------------

# 19. WORKER PORTAL PAGE REQUIREMENTS

## WP-01 Login

Email + password.

Disabled workers cannot authenticate.

## WP-02 Dashboard / Today's Bookings

Shows current operational bookings and access to customer/bill
processing.

## WP-03 Booking Search

Search by booking ID, customer name, phone and total payment amount.

## WP-04 Booking Details

Shows booking/customer/fish/quantity/payment/subscription/status/expiry.

## WP-05 Complete Online Booking

Only eligible collected online bookings can be completed.

Success:

> Booking completed successfully.

Invalid state:

> This booking cannot be completed in its current state.

## WP-06 Customer Search

Search customer by name/phone/identifier.

## WP-07 Bill Capture

Select customer → capture → AI extraction.

## WP-08 AI Review

Review bill data and scan again if required.

## WP-09 Subscription / Payment

Shows eligibility, weekly limit, credit, amount used and remainder.

Payment:

-   Razorpay
-   Cash

## WP-10 Transaction Result

Shows successful transaction details and worker linkage.

No second completion action is required.

------------------------------------------------------------------------

# 20. SHOP TRANSACTION TV

## TV-01 Display

Only successful transactions.

Display:

-   Customer name
-   Transaction ID
-   Fish name
-   Quantity
-   Bill number
-   Time
-   Combined successful transaction value

## TV-02 Realtime

``` text
Successful transaction
→ Database commit
→ Realtime event
→ TV receives
→ Transaction appears
→ Bell/notification sound
```

No manual refresh.

## TV-03 Worker Behavior

Worker sees the successful transaction and starts preparing the fish
order.

TV has no operational controls.

## TV-04 Daily History

A new business-day history is created each day.

Transactions remain visible for the business day.

## TV-05 Reconnection

On reconnect:

1.  Authenticate
2.  Load authoritative current-day successful transactions
3.  Reconcile display
4.  Resume realtime

This prevents missed events after network loss/restart.

------------------------------------------------------------------------

# 21. ADMIN PORTAL MODULES

## AP-01 Dashboard

Shows operational overview:

-   Transactions
-   Revenue
-   Subscription activity
-   Inventory
-   Low stock
-   Freshness alerts
-   Workers
-   GPS journey
-   Offers
-   Bookings
-   Failed/pending transactions

## AP-02 Fish Management

CRUD for fish, price, category, image, active state, online booking and
freshness.

## AP-03 Category Management

Create/edit/activate/deactivate categories and assign fish.

## AP-04 Inventory

Shows physical/reserved/available quantities and history.

Supports manual increase, decrease, correction, removal and
wastage/disposal.

## AP-05 Freshness

Configure per-fish durations and view current freshness state.

## AP-06 Discounts

Create, schedule, activate and stop offers.

## AP-07 GPS / Journeys

Admin can:

-   View GPS
-   Create journey
-   Select truck
-   Select fish
-   Enter quantity
-   Set origin
-   Use fixed store destination
-   Start journey
-   Publish tracking
-   View status
-   Continue Admin GPS monitoring

## AP-08 Customers

Search/view/edit permitted customer information and view subscription,
transactions, purchases and bookings. Block/deactivate where authorized.

## AP-09 Workers

Create, edit, disable workers and inspect worker-linked activity.

## AP-10 Subscriptions

Manage plans, eligibility, weekly limits, credit and customer
assignments.

Admin can search a customer, select plan, select payment source and
assign.

## AP-11 Transactions

Search/filter by:

-   Transaction ID
-   Bill
-   Customer
-   Phone
-   Date
-   Payment method
-   Status

Inspect bill image, payment, subscription usage and worker.

## AP-12 Bookings

Search, filter and inspect booking status, customer, expiry and
reservation.

## AP-13 Notifications

Create/send/schedule/cancel unsent notifications and inspect delivery
history.

Audience:

-   Everyone
-   Subscription customers
-   Specific plan
-   Individual customer

## AP-14 Reports

Revenue, transactions, fish sales, subscriptions, inventory, wastage,
worker cash and activity.

Export:

-   CSV
-   Excel

## AP-15 Audit Logs

Shows actor, action, target, previous/new values, timestamp and
reference.

## AP-16 Settings

Configurable business values include:

-   Razorpay fee
-   GST on gateway fee
-   Booking expiry
-   Freshness durations
-   Post-arrival tracking duration
-   Notification settings
-   Store destination
-   Other approved configuration

------------------------------------------------------------------------

# 22. GPS / ONELAP INTEGRATION

OneLap is the current GPS provider.

Current scope:

-   One operational truck
-   One fixed store destination

The backend should isolate OneLap behind a GPS provider adapter.

## 22.1 Journey

Journey stores:

-   Journey ID
-   Truck
-   Origin
-   Fixed destination
-   Fish/quantities
-   Start time
-   ETA
-   Arrival time
-   Journey state
-   Customer publication state
-   Post-arrival duration
-   Audit data

## 22.2 Publishing

Admin always has GPS visibility when data is available.

Customers see GPS only after Admin publishes.

## 22.3 GPS Updates

``` text
OneLap
→ Backend
→ Validate
→ Update journey
→ ETA
→ Realtime clients
```

## 22.4 Arrival

Arrival uses GPS/geofence.

On confirmed arrival:

-   Mark Arrived
-   Store server timestamp
-   Emit event
-   Start receiving/processing workflow
-   Notify customer
-   Start post-arrival period

## 22.5 Post-Arrival

Customer tracking remains available for configurable **30--60 minutes**.

After that:

-   Customer tracking ends automatically
-   Customer sees completed/ended state
-   Admin GPS may remain visible

## 22.6 GPS Failure

Show last valid location/time or temporary-unavailable state.

GPS failure must not stop transactions, bookings, subscriptions or
inventory management.

------------------------------------------------------------------------

# 23. ARRIVAL AND INVENTORY RECEIVING

GPS arrival does not instantly make fish sellable.

``` text
Truck arrives
→ Unloading/processing
→ Inventory receiving
→ Inventory activated
→ Freshness timer starts
```

Current operational expectation is approximately 30 minutes,
configurable within the agreed operational range.

------------------------------------------------------------------------

# 24. NOTIFICATION SYSTEM

Channels may include:

-   In-app
-   Push
-   SMS
-   WhatsApp

System events include:

-   Booking
-   Payment
-   Subscription
-   Fish arrival
-   GPS publication
-   Tracking end
-   Discount
-   Freshness expiry

Admin can send or schedule notifications.

Notification failure must never roll back business transactions.

Use event IDs/idempotency to prevent duplicates.

------------------------------------------------------------------------

# 25. REPORTING AND AUDIT

## Revenue

Separate:

-   Subscription revenue
-   Razorpay physical purchase value
-   Cash physical purchase value
-   Online booking revenue

## Worker Cash

Track:

-   Worker
-   Amount
-   Transaction count
-   Date/time
-   Related transaction

## Inventory

Track:

-   Opening
-   Received
-   Reserved
-   Sold
-   Released
-   Adjusted
-   Wasted/disposed
-   Closing

## Audit

Critical operations must be traceable:

-   Inventory
-   Fish
-   Customer status
-   Worker
-   Subscription
-   Booking cancellation
-   Freshness
-   Disposal
-   Discount
-   GPS publication
-   Credit adjustments

------------------------------------------------------------------------

# 26. SECURITY AND PRIVACY

## Authentication

Customer:

-   OTP
-   Expiry
-   Rate limiting
-   Retry protection

Worker/Admin:

-   Email/password
-   Secure password hashing
-   Protected sessions

## Authorization

Server-side RBAC must restrict:

-   Customer to own records
-   Worker to operational records
-   Admin to management records
-   TV to successful transaction projection

## Payment

-   Server-side verification
-   Secure webhooks
-   No card credential storage

## Bill Images

-   Private storage
-   Authenticated/signed access
-   No public enumeration

## GPS

-   Customer sees only published journey
-   OneLap credentials remain server-side

------------------------------------------------------------------------

# 27. DATABASE / DOMAIN MODEL

Logical entities include:

-   users
-   customers
-   workers
-   admins
-   categories
-   fish
-   inventory
-   inventory_ledger
-   freshness_batches
-   discount_campaigns
-   subscriptions
-   subscription_credit_ledger
-   subscription_usage_ledger
-   bookings
-   booking_items
-   transactions
-   transaction_items
-   payments
-   bills
-   bill_images
-   gps_journeys
-   gps_positions/current_state
-   notifications
-   notification_deliveries
-   audit_logs
-   business_settings
-   realtime/events

Historical transactions must preserve relevant snapshots.

------------------------------------------------------------------------

# 28. CORE DATA INTEGRITY

The system must enforce:

-   One successful transaction per Bill ID
-   No negative inventory
-   No overselling
-   No duplicate reservation release
-   No duplicate transaction deduction
-   No duplicate Subscription Credit mutation
-   No duplicate weekly usage restoration
-   Server-verified payment
-   Atomic transaction finalization
-   Successful-only TV projection
-   Idempotent background jobs/events

------------------------------------------------------------------------

# 29. STANDARD PAGE STATES

Every significant page must provide appropriate:

### Loading

> Loading...

### AI Processing

> Processing your bill...

### Empty

> No bookings found.

### Validation

> Please enter a valid Bill ID.

### Duplicate

> This bill has already been successfully processed.

### Payment Failure

> Payment could not be completed. You can retry.

### Network Failure

> Connection lost. Please check your internet connection and try again.

### Permission

> You don't have permission to perform this action.

### Success

> Transaction completed successfully.

### GPS

> Live location is temporarily unavailable.

------------------------------------------------------------------------

# 30. MASTER STATE MODELS

## Physical Transaction

``` text
Initiated
→ Bill Scanned
→ Awaiting Confirmation
→ Processing
→ Payment Pending
→ Successful

Alternative:
Failed / Cancelled
```

## Booking

``` text
Created
→ Confirmed
→ Pending Collection
→ Completed

Alternative:
Cancelled / Expired
```

## Freshness

``` text
Green / Fresh
→ Grey / Aging
→ Red / Expired
→ Admin Decision
   ├── Remove
   ├── Continue Physical Sale if Appropriate
   └── Dispose / Wastage
```

## GPS

``` text
Draft
→ Ready
→ Started
→ Customer Tracking Published
→ Arrived
→ Post-Arrival Processing
→ Customer Tracking Ended
→ Closed
```

------------------------------------------------------------------------

# 31. TESTING AND ACCEPTANCE

Testing must cover both normal operation and failure conditions.

## Physical Transaction

Verify:

``` text
Bill
→ AI
→ Confirmation
→ Subscription
→ Payment
→ Verification
→ Transaction
→ Inventory
→ Ledger
→ TV
→ Receipt
```

## Online Booking

Verify:

``` text
Fish
→ Cart
→ Availability
→ Subscription
→ Payment
→ Booking
→ Reservation
→ Worker
→ Collection
→ Complete
```

## GPS

Verify:

``` text
Journey
→ OneLap
→ Admin
→ Publish
→ Customer
→ Live tracking
→ Arrival/geofence
→ Post-arrival
→ Customer tracking ends
```

## Concurrency

Test simultaneous:

-   Physical sales
-   Online bookings
-   Reservations
-   Payment callbacks
-   Bill scans

The final database state must remain consistent.

------------------------------------------------------------------------

# 32. FAILURE SCENARIOS

The system must handle:

### Bill

-   Blurry image
-   AI failure
-   Incorrect extraction
-   Missing Bill ID
-   Manual Bill ID
-   Duplicate Bill
-   Retry after failed payment

### Payment

-   Failure
-   Timeout
-   Cancel
-   Duplicate callback
-   Webhook delay
-   App closes after payment
-   Provider outage

### Inventory

-   Last quantity bought simultaneously
-   Physical/online conflict
-   Expiry
-   Double release
-   Negative quantity attempt

### Subscription

-   No subscription
-   Ineligible fish
-   Weekly limit exhausted
-   Insufficient credit
-   Expired subscription
-   Multiple credit additions

### Booking

-   Inventory changes before payment
-   App disconnect after payment
-   Expiry
-   Cancellation
-   Duplicate completion
-   Invalid transition

### GPS

-   Provider unavailable
-   Stale location
-   Reconnection
-   False arrival risk
-   Tracking not published

### TV

-   Network loss
-   Browser refresh
-   TV restart
-   Missed realtime event
-   Duplicate event
-   New business day

### Notifications

-   Provider failure
-   Retry
-   Duplicate event
-   Invalid recipient
-   Scheduled notification cancellation

------------------------------------------------------------------------

# 33. TECHNICAL ARCHITECTURE DIRECTION

Recommended current backend architecture:

**Modular monolith + background workers + realtime channel**

Reason:

-   Single store
-   One truck
-   Shared transactional data
-   Strong consistency
-   Lower operational complexity
-   Easier deployment

Logical backend modules:

1.  Authentication
2.  Customer
3.  Worker
4.  Admin
5.  Fish
6.  Category
7.  Inventory
8.  Freshness
9.  Discounts
10. Subscription
11. Booking
12. Physical Bill
13. Transaction
14. Payment
15. Journey
16. GPS
17. Notification
18. Reporting
19. Audit
20. Realtime
21. File Storage
22. Background Jobs
23. Integration Adapters

------------------------------------------------------------------------

# 34. REALTIME ARCHITECTURE

Realtime is required for:

-   Successful transaction TV
-   Customer GPS tracking
-   Admin GPS updates where applicable

Transaction flow:

``` text
Transaction committed
→ Successful event
→ TV projection
→ TV displays
→ Bell sounds
```

TV acknowledgement never controls transaction success.

GPS flow:

``` text
OneLap update
→ Backend state
→ Authorized realtime clients
```

------------------------------------------------------------------------

# 35. FUTURE POS + SI-801 INTEGRATION

## Current

SI-801 weighing machine is used to generate the bill externally.

There is currently **no direct POS/weighing-machine integration**.

Worker uses the tablet.

## Future

When the client provides the POS:

``` text
SI-801
→ POS
→ PondFish integration
→ Transaction workflow
```

This may reduce manual bill scanning, but it must not change current
business rules without approval.

------------------------------------------------------------------------

# 36. IMPLEMENTATION DEPENDENCY ORDER

``` text
1. Project setup
2. Database foundation
3. Authentication + RBAC
4. Fish + Categories
5. Inventory
6. Subscription + Credit Ledger
7. Payment
8. Transaction Engine
9. Bill + AI
10. Online Booking
11. Worker Portal
12. Admin Portal
13. Public Website
14. Customer React Native App
15. Realtime + TV
16. OneLap GPS
17. Notifications
18. Reports + Audit
19. Security hardening
20. E2E testing
21. Staging
22. Production
```

Parallel development is allowed only after shared API/domain contracts
are stable.

------------------------------------------------------------------------

# 37. UI/UX REQUIREMENTS

All portals should use:

-   Clear hierarchy
-   Strong primary actions
-   Consistent spacing
-   Consistent typography
-   Consistent components
-   Clear status indicators
-   Accessible contrast
-   Clear feedback
-   Predictable navigation
-   Appropriate touch targets
-   Confirmation before irreversible financial actions
-   Loading/error/empty states

Freshness colors:

-   Green = Fresh
-   Grey = Aging
-   Red = Expired

Color must never be the only status indicator; use text/icons too.

------------------------------------------------------------------------

# 38. ACCEPTANCE CHECKLIST

The product must support:

1.  Customer OTP authentication.
2.  Public fish discovery.
3.  Admin-controlled online booking eligibility.
4.  Immediate online inventory reservation.
5.  AI physical bill extraction.
6.  Bill confirmation before processing.
7.  Manual Bill ID entry when required.
8.  Duplicate successful Bill ID protection.
9.  Subscription eligibility, weekly limit and credit calculation.
10. Partial credit usage and remaining payment.
11. Server-verified Razorpay payment.
12. Worker-only cash handling.
13. Atomic successful transaction.
14. Real-time successful transaction TV.
15. Bell/sound alert on new successful TV transaction.
16. Online booking worker completion.
17. 48-hour booking expiry.
18. Cancellation restoration.
19. Freshness lifecycle.
20. Admin-controlled discounts.
21. Red fish online removal.
22. Admin expiry alert and physical disposition decision.
23. OneLap GPS integration.
24. Admin-only-by-default GPS visibility.
25. Admin publication of customer tracking.
26. GPS/geofence arrival.
27. Configurable 30--60 minute post-arrival tracking.
28. Automatic customer tracking shutdown.
29. Continued Admin GPS visibility.
30. Notification system.
31. Reports and exports.
32. Audit trail.
33. Failure recovery.
34. Concurrency safety.
35. Future POS/SI-801 extensibility.

------------------------------------------------------------------------

# 39. FINAL MASTER PRINCIPLE

The PondFish system follows this architecture:

``` text
PORTALS
   ↓
SHARED APIs
   ↓
BACKEND DOMAIN SERVICES
   ↓
AUTHORITATIVE DATABASE
   ↓
EVENT / REALTIME / JOB SYSTEM
   ↓
INTEGRATIONS
```

The fundamental rule is:

**Portals display and request actions. The backend owns the business
truth.**

Payment success, inventory, subscription balances, booking state,
transaction state, GPS customer visibility and other critical business
decisions must never depend solely on client-side behavior.

------------------------------------------------------------------------

# 40. FUTURE SCOPE

Not part of the current live MVP unless separately approved:

-   Direct POS integration
-   Direct SI-801 integration
-   Multiple stores
-   Multiple operational trucks
-   Advanced worker-role hierarchy
-   Automatic subscription renewal
-   Managed delivery platform
-   Additional payment gateways
-   Franchise/multi-store management
-   Additional AI automation beyond approved bill extraction

Future features must be introduced without silently changing locked MVP
business rules.

------------------------------------------------------------------------

## DOCUMENT END
