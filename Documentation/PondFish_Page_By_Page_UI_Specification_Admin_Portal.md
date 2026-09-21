# PondFish Digital Ecosystem
# Admin Portal — Page-by-Page UI/UX & Build Specification

**Document Type:** Product Build Specification / Page-by-Page UI Specification  
**Portal:** PondFish Admin Portal  
**Version:** 1.0  
**Status:** Detailed Build Specification  
**Current Scope:** Single Store + One Truck  
**Primary Interface:** Desktop-first responsive web application  
**Secondary Interface:** Tablet-compatible responsive layout  
**Audience:** Client, Product, UI/UX, Frontend, Backend, QA, DevOps, AI-assisted development teams  
**Parent Documents:** PondFish Master PRD v2.0, PondFish Admin Portal PRD v1.0, PondFish System & Technical Architecture v1.0, PondFish Complete Design System & UI/UX Specification  
**Purpose:** Build-ready page, state, interaction, data, validation, error, responsive, and implementation specification for the Admin Portal.

---

# 1. DOCUMENT PURPOSE

This document converts the approved Admin Portal requirements into a page-by-page implementation specification.

It is intentionally detailed because it will be used to produce:

1. the Admin Portal UI skeleton;
2. Stitch/UI design templates;
3. frontend implementation;
4. backend/API integration;
5. permission-aware interactions;
6. QA scenarios;
7. error and edge-case handling;
8. AI coding-agent context;
9. client review of the intended operational interface.

The Admin Portal is the operational control center of PondFish. It provides visibility, configuration, approved intervention, reporting, and audit around the shared business workflows.

The Admin Portal must **not** duplicate Customer Portal or Worker Portal workflows.

The Admin Portal PRD defines the portal as a control layer over the shared backend and requires historical integrity, financial/inventory safety, and audited high-impact actions. fileciteturn30file0L23-L48

---

# 2. SOURCE-OF-TRUTH HIERARCHY

The implementation must follow this hierarchy:

```text
Backend / API Contract
        ↓
PondFish Master PRD
        ↓
Business Workflow Specifications
        ↓
System & Technical Architecture
        ↓
Design System
        ↓
This Admin Page-by-Page Specification
        ↓
Implementation
```

The UI specification explains:

- where the administrator enters a workflow;
- what is displayed;
- what action is available;
- what state is shown;
- what validation is required;
- what feedback is required.

It must not silently redefine business logic.

The broader design-system document establishes the same principle: business workflows are defined once, while page specifications define presentation and interaction. fileciteturn29file8L1249-L1308

---

# 3. ADMIN PORTAL RESPONSIBILITY

The Admin Portal manages:

- dashboard and operational overview;
- fish catalog;
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
- reports and exports;
- audit logs;
- operational exceptions;
- admin security.

The current Admin PRD explicitly lists these responsibilities. fileciteturn30file0L23-L46

---

# 4. ADMIN PORTAL BOUNDARIES

The Admin Portal must NOT:

- book fish for customers;
- scan customer QR codes as a worker operation;
- complete worker collection tasks;
- manually perform customer payment processing as a substitute for the payment workflow;
- authenticate customers;
- directly manipulate the TV display;
- replace the Worker Portal;
- replace the Customer Portal;
- silently overwrite historical transaction records.

Instead, Admin supervises and configures the systems performing those workflows. fileciteturn29file6L808-L832

---

# 5. CURRENT SCOPE

## 5.1 Operational scope

```text
1 Store
1 Operational Truck
Admin Portal
Worker Tablet Portal
Customer Portal
Transaction TV
Public Website
Shared Backend
```

The architecture must remain extensible for:

- multiple stores;
- multiple trucks;
- POS;
- weighing-machine integration;
- additional roles.

---

# 6. ADMIN USER

The primary user is an authorized PondFish administrator/store manager.

The interface must assume that the administrator:

- understands store operations;
- needs fast access to operational information;
- may work under time pressure;
- may manage inventory and customer records;
- may investigate payment/transaction issues;
- may publish customer-facing content;
- may manage live truck visibility.

The UI should therefore optimize for:

```text
Operational visibility
+
Fast navigation
+
Clear data
+
Safe destructive actions
+
Traceability
```

The existing Admin architecture emphasizes business management rather than software management and prioritizes operational visibility, minimal navigation, real-time information, clear data presentation, and fast access. fileciteturn29file6L1066-L1094

---

# 7. ADMIN INFORMATION ARCHITECTURE

Primary navigation:

```text
PondFish Admin
│
├── Operations
│   ├── Dashboard
│   ├── Inventory
│   ├── Bookings
│   ├── Transactions
│   └── Truck & GPS
│
├── Catalog & Commercial
│   ├── Fish Management
│   ├── Categories
│   ├── Discounts
│   └── Subscriptions
│
├── People
│   ├── Customers
│   └── Workers
│
├── Communication
│   ├── Notifications
│   └── Website Content
│
├── Business
│   ├── Business Settings
│   └── Reports & Exports
│
├── Governance
│   ├── Audit Logs
│   ├── Exceptions
│   └── Admin Security
│
└── Account
    ├── Profile
    └── Logout
```

The core Admin PRD specifies the same primary navigation groups. fileciteturn30file0L128-L162

---

# 8. ROUTE INVENTORY

Recommended routes:

```text
/admin/login

/admin
/admin/dashboard

/admin/inventory
/admin/inventory/:fishId
/admin/inventory/:fishId/history

/admin/fish
/admin/fish/new
/admin/fish/:fishId

/admin/categories
/admin/categories/new
/admin/categories/:categoryId

/admin/discounts
/admin/discounts/new
/admin/discounts/:campaignId

/admin/subscriptions
/admin/subscriptions/plans
/admin/subscriptions/customers/:customerId
/admin/subscriptions/customers/:customerId/add
/admin/subscriptions/customers/:customerId/ledger

/admin/customers
/admin/customers/:customerId

/admin/workers
/admin/workers/new
/admin/workers/:workerId

/admin/bookings
/admin/bookings/:bookingId

/admin/transactions
/admin/transactions/:transactionId

/admin/journeys
/admin/journeys/new
/admin/journeys/:journeyId
/admin/journeys/:journeyId/live

/admin/notifications
/admin/notifications/new
/admin/notifications/:notificationId

/admin/content
/admin/content/hero
/admin/content/about
/admin/content/contact
/admin/content/promotions
/admin/content/subscriptions

/admin/settings

/admin/reports
/admin/reports/revenue
/admin/reports/inventory
/admin/reports/bookings
/admin/reports/subscriptions
/admin/reports/workers
/admin/exports

/admin/audit-logs
/admin/exceptions
/admin/security
/admin/profile
```

Exact route naming remains an engineering decision, but the page responsibilities must remain equivalent.

---

# 9. GLOBAL ADMIN LAYOUT

Desktop:

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Top Header                                      Admin      │
│         ├─────────────────────────────────────────────────────────────┤
│         │ Breadcrumb                                                 │
│         │ Page Title                             Primary Action      │
│         │                                                             │
│         │ Filters / Search                                            │
│         │                                                             │
│         │ Main Content                                                │
│         │                                                             │
│         │                                                             │
└───────────────────────────────────────────────────────────────────────┘
```

The Admin PRD explicitly recommends:

- left navigation;
- top header;
- breadcrumb;
- page title;
- page actions;
- filter/search toolbar;
- main content;
- toast/alert area. fileciteturn30file0L166-L181

---

# 10. SIDEBAR

## 10.1 Behavior

Desktop:

- persistent sidebar.

Tablet:

- collapsible drawer.

The existing architecture specifies persistent left navigation on desktop and a collapsible navigation drawer on tablets. fileciteturn29file6L1010-L1062

## 10.2 Sidebar sections

Use section labels:

```text
OPERATIONS
CATALOG & COMMERCIAL
PEOPLE
COMMUNICATION
BUSINESS
GOVERNANCE
ACCOUNT
```

## 10.3 Active state

The current page must have:

- clear active navigation;
- sufficient contrast;
- icon + label;
- no color-only state.

## 10.4 Sidebar rules

Do not:

- hide important modules behind multiple nested levels;
- create excessive navigation depth;
- use unexplained icon-only navigation on desktop.

---

# 11. TOP HEADER

Recommended content:

```text
PondFish
[Current page context]

Search / global shortcut if approved

Alerts
Admin Profile
```

The header must not become a second navigation system.

---

# 12. GLOBAL PAGE HEADER

Every module page should use:

```text
Breadcrumb
Page Title
Short Description
Primary Action
Optional Secondary Actions
```

Example:

```text
Operations / Inventory

Inventory
Manage physical stock, reservations, freshness and online booking availability.

[Adjust Stock]
```

---

# 13. GLOBAL DATA TABLE RULES

Large datasets must support, where applicable:

- search;
- filters;
- sorting;
- pagination;
- row actions;
- loading;
- empty state;
- error state;
- retry.

This is explicitly required by the Admin PRD. fileciteturn30file0L183-L195

---

# 14. GLOBAL SEARCH RULES

Major lists should use:

- debounced search;
- server-side filtering;
- server-side sorting;
- pagination;
- clear filters.

Filters should remain during normal navigation within a module where practical. fileciteturn31file1L1164-L1176

---

# 15. GLOBAL STATE RULES

Every important page must define:

```text
Loading
Empty
Success
Validation Error
Business Rule Error
Network Error
Conflict
Authorization Error
```

The Admin PRD explicitly requires these global states. fileciteturn30file0L197-L218

---

# 16. GLOBAL CONFIRMATION RULE

High-impact actions require confirmation.

Examples:

- block customer;
- deactivate customer;
- disable worker;
- adjust credit;
- large inventory adjustment;
- cancel booking;
- publish GPS;
- publish public content;
- change business settings.

These confirmation requirements are defined in the Admin PRD. fileciteturn31file0L432-L469

---

# 17. GLOBAL FORM RULES

Every form must support:

- clear labels;
- required markers where applicable;
- field-level validation;
- safe defaults;
- disabled submit while submitting;
- duplicate-submit prevention;
- success feedback;
- error feedback;
- preserved safe input on network failure;
- cancellation without accidental submission.

---

# 18. GLOBAL TOAST RULES

Success toast:

```text
Inventory updated successfully.
```

Error toast:

```text
Unable to update inventory. Please try again.
```

Business rule:

```text
This fish cannot be booked online because it has expired.
```

Never show raw API errors.

---

# 19. GLOBAL CURRENCY

Use:

```text
₹
```

Examples:

```text
₹2,000
₹6,000
₹1,250.00
```

Currency formatting must be consistent.

---

# 20. GLOBAL QUANTITY

Fish quantity is measured in kilograms.

Examples:

```text
0.50 kg
1.20 kg
12.00 kg
```

Never show ambiguous fish quantities without units.

---

# 21. GLOBAL TIME

Financial, booking, GPS, inventory, and audit events use server-authoritative timestamps.

Do not rely on the browser clock for business events. fileciteturn30file0L220-L232

---

# 22. GLOBAL RESPONSIVE RULES

Desktop-first.

Recommended behavior:

```text
Desktop
→ full sidebar + multi-column content

Tablet
→ collapsible sidebar + compact tables

Small viewport
→ stacked cards + horizontally scrollable data tables where necessary
```

Do not attempt to turn complex Admin tables into consumer-style mobile cards unless readability requires it.

---

# 23. ADMIN-01 — LOGIN

## Page ID

`ADMIN-01`

## Page Name

Admin Login

## Purpose

Authenticate an administrator securely.

## Access

Unauthenticated visitor.

## UI

```text
PondFish Logo

Admin Portal

Email
[________________]

Password
[________________]

[ Sign In ]

