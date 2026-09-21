# PONDFISH — WORKER TABLET PORTAL
## Page-by-Page UI/UX Specification & Build Specification

**Document Type:** Portal UI/UX + Functional Page Specification  
**Portal:** Worker Tablet Web Application  
**Version:** 1.0  
**Status:** Detailed Build Specification  
**Primary Use:** UI skeleton, Stitch/UI generation, frontend implementation, QA and AI-assisted coding  
**Platform:** Responsive Web Application, Tablet First  
**Frontend Direction:** React + TypeScript + Tailwind CSS  
**Backend:** Shared PondFish authoritative backend/API  
**Authentication:** Worker email + password  
**Scope:** Current MVP / Single Store / Current Worker Workflow  

---

# 1. DOCUMENT PURPOSE

This document defines the Worker Tablet Portal page by page.

It converts the locked PondFish product requirements and worker workflow into a practical UI/UX and implementation specification.

The document is intentionally detailed.

It is designed to be usable by:

- UI/UX designers
- Stitch or other UI generation tools
- Frontend developers
- Backend developers
- QA engineers
- Product owners
- AI coding agents
- Client review teams

The Worker Portal must be optimized for real in-store operations.

The worker should not need to understand the internal architecture.

The interface should make the operational sequence obvious:

```text
Find the booking
      ↓
Verify the booking
      ↓
Prepare the fish
      ↓
Handle additional payment if required
      ↓
Hand over the fish
      ↓
Complete the order
      ↓
QR becomes invalid
      ↓
Booking becomes completed
```

The portal must prioritize speed, clarity, large touch targets, low cognitive load and reliable error recovery.

---

# 2. SOURCE-OF-TRUTH RULE

The Worker Portal is a presentation and operational interface.

It must not independently implement business-critical rules.

The backend remains authoritative for:

- booking state
- inventory
- reservation state
- prices
- discounts
- subscription eligibility
- payment status
- additional payment
- QR validity
- completion eligibility
- worker authorization
- transaction finalization
- audit records

Source priority:

```text
Backend/API Contract
        ↓
Master PRD
        ↓
Business Workflow Specification
        ↓
Frontend/Application Architecture
        ↓
Design System
        ↓
Worker Tablet Page Specification
        ↓
Implementation
```

If the frontend calculation or displayed state conflicts with the backend response, the backend state wins.

---

# 3. WORKER PORTAL PRODUCT ROLE

The Worker Portal is the operational workspace used by PondFish store staff.

Its main purpose is order fulfillment.

The worker should be able to perform the core task without navigating through unnecessary screens.

Primary worker responsibilities include:

- worker authentication
- viewing active bookings
- retrieving bookings
- QR scanning
- manual booking search
- viewing booking details
- checking payment state
- checking additional payment requirements
- processing permitted physical-store transactions
- completing eligible online bookings
- viewing completed order history
- viewing worker profile information

---

# 4. INTERFACE BOUNDARIES

## 4.1 Worker Portal CAN

The worker can:

- view pending bookings
- search by customer name
- search by phone number
- search by Booking ID
- scan a booking QR
- open booking details
- view required order information
- handle required additional payment where the locked workflow permits
- complete an eligible order
- view completed order history
- view worker profile
- log out

---

## 4.2 Worker Portal CANNOT

The worker must not be given controls for:

- creating customer accounts
- creating subscriptions
- modifying subscription plans
- changing subscription rules
- changing fish catalog information
- changing general inventory
- arbitrary booking cancellation
- editing customer account information
- business settings
- audit administration
- worker management
- changing historical completed orders
- changing backend business rules
- publishing truck GPS
- modifying reports
- changing website content

These responsibilities belong to other interfaces.

---

# 5. WORKER UX PRINCIPLES

## 5.1 Operational First

The worker is using the system while serving customers.

The interface should not behave like a general-purpose business dashboard.

Every screen should answer:

> What does the worker need to do next?

---

## 5.2 Tablet First

The portal is optimized for tablets.

Primary interaction:

- touch
- large buttons
- large search field
- clear cards
- large status indicators
- minimal typing
- visible next action

Desktop responsiveness is supported, but tablet is the primary target.

---

## 5.3 Fast Retrieval

A worker should be able to retrieve a booking using either:

```text
QR Scan
```

or:

```text
Booking ID
Customer Name
Phone Number
```

Both methods must converge into the same booking record and the same fulfillment flow.

---

## 5.4 No Duplicate Workflows

The system must not create one completion process for QR bookings and another for manually searched bookings.

Both must become:

```text
Booking Details
      ↓
Verification
      ↓
Preparation
      ↓
Payment Check
      ↓
Handover
      ↓
Complete Booking
```

---

## 5.5 Clear Statuses

Use a consistent status system.

Examples:

- Pending
- Ready for Collection
- In Progress
- Additional Payment Required
- Completed
- Expired
- Cancelled
- Invalid QR
- Payment Pending
- Processing Error

Status should always be accompanied by human-readable text.

Do not depend on color alone.

---

# 6. GLOBAL WORKER UI SHELL

## 6.1 Overall Layout

Recommended structure:

```text
┌──────────────────────────────────────────────────────────────┐
│ PondFish       Search / Quick Action       Worker  ▾        │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│ Active Orders │                                              │
│               │               Main Content                   │
│ Completed     │                                              │
│               │                                              │
│ Profile       │                                              │
│               │                                              │
│ Logout        │                                              │
│               │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

On smaller tablets the navigation can collapse into a top bar.

---

## 6.2 Header

The header should contain:

- PondFish logo/name
- current page title
- quick search
- worker name
- worker avatar/initial
- profile menu
- logout action

Do not overload the header with analytics.

---

## 6.3 Navigation

Primary navigation:

1. Active Orders
2. Completed Orders
3. Profile

Quick actions may appear in the dashboard:

- Scan Booking
- Search Booking
- Search Customer
- Start Bill Processing where enabled

---

# 7. GLOBAL PAGE STATE STANDARD

Every worker page or operation must define the following states where applicable:

1. Initial
2. Loading
3. Success
4. Empty
5. Validation Error
6. Business Error
7. Network Error
8. Permission Error
9. Session Expired
10. Retry
11. Processing
12. Completed

No critical action should silently fail.

---

# 8. GLOBAL FEEDBACK RULES

## 8.1 Success Feedback

Successful actions should provide immediate feedback.

Example:

```text
Booking completed successfully.
```

For important operations also update the visible status.

---

## 8.2 Error Feedback

Errors must explain:

- what happened
- whether the worker needs to act
- what action is available next

Bad:

```text
Error 409
```

Good:

```text
This booking cannot be completed in its current state.

Refresh the booking and try again.
```

---

## 8.3 Network Error

Example:

```text
Connection unavailable

We couldn't reach the PondFish server.

Your order has not been marked as completed.

Check the internet connection and try again.
```

Actions:

- Retry
- Back

Do not show success unless the backend confirms success.

---

## 8.4 Session Expired

Example:

```text
Your session has expired.

Please sign in again to continue.
```

Action:

```text
Sign In
```

---

## 8.5 Permission Error

Example:

```text
You don't have permission to perform this action.
```

Do not reveal hidden administrative functionality.

---

# 9. WORKER AUTHENTICATION

# WP-01 — WORKER LOGIN

## 9.1 Purpose

Authenticate an authorized PondFish worker.

---

## 9.2 Access

Unauthenticated worker.

---

## 9.3 Layout

```text
┌──────────────────────────────────┐
│            PondFish              │
│                                  │
│        Worker Portal             │
│                                  │
│  Email                           │
│  [________________________]      │
│                                  │
│  Password                        │
│  [________________________]      │
│                                  │
│          [ Sign In ]             │
│                                  │
│  Need help? Contact your admin.  │
└──────────────────────────────────┘
```

---

## 9.4 Fields

### Email

Type:

```text
email
```

Required.

Validation:

- cannot be empty
- valid email format

### Password

Type:

```text
password
```

Required.

Provide show/hide control if permitted by design system.

---

## 9.5 Login Flow

```text
Enter Email
     ↓
Enter Password
     ↓
Sign In
     ↓
Backend Authentication
     ↓
Worker Authorization
     ↓
Active Orders
```

---

## 9.6 Loading State

Button changes to:

```text
Signing in...
```

Prevent duplicate submission.

---

## 9.7 Invalid Credentials

Use calm messaging.

```text
Unable to sign in.

Please check your email and password and try again.
```

Do not reveal whether an email account exists.

---

## 9.8 Disabled Worker

```text
Your worker account is currently disabled.

Please contact the store administrator.
```

---

## 9.9 Network Error

```text
Unable to connect.

