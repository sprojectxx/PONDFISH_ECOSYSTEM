# PONDFISH — INTEGRATION SPECIFICATION

**Version:** 1.0  
**Status:** Implementation Blueprint  
**Document Type:** External Integrations, Provider Adapters & Synchronization Specification  
**Scope:** Current MVP + explicitly separated future integrations  
**Primary Consumers:** Backend Engineering, Integration Engineering, React Native Engineering, Worker Portal Engineering, Admin Portal Engineering, TV Engineering, QA, DevOps, AI Coding Agents

---

# 0. DOCUMENT PURPOSE

This document defines how PondFish communicates with external systems without allowing external providers to become the source of PondFish business truth.

The current architecture explicitly isolates Razorpay, OneLap and AI behind service/adapter boundaries, while future POS/SI-801 integration must enter through an adapter and must not replace the core transaction engine.

The current technical dependency material identifies Razorpay, Firebase-related services, OneLap, ESSAE SI-810 PRSS hardware/vendor integration planning, Supabase/PostgreSQL, store network connectivity and applicable synchronization requirements.

This document therefore defines:

- integration boundaries;
- provider responsibilities;
- PondFish responsibilities;
- authentication/credential boundaries;
- request/response normalization;
- webhook/callback handling;
- retry behavior;
- idempotency;
- timeout handling;
- provider outage behavior;
- reconciliation;
- logging;
- audit;
- security;
- client dependencies;
- testing;
- future hardware integration boundaries.

---

# 1. SOURCE-OF-TRUTH RULE

External providers provide capabilities.

PondFish owns the business state.

```text
EXTERNAL PROVIDER
       ↓
ADAPTER
       ↓
NORMALIZED PONDFISH DATA
       ↓
DOMAIN ENGINE
       ↓
DATABASE
       ↓
PONDFISH BUSINESS TRUTH
```

Never:

```text
External Provider
      ↓
Directly change business tables
```

unless a specifically documented adapter operation performs the validated mutation.

---

# 2. INTEGRATION ARCHITECTURE

```text
                    PONDFISH APPLICATIONS
                           |
                           v
                    PONDFISH BACKEND
                           |
              +------------+------------+
              |            |            |
              v            v            v
        PAYMENT ADAPTER  GPS ADAPTER  AI ADAPTER
              |            |            |
              v            v            v
          RAZORPAY       ONELAP       AI/OCR

              +-----------------------------+
              |
              v
       NOTIFICATION ADAPTER
              |
              v
       FIREBASE / APPROVED
       NOTIFICATION PROVIDER

Future:

ESSAE SI-810 / POS
        |
        v
 HARDWARE/POS ADAPTER
        |
        v
 NORMALIZED BILL
        |
        v
 TRANSACTION ENGINE
```

The integration layer is deliberately between external providers and PondFish domain engines.

---

# 3. INTEGRATION PRINCIPLES

## 3.1 Provider Isolation

Provider-specific code must stay inside its adapter/module.

Examples:

```text
Razorpay signature handling
OneLap payload mapping
AI provider request format
Firebase message format
ESSAE communication protocol
```

must not leak throughout the application.

## 3.2 Normalization

Each integration returns PondFish-normalized data.

Example:

```text
Razorpay payment object
        ↓
Razorpay Adapter
        ↓
PondFish PaymentResult
```

The business engine consumes `PaymentResult`, not a provider-specific object.

## 3.3 Business Rules Stay in PondFish

The provider does not decide:

- whether a booking is valid;
- whether fish is available;
- whether subscription credit is enough;
- whether a transaction should be finalized;
- whether inventory should be deducted;
- whether TV should show a transaction.

## 3.4 Provider Failure Isolation

A provider outage must affect only the dependent feature where possible.

Examples:

```text
OneLap down
→ GPS unavailable
→ payments remain operational

Firebase down
→ push notification delayed
→ transaction remains successful

AI unavailable
→ bill extraction unavailable
→ manual workflow remains available
```

## 3.5 Secrets

Provider secrets must never be:

- hardcoded;
- committed to source control;
- embedded in client applications;
- returned through public APIs;
- logged.

---

# 4. INTEGRATION INVENTORY