Forgot Password / recovery mechanism if supported
```

## States

### Loading

```text
Signing in...
```

### Invalid credentials

```text
Invalid email or password.
```

### Disabled account

```text
This administrator account is disabled.
```

### Session expired

```text
Your session has expired. Please sign in again.
```

### Network failure

```text
Unable to connect. Check your connection and try again.
```

### Rate limit

```text
Too many attempts. Please wait and try again.
```

The Admin PRD requires all of these login states. fileciteturn31file0L432-L450

---

# 24. ADMIN-01 LOGIN VALIDATION

Email:

- required;
- valid email format.

Password:

- required;
- never display password in plain text by default.

Submit:

- disabled while request is in progress.

Repeated clicks must not create duplicate login requests.

---

# 25. ADMIN-01 ACCEPTANCE

- Valid admin can log in.
- Invalid credentials are rejected.
- Disabled admin is rejected.
- Session is established securely.
- Session expiry returns to login.
- Sensitive credentials never appear in logs/UI.

---

# 26. ADMIN-02 — DASHBOARD

## Purpose

Give the administrator an immediate overview of operational health.

## Layout

```text
Dashboard
[Date Range]

Inventory
[Total] [Available] [Low Stock] [Aging] [Expired]

Bookings
[Today] [Pending] [Completed] [Cancelled] [Expired]

Transactions
[Successful] [Failed] [Bill Value] [Subscription Used] [Extra Payment]

Subscriptions
[Active] [Expiring] [Sales] [Outstanding Credit]

Truck
[Status] [Journey] [GPS] [ETA] [Arrival]

Freshness Alerts
[Alert List]

