# PondFish Digital Ecosystem
# Transaction TV Portal — Page-by-Page UI/UX Specification

**Document Type:** Product Build Specification / Page-by-Page UI Specification  
**Portal:** Transaction TV Display Portal  
**Version:** 1.0  
**Status:** Detailed Build Specification  
**Current Scope:** 1 Store + 1 TV Display  
**Primary Device:** Shop TV / Large Display  
**Audience:** Client, Product, UI/UX, Frontend, Backend, QA, DevOps, AI-assisted development teams  
**Source of Truth:** PondFish Master PRD + Transaction TV Display Portal PRD + shared backend architecture  
**Purpose:** Build-ready UI/UX and behavioral specification for the Transaction TV Portal.

---

# 1. DOCUMENT PURPOSE

This document converts the Transaction TV requirements into a page/state/component-level implementation specification.

The document is intentionally detailed because it is used before final production engineering to create:

1. the UI skeleton;
2. the Stitch/UI design template;
3. the frontend implementation;
4. the backend/realtime integration contract;
5. the QA test scenarios;
6. the AI coding-agent implementation context.

The TV Portal has a deliberately small interface surface. Its complexity is primarily in reliability, synchronization, state handling, display readability, and preventing incorrect transactions from appearing.

The TV is **not** a POS, worker dashboard, customer application, or Admin Portal.

The backend remains the authoritative source of transaction state.

---

# 2. NON-NEGOTIABLE PRODUCT RULES

## 2.1 Read-only portal

The TV can display data only.

The TV must not:

- create transactions;
- edit transactions;
- delete transactions;
- process payments;
- cancel transactions;
- refund transactions;
- complete bookings;
- modify inventory;
- modify subscriptions;
- modify customers;
- modify workers;
- modify GPS;
- manage notifications;
- expose Admin controls.

---

## 2.2 Only authoritative successful transactions appear

A transaction is eligible for TV display only after the backend has established the authoritative successful state.

The TV must never display:

- failed payment;
- pending payment;
- cancelled payment;
- abandoned payment;
- draft transaction;
- incomplete bill scan;
- failed AI extraction;
- extraction pending;
- awaiting verification;
- reconciliation-required transaction;
- any other non-successful state.

The source PRD explicitly defines the TV as a downstream display and states that a TV outage must never affect transaction success. fileciteturn27file0L36-L51

---

## 2.3 Backend is the source of truth

The TV must never infer transaction success from:

- payment UI;
- frontend navigation;
- local state;
- local storage;
- a worker action;
- an event alone.

The correct flow is:

```text
Transaction Finalized Successfully
        ↓
Persist Successful Transaction
        ↓
Commit
        ↓
Publish Successful Transaction Event
        ↓
TV Receives Event
        ↓
TV Displays Transaction
```

The event is a delivery mechanism, not proof of financial success.

---

## 2.4 No manual refresh for normal operation

A newly successful transaction must appear automatically.

The TV must use an authorized realtime mechanism such as WebSocket/SSE or the final engineering equivalent.

The exact technology remains an engineering decision. fileciteturn27file0L164-L179

---

## 2.5 Current business day only

The main TV feed displays successful transactions for the active server-defined business day.

The TV must not determine the business day from its local device clock.

At the next business day:

```text
Previous day active feed
        ↓
Removed from live display
        ↓
New business day
        ↓
Empty state until new successful transaction
```

Historical transactions remain in the backend.

---

# 3. PORTAL RESPONSIBILITY

## 3.1 Single responsibility

The TV Portal has one operational purpose:

> Make successful store transactions immediately visible to workers.

This supports the worker flow:

```text
Successful Transaction
        ↓
TV Display
        ↓
Worker Sees Transaction
        ↓
Worker Begins Fish Preparation
```

There is no TV completion action.

The worker does not mark the TV transaction as complete. fileciteturn27file0L213-L221

---

# 4. TARGET USER

The direct user is the **store worker viewing the TV from the shop floor**.

The TV is not designed for:

- customer self-service;
- management analysis;
- administration;
- financial reconciliation;
- transaction investigation.

The worker should be able to understand a new transaction within a few seconds without touching the screen.

---

# 5. DEVICE AND VIEWING ENVIRONMENT

## 5.1 Primary device

- Shop television
- Large display
- Browser-based application
- Landscape orientation
- Fixed mounted display
- No touch interaction required

## 5.2 Viewing distance

The UI must remain readable from the operational area of the shop.

Prioritize:

1. customer name;
2. fish and quantity;
3. paid amount;
4. time;
5. Bill ID;
6. transaction ID.

The source PRD explicitly prioritizes recognition over information density. fileciteturn27file0L755-L773

---

# 6. INFORMATION ARCHITECTURE

The MVP intentionally has one primary operational screen.

```text
TV Portal
│
└── TV-01 Main Transaction Display
    │
    ├── Initial Loading State
    ├── Empty State
    ├── Populated State
    ├── New Transaction Highlight
    ├── Connection-Lost State
    ├── Backend Error State
    ├── Reconnecting State
    ├── Invalid Display State
    ├── Maintenance State
    └── Fatal Application Error State
```

These are states of the same display rather than separate user-facing routes wherever practical.

---

# 7. PAGE / STATE INVENTORY

| ID | Page / State | Route Concept | User Action |
|---|---|---|---|
| TV-01 | Main Transaction Display | `/tv` | None |
| TV-01-L | Initial Loading | `/tv` state | None |
| TV-01-E | Empty Current Day | `/tv` state | None |
| TV-01-S | Successful Transactions | `/tv` state | None |
| TV-01-N | New Transaction Highlight | `/tv` state | None |
| TV-01-C | Connection Lost | `/tv` state | None |
| TV-01-R | Reconnecting | `/tv` state | None |
| TV-01-BE | Backend Load Error | `/tv` state | None |
| TV-01-A | Authentication/Registration Failure | `/tv` state | None |
| TV-01-M | Maintenance | `/tv` state | None |
| TV-01-404 | Invalid TV Route | `/unknown` | None |
| TV-01-500 | Fatal Application Error | `/tv` state | None |

The TV should avoid exposing technical routes to store workers.

---

# 8. GLOBAL UI DESIGN PRINCIPLES

## 8.1 Recognition over density

The worker should identify a transaction quickly.

Do not attempt to show every internal transaction field.

Display only operationally useful information.

---

## 8.2 Large typography

Use large typography suitable for TV viewing.

Recommended hierarchy:

```text
PondFish title
        ↓
Current business day / store context
        ↓
Customer name
        ↓
Fish + quantity
        ↓
Paid amount
        ↓
Bill / Transaction metadata
```

---

## 8.3 Strong contrast

The TV environment may include:

- bright shop lighting;
- glare;
- reflections;
- different TV panels;
- viewing from a distance.

Use strong text/background contrast.

Do not depend on color alone.

---

## 8.4 Minimal animation

Animations should communicate a new transaction.

Do not use:

- continuous floating animations;
- decorative particle effects;
- excessive gradients;
- rotating cards;
- excessive motion;
- complex transitions.

A new transaction can briefly highlight/fade into the top of the feed.

---

## 8.5 No interaction controls

The main display should not contain:

- buttons;
- forms;
- filters;
- edit icons;
- action menus;
- transaction controls;
- payment controls.

A display-only interface must visually communicate that it is read-only.

---

# 9. GLOBAL LAYOUT

## 9.1 Recommended structure