| Integration | Current Status | Purpose | Authority |
|---|---|---|---|
| Razorpay | MVP | Online payment | PondFish |
| Firebase Auth/OTP | MVP/approved direction | Customer authentication where used | PondFish |
| Firebase Notifications | MVP/approved direction | Push notifications | PondFish |
| AI/OCR | MVP | Bill extraction | PondFish |
| OneLap | MVP integration | GPS tracking | PondFish |
| ESSAE SI-810 PRSS | Current workflow is indirect | Weighing/bill generation | PondFish transaction engine |
| POS + SI-810 | Future | Automated bill/weight integration | PondFish transaction engine |
| Apple services | Deployment ecosystem | iOS distribution | PondFish app |
| Google services | Deployment ecosystem | Android distribution | PondFish app |

The technical dependency document specifically states that OneLap integration is subject to official API documentation and credentials, while ESSAE integration requires vendor communication/protocol information and suitable store-network configuration.

---

# 5. RAZORPAY INTEGRATION

# 5.1 Purpose

Razorpay is used for supported online payment processing.

PondFish remains authoritative for:

- order/booking state;
- transaction state;
- subscription state;
- inventory;
- subscription credit;
- payment-to-business mapping.

---

# 5.2 Payment Architecture

```text
Customer / Worker
       ↓
PondFish Checkout
       ↓
PondFish creates payment order/request
       ↓
Razorpay
       ↓
Customer completes payment
       ↓
Razorpay response/callback
       ↓
PondFish backend verification
       ↓
Payment Engine
       ↓
Transaction / Booking / Subscription Engine
```

---

# 5.3 Client Boundary

The React Native app or web client may initiate the Razorpay checkout UI.

The client must not independently mark the business transaction successful.

Incorrect:

```text
Razorpay UI says success
        ↓
App marks booking successful
```

Correct:

```text
Razorpay result
        ↓
Backend verification
        ↓
Business transaction finalization
```

---

# 5.4 Payment Order Creation

Before payment:

1. authenticate actor;
2. calculate authoritative amount;
3. create PondFish payment context;
4. create Razorpay order/payment request;
5. store provider reference;
6. return only required checkout information to client.

The amount sent to Razorpay must come from the backend calculation.

---

# 5.5 Amount Protection

The backend must store:

- internal amount;
- provider order ID;
- provider/payment reference;
- currency;
- business entity;
- customer;
- purpose;
- status.

On verification:

```text
Provider Amount
        ==
PondFish Expected Amount
```

must be validated.

A mismatch is a payment/business error.

---

# 5.6 Payment Verification

Verification must validate all applicable provider security information, including the provider's required signature/reference information.

The exact Razorpay SDK/API mechanism should be implemented according to the current official Razorpay documentation and account configuration.

PondFish must not assume that a client callback alone proves payment success.

---

# 5.7 Duplicate Callback

Possible:

```text
Callback A
Callback A again
```

The result must be:

```text
One PondFish payment state
One business transaction
One inventory mutation
One TV event
```

Use:

- provider payment reference;
- provider order reference;
- internal idempotency key;
- database uniqueness constraints.

---

# 5.8 Payment State Model

Conceptual state:

```text
CREATED
   ↓
PENDING
   ↓
VERIFIED_SUCCESS
```

Failure paths:

```text
PENDING → FAILED
PENDING → CANCELLED
PENDING → EXPIRED
```

The exact enum values must match the final API/database specification.

---

# 5.9 Unknown Payment Result

If the client loses connection immediately after payment:

```text
Client:
"I don't know whether payment succeeded."
```

The app must query PondFish.

It must not create a new payment immediately without checking the previous attempt.

---

# 5.10 Razorpay Failure

If Razorpay is unavailable:

```text
Payment cannot be initiated
```

The customer should receive a recoverable error.

Do not create:

- successful booking;
- successful transaction;
- subscription activation.

---

# 5.11 Razorpay Refund Boundary

If the business workflow requires a refund:

```text
PondFish Refund Engine
        ↓
Razorpay Refund Adapter
        ↓
Razorpay
        ↓
Provider Refund Reference
        ↓
PondFish Refund Record
```

The original transaction remains historical.

---

# 5.12 Razorpay Reconciliation

A reconciliation job may compare:

```text
PondFish Payment Records
        vs
Razorpay Provider Records
```

Potential discrepancies:

- payment exists at provider but not PondFish;
- PondFish pending but provider successful;
- amount mismatch;
- duplicate provider reference;
- refund mismatch.

