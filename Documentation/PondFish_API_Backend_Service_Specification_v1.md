# PONDFISH --- API & BACKEND SERVICE SPECIFICATION

**Version:** 1.0\
**Status:** Implementation Baseline\
**Purpose:** Define the backend API, service boundaries,
request/response contracts, validation, authorization, payment,
realtime, AI, booking, inventory, subscription, GPS and notification
workflows.

------------------------------------------------------------------------

# 1. Document Purpose

This document translates the locked PondFish PRD, system architecture
and database model into an implementation-oriented backend
specification.

It defines:

-   API organization
-   Authentication
-   Authorization
-   Service boundaries
-   Endpoint conventions
-   Request validation
-   Response conventions
-   Error handling
-   Customer APIs
-   Worker APIs
-   Admin APIs
-   Public website APIs
-   Subscription APIs
-   Inventory APIs
-   Booking APIs
-   Bill scanning and AI extraction APIs
-   Transaction APIs
-   Razorpay APIs
-   Cash-payment APIs
-   TV realtime APIs
-   OneLap GPS APIs
-   Notification APIs
-   Webhooks
-   Idempotency
-   Audit requirements
-   Transactional boundaries
-   Background jobs
-   Security
-   Observability
-   Acceptance criteria

The API is the controlled interface between all clients and the backend
business logic.

------------------------------------------------------------------------

# 2. Locked Application Structure

PondFish consists of:

``` text
1. Public Website
2. Customer Mobile Application
3. Worker Web Application / Tablet Portal
4. Admin Web Application
5. Transaction TV Display Portal
```

All applications communicate with the same backend.

The Customer Application is planned as a React Native native mobile
application.

Worker, Admin and TV are web applications.

------------------------------------------------------------------------

# 3. Backend Architecture

Recommended logical structure:

``` text
Clients
  │
  ▼
API Gateway / Backend
  │
  ├── Authentication Service
  ├── Customer Service
  ├── Catalogue Service
  ├── Inventory Service
  ├── Subscription Service
  ├── Booking Service
  ├── Bill / AI Service
  ├── Transaction Service
  ├── Payment Service
  ├── GPS Service
  ├── Notification Service
  ├── Realtime/Event Service
  └── Audit Service
        │
        ▼
     Database
        │
        ├── File Storage
        ├── Razorpay
        ├── OneLap
        ├── AI/OCR provider
        └── Notification providers
```

For the initial implementation, these can be implemented as modules in
one backend application rather than separate microservices.

------------------------------------------------------------------------

# 4. API Base Convention

Example:

``` text
/api/v1
```

All production APIs should be versioned.

Example:

``` text
GET /api/v1/fish
POST /api/v1/bookings
GET /api/v1/transactions/{id}
```

------------------------------------------------------------------------

# 5. Response Convention

## 5.1 Success

``` json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

## 5.2 Error

``` json
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

The frontend must never depend only on human-readable messages.

It should use stable error codes.

------------------------------------------------------------------------

# 6. HTTP Status Convention

  Status   Meaning
  -------- -----------------------------------
  200      Successful request
  201      Resource created
  202      Accepted for async processing
  204      Successful operation with no body
  400      Invalid request
  401      Authentication required/invalid
  403      Permission denied
  404      Resource not found
  409      Conflict
  422      Business validation failure
  429      Rate limit
  500      Internal error
  502      External provider failure
  503      Service temporarily unavailable

------------------------------------------------------------------------

# 7. Authentication

## Customer

Customer authentication:

``` text
Mobile number
   ↓
OTP
   ↓
OTP verification
   ↓
Access token
```

No customer password.

## Worker

``` text
Email + password
```

Credentials are created/managed by Admin.

## Admin

``` text
Email + password
```

Admin accounts are managed securely.

## TV

TV is a read-only controlled client and must use a restricted
authentication mechanism.

It must never receive admin privileges.

------------------------------------------------------------------------

# 8. Token Rules

Access tokens must be:

-   Short-lived
-   Securely stored by clients
-   Validated server-side
-   Revocable through session/token management where required

Refresh tokens, if used, must be stored securely and rotated according
to implementation policy.

------------------------------------------------------------------------

# 9. RBAC

Roles:

``` text
CUSTOMER
WORKER
ADMIN
TV
```

Example:

``` text
CUSTOMER
→ own profile
→ own subscription
→ own bookings
→ own transactions
→ permitted GPS tracking

WORKER
→ bookings
→ customer lookup
→ bill processing
→ physical transactions
→ cash payment
→ operational views

ADMIN
→ complete operational management

TV
→ successful transaction display only
```

------------------------------------------------------------------------

# 10. Public Website APIs

## GET /api/v1/public/categories

Returns active categories.

## GET /api/v1/public/fish

Returns publicly visible fish.

Supported filters:

``` text
category
availability
discount
search
```

## GET /api/v1/public/fish/{id}

Returns public fish details.

## GET /api/v1/public/discounts

Returns currently active/scheduled public discounts where appropriate.

### Security

No customer/private information is exposed.

------------------------------------------------------------------------

# 11. Customer Profile APIs

## GET /api/v1/customer/profile

Returns:

``` text
name
mobile
age
area
status
```

## PATCH /api/v1/customer/profile

Updates permitted profile fields.

### Errors

``` text
CUSTOMER_NOT_FOUND
INVALID_PROFILE_DATA
UNAUTHORIZED
```

------------------------------------------------------------------------

# 12. Customer Catalogue APIs

## GET /api/v1/customer/categories

Returns categories.

## GET /api/v1/customer/fish

Filters:

``` text
category_id
search
online_bookable
availability
discount
```

## GET /api/v1/customer/fish/{id}

Returns:

-   Fish information
-   Current price
-   Online booking eligibility
-   Applicable discount
-   Availability status

The API must distinguish physical availability from online booking
eligibility.

------------------------------------------------------------------------

# 13. Customer Cart APIs

Cart is allowed only for online-bookable fish.

## POST /api/v1/customer/cart/items

Request:

``` json
{
  "fish_id": "uuid",
  "quantity": 2
}
```

## GET /api/v1/customer/cart

Returns current cart.

## PATCH /api/v1/customer/cart/items/{id}

Updates quantity.

## DELETE /api/v1/customer/cart/items/{id}

Removes item.

### Validation

Reject:

``` text
FISH_NOT_ONLINE_BOOKABLE
FISH_UNAVAILABLE
INVALID_QUANTITY
```

Cart validation must run again at checkout.

------------------------------------------------------------------------

# 14. Subscription APIs

## GET /api/v1/customer/subscription

Returns active subscription.

## GET /api/v1/customer/subscription/history

Returns previous subscriptions.

## GET /api/v1/customer/subscription/ledger

Returns credit movements.

## GET /api/v1/customer/subscription/usage

Returns weekly quantity usage.

## GET /api/v1/customer/subscription/plans

Returns available plans.

------------------------------------------------------------------------

# 15. Subscription Purchase

## POST /api/v1/customer/subscription/purchase

Creates an online subscription purchase.

Request:

``` json
{
  "plan_id": "uuid"
}
```

Response may create a Razorpay order.

``` json
{
  "success": true,
  "data": {
    "order_id": "order_xxx",
    "amount": 5000
  }
}
```

The backend remains authoritative for price.

The client cannot submit its own final amount.

------------------------------------------------------------------------

# 16. Admin Subscription Assignment

## POST /api/v1/admin/subscriptions/assign

Request:

``` json
{
  "customer_id": "uuid",
  "plan_id": "uuid",
  "payment_method": "CASH"
}
```

Supported sources:

``` text
CASH
RAZORPAY
```

The system adds the subscription credit according to the locked
subscription rules.

------------------------------------------------------------------------

# 17. Subscription Calculation Engine

The backend must calculate:

``` text
weekly quantity remaining
+
subscription credit remaining
+
fish eligibility
```

It must not simply check one condition.

Example:

``` text
Customer wants 3 kg.

Eligible quantity = 2 kg
Credit available = ₹1,000

If eligible quantity has insufficient credit:

Use available credit
+
calculate remaining amount
```

The calculation result must clearly expose:

``` text
requested quantity
subscription-covered quantity
subscription-covered amount
extra quantity
extra amount
remaining subscription credit
remaining weekly quantity
```

------------------------------------------------------------------------

# 18. Bill Scan Workflow

The bill scan workflow is one of the primary new workflows.