```text
┌─────────────────────────────────────────────────────────────────────┐
│ PondFish     Today's Successful Transactions        21 Sep 2026    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Customer       Fish & Quantity     Bill No.    Transaction   Time   │
│                                                                     │
│ Rahul          Rohu — 1.20 kg      B-1024      TX-1024       10:42  │
│ Priya          Pamplet — 2 kg      B-1025      TX-1025       10:39  │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

Paid amount should be visually prominent on the right side.

---

# 10. GLOBAL HEADER

## 10.1 Header content

Recommended:

```text
PondFish
Today's Successful Transactions
21 Sep 2026
```

Optional:

```text
Store Name
```

The date must come from the server-defined business context.

The TV device clock must not determine the business date. fileciteturn27file0L247-L253

---

# 11. TV-01 — MAIN TRANSACTION DISPLAY

## 11.1 Purpose

Display all successful transactions for the current business day in a clear, highly readable, real-time feed.

## 11.2 Access

Display-specific authorized access only.

No:

- customer login;
- worker login;
- Admin login.

---

## 11.3 Entry point

The TV application loads directly into the main display.

Expected flow:

```text
TV Browser Opens
      ↓
TV Display Authentication / Registration
      ↓
Server Business Date
      ↓
Initial Current-Day Synchronization
      ↓
Realtime Connection
      ↓
Main Display
```

---

## 11.4 Displayed data

Every transaction must contain:

- Customer Name
- Transaction ID
- Fish Name
- Fish Quantity
- Bill Number / Bill ID
- Transaction Time
- Combined Successfully Paid Amount

The required fields are defined in the existing TV PRD. fileciteturn27file0L110-L123

---

# 12. TRANSACTION ROW SPECIFICATION

## 12.1 Recommended columns

```text
Customer
Fish & Quantity
Bill No.
Transaction ID
Time
Paid
```

---

## 12.2 Customer column

Display:

```text
Rahul Kumar
```

Customer name should be prominent.

Do not display:

- phone number;
- email;
- address.

Privacy requirements explicitly exclude unnecessary customer data. fileciteturn27file0L597-L613

---

## 12.3 Fish and quantity column

Single item:

```text
Rohu
1.20 kg
```

Multiple items:

```text
Rohu — 1.20 kg
Pamplet — 0.80 kg
Catla — 1.00 kg
```

Always display quantity with `kg`.

Do not display ambiguous quantities such as:

```text
1.2
```

Prefer:

```text
1.20 kg
```

---

## 12.4 Bill ID

Example:

```text
BILL-1042
```

The value must come from the finalized transaction record.

---

## 12.5 Transaction ID

Example:

```text
TXN-0001042
```

Long IDs must remain readable.

If the visual width is insufficient:

- use controlled truncation;
- preserve the beginning and meaningful ending;
- allow tooltip/debug expansion only if the environment supports it.

Do not allow IDs to visually collide with adjacent columns.

---

## 12.6 Time

Display store-local server-derived time.

Example:

```text
10:42 AM
```

Do not use the TV device's local clock to generate transaction time.

The server timestamp is authoritative. fileciteturn27file0L741-L751

---

## 12.7 Paid amount

Display the combined successfully paid amount.

Example:

```text
₹1,250
```

The amount must come from the finalized transaction.

Do not expose:

- card details;
- payment tokens;
- subscription balance;
- gateway secrets. fileciteturn27file0L147-L160

---

# 13. MULTIPLE FISH TRANSACTIONS

A transaction may contain multiple fish.

Example:

```text
Customer: Ravi

Fish:
Rohu — 1.20 kg
Pamplet — 0.80 kg
Catla — 1.00 kg

Paid:
₹2,450
```

Rules:

1. Do not create three transaction rows.
2. Create one transaction row.
3. Show all associated fish within that row/card.
4. Preserve readability.
5. Keep the combined paid amount associated with the transaction.

---

# 14. INITIAL LOADING STATE

## 14.1 Purpose

Communicate that the TV is loading today's authoritative transaction feed.

## 14.2 Display

Preferred:

```text
Loading today's transactions...
```

A subtle loading indicator may appear.

Do not display:

```text
500 Internal Server Error
```

Do not display:

```text
GET /api/transactions failed
```

Do not expose stack traces.

The source PRD specifically requires a user-safe loading message and prohibits raw technical backend errors. fileciteturn27file0L257-L271

---

# 15. LOADING VISUAL DESIGN

Use:

- centered status message;
- simple loading indicator;
- high contrast;
- no distracting animation.

Avoid a skeleton table if the TV is expected to load quickly and there is no meaningful content structure to preview.

If the implementation uses skeletons, keep them simple and stable.

---

# 16. EMPTY STATE

## 16.1 Condition

No successful transactions exist for the current business day.

## 16.2 Message

```text
No successful transactions yet today.
```

Optional secondary text:

```text
New successful transactions will appear here automatically.
```

## 16.3 Important rule

This is not an error.

Do not show:

```text
No data found
```

with an error icon.

The display remains active and waiting for realtime events. fileciteturn27file0L275-L283

---

# 17. POPULATED STATE

When transactions exist:

```text
Header
   ↓
Newest successful transaction
   ↓
Previous successful transaction
   ↓
Older successful transactions
```

Newest transaction appears first.

Server timestamp/sequence controls ordering. fileciteturn27file0L183-L193

---

# 18. NEW TRANSACTION STATE

When a new successful transaction arrives:

1. insert it at the top;
2. briefly highlight it;
3. make it visually identifiable;
4. allow the worker to recognize it quickly.

Possible treatment:

```text
New transaction
┌───────────────────────────────────────────────────────────────┐
│ Rahul Kumar | Rohu — 1.20 kg | B-1042 | 10:42 | ₹1,250       │
└───────────────────────────────────────────────────────────────┘
```

Highlight must be temporary.

It must not change the transaction's backend state.

---

# 19. SOUND NOTIFICATION

## 19.1 Existing requirement

The TV portal is responsible for its own sound notification behavior.

The worker portal must not attempt to substitute for the TV event.

The existing worker specification states that the TV owns its own sound notification relationship. fileciteturn26file6L1118-L1136

## 19.2 MVP decision

The current TV PRD says no sound is required for MVP.

Therefore:

**Do not make sound a required MVP dependency.**

If the client later confirms sound as an MVP requirement, implement it as a TV-side enhancement:

```text
Successful Transaction Event
        ↓
TV receives event
        ↓
Visual highlight
        ↓