Reconciliation must produce an operational issue rather than silently changing business records.

---

# 6. FIREBASE AUTH / OTP INTEGRATION

# 6.1 Purpose

Firebase-related authentication is part of the current technical direction for customer OTP/authentication where approved.

The customer experience uses mobile OTP rather than a conventional customer password flow.

---

# 6.2 OTP Flow

```text
Customer enters phone number
        ↓
Firebase/Auth Provider
        ↓
OTP delivered
        ↓
Customer enters OTP
        ↓
Provider verifies
        ↓
PondFish validates authenticated identity
        ↓
Customer record lookup/create
        ↓
Session established
```

---

# 6.3 PondFish Identity

Provider identity is not sufficient as the complete PondFish customer record.

PondFish maintains customer-domain data such as:

- customer ID;
- name;
- age;
- area;
- account status;
- subscription relationship;
- transaction relationship.

---

# 6.4 OTP Abuse Protection

The system must respect provider rate limits and additionally protect the application from:

- OTP flooding;
- repeated requests;
- automated abuse;
- brute-force attempts.

Use:

- server-side rate limits;
- cooldowns;
- provider limits;
- abuse logging where appropriate.

---

# 6.5 OTP Failure

Possible outcomes:

- invalid OTP;
- expired OTP;
- too many attempts;
- provider unavailable;
- network error.

The UI must distinguish recoverable verification failure from system failure.

---

# 6.6 Firebase Dependency Failure

If Firebase authentication is unavailable:

```text
Customer login cannot be completed
```

Do not create a partially authenticated customer session.

---

# 7. FIREBASE PUSH NOTIFICATION INTEGRATION

# 7.1 Purpose

Firebase-related notification services may deliver push notifications.

PondFish owns:

- notification event;
- recipient;
- notification content;
- notification status;
- retry policy;
- business context.

Firebase is the delivery mechanism.

---

# 7.2 Notification Flow

```text
PondFish Business Event
        ↓
Notification Engine
        ↓
Notification Record
        ↓
Firebase Adapter
        ↓
Firebase
        ↓
Customer Device
```

---

# 7.3 Device Token Management

Store device registration information with appropriate security and lifecycle handling.

A customer may have:

- multiple devices;
- old tokens;
- revoked tokens;
- refreshed tokens.

Invalid tokens must be handled without corrupting customer business data.

---

# 7.4 Notification Types

Current notification domains include:

- booking confirmation;
- booking cancellation;
- booking expiry;
- transaction updates;
- subscription information;
- delivery/truck events;
- applicable offers.

Exact triggers follow the final approved workflow.

---

# 7.5 Notification Failure

If Firebase delivery fails:

```text
Transaction remains successful.
Booking remains successful.
Subscription remains successful.
```

The notification record records the failure/retry state.

---

# 7.6 Scheduled Notifications

If scheduled notifications are implemented:

```text
Admin schedules
       ↓
PondFish notification job
       ↓
Eligibility/recipient validation
       ↓
Firebase delivery
```

The provider must not become the scheduling authority for PondFish business campaigns.

---

# 8. AI / OCR BILL EXTRACTION INTEGRATION

# 8.1 Purpose

AI/OCR extracts structured data from physical fish-shop bills.

Current workflow:

```text
Fish weighed
       ↓
Bill generated
       ↓
Customer/Worker captures bill
       ↓
AI extracts details
       ↓
Review
       ↓
PondFish transaction workflow
```

The current workflow does not require direct SI-810 system integration.

---

# 8.2 AI Adapter

The AI provider must be isolated:

```text
Bill Image
   ↓
AI Adapter
   ↓
Normalized BillExtractionResult
```

The rest of PondFish must not depend on the provider's proprietary response format.

---

# 8.3 Normalized Extraction Result

Conceptual structure:

```json
{
  "bill_id": "...",
  "items": [
    {
      "fish_name": "...",
      "quantity": 1.5,
      "unit_price": 400
    }
  ],
  "total": 600,
  "confidence": {}
}
```

The final schema belongs to the API contract.

---

# 8.4 AI Is Not Authoritative

AI may be wrong.

Therefore:

```text
AI Extraction
      ↓
Validation
      ↓
Human Review / Correction if needed
      ↓
Business Transaction
```

AI output alone must never:

