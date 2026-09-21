# PONDFISH — CROSS-SYSTEM VALIDATION & ERROR SPECIFICATION

**Version:** 1.0  
**Status:** Implementation Blueprint  
**Document Type:** Cross-System Validation, Error, Success, Empty-State, Conflict & Recovery Specification  
**Scope:** Current MVP — Single Store, One Truck  
**Primary Consumers:** Backend Engineering, Public Website Engineering, React Native Engineering, Worker Portal Engineering, Admin Portal Engineering, Shop TV Engineering, QA, DevOps, AI Coding Agents

---

# 0. DOCUMENT PURPOSE

This document defines how all PondFish application surfaces respond consistently when an operation is:

- valid;
- invalid;
- unauthorized;
- unavailable;
- stale;
- conflicting;
- interrupted;
- partially completed;
- already completed;
- dependent on an unavailable external provider;
- affected by network failure;
- waiting for confirmation;
- empty;
- loading;
- under maintenance.

The purpose is to prevent each application from inventing its own interpretation of errors.

The shared system principle is:

```text
APPLICATIONS REQUEST ACTIONS
        ↓
DOMAIN ENGINES ENFORCE RULES
        ↓
DATABASE PRESERVES TRUTH
        ↓
EVENTS COMMUNICATE COMMITTED STATE
        ↓
INTEGRATIONS REMAIN REPLACEABLE
```

The Core Business Engines specification explicitly defines stable error classes, machine-readable error codes, network uncertainty, conflict handling, idempotency and concurrency as shared business behavior. This document expands those rules into cross-system implementation behavior.

---

# 1. SOURCE-OF-TRUTH HIERARCHY

When implementing validation or error behavior, use:

```text
1. Backend/API Contract
2. Master PRD
3. Core Business Engines
4. System Architecture
5. Database/ERD
6. Design System
7. Page-by-Page UI Specifications
8. Implementation
```

A frontend must never silently create a new business rule.

If a requirement changes business behavior:

```text
Requirement Change
      ↓
Identify affected business engine
      ↓
Update authoritative requirement
      ↓
Update API/database if required
      ↓
Update affected UI specifications
      ↓
Update QA
      ↓
Implement
```

---

# 2. SYSTEM SURFACES

PondFish currently contains:

```text
PUBLIC WEBSITE
       |
CUSTOMER REACT NATIVE APP
       |
       v
SHARED BACKEND
   /       |       \
WORKER   ADMIN     TV
PORTAL   PORTAL   PORTAL
```

All surfaces must consume the same authoritative backend behavior.

The public website may display catalogue, pricing, availability, freshness and active discounts, but must not expose internal inventory, customer, worker, payment or private administrative information.

The customer application handles authentication, catalogue, booking, cart, checkout, subscription, bill scanning, payment, history, QR tickets, tracking and notifications.

The Worker Portal handles operational workflows.

The Admin Portal handles control, visibility, configuration, approved intervention, reporting and audit.

The Shop TV is a projection surface and is not authoritative.

---

# 3. ERROR DESIGN PRINCIPLE

An error is not merely a red message.

Every failure must answer:

```text
WHAT HAPPENED?
WHY DID IT HAPPEN?
IS THE RESULT KNOWN?
WHAT CAN THE USER DO NEXT?
```

For operational users:

```text
WHAT HAPPENED?
CAN I CONTINUE?
DO I NEED TO RETRY?
DID THE PREVIOUS ACTION ACTUALLY COMPLETE?
```

For administrators:

```text
WHAT FAILED?
WHAT BUSINESS STATE EXISTS NOW?
IS ACTION REQUIRED?
CAN I RECOVER IT?
WHO/WHAT CAUSED IT?
```

---

# 4. ERROR CLASSES

The system uses these top-level classes:

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

These classes are already established by the Core Business Engines specification.

Do not introduce arbitrary frontend-only categories that contradict the backend contract.

---

# 5. ERROR RESPONSE CONTRACT

Every API error should provide a stable structure.

Conceptual:

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NO_LONGER_AVAILABLE",
    "class": "CONFLICT",
    "message": "This fish is no longer available to book.",
    "retryable": false,
    "request_id": "..."
  }
}
```

Optional fields may include:

```text
field
resource
current_state
required_action
retry_after
```

The exact API schema is owned by the API Specification.

This document defines behavior, not a competing API contract.

---

# 6. MACHINE-READABLE ERROR CODES

Frontend clients must branch on:

```text
error.code
```

not on:

```text
error.message
```

Human-readable text may change.

Example:

```text
GOOD
if error.code == "BOOKING_EXPIRED"

BAD
if message contains "expired"
```

---

# 7. ERROR MESSAGE RULES

User-facing messages must be:

- clear;
- short;
- specific;
- non-technical;
- actionable;
- honest about uncertainty.

Avoid:

```text
Something went wrong.
```

when a useful reason is known.

Avoid exposing:

```text
SQLSTATE...
NullPointerException...
AxiosError...
Razorpay signature mismatch...
Postgres error...
```

Instead:

```text
We couldn't complete the payment.
Please try again.
```

Internal logs contain technical details.

---

# 8. ERROR MESSAGE STRUCTURE

Where appropriate:

```text
TITLE
Short explanation
ACTION
```

Example:

```text
Payment still processing

We haven't confirmed your payment yet.

Check payment status
```

Or:

```text
Fish no longer available

The selected quantity is no longer available for online booking.

Review cart
```

---

# 9. VALIDATION ERRORS

Validation errors occur when supplied data does not meet the defined input requirements.

Examples:

- required field missing;
- invalid phone number;
- invalid quantity;
- invalid age;
- invalid Bill ID format;
- invalid booking selection;
- invalid date/time;
- malformed request.

UI behavior:

```text
Show error next to affected field
        ↓
Preserve valid user input
        ↓
Allow correction
```

Do not clear the entire form unless explicitly required.

---

# 10. CLIENT-SIDE VS SERVER-SIDE VALIDATION

Client-side validation:

```text
UX optimization
```

Server-side validation:

```text
Security + business correctness
```

Both are required.

Example:

```text
Client:
Quantity must be > 0

Backend:
Quantity must be > 0
AND
fish must be bookable
AND
quantity must satisfy availability
```

A client validation pass never guarantees business acceptance.

---

# 11. FIELD VALIDATION STATES

Every input that supports validation should support:

```text
DEFAULT
FOCUSED
FILLED
ERROR
DISABLED
READ-ONLY
```

Where applicable:

```text
VALID
```

may also be represented.

The Worker Portal page specification already requires these states for inputs.

---

# 12. FORM SUBMISSION FAILURE

When submission fails validation:

```text
Do not navigate away.
Do not erase valid fields.
Highlight invalid fields.
Focus the first actionable error where appropriate.
```

For mobile:

```text
Scroll to the first invalid field.
```

For desktop/tablet:

```text
Keep the form position stable where possible.
```

---

# 13. BUSINESS RULE ERRORS

Business-rule errors mean:

```text
The request is technically valid,
but the business does not allow it.
```

Examples:

- fish unavailable;
- fish not online-bookable;
- booking expired;
- subscription credit exhausted;
- weekly quantity exhausted;
- discount no longer active;
- cancellation no longer permitted;
- worker lacks required operational state;
- transaction cannot be completed from current state.

The user must receive a business explanation and an actionable next step.

---

# 14. AUTHENTICATION ERRORS

Authentication failure means the system cannot establish a valid authenticated identity.

Examples:

```text
SESSION_EXPIRED
INVALID_OTP
OTP_EXPIRED
AUTHENTICATION_REQUIRED
```

Behavior:

```text
Protected page
      ↓