Short notification sound
```

The sound must never be required for financial transaction success.

---

# 20. AUDIO DESIGN IF ENABLED

If sound is enabled later:

## 20.1 Sound characteristics

Use:

- short;
- clear;
- non-irritating;
- easy to distinguish from ambient shop noise;
- low duration;
- consistent volume.

Avoid:

- loud alarms;
- long melodies;
- repeated sounds during synchronization;
- sound on page load;
- sound for duplicate events.

---

## 20.2 Sound trigger

Sound only when:

```text
A genuinely new successful transaction
```

arrives.

Do not sound for:

- initial synchronization;
- browser refresh;
- TV restart;
- reconnect synchronization;
- duplicate events;
- re-render;
- out-of-order correction.

---

# 21. CONNECTION STATUS

The TV should continue displaying synchronized data even when realtime connectivity is temporarily unavailable.

## 21.1 Normal connected state

No connection badge is required.

The interface should remain clean.

---

## 21.2 Realtime disconnected state

Do not clear existing transactions.

Display a subtle operational message such as:

```text
Connection interrupted. Reconnecting...
```

The message should not dominate the screen.

The source PRD requires existing transactions to remain visible while reconnecting. fileciteturn27file0L301-L311

---

# 22. RECONNECTING STATE

When the realtime channel is reconnecting:

```text
Connection interrupted
Reconnecting...
```

The application must automatically:

1. reconnect;
2. synchronize authoritative current-day transactions;
3. identify missing transactions;
4. remove duplicates;
5. reorder;
6. resume realtime subscription.

Reconnection is synchronization, not merely reopening the socket. fileciteturn27file0L315-L327

---

# 23. BACKEND LOAD ERROR

If the current-day transaction list cannot be loaded:

```text
Unable to load today's transactions.
Reconnecting...
```

The TV should:

- preserve previously synchronized records if available;
- retry automatically;
- avoid raw API errors;
- avoid requiring worker interaction.

---

# 24. PARTIAL DATA FAILURE

If optional metadata is missing but required display fields remain valid, the transaction may still be displayed.

Required:

- customer name;
- transaction ID;
- fish name;
- quantity;
- Bill ID;
- time;
- successfully paid amount.

If required fields are missing:

```text
Do not render the invalid payload.
```

The backend should prevent publication of an invalid TV event and route it through retry/reconciliation.

The underlying transaction remains successful. fileciteturn27file0L497-L512

---

# 25. INVALID EVENT PAYLOAD

If a received event fails schema validation:

1. reject rendering;
2. log the event safely;
3. do not show broken UI;
4. do not create a partial row;
5. allow backend/event reconciliation;
6. continue processing later valid events.

The TV must not display a half-populated transaction.

---

# 26. EVENT IDEMPOTENCY

Duplicate events are expected to be possible.

Example:

```text
Event TX-1042 received
Event TX-1042 received again
```

Result:

```text
ONE row only
```

Never:

```text
TX-1042
TX-1042
```

Use stable event/transaction identifiers.

The source PRD explicitly requires duplicate events to result in only one displayed transaction. fileciteturn27file0L419-L430

---

# 27. EVENT ORDERING

Network delivery may produce:

```text
TX103
TX101
TX102
```

The TV must reorder using authoritative server information.

Preferred ordering inputs:

1. sequence number;
2. server transaction timestamp;
3. stable event metadata.

Do not use client arrival time as transaction ordering.

---

# 28. INITIALIZATION RACE CONDITION

A transaction can succeed while the TV is:

- loading;
- authenticating;
- subscribing to realtime;
- rendering.

The initialization sequence must prevent a transaction from falling between initial fetch and subscription.

Recommended:

```text
Load current-day state
        ↓
Establish realtime subscription
        ↓
Reconcile by server state/sequence
        ↓
Render authoritative final set
```

The implementation must explicitly address this race condition. fileciteturn27file0L450-L465

---

# 29. TV OFFLINE DURING SUCCESSFUL TRANSACTION

Scenario:

```text
Customer completes purchase
        ↓
Payment verified
        ↓
Transaction finalized Successful
        ↓
TV is offline
```

Expected result:

```text
Transaction remains Successful
        ↓
Event remains recoverable
        ↓
TV reconnects
        ↓
Current-day synchronization
        ↓
Transaction appears
```

The TV must never cause payment retry or transaction failure.

---

# 30. TV RESTART

After a restart:

```text
Application loads
      ↓
Display authentication
      ↓
Server business date
      ↓
Current-day successful transactions
      ↓
Realtime connection
      ↓
Startup reconciliation
      ↓
Normal display
```

Do not rely only on browser local storage.

The backend remains authoritative. fileciteturn27file0L331-L343

---

# 31. BROWSER REFRESH

After refresh:

- current-day transactions reload;
- duplicates remain prevented;
- realtime resumes;
- current business date is re-established.

The day's transaction history must not disappear merely because the browser refreshed. fileciteturn27file0L347-L355

---

# 32. BUSINESS-DAY TRANSITION

At a new business day:

1. server determines new business date;
2. TV switches context;
3. previous-day feed is removed from active display;
4. new-day successful transactions are loaded;
5. realtime continues.

Historical records are not deleted.

---

# 33. SCROLLING

If transaction count exceeds the visible height:

Preferred:

- vertical transaction feed;
- newest first;
- readable fixed row height;
- controlled scrolling.

Optional:

- slow automatic scroll.

Avoid:

- fast scrolling;
- continuous marquee;
- rapidly moving rows;
- animation that prevents reading.

The PRD specifically requires new transactions to remain discoverable and readable. fileciteturn27file0L483-L493

---

# 34. LARGE TRANSACTION VOLUME

Current MVP:

- one store;
- expected manageable daily volume.

If volume grows:

- virtualized rendering;
- lazy loading;
- optimized feed;
- server pagination/synchronization.

The UI must not sacrifice current-day successful transaction availability merely because volume increases.

---

# 35. LONG CUSTOMER NAME

Example:

```text
Venkata Satyanarayana Prasad Kumar
```

Rules:

- do not overlap adjacent fields;
- wrap to a controlled maximum;
- preserve readability;
- use ellipsis only when necessary;
- do not shrink the entire TV typography excessively.

---

# 36. LONG BILL ID

If:

```text
PF-BILL-20260921-HYD-STORE-0001042
```

is too long:

- controlled truncation is acceptable;
- preserve enough identifying information;
- keep full value available through engineering/debugging mechanisms, not by breaking the visual layout.

---

# 37. LARGE AMOUNT

Example:

```text
₹125,000
```

The amount must remain readable.

Do not allow currency formatting to break into an unusable layout.

---

# 38. DECIMAL QUANTITY

Examples:

```text
0.50 kg
1.20 kg
12.75 kg
```

Always include the unit.

---

# 39. RESPONSIVE TV LAYOUT

The primary target is a fixed large display.

Support reasonable browser viewport variation.

Recommended breakpoints should be defined by actual target TV resolution during implementation.

Do not create a phone-style responsive layout.

---

# 40. DESIGN SYSTEM

## 40.1 Visual character

The TV UI should feel:

- professional;
- operational;
- clean;
- calm;
- highly readable;
- trustworthy;
- visually connected to PondFish branding.

It should not look like:

- a marketing landing page;
- an AI dashboard;
- a gaming UI;
- a neon control room;
- a dense ERP table.

---

# 41. COLOR SYSTEM

Use the final PondFish design-system tokens rather than inventing independent TV colors.

Suggested semantic roles:

```text
Background
Surface
Primary Text
Secondary Text
Success
Warning
Error
Highlight
Divider
```

The exact production values must come from the approved PondFish Design System document.

Do not introduce unrelated gradients or colors.

---

# 42. SUCCESS COLOR USAGE

Success color may be used for:

- subtle successful status;
- new transaction highlight;
- amount emphasis if approved.

Do not color the entire screen green.

The TV's purpose is transaction recognition, not celebratory UI.

---

# 43. ERROR COLOR USAGE

Error color should be limited to:

- connection issue indicator;
- backend error indicator;
- invalid display state.

Do not make a temporary network issue look like a financial transaction failure.

---

# 44. TYPOGRAPHY

Use the approved PondFish typography.

Recommended hierarchy:

```text
TV Title
→ large

Customer Name
→ very large / prominent

Fish + Quantity
→ large

Paid Amount
→ very large / prominent

Bill + Transaction metadata
→ medium