Check your internet connection and try again.
```

---

## 9.10 Success

Redirect to:

```text
Active Orders / Worker Dashboard
```

---

## 9.11 Acceptance Criteria

- unauthorized workers cannot access protected pages
- valid worker can sign in
- disabled worker cannot sign in
- duplicate login submission is prevented
- session is securely established
- worker role is enforced by backend
- login errors are understandable

---

# 10. WORKER DASHBOARD

# WP-02 — ACTIVE ORDERS / WORKER DASHBOARD

## 10.1 Purpose

Provide a fast operational overview.

The worker should immediately understand:

- what needs attention
- how many active bookings exist
- what has been completed
- where to start

---

## 10.2 Entry

After login.

Also accessible from Active Orders navigation.

---

## 10.3 Dashboard Layout

```text
┌─────────────────────────────────────────────────────┐
│ Active Orders                         Worker: Alex   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [ Pending 12 ] [ In Progress 3 ] [ Completed 24 ] │
│                                                     │
│ [ Scan Booking ]       [ Search Booking ]           │
│                                                     │
│ Search customer / phone / booking ID               │
│ [______________________________________________]    │
│                                                     │
│ Today's Active Bookings                             │
│ ┌───────────────────────────────────────────────┐   │
│ │ #PF1024  Rahul      2 kg   Ready             │   │
│ │ #PF1025  Anu        1 kg   Pending            │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 10.4 Summary Cards

### Pending

Shows count returned by backend.

### In Progress

Shows active operational work if this state is used.

### Completed

Shows today's completed count.

Counts must not be calculated from a partial page list.

---

## 10.5 Primary Actions

### Scan Booking

Opens QR scanner.

### Search Booking

Opens search interface.

### Search Customer

Opens customer search where authorized.

---

## 10.6 Active Booking List

Each row/card displays:

- Booking ID
- customer name
- fish name
- quantity
- payment state
- booking state
- expiry
- action

Example:

```text
PF-1024
Rahul Kumar

Rohu — 2 kg

Payment: Paid
Status: Ready for Collection
Expires: Today, 7:30 PM

[Open Booking]
```

---

## 10.7 Loading State

Use skeleton cards.

Do not display fake counts.

---

## 10.8 Empty State

```text
No active bookings

There are no bookings waiting for action right now.
```

Optional action:

```text
Refresh
```

---

## 10.9 Filtered Empty

```text
No bookings match your current filters.

Clear filters
```

---

## 10.10 Network Error

```text
We couldn't load today's bookings.

Check the connection and retry.
```

Action:

```text
Retry
```

---

# 11. BOOKING QUEUE

# WP-03 — BOOKING QUEUE

## 11.1 Purpose

Show active booking records requiring worker attention.

---

## 11.2 Data

Each booking should show:

- Booking ID
- customer
- fish
- quantity
- payment state
- booking status
- expiry
- source where available
- action

---

## 11.3 Filters

Where supported:

- status
- date
- source

Do not add filters that the backend does not support.

---

## 11.4 Status Filter

Example options:

```text
All
Pending
Ready for Collection
In Progress
Additional Payment Required
Completed
Expired
Cancelled
```

Only show relevant active states in the active queue.

---

## 11.5 List Interaction

Clicking/tapping a booking opens:

```text
Booking Details
```

---

# 12. BOOKING SEARCH

# WP-04 — BOOKING SEARCH

## 12.1 Purpose

Allow fast retrieval when the customer does not present a usable QR.

---

## 12.2 Search Inputs

Worker can search by:

- Booking ID
- customer name
- phone number

The locked workflow also permits total payment amount where supported.

---

## 12.3 Search UI

```text
Search Booking

[ Booking ID / Customer Name / Phone ]

                 [ Search ]

Recent / Matching Results
```

---

## 12.4 Search Behavior

The interface should tolerate normal formatting differences where backend search supports them.

Examples:

- spaces in phone number
- capitalization differences
- leading/trailing spaces

Frontend must not change the actual search semantics.

---

## 12.5 Loading

```text
Searching bookings...
```

---

## 12.6 No Results

```text
No booking found.

Check the customer name, phone number, or Booking ID.
```

---

## 12.7 Network Error

```text
Search unavailable.

Check the connection and try again.
```

---

## 12.8 Result Card

```text
Booking ID: PF-1024
Customer: Rahul Kumar
Phone: ••••••1234
Items: Rohu 2 kg
Payment: Paid
Status: Ready for Collection

[Open]
```

Only expose data required for worker operation.

---

# 13. QR BOOKING RETRIEVAL

# WP-05 — QR SCANNER

## 13.1 Purpose

Retrieve a booking quickly from the customer's QR ticket.

---

## 13.2 Flow

```text
Customer Shows QR
        ↓
Worker Opens Scanner
        ↓
Camera Reads QR
        ↓
Backend Validates QR
        ↓
Booking Opens
```

---

## 13.3 Scanner Layout

```text
┌───────────────────────────────────────────┐
│ Scan Booking QR                      ✕    │
│                                           │
│          ┌─────────────────┐              │
│          │                 │              │
│          │   SCAN AREA     │              │
│          │                 │              │
│          └─────────────────┘              │
│                                           │
│ Align the customer's booking QR here.     │
│                                           │
│ [ Enter Booking ID Instead ]              │
└───────────────────────────────────────────┘
```

---

## 13.4 Permission

If camera permission is required:

```text
Camera access is required to scan booking QR codes.
```

Actions:

```text
Allow Camera
Use Booking ID
```

---

## 13.5 Invalid QR

```text
Invalid QR

This QR cannot be used for this order.

Ask the customer to show the correct booking QR.
```

---

## 13.6 Already Completed

```text
Order Already Completed

This booking has already been fulfilled.
```

---

## 13.7 Expired

```text
Booking Expired

This booking is no longer available for collection.
```

---

## 13.8 Cancelled

```text
Booking Cancelled

This booking cannot be fulfilled.
```

---

## 13.9 Network Failure

```text
Unable to verify the QR.

Check the connection and try again.
```

Do not treat a locally readable QR as valid without backend verification.

---

# 14. BOOKING DETAILS

# WP-06 — BOOKING DETAILS

## 14.1 Purpose

Provide all information required for the worker to fulfill the booking.

---

## 14.2 Layout

```text
Booking #PF-1024

Customer
Rahul Kumar
Phone: ••••••1234

Items
────────────────────────
Rohu        2 kg
Price       ₹xxx
────────────────────────

Payment
Booking Amount      ₹xxx
Paid                ₹xxx
Additional Due      ₹0

Subscription
Covered / Not Covered

Status
Ready for Collection

Expires
Today, 7:30 PM

[ Prepare Order ]
```

---

## 14.3 Display Data

Where available:

- Booking ID
- customer name
- customer phone
- fish
- quantity
- item price
- discounts
- total
- subscription amount
- paid amount
- additional amount
- payment state
- booking state
- expiry
- collection information

---

## 14.4 Backend State Controls Actions

The UI must only display actions valid for the current backend state.

Example:

```text
Ready for Collection
        ↓
Complete Booking
```

But:

```text
Expired
```

must not show:

```text
Complete Booking
```

---

# 15. ORDER PREPARATION

# WP-07 — PREPARE ORDER

## 15.1 Purpose

Move the worker through the physical fulfillment process.

---

## 15.2 Preparation View

The worker should see:

```text
Prepare Order

Customer:
Rahul Kumar

Items:
Rohu — 2 kg

Preparation
☐ Rohu prepared
☐ Quantity checked

Payment
✓ Paid

[ Continue ]
```

Checkboxes may be operational UI only.

They must not create backend completion state unless explicitly defined.

---

## 15.3 Quantity

Display the backend-authoritative quantity.

Do not allow the worker to silently modify the booking quantity.

If an actual quantity difference occurs, route through the defined business/payment workflow.

---

# 16. ADDITIONAL PAYMENT

# WP-08 — ADDITIONAL PAYMENT CHECK

## 16.1 Purpose

Handle a payment requirement that arises from the locked booking workflow.

---

## 16.2 Display

```text
Additional Payment Required

Original Booking Amount: ₹500
Additional Amount:       ₹120

Amount Due:              ₹120

[ Collect Payment ]
```

The exact amount must come from the backend.

---

## 16.3 Unpaid State

```text
Additional Payment Required

Complete the additional payment before completing this order.
```

The worker must not complete the order while the backend says payment is required and unpaid.

---

## 16.4 Payment Processing

Where Razorpay is applicable:

```text
Payment Required
       ↓
Create Payment
       ↓
Customer/Worker Payment
       ↓
Backend Verification
       ↓
Payment Successful
       ↓
Continue Fulfillment
```

The frontend callback alone is never sufficient.

---

## 16.5 Payment Success

```text
Additional payment received.

You can now complete the order.
```

---

## 16.6 Payment Failed

```text
Payment unsuccessful.

The booking has not been completed.
```

Actions:

```text
Try Again
Back
```

---

## 16.7 Payment Pending

```text
Payment verification is still in progress.

Please wait before trying again.
```

Do not create a second payment blindly.

---

# 17. ORDER HANDOVER

# WP-09 — HANDOVER

## 17.1 Purpose

Provide the final operational step before completion.

---

## 17.2 Layout

```text
Ready for Handover

Customer:
Rahul Kumar

Items:
Rohu — 2 kg

Payment:
Paid

Confirm that the fish has been handed over.

[ Complete Booking ]
```

---

## 17.3 Important Rule

The worker should only complete the booking after physical handover.

The completion button must be clearly distinguishable as a final action.

---

# 18. COMPLETE ONLINE BOOKING

# WP-10 — COMPLETE BOOKING

## 18.1 Purpose

Finalize an eligible collected online booking.

---

## 18.2 Preconditions

The backend must confirm:

- booking exists
- worker is authorized
- booking is eligible for completion
- booking is not expired
- booking is not cancelled
- booking is not already completed
- required payment is satisfied
- required business conditions are satisfied

---

## 18.3 Confirmation

Because completion is an important irreversible state change, use confirmation.

```text
Complete this booking?

Confirm that the fish has been handed over to the customer.

Booking: PF-1024
Customer: Rahul Kumar
Items: Rohu — 2 kg

[ Cancel ]     [ Complete Booking ]
```

---

## 18.4 Processing

```text
Completing booking...
```

Disable duplicate clicks.

---

## 18.5 Success

```text
Booking completed successfully.

The QR ticket has been invalidated.
```

Then show:

```text
Booking Completed
```

---

## 18.6 Backend Completion

The backend finalization should update the authoritative booking record.

Relevant records may include:

- completion status
- completed time
- completed by
- final quantity
- additional payment where applicable
- QR status

Worker records should also update:

- completed order count
- order history

Customer records should reflect:

- completed booking
- purchase history

Reporting should receive the completed transaction/activity.

---

## 18.7 Duplicate Completion

If another request has already completed it:

```text
This booking has already been completed.

Refresh the booking to view the latest status.
```

The UI must not show a second successful completion.

---

## 18.8 Invalid State

```text
This booking cannot be completed in its current state.

Refresh the booking and check the latest status.
```

---

## 18.9 Network Failure

```text
Unable to complete the order.

Please check the connection and try again.

The order has not been marked as completed unless the server confirms it.
```

Do not assume failure means the backend did nothing.

A safe retry flow should re-fetch state before creating another completion attempt.

---

# 19. QR INVALIDATION

# WP-11 — QR STATE

## 19.1 Purpose

Reflect the locked QR lifecycle.

```text
Booking Created
      ↓
QR Generated
      ↓
Worker Retrieves Booking
      ↓
Order Completed
      ↓
QR Invalidated
      ↓
Archived
```

---

## 19.2 Completed QR

Once completion is confirmed:

```text
QR Status: Invalid
```

Customer cannot reuse the QR.

---

## 19.3 Reuse Attempt

```text
Order Already Completed

This booking has already been fulfilled.
```

---

# 20. COMPLETED ORDERS

# WP-12 — COMPLETED ORDERS

## 20.1 Purpose

Allow the worker to view completed operational history.

---

## 20.2 Data

Display:

- Booking ID
- customer
- items
- quantity
- completion time
- worker
- payment status
- final status

---

## 20.3 Important Boundary

Completed records are read-only for the worker.

The worker must not be able to:

- edit completed orders
- change amounts
- change historical quantities
- reverse completion
- alter audit information

---

## 20.4 Empty State

```text
No completed orders yet.

Completed bookings will appear here.
```

---

## 20.5 Search

Where supported:

- Booking ID
- customer name
- phone

---

# 21. CUSTOMER SEARCH

# WP-13 — CUSTOMER SEARCH

## 21.1 Purpose

Find a customer for an authorized worker-assisted physical transaction.

---

## 21.2 Search

Supported search fields may include:

- customer name
- phone
- authorized identifier

---

## 21.3 Privacy

Show only information required for the workflow.

Do not expose unnecessary customer data.

---

## 21.4 No Result

```text
No customer found.

Check the name or phone number and try again.
```

---

# 22. PHYSICAL BILL PROCESSING

# WP-14 — BILL CAPTURE

## 22.1 Purpose

Process a physical store bill for a customer without a phone.

The worker portal supports the operational bill workflow.

---

## 22.2 Current Bill Architecture

```text
Printed Bill
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
```

The SI-801 weighing machine is not directly integrated with PondFish in the current phase.

---

## 22.3 Bill Capture Screen

```text
Physical Transaction

Customer:
Rahul Kumar

Capture Bill

┌───────────────────────────────┐
│                               │
│        Bill Preview           │
│                               │
└───────────────────────────────┘

[ Take Photo ]
[ Upload Bill ]

[ Continue ]
```

---

## 22.4 Camera Permission

```text
Camera access is required to capture the bill.
```

Provide fallback:

```text
Upload from Device
```

where supported.

---

## 22.5 Image Quality

If the image is unreadable:

```text
Bill image is unclear.

Make sure the Bill ID, fish names, quantities and prices are visible.
```

Actions:

```text
Retake
Choose Another Image
```

---

# 23. AI BILL PROCESSING

# WP-15 — AI EXTRACTION

## 23.1 Purpose

Extract structured information from the uploaded bill.

---

## 23.2 AI Is Advisory

AI extraction must not independently:

- create a successful transaction
- deduct inventory
- deduct Subscription Credit
- declare payment successful

Human/backend validation remains mandatory.

---

## 23.3 Processing UI

```text
Reading bill...

Extracting:
✓ Bill image
✓ Bill ID
✓ Fish items
✓ Quantities
✓ Prices

Please wait.
```

---

## 23.4 AI Success

Show extracted values in editable/reviewable form:

```text
Review Bill

Bill ID
PF-B1024

Items
Rohu        2 kg     ₹400
Pamplet     1 kg     ₹300

Total
₹700

[ Confirm Bill ]
[ Scan Again ]
```

---

## 23.5 AI Failure

```text
We couldn't read the bill clearly.

Please capture the bill again or enter the Bill ID manually.
```

---

# 24. AI BILL REVIEW

# WP-16 — REVIEW EXTRACTED BILL

## 24.1 Purpose

Human confirmation of AI-extracted data.

---

## 24.2 Review Fields

Where available:

- Bill ID
- fish name
- quantity
- price
- subtotal
- discount
- total

---

## 24.3 Warning

```text
Please verify the extracted information before continuing.
```

---

## 24.4 Human Confirmation

The worker must confirm the bill before financial finalization.

---

## 24.5 Duplicate Bill ID

The backend/database must protect against duplicate successful Bill IDs.

If duplicate:

```text
Bill Already Processed

This Bill ID has already been used for a successful transaction.
```

Do not create a second successful transaction.

---

# 25. MANUAL BILL ID

# WP-17 — MANUAL BILL ID ENTRY

## 25.1 Purpose

Provide fallback when the Bill ID cannot be read.

---

## 25.2 UI

```text
Bill ID

[________________________]

[ Verify Bill ID ]
```

---

## 25.3 Invalid ID

```text
We couldn't verify this Bill ID.

Check the value on the bill and try again.
```

---

## 25.4 Duplicate

```text
This Bill ID has already been processed.
```

---

# 26. PHYSICAL TRANSACTION PAYMENT

# WP-18 — PAYMENT CALCULATION

## 26.1 Purpose

Display the authoritative transaction calculation before payment.

---

## 26.2 Calculation

The backend determines:

- item total
- discount
- subscription coverage
- Subscription Credit deduction
- weekly quantity usage
- gateway fee where applicable
- GST on gateway fee where applicable
- final payable amount

---

## 26.3 Display

```text
Transaction Summary

Fish Total             ₹700
Discount               -₹50
Subscription Credit   -₹300
────────────────────────────
Amount Before Gateway  ₹350

Gateway Fee             ₹7
GST on Fee              ₹1.26
────────────────────────────
Amount to Pay          ₹358.26
```

The exact values must come from backend calculation.

---

# 27. CASH COLLECTION

# WP-19 — CASH PAYMENT

## 27.1 Purpose

Cash is available only in the Worker Portal physical-store workflow.

---

## 27.2 Display

```text
Cash Payment

Amount Due:
₹500

Cash Received:
[____________]

Change:
₹______

[ Confirm Cash Payment ]
```

---

## 27.3 Worker Traceability

Worker ID and cash amount must be stored against the transaction.

---

## 27.4 Validation

Cash received cannot be less than amount due.

Example:

```text
Insufficient cash amount.

Please enter the amount received from the customer.
```

---

## 27.5 Success

Only after backend finalization:

```text
Transaction completed successfully.
```

---

# 28. PHYSICAL TRANSACTION FINALIZATION

# WP-20 — FINALIZE TRANSACTION

## 28.1 Architecture

```text
Bill
 ↓
AI Extraction
 ↓
Validation
 ↓
Worker/Customer Confirmation
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
 ├─ Worker Link
 └─ Audit
 ↓
Commit
 ↓
Successful Event
 ├─ TV
 ├─ Notifications
 └─ Reporting
```

---

## 28.2 Important Rule

A frontend success screen is not sufficient.

The worker UI must only show transaction success after the backend confirms successful finalization.

---

# 29. TRANSACTION SUCCESS

# WP-21 — SUCCESS SCREEN

## 29.1 Purpose

Provide clear confirmation that the physical transaction has successfully completed.

---

## 29.2 UI

```text
✓ Transaction Successful

Customer
Rahul Kumar

Amount Paid
₹700

Bill ID
PF-B1024

Transaction ID
TXN-2026-00124

[ Done ]
```

---

## 29.3 TV Event

A successful transaction should trigger the transaction TV event.

The TV receives successful transaction data through the backend/realtime event system.

The worker does not manually publish the TV event.

---

# 30. TRANSACTION FAILURE

# WP-22 — FAILURE STATE

## 30.1 Payment Failure

```text
Payment Failed

The payment was not completed.

No successful transaction has been recorded.

[ Try Again ]
```