- deduct inventory;
- charge a customer;
- consume subscription credit;
- mark transaction successful.

---

# 8.5 AI Failure

Possible:

- timeout;
- provider unavailable;
- unsupported image;
- poor image;
- partial extraction;
- unknown fish;
- incorrect total.

Fallback:

```text
Retry
or
Manual Correction / Entry
```

---

# 8.6 Image Privacy

Bill images may contain:

- customer information;
- transaction information;
- business information.

They must be transferred and stored securely.

Only the required provider/API should receive the image.

---

# 8.7 AI Provider Replacement

The core bill engine must not need rewriting if the AI provider changes.

Only:

```text
AI Adapter
```

and configuration should change, subject to output compatibility.

---

# 9. ONELAP GPS INTEGRATION

# 9.1 Purpose

OneLap provides GPS/location information for truck journeys.

The current requirements distinguish:

- continuous Admin GPS access;
- Admin-controlled customer tracking publication;
- customer live tracking;
- arrival detection;
- customer tracking closure;
- delivery history.

---

# 9.2 GPS Architecture

```text
OneLap
  ↓
OneLap Adapter
  ↓
Normalized GPS Location
  ↓
Journey Engine
  ├── Admin Tracking
  └── Customer Publication
```

---

# 9.3 Provider Boundary

OneLap-specific:

- API format;
- authentication;
- device identifiers;
- provider status;
- raw location payload;
- provider timestamps

remain inside the adapter.

PondFish uses a normalized internal model.

---

# 9.4 Normalized Location

Conceptual:

```json
{
  "journey_id": "...",
  "latitude": 17.4,
  "longitude": 78.4,
  "recorded_at": "ISO-8601",
  "received_at": "ISO-8601",
  "accuracy": 10,
  "source": "onelap"
}
```

Exact fields depend on OneLap API documentation.

---

# 9.5 Customer Publication

OneLap data does not automatically become customer-visible.

Correct:

```text
OneLap location
      ↓
PondFish journey state
      ↓
Admin publishes tracking
      ↓
Customer can receive location
```

Admin tracking and customer tracking are separate permissions/states.

---

# 9.6 Arrival

Arrival must be determined by the approved PondFish journey rules and available provider/location information.

After arrival:

```text
Customer tracking remains active
       ↓
Configured post-arrival period
       ↓
Customer tracking closes
```

Admin visibility may remain available.

---

# 9.7 GPS Staleness

If the provider stops sending fresh locations:

```text
last known location
+
stale=true
```

must be represented.

Do not present an old location as current.

---

# 9.8 OneLap Outage

If OneLap is unavailable:

- Admin sees integration/GPS failure;
- customer tracking may show unavailable/stale;
- bookings remain unchanged;
- payments remain unchanged;
- inventory remains unchanged;
- transactions remain unchanged.

---

# 9.9 OneLap Credentials

The client/vendor must provide official OneLap API documentation, credentials and required provider access before integration can be fully implemented.

This dependency is explicitly identified in the technical requirements material.

---

# 10. ESSAE SI-810 PRSS CURRENT WORKFLOW

# 10.1 Current Status

The technical documents identify ESSAE SI-810 PRSS integration planning, but the current PondFish workflow does not directly connect the weighing machine to the application.

Current flow:

```text
Fish Weighed
     ↓
SI-810 Generates Bill
     ↓
Customer / Worker Scans Bill
     ↓
AI Reads Bill
     ↓
PondFish Processes Transaction
```

There is currently no direct SI-810 system integration.

---

# 10.2 Current Integration Boundary

PondFish only receives the bill information through the current capture/AI workflow.

Do not build an assumed:

```text
SI-810 API
```

without official vendor documentation.

---

# 10.3 Client Dependencies

For future direct integration, the client must provide:

- physical SI-810 PRSS device;
- access to the store network;
- official communication protocol;
- API/SDK documentation where available;
- device communication method;
- IP/port configuration;
- test environment;
- vendor support contact where required.

---

# 11. FUTURE POS + SI-810 INTEGRATION

# 11.1 Architectural Goal

Future integration:

```text
ESSAE SI-810
       ↓
POS
       ↓
PondFish Adapter
       ↓
Normalized Bill
       ↓
Transaction Engine
```

The existing Transaction Engine remains authoritative.

---

# 11.2 Future Adapter Responsibilities