``` text
Scan Bill
 ↓
Upload Image
 ↓
AI Extraction
 ↓
Bill ID Detection
 ↓
Fish Matching
 ↓
Quantity/Price Extraction
 ↓
Customer Identification
 ↓
Subscription Calculation
 ↓
Tax/Fee Calculation
 ↓
Customer/Worker Confirmation
 ↓
Payment
 ↓
Transaction Success
 ↓
TV Realtime Event
```

------------------------------------------------------------------------

# 19. Customer Bill Scan API

## POST /api/v1/customer/bills/scan

Multipart upload.

Request:

``` text
bill_image
```

Response:

``` json
{
  "scan_id": "uuid",
  "status": "REVIEW_REQUIRED"
}
```

AI processing may be asynchronous.

------------------------------------------------------------------------

# 20. Bill Extraction API

## GET /api/v1/customer/bills/scans/{scan_id}

Returns:

``` text
bill number
fish items
quantities
prices
total
confidence
extraction warnings
```

If Bill ID cannot be extracted:

``` text
bill_number_missing = true
```

The UI must request manual Bill ID entry.

------------------------------------------------------------------------

# 21. Manual Bill ID

## POST /api/v1/bills/scans/{scan_id}/bill-number

Request:

``` json
{
  "bill_number": "BILL-12345"
}
```

Backend verifies the supplied ID.

------------------------------------------------------------------------

# 22. Bill Confirmation

The extracted information must be displayed before payment.

Customer/Worker must be able to verify:

``` text
Bill number
Fish name
Quantity
Unit price
Line total
Total bill
Subscription quantity
Subscription amount
Extra quantity
Extra amount
Tax/fee
Final payable amount
```

Correction must happen before transaction finalization.

------------------------------------------------------------------------

# 23. Duplicate Bill Protection

## POST /api/v1/bills/scans/{scan_id}/confirm

Before processing:

``` text
Check bill number
 ↓
Search existing processed bill
 ↓
If already processed
    reject
Else
    continue
```

Error:

``` text
BILL_ALREADY_PROCESSED
```

The database unique constraint is the final protection.

------------------------------------------------------------------------

# 24. Customer Payment Selection

For remaining payable amount:

``` text
RAZORPAY
```

is available to the customer.

Cash is not exposed to the customer as a customer-side payment option.

Cash is available through Worker Portal physical-store processing when
permitted by the locked workflow.

------------------------------------------------------------------------

# 25. Worker Customer Lookup

## GET /api/v1/worker/customers

Search by:

``` text
customer name
phone number
customer ID
```

Worker can select the customer when the customer has no phone.

------------------------------------------------------------------------

# 26. Worker Bill Scan

## POST /api/v1/worker/bills/scan

Request:

``` text
bill_image
customer_id
```

The same AI extraction and subscription calculation engine is used.

Worker can select:

``` text
RAZORPAY
CASH
```

for the remaining payable amount according to business rules.

------------------------------------------------------------------------

# 27. Transaction Preview API

## POST /api/v1/transactions/preview

Input:

``` text
customer
bill
fish items
```

The backend calculates:

``` text
gross amount
discount
eligible subscription quantity
weekly quantity remaining
subscription amount
remaining subscription credit
extra quantity
extra amount
Razorpay charges
GST on applicable gateway charges
final amount
```

No financial state is committed by preview.

------------------------------------------------------------------------

# 28. Razorpay Fee Calculation

The locked business assumption is:

``` text
Razorpay charge = 2%
GST on Razorpay charge = 18%
```

The exact provider configuration must remain configurable.

Example:

``` text
Base payable = ₹1000

Gateway fee = ₹20
GST on gateway fee = ₹3.60

Total = ₹1023.60
```

The backend must calculate this before presenting final payment.

The authoritative Razorpay amount must be generated server-side.

------------------------------------------------------------------------

# 29. Razorpay Order Creation

## POST /api/v1/payments/razorpay/orders

Request references the transaction/payment intent.

Backend:

``` text
Validate transaction
 ↓
Calculate amount
 ↓
Create Razorpay order
 ↓
Store provider order ID
 ↓
Return checkout information
```

Client must not directly decide the payable amount.

------------------------------------------------------------------------

# 30. Razorpay Verification

## POST /api/v1/payments/razorpay/verify

Request contains provider verification information.

Backend verifies using the official server-side mechanism.

Only after verification:

``` text
Payment = SUCCESS
Transaction = SUCCESSFUL
```