Authentication failure
      ↓
Re-authenticate
```

Do not show private data before authentication is confirmed.

---

# 15. EXPIRED SESSION

When a session expires:

## If no unsaved critical data exists

Redirect to login/authentication.

## If the user has an important unsaved form

Show:

```text
Your session has expired.
Please sign in again to continue.
```

Preserve non-sensitive draft data where safe.

Never persist secrets or sensitive payment information in unsafe client storage.

---

# 16. AUTHORIZATION ERRORS

Authentication answers:

```text
Who are you?
```

Authorization answers:

```text
Are you allowed to perform this action?
```

Examples:

- customer attempting admin endpoint;
- worker attempting admin configuration;
- admin attempting unauthorized action;
- inactive worker attempting operational action.

Return:

```text
403 / authorization error
```

as defined by the API contract.

The UI must not reveal hidden resource details unnecessarily.

---

# 17. NOT FOUND

Use `NOT_FOUND` when the requested resource does not exist or is intentionally unavailable to the actor.

Examples:

```text
Booking ID does not exist.
Customer record does not exist.
Fish ID does not exist.
```

The UI should distinguish:

```text
Resource does not exist
```

from:

```text
Resource exists but is not available to this user
```

where security policy requires hiding existence.

---

# 18. 404 PAGE

The 404 page is a navigation/resource state.

Recommended:

```text
Page not found

The page you're looking for doesn't exist or may have moved.

Go Home
```

Public Website:

```text
Home
Browse Fish
Contact
```

Customer App:

```text
Return to Home
```

Worker/Admin:

```text
Return to Dashboard
```

Do not expose route internals.

---

# 19. CONFLICT ERRORS

A conflict means the requested action was valid when initiated but the authoritative state changed before completion.

Examples already defined by the core engines include:

- stock changed;
- booking already completed;
- fish no longer bookable;
- discount ended;
- subscription changed;
- duplicate Bill ID.

The correct behavior is:

```text
Reject stale mutation
        ↓
Return CONFLICT
        ↓
Fetch fresh authoritative state
        ↓
Show updated state
        ↓
Allow user to decide next action
```

Do not silently overwrite the newer state.

---

# 20. STALE DATA

A screen may contain data that was correct when loaded but is no longer current.

Examples:

```text
Fish availability
Cart pricing
Discount
Booking status
Subscription balance
Worker queue
GPS location
```

When a stale state is detected:

```text
Backend authoritative state wins.
```

The UI must refresh or present a conflict.

---

# 21. INVENTORY CONFLICT

Example:

```text
Customer sees:
Rohu — 2 kg available

Customer requests:
2 kg

Before checkout:
Another booking consumes availability.
```

Backend response:

```text
CONFLICT
```

UI:

```text
Availability changed

The selected quantity is no longer available.

Refresh availability
```

Never allow negative inventory merely because the UI showed stock earlier.

---

# 22. CART STALENESS

Cart contents may become stale because:

- fish became unavailable;
- online booking eligibility changed;
- price changed;
- discount changed;
- freshness changed;
- quantity changed.

At checkout:

```text
Recalculate authoritative cart.
```

If changed:

```text
Your cart was updated.

Review changes
```

Do not charge based solely on the previous client calculation.

---

# 23. DISCOUNT CONFLICT

If a discount ends between catalogue view and checkout:

```text
Old UI price
      ↓
Backend recalculation
      ↓
Discount no longer active
```

Return a business conflict or pricing update according to the API contract.

The UI must clearly show:

```text
Price updated
```

and the new authoritative amount.

---

# 24. SUBSCRIPTION CONFLICT

A subscription may change between:

```text
cart opened
```

and:

```text
checkout
```

Examples:

- credit consumed elsewhere;
- weekly quantity exhausted;
- subscription cancelled;
- subscription expired;
- restoration already performed.

The backend recalculates eligibility.

The UI shows the current state.

---

# 25. PAYMENT UNCERTAINTY

This is one of the most important system states.

If a payment request may have reached the provider but the client loses connection:

```text
Network failure
≠
Payment failed
```

The Core Business Engines specification explicitly defines network failure as:

```text
Operation result unknown
```

unless the backend has confirmed the result.

Therefore the UI must not automatically show:

```text
Payment failed
```

when the result is unknown.

---

# 26. PAYMENT UNKNOWN FLOW

```text
Customer taps Pay
        ↓
Payment starts
        ↓
Network interruption
        ↓
Payment result unknown
        ↓
Show "Checking payment status"
        ↓
Query backend
        ↓
+------------------------+
|                        |
v                        v
SUCCESS                FAILED
|                        |
v                        v
Continue               Retry
```

If still unknown:

```text
Payment status is still being confirmed.
Please check again.
```

Do not immediately create a second charge.

---

# 27. PAYMENT DUPLICATION PROTECTION

Every critical payment operation must use:

- provider reference;
- internal payment record;
- idempotency;
- database uniqueness where applicable.

Double taps:

```text
Tap
Tap
```

must not create two business payments.

The button should enter:

```text
LOADING
```

and the backend must remain the final protection.

---

# 28. PAYMENT FAILURE

If payment is definitively failed:

```text
Payment failed

No successful transaction has been recorded.

Try again
```

Do not:

- deduct inventory;
- activate subscription;
- complete transaction;
- project success to TV.

---

# 29. PAYMENT SUCCESS

Only backend-confirmed successful payment may trigger the corresponding business success flow.

Conceptually:

```text
Provider confirmation
        ↓
Backend verification
        ↓
Business commit
        ↓
Success
```

---

# 30. BOOKING CREATION ERROR

Booking creation may fail because:

- fish is no longer bookable;
- quantity unavailable;
- cart changed;
- payment failed;
- payment uncertain;
- customer state invalid;
- booking limit/business rule failed;
- backend error.

The UI must distinguish these.

---

# 31. BOOKING EXPIRY

When booking reaches its expiry state:

```text
Booking
   ↓
Expired
```

The customer must see:

```text
Booking expired

This booking is no longer available for pickup.

Book again
```

The system must restore applicable reserved inventory and subscription resources according to the approved business rules.

Notification failure must not prevent the expiry mutation.

---

# 32. BOOKING ALREADY COMPLETED

If two workers attempt completion:

```text
Worker A → complete
Worker B → complete
```

Only one succeeds.

Worker B receives:

```text
Booking already completed