The adapter may:

- connect to hardware/POS;
- receive weight;
- receive fish/product information;
- receive Bill ID;
- receive bill total;
- normalize data;
- detect communication errors;
- acknowledge provider/POS messages where required.

It must not:

- independently finalize payment;
- independently deduct inventory;
- independently consume subscription credit.

---

# 11.3 Future Transaction Boundary

The normalized bill enters:

```text
Physical Bill Engine
      ↓
Subscription Engine
      ↓
Payment Engine
      ↓
Transaction Engine
      ↓
Inventory Engine
      ↓
TV Event
```

This prevents two competing transaction systems.

---

# 11.4 Future Duplicate Protection

The adapter must preserve provider identifiers such as:

- Bill ID;
- POS transaction ID;
- hardware transaction ID.

Map them to a PondFish idempotency/reference record.

---

# 11.5 Future Hardware Failure

If POS/hardware connection fails:

```text
Manual bill workflow
```

may remain the fallback if approved.

A hardware outage must not corrupt existing transactions.

---

# 12. APPLE / GOOGLE DISTRIBUTION DEPENDENCIES

These are not business integrations but are deployment dependencies.

## Apple

Required for iOS publication:

- Apple Developer Program access;
- appropriate app identifiers;
- certificates/signing configuration;
- App Store Connect access.

## Google

Required for Android publication:

- Google Play Console access;
- application signing;
- package/application ID;
- release configuration.

The client responsibility document identifies Apple Developer Program and Google Play Console access as required project inputs.

---

# 13. SUPABASE / POSTGRESQL BOUNDARY

The current technical direction identifies Supabase/PostgreSQL-based backend services.

PondFish backend owns:

- schema;
- transactions;
- authorization;
- business engines;
- API;
- event logic;
- audit;
- integration adapters.

Supabase/PostgreSQL remains infrastructure/data technology rather than an external business authority.

---

# 14. LOCAL STORE NETWORK

The technical requirements identify local connectivity between applicable hardware and operational software.

Current requirements may include:

```text
Store Network
   ├── Worker Devices
   ├── TV
   ├── Future POS
   └── Future SI-810
```

The exact network topology must be validated on site.

---

# 15. OFFLINE / CONNECTIVITY RULES

The current technical requirements mention a supported local storage/synchronization strategy for applicable operational data when internet connectivity is unavailable.

However, the architecture explicitly excludes an offline transaction queue from the current MVP.

Therefore:

## Current MVP

Critical financial operations should require authoritative backend connectivity.

Do not silently create offline successful transactions.

## Safe Offline Behavior

Clients may retain:

- UI state;
- unsent non-critical preferences;
- cached catalogue data;
- drafts where appropriate.

They must not claim:

- successful payment;
- successful transaction;
- successful booking;
- inventory deduction;
- subscription restoration

without backend confirmation.

---

# 16. INTEGRATION TIMEOUT POLICY

Each adapter must define:

```text
connect timeout
request timeout
retryable errors
non-retryable errors
maximum retries
```

Do not blindly retry every error.

Examples:

```text
401 / invalid credentials
→ do not retry immediately

429 / rate limit
→ controlled backoff

5xx
→ retry according to policy

network timeout
→ retry when operation is safe/idempotent
```

---

# 17. RETRY POLICY

## 17.1 Safe Retry

Safe for idempotent operations:

```text
GET
status query
reconciliation query
idempotent callback handling
```

## 17.2 Mutation Retry

Mutation retry requires:

```text
idempotency key
+
provider reference
+
duplicate detection
```

## 17.3 Exponential Backoff

Conceptual:

```text
Attempt 1
   ↓
short delay
   ↓
Attempt 2
   ↓
longer delay
   ↓
Attempt 3
   ↓
dead-letter / operational review
```

Exact timings are infrastructure configuration.

---

# 18. WEBHOOK / CALLBACK SECURITY

Where providers send callbacks:

1. verify authenticity/signature;
2. validate provider identifiers;
3. validate expected amount/context;
4. validate event type;
5. validate current PondFish state;
6. apply idempotent mutation;
7. record provider response;
8. audit critical changes.

Never trust:

```text
client-provided callback payload
```

without provider verification.

---

# 19. WEBHOOK REPLAY PROTECTION

Store sufficient information to identify already processed provider events.