---

## 30.2 Verification Failure

```text
Payment Verification Pending

The payment response has not yet been confirmed by the server.

Please wait or refresh the transaction status.
```

---

## 30.3 Finalization Failure

```text
Transaction Could Not Be Completed

The server could not finalize this transaction.

Please retry after checking the connection.
```

The UI must not claim that inventory or Subscription Credit was deducted unless backend confirmation exists.

---

# 31. TRANSACTION TV RELATIONSHIP

The Worker Portal is not the TV portal.

The worker completes a successful transaction.

The backend emits the successful transaction event.

The TV listens for that event.

Flow:

```text
Worker
  ↓
Successful Transaction
  ↓
Backend Commit
  ↓
Successful Transaction Event
  ├──────────────→ TV
  ├──────────────→ Customer Notification
  └──────────────→ Reporting
```

The TV is read-only.

The worker must not need to operate the TV manually.

---

# 32. REAL-TIME TRANSACTION FEEDBACK

After a successful transaction, the worker should see immediate success.

The transaction TV should receive:

- customer name
- transaction ID
- fish name
- quantity
- bill number
- paid amount
- time

The exact display format belongs to the TV specification.

---

# 33. WORKER PROFILE

# WP-23 — WORKER PROFILE

## 33.1 Purpose

Show the authenticated worker's operational account information.

---

## 33.2 Display

Where available:

- worker name
- worker ID
- email
- role
- account status

---

## 33.3 Actions

```text
Log Out
```

Do not expose worker administration.

---

# 34. LOGOUT

# WP-24 — LOGOUT

## 34.1 Confirmation

Optional confirmation:

```text
Log out of the Worker Portal?

[ Cancel ] [ Log Out ]
```

---

## 34.2 Success

Clear the authenticated session and return to login.

---

# 35. SESSION MANAGEMENT

## 35.1 Expiration

If session expires during an operation:

```text
Your session has expired.

Please sign in again.
```

The portal must not silently continue using an expired session.

---

## 35.2 Unauthorized API

If backend returns unauthorized:

```text
Session expired
```

Then redirect to login.

---

# 36. NETWORK FAILURE STANDARD

Worker operations happen in a physical store, so connectivity failures must be handled clearly.

## 36.1 Read Operation Failure

```text
Couldn't load this information.

Check the connection and retry.
```

---

## 36.2 Completion Failure

Never show:

```text
Completed
```

until the backend confirms completion.

---

## 36.3 Payment Failure

Never assume:

```text
Payment Failed
```

simply because the frontend lost connection after payment submission.

First retrieve backend payment state where possible.

---

## 36.4 Retry

Retries must be safe.

A retry must not create:

- duplicate completion
- duplicate payment
- duplicate transaction
- duplicate bill processing

Backend idempotency is required for critical operations.

---

# 37. LOADING UX

Loading states must prevent accidental duplicate operations.

Examples:

```text
Loading bookings...
Searching...
Verifying QR...
Processing bill...
Calculating transaction...
Verifying payment...
Completing booking...
```

Buttons become disabled during the relevant request.

---

# 38. EMPTY STATES

## Active Orders

```text
No active bookings

There is nothing waiting for fulfillment right now.
```

## Completed Orders

```text
No completed orders yet.
```

## Search

```text
No matching booking found.
```

## Customer Search

```text
No customer found.
```

## Bill History Where Applicable

```text
No transactions found.
```

---

# 39. ERROR MESSAGE PRINCIPLES

Every error should answer:

1. What happened?
2. Is the order still safe?
3. What should the worker do now?

Example:

```text
Unable to complete the order.

The booking has not been marked as completed unless the server confirms it.

[ Retry ]
```

Avoid technical messages such as:

```text
500 Internal Server Error
```

as the only user-facing message.

Technical identifiers can be logged separately.

---

# 40. BOOKING NOT FOUND

```text
Booking Not Found

No booking matches the information entered.

Please check:
• Booking ID
• Customer name
• Phone number
```

---

# 41. QR INVALID

```text
Invalid QR

This QR cannot be used for this order.
```

---

# 42. BOOKING ALREADY COMPLETED

```text
Order Already Completed

This booking has already been fulfilled.
```

---

# 43. BOOKING EXPIRED

```text
Booking Expired

This booking is no longer available for collection.
```

The locked booking validity is 48 hours from successful creation.

Business opening/closing hours do not change the 48-hour calculation.

---

# 44. ADDITIONAL PAYMENT UNPAID

```text
Additional Payment Required

Complete the additional payment before completing this order.
```

---

# 45. PERMISSION ERROR

```text
Action Not Available

You don't have permission to perform this action.
```

Do not expose admin functionality.

---

# 46. SERVER ERROR

```text
Something went wrong

We couldn't complete this request.

Please try again.
```

Action:

```text
Retry
```

---

# 47. DESIGN SYSTEM DIRECTION

The Worker Portal must use the same PondFish visual language as the other product surfaces.

However, the worker interface may be denser because it is an operational tool.

---

## 47.1 Visual Character

Target:

- clean
- practical
- professional
- modern
- trustworthy
- compact
- high readability
- touch friendly

Avoid:

- excessive gradients
- decorative cards everywhere
- oversized hero sections
- excessive glassmorphism
- unnecessary animation
- excessive rounded containers
- visual clutter

---

# 48. COLOR USAGE

Color must communicate state rather than decoration.

Recommended semantic roles:

```text
Primary
→ Main actions

Success
→ Completed / successful

Warning
→ Attention required

Danger
→ Invalid / destructive / failed

Neutral
→ Informational / inactive

Muted
→ Secondary information
```

Do not rely on color alone.

Status labels and icons must accompany semantic colors.

---

# 49. BUTTON RULES

## Primary Button

Use for the current main action.

Examples:

```text
Open Booking
Complete Booking
Confirm Payment
Retry
```

---

## Secondary Button

Use for supporting actions.

Examples:

```text
Search
Back
Cancel
```

---

## Destructive Button

Use only for destructive actions.

Worker Portal should have very few destructive actions.

---

# 50. TOUCH TARGETS

All primary tablet controls must be comfortable for touch.

Avoid tiny:

- icons
- links
- checkboxes
- close buttons
- status controls

Important actions should be easy to tap even when the worker is moving quickly.

---

# 51. TYPOGRAPHY

Use clear hierarchy:

```text
Page title
Section title
Booking/customer name
Primary value
Supporting metadata
Helper text
Error text
```

Booking IDs and transaction IDs may use a slightly more technical style to improve scanning.

---

# 52. CARDS

Use cards for:

- booking summaries
- customer summaries
- operational counts
- transaction summaries

Do not place every small piece of information inside a separate card.

---

# 53. LIST DESIGN

Worker lists should prioritize scanning.

Example:

```text
PF-1024
Rahul Kumar
Rohu • 2 kg

Ready for Collection
Paid

Expires 7:30 PM

[Open]
```

Avoid long paragraphs inside list items.

---

# 54. MODALS

Use modals for:

- confirmation
- important warning
- short payment confirmation
- logout confirmation

Do not use modals for entire workflows when a dedicated page is clearer.

---

# 55. TOASTS

Toasts may be used for lightweight feedback.

Examples:

```text
Booking refreshed.
```

```text
Search cleared.
```

Critical financial/completion outcomes must not rely only on a toast.

---

# 56. ACCESSIBILITY

Worker UI must support:

- readable text
- sufficient contrast
- keyboard access on desktop
- visible focus
- accessible labels
- meaningful status text
- non-color-only status communication
- screen-reader labels for important controls

---

# 57. RESPONSIVE BEHAVIOR

Primary target:

```text
Tablet landscape
```

Secondary:

```text
Tablet portrait
Desktop
```

Do not allow critical booking data to become hidden on smaller layouts.

---

# 58. ORIENTATION

Landscape should be optimized for:

- dashboard
- booking list
- booking details
- bill review

Portrait should remain usable for:

- scanner
- simple search
- login

---

# 59. CAMERA UX

When scanning QR or capturing bills:

- request permission only when needed
- explain why permission is needed
- provide a fallback where supported
- allow retry
- show camera failure clearly
- never imply a scan was verified when it was only decoded locally

---

# 60. DATA FRESHNESS

Worker pages should refresh/revalidate when:

- page becomes active
- booking is opened after a long delay
- completion is attempted
- payment state is checked
- QR is scanned
- another worker may have changed the booking

Backend state is authoritative.

---

# 61. CONCURRENCY

Two workers may attempt to process the same booking.

The UI must handle this.

Example:

```text
This booking was updated by another worker.

Refresh to see the latest status.
```

The backend must prevent invalid duplicate completion.

---

# 62. IDEMPOTENCY

Critical operations must be safe to retry.

Examples:

- payment confirmation
- booking completion
- physical transaction finalization
- bill processing

A repeated request must not create a duplicate financial effect.

---

# 63. AUDITABILITY

Worker actions that affect operational or financial state should be traceable.

Relevant records include:

- worker ID
- action
- booking/transaction ID
- timestamp
- result
- payment reference where applicable

The worker does not manage audit logs directly.

---

# 64. BOOKING RETRIEVAL MASTER FLOW