This order was completed by another authorized action.
```

Do not run completion side effects twice.

---

# 33. QR VALIDATION ERRORS

Possible states:

```text
VALID
EXPIRED
CANCELLED
COMPLETED
INVALID
ALREADY_USED
NOT_FOUND
```

The worker UI must clearly identify the state.

Never treat an unreadable QR as automatically invalid business data.

---

# 34. QR SCAN TECHNICAL FAILURE

Camera may fail because:

- permission denied;
- camera unavailable;
- low light;
- unsupported scan;
- temporary scanner error.

Show:

```text
Could not scan QR

Try again
Enter Booking ID
```

where manual lookup is allowed.

---

# 35. CAMERA PERMISSION ERROR

If permission is denied:

```text
Camera access is required to scan bills/QR codes.

Allow Camera
Use Manual Entry
```

Only show the manual option where the workflow supports it.

---

# 36. BILL ID DUPLICATE

The system must detect duplicate Bill IDs.

Example:

```text
Bill ID already processed
```

Behavior:

```text
Do not create second transaction.
Do not consume subscription again.
Do not deduct inventory again.
Do not create second TV success event.
```

Return conflict.

---

# 37. AI EXTRACTION FAILURE

Possible:

```text
IMAGE_UNREADABLE
EXTRACTION_FAILED
LOW_CONFIDENCE
UNKNOWN_FISH
MISSING_BILL_ID
TOTAL_MISMATCH
```

The system should provide a manual correction/re-entry path.

AI output is not business authority.

---

# 38. AI EXTRACTION PARTIAL SUCCESS

Example:

```text
Bill ID extracted
Fish name extracted
Quantity unclear
```

Do not automatically finalize.

Show:

```text
Review required
```

The user must correct/confirm where the workflow requires it.

---

# 39. TRANSACTION FINALIZATION FAILURE

Physical purchase flow:

```text
Bill
 ↓
AI
 ↓
Review
 ↓
Validation
 ↓
Subscription
 ↓
Payment
 ↓
Transaction
 ↓
Inventory
 ↓
Ledger
 ↓
Audit
 ↓
Realtime
 ↓
TV
```

The business transaction is successful only after required atomic finalization succeeds.

If finalization fails:

```text
Do not show success.
Do not send TV success event.
Do not claim payment/transaction completion.
```

---

# 40. TRANSACTION UNKNOWN STATE

If the client disconnects during transaction finalization:

```text
Do not immediately create another transaction.
```

Instead:

```text
Check transaction status
        ↓
Confirmed success → show success
Confirmed failure → allow recovery
Unknown → show pending/verification state
```

This protects against duplicate charges and duplicate Bill IDs.

---

# 41. INVENTORY MUTATION FAILURE

Inventory changes must occur through the inventory engine.

If inventory mutation fails:

```text
Do not claim successful transaction
```

The exact transaction rollback/atomicity behavior is owned by the backend transaction contract.

The UI should present:

```text
We couldn't complete this transaction.
Please try again or contact the store worker.
```

---

# 42. SUBSCRIPTION CREDIT ERROR

Possible:

```text
INSUFFICIENT_CREDIT
WEEKLY_LIMIT_REACHED
SUBSCRIPTION_EXPIRED
SUBSCRIPTION_CANCELLED
```

The UI must explain the specific state.

Example:

```text
Weekly quantity used

Your subscription's weekly allowance has been used.

Continue with paid quantity
```

where additional paid quantity is allowed by the approved business rules.

---

# 43. SUBSCRIPTION RESTORATION FAILURE

Restoration must be idempotent.

If restoration is requested twice:

```text
First → restores
Second → returns existing restoration/result
```

Do not restore twice.

---

# 44. NETWORK ERROR CLASS

Network error means:

```text
The client could not reliably determine whether the request reached the backend.
```

This is different from:

```text
Backend explicitly rejected request.
```

UI behavior depends on operation type.

---

# 45. SAFE READ NETWORK ERROR

For catalogue/search:

```text
Couldn't load fish.

Retry
```

Cached data may be displayed if explicitly supported and clearly represented as cached.

---

# 46. MUTATION NETWORK ERROR

For:

- payment;
- booking;
- cancellation;
- completion;
- transaction;
- subscription purchase;

do not assume failure.

Use:

```text
Checking status
```

when the mutation may have reached the backend.

---

# 47. NETWORK RECOVERY

When connectivity returns:

Do not automatically replay every mutation.

Only replay operations that are:

```text
explicitly designed for retry
+
idempotent
```

Otherwise:

```text
refresh/check status
```

first.

---

# 48. REALTIME DISCONNECT

Realtime connection may be lost.

The UI should show a subtle state such as:

```text
Live updates paused
```

where realtime is important.

It must not imply that backend data stopped existing.

On reconnect:

```text
Reconnect
   ↓
Refresh authoritative state
   ↓
Resume realtime
```

---

# 49. TV REALTIME FAILURE

The Shop TV is a projection surface.

If realtime disconnects:

```text
TV remains operational with last known state
```

but must not pretend it received new events.

When reconnecting:

```text
Reconnect
   ↓
Synchronize current/recent event state
```

The TV must not create business transactions.

---

# 50. TV SUCCESS EVENT

Only successful committed transactions should produce the TV success projection.

Conceptually:

```text
Transaction Commit
      ↓
Committed Event
      ↓
TV Event
      ↓
Customer Name
Paid Amount
Fish / Transaction Details
      ↓
Visual Update
      +
Bell/Notification Sound
```

The sound is a UI reaction to the committed event, not evidence that the transaction succeeded.

---

# 51. NOTIFICATION FAILURE

Notification failure must not roll back business state.

Example:

```text
Booking successful
      ↓
Notification fails
```

Result:

```text
Booking remains successful.
Notification is retryable/failed.
```

---

# 52. GPS NETWORK/PROVIDER FAILURE

OneLap failure must not affect:

- payment;
- booking;
- inventory;
- transaction finalization.

Customer UI may show:

```text
Live location temporarily unavailable
```

or:

```text
Last updated X minutes ago
```

Never show stale GPS as live.

---

# 53. GPS STALE STATE

A location must have a freshness concept.

Conceptual:

```text
FRESH
STALE
UNAVAILABLE
```

The exact threshold belongs to the approved journey/integration configuration.

---

# 54. ADMIN ACTION FAILURE

Every Admin action affecting:

- money;
- stock;
- customers;
- bookings;
- workers;
- GPS visibility;
- public information

must be:

```text
validated
authorized
traceable
concurrency-safe where required
recoverable
```

If the action fails, show the resulting authoritative state.

---

# 55. ADMIN CONFLICT

Example:

```text
Admin A opens fish settings.
Admin B changes same fish.
Admin A submits old data.
```

Backend detects conflict.

Admin A sees:

```text
This fish was updated by another action.