Conceptual:

```text
provider
provider_event_id
received_at
processed_at
processing_status
```

If the same event arrives again:

```text
return existing processing result
```

Do not repeat side effects.

---

# 20. INTEGRATION LOGGING

Every integration request should be traceable without exposing secrets.

Recommended:

```text
request_id
integration
operation
provider_reference
business_entity
started_at
completed_at
result
error_code
retry_count
```

Never log:

- secret keys;
- access tokens;
- OTP;
- full payment credentials;
- sensitive customer data unnecessarily.

---

# 21. INTEGRATION OBSERVABILITY

Admin/engineering monitoring should be able to detect:

- Razorpay failure rate;
- payment verification failures;
- Firebase delivery failures;
- AI extraction failures;
- OneLap stale data;
- OneLap API failures;
- hardware communication failures;
- webhook failures;
- reconciliation discrepancies.

---

# 22. RECONCILIATION ENGINE

The system should provide controlled reconciliation for external systems.

## 22.1 Payment Reconciliation

Compare:

```text
PondFish
vs
Razorpay
```

## 22.2 GPS Reconciliation

Compare:

```text
PondFish journey state
vs
latest provider state
```

This should be diagnostic rather than silently rewriting journey state.

## 22.3 Hardware Reconciliation

Future:

```text
POS transaction IDs
vs
PondFish transaction IDs
```

---

# 23. INTEGRATION FAILURE MATRIX

| Integration | Failure | PondFish Response |
|---|---|---|
| Razorpay | timeout | payment remains pending/unknown until verified |
| Razorpay | rejected | payment failed |
| Razorpay | duplicate callback | ignore duplicate side effect |
| Firebase Auth | unavailable | login unavailable/retry |
| Firebase Push | unavailable | transaction remains successful; notification retry |
| AI | timeout | retry/manual workflow |
| AI | bad extraction | review/correction |
| OneLap | unavailable | GPS unavailable/stale |
| OneLap | stale | show stale state |
| SI-810 | unavailable | current bill workflow remains separate |
| Future POS | disconnected | fallback/manual workflow if approved |

---

# 24. SECURITY REQUIREMENTS

## 24.1 Server-Side Secrets

Store integration secrets only in secure server-side configuration.

## 24.2 Client Restrictions

Never place:

- Razorpay secret key;
- OneLap private credentials;
- Firebase server credentials;
- AI private keys;
- POS credentials

inside public frontend source.

## 24.3 Credential Rotation

Integration configuration must support credential replacement without code changes.

## 24.4 Least Privilege

Provider credentials should have only the permissions required.

---

# 25. CLIENT DEPENDENCY CHECKLIST

Before integration implementation, collect:

## Razorpay

- [ ] Razorpay account
- [ ] business verification
- [ ] required keys
- [ ] webhook configuration
- [ ] refund requirements
- [ ] production approval

## Firebase

- [ ] Firebase project
- [ ] authentication configuration
- [ ] notification configuration
- [ ] Android configuration
- [ ] iOS configuration where applicable
- [ ] required service credentials

## OneLap

- [ ] official API documentation
- [ ] credentials
- [ ] device/tracker identifiers
- [ ] API endpoint information
- [ ] webhook/polling method
- [ ] rate limits
- [ ] test environment

## AI/OCR

- [ ] provider/account
- [ ] API credentials
- [ ] supported image formats
- [ ] request limits
- [ ] retention/privacy policy
- [ ] expected extraction capabilities

## ESSAE SI-810

- [ ] device access
- [ ] vendor documentation
- [ ] communication protocol
- [ ] network requirements
- [ ] IP/port details
- [ ] SDK/API if available
- [ ] vendor technical support

## Deployment

- [ ] Supabase project
- [ ] production database
- [ ] hosting
- [ ] domain/DNS
- [ ] Apple Developer access
- [ ] Google Play Console access

---

# 26. TEST ENVIRONMENT REQUIREMENTS

Each integration should have a test/sandbox path where supported.

## Razorpay

Use test mode before production.

## Firebase

Use development project/configuration separate from production where appropriate.

## AI

Use controlled sample bills.

## OneLap

Use available test credentials/device or controlled test data.

## SI-810

Use physical device testing before attempting direct integration.

---

# 27. INTEGRATION TEST MATRIX

## Razorpay