```text
                 CUSTOMER ARRIVES
                       │
             ┌─────────┴─────────┐
             │                   │
          QR SCAN           MANUAL SEARCH
             │                   │
             └─────────┬─────────┘
                       ↓
                BOOKING RECORD
                       ↓
                VERIFY STATE
                       ↓
               VIEW DETAILS
                       ↓
               PREPARE FISH
                       ↓
              PAYMENT CHECK
                       ↓
             ADDITIONAL PAYMENT
              IF REQUIRED
                       ↓
                 HANDOVER
                       ↓
              COMPLETE ORDER
                       ↓
               QR INVALIDATED
                       ↓
             BOOKING COMPLETED
```

---

# 65. DIRECT BOOKING SELECTION FLOW

```text
Worker Opens Dashboard
        ↓
Search Name / Phone / Booking ID
        ↓
Select Pending Booking
        ↓
View Booking Details
        ↓
Fish Prepared
        ↓
Extra Payment if Required
        ↓
Fish Handed Over
        ↓
Complete Order
        ↓
QR Invalidated
        ↓
Booking Completed
```

Both QR retrieval and direct search must converge into the same completion process.

---

# 66. QR FLOW

```text
Customer
   ↓
Shows QR
   ↓
Worker scans
   ↓
Backend validates
   ↓
Booking opens
   ↓
Same booking fulfillment workflow
```

No separate completion logic should exist.

---

# 67. BOOKING EXPIRATION

## Rule

Booking validity:

```text
48 hours
```

starting from the exact successful booking creation time.

Store opening/closing hours do not change this calculation.

---

## Expired Booking UI

```text
Booking Expired

This booking is no longer available for collection.
```

The worker must not complete it.

---

# 68. CANCELLATION / EXPIRED BOOKING

The worker does not independently perform arbitrary cancellation.

If a booking is already cancelled or expired, the UI only reflects the backend state.

Do not show:

```text
Complete
```

for cancelled/expired bookings.

---

# 69. INVENTORY RULE

Worker completion is not an independent inventory deduction workflow.

For online bookings:

```text
Booking Success
      ↓
Inventory Reservation
      ↓
Worker Completion
      ↓
Reservation Consumed
```

The worker should not manually decrement general inventory from the Worker Portal.

---

# 70. CUSTOMER NOTIFICATION

After successful completion, customer-facing notification may be generated by the backend.

Worker does not manually send it.

Flow:

```text
Worker Completion
      ↓
Backend Commit
      ↓
Customer Notification
```

Notification failure must not invalidate an already successful financial/order transaction.

---

# 71. ADMIN SYNCHRONIZATION

After completion, Admin-facing operational data should update through backend state/realtime/query mechanisms.

Worker does not directly manipulate the Admin Portal.

---

# 72. REPORTING

Completed bookings and successful physical transactions become available to reporting.

Worker does not edit reporting records.

---

# 73. FILE UPLOAD RULES

For bill images:

- use secure upload endpoint
- show upload progress where relevant
- validate file type
- validate file size
- show upload failure
- allow retry
- avoid exposing private storage URLs directly

---

# 74. BILL IMAGE UPLOAD FAILURE

```text
Bill upload failed.

The bill has not been processed.

Please try again.
```

Actions:

```text
Retry
Choose Another Image
```

---

# 75. AI EXTRACTION TIMEOUT

```text
Bill processing is taking too long.

You can retry or capture the bill again.
```

Do not automatically create a transaction.

---

# 76. BILL DATA VALIDATION

Before financial processing, validate:

- Bill ID
- fish items
- quantities
- prices
- total where applicable

Any missing or suspicious field should require correction/confirmation according to backend rules.

---

# 77. DUPLICATE BILL PROTECTION

The backend must enforce successful Bill ID uniqueness.

Flow:

```text
Scan
 ↓
Extract
 ↓
Duplicate Check
 ├── Already Successful → Reject
 └── New → Continue
```

The UI must clearly show duplicate protection.

---

# 78. PAYMENT SECURITY

Worker UI must never treat:

- frontend callback
- client-side payment state
- local success state

as final proof of payment.

Backend verification is required.

---

# 79. MONEY DISPLAY

Use consistent currency formatting.

Example:

```text
₹1,250.00
```

Do not show floating-point artifacts.

Examples to avoid:

```text
₹1249.999999
```

The backend remains authoritative for monetary values.

---

# 80. DATE/TIME DISPLAY

Use local store timezone.

Show human-readable values:

```text
Today, 5:30 PM
```

rather than unnecessarily technical timestamps.

Detailed timestamp may be available in secondary information.

---

# 81. SEARCH PERFORMANCE

Search UI should:

- show loading
- prevent duplicate requests where possible
- debounce text search if appropriate
- handle empty input
- handle no results
- handle network errors
- preserve the search query during retry

---

# 82. REFRESH

Provide refresh behavior on major operational lists.

For critical booking pages, refresh/revalidation should occur before completion when appropriate.

---

# 83. STALE BOOKING

If a booking was open for a long time:

```text
Checking latest booking status...
```

Then retrieve fresh backend state.

Do not complete from stale frontend state.

---

# 84. ACTION VISIBILITY RULE

The frontend must derive available actions from backend state.

Example:

```text
READY_FOR_COLLECTION
→ Complete Booking

EXPIRED
→ No completion action

COMPLETED
→ View completed state

PAYMENT_REQUIRED
→ Payment action

PAYMENT_PENDING
→ Wait / refresh
```

---

# 85. DISABLED BUTTON RULE

Disabled actions should explain why where useful.

Example:

```text
Complete Booking
Disabled

Additional payment required
```

Avoid invisible disabled states with no explanation.

---

# 86. CONFIRMATION LANGUAGE

Use operational language.

Good:

```text
Complete Booking
```

Better confirmation:

```text
Confirm the fish has been handed over before completing this booking.
```

Avoid confusing language.

---

# 87. SUCCESS SCREEN CONSISTENCY

Successful booking completion:

```text
✓ Booking completed successfully.
QR ticket invalidated.
```

Successful transaction:

```text
✓ Transaction successful.
```

Payment success:

```text
✓ Payment verified.
```

Do not use one generic message for all success types.

---

# 88. FAILURE SCREEN CONSISTENCY

Every failure should identify the affected operation.

Examples:

```text
Booking completion failed.
```

```text
Payment verification failed.
```

```text
Bill processing failed.
```

```text
QR verification failed.
```

---

# 89. RETRY RULES

Retry should be available when:

- network failure
- temporary server failure
- failed data loading
- failed image upload
- failed AI processing

Retry should not blindly repeat an unknown payment/finalization request.

For uncertain financial state:

```text
Check Status
```

is safer than:

```text
Pay Again
```

---

# 90. OPERATIONAL TIME PRESSURE

The design should minimize:

- typing
- unnecessary confirmations
- long scrolling
- hidden actions
- multi-level menus
- decorative content

The worker should be able to process a normal booking quickly.

---

# 91. WORKER DASHBOARD QUICK ACTION PRIORITY

Recommended visual hierarchy:

```text
1. Active bookings
2. Search booking
3. Scan booking
4. Booking counts
5. Completed history
6. Profile
```

---

# 92. SEARCH-FIRST OPERATION

A worker who knows the Booking ID should not need to browse multiple pages.

Global/primary search should be accessible from the dashboard.

---

# 93. CUSTOMER ARRIVAL FLOW

```text
Customer arrives
      ↓
Worker asks for QR
      ↓
QR available?
  ┌───┴───┐
 YES      NO
  ↓        ↓
Scan     Search
  └───┬───┘
      ↓
Booking found
      ↓
Verify
      ↓
Prepare
      ↓
Payment check
      ↓
Handover
      ↓
Complete
```

---

# 94. QR UNAVAILABLE FALLBACK

If QR cannot be scanned:

```text
Use Booking ID / Name / Phone
```

The worker must not be blocked simply because the QR camera is unavailable.

---

# 95. WRONG CUSTOMER / WRONG BOOKING

The worker must verify:

- customer identity where operationally required
- booking details
- fish
- quantity
- payment status

If details do not match:

```text
Booking details do not match.

Please verify the customer's booking before continuing.
```

Do not complete.

---

# 96. PARTIAL FULFILLMENT

The worker must not invent a partial-completion workflow.

If the backend supports a specific quantity-change or substitution process, the UI must follow that backend workflow.

Otherwise:

```text
This booking cannot be completed with the current quantity.

Please contact the appropriate store/admin workflow.
```

---

# 97. REFUND / RESTORATION BOUNDARY

Worker should not independently process booking refunds or Subscription Credit restoration.

Those are controlled by backend/business workflows.

---

# 98. SUBSCRIPTION DISPLAY

Worker may need to see relevant subscription coverage/payment information for an order.

Display:

- subscription coverage
- covered quantity/value where applicable
- Subscription Credit impact where relevant
- amount due

Do not allow worker to modify subscription plans.

---

# 99. SUBSCRIPTION INSUFFICIENT CREDIT

If the backend reports insufficient Subscription Credit:

```text
Subscription Credit is insufficient for this transaction.

Amount due: ₹___
```

Follow the applicable payment workflow.

Do not let the frontend calculate a different result.

---