Worker Summary
[Active Workers] [Today's Orders] [Completed]
```

The required dashboard card groups are defined in the Admin PRD. fileciteturn30file0L236-L325

---

# 27. DASHBOARD DATE FILTER

Business/reporting cards may support:

```text
Today
Yesterday
This Week
This Month
Custom Range
```

Live operational cards such as active truck status remain current rather than being historically filtered.

---

# 28. DASHBOARD INVENTORY CARDS

Show:

- total fish items;
- available fish;
- unavailable fish;
- low-stock fish;
- aging fish;
- expired fish.

Clicking a card opens the corresponding filtered inventory view.

---

# 29. DASHBOARD BOOKING CARDS

Show:

- today's bookings;
- pending collection;
- completed;
- cancelled;
- expired.

Clicking a card opens filtered Bookings.

---

# 30. DASHBOARD TRANSACTION CARDS

Show:

- successful transactions;
- failed transactions;
- total bill value;
- subscription value used;
- additional payments;
- payment-method summary.

---

# 31. DASHBOARD SUBSCRIPTION CARDS

Show:

- active subscriptions;
- expiring subscriptions;
- subscription sales;
- outstanding Subscription Credit.

---

# 32. DASHBOARD TRUCK CARD

Show:

- truck status;
- current journey;
- origin;
- fixed store destination;
- fish being transported;
- quantity;
- GPS state;
- ETA;
- arrival state.

---

# 33. DASHBOARD FRESHNESS ALERTS

Priority order:

```text
Expired
Approaching Expiry
Aging
Approaching Aging Threshold
```

The dashboard must not create excessive alerts for routine successful operations.

---

# 34. DASHBOARD WORKER SUMMARY

Show:

- active workers;
- today's handled orders;
- today's completed bookings;
- monthly handled orders.

---

# 35. DASHBOARD LOADING

Each independent widget may load independently.

A failure in one widget must not unnecessarily block unrelated widgets.

Use widget-level skeletons.

---

# 36. DASHBOARD EMPTY

For zero values:

```text
0
```

Do not hide zero values.

If there are no alerts:

```text
No operational alerts.
```

---

# 37. DASHBOARD NETWORK ERROR

If one widget fails:

```text
Unable to load this section.
[Retry]
```

Do not replace the entire dashboard if unrelated sections remain usable.

---

# 38. ADMIN-03 — INVENTORY LIST

## Purpose

Manage and inspect fish inventory.

## Columns

```text
Fish
Physical Qty
Reserved Qty
Available Qty
Freshness
Online Booking
Discount
Freshness Started
Freshness Expires
Last Updated
Actions
```

These columns are specified in the Admin PRD. fileciteturn30file0L337-L353

---

# 39. INVENTORY SEARCH

Search:

```text
Fish name
```

Use debouncing and server-side search.

---

# 40. INVENTORY FILTERS

```text
Available
Unavailable
Low Stock
Fresh
Aging
Expired
Online Enabled
Online Disabled
Discount Active
```

---

# 41. INVENTORY QUANTITY MODEL

Always distinguish:

```text
Physical Quantity
Reserved Quantity
Available Quantity
```

Never display only one number when reservation state affects online availability.

---

# 42. INVENTORY ROW ACTIONS

Possible:

```text
View
Adjust Quantity
View History
```

Do not put destructive actions as the default primary row action.

---

# 43. ADMIN-04 — INVENTORY ADJUSTMENT

## Purpose

Allow authorized admin to correct physical stock.

## Supported actions

- increase;
- decrease;
- set exact quantity.

## Required fields

```text
Fish
Current Quantity
Adjustment Type
Adjustment Quantity
New Quantity
Reason
```

Reason is mandatory.

---

# 44. INVENTORY ADJUSTMENT REASONS

Suggested:

```text
New stock received
Weight correction
Dead fish removed
Physical correction
Wastage
Other
```

---

# 45. INVENTORY ADJUSTMENT CONFIRMATION

Show:

```text
Current Quantity
Adjustment
Resulting Quantity
Reason
```

Example:

```text
Current: 12.00 kg
Adjustment: -2.00 kg
New: 10.00 kg

Reason:
Wastage

[Cancel] [Confirm Adjustment]
```

---

# 46. INVENTORY CONFLICT

If inventory changed while the admin was editing:

```text
Inventory changed elsewhere.

Current quantity: 14.00 kg
Your previous value: 12.00 kg

Refresh before applying this adjustment.
```

Required behavior:

1. reject stale write;
2. refresh current quantity;
3. show conflict;
4. require review.

This is explicitly required. fileciteturn30file0L420-L427

---

# 47. INVENTORY NEGATIVE STOCK

Never permit negative inventory.

If adjustment would produce:

```text
-1.00 kg
```

show:

```text
Quantity cannot be negative.
```

No backend mutation should occur.

---

# 48. INVENTORY HISTORY

Display ledger:

```text
Date/Time
Previous Qty
Adjustment
New Qty
Reason
Admin
Reference
```

Every manual adjustment must remain traceable.

---

# 49. ADMIN-05 — FISH MANAGEMENT

## Purpose

Manage fish catalog information and online eligibility.

## List columns

```text
Fish Name
Display Name
Quantity
Online Booking
Freshness Duration
Freshness Status
Discount
Active
Last Updated
Actions
```

---

# 50. FISH CREATE

Fields:

```text
Fish Name
Display Name
Description
Unit
Online Booking Eligibility
Freshness Duration
Active
Category
```

The underlying Admin PRD requires fish name, display name, description, unit, online eligibility, freshness duration, and active status. fileciteturn30file0L435-L461

---

# 51. FISH EDIT

Editable:

- catalog information;
- display information;
- freshness configuration;
- online eligibility;
- active status.

Historical records must retain their original business meaning.

Example:

Changing:

```text
Rohu → Premium Rohu
```

must not rewrite historical transaction descriptions.

---

# 52. ONLINE BOOKING ELIGIBILITY

Admin explicitly controls which fish can be booked online.

Final customer-facing availability is still determined by:

```text
Admin eligibility
+
Stock
+
Reservation state
+
Freshness
+
Active status
+
Other business rules
```

The Admin PRD explicitly states that online availability is not determined by a hard-coded fish list. fileciteturn30file0L469-L481

---

# 53. FRESHNESS STATUS

Default:

```text
0–24h   Fresh
24–48h  Aging
>48h    Expired
```

Freshness duration must remain configurable per fish.

---

# 54. EXPIRED FISH WORKFLOW

At expiry:

```text
Remove from online availability
        ↓
Notify admin
        ↓
Mark expired
        ↓
Admin chooses disposition
```

Admin options:

```text
Remove Permanently
Continue Physical Sale Temporarily
Mark Disposed / Wastage
```

The decision must be recorded.

---

# 55. ADMIN-06 — CATEGORY MANAGEMENT

## Purpose

Manage fish categories used across the public website, customer experience, and catalog.

## List

```text
Category Name
Display Name
Fish Count
Active
Display Order
Last Updated
Actions
```

## Actions

```text
Create
Edit
Activate
Deactivate
Reorder
```

## Rules

- Do not delete a category if historical records depend on it without an approved archival strategy.
- Deactivation should not erase historical category associations.
- Category ordering should propagate to customer/public catalog views where applicable.

---

# 56. CATEGORY CREATE

Fields:

```text
Category Name
Display Name
Description
Image/Icon if supported
Display Order
Active
```

---

# 57. CATEGORY EMPTY STATE

```text
No categories created yet.

Create a category to organize fish in the catalog.

[Create Category]
```

---

# 58. CATEGORY CONFLICT

If another admin changes the category ordering:

```text
Category structure changed elsewhere.
Refresh before saving.
```

---

# 59. ADMIN-07 — DISCOUNTS

## Purpose

Create and manage manual and scheduled discounts.

## List columns

```text
Campaign
Fish
Discount Type
Discount Value
Start
End
Status
Created By
Actions
```

---

# 60. DISCOUNT TYPES

Support:

```text
Percentage
Fixed Amount
```

---

# 61. CAMPAIGN STATES

```text
Draft
Scheduled
Active
Ended
Cancelled
```

---

# 62. CREATE DISCOUNT

Fields:

```text
Campaign Name
Fish
Discount Type
Discount Value
Start Date/Time
End Date/Time
Audience if applicable
Send Notification
```

---

# 63. DISCOUNT VALIDATION

Validate:

- campaign name;
- fish selection;
- discount value;
- date range;
- supported discount type;
- no invalid negative value;
- start before end.

---

# 64. DISCOUNT BUSINESS RULE

Aging/grey freshness does not automatically create a discount.

Admin explicitly controls discounts.

This is a locked business rule. fileciteturn30file0L556-L566

---

# 65. CONFLICTING DISCOUNTS

If multiple campaigns affect one fish:

```text
Configured priority determines applicable discount.
```

Do not silently stack discounts unless a future business rule explicitly permits it.

---

# 66. DISCOUNT END

When campaign ends:

```text
Discount ends
Fish remains sellable if otherwise valid
```

Do not automatically make the fish unavailable.

---

# 67. ADMIN-08 — SUBSCRIPTION PLAN LIST

## Purpose

Manage configurable subscription plans.

## Current plans

```text
₹2,000
₹6,000
```

Plan structure must remain configuration-driven.

---

# 68. PLAN LIST COLUMNS

```text
Plan Name
Price
Credit Added
Expiry Rule
Active
Active Subscribers
Actions
```

---

# 69. PLAN CREATE/EDIT

Fields:

```text
Plan Name
Price
Credit Amount
Expiry Configuration
Active
```

---

# 70. SUBSCRIPTION CUSTOMER SEARCH

Search:

```text
Customer Name
Mobile Number
```

Display:

```text
Current Credit
Active Plan
Expiry
Purchase History
Credit Usage
Credit Restoration
```

---

# 71. ADMIN-09 — ADD SUBSCRIPTION TO CUSTOMER

## Flow

```text
Search Customer
      ↓
Select Customer
      ↓
Select Plan
      ↓
Review Amount + Credit
      ↓
Select Payment Source
      ↓
Confirm
      ↓
Verify / Record Payment
      ↓
Add Credit
      ↓
Create Ledger Entry
      ↓
Success
```

This flow is defined by the Admin PRD. fileciteturn30file0L622-L635

---

# 72. PAYMENT SOURCE

Supported admin-assisted purchase:

```text
Cash
Razorpay
```

Cash is successful only after explicit admin confirmation.

Razorpay must be server-verified.

---

# 73. SUBSCRIPTION CREDIT ACCUMULATION

Example:

```text
Existing Credit: ₹1,000
New Credit: ₹2,000
Result: ₹3,000
```

Never overwrite valid existing credit.

---

# 74. SUBSCRIPTION PURCHASE CONFIRMATION

Show:

```text
Customer
Plan
Price
Credit Added
Payment Source
Existing Credit
New Credit
```

Confirm only after review.

---

# 75. SUBSCRIPTION HISTORY

Columns:

```text
Date
Customer
Plan
Amount
Payment Source
Credit Added
Payment Reference
Expiry
Status
Admin
```

---

# 76. SUBSCRIPTION CREDIT LEDGER

Every movement must show:

```text
Opening Balance
Movement
Closing Balance
Reason
Reference
Actor
Timestamp
```

Movement types include:

- subscription purchase;
- fish purchase;
- refund restoration;
- booking cancellation restoration;
- admin adjustment;
- other approved movement.

---

# 77. MANUAL CREDIT ADJUSTMENT

Fields:

```text
Amount
Direction
Reason
Confirmation
```

Rules:

- reason required;
- cannot produce negative credit;
- must be audited;
- idempotent.

---

# 78. CREDIT ADJUSTMENT CONFIRMATION

Example:

```text
Current Credit: ₹3,000

Adjustment: -₹500

New Credit: ₹2,500

Reason:
Approved operational correction

[Cancel] [Confirm Adjustment]
```

---

# 79. ADMIN-10 — CUSTOMER LIST

## Columns

```text
Name
Phone
Status
Subscription Status
Credit Balance
Booking Count
Transaction Count
Last Activity
Created Date
Actions
```

---

# 80. CUSTOMER SEARCH

Search:

```text
Name
Phone
```

Debounced, server-side.

---

# 81. CUSTOMER FILTERS

```text
Active
Blocked
Deactivated
Active Subscription
No Active Subscription
Recent Activity
```

---

# 82. CUSTOMER DETAIL

Sections:

```text
Profile
Subscription
Bookings
Transactions
Activity / Audit where authorized
```

---

# 83. CUSTOMER PROFILE

Display:

```text
Name
Phone
Status
Created Date
Last Activity
```

Do not expose unnecessary sensitive information.

---

# 84. CUSTOMER SUBSCRIPTION SECTION

Display:

```text
Current Credit
Current Plan
Expiry
Purchase History
Credit Ledger
```

---

# 85. CUSTOMER BOOKINGS SECTION

Display:

```text
Booking ID
Fish
Quantity
Amount
Status
Created
Expiry
```

Clicking a booking opens Booking Detail.

---

# 86. CUSTOMER TRANSACTIONS SECTION

Display:

```text
Transaction ID
Bill ID
Fish
Quantity
Status
Amount
Date
```

---

# 87. CUSTOMER BLOCK

Blocking requires confirmation.

Confirmation must identify:

- customer;
- current status;
- active operational records;
- effect on new customer activities.

Blocking must not delete history.

---

# 88. CUSTOMER BLOCKED STATE

Blocked customer cannot perform new normal customer activities, including new bookings.

Existing historical records remain intact.

---

# 89. CUSTOMER DEACTIVATION

Deactivation:

- preserves historical records;
- changes account availability according to backend rules;
- requires confirmation;
- is audited.

---

# 90. ADMIN-11 — WORKER LIST

## Columns

```text
Worker
Email
Status
Created Date
Today's Orders
Monthly Orders
Last Activity
Actions
```

---

# 91. WORKER CREATE

Fields:

```text
Name
Email
Password / Setup Mechanism
Active Status
```

Worker authentication uses email + password.

---

# 92. WORKER EDIT

Admin can edit:

```text
Name
Email
Account Status
```

Do not expose existing password.

Use reset/setup flow instead.

---

# 93. WORKER DISABLE

Disable action:

```text
Prevent new login
Preserve history
Preserve historical attribution
```

Confirmation required.

---

# 94. WORKER PERFORMANCE

Display:

```text
Today's Orders
Today's Completed Bookings
Monthly Orders
Successful Transactions
Recorded Failed Attempts
```

Performance data is informational and traceability-oriented.

---

# 95. WORKER TRACEABILITY

Search by:

```text
Booking ID
Transaction ID
Bill ID
```

Result should identify the worker associated with the operation.

---

# 96. ADMIN-12 — BOOKINGS LIST

## Purpose

Provide visibility and approved intervention over bookings.

Customer Portal owns booking creation.

Worker Portal owns collection/completion.

Admin provides oversight and intervention.

---

# 97. BOOKING LIST

Columns:

```text
Booking ID
Customer
Phone
Source
Fish
Quantity
Total Payment
Subscription Amount
Additional Payment
Status
Created
Expiry / Collection Time
```

---

# 98. BOOKING SOURCE

Clearly distinguish:

```text
Online
Physical-store
```

where the unified history model contains both.

---

# 99. BOOKING SEARCH

Support:

```text
Booking ID
Customer Name
Phone
Total Payment Amount
Fish Name
```

---

# 100. BOOKING FILTERS

```text
Created
Confirmed
Pending Collection
Completed
Cancelled
Expired
Date
Source
```

---

# 101. BOOKING DETAIL

Sections:

```text
Customer
Fish
Quantity
Pricing
Subscription Coverage
Additional Payment
Payment Status
Booking Status
Creation Time
Expiry
Collection / Worker Information
Audit Timeline
```

---

# 102. BOOKING STATUS

Recommended lifecycle:

```text
Created
   ↓
Confirmed
   ↓
Pending Collection
   ↓
Completed

Terminal alternatives:
Cancelled
Expired
```

Invalid state transitions must be rejected.

---

# 103. ADMIN BOOKING CANCELLATION

Admin may cancel an incomplete booking when operationally necessary.

The UI must clearly explain restoration effects before confirmation.

Cancellation restores, according to authoritative business rules:

- reserved inventory;
- subscription quantity;
- Subscription Credit;
- applicable Razorpay-paid amount as Subscription Credit.

There is no cancellation fee.

---

# 104. BOOKING CANCELLATION CONFIRMATION

Display:

```text
Booking ID
Customer
Fish
Quantity
Current Status

Inventory to restore
Subscription quantity to restore
Credit to restore

[Cancel] [Confirm Cancellation]
```

Do not allow cancellation of a completed booking through the normal cancellation action.

---

# 105. BOOKING EXPIRY

Current expiry:

```text
48 hours
```

At expiry:

```text
Booking → Expired
Inventory released
Subscription quantity restored
Subscription Credit restored
Applicable Razorpay-paid amount restored as Subscription Credit
```

---

# 106. ADMIN-13 — TRANSACTIONS LIST

## Columns

```text
Transaction ID
Bill ID
Customer
Fish
Quantity
Bill Amount
Subscription Used
Additional Amount
Payment Method
Worker
Status
Date/Time
```

---

# 107. TRANSACTION STATUS

Support authoritative states such as:

```text
Pending
Successful
Failed
Cancelled
Refunded / Restored where applicable
```

Only successful transactions are published to TV.

---

# 108. TRANSACTION DETAIL

Sections:

```text
Customer
Bill
Fish
Calculation
Payment
Attribution
Audit
```

---

# 109. TRANSACTION CUSTOMER SECTION

Show:

```text
Name
Phone if authorized
```

Keep customer data access controlled.

---

# 110. TRANSACTION BILL SECTION

Show:

```text
Bill ID
Original Bill Image
Extracted Data
Confirmed Data
```

The original physical bill image must remain linked to the transaction.

---

# 111. TRANSACTION AI SECTION

Show comparison where available:

```text
AI Extracted
vs
Confirmed
```

AI extraction is an input to the physical transaction workflow, not financial truth.

Admin may inspect extracted versus confirmed values for support and audit. fileciteturn31file0L20-L34

---

# 112. TRANSACTION FISH SECTION

Display:

```text
Fish
Quantity
Price
Line Total
```

For multiple fish:

```text
Rohu — 1.20 kg — ₹600
Catla — 0.80 kg — ₹450
Pamplet — 0.50 kg — ₹350
```

---

# 113. TRANSACTION CALCULATION SECTION

Show:

```text
Total Bill Amount
Subscription-Covered Quantity
Subscription Value Used
Extra Quantity
Extra Amount
Razorpay Fee
GST on Razorpay Fee
Final Payable Amount
```

---

# 114. TRANSACTION PAYMENT SECTION

Show:

```text
Payment Method
Razorpay Transaction ID
Verification State
```

Never expose payment credentials.

---

# 115. TRANSACTION ATTRIBUTION

Show:

```text
Worker
Timestamp
```

---

# 116. TRANSACTION AUDIT

Show:

```text
Status Events
Corrections
Administrative Interventions
```

Admin corrections must preserve the original financial record and create an adjustment/correction record.

---

# 117. DUPLICATE BILL ID

If a Bill ID is already associated with a successful transaction:

```text
This Bill ID has already been successfully processed.

Existing Transaction:
TX-XXXX
```

Do not allow another successful transaction.

---

# 118. ADMIN-14 — TRUCK & GPS JOURNEYS

## Journey List

Columns:

```text
Journey ID
Truck
Origin
Destination
Fish
Quantity
Start Time
Arrival Time
GPS Publishing State
Journey Status
Actions
```

---

# 119. CREATE JOURNEY

Fields:

```text
Fish
Quantity for each fish
Origin
Fixed Store Destination
Journey Details
```

---

# 120. JOURNEY VALIDATION

Before start/publish:

- fish exists;
- quantity valid;
- origin valid;
- destination matches configured store;
- truck does not have an incompatible active journey.

---

# 121. JOURNEY STATES

```text
Draft
Scheduled
Ready
Live
Arrived
Post-Arrival Processing
Customer Tracking Ended
Completed
Cancelled
```

---

# 122. JOURNEY DETAIL

Show:

```text
Journey information
Truck
Origin
Destination
Fish manifest
Quantity
Status
Start time
Arrival time
GPS status
Customer tracking state
ETA
Last update
Audit timeline
```

---

# 123. START JOURNEY

Action:

```text
[Start Journey]
```

Confirmation:

```text
Starting this journey will activate GPS monitoring.
```

On success:

```text
Journey started successfully.
```

The authoritative journey start timestamp is recorded server-side.

---

# 124. PUBLISH GPS

Customer tracking begins only when Admin explicitly publishes GPS.

Confirmation:

```text
Publish live location to customers?

Customers will be able to see:
• Live location
• ETA
• Journey information

[Cancel] [Publish GPS]
```

Publishing may trigger a notification if configured.

---

# 125. LIVE JOURNEY VIEW

Show:

```text
Map
Current Location
Route
Origin
Destination
ETA
Last Update
GPS Connection State
Fish Manifest
Journey State
Customer Tracking State
```

---

# 126. GPS LIVE MAP

Map is operational, not decorative.

Prioritize:

- truck location;
- route;
- destination;
- stale status;
- last update.

Do not hide stale GPS state.

---

# 127. GPS STALE STATE

If GPS becomes unavailable:

```text
GPS signal unavailable.

Showing last known location.
Last updated: 10:42 AM
```

Never fabricate a location.

The Admin PRD requires last-known location plus stale status when GPS is unavailable. fileciteturn31file1L1110-L1124

---

# 128. ARRIVAL

Arrival is detected using GPS/geofence.

On arrival:

```text
Record arrival timestamp
Trigger arrival event
Update journey state
Trigger configured arrival notification
Start post-arrival period
```

---

# 129. POST-ARRIVAL TRACKING

Customer tracking remains available for configured period.

Recommended:

```text
30–60 minutes
```

Afterward:

```text
Customer tracking ends
Admin GPS visibility may continue
Journey proceeds operationally
```

---

# 130. INVENTORY ARRIVAL

Arrival must connect to inventory receiving.

UI should show:

```text
Expected Fish
Expected Quantity
Received / Processed Quantity
Status
```

The system must prevent double-counting transported stock.

---

# 131. ADMIN-15 — NOTIFICATIONS

## Purpose

Send customer-facing communications.

## Audience options

```text
Everyone
Subscription Customers
Specific Subscription Plan
Individual Customer
```

Use actual configured plan IDs/names.

---

# 132. NOTIFICATION COMPOSER

Fields:

```text
Title
Message
Audience
Channels
Send Now / Schedule
Scheduled Date/Time
Optional Deep Link
```

---

# 133. NOTIFICATION CHANNELS

Architecture may support:

```text
In-App
Push
SMS
WhatsApp
```

Availability depends on configured providers.

---

# 134. NOTIFICATION PREVIEW

Before sending:

```text
Title
Message
Audience
Channels
Schedule
Estimated recipient scope if available
```

Provide explicit confirmation for send.

---

# 135. NOTIFICATION SCHEDULING

Admin can:

```text
Schedule
Edit before dispatch
Cancel before dispatch
```

After dispatch, editing should not pretend to modify already-delivered messages.

---

# 136. NOTIFICATION STATES

```text
Draft
Scheduled
Sending
Sent
Partially Failed
Failed
Cancelled
```

---

# 137. NOTIFICATION FAILURE

A notification failure must never roll back:

- payment;
- booking;
- transaction;
- inventory;
- subscription.

This is explicitly required. fileciteturn31file0L208-L233

---

# 138. ADMIN-16 — WEBSITE CONTENT

## Purpose

Control customer-facing public website content.

Managed content:

```text
Hero Banner
About Us
Contact Details
Promotional Banners
Subscription Advertisements
```

---

# 139. HERO CONTENT

Actions:

```text
Upload
Replace
Enable
Disable
Configure supported CTA
```

---

# 140. HERO EDITOR

Fields:

```text
Image
Headline if supported
Supporting Text
CTA Label
CTA Destination
Active
Schedule if supported
```

Do not allow arbitrary unsafe URLs if the design system requires controlled destinations.

---

# 141. ABOUT US

Editable content.

Provide:

- text editor;
- preview;
- draft/publish state if supported.

---

# 142. CONTACT CONTENT

Editable:

```text
Contact Number
Contact information
```

Changes should propagate to public website after publishing where applicable.

---

# 143. PROMOTIONAL BANNERS

Admin can:

```text
Create
Edit
Activate
Deactivate
Schedule
```

---

# 144. SUBSCRIPTION ADVERTISEMENT

Admin can update customer-facing subscription promotional content.

The content should reference the current active plan configuration rather than hard-coding prices in multiple unrelated places.

---

# 145. CONTENT PUBLISHING

Where supported:

```text
Draft
Published
Scheduled
```

Publishing must be explicit.

---

# 146. CONTENT PREVIEW

Before publishing:

```text
Desktop Preview
Mobile Preview
```

if the public website supports both.

Admin should see the customer-facing result before publication.

---

# 147. CONTENT PUBLISH CONFIRMATION

Show:

```text
You are about to publish changes to the public website.

[Cancel] [Publish]
```

Publishing is audited.

---

# 148. ADMIN-17 — BUSINESS SETTINGS

## Current settings

```text
Contact Number
Opening Time
Closing Time
Store Destination
```

---

# 149. BUSINESS HOURS

Fields:

```text
Opening Time
Closing Time
```

Validate time values.

If overnight hours are supported later, the data model must explicitly represent the overnight case.

---

# 150. STORE DESTINATION

The fixed store destination used for truck journeys is centrally configured.

Because this affects GPS operations:

```text
Require elevated confirmation
```

before saving a change.

---

# 151. SETTINGS CONFIRMATION

Example:

```text
Changing the store destination will affect future truck journeys and GPS behavior.

Old:
Store A

New:
Store B

[Cancel] [Confirm Change]
```

---

# 152. ADMIN-18 — REPORTS

## Purpose

Provide operational and financial reporting.

Report categories:

```text
Revenue
Sales
Bookings
Subscriptions
Inventory
Workers
```

---

# 153. REPORT DATE FILTERS

Support:

```text
Daily
Weekly
Monthly
Custom Date Range
```

Monthly revenue is required.

---

# 154. REVENUE REPORT

Display:

```text
Total Revenue
Transaction Count
Bill Value
Subscription Value Used
Additional Payment
Payment Method Breakdown
```

Do not mix metrics with incompatible accounting definitions.

---

# 155. SALES REPORT

Include:

```text
Transaction Count
Fish Bill Value
Subscription Value Used
Additional Payment
Payment Method
```

---

# 156. BOOKING REPORT

Include:

```text
Booking Count
Completed
Cancelled
Expired
Quantities
```

---

# 157. SUBSCRIPTION REPORT

Include:

```text
Subscription Sales
Credit Issued
Credit Used
Credit Restored
```

---

# 158. INVENTORY REPORT

Include:

```text
Opening Quantity
Closing Quantity
Manual Adjustments
Sold Quantity
Reserved Quantity
Expired/Wasted Quantity
```

---

# 159. WORKER REPORT

Include:

```text
Orders Handled
Transactions Handled
Completed Bookings
```

---

# 160. REPORT VISUALIZATION

Use:

- summary cards;
- tables;
- appropriate charts only where they improve interpretation.

Do not turn every metric into a chart.

Operational accuracy takes priority over visual decoration.

---

# 161. REPORT EMPTY STATE

```text
No report data for the selected period.
```

If the user selected an unusual range, preserve the filters so they can change the date.

---

# 162. REPORT EXPORTS

Required:

```text
CSV
Excel
```

Exports must reflect selected:

- filters;
- date range;
- report type.

Large exports may be asynchronous jobs.

---

# 163. EXPORT STATUS

For synchronous export:

```text
Preparing download...
```

For asynchronous:

```text
Export requested.

We'll prepare the file in the background.
```

Do not block the entire Admin UI while a large export is generated.

---

# 164. ADMIN-19 — AUDIT LOGS

## Purpose

Provide immutable traceability of critical administrative actions.

---

# 165. AUDIT EVENTS

Audit:

```text
Admin Login / Failure
Worker Create/Edit/Disable
Customer Block/Deactivate
Inventory Adjustment
Fish Create/Edit
Freshness Change
Discount Change
Subscription Plan Change
Subscription Addition
Credit Adjustment
Booking Cancellation
Transaction Intervention
GPS Journey Actions
Notification Scheduling/Cancellation
Content Publishing
Business Setting Changes
```

---

# 166. AUDIT LIST

Columns:

```text
Timestamp
Actor
Action
Entity Type
Entity
Reason
Reference
```

---

# 167. AUDIT DETAIL

Display:

```text
Event ID
Timestamp
Actor
Action
Entity Type
Entity ID
Previous Value
New Value
Reason
Correlation / Reference ID
Technical Metadata
```

---

# 168. AUDIT IMMUTABILITY

Admin cannot:

- edit audit record;
- delete audit record.

The UI should not expose edit/delete controls.

---

# 169. ADMIN-20 — OPERATIONAL EXCEPTIONS

## Purpose

Centralized unresolved operational issue view.

Examples:

```text
Payment Verification Mismatch
Inventory Inconsistency
Duplicate Bill ID
GPS Unavailable
Booking Completion Issue
AI Extraction Requiring Review
Notification Delivery Failure
TV Synchronization Issue
Inventory Arrival Mismatch
```

The Admin PRD explicitly defines this exception center. fileciteturn31file0L473-L501

---

# 170. EXCEPTION LIST

Columns:

```text
Severity
Issue
Entity
Time
Current State
Suggested Action
Status
Resolver
```

---

# 171. EXCEPTION DETAIL

Show:

```text
Severity
Entity
Description
Current State
Suggested Action
Resolution
Resolver
Resolution Time
Related Transaction/Booking/etc.
```

---

# 172. EXCEPTION SEVERITY

Suggested:

```text
Critical
High
Medium
Low
```

Do not use color alone.

---

# 173. EXCEPTION RESOLUTION

The resolution flow should preserve the original event/data.

Where correction is required:

```text
Original record
+
Correction / resolution record
+
Admin actor
+
Reason
+
Timestamp
```

Do not silently rewrite history.

---

# 174. ADMIN-21 — ADMIN SECURITY

## Purpose

Manage the security posture of the current administrator account and session.

---

# 175. SECURITY PAGE

Display:

```text
Account Status
Email
Last Login
Session Status
Password / Credential Controls
Active Sessions if supported
```

---

# 176. SECURITY CONTROLS

Potential:

```text
Change Password
Logout Other Sessions
View Recent Login Activity
```

Only implement controls supported by the backend security architecture.

---

# 177. SESSION EXPIRY

When session expires:

```text
Your session has expired.

Please sign in again.
```

Unsaved unsafe data should not be silently submitted.

---

# 178. ADMIN-22 — PROFILE

## Purpose

View/manage permitted admin profile information.

Display:

```text
Name
Email
Account Status
Created Date
Last Login
```

---

# 179. ADMIN-23 — LOGOUT

Logout should:

1. invalidate session;
2. clear sensitive client state;
3. redirect to Admin Login.

---

# 180. GLOBAL 404 PAGE

Message:

```text
Page not found

The page you're looking for doesn't exist or may have moved.

[Back to Dashboard]
```

Do not expose route internals.

---

# 181. GLOBAL 403 PAGE

Message:

```text
Access restricted

You don't have permission to access this page.
```

Do not expose unauthorized data.

---

# 182. GLOBAL 500 PAGE

Message:

```text
Something went wrong

We couldn't load this page correctly.

[Try Again]
```

Do not show stack traces.

---

# 183. GLOBAL NETWORK ERROR

Message:

```text
Connection interrupted.

Your unsaved information has been preserved where it is safe to do so.

[Retry]
```

For read-only pages:

```text
Unable to load the latest data.
[Retry]
```

---

# 184. GLOBAL MAINTENANCE

Message:

```text
PondFish Admin is temporarily unavailable.

Please try again shortly.
```

If the session remains valid, retry without forcing unnecessary logout.

---

# 185. GLOBAL CONFLICT STATE

Use when another admin changes the same record.

Pattern:

```text
This record was changed elsewhere.

Review the latest version before saving your changes.
```

Actions:

```text
[Refresh Record]
[Cancel]
```

Do not automatically overwrite another admin's update.

---

# 186. GLOBAL VALIDATION ERROR

Field-level:

```text
Discount value is required.
```

Cross-field:

```text
End date must be after start date.
```

Business rule:

```text
This fish has expired and cannot be enabled for online booking.
```

---

# 187. GLOBAL LOADING

Use:

- skeleton table;
- skeleton cards;
- button loading state;
- section-level loader.

Avoid full-screen blocking loaders for small independent actions.

---

# 188. GLOBAL EMPTY STATES

Every list should explain:

1. whether no records exist;
2. whether filters caused no results;
3. what action can create data.

Example:

```text
No fish match your filters.

[Clear Filters]
```

For truly empty inventory:

```text
No fish have been added yet.

[Add Fish]
```

---

# 189. GLOBAL DELETE / DEACTIVATE PRINCIPLE

Do not use destructive deletion when business history depends on the entity.

Prefer:

```text
Deactivate
Archive
Disable
```

where appropriate.

Historical records must remain meaningful.

---

# 190. CROSS-PORTAL EFFECTS — ADMIN → PUBLIC WEBSITE

Admin changes can affect:

- fish availability;
- discounts;
- subscription plans;
- public content;
- business information.

After a successful mutation:

```text
Backend updates authoritative state
        ↓
Customer/public-facing consumers read updated state
```

The Admin UI must not fake customer/public state locally.

---

# 191. CROSS-PORTAL EFFECTS — ADMIN → CUSTOMER

Admin changes may affect:

```text
Fish Availability
Discounts
Subscription Plans
Customer Access
Notifications
GPS Visibility
Public Website Content
```

The UI should communicate when a change is customer-facing.

---

# 192. CROSS-PORTAL EFFECTS — ADMIN → WORKER

Admin changes may affect:

```text
Fish Availability
Bookings
Customer Status
Worker Access
Operational Settings
```

---

# 193. CROSS-PORTAL EFFECTS — TRANSACTION → TV

Successful transaction:

```text
Persist
↓
Commit
↓
Publish Event
↓
TV Display
```

TV failure must never affect transaction success.

This relationship is explicitly locked in the Admin PRD. fileciteturn31file1L1128-L1141

---

# 194. ADMIN ALERT CENTER

High priority:

```text
Fish Expired
Payment Mismatch
Inventory Inconsistency
GPS Unavailable During Active Journey
Duplicate Bill ID
Critical Integration Failure
```

Medium:

```text
Fish Nearing Expiry
Booking Nearing Expiry
Notification Failure
```

Avoid routine-success notification noise.

---

# 195. ALERT BEHAVIOR

Each alert should include:

```text
Severity
Title
Entity
Time
Short explanation
Action
```

Example:

```text
HIGH
GPS unavailable

Journey J-102
Last update: 10:42 AM

[Open Journey]
```

---

# 196. ADMIN DATA REFRESH

For normal list pages:

- server query on page load;
- refresh after successful mutation;
- preserve relevant filters.

For live pages:

- realtime where appropriate;
- display last-update time;
- never imply stale data is current.

---

# 197. REALTIME ADMIN VIEWS

Realtime is required/useful for:

- active truck GPS;
- active journey state;
- successful transaction updates where useful;
- important live operational alerts.

If realtime fails:

```text
Show connection state
Show last update time
Use fallback where appropriate
Never represent stale data as current
```

These rules are defined in the Admin PRD. fileciteturn31file1L1233-L1248

---

# 198. TABLE PAGINATION

Default:

```text
server-side pagination
```

Display:

```text
1–25 of 240
```

Allow configured page sizes if approved.

Do not load thousands of records into the browser unnecessarily.

---

# 199. TABLE SORTING

Columns may support sorting where meaningful.

Examples:

```text
Last Updated
Quantity
Amount
Date
Status
```

Sorting must happen server-side for large datasets.

---

# 200. TABLE FILTER PERSISTENCE

Within the same module:

```text
Navigate list → detail → back
```

should preserve:

- search;
- filters;
- sort;
- page where practical.

---

# 201. TABLE ROW ACTIONS

Use:

```text
View
Edit
Adjust
Disable
Cancel
```

depending on module.

Dangerous actions should not be adjacent to common actions without visual distinction.

---

# 202. BULK ACTIONS

Bulk actions should not be invented unless the business workflow supports them.

For MVP, prefer individual actions for high-impact financial/inventory/customer mutations.

---

# 203. MODAL RULES

Use modals for:

- confirmation;
- small focused forms;
- quick inspection.

Use full pages/drawers for:

- complex creation;
- large details;
- long forms;
- transaction inspection;
- journey management.

---

# 204. DRAWER RULES

Drawers can be used for:

- quick row preview;
- audit preview;
- compact details.

Do not place complex multi-step financial workflows into cramped drawers.

---

# 205. DIALOG CONFIRMATION HIERARCHY

Normal:

```text
[Cancel] [Confirm]
```

Destructive:

```text
[Cancel] [Disable Worker]
```

High-impact financial:

```text
Review summary
Reason
Confirmation
[Cancel] [Confirm Adjustment]
```

---

# 206. FILE UPLOAD UX

For hero/banner and bill images:

Show:

```text
File name
File size
Upload progress
Validation
Preview
Replace / Remove
```

Validate:

- MIME type;
- extension;
- size.

Use controlled object storage.

The Admin PRD explicitly requires secure file upload validation and safe storage references. fileciteturn31file1L1201-L1213

---

# 207. IMAGE UPLOAD ERROR

Examples:

```text
Unsupported file type.
```

```text
Image is too large.
```

```text
Upload failed. Please try again.
```

Do not expose storage internals.

---

# 208. ADMIN DESIGN LANGUAGE

The Admin Portal must use the approved PondFish design system.

The complete PondFish visual direction is:

```text
Fresh
Trustworthy
Modern
Premium
Local
```

The product should feel like a polished real fish-store operation brought online, not a generic SaaS dashboard. fileciteturn29file8L1241-L1245

---

# 209. ADMIN VISUAL CHARACTER

Prefer:

- clean surfaces;
- controlled card usage;
- strong typography;
- meaningful color;
- restrained shadows;
- consistent radius;
- clear hierarchy;
- operational density;
- generous enough spacing for readability.

Avoid:

- AI-generated dashboard aesthetics;
- excessive glassmorphism;
- decorative gradients everywhere;
- excessive floating cards;
- meaningless illustrations;
- excessive rounded containers;
- huge empty hero-like areas inside operational pages.

---

# 210. STATUS COLOR RULE

Never communicate status using color alone.

Examples:

```text
Fresh
● Fresh

Aging
● Aging

Expired
● Expired
```

Use:

- label;
- icon where useful;
- color as supporting signal.

Accessibility requires status indicators that do not depend on color alone. fileciteturn31file1L1252-L1264

---

# 211. FRESHNESS UI

Recommended:

```text
Fresh      [Green semantic indicator]
Aging      [Neutral/warning indicator]
Expired    [Error indicator]
```

The exact PondFish semantic colors come from the approved Design System.

---

# 212. PRIMARY ACTION COLOR

Use the approved PondFish primary action token.

Primary buttons should represent:

- create;
- save;
- confirm;
- publish;
- start.

Do not use primary color for every button.

---

# 213. SECONDARY ACTIONS

Use secondary styling for:

```text
Cancel
View
Back
Clear Filters
Refresh
```

---

# 214. DESTRUCTIVE ACTIONS

Use destructive styling for:

```text
Disable
Deactivate
Cancel Booking
Remove
```

Require confirmation where specified.

---

# 215. INFORMATION HIERARCHY

Admin pages should visually prioritize:

```text
What is happening?
        ↓
What requires attention?
        ↓
What can I do?
        ↓
Detailed supporting information
```

---

# 216. DASHBOARD VISUAL HIERARCHY

Priority:

```text
Critical alerts
↓
Live operations
↓
Today's operational metrics
↓
Commercial metrics
↓
Historical/reporting context
```

---

# 217. INVENTORY VISUAL HIERARCHY

Priority:

```text
Availability
↓
Quantity
↓
Freshness
↓
Online eligibility
↓
Discount
↓
Metadata
```

---

# 218. TRANSACTION VISUAL HIERARCHY

Priority:

```text
Transaction status
↓
Customer
↓
Amount
↓
Fish/quantity
↓
Payment
↓
Bill/AI details
↓
Audit
```

---

# 219. BOOKING VISUAL HIERARCHY

Priority:

```text
Booking status
↓
Customer
↓
Collection deadline
↓
Fish/quantity
↓
Payment
↓
Audit
```

---

# 220. GPS VISUAL HIERARCHY

Priority:

```text
Journey state
↓
Current location
↓
Last update
↓
Customer tracking state
↓
ETA
↓
Manifest
```

---

# 221. CUSTOMER PRIVACY

Admin access to customer data must follow authorization.

The Admin PRD specifically calls out protection of:

- customer phone numbers;
- payment references;
- bill images;
- admin credentials. fileciteturn31file1L1268-L1293

---

# 222. SECURITY UI

Never display:

- passwords;
- access tokens;
- payment secrets;
- card details;
- raw backend credentials.

---

# 223. PERFORMANCE UI

Large datasets must use:

```text
Server-side pagination
Server-side search
Server-side sorting
Indexed queries
Lazy-loaded large details
```

Do not load an entire customer or transaction database into the browser.

The Admin PRD explicitly requires this approach. fileciteturn31file1L1217-L1229

---

# 224. FORM PERFORMANCE

Prevent:

- duplicate submissions;
- unnecessary refetch loops;
- repeated network requests;
- blocking the entire application for one mutation.

---

# 225. ADMIN API CONTRACT

Representative endpoints from the Admin PRD:

```text
GET    /api/admin/dashboard

GET    /api/admin/fish
POST   /api/admin/fish
GET    /api/admin/fish/{fishId}
PATCH  /api/admin/fish/{fishId}

GET    /api/admin/inventory
PATCH  /api/admin/inventory/{fishId}
GET    /api/admin/inventory/{fishId}/history

GET    /api/admin/discounts
POST   /api/admin/discounts
PATCH  /api/admin/discounts/{campaignId}
POST   /api/admin/discounts/{campaignId}/cancel

GET    /api/admin/subscription-plans
POST   /api/admin/subscription-plans
PATCH  /api/admin/subscription-plans/{planId}

GET    /api/admin/customers
GET    /api/admin/customers/{customerId}

GET    /api/admin/workers
POST   /api/admin/workers
PATCH  /api/admin/workers/{workerId}

GET    /api/admin/bookings
GET    /api/admin/bookings/{bookingId}
POST   /api/admin/bookings/{bookingId}/cancel

GET    /api/admin/transactions
GET    /api/admin/transactions/{transactionId}

GET    /api/admin/journeys
POST   /api/admin/journeys
GET    /api/admin/journeys/{journeyId}
PATCH  /api/admin/journeys/{journeyId}
POST   /api/admin/journeys/{journeyId}/start
POST   /api/admin/journeys/{journeyId}/publish

GET    /api/admin/notifications
POST   /api/admin/notifications
PATCH  /api/admin/notifications/{notificationId}

GET    /api/admin/content
POST   /api/admin/content
PATCH  /api/admin/content/{contentId}
POST   /api/admin/content/{contentId}/publish

GET    /api/admin/settings
PATCH  /api/admin/settings

GET    /api/admin/reports/revenue
GET    /api/admin/reports/inventory
GET    /api/admin/reports/bookings
GET    /api/admin/reports/subscriptions
GET    /api/admin/reports/workers
POST   /api/admin/exports

GET    /api/admin/audit-logs
```

These endpoint responsibilities come from the Admin PRD. fileciteturn31file0L849-L954

---

# 226. API RELIABILITY RULES

Use idempotency for:

- subscription purchase;
- credit adjustment;
- booking cancellation;
- inventory adjustment;
- GPS publish;
- notification dispatch.

Protect concurrency for:

- inventory;
- Subscription Credit;
- booking state;
- transaction state;
- journey state.

These requirements are explicitly defined in the Admin PRD. fileciteturn31file0L958-L993

---

# 227. ADMIN BUSINESS RULES THAT MUST NOT BE REIMPLEMENTED IN UI

The UI must not independently calculate authoritative:

- inventory truth;
- Subscription Credit balance;
- payment success;
- booking state;
- transaction success;
- GPS authorization;
- bill duplication.

The backend is authoritative.

---

# 228. INVENTORY SAFETY

Every inventory-affecting operation must prevent:

```text
Negative stock
Double reservation
Double deduction
Double restoration
```

Affected operations include:

- truck arrival;
- online booking;
- booking cancellation;
- booking expiry;
- physical transaction;
- manual adjustment;
- disposal/wastage.

---

# 229. SUBSCRIPTION CREDIT SAFETY

Prevent:

```text
Negative credit
Double deduction
Double restoration
Double refund
Overwriting valid credit
```

Every movement must be atomic and ledgered.

---

# 230. BOOKING STATE SAFETY

Recommended:

```text
Created
→ Confirmed
→ Pending Collection
→ Completed

or

Cancelled
Expired
```

Invalid transitions must be rejected.

---

# 231. TRANSACTION CORRECTION SAFETY

A successful physical transaction is operationally final.

If an administrative correction is needed:

```text
Preserve original transaction
        ↓
Create adjustment/correction
        ↓
Record admin
        ↓
Record reason
```

Never silently overwrite financial history.

---

# 232. GPS SAFETY

Admin cannot publish customer GPS if:

- journey does not exist;
- journey has not started;
- GPS source unavailable;
- journey has ended.

If GPS fails:

```text
Last known location
+
Last update
+
Stale state
```

No fabricated location.

---

# 233. AI DATA SAFETY

AI is used for bill extraction.

Admin may inspect:

```text
AI extracted values
Confirmed values
```

AI output must not bypass confirmation or become financial truth.

---

# 234. PAYMENT RECONCILIATION UI

If payment is pending:

```text
Payment verification pending.
```

Do not allow admin to mark it successful merely because someone claims payment succeeded.

Authoritative payment verification is required.

---

# 235. PAYMENT FAILURE UI

If payment fails:

```text
Payment failed.

No successful financial effect was created.
```

Do not expose technical gateway details unless needed for authorized troubleshooting.

---

# 236. PAYMENT BROWSER-CLOSED CASE

If browser closes after payment:

```text
Backend state remains authoritative.
```

Admin can search by payment reference for reconciliation.

---

# 237. NOTIFICATION FAILURE SAFETY

Notification failure is independent.

Do not display:

```text
Transaction failed
```

because a notification failed.

Display:

```text
Transaction successful.
Notification delivery failed.
```

where appropriate.

---

# 238. ADMIN LONG-RUN STABILITY

The Admin application should remain stable through long operational sessions.

Avoid:

- duplicated realtime listeners;
- uncontrolled polling;
- memory growth;
- stale query caches;
- stale forms;
- repeated subscriptions.

---

# 239. COMPONENT INVENTORY

Recommended reusable components:

```text
AdminShell
Sidebar
TopHeader
Breadcrumbs
PageHeader
PageActions
FilterToolbar
SearchInput
DataTable
Pagination
StatusBadge
MetricCard
AlertCard
EmptyState
LoadingSkeleton
ErrorState
ConflictState
ConfirmationDialog
FormField
DateRangePicker
CurrencyField
QuantityField
FileUploader
ImagePreview
Timeline
AuditTimeline
MapPanel
JourneyStatus
NotificationComposer
ContentEditor
ExportStatus
Toast
```

---

# 240. COMPONENT — ADMIN SHELL

Responsibilities:

- authenticated layout;
- navigation;
- header;
- alerts;
- route content;
- responsive drawer.

Must not contain domain-specific business mutations.

---

# 241. COMPONENT — DATA TABLE

Features:

- server pagination;
- sorting;
- row selection only if supported;
- search;
- filters;
- loading;
- empty;
- error;
- retry;
- responsive overflow.

---

# 242. COMPONENT — STATUS BADGE

Must support:

```text
Success
Warning
Error
Neutral
Info
```

Use label + semantic visual treatment.

Never rely on color alone.

---

# 243. COMPONENT — METRIC CARD

Structure:

```text
Label
Primary Value
Supporting Context
Optional Trend
Action / Link
```

Do not turn every card into an interactive control.

---

# 244. COMPONENT — ALERT CARD

Structure:

```text
Severity
Title
Short Description
Entity
Timestamp
Action
```

---

# 245. COMPONENT — CONFIRMATION DIALOG

Must contain:

```text
Title
What will happen
Relevant affected entity
Important consequences
Reason field if required
Cancel
Confirm
```

---

# 246. COMPONENT — AUDIT TIMELINE

Display:

```text
Time
Actor
Action
Change
Reason
Reference
```

Newest-first by default unless historical chronology is explicitly more useful.

---

# 247. COMPONENT — MAP PANEL

Display:

- current truck location;
- route;
- destination;
- last update;
- stale state;
- ETA.

Do not use decorative map controls that obscure the operational view.

---

# 248. COMPONENT — FILE UPLOADER

Support:

- drag/drop if appropriate;
- click upload;
- preview;
- progress;
- validation;
- replace;
- remove.

---

# 249. COMPONENT — EXPORT STATUS

States:

```text
Preparing
Processing
Ready
Failed
Expired
```

Provide safe retry.

---

# 250. PAGE STATE STANDARD

For every page:

```text
Initial Load
↓
Loading
↓
Success / Empty
↓
Interaction
↓
Mutation
↓
Success / Business Error / Validation Error / Network Error / Conflict
```

This state model must be explicit during implementation.

---

# 251. ADMIN-01 TO ADMIN-23 PAGE MATRIX

| ID | Page | Main Purpose |
|---|---|---|
| ADMIN-01 | Login | Secure admin authentication |
| ADMIN-02 | Dashboard | Operational overview |
| ADMIN-03 | Inventory | Inventory visibility |
| ADMIN-04 | Inventory Adjustment | Safe stock correction |
| ADMIN-05 | Fish Management | Fish catalog and eligibility |
| ADMIN-06 | Category Management | Catalog organization |
| ADMIN-07 | Discounts | Promotional control |
| ADMIN-08 | Subscription Plans | Plan configuration |
| ADMIN-09 | Add Customer Subscription | Admin-assisted subscription |
| ADMIN-10 | Customers | Customer management |
| ADMIN-11 | Workers | Staff management |
| ADMIN-12 | Bookings | Booking oversight/intervention |
| ADMIN-13 | Transactions | Transaction investigation |
| ADMIN-14 | Truck & GPS | Journey/GPS management |
| ADMIN-15 | Notifications | Customer communications |
| ADMIN-16 | Website Content | Public content management |
| ADMIN-17 | Business Settings | Store configuration |
| ADMIN-18 | Reports | Business reporting |
| ADMIN-19 | Audit Logs | Governance |
| ADMIN-20 | Exceptions | Operational issue resolution |
| ADMIN-21 | Admin Security | Session/security controls |
| ADMIN-22 | Profile | Admin profile |
| ADMIN-23 | Logout | Secure session termination |

---

# 252. PAGE DETAIL MINIMUM STANDARD

Every significant page in implementation must document:

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
19. Permission behavior
20. Backend dependency
21. Cross-portal effect
22. Audit requirement
23. Edge cases
24. Responsive behavior
25. Acceptance criteria

This matches the established PondFish documentation standard. fileciteturn29file8L1312-L1342

---

# 253. PAGE ENTRY/EXIT PRINCIPLE

Every page should have explicit entry and exit routes.

Example:

```text
Inventory List
→ Fish Detail
→ Back to Inventory List
```

Filters should remain when practical.

---

# 254. ADMIN DASHBOARD ACCEPTANCE

- [ ] Authoritative data.
- [ ] Zero values displayed.
- [ ] Card links open filtered modules.
- [ ] Widget failures isolated.
- [ ] Live truck status includes last update.
- [ ] Alerts are actionable.

---

# 255. INVENTORY ACCEPTANCE

- [ ] Physical/reserved/available quantities distinct.
- [ ] Search works.
- [ ] Filters work.
- [ ] Adjustment requires reason.
- [ ] Negative stock impossible.
- [ ] Ledger generated.
- [ ] Concurrency conflict handled.
- [ ] Historical transaction quantities remain intact.

---

# 256. FISH ACCEPTANCE

- [ ] Fish can be created.
- [ ] Fish can be edited.
- [ ] Category can be assigned.
- [ ] Online eligibility can be changed.
- [ ] Freshness configuration works.
- [ ] Expired fish removed from online availability.
- [ ] Historical records remain meaningful.

---

# 257. DISCOUNT ACCEPTANCE

- [ ] Campaign can be created.
- [ ] Percentage supported.
- [ ] Fixed amount supported.
- [ ] Scheduled state works.
- [ ] Active state works.
- [ ] Ended state works.
- [ ] Cancelled state works.
- [ ] Aging does not automatically create discount.
- [ ] Conflicting discounts follow configured priority.

---

# 258. SUBSCRIPTION ACCEPTANCE

- [ ] Plans are configurable.
- [ ] Current ₹2,000 and ₹6,000 plans supported.
- [ ] Customer search works.
- [ ] Admin can add subscription.
- [ ] Cash purchase requires confirmation.
- [ ] Razorpay is verified server-side.
- [ ] Existing credit preserved.
- [ ] Ledger created.
- [ ] Manual adjustment requires reason.
- [ ] Negative credit impossible.

---

# 259. CUSTOMER ACCEPTANCE

- [ ] Search works.
- [ ] Filters work.
- [ ] Detail shows subscription.
- [ ] Detail shows bookings.
- [ ] Detail shows transactions.
- [ ] Block works.
- [ ] Deactivate works.
- [ ] History remains preserved.

---

# 260. WORKER ACCEPTANCE

- [ ] Worker creation works.
- [ ] Worker edit works.
- [ ] Worker disable works.
- [ ] Disabled worker cannot log in.
- [ ] Historical attribution remains.
- [ ] Performance metrics work.

---

# 261. BOOKING ACCEPTANCE

- [ ] Search works.
- [ ] Filters work.
- [ ] Online bookings visible.
- [ ] Source distinguishable.
- [ ] Detail works.
- [ ] Cancellation follows restoration rules.
- [ ] 48-hour expiry represented.
- [ ] Invalid state transitions rejected.

---

# 262. TRANSACTION ACCEPTANCE

- [ ] Search works.
- [ ] Transaction detail works.
- [ ] Bill image available.
- [ ] AI extraction visible.
- [ ] Confirmed data visible.
- [ ] Payment details are authorized.
- [ ] Worker attribution visible.
- [ ] Duplicate Bill ID traceable.
- [ ] Only successful transactions reach TV.
- [ ] Original financial record is preserved.

---

# 263. GPS ACCEPTANCE

- [ ] Journey creation works.
- [ ] Journey validation works.
- [ ] Start works.
- [ ] Publish works.
- [ ] Live view works.
- [ ] Stale GPS is visible.
- [ ] Arrival is detected.
- [ ] Post-arrival tracking ends.
- [ ] Admin can retain GPS visibility.
- [ ] Customer visibility only begins after explicit publish.

---

# 264. NOTIFICATION ACCEPTANCE

- [ ] Audience selection works.
- [ ] Channels are represented.
- [ ] Scheduling works.
- [ ] Cancel-before-dispatch works.
- [ ] Delivery failure does not roll back business transaction.
- [ ] Notification history is traceable.

---

# 265. CONTENT ACCEPTANCE

- [ ] Hero upload works.
- [ ] Hero replacement works.
- [ ] Enable/disable works.
- [ ] About content editable.
- [ ] Contact content editable.
- [ ] Promotions editable.
- [ ] Subscription advertisement editable.
- [ ] Publish works.
- [ ] Public website receives published content.

---

# 266. SETTINGS ACCEPTANCE

- [ ] Contact number editable.
- [ ] Opening time editable.
- [ ] Closing time editable.
- [ ] Invalid times rejected.
- [ ] Store destination protected.
- [ ] Sensitive setting changes confirmed.
- [ ] Changes audited.

---

# 267. REPORT ACCEPTANCE

- [ ] Date filters work.
- [ ] Revenue report works.
- [ ] Inventory report works.
- [ ] Booking report works.
- [ ] Subscription report works.
- [ ] Worker report works.
- [ ] CSV export matches filters.
- [ ] Excel export matches filters.
- [ ] Large export can run asynchronously.

---

# 268. AUDIT ACCEPTANCE

- [ ] Critical actions logged.
- [ ] Actor identified.
- [ ] Timestamp present.
- [ ] Previous/new values where appropriate.
- [ ] Reason present where applicable.
- [ ] Audit cannot be edited.
- [ ] Audit cannot be deleted.

---

# 269. EXCEPTION ACCEPTANCE

- [ ] Exceptions have severity.
- [ ] Entity linked.
- [ ] Current state visible.
- [ ] Suggested action visible.
- [ ] Resolution captured.
- [ ] Resolver captured.
- [ ] Resolution time captured.
- [ ] Raw stack traces hidden.

---

# 270. SECURITY ACCEPTANCE

- [ ] Secure admin authentication.
- [ ] Rate limiting.
- [ ] Session expiry.
- [ ] Secure logout.
- [ ] Server-side authorization.
- [ ] No secrets in frontend.
- [ ] Sensitive data protected.
- [ ] Sensitive logs avoided.

---

# 271. QA — AUTHENTICATION

Test:

```text
Valid login
Invalid email
Invalid password
Disabled admin
Expired session
Network failure
Rate limiting
Logout
Back-button after logout
```

---

# 272. QA — DASHBOARD

Test:

```text
All widgets loaded
One widget failed
All widgets failed
Zero data
Date range
Custom range
Live truck state
Freshness alerts
```

---

# 273. QA — INVENTORY

Test:

```text
Increase
Decrease
Exact set
Negative result
Missing reason
Concurrent adjustment
Stale record
Reserved quantity
Available quantity
Expired fish
```

---

# 274. QA — FISH

Test:

```text
Create
Edit
Deactivate
Online eligibility
Freshness configuration
Expiry
Historical transaction
Category assignment
```

---

# 275. QA — DISCOUNTS

Test:

```text
Percentage
Fixed amount
Scheduled
Active
Ended
Cancelled
Conflicting campaigns
Invalid dates
Invalid value
```

---

# 276. QA — SUBSCRIPTIONS

Test:

```text
Plan creation
Plan edit
Customer search
Cash purchase
Razorpay purchase
Payment failure
Existing credit
Concurrent purchases
Manual credit adjustment
Negative credit
Ledger
```

---

# 277. QA — CUSTOMERS

Test:

```text
Search
Filter
Detail
Block
Deactivate
Existing booking
Historical transaction
Blocked customer attempts booking
```

---

# 278. QA — WORKERS

Test:

```text
Create
Edit
Disable
Disabled login
Historical attribution
Performance
Duplicate email
```

---

# 279. QA — BOOKINGS

Test:

```text
Search
Filter
Detail
Cancellation
Completed cancellation attempt
Expired booking
48-hour boundary
Inventory restoration
Credit restoration
Invalid transition
```

---

# 280. QA — TRANSACTIONS

Test:

```text
Successful
Pending
Failed
Cancelled
Duplicate Bill ID
Original bill image
AI extraction
Confirmed data
Payment verification
Worker attribution
Admin correction
TV publication
```

---

# 281. QA — GPS

Test:

```text
Create journey
Invalid destination
Start
Publish
GPS unavailable
Stale GPS
Arrival
Post-arrival period
Customer tracking end
Admin tracking continuation
```

---

# 282. QA — NOTIFICATIONS

Test:

```text
Everyone
Subscription customers
Specific plan
Individual customer
Immediate send
Scheduled
Edit scheduled
Cancel scheduled
Provider failure
```

---

# 283. QA — CONTENT

Test:

```text
Hero upload
Invalid image
Large image
Replace
Disable
About
Contact
Promotion
Subscription advertisement
Publish
```

---

# 284. QA — REPORTS

Test:

```text
Daily
Weekly
Monthly
Custom range
No data
CSV
Excel
Large export
Filter preservation
```

---

# 285. QA — AUDIT

Test:

```text
Inventory change
Credit adjustment
Customer block
Worker disable
Booking cancellation
GPS publish
Notification schedule
Content publish
Settings change
```

---

# 286. QA — NETWORK

For every mutation:

```text
Request starts
Network disappears
Request outcome uncertain
```

Verify:

- no duplicate mutation;
- safe retry;
- authoritative result;
- clear UI message.

---

# 287. QA — CONCURRENCY

Test two admins simultaneously:

```text
Inventory adjustment
Subscription purchase
Credit adjustment
Booking cancellation
Journey update
Content update
```

Expected:

- no lost update;
- no double effect;
- conflict shown where necessary.

---

# 288. QA — REFRESH

Refresh during:

- list;
- detail;
- form;
- live journey;
- report;
- audit.

Expected behavior must be intentional.

Never silently submit an incomplete mutation after refresh.

---

# 289. QA — ACCESSIBILITY

Verify:

- keyboard navigation;
- visible focus;
- semantic labels;
- dialog accessibility;
- field-associated errors;
- adequate contrast;
- status not color-only.

These requirements are explicitly part of the Admin PRD. fileciteturn31file1L1252-L1264

---

# 290. QA — PERFORMANCE

Verify:

- large lists do not load all records;
- search remains responsive;
- tables paginate;
- reports do not block the UI;
- map updates remain stable;
- realtime listeners do not duplicate.

---

# 291. QA — LONG SESSION

Run Admin for an extended operational session.

Verify:

- no memory leaks;
- no duplicate subscriptions;
- no stale session state;
- no increasing UI latency;
- no repeated toast loops;
- no uncontrolled polling.

---

# 292. CROSS-PORTAL QA

Verify:

```text
Admin fish availability change
→ Public/customer availability updates

Admin discount
→ Customer/public pricing display updates

Admin subscription plan
→ Customer subscription options update

Admin customer block
→ Customer actions restricted

Admin worker disable
→ Worker login blocked

Admin GPS publish
→ Customer tracking becomes available

Successful transaction
→ Admin transaction list
→ TV display
```

---

# 293. MASTER ADMIN USER JOURNEY

```text
Admin Login
      ↓
Dashboard
      ↓
Review Alerts
      ↓
Check Inventory
      ↓
Check Active Truck
      ↓
Review Bookings
      ↓
Review Transactions
      ↓
Manage Fish / Discounts / Subscriptions
      ↓
Manage Customers / Workers
      ↓
Send Notifications
      ↓
Update Website Content
      ↓
Review Reports
      ↓
Review Audit / Exceptions
      ↓
Logout
```

---

# 294. END-TO-END SCENARIO — FISH ARRIVAL

```text
Admin creates journey
      ↓
Fish + quantity entered
      ↓
Journey starts
      ↓
GPS published
      ↓
Customer tracking available
      ↓
Truck arrives
      ↓
Arrival detected
      ↓
Inventory receiving
      ↓
Arrival notification
      ↓
Post-arrival tracking
      ↓
Customer tracking ends
      ↓
Admin sees updated stock
```

This follows the approved Admin operational scenario. fileciteturn31file1L1316-L1331

---

# 295. END-TO-END SCENARIO — PHYSICAL PURCHASE

```text
Worker completes physical bill workflow
      ↓
Bill extracted
      ↓
Confirmed
      ↓
Subscription calculation
      ↓
Additional payment if required
      ↓
Transaction succeeds
      ↓
Inventory updated
      ↓
Subscription Credit updated
      ↓
Transaction stored
      ↓
Successful event
      ↓
TV display
      ↓
Customer/Admin history
```

---

# 296. END-TO-END SCENARIO — ONLINE BOOKING

```text
Customer creates booking
      ↓
Inventory reserved
      ↓
Payment verified
      ↓
Admin sees booking
      ↓
Worker sees booking
      ↓
Customer collects
      ↓
Worker completes
      ↓
Inventory remains correctly accounted
```

---

# 297. END-TO-END SCENARIO — BOOKING EXPIRY

```text
48 hours reached
      ↓
Booking Expired
      ↓
Reserved inventory restored
      ↓
Subscription quantity restored
      ↓
Subscription credit restored
      ↓
Applicable paid amount restored as credit
      ↓
Admin sees expired booking
```

---

# 298. END-TO-END SCENARIO — ADMIN SUBSCRIPTION

```text
Search customer
      ↓
Select plan
      ↓
Review amount
      ↓
Choose Cash/Razorpay
      ↓
Confirm/verify
      ↓
Subscription record
      ↓
Preserve existing credit
      ↓
Add new credit
      ↓
Ledger
      ↓
Customer balance updated
```

---

# 299. DESIGN FILE REQUIREMENTS

The Admin Portal design file must include at least:

```text
Login
Dashboard
Inventory List
Inventory Adjustment
Fish List
Fish Create/Edit
Category List
Category Create/Edit
Discount List
Discount Create/Edit
Subscription Plans
Customer Subscription
Customers List
Customer Detail
Workers List
Worker Create/Edit
Bookings List
Booking Detail
Transactions List
Transaction Detail
Journeys List
Create Journey
Live Journey
Notifications List
Notification Composer
Website Content
Business Settings
Reports
Audit Logs
Exceptions
Admin Security
Profile
404
403
500
Network Error
Maintenance
Conflict Dialog
Loading States
Empty States
```

---

# 300. STITCH DESIGN GENERATION RULES

The Stitch prompt must explicitly describe this as:

```text
A real operational business administration platform.

Not:
- a generic SaaS dashboard;
- an AI dashboard;
- a marketing site;
- a finance-only dashboard;
- a decorative analytics concept.
```

Prioritize:

```text
Real data
Operational density
Clear hierarchy
Fast scanning
Safe actions
Readable tables
Consistent forms
Professional business UI
```

---

# 301. STITCH DESIGN — DASHBOARD

Generate:

- operational metric cards;
- freshness alerts;
- truck status;
- booking status;
- transaction status;
- subscription summary;
- worker summary.

Do not generate:

- meaningless charts;
- giant hero;
- oversized empty spaces;
- decorative 3D objects.

---

# 302. STITCH DESIGN — TABLES

Tables should look usable by a real store manager.

Use:

- readable row heights;
- clear headers;
- compact but not cramped cells;
- meaningful status badges;
- obvious row actions;
- filter toolbar.

---

# 303. STITCH DESIGN — FORMS

Forms should be:

- grouped logically;
- short where possible;
- multi-section when necessary;
- clearly validated;
- safe for financial/inventory changes.

---

# 304. STITCH DESIGN — DETAIL PAGES

Use:

```text
Summary
↓
Important state
↓
Primary information
↓
Supporting information
↓
History / audit
```

Do not bury important status below long metadata blocks.

---

# 305. STITCH DESIGN — LIVE GPS

The live journey screen must feel operational.

Prioritize map and status.

Do not make the map a decorative background behind cards.

---

# 306. STITCH DESIGN — CONTENT EDITOR

Public content management should include:

```text
Editor
Preview
Publishing state
Publish action
```

The UI should clearly distinguish draft from published content.

---

# 307. AI CODING AGENT RULES

The coding agent must:

1. read Master PRD;
2. read Admin Portal PRD;
3. read architecture;
4. read design system;
5. read this page specification;
6. reuse shared domain types;
7. reuse API contracts;
8. reuse shared components;
9. enforce server-authoritative business state;
10. never invent missing business rules;
11. implement all required states;
12. implement permission handling;
13. implement safe mutation patterns;
14. implement audit dependencies;
15. implement responsive behavior;
16. implement accessibility;
17. implement network/conflict handling;
18. preserve historical integrity.

---

# 308. AI CODING AGENT — DO NOT

Do not:

- hard-code inventory truth;
- hard-code Subscription Credit;
- hard-code payment success;
- directly mutate historical transactions;
- bypass confirmation;
- bypass authorization;
- expose secrets;
- create duplicate customer/worker databases;
- create customer-facing booking workflows inside Admin;
- create worker completion workflows inside Admin;
- allow TV mutation.

---

# 309. ADMIN FRONTEND FEATURE STRUCTURE

Recommended:

```text
admin/
├── auth/
├── dashboard/
├── inventory/
├── fish/
├── categories/
├── discounts/
├── subscriptions/
├── customers/
├── workers/
├── bookings/
├── transactions/
├── journeys/
├── notifications/
├── content/
├── settings/
├── reports/
├── audit/
├── exceptions/
├── security/
└── profile/
```

Exact framework structure remains an engineering decision.

---

# 310. SHARED COMPONENT LAYER

Recommended shared layer:

```text
components/
├── layout/
├── navigation/
├── tables/
├── forms/
├── dialogs/
├── feedback/
├── status/
├── dates/
├── currency/
├── quantity/
├── files/
├── maps/
└── charts/
```

Domain logic remains in domain-specific modules.

---

# 311. ADMIN STATE MANAGEMENT

Separate:

```text
Server state
UI state
Form state
Session state
Realtime state
```

Do not treat local UI state as authoritative business state.

---

# 312. CACHE INVALIDATION

After successful mutation:

```text
Update authoritative server state
↓
Invalidate/refetch affected queries
↓
Update dependent UI
```

Examples:

```text
Inventory adjustment
→ inventory list
→ dashboard inventory
→ fish availability

Discount update
→ discount list
→ fish display state
→ public/customer consumers

Customer block
→ customer detail
→ customer list
→ booking eligibility
```

---

# 313. AUDIT HOOKS

Every critical mutation must trigger the backend audit mechanism.

Frontend should not attempt to manufacture audit records.

The UI should pass required reason/context fields to the backend.

---

# 314. REASON REQUIREMENT MATRIX

| Action | Reason Required |
|---|---|
| Inventory adjustment | Yes |
| Credit adjustment | Yes |
| Customer block | Yes where policy requires |
| Customer deactivation | Yes where policy requires |
| Worker disable | Confirmation; reason if backend requires |
| Booking cancellation | Operational reason |
| Transaction correction | Yes |
| Content publish | Publish action/audit |
| GPS publish | Confirmation |
| Business setting change | Confirmation |

---

# 315. HIGH-IMPACT ACTION MATRIX

| Action | Confirmation | Audit | Idempotency |
|---|---:|---:|---:|
| Inventory adjustment | Yes | Yes | Yes |
| Credit adjustment | Yes | Yes | Yes |
| Booking cancellation | Yes | Yes | Yes |
| Worker disable | Yes | Yes | Yes where mutation can duplicate |
| Customer block | Yes | Yes | Yes |
| GPS publish | Yes | Yes | Yes |
| Notification dispatch | Yes | Yes | Yes |
| Content publish | Yes | Yes | Yes where applicable |
| Store destination change | Yes | Yes | Yes |

---

# 316. ADMIN NOTIFICATION CENTER

The top-header notification indicator should show actionable operational issues, not every successful system event.

Prioritize:

```text
Critical
High
Medium
```

Routine success events should remain quiet.

---

# 317. ADMIN ALERT DE-DUPLICATION

Repeated backend alerts for the same unresolved issue should not create hundreds of identical UI alerts.

Use stable exception identifiers.

---

# 318. ADMIN DATA FRESHNESS

For realtime/live pages display:

```text
Live
Last updated: 10:42 AM
```

For stale:

```text
Stale
Last updated: 10:35 AM
```

Never imply current data when connection is unavailable.

---

# 319. ADMIN OFFLINE BEHAVIOR

Read-only page:

```text
Preserve currently visible safe data
Show connection status
Allow retry
```

Mutation:

```text
Do not assume success
Do not automatically retry unsafe mutation unless idempotency is guaranteed
Explain outcome uncertainty
Refresh authoritative state
```

---

# 320. ADMIN CONFLICT BEHAVIOR

When server returns conflict:

```text
Mutation rejected
↓
Fetch current record
↓
Show conflict
↓
Let admin review
↓
Admin chooses new action
```

Never silently overwrite.

---

# 321. ADMIN AUTHORIZATION BEHAVIOR

If an admin lacks permission:

```text
Hide unavailable actions where appropriate
```

But:

```text
Backend must still reject unauthorized API calls
```

UI hiding is not security.

---

# 322. PARTIAL PAGE FAILURE

If one section fails:

```text
Keep other sections available.
```

Example:

```text
Dashboard
├── Inventory ✓
├── Bookings ✓
├── Transactions ✕
├── GPS ✓
```

Only Transactions should show:

```text
Unable to load transactions.
[Retry]
```

---

# 323. FORM UNSAVED CHANGES

If leaving a form with unsaved changes:

```text
You have unsaved changes.

Leave without saving?
```

Actions:

```text
Stay
Discard Changes
```

Do not accidentally lose large content forms.

---

# 324. DUPLICATE SUBMISSION

If admin double-clicks:

```text
One request only
```

Use:

- disabled submit;
- idempotency;
- server protection.

---

# 325. ADMIN SESSION SAFETY

On logout:

```text
Invalidate session
Clear sensitive client state
Redirect login
```

On session expiration:

```text
Preserve safe non-sensitive context if possible
Require reauthentication
```

---

# 326. CONTENT DRAFT SAFETY

Draft content must not automatically become public.

Explicit:

```text
Save Draft
```

does not equal:

```text
Publish
```

---

# 327. GPS PUBLISH SAFETY

Saving a journey is not the same as publishing customer GPS.

Explicit actions:

```text
Save Journey
Start Journey
Publish GPS
End Customer Tracking
```

These must remain distinct.

---

# 328. INVENTORY AVAILABILITY SAFETY

Admin can control online eligibility, but customer-visible availability must still depend on authoritative inventory/freshness/reservation rules.

Do not present:

```text
Online Enabled = Guaranteed Available
```

Instead:

```text
Online Eligible
+
Currently Available
```

---

# 329. DISCOUNT VISIBILITY

When discount is active, show:

```text
Original Price
Discount
Applicable Price
Campaign
Validity
```

where the consumer-facing module supports these fields.

---

# 330. SUBSCRIPTION PLAN VISIBILITY

Plan status should distinguish:

```text
Active
Inactive
Scheduled / Future if supported
```

Do not delete historical plans that are referenced by old purchases.

---

# 331. HISTORICAL INTEGRITY

Catalog changes must not rewrite:

- historical fish names;
- historical transaction amounts;
- historical bill details;
- historical subscription purchases;
- historical audit records.

---

# 332. REPORT HISTORICAL INTEGRITY

Reports must query authoritative historical records.

Do not reconstruct historical revenue from today's catalog prices.

---

# 333. ADMIN DATE RANGE SAFETY

Custom date ranges:

- require valid start/end;
- use server timezone/business rules;
- clearly display selected range;
- preserve filters during export.

---

# 334. ADMIN EXPORT SAFETY

Exports must respect:

- authorization;
- selected date range;
- filters;
- data privacy.

Do not export fields the administrator is not authorized to see.

---

# 335. ADMIN BILL IMAGE SECURITY

Bill image access must be authorized.

Use controlled storage references.

Do not expose permanent public object-storage URLs if security architecture requires protected access.

---

# 336. ADMIN IMAGE PREVIEW

Show:

```text
Bill Image
Zoom
Fit
Download if authorized
```

Do not expose unrelated customer files.

---

# 337. ADMIN MAP SECURITY

GPS data should be available only to authorized admin users.

Customer visibility remains controlled by explicit publication.

---

# 338. ADMIN CUSTOMER PHONE DISPLAY

Phone can appear in authorized Admin customer views.

It should not automatically appear in:

- public website;
- TV;
- unrelated dashboard widgets.

---

# 339. ADMIN ERROR LANGUAGE

Use business language:

```text
Inventory could not be updated because another change occurred.
```

Avoid:

```text
OptimisticLockException 409.
```

Technical details belong in logs/observability.

---

# 340. ADMIN DESIGN REVIEW CHECKLIST

Before approving a screen:

- [ ] Can the admin identify the page purpose immediately?
- [ ] Is the primary action obvious?
- [ ] Are dangerous actions visually distinct?
- [ ] Is the data density appropriate?
- [ ] Can the admin scan the table quickly?
- [ ] Are filters easy to understand?
- [ ] Are states clear?
- [ ] Are business errors understandable?
- [ ] Is customer data minimized?
- [ ] Is the page consistent with PondFish visual language?
- [ ] Does it feel like a real business application rather than an AI-generated dashboard?

---

# 341. CLIENT REVIEW CHECKLIST

Client should review:

```text
Navigation
Dashboard
Inventory
Fish
Categories
Discounts
Subscriptions
Customers
Workers
Bookings
Transactions
GPS
Notifications
Website Content
Settings
Reports
Audit
Exceptions
Security
```

Review order should prioritize daily operational modules first.

---

# 342. IMPLEMENTATION ORDER

Recommended build sequence:

```text
1. Admin Login
2. Admin Shell / Navigation
3. Dashboard
4. Inventory
5. Fish
6. Categories
7. Discounts
8. Customers
9. Workers
10. Bookings
11. Transactions
12. Subscriptions
13. GPS
14. Notifications
15. Website Content
16. Settings
17. Reports
18. Audit
19. Exceptions
20. Security/Profile
21. Global error states
22. Cross-portal validation
```

---

# 343. DESIGN ORDER

Recommended Stitch/design order:

```text
1. Shell
2. Dashboard
3. Inventory
4. Fish
5. Customer detail
6. Booking detail
7. Transaction detail
8. Subscription detail
9. GPS live view
10. Notifications
11. Content editor
12. Reports
13. Audit
14. Exceptions
15. Forms/dialogs
16. System states
```

---

# 344. IMPLEMENTATION HANDOFF

The development team should receive:

```text
Master PRD
↓
System Architecture
↓
Admin Portal PRD
↓
Design System
↓
Admin Page-by-Page Specification
↓
Approved Stitch/Figma Screens
↓
API Contracts
↓
Frontend Architecture
↓
Backend
↓
QA
```

---

# 345. ADMIN PORTAL MVP

## Included

- Admin authentication;
- Dashboard;
- Inventory;
- Fish;
- Categories;
- Discounts;
- Subscription plans;
- Customer subscriptions;
- Customers;
- Workers;
- Bookings;
- Transactions;
- Truck/GPS;
- Notifications;
- Website content;
- Business settings;
- Reports;
- Audit logs;
- Operational exceptions;
- Admin security;
- Profile;
- system error states.

These areas align with the Admin PRD's MVP scope. fileciteturn31file1L1540-L1627

---

# 346. FUTURE ADMIN SCOPE

Potential future:

- multiple stores;
- multiple trucks;
- advanced role-based permissions;
- POS integration;
- weighing-machine integration;
- supplier management;
- purchase orders;
- inventory forecasting;
- automated replenishment;
- advanced accounting;
- advanced analytics;
- expanded notification automation;
- multi-language content.

Each future feature requires separate requirements before implementation. fileciteturn31file1L1629-L1647

---

# 347. ADMIN DEFINITION OF DONE

Admin Portal MVP is ready only when:

- all required pages exist;
- required workflows are implemented;
- server-side authorization exists;
- financial mutations are idempotent;
- inventory mutations are concurrency-safe;
- Subscription Credit is ledgered;
- booking transitions are enforced;
- transactions are traceable;
- GPS publishing works;
- successful transactions reach TV;
- customer-facing changes propagate;
- loading/empty/validation/business/network/conflict states exist;
- critical actions are audited;
- CSV/Excel exports work;
- security testing passes;
- QA passes;
- monitoring exists;
- backup/recovery exists;
- no critical financial/inventory/booking/payment inconsistency remains.

These are the Admin PRD's Definition of Done requirements. fileciteturn31file1L1651-L1673

---

# 348. FINAL ADMIN ARCHITECTURE PRINCIPLE

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
CUSTOMER APP
WORKER APP
PAYMENT GATEWAY
POS
TV CONTROLLER
```

---

# 349. FINAL PRODUCT PRINCIPLE

The Admin Portal must make the PondFish business understandable and controllable without making the administrator understand the internal software architecture.

The UI should answer:

```text
What is happening?
What needs attention?
What can I change?
What will change if I do it?
Is this action safe?
What happened afterward?
Who performed it?
```

---

# 350. FINAL BUILD PRINCIPLE

Every Admin action that materially affects:

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

This follows the final Admin acceptance requirement. fileciteturn29file3L439-L445

---

# 351. SOURCE DOCUMENT RELATIONSHIP

This page-by-page document does not replace:

```text
PondFish Master PRD
PondFish System Architecture
PondFish Admin Portal PRD
PondFish Design System
Database/ERD
API Specification
Integration Specification
QA Specification
Deployment Specification
Master AI Coding Prompt
```

It connects the Admin Portal requirements to the eventual UI and implementation.

---

# 352. NEXT ARTIFACTS

After the Admin Portal Page-by-Page UI Specification, the documentation sequence should continue with the remaining build-layer documents rather than rewriting already-approved portal requirements.

Recommended next artifacts:

```text
Core Business Engines Specification
        ↓
Integrations Specification
        ↓
Cross-System Business Rules
        ↓
Validation / Error / Success / Empty-State Specification
        ↓
Roles & Permissions Specification
        ↓
Database / ERD finalization
        ↓
API Specification
        ↓
Frontend Architecture
        ↓
QA / Test Specification
        ↓
Deployment / DevOps Specification
        ↓
Master AI Coding Prompt
```

The Master PRD's documentation sequence identifies Admin Portal before core engines, integrations, cross-system rules, validation/errors, roles, acceptance criteria, and future scope. fileciteturn29file7L1140-L1158

---

# 353. DOCUMENT COMPLETION CHECKLIST

- [x] Admin responsibility
- [x] Admin boundaries
- [x] Information architecture
- [x] Global layout
- [x] Sidebar
- [x] Header
- [x] Dashboard
- [x] Inventory
- [x] Inventory adjustment
- [x] Fish management
- [x] Categories
- [x] Discounts
- [x] Subscription plans
- [x] Customer subscriptions
- [x] Customers
- [x] Workers
- [x] Bookings
- [x] Transactions
- [x] Truck/GPS
- [x] Notifications
- [x] Website content
- [x] Business settings
- [x] Reports
- [x] Audit logs
- [x] Exceptions
- [x] Admin security
- [x] Profile
- [x] Logout
- [x] 404
- [x] 403
- [x] 500
- [x] Network failure
- [x] Maintenance
- [x] Conflict
- [x] Loading
- [x] Empty
- [x] Validation
- [x] Confirmation
- [x] Permissions
- [x] Cross-portal effects
- [x] Realtime
- [x] Concurrency
- [x] Idempotency
- [x] Privacy
- [x] Security
- [x] Accessibility
- [x] Performance
- [x] QA
- [x] Stitch requirements
- [x] AI coding-agent rules
- [x] Acceptance criteria
- [x] MVP scope
- [x] Future scope
- [x] Build handoff

---

# 354. FINAL HANDOFF STATEMENT

The PondFish Admin Portal is the operational control center for the current single-store, single-truck ecosystem.

The implementation must preserve the shared backend as the source of truth and must never duplicate or silently alter customer, worker, payment, booking, inventory, GPS, or transaction business logic.

The Admin UI exists to make those authoritative workflows:

```text
Visible
Configurable
Auditable
Safe
Operationally manageable
```

The final interface should feel like a polished, real-world store management product—not a generic AI-generated admin dashboard.

---

**End of PondFish Admin Portal Page-by-Page UI/UX & Build Specification**