- [ ] successful payment
- [ ] failed payment
- [ ] cancelled payment
- [ ] timeout
- [ ] duplicate callback
- [ ] amount mismatch
- [ ] invalid signature
- [ ] delayed callback
- [ ] provider outage
- [ ] refund
- [ ] duplicate refund attempt

## Firebase Auth

- [ ] valid OTP
- [ ] invalid OTP
- [ ] expired OTP
- [ ] too many attempts
- [ ] provider outage
- [ ] token/session refresh

## Firebase Notifications

- [ ] successful delivery
- [ ] invalid token
- [ ] provider failure
- [ ] retry
- [ ] duplicate event
- [ ] multiple devices

## AI/OCR

- [ ] clear bill
- [ ] blurry bill
- [ ] rotated bill
- [ ] missing Bill ID
- [ ] unknown fish
- [ ] incorrect quantity
- [ ] incorrect total
- [ ] provider timeout
- [ ] provider unavailable
- [ ] manual correction

## OneLap

- [ ] valid location
- [ ] stale location
- [ ] provider outage
- [ ] reconnect
- [ ] customer publication enabled
- [ ] customer publication disabled
- [ ] arrival
- [ ] post-arrival closure

## Future SI-810/POS

- [ ] device connection
- [ ] bill received
- [ ] duplicate bill
- [ ] invalid payload
- [ ] network interruption
- [ ] device restart
- [ ] transaction mapping

---

# 28. API ADAPTER CONTRACT

Every adapter should expose an internal interface independent of provider implementation.

Example:

```text
PaymentProvider
    createPayment()
    verifyPayment()
    getPaymentStatus()
    createRefund()
```

```text
GpsProvider
    getLatestLocation()
    getJourneyStatus()
```

```text
BillExtractionProvider
    extractBill()
```

```text
NotificationProvider
    sendNotification()
```

Future:

```text
PosProvider
    receiveBill()
    receiveWeight()
    receiveTransactionReference()
```

The domain engines depend on these interfaces, not concrete vendor SDKs.

---

# 29. ADAPTER RESULT CONTRACT

Every adapter should normalize:

```text
success
provider_reference
normalized_data
error_code
retryable
raw_reference where required
```

Do not expose raw provider errors directly to end users.

---

# 30. USER-FACING ERROR MAPPING

Provider error:

```text
RazorpayError: XXXXXXXXX
```

must become a PondFish-safe message:

```text
Payment could not be completed.
Please try again.
```

Internal logs retain the provider reference/error information.

The customer should not receive:

- API keys;
- provider stack traces;
- database errors;
- raw provider payloads.

---

# 31. INTEGRATION EVENTS

Recommended normalized internal events include:

```text
payment.created
payment.pending
payment.successful
payment.failed

notification.created
notification.sent
notification.failed

gps.location.received
gps.location.stale
journey.arrival.detected

bill.extraction.started
bill.extraction.completed
bill.extraction.failed

integration.error
integration.recovered
```

Events represent PondFish-normalized state, not raw provider noise.

---

# 32. INTEGRATION DATA RETENTION

Retention must follow the approved privacy/security policy.

Do not retain external provider payloads indefinitely by default.

Store only what is necessary for:

- business processing;
- reconciliation;
- audit;
- support;
- legal/accounting requirements;
- debugging.

---

# 33. INTEGRATION VERSIONING

Provider APIs can change.

Each adapter should track:

```text
provider
provider_api_version
adapter_version
```

Where the provider supports explicit API versions, pin the supported version rather than relying blindly on latest behavior.

---

# 34. PROVIDER CHANGE MANAGEMENT

Before changing provider integration:

1. review provider release notes;
2. check API changes;
3. update adapter;
4. run integration tests;
5. run regression tests;
6. validate reconciliation;
7. deploy;
8. monitor.

Do not modify core business engines merely because provider payload shape changed.

---

# 35. INTEGRATION ACCEPTANCE CRITERIA

## General

- [ ] Every provider is isolated behind an adapter.
- [ ] Business logic remains inside PondFish.
- [ ] Provider-specific payloads are normalized.
- [ ] Secrets remain server-side.
- [ ] Errors are mapped to stable PondFish error codes.
- [ ] Critical mutations are idempotent.
- [ ] Provider failures cannot corrupt committed business state.
- [ ] Integration activity is observable.
- [ ] Reconciliation is possible for critical external financial state.