# 100. WEEKLY LIMIT DISPLAY

Where relevant:

```text
Weekly allowance
Used: 2 kg
Remaining: 1 kg
```

This is informational unless the backend requires an operational action.

---

# 101. WORKER TRANSACTION SAFETY

For every financial transaction:

```text
Calculate
 ↓
Display
 ↓
Confirm
 ↓
Pay
 ↓
Verify
 ↓
Finalize
```

Never:

```text
Click → show success → finalize later
```

---

# 102. REALTIME DATA

Realtime can be used for:

- booking changes
- successful transaction events
- operational updates

But realtime messages must not override backend authorization.

If realtime says a booking changed, the UI should retrieve authoritative state as required.

---

# 103. OFFLINE MODE

The current specification does not authorize a full offline fulfillment mode.

Therefore:

- do not allow completion while offline
- do not allow offline payment success
- do not queue financial operations locally without an explicitly approved architecture

Show a clear offline state.

---

# 104. OFFLINE SCREEN

```text
You're offline

Worker operations require an active connection.

Reconnect to continue.
```

Action:

```text
Retry Connection
```

---

# 105. SECURITY UI RULES

Never expose:

- API keys
- private storage credentials
- payment secrets
- admin controls
- raw backend stack traces

Do not expose internal database IDs unless they are part of the intended operational UI.

---

# 106. ERROR LOGGING

User-facing error:

```text
Unable to complete the order.
```

Internal logs may contain:

- request ID
- error code
- worker ID
- booking ID
- timestamp
- endpoint
- backend error classification

The worker should not see the raw technical trace.

---

# 107. REQUEST ID

For important failures, the UI may show a support reference:

```text
Reference: PF-REQ-8F32
```

This helps support teams without exposing technical details.

---

# 108. PERFORMANCE

The Worker Portal should prioritize fast initial load and fast navigation.

Optimize:

- booking list rendering
- image loading
- QR scanner startup
- bill image upload
- API requests
- state updates

Avoid unnecessary re-rendering of large booking lists.

---

# 109. TABLET MEMORY

Do not keep huge transaction histories in client memory.

Use pagination or server-side filtering.

---

# 110. BOOKING LIST PAGINATION

If the backend returns paginated results:

```text
Load more
```

or infinite scroll may be used.

Do not fetch an unbounded booking history.

---

# 111. IMAGE PREVIEW

Bill images should show a preview before upload where appropriate.

Controls:

```text
Retake
Remove
Continue
```

---

# 112. IMAGE UPLOAD PROGRESS

For large bill images:

```text
Uploading bill...
62%
```

If upload fails:

```text
Upload failed.
Retry
```

---

# 113. AI EXTRACTION PROGRESS

AI extraction should show meaningful progress without pretending exact internal progress.

Good:

```text
Reading bill...
```

Avoid fake:

```text
83% complete
```

unless the backend actually provides real progress.

---

# 114. ACCESSIBILITY OF STATUS

Do not communicate only:

```text
green = success
red = failed
```

Use:

```text
✓ Completed
⚠ Additional Payment Required
✕ Expired
```

Icons should be supported by text.

---

# 115. PRINTING

No worker-specific printing workflow is defined in the locked current scope.

Do not add printing requirements unless separately approved.

---

# 116. POS BOUNDARY

The current phase uses a tablet.

It is not a POS system.

Do not design the current worker portal around a POS terminal.

Future POS/weighing-machine integration remains separate future scope.

---

# 117. SI-801 BOUNDARY

The SI-801 weighing machine is not directly integrated with PondFish in the current phase.

The worker portal receives/processes the bill image rather than reading the weighing machine directly.

---

# 118. WORKER ROLE SECURITY

Every worker API call must be authorized server-side.

Frontend route hiding is not security.

---

# 119. ROUTE PROTECTION

Protected routes include:

```text
/worker
/worker/active
/worker/bookings
/worker/bookings/:id
/worker/completed
/worker/profile
```

Exact routing may be adjusted by implementation.

---

# 120. DEEP-LINK PROTECTION

Opening a protected booking URL without authentication must redirect to login.

Opening a booking that the worker cannot access must return permission/authorization handling.

---

# 121. BROWSER REFRESH

Refreshing a page must preserve the valid session when possible.

If session is invalid:

```text
Redirect to Login
```

---

# 122. BACK BUTTON

Browser back navigation must not cause:

- duplicate completion
- duplicate payment
- stale success state

After successful completion, returning to the previous form should show the latest backend state.

---

# 123. DUPLICATE SUBMISSION

For every critical button:

```text
first click
   ↓
processing
   ↓
button disabled
   ↓
backend response
```

Never allow rapid double-clicks to create duplicate requests with duplicate effects.

---

# 124. BOOKING COMPLETION BUTTON

Recommended label:

```text
Complete Booking
```

Do not use vague labels such as:

```text
Submit
Done
Continue
```

because the action is a meaningful business state change.

---

# 125. PAYMENT BUTTON

Recommended labels:

```text
Pay ₹500
```

or:

```text
Collect ₹500
```

depending on payment method.

The amount must be backend-authoritative.

---

# 126. SEARCH BUTTON

Search can be triggered by:

- Search button
- Enter key on keyboard

Do not repeatedly submit while the request is processing.

---

# 127. FILTERS

Filters should be easy to clear.

Example:

```text
Status: Pending
Date: Today

[ Clear Filters ]
```

---

# 128. BOOKING DETAIL PRIORITY

Information hierarchy:

```text
1. Booking status
2. Customer
3. Fish + quantity
4. Payment
5. Expiry
6. Secondary metadata
```

The worker should not need to search for the status.

---

# 129. PAYMENT PRIORITY

Payment information should be prominent when action is required.

Example:

```text
Additional Payment Required
₹120

[ Collect Payment ]
```

Do not bury it below unrelated information.

---

# 130. EXPIRY PRIORITY

If expiry is approaching, show it clearly.

Example:

```text
Expires in 2h 15m
```

Do not create alarming visual treatment without business need.

---

# 131. COMPLETED STATE

A completed booking should visually become read-only.

Example:

```text
✓ Completed

Completed at 5:42 PM
Completed by Alex
```

No completion button.

---

# 132. EXPIRED STATE

Example:

```text
Expired

This booking is no longer available for collection.
```

No completion button.

---

# 133. CANCELLED STATE

Example:

```text
Cancelled

This booking cannot be fulfilled.
```

No completion button.

---

# 134. PAYMENT PENDING STATE

Example:

```text
Payment verification pending

Please wait while the server confirms the payment.
```

Do not allow completion until authorized.

---

# 135. LOADING BOOKING DETAILS

Skeleton should represent:

- customer
- items
- payment
- status
- action

Avoid blank white page.

---

# 136. ERROR BOUNDARY

Unexpected frontend rendering errors should show:

```text
Something went wrong.

This page could not be displayed.

[ Try Again ]
```

Do not expose stack traces.

---

# 137. 404 WORKER PAGE

## Purpose

Handle unknown worker routes.

```text
404

Page not found

The page you're looking for doesn't exist.

[ Go to Active Orders ]
```

---

# 138. 403 WORKER PAGE

```text
Access restricted

You don't have permission to access this page.

[ Go to Active Orders ]
```

---

# 139. 500 WORKER PAGE

```text
Something went wrong

The PondFish service encountered a problem.

[ Try Again ]
```

---

# 140. MAINTENANCE PAGE

If the backend provides maintenance state:

```text
PondFish is temporarily unavailable

We're performing maintenance.

Please try again shortly.
```

---

# 141. NETWORK PAGE

```text
No connection

Check the tablet's internet connection.

[ Retry ]
```

---

# 142. CAMERA ERROR

```text
Camera unavailable

We couldn't access the camera.

You can search for the booking manually.
```

---

# 143. BILL UPLOAD ERROR

```text
Unable to upload the bill.

Check your connection and try again.
```

---

# 144. AI SERVICE ERROR

```text
Bill reading is temporarily unavailable.

You can try again or use the manual Bill ID workflow.
```

Only provide manual fallback where supported.

---

# 145. PAYMENT SERVICE ERROR

```text
Payment service unavailable.

Please try again shortly.
```

Do not label the payment as successful.

---

# 146. SUCCESS EVENT SAFETY

The TV/notification/reporting event must happen only after successful backend transaction commit.

The worker UI should not manually trigger these systems.

---

# 147. CUSTOMER NAME ON SUCCESS EVENT

The successful transaction event may contain customer name.

The worker should not need to manually enter the name into the TV system.

---

# 148. WORKER COMPLETION EVENT

For online booking:

```text
Complete Booking
       ↓
Backend Atomic Completion
       ↓
Booking Completed
       ↓
QR Invalidated
       ↓
Customer Updated
       ↓
Admin Updated
       ↓
Reporting Updated
```

---

# 149. OPERATIONAL HISTORY

Completed order history should allow workers to verify that an order was already fulfilled.

This helps avoid duplicate fulfillment.

---

# 150. COMPLETED ORDER LOOKUP

If a customer returns with an already completed QR:

```text
QR Scan
 ↓
Backend
 ↓
Already Completed
 ↓
Show completed information
```

Do not open the order as if it were pending.

---

# 151. WRONG QR

If QR belongs to another booking:

```text
This QR does not correspond to an active collection order.
```

The worker should be directed to verify the customer's booking.

---

# 152. MULTIPLE ACTIVE BOOKINGS

If a customer has multiple bookings:

```text
Select Booking

PF-1024 — Rohu 2 kg — Ready
PF-1041 — Pamplet 1 kg — Ready
```

The worker selects the correct booking.

Do not automatically choose based only on customer name.

---

# 153. SAME CUSTOMER MULTIPLE BOOKINGS

Search results must show enough information to distinguish bookings:

- Booking ID
- date/time
- fish
- quantity
- status
- expiry

---

# 154. SEARCH BY PHONE

Phone numbers should be displayed in a privacy-conscious format when not necessary to show the full number.

Search can still accept the full entered number.

---

# 155. SEARCH BY NAME

Support backend-defined name matching.

Do not implement a separate local customer database in the frontend.

---

# 156. SEARCH BY BOOKING ID

Booking ID should be treated as an exact/high-confidence identifier.

Show clear result if found.

---

# 157. SEARCH BY PAYMENT AMOUNT

Where supported by the backend, payment amount can be used as an additional retrieval/filtering criterion.

Do not make it the primary identifier.

---

# 158. BILL TRANSACTION CUSTOMER SELECTION

If a worker is processing a physical bill for a customer without a phone:

```text
Select Customer
      ↓
Capture Bill
      ↓
AI Processing
      ↓
Review
```

The worker should not create a new customer account from this workflow unless separately authorized.

---

# 159. BILL REVIEW — HUMAN CONFIRMATION

The worker should be able to clearly distinguish:

```text
AI extracted value
```

from:

```text
backend-confirmed/final transaction value
```

The UI should not imply that AI output is automatically final.

---

# 160. TRANSACTION SUMMARY

Before final payment/finalization show:

```text
Customer
Bill ID
Items
Quantity
Discount
Subscription coverage
Credit deduction
Amount due
Payment method
```

---

# 161. TRANSACTION FINAL ACTION

Use a specific label:

```text
Confirm Transaction
```

or:

```text
Complete Payment
```

depending on the exact workflow.

Do not use:

```text
Submit
```

---

# 162. CASH CONFIRMATION

Before finalizing cash:

```text
Confirm cash received?

Amount due: ₹700
Cash received: ₹1,000
Change: ₹300

[ Cancel ] [ Confirm Cash ]
```

---

# 163. CASH FINALIZATION

After backend confirmation:

```text
✓ Cash transaction completed
```

Store:

- worker ID
- cash amount
- transaction
- timestamp

---

# 164. TRANSACTION TV TRIGGER

Only successful finalization triggers the TV event.

```text
Transaction Finalized
       ↓
Successful Transaction Event
       ↓
TV Display
```

Failed/pending transactions do not appear as successful TV transactions.

---

# 165. TV SOUND RELATIONSHIP

The TV portal is responsible for its own sound notification.

The worker portal should not play the TV's success sound as a substitute for the TV event.

---

# 166. WORKER NOTIFICATION

The Worker Portal may show local UI feedback for completion.

Example:

```text
✓ Order completed
```

The customer and TV notification mechanisms remain backend-driven.

---

# 167. STATE MACHINE

## Booking

```text
CREATED
   ↓
ACTIVE
   ↓
READY_FOR_COLLECTION
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

Alternative terminal states:

```text
EXPIRED
CANCELLED
```

Exact backend states are authoritative.

---

# 168. PAYMENT STATE

Conceptual states:

```text
NOT_REQUIRED
PENDING
PAID
FAILED
```

Frontend must map actual API states rather than inventing new financial states.

---

# 169. QR STATE

```text
GENERATED
VALID
INVALID
```

After successful completion:

```text
VALID → INVALID
```

---

# 170. PHYSICAL TRANSACTION STATE

Conceptual flow:

```text
BILL_CAPTURED
      ↓
EXTRACTED
      ↓
REVIEWED
      ↓
CALCULATED
      ↓
PAYMENT
      ↓
VERIFIED
      ↓
FINALIZED
      ↓
SUCCESS EVENT
```

---

# 171. PAGE INVENTORY

The Worker Portal page inventory is:

```text
WP-01 Worker Login
WP-02 Active Orders / Dashboard
WP-03 Booking Queue
WP-04 Booking Search
WP-05 QR Scanner
WP-06 Booking Details
WP-07 Prepare Order
WP-08 Additional Payment
WP-09 Handover
WP-10 Complete Booking
WP-11 QR State
WP-12 Completed Orders
WP-13 Customer Search
WP-14 Bill Capture
WP-15 AI Bill Processing
WP-16 AI Bill Review
WP-17 Manual Bill ID
WP-18 Payment Calculation
WP-19 Cash Payment
WP-20 Physical Transaction Finalization
WP-21 Transaction Success
WP-22 Transaction Failure
WP-23 Worker Profile
WP-24 Logout
WP-25 404
WP-26 403
WP-27 500
WP-28 Maintenance
WP-29 Network Error
WP-30 Camera Error
WP-31 Bill Upload Error
WP-32 AI Service Error
WP-33 Payment Service Error
```

Some of these can be modal/state variations rather than separate routes.

---

# 172. COMPONENT INVENTORY

Reusable worker components should include:

```text
WorkerShell
WorkerHeader
WorkerNavigation
WorkerProfileMenu
PageHeader
StatusBadge
BookingCard
BookingList
BookingSummary
CustomerSummary
PaymentSummary
SubscriptionSummary
ExpiryIndicator
SearchInput
SearchResults
FilterBar
QRCodeScanner
CameraPermissionPrompt
BillCapture
BillPreview
BillExtractionReview
PaymentSummary
CashCollection
ConfirmationModal
SuccessState
ErrorState
EmptyState
LoadingSkeleton
NetworkError
PermissionError
RetryButton
Toast
```

---

# 173. FEATURE MODULE STRUCTURE

Recommended frontend feature grouping:

```text
features/
  auth/
  dashboard/
  bookings/
  booking-search/
  qr-scanner/
  booking-completion/
  customers/
  bill-processing/
  ai-review/
  payments/
  transactions/
  completed-orders/
  profile/
```

---

# 174. SHARED SERVICES

Use shared services for:

- API client
- authentication
- session
- error mapping
- date formatting
- currency formatting
- upload
- QR handling
- permission checks
- realtime events

---

# 175. API RULE

Components must not construct arbitrary HTTP requests.

Use a centralized API/service layer.

---

# 176. ERROR MAPPING

Backend error codes should map to human-readable worker messages.

Example:

```text
BOOKING_EXPIRED
→ Booking Expired

BOOKING_ALREADY_COMPLETED
→ Order Already Completed

INVALID_QR
→ Invalid QR

ADDITIONAL_PAYMENT_REQUIRED
→ Additional Payment Required