Review latest version
```

Do not silently overwrite Admin B's update.

---

# 56. WORKER CONCURRENCY

Worker actions must be protected against:

- double completion;
- duplicate payment;
- duplicate Bill ID;
- stale booking details;
- multiple workers processing same booking.

The Worker Portal should never implement its own final business-state logic.

The backend remains authoritative.

---

# 57. PUBLIC WEBSITE STALE DATA

The public website may display:

- fish;
- category;
- price;
- physical availability;
- online booking eligibility;
- freshness;
- active discounts.

Because these can change, the website should refresh/revalidate before critical booking actions.

The public website must not display internal stock ledger values.

---

# 58. CUSTOMER APP EMPTY STATES

Empty states should explain why the list is empty.

Examples:

## No bookings

```text
No bookings yet

Your online bookings will appear here.

Browse fish
```

## No transactions

```text
No transactions yet

Your purchases will appear here.
```

## Empty cart

```text
Your cart is empty

Add fish that is available for online booking.

Browse fish
```

---

# 59. SEARCH NO RESULTS

Search states:

```text
IDLE
LOADING
RESULTS
NO_RESULTS
ERROR
```

No results:

```text
No fish found

Try another name or category.
```

Do not show a generic error for a valid empty result.

---

# 60. WORKER QUEUE EMPTY

Worker:

```text
No pending bookings

New bookings will appear here.
```

This is not an error.

---

# 61. ADMIN EMPTY STATES

Examples:

```text
No active discounts
No pending bookings
No transactions for this period
No audit events matching filters
No customers found
```

Provide useful next actions where applicable.

---

# 62. LOADING STATES

Loading must communicate that the system is working.

Use:

```text
Skeleton
Spinner
Progress indicator
```

depending on context.

Avoid blocking the entire application when only one component is loading.

---

# 63. BUTTON STATES

Every important action supports:

```text
DEFAULT
HOVER
PRESSED
LOADING
DISABLED
SUCCESS where applicable
```

The UI must prevent repeated submission while a request is actively being processed.

Backend idempotency remains the final protection.

---

# 64. SUCCESS STATES

Success must be shown only after authoritative confirmation.

Examples:

```text
Booking confirmed
Payment successful
Transaction completed
Subscription activated
Cancellation completed
Inventory updated
```

Never show optimistic "success" for irreversible financial mutations unless the architecture explicitly defines it.

---

# 65. PARTIAL SUCCESS

Some workflows may have a successful core mutation but failed secondary effects.

Example:

```text
Transaction committed
Notification failed
```

The user should see:

```text
Transaction completed.

Notification delivery is pending.
```

Do not call the whole business transaction failed.

---

# 66. MAINTENANCE STATE

When the service is under planned maintenance:

```text
PondFish is temporarily unavailable

We're making improvements.
Please try again shortly.
```

If read-only functionality remains available, expose only the supported features.

Do not allow mutations if the backend is intentionally unavailable.

---

# 67. 403 PAGE

Recommended:

```text
Access denied

You don't have permission to view this page.

Return to Dashboard
```

For customer app:

```text
You don't have access to this area.

Return Home
```

Do not reveal protected resource details.

---

# 68. 500 PAGE

Recommended:

```text
Something went wrong

We couldn't complete this request.

Try again
```

For operational portals, include:

```text
Request ID
```

where appropriate for support.

Never expose stack traces.

---

# 69. GLOBAL NETWORK FAILURE PAGE/STATE

If the application cannot communicate with the backend:

```text
Connection unavailable

Check your internet connection and try again.
```

For a mutation with unknown result:

```text
We couldn't confirm the result yet.