Connection status
→ medium
```

---

# 45. SPACING

Use consistent spacing tokens.

Avoid:

- tightly packed rows;
- excessive empty decorative space;
- inconsistent cell padding.

Every transaction should have sufficient separation for recognition.

---

# 46. CARD VS TABLE DECISION

The default recommended presentation is a structured transaction feed.

A table works well when:

- the screen is wide;
- transaction fields have predictable widths;
- multiple transactions must be visible simultaneously.

Cards can be used if the final visual design proves more readable from the actual store distance.

Do not convert every transaction into a giant decorative card.

---

# 47. RECOMMENDED TRANSACTION ROW

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Rahul Kumar        Rohu — 1.20 kg       B-1042    TX-1042   10:42    │
│                    Pamplet — 0.80 kg                              ₹1,250 │
└───────────────────────────────────────────────────────────────────────┘
```

The paid amount should remain visually anchored to the right.

---

# 48. NEW TRANSACTION VISUAL

Recommended:

```text
NEW
Rahul Kumar
Rohu — 1.20 kg
₹1,250
```

The highlight can fade after a short period.

Do not permanently badge every transaction as "NEW".

---

# 49. NO-DATA VISUAL

```text
PondFish

No successful transactions yet today.

New successful transactions will appear here automatically.
```

The empty state should look intentional and operational, not broken.

---

# 50. ERROR VISUAL

```text
PondFish

Unable to load today's transactions.

Reconnecting...
```

Existing cached/synchronized transactions remain visible if available.

---

# 51. CONNECTION INDICATOR

A small status indicator may appear in a corner:

```text
● Live
```

or:

```text
● Reconnecting
```

Use this only if it improves operational confidence.

It must not compete with transaction data.

---

# 52. LIVE STATUS

If shown:

```text
● LIVE
```

means:

- initial sync completed;
- realtime subscription active;
- current-day state synchronized.

It does not mean a financial transaction is happening.

---

# 53. SECURITY

TV authentication must be display-specific.

The TV must not contain:

- worker passwords;
- admin passwords;
- customer credentials;
- payment secrets.

The TV receives read-only authorized transaction data.

Server-side authorization is mandatory. fileciteturn27file0L93-L106

---

# 54. TV REGISTRATION

A display registration flow may be required during installation.

Conceptually:

```text
Unregistered Display
        ↓
Secure Registration
        ↓
Display ID Assigned
        ↓
Authorized Read-Only Session
        ↓
Main TV Display
```

The registration mechanism should be finalized by engineering/security.

Do not expose credentials directly on the TV.

---

# 55. UNAUTHORIZED DISPLAY STATE

If display authentication/registration fails:

```text
This display is not authorized.

Please contact the store administrator.
```

Do not show:

- tokens;
- API keys;
- server details;
- authentication stack traces.

---

# 56. INVALID DISPLAY STATE

If the display has been revoked:

```text
This display is no longer authorized.

Please contact the administrator.
```

The application should stop attempting normal transaction synchronization until authorization is restored.

---

# 57. MAINTENANCE STATE

If the backend explicitly reports maintenance:

```text
PondFish is temporarily unavailable.

The display will reconnect automatically.
```

If previously synchronized transaction data is safe to retain, it may remain visible with a subtle maintenance indicator.

---

# 58. 404 STATE

Because the TV normally uses one controlled route, a 404 is primarily a defensive state.

Display:

```text
Page not found

This display page does not exist.
```

Avoid exposing a generic website navigation system.

If the TV application detects the invalid route, it may automatically return to `/tv` when safe.

---

# 59. 500 / FATAL ERROR STATE

Display:

```text
Something went wrong.

The PondFish display is recovering automatically.
```

Provide no raw stack trace.

If automatic recovery is possible:

```text
Retrying...
```

The TV should attempt application-level recovery.

---

# 60. NETWORK FAILURE STATE

Network failure should not look like transaction failure.

Preferred:

```text
Connection interrupted

Existing transactions remain visible.
Reconnecting automatically...
```

Rules:

- retain last synchronized data;
- continue retrying;
- do not clear successful transactions;
- do not create duplicates after reconnect;
- resynchronize after recovery.

---

# 61. BACKEND FAILURE STATE

If backend is unavailable:

```text
PondFish service temporarily unavailable.

Reconnecting...
```

Do not say:

```text
Database connection refused
```

or:

```text
HTTP 503
```

to store workers.

---

# 62. REALTIME FAILURE STATE

If only realtime delivery fails:

```text
Live connection interrupted.
Reconnecting...
```

The existing current-day feed remains visible.

Once reconnected:

```text
Synchronize
→ deduplicate
→ reorder
→ resume
```

---

# 63. API FAILURE STATE

For initial load failure:

```text
Unable to load today's transactions.
Reconnecting...
```

Retry automatically.

A manual retry button is unnecessary for normal TV operation because no worker should need to operate the display.

---

# 64. TRANSACTION EVENT CONTRACT

Recommended payload:

```json
{
  "event_id": "evt_123",
  "event_type": "transaction.successful",
  "transaction_id": "TX-1042",
  "customer_name": "Rahul Kumar",
  "bill_id": "B-1042",
  "items": [
    {
      "fish_id": "fish_rohu",
      "fish_name": "Rohu",
      "quantity_kg": 1.2
    }
  ],
  "transaction_time": "2026-09-21T10:42:00+05:30",
  "combined_successful_paid_amount": 1250,
  "business_date": "2026-09-21",
  "sequence_number": 1042,
  "created_at": "2026-09-21T10:42:01+05:30"
}
```

The exact API schema is an engineering decision.

The existing PRD recommends enough event data for the TV to render without unnecessary dependent requests. fileciteturn27file0L396-L415

---

# 65. EVENT VALIDATION

Before rendering an event:

```text
event exists
AND
event type is allowed
AND
transaction ID exists
AND
customer name exists
AND
items are valid
AND
Bill ID exists
AND
time exists
AND
paid amount exists
AND
business date matches active business date
AND
transaction status is authoritative Successful
```

If validation fails:

```text
Do not render.
```

---

# 66. TRANSACTION ELIGIBILITY

Conceptual rule:

```text
transaction.status === SUCCESSFUL
```

plus all required financial/business finalization checks.

For Razorpay:

```text
Payment server-verified
+
Transaction finalized successfully
```

For cash:

```text
Permitted cash confirmation completed
+
Transaction finalized successfully
```

Only then may the transaction enter the TV feed. fileciteturn27file0L359-L375

---

# 67. TV API SURFACE

Representative APIs:

```text
GET /tv/transactions?business_date=YYYY-MM-DD

POST /tv/displays/register

Realtime:
WebSocket / SSE equivalent

GET /tv/transactions/sync
    ?business_date=YYYY-MM-DD
    &after=sequence
```

These are representative contracts, not a mandatory final URL structure.

The existing TV PRD defines the same conceptual API responsibilities. fileciteturn27file0L660-L682

---

# 68. API SECURITY RULES

TV APIs must:

- authenticate the display;
- authorize read-only access;
- return only display-safe data;
- prevent mutations;
- support synchronization;
- use server timestamps;
- avoid unnecessary personal information.

The TV API must not support:

- payment;
- transaction creation;
- transaction editing;
- cancellation;
- refunds.

---

# 69. FRONTEND STATE MODEL

Recommended conceptual states:

```text
UNINITIALIZED
        ↓
AUTHENTICATING
        ↓
LOADING
        ↓
READY_EMPTY
        ↓
READY_WITH_TRANSACTIONS
        ↓
RECONNECTING
        ↓
SYNCHRONIZING
        ↓
READY_WITH_TRANSACTIONS
```

Error branches:

```text
AUTHENTICATION_ERROR
BACKEND_ERROR
INVALID_PAYLOAD
MAINTENANCE
FATAL_ERROR
```