NETWORK_ERROR
→ Connection unavailable
```

---

# 177. REQUEST STATES

Every API operation should model:

```text
idle
loading
success
error
```

Critical operations may additionally require:

```text
pending_verification
```

---

# 178. FORM VALIDATION

Frontend validation is for user experience.

Backend validation is authoritative.

Never remove backend validation because the frontend already validates.

---

# 179. SECURITY OF WORKER DATA

Do not store sensitive payment information unnecessarily in local browser storage.

Use secure session mechanisms appropriate to the architecture.

---

# 180. AUTO REFRESH

Do not use aggressive polling unless required.

Prefer:

- backend-supported realtime
- targeted refresh
- event-driven updates

---

# 181. REFRESH AFTER COMPLETION

After successful completion:

1. show success
2. update local UI
3. invalidate stale booking query
4. update dashboard counts
5. move booking to completed list where applicable

---

# 182. REFRESH AFTER PAYMENT

After payment:

1. retrieve authoritative payment state
2. update transaction summary
3. enable next action only after verification

---

# 183. REFRESH AFTER SEARCH

If a search result is opened after a delay, revalidate before critical action.

---

# 184. ERROR RECOVERY PHILOSOPHY

The worker should never be left asking:

> Did it work?

The interface should answer through backend-confirmed state.

If uncertain:

```text
Checking status...
```

rather than guessing.

---

# 185. CRITICAL SAFETY RULE

Never display a successful financial/order state because:

- a button was clicked
- an animation finished
- the network request was started
- a payment SDK returned a local callback
- AI extraction completed

Success requires backend confirmation.

---

# 186. AI CODING AGENT RULES

An AI coding agent implementing this portal must:

1. Read the Master PRD.
2. Read the backend/API architecture.
3. Read the frontend architecture.
4. Read this Worker Portal specification.
5. Reuse shared types and API contracts.
6. Never invent business rules.
7. Never invent endpoints.
8. Never bypass backend validation.
9. Implement all required UI states.
10. Preserve worker permission boundaries.
11. Implement responsive tablet behavior.
12. Keep financial operations idempotent.
13. Keep booking completion authoritative.
14. Never treat AI extraction as final.
15. Never treat frontend payment callback as final.
16. Never silently ignore API errors.
17. Never create duplicate QR/completion workflows.
18. Never add unsupported admin features to the worker portal.

---

# 187. STITCH / UI GENERATION RULES

When generating Worker Portal UI:

### Do

- generate tablet-first layouts
- use operational cards
- use compact lists
- use large touch targets
- use clear status badges
- use strong information hierarchy
- use realistic booking data
- include loading/empty/error states
- include scanner states
- include payment states
- include bill-review states

### Do not

- create a marketing dashboard
- use huge hero sections
- fill the screen with decorative graphics
- overuse gradients
- overuse glassmorphism
- create tiny buttons
- hide critical actions
- invent analytics
- invent worker permissions

---

# 188. UI REVIEW CHECKLIST

Before approving a page ask:

### Purpose

- Is the purpose obvious?

### Action

- Is the next action obvious?

### Status

- Can the worker understand the current state immediately?

### Data

- Is only required data displayed?

### Error

- Does failure explain what happened?

### Recovery

- Is there a clear recovery action?

### Touch

- Are controls comfortable on a tablet?

### Backend

- Is the displayed state authoritative?

### Security

- Can the worker access only authorized functions?

---

# 189. PAGE ACCEPTANCE STANDARD

Every important page must document:

- Purpose
- Access
- Entry
- Displayed data
- Actions
- Workflow
- Validation
- Loading
- Empty
- Success
- Error
- Retry
- Permission
- Backend dependency
- Audit requirement
- Edge cases
- Acceptance criteria

---

# 190. WORKER PORTAL MASTER ACCEPTANCE CHECKLIST

## Authentication

- [ ] Worker can log in
- [ ] Invalid credentials handled
- [ ] Disabled worker blocked
- [ ] Session expiry handled
- [ ] Logout works

## Dashboard

- [ ] Active bookings load
- [ ] Counts are backend-driven
- [ ] Search accessible
- [ ] QR scan accessible
- [ ] Empty state works
- [ ] Network error works

## Booking Retrieval

- [ ] QR works
- [ ] Manual search works
- [ ] Booking ID search works
- [ ] Name search works
- [ ] Phone search works
- [ ] Both paths open the same booking model

## Booking Validation

- [ ] Invalid QR handled
- [ ] Expired booking handled
- [ ] Cancelled booking handled
- [ ] Completed booking handled
- [ ] Stale state revalidated
- [ ] Concurrent update handled

## Fulfillment

- [ ] Booking details clear
- [ ] Preparation information clear
- [ ] Payment state clear
- [ ] Handover step clear
- [ ] Completion confirmation clear

## Completion

- [ ] Completion requires backend authorization
- [ ] Duplicate click prevented
- [ ] Backend success displayed
- [ ] QR invalidated
- [ ] Completed state displayed
- [ ] Error handled
- [ ] Retry safe

## Bill Processing

- [ ] Bill capture works
- [ ] Upload works
- [ ] AI extraction state works
- [ ] AI failure works
- [ ] Review works
- [ ] Manual Bill ID works
- [ ] Duplicate Bill ID protected
- [ ] Human confirmation required

## Payments

- [ ] Payment amount backend-driven
- [ ] Additional payment handled
- [ ] Cash flow handled
- [ ] Payment failure handled
- [ ] Payment pending handled
- [ ] Server verification required
- [ ] Duplicate payment risk controlled

## Transaction

- [ ] Atomic finalization respected
- [ ] Worker linked
- [ ] Successful event generated by backend
- [ ] TV receives successful event
- [ ] Customer notification remains backend-driven
- [ ] Reporting updated

## Security

- [ ] Worker permissions enforced
- [ ] Admin features hidden
- [ ] API authorization enforced
- [ ] Sensitive data protected
- [ ] Raw errors hidden

## UX

- [ ] Tablet-first
- [ ] Touch-friendly
- [ ] Clear statuses
- [ ] Consistent colors
- [ ] Clear errors
- [ ] Clear success
- [ ] No unnecessary decorative UI
- [ ] No duplicate workflows

---

# 191. COMPLETE WORKER JOURNEY

```text
WORKER OPENS PORTAL
        ↓
LOGIN
        ↓
ACTIVE ORDERS
        ↓
CUSTOMER ARRIVES
        ↓
┌───────────────────────────────┐
│ QR AVAILABLE?                 │
└───────────────┬───────────────┘
                │
       ┌────────┴────────┐
       │                 │
      YES                NO
       │                 │
    SCAN QR           SEARCH
       │                 │
       └────────┬────────┘
                ↓
         BOOKING DETAILS
                ↓
        VERIFY BACKEND STATE
                ↓
          PREPARE FISH
                ↓
         PAYMENT CHECK
                ↓
       ADDITIONAL PAYMENT?
          ┌─────┴─────┐
         YES          NO
          │            │
       PAYMENT         │
          │            │
          └─────┬──────┘
                ↓
            HANDOVER
                ↓
        COMPLETE BOOKING
                ↓
       BACKEND CONFIRMS
                ↓
        QR INVALIDATED
                ↓
       BOOKING COMPLETED
                ↓
    CUSTOMER NOTIFICATION
                ↓
       ADMIN UPDATED
                ↓
        REPORTING UPDATED
```

---

# 192. PHYSICAL TRANSACTION JOURNEY

```text
CUSTOMER WITHOUT PHONE
        ↓
SELECT / FIND CUSTOMER
        ↓
CAPTURE BILL
        ↓
UPLOAD IMAGE
        ↓
AI EXTRACTION
        ↓
HUMAN REVIEW
        ↓
DUPLICATE BILL CHECK
        ↓
SUBSCRIPTION CALCULATION
        ↓
PAYMENT CALCULATION
        ↓
PAYMENT / CASH
        ↓
SERVER VERIFICATION
        ↓
ATOMIC FINALIZATION
        ↓
SUCCESSFUL TRANSACTION
        ↓
TV EVENT
        ↓
CUSTOMER NOTIFICATION
        ↓
REPORTING
```

---

# 193. CROSS-PORTAL CONTRACT

Worker Portal interacts with:

```text
Customer App
      ↕
Backend
      ↕
Worker Portal
      ↕
Admin Portal
      ↕
Transaction TV
```

The backend remains the shared source of truth.

---

# 194. NO FRONTEND BUSINESS-LOGIC DUPLICATION

The Worker Portal must not maintain separate logic for:

- inventory
- subscription calculation
- payment verification
- booking validity
- transaction finalization

It only presents backend results and sends authorized commands.

---

# 195. DESIGN HANDOFF REQUIREMENTS

For each Worker Portal page, design files should include:

- default state
- loading state
- empty state
- success state
- validation error
- business error
- network error
- permission error where applicable
- mobile/tablet responsive behavior
- modal states
- hover/focus where relevant
- disabled button state

---

# 196. COMPONENT STATES REQUIRED FOR DESIGN

### Button

```text
Default
Hover
Pressed
Loading
Disabled
Success where applicable
```

### Input

```text
Default
Focused
Filled
Error
Disabled
Read-only
```

### Booking Card

```text
Pending
Ready
Payment Required
Completed
Expired
Cancelled
```

### Search

```text
Idle
Loading
Results
No Results
Error
```

---

# 197. FINAL WORKER PORTAL PRINCIPLE

The Worker Portal should feel like a tool built for a store worker, not a generic admin dashboard.

The core experience is:

```text
Find
→ Verify
→ Prepare
→ Pay if needed
→ Handover
→ Complete
```

Everything else should support this flow without distracting from it.

---

# 198. NEXT ARTIFACT

After this Worker Tablet Portal specification, continue in the locked sequence:

```text
Worker Tablet Portal
        ↓
Shop Transaction TV
        ↓
Admin Portal
        ↓
Core Business Engines
        ↓
Integrations
        ↓
Cross-System Validation / Error Specification
        ↓
QA / Test Specification
        ↓
Deployment Specification
        ↓
Master AI Coding Prompt
```

The polished Worker UI should be designed after the relevant PRD/page specification is locked and before final implementation.

---

# 199. DOCUMENT COMPLETION CHECK

This Worker Tablet Portal document is considered ready for the next portal when:

- [x] Worker responsibilities documented
- [x] Worker boundaries documented
- [x] Tablet-first UX documented
- [x] Authentication documented
- [x] Dashboard documented
- [x] Booking queue documented
- [x] Search documented
- [x] QR retrieval documented
- [x] Booking details documented
- [x] Preparation documented
- [x] Additional payment documented
- [x] Handover documented
- [x] Completion documented
- [x] QR invalidation documented
- [x] Completed orders documented
- [x] Customer search documented
- [x] Bill capture documented
- [x] AI extraction documented
- [x] AI review documented
- [x] Manual Bill ID documented
- [x] Payment calculation documented
- [x] Cash workflow documented
- [x] Transaction finalization documented
- [x] Success/error states documented
- [x] Network states documented
- [x] Permission states documented
- [x] 404/403/500 states documented
- [x] Camera states documented
- [x] Security boundaries documented
- [x] Concurrency documented
- [x] Idempotency documented
- [x] TV integration relationship documented
- [x] Customer notification relationship documented
- [x] Admin synchronization documented
- [x] Reporting relationship documented
- [x] AI coding rules documented
- [x] Stitch/UI generation rules documented
- [x] Acceptance checklist documented
- [x] Complete worker journeys documented

---

# END OF WORKER TABLET PORTAL SPECIFICATION