Check status
```

These are different states and must not be merged.

---

# 70. FIELD-LEVEL ERROR VS GLOBAL ERROR

Use field-level error when:

```text
One specific field is invalid.
```

Use global error when:

```text
The whole operation failed.
```

Example:

```text
Quantity: "Enter a valid quantity."
```

versus:

```text
We couldn't update the booking.
Try again.
```

Do not display ten duplicate global errors for ten invalid fields.

---

# 71. MULTIPLE VALIDATION ERRORS

When multiple fields are invalid:

```text
Show each field error
+
Optional summary at top
```

Example:

```text
Please fix the highlighted fields.
```

Clicking an error summary should move to the field where useful.

---

# 72. RETRY BUTTON RULES

Show retry when the failure is likely temporary:

```text
NETWORK_ERROR
TEMPORARY_INTEGRATION_ERROR
REALTIME_DISCONNECT
```

Do not show "Retry" as the only action when the problem requires correction:

```text
INVALID_PHONE
INSUFFICIENT_CREDIT
NO_BOOKING_PERMISSION
```

---

# 73. REFRESH RULES

Use refresh when authoritative state may have changed.

Examples:

```text
CONFLICT
STALE_DATA
BOOKING_ALREADY_COMPLETED
INVENTORY_CHANGED
SUBSCRIPTION_CHANGED
```

Do not repeatedly refresh forever.

---

# 74. RETRY LIMITS

Automatic retries must be bounded.

Conceptual:

```text
Attempt
↓
Backoff
↓
Attempt
↓
Backoff
↓
Maximum
↓
Operational failure
```

Critical jobs must be idempotent, retryable and observable.

---

# 75. BACKGROUND JOB FAILURE

Background jobs include:

- booking expiry;
- freshness transitions;
- notifications;
- reports;
- reconciliation;
- event replay;
- cleanup;
- integration polling.

Every critical job must be:

```text
idempotent
retryable
observable
auditable where appropriate
```

After maximum retries:

```text
dead-letter / operational failure
```

---

# 76. DUPLICATE REQUESTS

Potential duplicate sources:

- double-click;
- browser retry;
- mobile retry;
- network retry;
- provider callback retry;
- job retry;
- concurrent worker;
- realtime duplicate.

Critical mutations require idempotency.

Conceptually:

```text
Idempotency-Key
+
Authenticated Actor
+
Operation Scope
```

identifies one logical operation.

---

# 77. IDEMPOTENCY FAILURE RESPONSE

If the same request is repeated with the same idempotency key:

```text
Return existing result
```

Do not execute side effects twice.

If the same key is reused for materially different payload:

```text
Reject as idempotency conflict.
```

---

# 78. DATABASE UNIQUENESS

Important uniqueness must be enforced at database level.

Examples:

```text
successful Bill ID
event ID
restoration reference
payment provider reference
booking QR identifier
```

Application-only checks are insufficient under concurrency.

---

# 79. ERROR → AUDIT RULE

Audit materially important failures where required.

Examples:

- admin stock adjustment rejected;
- booking cancellation conflict;
- payment verification mismatch;
- duplicate Bill ID;
- unauthorized admin attempt;
- integration reconciliation discrepancy.

Do not turn every harmless client-side validation error into a permanent audit record.

---

# 80. ERROR → NOTIFICATION RULE

Not every error creates a customer notification.

Customer notification is appropriate when the business state changes or an important asynchronous event occurs.

Examples:

```text
Booking confirmed
Booking cancelled
Booking expired
Transaction completed
Subscription activated
```

A temporary network error on the customer's phone should not create an admin notification.

---

# 81. ERROR → TV RULE

The TV should receive only relevant committed events.

Do not show:

```text
payment pending
payment failed
AI failed
GPS failed
notification failed
```

as transaction success.

Only successful committed transaction events should produce the success projection.

---

# 82. ERROR → REPORTING RULE

Operational failures should not be counted as successful business transactions.

Reports must distinguish:

```text
successful
failed
cancelled
expired
pending
unknown/reconciliation
```

where supported by the reporting model.

---

# 83. CUSTOMER APP ERROR MAP

| Situation | User sees | Primary action |
|---|---|---|
| Invalid input | Field error | Correct |
| Session expired | Sign in again | Authenticate |
| Fish unavailable | Availability message | Change quantity/fish |
| Cart changed | Cart update | Review |
| Payment failed | Payment failed | Retry |
| Payment unknown | Checking status | Check status |
| Booking expired | Booking expired | Book again |
| Network during mutation | Result unknown | Check status |
| Server error | Temporary failure | Retry |
| Empty list | Helpful empty state | Browse/return |
| Permission denied | Access denied | Return |

---

# 84. WORKER PORTAL ERROR MAP

| Situation | Worker action |
|---|---|
| Booking not found | Search again |
| QR invalid | Re-scan/manual lookup |
| Booking already completed | Stop duplicate processing |
| Booking expired | Follow approved expired workflow |
| Bill unreadable | Retake/manual entry |
| AI uncertain | Review/correct |
| Duplicate Bill ID | Stop and inspect |
| Payment failed | Retry/payment recovery |
| Payment unknown | Check status |
| Network failure | Check status/reconnect |
| Permission failure | Contact authorized admin |
| Server error | Retry/report |

---

# 85. ADMIN PORTAL ERROR MAP

| Situation | Admin action |
|---|---|
| Validation error | Correct |
| Permission error | Return/contact authorized role |
| Conflict | Refresh/review latest |
| Integration failure | Inspect integration state |
| Reconciliation mismatch | Investigate |
| Network failure | Reconnect/check status |
| Server error | Retry/request ID |
| Empty report | Adjust filters/date |
| Stale data | Refresh |

---

# 86. PUBLIC WEBSITE ERROR MAP

| Situation | Behavior |
|---|---|
| Catalogue unavailable | Friendly retry state |
| Image unavailable | Fallback image |
| Fish unavailable | Show unavailable state |
| Booking eligibility changed | Revalidate at booking |
| Network offline | Retry |
| Unknown route | 404 |
| Server failure | 500/retry |
| Maintenance | Maintenance page |

---

# 87. SHOP TV ERROR MAP

| Situation | Behavior |
|---|---|
| Realtime disconnected | Show connection state |
| No new transactions | Continue current display |
| Event duplicate | Ignore duplicate |
| Invalid event | Ignore/log |
| Backend unavailable | Show last known safe state |
| Reconnect | Refresh/synchronize |

The TV is not a transaction controller.

---

# 88. ERROR PRIORITY

Use this hierarchy when multiple failures occur:

```text
1. Security / authorization
2. Financial correctness
3. Business state correctness
4. Data integrity
5. User experience
6. Cosmetic feedback
```

Example:

If payment status is unknown and the network is disconnected:

```text
Do not optimize for a fast "failed" message.
Protect financial correctness first.
```

---

# 89. RECOVERY PRINCIPLE

Every recoverable error should lead to one of:

```text
CORRECT
RETRY
REFRESH
CHECK STATUS
REAUTHENTICATE
CONTACT ADMIN
CONTACT SUPPORT
```

Avoid dead-end error screens.

---

# 90. ERROR RECOVERY DECISION TREE

```text
ERROR
  |
  +-- Can user correct input?
  |       → CORRECT
  |
  +-- Is authoritative state changed?
  |       → REFRESH
  |
  +-- Is result unknown?
  |       → CHECK STATUS
  |
  +-- Is failure temporary?
  |       → RETRY
  |
  +-- Is session invalid?
  |       → REAUTHENTICATE
  |
  +-- Is authorization missing?
  |       → CONTACT AUTHORIZED ROLE
  |
  +-- Is internal/integration failure?
          → RETRY / SUPPORT / OPERATIONS
```

---

# 91. STALE UI RECOVERY

When a screen is detected as stale:

```text
Do not mutate stale state.
Fetch current state.
Compare.
Display changes.
Require confirmation where the change materially affects the user.
```

---

# 92. UNSAVED FORM RECOVERY

For safe non-sensitive forms:

```text
Preserve draft locally where appropriate.
```

For financial/payment forms:

```text
Do not persist sensitive payment information.
```

After session/network recovery:

```text
Revalidate before submission.
```

---

# 93. MOBILE APP BACKGROUNDING

When the React Native application returns from background:

Potentially stale data:

- booking;
- cart;
- subscription;
- payment status;
- tracking.

For critical screens:

```text
Refresh authoritative state where appropriate.
```

Do not blindly assume the previous screen is still current.

---

# 94. TAB/BROWSER RETURN

For web portals:

When returning to an operational page after inactivity:

```text
Revalidate important state.
```

Especially:

```text
booking queue
inventory
transactions
admin configuration
```

---

# 95. DOUBLE SUBMISSION

UI:

```text
Disable action
Show loading
```

Backend:

```text
Idempotency + state validation
```

Both are required.

---

# 96. CONCURRENT ADMIN ACTION

If two admins change the same record:

```text
Latest authorized state
+
conflict detection
```

must prevent silent overwrite when the operation requires concurrency protection.

---

# 97. CONCURRENT WORKER ACTION

If two workers act on the same booking:

```text
First valid commit wins.
Second receives conflict/current-state response.
```

Do not create duplicate:

- completion;
- payment;
- inventory mutation;
- notification;
- TV event.

---

# 98. CONCURRENT CUSTOMER BOOKING

Multiple customers may request the same limited fish.

The backend must decide availability atomically.

The UI must never guarantee stock merely because it was previously displayed.

---

# 99. ERROR CORRELATION

Every backend request should have a request/correlation identifier where appropriate.

Example:

```text
Request ID: PF-XXXXXXXX
```

For support:

```text
Something went wrong.