Client-side success alone is not sufficient.

------------------------------------------------------------------------

# 31. Razorpay Webhook

## POST /api/v1/webhooks/razorpay

Webhook processing:

``` text
Receive
 ↓
Verify signature
 ↓
Check idempotency
 ↓
Find payment
 ↓
Update payment
 ↓
Finalize transaction if appropriate
 ↓
Create domain event
 ↓
Return success
```

Duplicate webhook delivery must not duplicate transactions.

------------------------------------------------------------------------

# 32. Cash Payment

Cash is processed only from authorized Worker/Admin workflows.

Example:

``` text
Worker selects customer
 ↓
Bill scan
 ↓
Preview
 ↓
Cash selected
 ↓
Worker confirms cash received
 ↓
Transaction successful
```

Record:

``` text
worker_id
payment_method = CASH
amount
transaction_id
timestamp
```

------------------------------------------------------------------------

# 33. Transaction Finalization

All transaction completion must execute through one transaction service.

``` text
Validate
 ↓
Lock bill
 ↓
Lock inventory
 ↓
Lock subscription
 ↓
Recalculate
 ↓
Process payment
 ↓
Create transaction
 ↓
Deduct inventory
 ↓
Deduct subscription
 ↓
Create ledgers
 ↓
Mark bill processed
 ↓
Create TV event
 ↓
Create notifications if required
 ↓
Audit
 ↓
Commit
```

------------------------------------------------------------------------

# 34. Inventory APIs

## GET /api/v1/inventory

Admin/authorized worker view.

## GET /api/v1/inventory/{fish_id}

Returns:

``` text
physical quantity
reserved quantity
available quantity
freshness
```

## PATCH /api/v1/admin/inventory/{fish_id}

Manual inventory adjustment.

Every adjustment must create an inventory ledger entry.

------------------------------------------------------------------------

# 35. Fish Freshness APIs

## GET /api/v1/admin/fish/{fish_id}/freshness

## PATCH /api/v1/admin/fish/{fish_id}/freshness

Admin can configure:

``` text
green duration
grey duration
red duration
```

The system automatically calculates status from batch receipt time.

------------------------------------------------------------------------

# 36. Discount APIs

## POST /api/v1/admin/discounts

Creates campaign.

## PATCH /api/v1/admin/discounts/{id}

Updates campaign.

## POST /api/v1/admin/discounts/{id}/activate

Activates scheduled campaign.

## POST /api/v1/admin/discounts/{id}/cancel

Cancels campaign.

Flash/scheduled discounts must have explicit start and end times.

------------------------------------------------------------------------

# 37. Booking APIs

## POST /api/v1/customer/bookings

Creates online booking.

## GET /api/v1/customer/bookings

Customer booking history.

## GET /api/v1/customer/bookings/{id}

Booking details.

## POST /api/v1/customer/bookings/{id}/cancel

Cancellation.

## GET /api/v1/worker/bookings/today

Worker's daily booking list.

## GET /api/v1/worker/bookings/search

Search by:

``` text
booking ID
customer name
phone
total payment amount
```

------------------------------------------------------------------------

# 38. Booking Inventory Reservation

At booking confirmation:

``` text
Validate stock
 ↓
Reserve quantity
 ↓
Create reservation ledger
 ↓
Confirm booking
```

Reserved stock cannot be sold as unrestricted available stock.

------------------------------------------------------------------------

# 39. Booking Cancellation

Cancellation restores:

``` text
inventory reservation
subscription quantity
subscription credit
eligible Razorpay-paid amount → subscription credit
```

Cancellation must not charge the customer a cancellation fee.

The restoration must be recorded in ledgers.

------------------------------------------------------------------------

# 40. Online Booking Completion

Only online booking orders require Worker completion.

Flow:

``` text
Booking confirmed
 ↓
Customer arrives
 ↓
Worker retrieves booking
 ↓
Worker prepares order
 ↓
Worker marks booking completed
```

Physical scan-bill purchases do not require a separate completion step.

------------------------------------------------------------------------

# 41. Customer Transaction History

## GET /api/v1/customer/transactions

Filters:

``` text
date
status
type
```

## GET /api/v1/customer/transactions/{id}

Returns digital transaction receipt.

------------------------------------------------------------------------

# 42. Worker Transaction APIs

## GET /api/v1/worker/transactions