---

# 70. STATE TRANSITION RULES

## Uninitialized → Authenticating

When the application starts.

## Authenticating → Loading

When display authorization succeeds.

## Authenticating → Authentication Error

When authorization fails.

## Loading → Ready Empty

When synchronization succeeds and there are no successful transactions.

## Loading → Ready With Transactions

When synchronization succeeds with transactions.

## Loading → Backend Error

When current-day synchronization fails.

## Ready → Reconnecting

When realtime connection is lost.

## Reconnecting → Synchronizing

When connectivity returns.

## Synchronizing → Ready

When reconciliation completes.

---

# 71. LOCAL STORAGE

Do not treat local storage as the source of truth.

Local storage may contain:

- non-sensitive display preferences;
- display registration metadata if security permits;
- UI preferences.

Do not rely on local storage for:

- transaction success;
- payment state;
- authoritative transaction history;
- business date.

---

# 72. CACHING

A temporary cache may be used for resilience.

Rules:

- cached records are display-only;
- server synchronization overrides cache;
- stale data must not be presented as newly successful;
- cache must not create transactions;
- cache must not mutate financial state.

---

# 73. REFRESH SAFETY

Browser refresh must produce:

```text
Current business date
+
Current successful transaction list
+
Realtime subscription
+
Reconciliation
```

not:

```text
Blank screen
```

---

# 74. DUPLICATE PROTECTION

Use:

```text
transaction_id
```

or a stable event identifier.

Before insertion:

```text
if transaction already exists:
    ignore duplicate
else:
    insert transaction
```

Do not use customer name as the uniqueness key.

Two transactions may belong to the same customer.

---

# 75. SAME CUSTOMER MULTIPLE TRANSACTIONS

Example:

```text
Rahul Kumar — TX1042
Rahul Kumar — TX1045
```

Both must display if both are successful.

Do not collapse them because the customer name matches.

---

# 76. SAME BILL MULTIPLE EVENTS

If the same transaction event is repeated:

```text
ONE display record
```

If the backend legitimately creates separate transactions with different transaction IDs:

```text
Separate display records
```

The backend identifier is authoritative.

---

# 77. EVENT REPLAY

A reconnect may cause previously delivered events to be replayed.

Expected behavior:

```text
Receive event
→ validate
→ identify transaction
→ detect existing transaction
→ ignore duplicate
```

No visual duplicate.

---

# 78. OUT-OF-ORDER EVENTS

Example:

```text
TX-100
TX-102
TX-101
```

After reconciliation:

```text
TX-102
TX-101
TX-100
```

according to authoritative server sequence/time.

---

# 79. BUSINESS DATE FILTER

The TV must reject or exclude events belonging to another business date.

Example:

```text
Active date: 2026-09-21

Event date: 2026-09-20
```

Do not add it to the live feed.

Historical data remains in backend systems.

---

# 80. TIMEZONE

Use the configured store timezone.

For Hyderabad store deployment:

```text
Asia/Kolkata
```

The exact production timezone must come from business configuration.

The TV must not infer timezone from browser locale.

---

# 81. TRANSACTION DISPLAY ORDER

Default:

```text
Newest first
```

Use:

```text
server sequence
```

where available.

Fallback:

```text
server transaction timestamp
```

Never:

```text
client receivedAt
```

---

# 82. PERFORMANCE REQUIREMENTS

The TV must:

- load quickly;
- remain stable for the full business day;
- handle continuous events;
- avoid memory leaks;
- avoid unnecessary polling;
- reconnect after transient failures;
- remain responsive.

These are explicit TV performance requirements. fileciteturn27file0L799-L809

---

# 83. MEMORY MANAGEMENT

When rendering a long-running feed:

- remove stale DOM/event listeners;
- avoid duplicated realtime subscriptions;
- clear obsolete timers;
- avoid retaining every event object unnecessarily;
- use virtualization if required.

The TV may run for many hours without page reload.

---

# 84. REALTIME SUBSCRIPTION LIFECYCLE

On mount:

```text
authenticate
→ subscribe
```

On disconnect:

```text
mark connection unhealthy
→ retry
```

On reconnect:

```text
subscribe
→ synchronize
→ reconcile
```

On unmount:

```text
unsubscribe
→ clear timers
→ release listeners
```

---

# 85. NO POLLING AS PRIMARY MECHANISM

Do not use aggressive polling as the primary realtime mechanism.

Realtime should be event-driven.

Polling/synchronization can be used as:

- startup synchronization;
- reconnect reconciliation;
- recovery mechanism;
- health fallback if approved.

---

# 86. ANIMATION RULES

Allowed:

- subtle new-row highlight;
- short fade;
- controlled slide-in;
- subtle connection status transition.

Avoid:

- bounce;
- zoom;
- spin;
- parallax;
- large moving gradients;
- constant animated backgrounds.

---

# 87. ACCESSIBILITY

Even though this is a TV display:

- maintain sufficient contrast;
- do not communicate state by color alone;
- use readable font sizes;
- avoid flashing;
- avoid rapid animation;
- ensure text remains understandable without sound.

Sound, if enabled later, is supplementary.

---

# 88. PRIVACY

Allowed:

```text
Customer name
Transaction ID
Fish
Quantity
Bill ID
Time
Paid amount
```

Not allowed:

```text
Phone
Email
Address
Subscription balance
Card details
Payment credentials
Private customer history
```

The TV is visible to people in the store, so data minimization is mandatory.

---

# 89. ADMIN RELATIONSHIP

Admin controls:

- transaction history;
- financial analytics;
- inventory;
- worker performance;
- investigation;
- audit;
- reconciliation.

The TV consumes only the final display-safe transaction state.

Admin must never need to manually edit the TV.

This separation is explicitly defined in the TV PRD. fileciteturn27file0L617-L631

---

# 90. WORKER RELATIONSHIP

Correct architecture:

```text
Worker Portal
      ↓
Transaction Backend
      ↓
Successful Transaction Event
      ↓
TV Portal
```

Incorrect:

```text
Worker Portal
      ↓
Directly update TV
```

The worker portal must never directly manipulate TV UI state. fileciteturn27file0L635-L645

---

# 91. CUSTOMER RELATIONSHIP

The customer-facing transaction/receipt experience is independent of the TV.

A successful physical transaction may update customer history.

The TV independently displays its operational summary.

---

# 92. COMPONENT INVENTORY

Recommended reusable components:

```text
TVShell
TVHeader
BusinessDateLabel
StoreLabel
TransactionFeed
TransactionRow
TransactionItemList
PaidAmount
TransactionMeta
ConnectionStatus
LoadingState
EmptyState
ReconnectState
BackendErrorState
UnauthorizedDisplayState
MaintenanceState
FatalErrorState
NewTransactionHighlight
DisplayClockLabel
```

---

# 93. COMPONENT: TVShell

Responsibilities:

- full-screen layout;
- background;
- header;
- feed container;
- global connection status.

Must not contain business logic for payment.

---

# 94. COMPONENT: TVHeader

Displays:

- PondFish branding;
- title;
- business date;
- optional store name;
- optional live status.

Do not display administrative controls.

---

# 95. COMPONENT: TransactionFeed

Responsibilities:

- ordered list;
- duplicate protection;
- rendering;
- scrolling;
- new transaction insertion;
- large-volume rendering.

It should consume already-authorized display-safe transaction data.

---

# 96. COMPONENT: TransactionRow

Responsibilities:

- customer name;
- fish list;
- bill ID;
- transaction ID;
- time;
- paid amount;
- new-item highlight.

It should not make payment/API mutation calls.

---

# 97. COMPONENT: ConnectionStatus

Possible states:

```text
LIVE
RECONNECTING
SYNCING
OFFLINE
```

Keep the visual treatment subtle.

---

# 98. COMPONENT: EmptyState

Text:

```text
No successful transactions yet today.
```

Optional:

```text
New successful transactions will appear automatically.
```

No retry button required.

---

# 99. COMPONENT: LoadingState

Text:

```text
Loading today's transactions...
```

No technical details.

---

# 100. COMPONENT: ErrorState

Text:

```text
Unable to load today's transactions.
Reconnecting...
```

Automatically retries.

---

# 101. COMPONENT: UnauthorizedDisplayState

Text:

```text
This display is not authorized.
Please contact the store administrator.
```

No technical credentials.

---

# 102. COMPONENT: MaintenanceState

Text:

```text
PondFish is temporarily unavailable.
The display will reconnect automatically.
```

---

# 103. COMPONENT: FatalErrorState

Text:

```text
Something went wrong.
The PondFish display is recovering automatically.
```

Application may attempt safe reload.

---

# 104. DATA OWNERSHIP

The TV does not own transaction data.

Authoritative owner:

```text
Shared Transaction Backend
```

TV owns only:

```text
Display state
UI state
Connection state
Temporary rendered state
```

---

# 105. SOURCE OF TRUTH MATRIX

| Data | Authority |
|---|---|
| Transaction success | Backend |
| Payment success | Backend/payment verification |
| Transaction amount | Finalized transaction |
| Fish quantity | Finalized transaction |
| Customer name | Finalized transaction/customer data |
| Bill ID | Finalized transaction |
| Transaction time | Server |
| Business date | Server |
| Ordering | Server sequence/timestamp |
| Display authorization | Backend |
| Realtime delivery | Realtime infrastructure |
| Visual highlight | TV UI |
| Sound | TV UI, if enabled |

---

# 106. SUCCESSFUL TRANSACTION FLOW

```text
Physical Purchase
      ↓
Bill Scan
      ↓
AI Extraction
      ↓
Worker Verification
      ↓
Subscription Calculation
      ↓
Payment
      ↓
Server Verification
      ↓
Transaction Finalized Successful
      ↓
Transaction Database
      ↓
Successful Transaction Event
      ↓
TV Receives Event
      ↓
Validate Event
      ↓
Deduplicate
      ↓
Order
      ↓
Render
      ↓
Worker Sees Transaction
      ↓
Fish Preparation
```

This matches the established final workflow. fileciteturn28file0L50-L54

---

# 107. FAILED TRANSACTION FLOW

```text
Transaction Attempt
      ↓
Payment/Validation Failure
      ↓
Transaction Not Successful
      ↓
NO successful TV event
      ↓
NOT displayed
```

The TV must not become a payment-status monitor.

---

# 108. PENDING TRANSACTION FLOW

```text
Payment Pending
      ↓
No Successful Finalization
      ↓
No TV Success Event
      ↓
Not Displayed
```

---

# 109. TV OFFLINE FLOW

```text
Transaction Successful
      ↓
TV Offline
      ↓
Backend retains success
      ↓
Event remains recoverable
      ↓
TV reconnects
      ↓
Current-day synchronization
      ↓
Transaction appears
```

---

# 110. RECONNECT FLOW

```text
Connection Lost
      ↓
Keep Existing Feed
      ↓
Retry Connection
      ↓
Connection Restored
      ↓
Fetch Current-Day State
      ↓
Compare / Deduplicate
      ↓
Reorder
      ↓
Render
      ↓
Resume Realtime
```

---

# 111. STARTUP FLOW

```text
Browser Start
      ↓
Load TV Application
      ↓
Authenticate Display
      ↓
Get Server Business Date
      ↓
Load Current-Day Successful Transactions
      ↓
Establish Realtime
      ↓
Reconcile Startup Race
      ↓
Render
```

---

# 112. DAILY RESET FLOW

```text
Business Date Changes
      ↓
Server Determines New Business Date
      ↓
TV Updates Active Context
      ↓
Old Active Feed Removed
      ↓
New Day Synchronization
      ↓
Empty or New Transactions
```

---

# 113. ERROR MESSAGE RULES

Every error shown to the worker must be:

1. human-readable;
2. short;
3. actionable or self-explanatory;
4. non-technical;
5. non-sensitive.

Bad:

```text
WebSocket 1006 ECONNABNORMAL
```

Good:

```text
Live connection interrupted.
Reconnecting...
```

---

# 114. ERROR MESSAGE MAPPING

| Technical Condition | User-Facing Message |
|---|---|
| Initial API failure | Unable to load today's transactions. Reconnecting... |
| Realtime disconnect | Connection interrupted. Reconnecting... |
| Unauthorized display | This display is not authorized. |
| Maintenance | PondFish is temporarily unavailable. |
| Invalid route | Page not found. |
| Fatal app error | Something went wrong. The display is recovering automatically. |
| Invalid event | Do not expose to user; log/reconcile internally |
| Duplicate event | No UI message |
| Out-of-order event | No UI message |
| Missed event | No UI message; synchronize automatically |

---

# 115. LOGGING

Frontend logs should support debugging without exposing secrets.

Log safely:

- display ID;
- application version;
- connection transitions;
- synchronization start/end;
- event IDs;
- transaction IDs;
- error categories.

Do not log:

- payment credentials;
- access tokens;
- card information;
- unnecessary customer PII.

---

# 116. OBSERVABILITY

Backend/operations should be able to monitor:

- display status;
- last connection;
- last synchronization;
- last received event;
- active business date.

These details do not need to be visible on the TV itself. fileciteturn27file0L813-L823

---

# 117. TV DISPLAY DATA

Recommended backend display entity:

```text
display_id
store_id
status
last_seen_at
registered_at
```

---

# 118. TRANSACTION EVENT DATA

Recommended:

```text
event_id
transaction_id
event_type
business_date
sequence_number
created_at
delivery_status
```

---

# 119. EVENT DELIVERY DATA

Recommended:

```text
event_id
display_id
delivered_at
acknowledged_at
retry_count
status
```

Do not create a duplicate authoritative transaction table solely for TV use. fileciteturn27file0L708-L737

---

# 120. DESIGN FILE / STITCH REQUIREMENTS

When generating the TV UI in Stitch or another UI generation tool:

The prompt must explicitly state:

```text
Build a large-format shop TV operational display.

This is NOT:
- a dashboard;
- an admin panel;
- a POS;
- a marketing website;
- a mobile UI.

Prioritize:
- distance readability;
- high contrast;
- clear transaction rows;
- large customer names;
- large fish quantities;
- prominent paid amount;
- minimal controls;
- minimal animation;
- operational clarity.
```

---

# 121. STITCH SCREEN SET

Generate at minimum:

1. populated main TV;
2. empty state;
3. loading state;
4. new transaction highlighted;
5. reconnecting state;
6. backend error state;
7. unauthorized display state;
8. maintenance state;
9. fatal error state;
10. long-data stress state.

---

# 122. STITCH NEGATIVE RULES

Do not generate:

- mobile cards;
- glassmorphism-heavy UI;
- floating dashboard widgets;
- huge hero sections;
- marketing CTAs;
- complex charts;
- filter controls;
- admin sidebar;
- excessive gradients;
- neon colors;
- unnecessary illustrations.

---

# 123. AI CODING AGENT RULES