Reference: PF-XXXXXXXX
```

Do not expose internal stack traces.

---

# 100. LOGGING RULES

Logs should include:

```text
request_id
actor_id where appropriate
operation
resource
error_code
provider reference where safe
timestamp
retry count
```

Avoid:

```text
OTP
password
secret
payment credential
private image content
unnecessary PII
```

---

# 101. ERROR OBSERVABILITY

Monitor:

```text
validation error rate
business conflict rate
payment failures
payment unknown states
booking conflicts
inventory conflicts
AI extraction failures
GPS failures
notification failures
realtime disconnects
500 errors
background job failures
reconciliation mismatches
```

A spike may indicate a real operational problem.

---

# 102. SUCCESS/ERROR STATE CONSISTENCY

The same business state should use consistent terminology across all surfaces.

Example:

```text
Booking Confirmed
```

should not become:

```text
Order Approved
```

on another surface unless the distinction is intentional and defined.

---

# 103. STATUS TERMINOLOGY

Use approved domain terminology:

```text
Booking
Transaction
Subscription
Inventory
Payment
Bill
Journey
Tracking
```

Avoid introducing synonyms that confuse implementation or support.

---

# 104. ACCESSIBILITY

Errors must not rely only on:

```text
color
sound
icon
```

Provide:

- readable text;
- focus handling;
- accessible labels;
- appropriate announcements for mobile;
- sufficient contrast;
- keyboard accessibility for web.

For TV, sound may accompany a transaction event, but the visual event must remain understandable without sound.

---

# 105. SOUND RULES FOR TV

The transaction success sound:

```text
plays when a committed successful transaction event is received.
```

It must not:

- play for payment initiation;
- play for failed payment;
- play for pending payment;
- play for duplicate event;
- play for stale event.

Duplicate event processing must not produce duplicate sounds.

---

# 106. OFFLINE CATALOGUE STATE

If cached catalogue data is intentionally supported:

```text
Cached data
```

must be distinguishable from guaranteed current data.

Do not let cached availability be interpreted as guaranteed booking availability.

---

# 107. OFFLINE BOOKING RULE

Current MVP does not include an offline transaction queue.

Therefore:

```text
No internet
+
critical booking mutation
=
do not claim success
```

The user must reconnect/check status.

---

# 108. OFFLINE PAYMENT RULE

Never treat local UI confirmation as payment success.

Payment success requires backend/provider confirmation.

---

# 109. OFFLINE WORKER RULE

If the worker cannot reach backend:

```text
Do not complete a booking locally
unless a separately approved offline workflow exists.
```

Current MVP does not define such an offline transaction queue.

---

# 110. OFFLINE ADMIN RULE

Admin configuration mutations require authoritative backend confirmation.

Do not present:

```text
Saved
```

until backend confirmation exists.

---

# 111. INTEGRATION ERROR BOUNDARY

External integrations may fail independently.

Examples:

```text
Razorpay fails
→ payment operation affected

Firebase notification fails
→ notification affected

AI fails
→ extraction affected

OneLap fails
→ GPS affected
```

Do not cascade unrelated failures.

---

# 112. PAYMENT PROVIDER ERROR

Provider-specific error codes are normalized by the Razorpay adapter.

Frontend should receive PondFish error codes, not provider implementation details.

---

# 113. AI PROVIDER ERROR

AI provider errors become normalized:

```text
AI_UNAVAILABLE
AI_TIMEOUT
AI_EXTRACTION_FAILED
AI_LOW_CONFIDENCE
```

Exact API codes must be finalized in the API specification.

---

# 114. GPS PROVIDER ERROR

Normalize:

```text
GPS_UNAVAILABLE
GPS_STALE
GPS_PROVIDER_ERROR
GPS_DEVICE_OFFLINE
```

Exact codes remain subject to the integration contract.

---

# 115. NOTIFICATION PROVIDER ERROR

Notification failure should be recorded as a delivery failure, not a business transaction failure.

---

# 116. RECONCILIATION ERROR

If provider and PondFish records disagree:

```text
Do not silently choose one.
```

Create:

```text
reconciliation discrepancy
```

and follow the controlled operational resolution process.

---

# 117. REPORTING ERROR

If report generation fails:

```text
Report could not be generated.

Retry
```

Do not display a partially generated report as complete unless explicitly marked partial.

---

# 118. EXPORT ERROR

If CSV/PDF/export generation fails:

```text
Export failed.

Try again.
```

The original report/data remains unaffected.

---

# 119. FILE UPLOAD ERROR

For bill images:

Possible:

```text
FILE_TOO_LARGE
UNSUPPORTED_FORMAT
UPLOAD_FAILED
UPLOAD_INTERRUPTED
IMAGE_UNREADABLE
```

The UI should allow:

```text
Retake
Choose another image
Retry
Manual entry
```

where supported.

---

# 120. IMAGE VALIDATION

Before AI extraction:

```text
file type
file size
image readability
upload completion
```

must be validated.

Do not send invalid uploads unnecessarily to the AI provider.

---

# 121. BOOKING CANCELLATION ERROR

Cancellation flow:

```text
Cancel Request
      ↓
State Validation
      ↓
Atomic Cancellation
      ↓
Inventory Release
      ↓
Subscription Restoration
      ↓
Credit/paid-value restoration where applicable
      ↓
QR Invalidation
      ↓
Audit
      ↓
Notification
```

Notification failure must not undo the cancellation.

---

# 122. CANCELLATION CONFLICT

If booking is already completed:

```text
Cancellation not allowed

This booking has already been completed.
```

If expired:

```text
Booking already expired
```

If already cancelled:

```text
Booking already cancelled
```

Do not run restoration twice.

---

# 123. RESTORATION FAILURE

If a cancellation requires restoration and the authoritative transaction cannot complete:

```text
Do not claim cancellation success
```

unless the backend contract explicitly defines a recoverable asynchronous cancellation state.

Any partial state must be recoverable and observable.

---

# 124. BUSINESS STATE TRANSITIONS

Frontend must not invent transitions.

Example:

```text
PENDING
→ READY
→ COMPLETED
```

must follow the approved booking state machine.

Invalid transition:

```text
COMPLETED
→ PENDING
```

must be rejected.

---

# 125. STATE MACHINE ERROR

When a command is invalid for the current state:

```text
INVALID_STATE_TRANSITION
```

UI:

```text
This action is no longer available because the booking status changed.
```

Then refresh current state.

---

# 126. SUCCESS AFTER RELOAD

A successful mutation must remain successful after:

```text
refresh
app restart
browser reload
re-login
```

The source is backend state, not local UI state.

---

# 127. LOCAL UI STATE RESET

After authoritative failure:

```text
Reset only the affected local operation state.
```

Do not wipe:

- customer profile;
- unrelated cart items;
- unrelated navigation state

unless required.

---

# 128. ERROR RECOVERY AND TRANSACTION SAFETY

Never use:

```text
"Retry everything"
```

as a generic strategy.

For each mutation determine:

```text
Is result known?
Is operation idempotent?
Can status be queried?
Can it be safely retried?
```

Then choose:

```text
retry
check status
refresh
manual intervention
```

---

# 129. ERROR STATE DESIGN SYSTEM REQUIREMENTS

The design system must define reusable:

```text
Error Banner
Inline Field Error
Toast
Modal
Empty State
Loading State
Offline State
Conflict State
Success State
Maintenance State
```

These components must use the product's approved typography, spacing, iconography and color system.

---

# 130. TOAST RULES

Use toast for:

- short non-blocking confirmation;
- minor transient errors;
- background completion.

Do not use toast as the only communication for:

- payment uncertainty;
- destructive conflicts;
- critical transaction failures;
- authorization failure requiring action.

---

# 131. MODAL ERROR RULES

Use modal when:

```text
user must make a decision
```

Example:

```text
Price changed
```

or:

```text
Cancel booking?
```

Avoid modal overload for routine validation.

---

# 132. BANNER RULES

Use persistent banner for:

- network unavailable;
- maintenance;
- stale/live-update status;
- important operational warnings.

---

# 133. EMPTY STATE RULE

Empty is not error.

```text
No bookings
```

is different from:

```text
Bookings failed to load
```

The first is empty state.

The second is error state.

---

# 134. LOADING VS ERROR

Never show:

```text
No data
```

while data is still loading.

Sequence:

```text
Loading
   ↓