Filters:

``` text
date
status
customer
payment method
```

## GET /api/v1/worker/transactions/{id}

Returns operational transaction information.

------------------------------------------------------------------------

# 43. Admin Transaction Logs

## GET /api/v1/admin/transactions

Must support:

``` text
successful
failed
pending
cancelled
```

Filters:

``` text
date
customer
worker
transaction type
payment method
status
```

This fulfills the locked CP-11 requirement.

------------------------------------------------------------------------

# 44. Admin Booking Logs

## GET /api/v1/admin/bookings

Must include both:

``` text
Online bookings
Physical-store bookings
```

Filters must allow:

``` text
date
customer
booking status
booking type
payment status
```

This fulfills CP-12.

------------------------------------------------------------------------

# 45. TV Realtime API

TV should establish a realtime connection.

Recommended:

``` text
WebSocket
```

or the selected backend realtime technology.

Subscription:

``` text
successful_transaction
```

When a transaction succeeds:

``` text
Backend
 ↓
Transaction SUCCESSFUL
 ↓
Create event
 ↓
Publish realtime event
 ↓
TV receives event
 ↓
Display transaction
 ↓
Play notification sound
```

No manual refresh.

------------------------------------------------------------------------

# 46. TV Display Payload

Example:

``` json
{
  "event": "TRANSACTION_SUCCESSFUL",
  "transaction_id": "TXN-001",
  "customer_name": "Customer Name",
  "fish": [
    {
      "name": "Fish A",
      "quantity": 2
    }
  ],
  "bill_number": "BILL-001",
  "paid_amount": 515,
  "time": "18:32"
}
```

The TV should show only the permitted successful-transaction
information.

------------------------------------------------------------------------

# 47. TV Sound

Every successful transaction event should trigger a short notification
sound.

The display may additionally emphasize:

``` text
Customer Name
Paid Amount
```

This helps the worker identify that a new successful transaction has
arrived.

Sound must not play repeatedly for reconnect/reload of an already
displayed transaction.

The TV should maintain a last-processed event/transaction identifier.

------------------------------------------------------------------------

# 48. TV History

The TV displays successful transactions for the active business day.

New business day:

``` text
new business-day view
```

Historical records remain stored in the database.

------------------------------------------------------------------------

# 49. GPS APIs

## POST /api/v1/admin/gps/journeys

Creates a journey.

Input includes:

``` text
fish
quantity
origin
destination
```

Destination is the PondFish store.

------------------------------------------------------------------------

# 50. GPS Publish

## POST /api/v1/admin/gps/journeys/{id}/publish

Before publishing:

``` text
journey valid
fish selected
quantity selected
origin selected
destination valid
OneLap journey available
```

After publish:

``` text
tracking_published = true
```

Customer tracking becomes available.

------------------------------------------------------------------------

# 51. Customer GPS API

## GET /api/v1/customer/gps/journeys/{id}

Returns permitted tracking information:

``` text
current location
ETA
journey status
destination
```

It must never expose internal admin information.

------------------------------------------------------------------------

# 52. GPS Arrival Handling

When GPS reaches destination:

``` text
Arrival detected
 ↓
Start configured waiting period
 ↓
Customer tracking remains visible
 ↓
Waiting period ends
 ↓
Customer tracking automatically stops
```

Admin tracking remains active.

------------------------------------------------------------------------

# 53. GPS Stop Customer Publication

The backend must distinguish:

``` text
provider tracking
admin tracking
customer publication
```

Therefore:

``` text
Customer tracking = ENDED
Admin tracking = ACTIVE
```

is valid.

------------------------------------------------------------------------

# 54. GPS Notification APIs

Events may trigger:

``` text
journey published
journey started
ETA changed
arrival approaching
arrived
customer tracking ended
```

Delivery channels follow the locked notification strategy:

``` text
In-app
Push
SMS/WhatsApp where selected
```

------------------------------------------------------------------------

# 55. Freshness Background Job

A scheduled backend process should periodically:

``` text
Read active inventory batches
 ↓
Calculate age
 ↓
Update freshness status
 ↓
Update online availability
 ↓
Trigger Admin notification when required
```

It must not silently dispose inventory.

------------------------------------------------------------------------

# 56. Expired Fish Handling

When a batch becomes Red/expired:

``` text
Remove from online availability
 ↓
Notify Admin
 ↓
Admin decides
   ├── continue physical sale
   ├── remove
   └── dispose/wastage
```

The backend must preserve the decision in audit/inventory history.

------------------------------------------------------------------------

# 57. Error Handling Standard

Every business failure should use a stable error code.

Examples:

``` text
CUSTOMER_NOT_FOUND
FISH_NOT_FOUND
FISH_NOT_ONLINE_BOOKABLE
FISH_UNAVAILABLE
INSUFFICIENT_INVENTORY
SUBSCRIPTION_NOT_ACTIVE
SUBSCRIPTION_QUANTITY_EXCEEDED
SUBSCRIPTION_CREDIT_INSUFFICIENT
BILL_NOT_FOUND
BILL_ALREADY_PROCESSED
BILL_NUMBER_REQUIRED
AI_EXTRACTION_FAILED
AI_LOW_CONFIDENCE
PAYMENT_FAILED
PAYMENT_PENDING
PAYMENT_VERIFICATION_FAILED
BOOKING_NOT_FOUND
BOOKING_ALREADY_CANCELLED
BOOKING_ALREADY_COMPLETED
GPS_JOURNEY_NOT_FOUND
GPS_TRACKING_NOT_AVAILABLE
FORBIDDEN
```

------------------------------------------------------------------------

# 58. AI Extraction Error Handling

If AI fails:

``` text
AI_EXTRACTION_FAILED
```

The UI should allow retry.

If extraction succeeds but confidence is low:

``` text
AI_LOW_CONFIDENCE
```

The system must require user confirmation/correction before payment.

If Bill ID is missing:

``` text
BILL_NUMBER_REQUIRED
```

The user must manually enter it.

------------------------------------------------------------------------

# 59. Payment Failure

If Razorpay payment fails:

``` text
Transaction remains unpaid
```

The customer can:

``` text
Retry payment
```

If the user abandons the transaction, the system must allow
cancellation/cleanup according to the transaction state.

No successful transaction is created until payment is verified.

------------------------------------------------------------------------

# 60. Payment Retry Idempotency

Every payment attempt must have a unique intent/attempt identity.

Repeated client requests must not create multiple successful payments
for one transaction.

------------------------------------------------------------------------

# 61. Authorization Enforcement

Authorization must happen at backend level.

Example:

A customer requesting:

``` text
GET /customer/transactions/{other_customer_transaction}
```

must receive:

``` text
403 FORBIDDEN
```

or an appropriate not-found response according to security policy.

Never trust IDs supplied by clients.

------------------------------------------------------------------------

# 62. File Upload Security

Bill image upload must validate:

``` text
MIME type
file size
extension
image validity
```

Files should be stored privately.

Access should use short-lived authorized URLs where required.

------------------------------------------------------------------------

# 63. API Rate Limits

Recommended limits:

``` text
OTP request
OTP verification
Login
Bill scan
Payment creation
Public catalogue APIs
```

Bill scanning and OTP endpoints require stronger abuse protection.

------------------------------------------------------------------------

# 64. Audit Events

Audit records should be generated for:

``` text
Admin creates/updates fish
Admin changes price
Admin changes inventory
Admin changes freshness
Admin creates discount
Admin assigns subscription
Admin changes subscription
Worker processes bill
Worker accepts cash
Worker processes transaction
Booking cancellation
Inventory restoration
Payment verification
GPS publication
GPS configuration changes
```

------------------------------------------------------------------------

# 65. Realtime Event Types

Recommended event names:

``` text
TRANSACTION_SUCCESSFUL
BOOKING_CREATED
BOOKING_CANCELLED
BOOKING_COMPLETED
GPS_PUBLISHED
GPS_UPDATED
GPS_ARRIVED
GPS_CUSTOMER_TRACKING_ENDED
FRESHNESS_STATUS_CHANGED
DISCOUNT_STARTED
DISCOUNT_ENDED
```

------------------------------------------------------------------------

# 66. Domain Event Rules

A domain event must be created only after the underlying business state
is safely committed.

Recommended pattern:

``` text
Database transaction
 ↓
Write domain event/outbox
 ↓
Commit
 ↓
Event publisher
 ↓
Realtime/notifications
```

This prevents a TV or notification event from being published for a
transaction that later rolls back.

------------------------------------------------------------------------