The coding agent must:

1. read this specification;
2. read the Master PRD;
3. read the backend architecture;
4. reuse the shared design system;
5. reuse shared API/domain types;
6. not invent business rules;
7. not implement payment logic in TV;
8. not allow TV mutations;
9. implement idempotent event handling;
10. implement reconnect synchronization;
11. implement business-day filtering;
12. implement safe error states;
13. implement long-running stability.

---

# 124. IMPLEMENTATION SEPARATION

Recommended feature structure:

```text
tv/
├── components/
│   ├── TVShell
│   ├── TVHeader
│   ├── TransactionFeed
│   ├── TransactionRow
│   ├── ConnectionStatus
│   ├── LoadingState
│   ├── EmptyState
│   └── ErrorState
│
├── hooks/
│   ├── useTVAuthentication
│   ├── useCurrentBusinessDate
│   ├── useTransactions
│   ├── useRealtimeTransactions
│   └── useTVSynchronization
│
├── services/
│   ├── tvService
│   ├── transactionService
│   └── realtimeService
│
├── state/
│   └── tvState
│
└── types/
    └── tvTypes
```

Exact framework structure is an engineering decision.

---

# 125. API RESPONSIBILITY

Frontend:

```text
Render
Subscribe
Synchronize
Deduplicate
Order
Recover
```

Backend:

```text
Authorize
Determine business date
Determine transaction success
Publish events
Provide synchronization
Provide display-safe data
```

The frontend must never replace backend authority.

---

# 126. ACCEPTANCE CRITERIA — SECURITY

- [ ] TV is read-only.
- [ ] TV cannot modify transactions.
- [ ] TV cannot process payments.
- [ ] TV cannot access Admin functions.
- [ ] Worker credentials are not stored in the TV frontend.
- [ ] Customer phone is not displayed.
- [ ] Customer email is not displayed.
- [ ] Customer address is not displayed.
- [ ] Payment credentials are never displayed.
- [ ] Server-side authorization exists.
- [ ] Display registration is secure.

---

# 127. ACCEPTANCE CRITERIA — DISPLAY

- [ ] Customer name is visible.
- [ ] Transaction ID is visible.
- [ ] Fish name is visible.
- [ ] Fish quantity is visible.
- [ ] Quantity uses kg.
- [ ] Bill ID is visible.
- [ ] Time is visible.
- [ ] Combined paid amount is visible.
- [ ] Multiple fish are supported.
- [ ] Long names remain readable.
- [ ] Long IDs do not break layout.
- [ ] Large amounts remain readable.

---

# 128. ACCEPTANCE CRITERIA — REALTIME

- [ ] New successful transaction appears without refresh.
- [ ] New transaction appears at the correct position.
- [ ] Duplicate events do not create duplicate rows.
- [ ] Out-of-order events are corrected.
- [ ] Events during initial load are not lost.
- [ ] Reconnection recovers missed transactions.
- [ ] Realtime failure does not clear the existing feed.

---

# 129. ACCEPTANCE CRITERIA — TRANSACTION STATES

- [ ] Successful transactions appear.
- [ ] Failed transactions do not appear.
- [ ] Pending transactions do not appear.
- [ ] Cancelled transactions do not appear.
- [ ] Draft transactions do not appear.
- [ ] Incomplete bill scans do not appear.
- [ ] Failed AI extraction does not appear.
- [ ] Reconciliation-required transactions do not appear until authoritative success.
- [ ] TV never decides payment success itself.

---

# 130. ACCEPTANCE CRITERIA — BUSINESS DAY

- [ ] Current business-day transactions are shown.
- [ ] Previous-day transactions are not mixed into the new day.
- [ ] Server determines business date.
- [ ] Historical transactions remain stored.
- [ ] New day's first transaction appears correctly.
- [ ] TV device clock is not authoritative.

---

# 131. ACCEPTANCE CRITERIA — RELIABILITY

- [ ] TV continues showing synchronized data during temporary outage.
- [ ] TV reconnects automatically.
- [ ] Missed events are recovered.
- [ ] TV restart reloads the current day.
- [ ] Browser refresh reloads the current day.
- [ ] TV failure cannot invalidate a successful transaction.
- [ ] Duplicate synchronization does not create duplicate rows.
- [ ] Invalid event payloads do not break the UI.
- [ ] Realtime subscriptions do not multiply after reconnect.

---

# 132. ACCEPTANCE CRITERIA — UX

- [ ] Readable from store floor.
- [ ] High contrast.
- [ ] Customer name is prominent.
- [ ] Fish quantity is prominent.
- [ ] Paid amount is easy to find.
- [ ] No unnecessary controls.
- [ ] Minimal distracting animation.
- [ ] Empty state looks intentional.
- [ ] Network error does not look like payment failure.
- [ ] New transaction is immediately recognizable.

---

# 133. QA TEST MATRIX — INITIAL LOAD

Test:

- no transactions;
- one transaction;
- many transactions;
- slow API;
- API failure;
- unauthorized display;
- maintenance response;
- malformed API payload;
- partial data.

Expected:

- no raw errors;
- correct state;
- automatic recovery where applicable.

---

# 134. QA TEST MATRIX — REALTIME

Test:

- one new transaction;
- multiple rapid transactions;
- duplicate event;
- delayed event;
- out-of-order event;
- event during initial load;
- event during reconnect;
- event immediately before business-day transition.

Expected:

- exactly one valid row per successful transaction;
- correct order;
- no missed transaction after reconciliation.

---

# 135. QA TEST MATRIX — PAYMENT STATES

Test:

- successful Razorpay transaction;
- successful cash transaction;
- failed Razorpay;
- pending Razorpay;
- cancelled payment;
- reconciliation-required transaction.

Expected:

Only successful finalized transactions appear.

---

# 136. QA TEST MATRIX — CONNECTIVITY

Test:

- internet disconnected;
- backend disconnected;
- realtime disconnected;
- reconnect;
- TV restart;
- browser refresh;
- reconnect after several transactions;
- reconnect after duplicate events;
- reconnect after out-of-order events.

---

# 137. QA TEST MATRIX — BUSINESS DAY

Test:

- day transition;
- first transaction of new day;
- previous-day isolation;
- server/client timezone mismatch;
- device clock incorrect;
- browser left open overnight.

Expected:

Server-defined business date controls display.

---

# 138. QA TEST MATRIX — DISPLAY DATA

Test:

- long customer name;
- multiple fish;
- decimal kg;
- large amount;
- long Bill ID;
- long Transaction ID;
- many transactions;
- zero transactions;
- identical customer names;
- repeated transaction names.

---

# 139. QA TEST MATRIX — LONG-RUN STABILITY

Run the TV for an extended business-day simulation.

Verify:

- no memory growth caused by event subscriptions;
- no duplicated listeners;
- no duplicated rows;
- no frozen UI;
- no animation accumulation;
- no repeated sound if sound is enabled;
- no increasing latency;
- automatic reconnection works.

---

# 140. QA TEST MATRIX — PRIVACY

Verify that the TV does not display:

- phone number;
- email;
- address;
- subscription credit;
- payment credentials;
- card details.

---

# 141. QA TEST MATRIX — SECURITY

Verify:

- unauthorized display cannot read transactions;
- revoked display loses access;
- TV cannot mutate transactions;
- TV cannot call payment APIs;
- TV cannot access Admin APIs;
- tokens are not exposed in UI;
- secrets are not embedded in frontend source.

---

# 142. FAILURE-SCENARIO MATRIX