Success → data
   ↓
Success → empty
   ↓
Error → error state
```

---

# 135. ERROR VS UNKNOWN

Critical distinction:

```text
FAILED
```

means the backend/provider confirmed failure.

```text
UNKNOWN
```

means the system cannot yet determine the result.

Never map UNKNOWN to FAILED for financial mutations.

---

# 136. UNKNOWN STATE UI

Use wording such as:

```text
Checking status
```

or:

```text
We're still confirming this action.
```

Do not tell the customer:

```text
Payment failed
```

until failure is confirmed.

---

# 137. REFRESH AFTER CONFLICT

After a conflict:

```text
Fetch authoritative state
```

Then:

```text
replace stale local state
```

The user decides whether to retry.

Do not automatically repeat the conflicting mutation unless it is explicitly safe and intended.

---

# 138. RETRY AFTER CONFLICT

A retry after conflict must use:

```text
fresh data
+
fresh validation
```

not the old payload blindly.

---

# 139. CUSTOMER BOOKING EDGE CASES

The system must handle:

```text
Fish becomes unavailable
Quantity becomes unavailable
Online booking disabled
Price changes
Discount expires
Subscription changes
Payment fails
Payment unknown
Booking created
Booking expires
Booking cancelled
Booking completed
Duplicate request
Network interruption
```

---

# 140. PHYSICAL PURCHASE EDGE CASES

Handle:

```text
Bill unreadable
Bill ID missing
Duplicate Bill ID
Fish unknown
Quantity invalid
Total mismatch
AI unavailable
AI low confidence
Subscription insufficient
Payment failure
Payment unknown
Transaction commit failure
Inventory mutation failure
Network interruption
TV event duplication
```

---

# 141. ADMIN EDGE CASES

Handle:

```text
Concurrent edit
Invalid configuration
Unauthorized action
Stale data
Network failure
Backend failure
Integration failure
Empty report
Export failure
Invalid inventory adjustment
Invalid discount
Invalid subscription configuration
```

---

# 142. WORKER EDGE CASES

Handle:

```text
QR invalid
Booking expired
Booking completed
Wrong booking
Duplicate completion
Camera unavailable
Camera permission denied
Bill upload failure
AI extraction failure
Manual correction
Payment failure
Payment unknown
Network interruption
```

---

# 143. TV EDGE CASES

Handle:

```text
Realtime disconnect
Duplicate event
Out-of-order event
Malformed event
Backend unavailable
Reconnect
No transactions
Audio failure
```

Audio failure must not affect transaction state.

---

# 144. OUT-OF-ORDER EVENT HANDLING

Realtime events may arrive out of order.

Use:

```text
event ID
sequence/version/timestamp where supported
```

to prevent an older state from overwriting newer state.

The final mechanism belongs to the realtime/API architecture.

---

# 145. DUPLICATE REALTIME EVENT

If the same event is delivered twice:

```text
Process visual projection once.
Play sound once.
```

Use event ID/idempotency tracking.

---

# 146. MALFORMED EVENT

If an event is invalid:

```text
Ignore projection
Log diagnostic
Do not crash TV/application
```

The TV must remain operational.

---

# 147. ERROR BOUNDARY BETWEEN PORTALS

No portal should call another portal directly to decide business truth.

Correct:

```text
Customer App
     ↓
Backend
     ↓
Worker/Admin/TV
```

Incorrect:

```text
Customer App
     ↓
Worker Portal
```

The backend remains the shared source of truth.

---

# 148. PUBLIC WEBSITE → CUSTOMER APP

If the website links the user into booking:

```text
Website catalogue
      ↓
Customer authentication/app
      ↓
Fresh catalogue/availability check
```

Do not carry stale price/availability as guaranteed truth.

---

# 149. CUSTOMER APP → WORKER PORTAL

Customer booking state:

```text
Created
Reserved
Ready
Completed
Cancelled
Expired
```

Worker sees backend state.

The worker does not receive authority from the customer device.

---

# 150. WORKER → TV

Worker completion:

```text
Worker command
      ↓
Backend validation
      ↓
Transaction commit
      ↓
Realtime event
      ↓
TV
```

The worker device does not directly command the TV.

---

# 151. ADMIN → PUBLIC WEBSITE

Admin changes public catalogue/discount state:

```text
Admin action
      ↓
Backend validation
      ↓
Database commit
      ↓
Website reads updated state
```

The admin UI must not assume the public website updated merely because its local screen changed.

---

# 152. ADMIN → CUSTOMER APP

Admin changes:

- fish availability;
- discount;
- subscription;
- business settings.

Customer app receives the new authoritative state through backend reads/realtime/notifications as defined.

---

# 153. INTEGRATION FAILURE DOES NOT CASCADE

Examples:

```text
Firebase Push down
≠
Booking failed

OneLap down
≠
Transaction failed

AI down
≠
Payment failed