## Razorpay

- [ ] Backend calculates amount.
- [ ] Backend verifies payment.
- [ ] Duplicate callbacks are safe.
- [ ] Provider references are stored.
- [ ] Payment mismatch is rejected.
- [ ] Refund references are stored where applicable.

## Firebase

- [ ] OTP/auth provider integration is isolated.
- [ ] Customer identity maps to PondFish customer records.
- [ ] Push delivery is downstream from business events.
- [ ] Invalid device tokens are handled.

## AI

- [ ] AI is never final business authority.
- [ ] Extraction results are normalized.
- [ ] Manual correction path exists.
- [ ] Provider failure has a fallback.
- [ ] Bill image handling is secure.

## OneLap

- [ ] Provider data is normalized.
- [ ] Admin and customer tracking are separate.
- [ ] Stale location is represented.
- [ ] Customer tracking closure follows PondFish journey rules.
- [ ] Provider outage does not affect financial workflows.

## ESSAE/POS

- [ ] Current MVP does not assume direct SI-810 integration.
- [ ] Future adapter boundary is documented.
- [ ] Future integration enters the existing transaction engine.
- [ ] Hardware identifiers are idempotency-safe.

---

# 36. AI CODING AGENT RULES

## Rule 01

Never import provider SDK code into domain engines unless the integration layer explicitly requires it.

## Rule 02

Never put provider secrets in client code.

## Rule 03

Never trust client-side payment success.

## Rule 04

Never trust AI extraction without validation.

## Rule 05

Never use raw OneLap payloads as the public API contract.

## Rule 06

Never make Firebase notification delivery the source of business state.

## Rule 07

Never create a second transaction engine for POS/SI-810.

## Rule 08

Never silently invent an SI-810 API/protocol.

## Rule 09

Never retry a non-idempotent mutation blindly.

## Rule 10

Never let an integration outage corrupt an already committed PondFish transaction.

---

# 37. INTEGRATION BUILD ORDER

Implement integrations in dependency order:

```text
01 Integration configuration/secrets
        ↓
02 Adapter interfaces
        ↓
03 Razorpay
        ↓
04 Firebase Auth/OTP where required
        ↓
05 Firebase Notifications
        ↓
06 AI/OCR
        ↓
07 OneLap
        ↓
08 Realtime integration consumers
        ↓
09 Reconciliation
        ↓
10 Monitoring/observability
        ↓
11 Future POS/SI-810 adapter
```

The current MVP should not block core development waiting for the future POS/SI-810 direct integration.

---

# 38. CURRENT MVP VS FUTURE

| Area | Current MVP | Future |
|---|---|---|
| Razorpay | Build | Maintain |
| Firebase Auth/OTP | Build where approved | Maintain |
| Firebase Push | Build | Expand |
| AI Bill Extraction | Build | Replace/upgrade provider if needed |
| OneLap | Build adapter | Expand provider capabilities |
| SI-810 direct | Not built | Adapter |
| POS | Not built | Adapter |
| Offline transaction queue | Excluded | Separate approved feature |
| Multiple stores | Excluded | Separate architecture expansion |
| Multiple trucks | Excluded | Journey model expansion |

---

# 39. FINAL INTEGRATION PRINCIPLE

> **External systems provide capabilities; PondFish owns business truth.**

Therefore:

```text
Razorpay
    → payment capability

Firebase
    → authentication/notification capability

AI/OCR
    → extraction capability

OneLap
    → GPS capability

ESSAE/POS
    → future weighing/bill capability

PondFish
    → customer
    → booking
    → subscription
    → inventory
    → transaction
    → audit
    → business state
```

This boundary keeps PondFish maintainable and prevents vendor lock-in from spreading through the product.

---

# 40. NEXT DOCUMENT

The next implementation artifact after this Integration Specification is:

```text
CROSS-SYSTEM VALIDATION & ERROR SPECIFICATION
```

That document will define how the Website, Customer App, Worker Portal, Admin Portal, TV and backend respond consistently to:

- validation failures;
- stale data;
- conflicts;
- payment uncertainty;
- inventory races;
- booking races;
- network failures;
- provider failures;
- permission failures;
- expired sessions;
- realtime disconnects;
- partial integration failures;
- recovery and retry states.

---

# DOCUMENT END