# 67. Background Jobs

Required scheduled/asynchronous jobs include:

``` text
Freshness calculation
Booking expiry
Payment reconciliation
Notification retry
Outbox event delivery
GPS status synchronization
Discount activation/expiry
Cleanup of temporary uploads
```

Jobs must be idempotent.

------------------------------------------------------------------------

# 68. Booking Expiry

Locked booking expiry is approximately:

``` text
48 hours
```

The value should be configurable.

At expiry:

``` text
Booking expired
 ↓
Inventory reservation released
 ↓
Subscription quantity restored
 ↓
Subscription credit restored
 ↓
Applicable Razorpay-paid amount restored into subscription credit
 ↓
Ledger entries created
 ↓
Customer notified
```

------------------------------------------------------------------------

# 69. API Transaction Boundary Rules

The following operations must not be split into independently successful
API calls where doing so can create inconsistent state:

``` text
Transaction finalization
Inventory deduction
Subscription deduction
Bill completion
```

The backend should expose a business operation rather than forcing the
client to orchestrate database mutations.

------------------------------------------------------------------------

# 70. Concurrency Control

Potential race conditions:

``` text
Two customers buying last fish
Two scans using same bill
Two workers processing same bill
Two cancellation requests
Payment webhook + client verification
Two booking expiry workers
```

Use:

``` text
database transactions
row locks where required
unique constraints
idempotency keys
state validation
```

------------------------------------------------------------------------

# 71. API Logging

Every request should have:

``` text
request_id
actor_id
actor_type
endpoint
HTTP method
status
duration
timestamp
```

Do not log:

``` text
passwords
OTP
full payment secrets
private tokens
sensitive customer data unnecessarily
```

------------------------------------------------------------------------

# 72. External Integration Adapter Pattern

External systems should be isolated behind adapters.

``` text
RazorpayAdapter
OneLapAdapter
AIExtractionAdapter
NotificationAdapter
```

The business layer should not depend directly on provider-specific
implementation details.

------------------------------------------------------------------------

# 73. Razorpay Adapter Responsibilities

``` text
createOrder()
verifyPayment()
processWebhook()
refund()
reconcile()
```

Provider errors must be converted into internal stable error codes.

------------------------------------------------------------------------

# 74. OneLap Adapter Responsibilities

``` text
create/get journey
start tracking
get current location
get ETA
detect arrival
stop customer publication
retrieve provider status
```

The exact OneLap API implementation must follow the actual provider API
contract during development.

------------------------------------------------------------------------

# 75. AI Adapter Responsibilities

``` text
extractBill()
parseItems()
extractBillNumber()
returnConfidence()
```

The AI adapter must return structured output.

Business validation occurs outside the AI adapter.

------------------------------------------------------------------------

# 76. Notification Adapter

``` text
sendPush()
sendSMS()
sendWhatsApp()
createInAppNotification()
```

A failed notification must not roll back a successful financial
transaction.

------------------------------------------------------------------------

# 77. API Documentation Standard

Every endpoint in implementation documentation should specify:

``` text
Purpose
Method
Path
Authentication
Role
Request
Validation
Business logic
Success response
Error responses
Side effects
Database changes
Events
Audit
Idempotency
```

------------------------------------------------------------------------

# 78. Example Endpoint Specification

## POST /api/v1/worker/bills/scan

### Authentication

``` text
WORKER
```

### Input

``` text
bill_image
customer_id
```

### Validation

``` text
Customer exists
Image valid
File size valid
```

### Processing

``` text
Store image
 ↓
Run AI extraction
 ↓
Match fish
 ↓
Extract bill number
 ↓
Return preview
```

### Success

``` text
200 / 202
```

### Errors

``` text
CUSTOMER_NOT_FOUND
INVALID_IMAGE
AI_EXTRACTION_FAILED
AI_LOW_CONFIDENCE
```

### Side effects

``` text
Bill image stored
AI extraction record created
```

No transaction is finalized at this endpoint.

------------------------------------------------------------------------

# 79. Separation of Preview and Commit

Financial workflows should use:

``` text
PREVIEW
```

then:

``` text
COMMIT
```

Preview:

``` text
calculates
```

Commit:

``` text
revalidates
locks
persists
```

The backend must recalculate during commit because
inventory/subscription state may have changed after preview.

------------------------------------------------------------------------