TV disconnected
≠
Transaction failed
```

Only the dependent operation should be affected.

---

# 154. SUPPORT DIAGNOSTICS

Support/operations should be able to correlate:

```text
Customer
Booking
Bill
Payment
Transaction
Provider reference
Request ID
Event ID
Audit event
```

without giving normal users access to internal diagnostics.

---

# 155. ERROR ACCEPTANCE CRITERIA

Every critical mutation must answer:

- [ ] What happens on validation failure?
- [ ] What happens on business-rule failure?
- [ ] What happens on conflict?
- [ ] What happens on network interruption?
- [ ] Can the result become unknown?
- [ ] How is unknown status checked?
- [ ] Is retry safe?
- [ ] Is duplicate execution prevented?
- [ ] Is authoritative state refreshed?
- [ ] Are side effects committed only after business success?
- [ ] Are secondary failures isolated?
- [ ] Is the failure observable?
- [ ] Is recovery possible?

---

# 156. UI STATE ACCEPTANCE CRITERIA

For each important page/component:

- [ ] Loading
- [ ] Success
- [ ] Empty
- [ ] Validation error
- [ ] Business error
- [ ] Network error
- [ ] Permission error where applicable
- [ ] Conflict
- [ ] Disabled action
- [ ] Retry
- [ ] Recovery
- [ ] Maintenance where applicable

---

# 157. PORTAL ACCEPTANCE MATRIX

## Public Website

- [ ] 404
- [ ] 500
- [ ] network failure
- [ ] maintenance
- [ ] empty catalogue
- [ ] fish unavailable
- [ ] discount changed
- [ ] loading
- [ ] image failure

## Customer App

- [ ] authentication failure
- [ ] OTP error
- [ ] session expiry
- [ ] empty cart
- [ ] checkout conflict
- [ ] payment failure
- [ ] payment unknown
- [ ] booking expiry
- [ ] cancellation
- [ ] network failure
- [ ] GPS unavailable
- [ ] notification state
- [ ] 404-equivalent navigation
- [ ] server error

## Worker Portal

- [ ] QR failure
- [ ] camera permission
- [ ] booking conflict
- [ ] duplicate Bill ID
- [ ] AI failure
- [ ] payment unknown
- [ ] transaction failure
- [ ] network failure
- [ ] 403
- [ ] 404
- [ ] 500
- [ ] empty queue

## Admin Portal

- [ ] validation
- [ ] authorization
- [ ] conflict
- [ ] stale data
- [ ] integration error
- [ ] network error
- [ ] empty reports
- [ ] export error
- [ ] 403
- [ ] 404
- [ ] 500
- [ ] maintenance

## TV

- [ ] realtime disconnect
- [ ] duplicate event
- [ ] malformed event
- [ ] reconnect
- [ ] no transactions
- [ ] audio failure

---

# 158. QA TESTING RULE

QA must test the business result, not merely the visible message.

Example:

Payment failure test must verify:

```text
Payment failed
AND
subscription unchanged
AND
inventory unchanged
AND
transaction not successful
AND
TV event absent
```

---

# 159. PAYMENT UNKNOWN TEST

Test:

```text
Start payment
Interrupt network
Provider may have processed payment
Reconnect
Query status
```

Expected:

```text
No duplicate charge
Correct final business state
```

---

# 160. BOOKING RACE TEST

Two customers:

```text
Customer A → last available quantity
Customer B → same quantity
```

Expected:

```text
One valid allocation
Other receives conflict/unavailability
No negative inventory
```

---

# 161. WORKER RACE TEST

Two workers:

```text
Worker A → complete
Worker B → complete
```

Expected:

```text
One completion
One conflict/current-state result
One transaction side effect
One TV event
```

---

# 162. DUPLICATE BILL TEST

Submit same Bill ID twice.

Expected:

```text
First → process
Second → duplicate conflict
```

No:

```text
double payment
double inventory deduction
double subscription usage
double TV event
```

---

# 163. NOTIFICATION FAILURE TEST

Force notification provider failure after successful transaction.

Expected:

```text
Transaction successful
Notification failed/retryable
TV success event remains valid
```

---

# 164. GPS FAILURE TEST

Disconnect OneLap/provider.

Expected:

```text
Tracking unavailable/stale
No transaction corruption
No booking corruption
```

---

# 165. REALTIME DUPLICATE TEST

Deliver same successful transaction event twice.

Expected:

```text
TV display once
Sound once
Business transaction once
```

---

# 166. SERVER ERROR TEST

Force backend 500.

Expected:

```text
No fake success
No partial client state presented as committed
Useful retry/recovery
Request ID where appropriate
```

---

# 167. MAINTENANCE TEST

Enable maintenance mode.

Expected:

```text
User sees maintenance state
Critical mutations blocked
No false success
```

---

# 168. DESIGN HANDOFF REQUIREMENTS

For every critical page/state, design files should include:

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

This is especially important because the existing portal specifications already require these component/page states.

---

# 169. AI CODING AGENT RULES

## Rule 01

Never treat a human-readable error message as the API contract.

## Rule 02

Branch on stable machine-readable error codes.

## Rule 03

Never map unknown payment result to payment failure.

## Rule 04

Never automatically replay a critical mutation unless retry is proven safe.

## Rule 05

Always protect critical mutations with idempotency/state validation.

## Rule 06

Never overwrite newer authoritative state with stale client state.

## Rule 07

Never show business success before authoritative confirmation.

## Rule 08

Never allow a provider error to mutate unrelated business state.

## Rule 09

Never let TV success events originate before committed transaction state.

## Rule 10

Never make frontend validation the only validation layer.

## Rule 11

Never silently resolve conflicts.

## Rule 12

Never expose stack traces, secrets or provider credentials to users.

## Rule 13

Do not create an offline transaction queue unless it becomes an explicitly approved requirement.

## Rule 14

When an error code is missing from the current contract, stop and identify the API contract change rather than inventing a permanent code casually.

---

# 170. IMPLEMENTATION CHECKLIST

Before calling cross-system error handling complete:

- [ ] Stable error taxonomy implemented
- [ ] Stable error codes implemented
- [ ] API error envelope finalized
- [ ] Field validation mapped
- [ ] Business errors mapped
- [ ] Auth errors mapped
- [ ] Authorization errors mapped
- [ ] Not-found behavior mapped
- [ ] Conflict behavior mapped
- [ ] Payment uncertainty mapped
- [ ] Network uncertainty mapped
- [ ] Retry policy mapped
- [ ] Idempotency mapped
- [ ] Realtime failure mapped
- [ ] Integration failures isolated
- [ ] Empty states designed
- [ ] Loading states designed
- [ ] Success states designed
- [ ] 404 designed
- [ ] 403 designed
- [ ] 500 designed
- [ ] Maintenance designed
- [ ] QA edge cases written
- [ ] Support diagnostics defined

---

# 171. FINAL CROSS-SYSTEM PRINCIPLE

> **Never let the UI guess what the backend has not confirmed.**

And:

> **Never turn an unknown result into a false failure or a false success.**

PondFish must preserve one consistent truth across:

```text
Public Website
Customer App
Worker Portal
Admin Portal
Shop TV
Backend
Database
External Integrations
```

The user interface communicates state.

The backend owns state.

The database preserves state.

Events communicate committed state.

Integrations provide capabilities.

---

# 172. NEXT DOCUMENT

The next implementation artifact is:

```text
QA / TEST SPECIFICATION
```

It should convert the locked:

```text
Master PRD
System Architecture
Database/ERD
API Specification
Portal Specifications
Core Business Engines
Integration Specification
Cross-System Validation/Error Specification
```

into a complete executable test strategy covering:

- functional testing;
- business-rule testing;
- API testing;
- database integrity;
- concurrency;
- idempotency;
- payment;
- subscriptions;
- inventory;
- booking;
- AI bill extraction;
- GPS;
- realtime TV;
- notifications;
- authentication;
- authorization;
- responsive web;
- React Native;
- accessibility;
- security;
- performance;
- integration;
- failure/recovery;
- deployment smoke tests;
- regression;
- acceptance criteria.

---

# DOCUMENT END