| Failure | Existing Feed | New Event | User Message | Recovery |
|---|---|---|---|---|
| API unavailable | Keep | Wait | Reconnecting | Automatic |
| Realtime unavailable | Keep | Recover later | Reconnecting | Sync |
| TV restart | Reload | Recover | Loading | Startup sync |
| Browser refresh | Reload | Recover | Loading | Startup sync |
| Duplicate event | Keep | Ignore | None | None |
| Out-of-order event | Reorder | Correct | None | Automatic |
| Missed event | Keep | Recover | None | Sync |
| Invalid payload | Keep | Reject | None | Backend reconciliation |
| Unauthorized display | Stop | None | Authorization message | Re-auth |
| Maintenance | Optional keep | Wait | Maintenance | Automatic |
| Fatal app error | Last safe state if possible | Wait | Recovery message | Reload |

---

# 143. IMPORTANT ANTI-PATTERNS

Do not implement:

```text
TV → Payment API
```

Do not implement:

```text
TV → Transaction Update API
```

Do not implement:

```text
Worker → Direct TV update
```

Do not implement:

```text
TV event = transaction success
```

Do not implement:

```text
TV local storage = transaction database
```

Do not implement:

```text
Browser clock = business date
```

---

# 144. CORRECT ARCHITECTURE

```text
                    ┌────────────────────┐
                    │ Transaction Backend│
                    └─────────┬──────────┘
                              │
                  Successful Transaction
                              │
                              ▼
                    ┌────────────────────┐
                    │ Event Infrastructure│
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │   TV Display App   │
                    └────────────────────┘
```

The TV remains downstream.

---

# 145. MASTER USER JOURNEY

```text
Customer makes physical purchase
          ↓
Worker captures bill
          ↓
AI extracts bill data
          ↓
Worker reviews
          ↓
Backend calculates transaction
          ↓
Payment completed
          ↓
Server verifies payment
          ↓
Transaction finalized Successful
          ↓
Transaction stored
          ↓
Successful event published
          ↓
TV receives event
          ↓
TV validates event
          ↓
TV deduplicates
          ↓
TV orders transaction
          ↓
TV highlights transaction
          ↓
Worker sees customer/fish/amount
          ↓
Worker prepares fish
```

---

# 146. CLIENT DEMONSTRATION MODE

For client demos, the UI should be easy to demonstrate without changing the production transaction rules.

A development/demo environment may provide seeded successful transactions.

Do not build a hidden production mutation button into the TV.

Demo data must remain environment-controlled.

---

# 147. DESIGN REVIEW CHECKLIST

Before approving the TV design:

- [ ] Can a worker read customer name from the shop floor?
- [ ] Can a worker immediately see fish and quantity?
- [ ] Can a worker identify the paid amount?
- [ ] Is the newest transaction obvious?
- [ ] Is the UI visually calm?
- [ ] Is the table/card density appropriate?
- [ ] Is the TV clearly read-only?
- [ ] Is network failure understandable?
- [ ] Does empty state look intentional?
- [ ] Are animations minimal?
- [ ] Are unnecessary customer details excluded?
- [ ] Does the layout survive long names and IDs?
- [ ] Does it work without sound?
- [ ] Does it remain understandable when sound is enabled?

---

# 148. ENGINEERING REVIEW CHECKLIST

- [ ] Display authentication implemented.
- [ ] Read-only API scope implemented.
- [ ] Current-day synchronization implemented.
- [ ] Realtime subscription implemented.
- [ ] Startup race handled.
- [ ] Duplicate protection implemented.
- [ ] Ordering implemented.
- [ ] Reconnection synchronization implemented.
- [ ] Business-date filtering implemented.
- [ ] Invalid payload rejection implemented.
- [ ] Long-running stability tested.
- [ ] TV cannot mutate financial data.
- [ ] TV cannot affect transaction success.

---

# 149. FINAL MVP SCOPE

## Included

- dedicated TV display;
- secure read-only access;
- current business-day successful transactions;
- customer name;
- transaction ID;
- fish name;
- quantity;
- Bill ID;
- time;
- combined successfully paid amount;
- realtime updates;
- initial synchronization;
- reconnect synchronization;
- duplicate protection;
- business-day separation;
- loading state;
- empty state;
- error/reconnect state;
- TV restart recovery;
- browser refresh recovery;
- privacy-safe display;
- operationally readable UI.

## Excluded

- transaction editing;
- payment processing;
- POS;
- weighing-machine control;
- booking completion;
- inventory management;
- customer management;
- subscription management;
- GPS;
- notification management;
- Admin analytics;
- worker controls.

These exclusions match the established TV PRD. fileciteturn28file0L10-L29

---

# 150. FUTURE ENHANCEMENTS

Potential future capabilities:

- multiple TV displays;
- multiple stores;
- configurable display themes;
- preparation queue mode;
- configurable filters;
- optional sound alerts;
- kitchen/preparation display;
- store-specific routing.

These must remain downstream of the authoritative transaction service. fileciteturn28file0L33-L46

---

# 151. FINAL PRODUCT PRINCIPLE

The PondFish Transaction TV Portal must remain:

```text
SIMPLE
+
HIGHLY READABLE
+
REAL-TIME
+
RELIABLE
+
READ-ONLY
+
PRIVACY-CONSCIOUS
+
NETWORK-RESILIENT
+
BACKEND-SYNCHRONIZED
```

Its job is not to manage the transaction.

Its job is to **make a successfully finalized transaction visible to the worker immediately**.

A TV outage must never affect:

- payment success;
- transaction validity;
- inventory;
- Subscription Credit;
- financial records.

This is the core boundary that must remain intact throughout UI design and engineering.

---

# 152. FINAL BUILD HANDOFF

The implementation team should use this document together with:

1. `PondFish_Master_PRD_v2.md`
2. `PondFish_Backend_Technical_Architecture_PRD_v1.md`
3. `PondFish_Transaction_TV_Display_Portal_PRD_v1.md`
4. Approved PondFish Design System / UI specification
5. Shared API/domain contracts
6. QA test specifications

The TV-specific document owns **display behavior and TV UX**.

The backend architecture owns:

- transaction authority;
- event publication;
- synchronization;
- security;
- data integrity;
- audit;
- recovery infrastructure.

No document should redefine those responsibilities independently.

---

# 153. DOCUMENT COMPLETION CHECKLIST

- [x] Portal purpose
- [x] Scope
- [x] Responsibility boundary
- [x] Device context
- [x] Information architecture
- [x] Main display
- [x] Transaction row
- [x] Multiple fish
- [x] Paid amount
- [x] Loading
- [x] Empty
- [x] Success/populated
- [x] New transaction highlight
- [x] Connection loss
- [x] Reconnection
- [x] Backend failure
- [x] Unauthorized display
- [x] Maintenance
- [x] 404
- [x] Fatal error
- [x] Network failure
- [x] Business-day handling
- [x] Startup race condition
- [x] Duplicate events
- [x] Out-of-order events
- [x] Missed events
- [x] TV restart
- [x] Browser refresh
- [x] Security
- [x] Privacy
- [x] API contract
- [x] Event contract
- [x] Component inventory
- [x] Design-system guidance
- [x] Stitch guidance
- [x] AI coding-agent guidance
- [x] Acceptance criteria
- [x] QA matrix
- [x] Failure matrix
- [x] Engineering checklist
- [x] Client design checklist
- [x] MVP boundary
- [x] Future scope
- [x] Final handoff

---

**End of Transaction TV Portal Page-by-Page UI Specification**