# 80. Transaction Commit API

## POST /api/v1/transactions/commit

The endpoint must:

1.  Revalidate bill.
2.  Revalidate inventory.
3.  Revalidate subscription.
4.  Recalculate pricing.
5.  Validate payment state.
6.  Lock required records.
7.  Persist transaction.
8.  Update inventory.
9.  Update subscription.
10. Create ledgers.
11. Mark bill processed.
12. Emit successful event.
13. Write audit.

------------------------------------------------------------------------

# 81. API Security Checklist

``` text
HTTPS
JWT/session validation
RBAC
Object-level authorization
Rate limiting
Input validation
SQL injection protection
File upload validation
Webhook signature validation
Payment verification
Idempotency
Audit logging
Secure secrets
Private file storage
```

------------------------------------------------------------------------

# 82. Data Privacy

Customer data must be exposed only where required.

Worker views should expose only operational customer information.

TV must never show:

``` text
mobile number
address
subscription balance
payment gateway details
private bill image
```

------------------------------------------------------------------------

# 83. Customer Mobile API Behaviour

The React Native application should not contain business calculations as
authoritative logic.

It may display:

``` text
preview
```

but the backend determines:

``` text
eligibility
price
subscription coverage
tax
payment amount
inventory
transaction status
```

------------------------------------------------------------------------

# 84. Worker Portal API Behaviour

Worker portal should be optimized for:

``` text
fast search
fast bill scanning
clear preview
cash confirmation
booking retrieval
transaction confirmation
```

The API should return operationally relevant information without
exposing unnecessary admin controls.

------------------------------------------------------------------------

# 85. Admin API Behaviour

Admin APIs expose management functions for:

``` text
fish
categories
inventory
freshness
discounts
subscriptions
customers
workers
transactions
bookings
GPS
notifications
reports
settings
```

Every mutation requires authorization and audit.

------------------------------------------------------------------------

# 86. TV API Behaviour

TV should have the smallest API surface.

Allowed:

``` text
authenticate display
get current business-day successful transactions
subscribe to successful transaction events
```

No write operation should be available to the TV client.

------------------------------------------------------------------------

# 87. API Versioning

Breaking changes require:

``` text
/api/v2
```

Do not silently change existing response contracts.

Non-breaking additions should remain backward compatible.

------------------------------------------------------------------------

# 88. API Acceptance Criteria

The backend specification is implementation-ready when:

-   Every portal has defined API responsibilities.
-   Authentication is defined for each role.
-   RBAC is defined.
-   Customer OTP flow is defined.
-   Worker/Admin credentials are defined.
-   Catalogue APIs are defined.
-   Cart is restricted to online-bookable fish.
-   Subscription calculations are server-side.
-   Weekly quantity and credit balance are both checked.
-   Bill scanning supports customer and worker workflows.
-   Manual Bill ID entry is supported.
-   Duplicate bill processing is prevented.
-   Preview occurs before payment.
-   Razorpay charges and GST are calculated server-side.
-   Cash is restricted to authorized operational workflows.
-   Payment verification is server-side.
-   Transaction finalization is atomic.
-   Inventory and subscription ledgers are updated atomically.
-   Booking reservation and restoration are defined.
-   Booking expiry is defined.
-   TV realtime events are defined.
-   TV notification sound behavior is defined.
-   OneLap GPS publication is defined.
-   Customer GPS visibility can end while Admin tracking continues.
-   Freshness automation is defined.
-   Discount scheduling is defined.
-   Admin transaction and booking logs are defined.
-   Error codes are standardized.
-   Idempotency is defined.
-   External providers are isolated behind adapters.
-   Audit and observability are defined.
-   Future POS integration remains compatible.

------------------------------------------------------------------------

# 89. Recommended Next Artifact

The next document should be:

**PONDFISH --- Frontend & Application Architecture Specification**

It should define, separately for each application:

``` text
Public Website
Customer React Native App
Worker Web/Tablet
Admin Web
TV Display
```

including:

``` text
Route/screen structure
Navigation
Component architecture
State management
API integration
Loading states
Empty states
Error states
Success states
Permission states
Realtime behaviour
Form validation
Responsive behaviour
Offline/connection handling
```

It should be created only after the backend/API baseline above is
locked.

------------------------------------------------------------------------

# DOCUMENT END
