# PONDFISH — DESIGN SYSTEM & UI/UX IMPLEMENTATION SPECIFICATION

**Document:** PondFish Complete Design System & UI/UX Specification  
**Version:** 1.1 — Implementation Baseline  
**Status:** Detailed UI/UX Specification / Visual Direction Locked  
**Parent:** PondFish Master PRD v2.0  
**Related:** PondFish System & Technical Architecture v1.0, PondFish Public Website & Customer Portal PRD v1.0  
**Audience:** PondFish Client, SProjectX, UI/UX, Frontend, Backend, QA, DevOps and AI-assisted development teams

---

# 1. DOCUMENT PURPOSE

This document defines the visual language, reusable UI system, interaction behavior, responsive rules, page-level UI requirements and system-state requirements for the complete PondFish digital ecosystem.

It is written as an **implementation document**, not as a visual mood board.

The document must be usable by:

- UI/UX designers creating the final screens.
- Frontend developers implementing the screens.
- Backend developers understanding UI/backend dependencies.
- QA teams validating visual and interaction behavior.
- AI coding/design agents generating screens from the specification.
- SProjectX for maintaining one consistent product language across all portals.

The approved visual direction is:

> **Fresh • Trustworthy • Modern • Premium • Local**

PondFish should feel like a well-designed physical fish store brought online, not like a generic SaaS dashboard.

---

# 2. DOCUMENT HIERARCHY AND SOURCE OF TRUTH

The PondFish documentation follows this dependency order:

```text
MASTER PRD
    ↓
SYSTEM & TECHNICAL ARCHITECTURE
    ↓
DATABASE / ERD / DATA MODEL
    ↓
API SPECIFICATION
    ↓
INTEGRATION SPECIFICATION
    ↓
THIS DESIGN SYSTEM & UI/UX SPECIFICATION
    ↓
PAGE-BY-PAGE UI SPECIFICATION
    ↓
FRONTEND ARCHITECTURE
    ↓
BACKEND IMPLEMENTATION
    ↓
TESTING / QA
    ↓
DEPLOYMENT / DEVOPS
    ↓
MASTER AI CODING PROMPT
```

The Master PRD remains the source of truth for business workflows and business rules.

This document **must not redefine**:

- Subscription calculation rules.
- Inventory truth.
- Payment verification.
- Booking state transitions.
- GPS authorization/publication rules.
- Financial calculations.
- Transaction finalization.
- Audit requirements.

Instead, this document defines **how those already-approved rules are represented and interacted with in the UI**.

## 2.1 Single Source of Truth Rule

Every business workflow is defined once.

Portal/page specifications may explain:

- where the user enters the workflow,
- what information is shown,
- what action is available,
- what state is displayed,
- what feedback is required.

They must not create a second version of the business logic.

If a UI requirement conflicts with the Master PRD, the Master PRD wins and the UI specification must be updated.

---

# 3. DOCUMENTATION STANDARD

Every significant page or state must be specified using the following structure where applicable:

1. Page ID
2. Page name
3. Purpose
4. Access / role
5. Entry points
6. Exit points
7. UI structure / sections
8. Data displayed
9. Fields
10. Actions
11. Main workflow
12. Validation
13. Loading state
14. Empty state
15. Success state
16. Error state
17. Retry behavior
18. Confirmation behavior
19. Permission behavior
20. Backend dependency
21. Cross-portal effect
22. Audit requirement
23. Edge cases
24. Responsive behavior
25. Acceptance criteria

This is the **minimum documentation standard** for implementation.

---

# 4. LOCKED PRODUCT DESIGN PRINCIPLES

## 4.1 Clarity First

A customer should understand:

- what fish is available,
- how fresh it is,
- how much it costs,
- whether it can be booked,
- when it can be collected,

within seconds.

## 4.2 Retail First

Customer-facing screens must feel like a premium local retail experience.

Avoid:

- generic SaaS dashboards,
- excessive analytics cards,
- unnecessary charts,
- dense technical interfaces,
- decorative UI that competes with fish photography.

Operational interfaces may be denser because workers and admins need efficiency.

## 4.3 Trust Through Transparency

Where relevant, show:

- current availability,
- freshness,
- price/kg,
- previous price,
- offer/savings,
- store hours,
- pickup rules,
- booking validity,
- subscription credit,
- remaining weekly quantity,
- payment breakdown,
- final payable amount.

## 4.4 One Primary Action

Each major section should have one obvious primary action.

Examples:

- View Today's Fish
- Book for Collection
- Confirm Booking
- Confirm & Continue
- Pay Now
- Retry Payment
- Save Changes

Secondary actions should be visually quieter.

## 4.5 Business State Must Be Visible

Important states must not exist only in color.

Examples:

- Fresh / Available
- Limited Stock
- In-store Only
- Booking Confirmed
- Payment Pending
- Payment Failed
- Tracking Live

Every status should use a combination of:

- text,
- icon where appropriate,
- color.

## 4.6 Failure Is Part of the Product

Every important data-driven workflow must have:

- loading,
- empty,
- success,
- error,
- retry,
- offline/network behavior where applicable.

A screen is not considered complete if only its successful state is designed.

---

# 5. VISUAL DESIGN SYSTEM

## 5.1 Brand Colors

| Token | Value | Usage |
|---|---|---|
| Pond Navy | `#123566` | Brand, header, footer, primary text |
| Pond Blue | `#2463A8` | Primary CTA, active controls, links |
| Fresh Green | `#10B981` | Available, fresh, success, live |
| Offer Coral | `#F43F5E` | Offers, discounts, limited-offer badges |
| Warning Amber | `#F59E0B` | Low stock, attention, aging |
| Surface | `#FFFFFF` | Cards, primary surfaces |
| Soft Surface | `#F4F7FA` | Section backgrounds |
| Border | `#D9E2EC` | Borders, inputs, dividers |
| Text | `#102A43` | Primary text |
| Muted | `#5B7083` | Secondary/helper text |

### Color rules

- Pond Navy is the primary brand anchor.
- Pond Blue is the main interaction color.
- Fresh Green is reserved for positive/available/live states.
- Offer Coral is restrained and should not become the dominant page color.
- Warning Amber is for attention, not normal content.
- Do not use red/coral for ordinary navigation.
- Do not communicate important state through color alone.

---

# 6. TYPOGRAPHY SYSTEM

| Level | Specification | Usage |
|---|---|---|
| Display / H1 | 32–48px / 700 | Hero headlines |
| H2 | 24–30px / 700 | Major sections |
| H3 | 18–22px / 700 | Cards/subsections |
| Body | 15–17px / 400–500 | Main content |
| Label | 13–14px / 600 | Metadata/forms |
| Caption | 12–13px | Helper/timestamp text |

## Typography rules

- Use short headings.
- Avoid oversized text in operational interfaces.
- Use strong hierarchy rather than multiple font sizes.
- Prices should have strong visual hierarchy.
- Availability and freshness should remain easy to scan.
- Body copy should remain comfortable on mobile.
- Do not use all-caps for large amounts of text.

---

# 7. SPACING, RADIUS AND ELEVATION

| Token | Value | Usage |
|---|---:|---|
| xs | 4px | Micro spacing |
| sm | 8px | Tight gaps |
| md | 12–16px | Card content |
| lg | 20–24px | Component gaps |
| xl | 32px | Section separation |
| 2xl | 48–64px | Major sections |

## Radius

- Cards: 8–12px.
- Buttons: 8–10px.
- Inputs: 8–10px.
- Badges/status pills: `999px`.
- Large hero containers: medium radius, not excessive rounding.

## Elevation

Default surface:

```text
White background
+
1px border
+
subtle shadow
```

Hover:

```text
Small border/elevation change
```

Modal:

```text
Strong elevation
+
backdrop
```

Do not make every section look like a floating card.

---

# 8. BUTTON SYSTEM

## 8.1 Primary Button

**Visual:**

- Pond Blue background.
- White text.
- 8–10px radius.
- Medium/semibold text.
- Clear icon only when it improves recognition.

**Use for:**

- Book
- Confirm
- Pay
- Save
- Continue
- Start
- Complete

## 8.2 Secondary Button

White/light surface with Pond Blue border and text.

Use for:

- secondary navigation,
- alternative actions,
- less important page actions.

## 8.3 Ghost Button

Transparent background.

Use for:

- low-emphasis actions,
- inline actions,
- dismiss/back actions.

## 8.4 Danger Button

Use only for:

- destructive actions,
- cancellation where destructive confirmation is required,
- deletion/deactivation/disposal.

## 8.5 Disabled

Disabled buttons must visibly communicate:

- action unavailable,
- reason where useful,
- no accidental click.

## 8.6 Loading

When a critical request is processing:

```text
Button label
→ spinner
→ disabled
```

Do not allow duplicate submission.

### Button states

Every reusable button must support:

- default,
- hover,
- focus,
- pressed,
- disabled,
- loading.

---

# 9. INPUT AND SEARCH SYSTEM

## Standard dimensions

- Height: approximately 44–48px.
- Visible focus ring.
- Accessible label.
- Clear error state.
- Clear disabled state.

## Rules

- Placeholder text is never the only label for an important form.
- Search fields use a familiar search icon.
- Search supports clear/reset when useful.
- Validation appears close to the affected field.
- Do not clear valid user input after an unrelated request failure.

---

# 10. CARD SYSTEM

## Standard Card

```text
White surface
1px border
8–12px radius
Subtle elevation
Consistent internal padding
```

Cards must group meaningful information.

Do not create cards only to decorate empty space.

## Fish Card

Fish cards are photography-led.

Recommended hierarchy:

```text
Fish image
Offer badge if active
Category/freshness
Fish name
Availability
Price/kg
Previous price if discounted
Booking status
Primary CTA
```

The card must make the important purchase information scannable.

## Operational Card

Worker/admin cards are data-led.

They may contain:

- status,
- ID,
- customer,
- quantity,
- amount,
- timestamp,
- action.

---

# 11. STATUS AND BADGE SYSTEM

| State | Treatment | Example |
|---|---|---|
| Fresh / Available | Green dot + text | Fresh / 0–24h |
| Limited stock | Amber | Limited stock at store |
| Offer | Coral badge | Save ₹40/kg |
| Success | Green | Booking confirmed |
| Error | Coral/red | Payment failed |
| Closed | Muted/amber | Store closed |
| Pending | Neutral/amber | Payment pending |
| Offline | Neutral/dark | Offline |

Never rely on color alone.

---

# 12. SEARCH, FILTER AND LIST SYSTEM

## Search

Use:

- icon,
- visible field,
- clear action,
- result count where useful.

## Filters

Customer catalogue:

- All
- Freshwater/Pond
- Boneless Cuts
- Dry Fish
- Bookable Online Only

Operational filters may include:

- status,
- date,
- source,
- payment method,
- freshness,
- worker,
- customer.

## Filtered Empty State

When filters produce no results:

```text
No results found
```

Then provide:

- Clear filters,
- Modify search,
- Relevant alternative action.

---

# 13. MODAL, DRAWER AND CONFIRMATION SYSTEM

Use modals for:

- destructive actions,
- financially significant confirmations,
- short focused forms,
- confirmation before changing an important state.

Avoid putting complete multi-page workflows inside modals.

Confirmation content should answer:

1. What is happening?
2. What will change?
3. Can it be reversed?
4. What should the user do next?

---

# 14. TOAST AND INLINE FEEDBACK

Use toast for:

- quick success,
- minor confirmation,
- non-blocking feedback.

Use inline/page-level state for:

- payment,
- booking,
- transaction,
- AI processing,
- permission,
- network failure.

Do not hide critical errors only in a toast.

---

# 15. UNIVERSAL COMPONENT STATES

| Component | Required states |
|---|---|
| Button | Default, hover, focus, pressed, disabled, loading |
| Input | Default, focus, filled, error, disabled, read-only |
| Fish Card | Available, limited, in-store-only, unavailable, discounted, loading |
| Booking | Draft, pending, confirmed, preparing, ready, completed, cancelled, expired |
| Payment | Idle, processing, success, failed, pending, cancelled |
| Network | Online, offline, reconnecting, service unavailable |
| List/Table | Skeleton, populated, empty, filtered-empty, error |
| Modal | Open, submitting, success, error |
| Map/Tracking | Loading, live, stale, unavailable, arrived, ended |

---

# 16. GLOBAL PAGE STATE SYSTEM

## 16.1 Loading

Use skeletons for data-heavy screens.

Avoid displaying a blank page while waiting for the backend.

Examples:

- Loading fish catalogue.
- Loading bookings.
- Loading transactions.
- Loading subscription.
- Loading dashboard.

## 16.2 Processing

Use explicit progress messaging for longer operations.

Examples:

- `Reading your bill...`
- `Calculating subscription...`
- `Confirming payment...`
- `Checking availability...`

## 16.3 Empty

An empty state must explain:

- what is empty,
- why it may be empty where useful,
- what the user can do next.

## 16.4 Error

Error messages must:

- explain what happened,
- give the next action,
- avoid technical stack traces,
- avoid blaming the user.

## 16.5 Retry

Retry must re-run the failed request without unexpectedly destroying valid user input.

## 16.6 Offline

Offline UI must:

- clearly indicate the connection problem,
- preserve entered information where possible,
- offer retry,
- never falsely report a transaction as failed solely because the client lost connection.

Payment status must be checked against authoritative backend state.

---

# 17. CUSTOMER WEBSITE — PUBLIC PAGES

The public website and customer portal are one web application.

---

## PW-01 — HOME / STORE CATALOGUE

### Purpose

Introduce PondFish and immediately guide users toward today's fish, offers and store actions.

### Access

Public visitor or authenticated customer.

### Entry Points

- Root URL.
- PondFish logo.
- Navigation.
- Redirect after authentication.

### UI Structure

```text
Top Store Strip
Header
Hero
Store Status Card
Today's Fish Catalogue
Offers
Subscription Promotion
How PondFish Works
About Store
App Promotion
Contact
Footer
```

### Top Store Strip

Display where configured:

- store status,
- location,
- opening hours,
- counter contact,
- app link.

### Header

Required visual hierarchy:

```text
PondFish logo
Search
Home
Fish Catalogue
Offers
Subscriptions
How it works
About
Bookings
Login
```

Authenticated users may see the account entry instead of Login.

### Hero

Display:

- Store Open/Closed status.
- Last updated time.
- Primary headline.
- Short supporting text.
- View Today's Fish CTA.
- Today's Special Offers CTA.
- Store location/status card.

### Store Status Card

Display:

- Counter status.
- Collection hours.
- Live inventory count.
- Booking rule.

### Catalogue

Display:

- search,
- category filters,
- online-bookable filter,
- responsive fish grid.

### Fish Card

Display:

- image,
- offer badge,
- fish name,
- freshness,
- available quantity,
- price/kg,
- previous price when applicable,
- online booking state,
- booking CTA.

### Loading

Use catalogue skeleton cards.

### Empty

If no fish are available:

```text
No fish are available right now.
```

Provide:

- Refresh,
- reset filters,
- store/contact guidance.

### Error

```text
Some information couldn't be loaded. Please try again.
```

Keep static sections usable where possible.

### Acceptance Criteria

- User can understand store status immediately.
- Today's fish are visually dominant.
- Price, availability and freshness are visible.
- Booking is shown only when applicable.
- Loading/empty/error states exist.
- Mobile layout remains usable.

---

## PW-02 — FISH CATALOGUE / AVAILABILITY

### Purpose

Allow visitors/customers to browse current fish availability.

### Access

Public/customer.

### Entry Points

- Home CTA.
- Header.
- Search.
- Category navigation.

### Sections

```text
Page Header
Search
Category Filters
Bookable-only Filter
Fish Grid
```

### Data

- Fish name.
- Category.
- Price/kg.
- Availability.
- Freshness.
- Discount.
- Booking eligibility.

### Actions

- Search.
- Filter.
- Open fish detail.
- Book eligible fish.

### Validation

Availability must be revalidated before booking.

### Stale Data

If selected quantity is no longer available:

```text
This fish is no longer available in the selected quantity.
```

### Acceptance Criteria

- Expired/red fish cannot be booked online.
- In-store-only fish remain visibly in-store-only.
- Current availability is backend-driven.
- Filtered-empty state works.

---

## PW-03 — FISH DETAIL

### Purpose

Provide complete information about one fish.

### UI

```text
Image Gallery
Fish Name
Category
Freshness
Availability
Current Price
Previous Price
Discount
Description
Booking Information
Primary CTA
```

### Actions

- Book if eligible.
- Return to catalogue.

### Disabled Booking

Show:

```text
Online booking is not available for this fish.
```

Do not imply that the fish is unavailable at the physical store unless backend state says so.

### Stale Data

If fish becomes unavailable:

```text
This fish is currently unavailable.
```

---

## PW-04 — SUBSCRIPTION PLANS

### Purpose

Explain available subscription plans and their store-credit/weekly-allowance benefits.

### Access

Public/customer.

### UI

Each plan should show:

- plan name,
- price,
- monetary Subscription Credit,
- weekly quantity rules,
- eligible fish/benefits where configured,
- validity,
- purchase CTA.

### Current Reference Plans

- ₹2,000
- ₹6,000

Additional plans must remain supported architecturally.

### Visual Direction

Lead with the credit concept.

Example:

```text
Pay ₹2,000
Get ₹2,000 PondFish Store Credit
```

### Purchase Flow

```text
Select Plan
→ Authentication
→ Review
→ Razorpay
→ Server Verification
→ Activation
```

### Payment Failure

```text
Subscription payment was not completed.
You can retry the payment.
```

### Acceptance Criteria

- Credit concept is clear.
- Weekly allowance is not confused with monetary credit.
- Terms are visible before purchase.
- Subscription is not shown as active before server-verified payment.

---

## PW-05 — OFFERS

### Purpose

Display active promotions.

### UI

Offer cards should show:

- fish/product,
- current price,
- previous price,
- savings/kg,
- availability,
- validity where relevant,
- booking availability.

### Rules

Urgency is shown only when supported by actual validity or stock.

Grey/aging fish is not automatically discounted.

### Empty

Do not show a large empty offer container.

Use:

```text
No special offers right now.
```

or omit the promotional section when appropriate.

---

## PW-06 — HOW PONDFISH WORKS

### Purpose

Explain the booking/collection process in a simple retail format.

### Four Steps

```text
01 Choose your fish
02 Book for collection
03 We prepare your order
04 Collect from PondFish Store
```

### UI

Four compact step cards.

Keep copy short.

Show collection hours.

---

## PW-07 — ABOUT STORE

### Purpose

Build trust by explaining the store.

### Sections

- Inland pond sourcing.
- Store counter collection.
- Freshness.
- Clear pricing.
- Exact-weight policy.

### Visual

Use photography/content blocks rather than dense text.

---

## PW-08 — CONTACT / STORE INFORMATION

### Purpose

Give customers practical store information.

### Display

- location,
- opening hours,
- counter phone,
- email,
- support guidance,
- map/location action where available.

### Rule

Public hours must use current backend/admin configuration.

---

# 18. CUSTOMER AUTHENTICATION AND ACCOUNT

## CP-01 — LOGIN / OTP

### Purpose

Authenticate customers using mobile OTP.

### Access

Public.

### Fields

- Mobile number.
- OTP.

### Actions

- Get OTP.
- Verify OTP.
- Resend OTP.
- Change number.

### Flow

```text
Mobile Number
→ Validate
→ Request OTP
→ OTP Sent
→ Enter OTP
→ Verify
→ Existing Customer / New Customer
```

### States

- Invalid number.
- OTP expired.
- Incorrect OTP.
- Too many attempts.
- Resend cooldown.
- OTP delivery failure.
- Network failure.
- Success.

### Messages

```text
The OTP is incorrect. Please try again.
```

```text
This OTP has expired. Please request a new OTP.
```

```text
We couldn't send the OTP right now. Please try again.
```

### Security

Authentication is server-authoritative.

---

## CP-02 — REGISTRATION / PROFILE SETUP

### Purpose

Complete required customer information after first authentication.

### Fields

- Name.
- Age where required.
- Area where required.

### Rules

Ask only required information.

### Success

Redirect to the originally requested action where safe.

---

## CP-03 — CUSTOMER DASHBOARD

### Purpose

Provide quick access to important customer actions without duplicating full pages.

### Primary Actions

- Scan Bill.
- View Fish.
- Online Booking.
- Subscription.
- Track Delivery when active.

### Summary

May show:

- current subscription,
- available credit,
- remaining weekly quantity,
- active booking summary,
- unread notifications.

### GPS

Do not show a misleading empty map when no journey is published.

### Acceptance Criteria

Dashboard summarizes; dedicated pages remain the source of detailed information.

---

## CP-04 — PROFILE & ACCOUNT

### Purpose

View/manage permitted customer account information.

### Data

- Name.
- Phone.
- Account status.
- Registration information.

### Actions

- Edit name.
- Change phone through OTP.
- Logout.

### Account States

- Active.
- Blocked.
- Deactivated.

### Security

Protected pages require authentication after logout.

---

## CP-05 — NOTIFICATIONS

### Purpose

Display relevant customer events.

### Notification Types

- Booking.
- Payment.
- Subscription.
- Fish arrival.
- GPS publication.
- Tracking end.
- Discounts.
- Flash offers.
- Announcements.

### Item

- title,
- message,
- date/time,
- read/unread state.

### Empty

```text
No notifications yet.
```

### Deep Links

Where configured, tapping a notification opens the relevant page.

---

# 19. CUSTOMER SHOPPING AND BOOKING

## CP-06 — CUSTOMER FISH DISCOVERY

### Purpose

Browse available fish within authenticated experience.

### Information

- Fish name.
- Price.
- Availability.
- Freshness.
- Discount.
- Online booking eligibility.

### Booking Rule

Only admin-enabled online-bookable fish show a booking action.

---

## CP-07 — FISH DETAILS

### Purpose

Show detailed fish information before booking.

### Data

- Name.
- Price.
- Availability.
- Freshness.
- Discount.
- Booking availability.
- Applicable quantity/rules.

### Stale State

```text
This fish is currently unavailable.
```

---

## CP-08 — QUANTITY SELECTION / CART

### Purpose

Allow selection of quantity for online booking.

### Fields

- Fish.
- Quantity.
- Unit.
- Estimated amount.

### Validation

- Positive quantity.
- Kilogram unit.
- Online-bookable fish.
- Available quantity.
- Configured booking rules.

### UI Behavior

- Quantity cannot exceed currently known availability.
- Show estimated amount.
- Explain that final packed-weight pricing may vary where applicable.

### Backend

Availability is revalidated at checkout.

---

## CP-09 — BOOKING REVIEW

### Purpose

Provide a final review before creating an online booking.

### Display

- Fish.
- Requested quantity.
- Rate.
- Estimated total.
- Store.
- Pickup information.
- Customer details.
- Subscription calculation.
- Remaining payable amount.

### Primary Action

`Confirm Booking`

### Error

If inventory changed:

```text
The selected quantity is no longer available.
Please select a different quantity.
```

---

## CP-10 — BOOKING CONFIRMATION

### Purpose

Confirm successful booking creation.

### Display

- Booking ID.
- Fish.
- Quantity.
- Amount.
- Subscription value used.
- Amount paid.
- Collection information.
- Expiry date/time.

### Success

```text
Booking created successfully.
```

### Actions

- View booking.
- Continue shopping.

### Validity

Booking validity is 48 hours according to the Master PRD.

---

## CP-11 — BOOKING HISTORY

### Purpose

Show booking records separately from general transaction history.

### Statuses

- Created.
- Confirmed.
- Pending Collection.
- Completed.
- Cancelled.
- Expired.

### Card/List

Show:

- Booking ID.
- Date.
- Fish.
- Quantity.
- Amount.
- Status.

### Filters

- Status.
- Date.
- Booking type where applicable.

### Empty

```text
No bookings found.
```

### Filtered Empty

```text
No bookings match your selected filters.
```

---

## CP-12 — BOOKING DETAIL

### Purpose

Show complete information for one booking.

### Display

- Booking ID.
- Fish.
- Quantity.
- Price.
- Subscription coverage.
- Payment amount/status.
- Booking status.
- Created time.
- Expiry time.
- Completion/cancellation/expiry time where applicable.

### Timeline

```text
Created
→ Confirmed
→ Pending Collection
→ Completed
```

Alternative:

```text
Cancelled
```

or

```text
Expired
```

### Collection

Customer collects from the PondFish store.

PondFish does not manage delivery in the current release.

### Cancellation

If allowed by current booking state, show cancellation action with confirmation.

The UI must not perform restoration itself; backend handles restoration.

---

# 20. CUSTOMER PHYSICAL PURCHASE / BILL SCAN

## CP-13 — SCAN BILL

### Purpose

Allow customers to process a physical-store fish purchase using the received bill.

### Entry

- Customer dashboard.
- Navigation.
- Transaction-related CTA.

### Input

- Camera capture.
- Image upload.

### UI

```text
Scan Bill
Instruction
Camera / Upload
Image Preview
Continue
```

### Validation

Reject:

- no image,
- unsupported image,
- unreadable image.

### Messages

```text
Please capture or upload your bill.
```

```text
We couldn't read this bill clearly.
Please take another photo.
```

```text
We couldn't identify a bill in this image.
Please scan the bill again.
```

### Processing

```text
Reading your bill...
```

Prevent duplicate processing submissions.

### Failure

```text
We couldn't extract the bill details.
Please scan the bill again.
```

No successful transaction is created from unsuccessful AI extraction.

---

## CP-14 — AI BILL PROCESSING

### Purpose

Show that the bill image is being processed and then transition to review.

### Expected Extraction

- Bill ID/number.
- Fish names.
- Quantity.
- Price.
- Line totals.
- Total bill.
- Printed date/time where available.
- Customer information where printed.

### State

Do not allow financial actions while AI processing is incomplete.

### Failure

Return to scan/retry without losing the valid account session.

---

## CP-15 — EXTRACTED BILL CONFIRMATION

### Purpose

Allow human confirmation of AI-extracted data before financial processing.

### Required Display

- Bill ID.
- Fish name(s).
- Quantity.
- Price.
- Line totals.
- Total bill amount.
- Subscription-covered quantity.
- Subscription value/credit used.
- Extra quantity.
- Extra amount.
- Gateway fee where applicable.
- GST on gateway fee.
- Final online payable amount.

### Actions

Primary:

`Confirm & Continue`

Secondary:

`Scan Again`

### Important Rule

AI extraction is not final authorization.

If extraction is wrong, the locked customer workflow is to scan again.

### Bill ID Fallback

If AI cannot read the Bill ID:

```text
We couldn't read the Bill ID.
Please enter it manually.
```

Then:

```text
Manual Bill ID
→ Validate
→ Duplicate check
→ Continue
```

### Duplicate

```text
This bill has already been processed successfully.
```

---

## CP-16 — MANUAL BILL ID

### Purpose

Allow manual Bill ID entry when AI cannot extract it.

### Field

- Bill ID.

### Validation

- Required.
- Valid format.
- Duplicate successful transaction check.

### Success

Continue to confirmation/processing workflow.

### Error

```text
Please enter a valid Bill ID.
```

or:

```text
This bill has already been processed successfully.
```

---

# 21. SUBSCRIPTION COVERAGE UI

## CP-17 — SUBSCRIPTION COVERAGE BREAKDOWN

### Purpose

Explain how a bill is divided between subscription coverage and additional payment.

### Display

- Total bill.
- Eligible fish.
- Covered quantity.
- Uncovered quantity.
- Weekly quantity used.
- Weekly quantity remaining.
- Credit used.
- Credit remaining.
- Remaining payable.

### UI Pattern

Use a clear financial breakdown:

```text
Bill Total
Subscription Covered
Extra Quantity / Value
Gateway Fee
GST on Gateway Fee
Final Payable
```

### Rule

Weekly quantity and monetary Subscription Credit are separate concepts.

The UI must never combine them into one generic "balance".

---

# 22. CUSTOMER PAYMENT

## CP-18 — PAYMENT PROCESSING

### Purpose

Collect remaining customer payable amount through Razorpay.

### Customer Payment

Customer self-service uses Razorpay.

Cash must not be displayed as a customer payment method.

### Pre-Payment Summary

Show:

- purchase amount,
- subscription value used,
- remaining amount,
- gateway fee,
- GST,
- final payable amount.

### Payment States

- Idle.
- Processing.
- Success.
- Failed.
- Pending.
- Cancelled.

### Processing

Disable duplicate submission.

### Important Rule

Client-side payment success is not sufficient.

The server verifies payment before final transaction creation.

---

## CP-19 — PAYMENT SUCCESS / DIGITAL RECEIPT

### Purpose

Show successful physical-store transaction.

### Display

- Customer name.
- Transaction ID.
- Bill number.
- Fish.
- Quantity.
- Total bill.
- Subscription quantity/value.
- Extra quantity/value.
- Payment method.
- Razorpay reference where applicable.
- Date.
- Time.

### Success

```text
Payment successful.
Your transaction has been recorded.
```

### Final State

No customer completion action.

Physical purchases do not require worker completion.

### Actions

- View transaction.
- Return home.
- Continue shopping.

---

## CP-20 — PAYMENT FAILED

### Purpose

Explain failed payment and allow valid retry.

### Message

```text
Payment was not completed.
You can retry the payment.
```

### Actions

- Retry Payment.
- Return to transaction.
- Scan Bill where applicable.

### Rule

A failed payment must not appear as a completed purchase.

---

## CP-21 — PAYMENT PENDING

### Purpose

Represent a payment whose final state has not yet been confirmed.

### Message

```text
Your payment is still being confirmed.
Please wait while we verify it.
```

### Actions

- Refresh status.
- Return to transaction history where safe.

Do not create duplicate payment attempts without backend guidance.

---

## CP-22 — PAYMENT CANCELLED

### Message

```text
Payment was cancelled.
You can try again.
```

### Actions

- Retry.
- Return.

---

## CP-23 — REFUND / CREDIT RETURN STATUS

### Purpose

Explain returned value for applicable cancelled/expired bookings.

### Display

- Original booking.
- Returned amount.
- Destination: Subscription Credit where applicable.
- Processing status.
- Date/time.

Do not imply cash refund if the approved business workflow converts applicable paid booking value into Subscription Credit.

---

# 23. CUSTOMER TRANSACTION HISTORY

## CP-24 — TRANSACTION HISTORY

### Purpose

Show recorded transaction attempts and outcomes.

### Statuses

- Successful.
- Failed.
- Pending.
- Cancelled/removed where retained.

### Card/List Data

- Transaction ID.
- Bill number.
- Date/time.
- Total bill.
- Subscription value used.
- Extra amount.
- Payment method.
- Status.

### Filters

- Status.
- Date range.
- Transaction type.
- Payment method.

### Search

- Transaction ID.
- Bill number.

### Detail

Show complete stored information.

Bill image is accessible where permitted.

### Empty

```text
No transactions found.
```

### Filtered Empty

```text
No transactions match your selected filters.
```

---

# 24. CUSTOMER SUBSCRIPTION PAGE

## CP-25 — SUBSCRIPTION

### Purpose

Provide the complete customer view of subscription state.

### Summary

Show:

- current plan,
- status,
- available Subscription Credit,
- used Subscription Credit,
- remaining weekly eligible quantity,
- start date,
- expiry date.

### Usage History

Show:

- date,
- transaction/booking reference,
- fish,
- quantity,
- credit used.

### Purchase History

Show:

- plan,
- amount,
- payment source,
- credit added,
- credit used,
- date,
- expiry.

### Purchase Another Plan

CTA may lead to plan selection.

### Renewal

Manual renewal only in current workflow.

### Visual Rule

Use separate visual treatments for:

```text
Monetary Credit
```

and

```text
Weekly Quantity
```

---

# 25. CUSTOMER GPS LIVE TRACKING

## CP-26 — GPS LIVE TRACKING

### Purpose

Show truck tracking only when the admin has explicitly published customer tracking.

### Provider

OneLap.

### Availability

```text
Active Journey
+
Admin Published
=
Customer Tracking Available
```

### Display

- current location,
- origin,
- fixed store destination,
- journey state,
- ETA where available,
- last update,
- relevant arrival context.

### States

#### Not Published

```text
Live tracking is currently unavailable.
```

Do not show a misleading empty map.

#### Live

Show:

- moving marker,
- route/context,
- ETA,
- last updated.

#### Temporarily Unavailable

Show last known location/time where valid.

#### Arrived / Processing

Explain that the truck has reached the store and processing is underway.

#### Tracking Ended

```text
This delivery has arrived at the store.
```

### Real-Time

Location updates without manual refresh.

### Rule

Customer tracking ends after configured post-arrival period.

Admin GPS visibility remains independent.

---

# 26. WORKER TABLET PORTAL

Worker UI is operational and tablet-first.

It may be denser than the customer experience but must retain the same PondFish visual language.

---

## WP-01 — WORKER LOGIN

### Purpose

Authenticate worker.

### Fields

- Email.
- Password.

### Actions

- Login.

### Error

Use calm authentication feedback.

Do not reveal whether a specific email exists.

### Disabled Worker

Disabled workers cannot authenticate.

---

## WP-02 — WORKER DASHBOARD

### Purpose

Provide fast operational overview.

### Data

- Today's pending bookings.
- In-progress.
- Completed.
- Customer/bill processing access.
- Quick search.

### Primary actions

- Search booking.
- Search customer.
- Scan/retrieve booking.
- Start bill processing.

### Layout

Use compact operational cards and lists.

---

## WP-03 — BOOKING QUEUE

### Purpose

Show online and configured physical booking records requiring operational attention.

### Filters

- Status.
- Date.
- Source.

### Card/List

- Booking ID.
- Customer.
- Fish.
- Quantity.
- Payment.
- Status.
- Expiry.

### States

- Loading.
- Empty.
- Filtered empty.
- Error.

---

## WP-04 — BOOKING SEARCH

### Search By

- Booking ID.
- Customer name.
- Phone.
- Total payment amount.

### Behavior

Search should tolerate normal formatting differences where backend supports it.

---

## WP-05 — BOOKING DETAILS

### Display

- Booking/customer.
- Fish.
- Quantity.
- Payment.
- Subscription.
- Status.
- Expiry.
- Collection state.

### Actions

Only show actions valid for the current backend state.

---

## WP-06 — COMPLETE ONLINE BOOKING

### Purpose

Complete an eligible collected online booking.

### Preconditions

Booking must be in a state eligible for completion.

### Action

`Complete Booking`

### Success

```text
Booking completed successfully.
```

### Invalid State

```text
This booking cannot be completed in its current state.
```

### QR/Code

If a QR/code is used, completion invalidates it according to the locked workflow.

### Important Rule

Physical purchases do not require this completion action.

---

## WP-07 — CUSTOMER SEARCH

### Purpose

Find a customer for worker-assisted physical purchase.

### Search

- Name.
- Phone.
- Identifier where authorized.

### Result

Show only information required for the workflow.

---

## WP-08 — BILL CAPTURE

### Purpose

Process a physical bill for a customer without a phone.

### Flow

```text
Select Customer
→ Capture Bill
→ AI Processing
→ Review
```

### UI

Tablet-optimized camera/upload interface.

### States

Same bill processing states as customer flow.

---

## WP-09 — AI BILL REVIEW

### Display

- Bill ID.
- Fish.
- Quantity.
- Price.
- Totals.

### Actions

- Confirm.
- Scan again.
- Manual Bill ID when required.

### Rule

AI does not authorize financial processing.

---

## WP-10 — WORKER SUBSCRIPTION / PAYMENT

### Display

- Fish eligibility.
- Weekly limit.
- Weekly used/remaining.
- Credit.
- Credit used.
- Remaining amount.

### Payment

Worker-assisted physical purchase supports:

- Razorpay.
- Cash.

Cash is restricted to this worker-assisted flow.

### UI

Make payment breakdown extremely easy to verify before final action.

---

## WP-11 — TRANSACTION RESULT

### Display

- Transaction ID.
- Customer.
- Bill.
- Fish.
- Quantity.
- Total.
- Subscription value.
- Payment method.
- Worker identity.
- Date/time.

### Success

Transaction becomes successful only after backend finalization.

No second completion action is required.

---

## WP-12 — WORKER TRANSACTION HISTORY

### Purpose

Search completed and recorded worker-linked transactions.

### Data

- transaction ID,
- customer,
- bill,
- fish,
- amount,
- payment method,
- worker,
- timestamp,
- status.

### Filters

- date,
- status,
- payment method.

---

# 27. SHOP TRANSACTION TV

TV is a read-only public display.

It must not look like an admin dashboard.

---

## TV-01 — TRANSACTION DISPLAY

### Purpose

Show successful physical transactions to the store.

### Only

Successful transactions are shown.

### Display

- Customer name where approved.
- Transaction ID.
- Fish.
- Quantity.
- Bill number.
- Time.
- Combined successful transaction value where approved.

### Visual

- Very large typography.
- High contrast.
- Minimal copy.
- Distance-first readability.
- Slow purposeful transitions.

### Sensitive Information

Never expose sensitive customer data.

---

## TV-02 — REAL-TIME UPDATE

### Flow

```text
Successful Transaction
→ Database Commit
→ Realtime Event
→ TV Receives Event
→ Transaction Appears
→ Optional Bell/Notification Sound
```

No manual refresh.

TV acknowledgement never controls transaction success.

---

## TV-03 — DAILY HISTORY

Transactions remain visible for the business day.

A new business-day display starts automatically.

---

## TV-04 — RECONNECTION

After network/browser restart:

```text
Authenticate
→ Load authoritative current-day successful transactions
→ Reconcile display
→ Resume realtime
```

This prevents missed events.

---

## TV-05 — NO TRANSACTIONS

Show a branded quiet state.

Example:

```text
No transactions yet today.
```

Avoid a large error-looking screen.

---

## TV-06 — OFFLINE

Show a discreet connection-lost indicator.

Do not hide the whole display unless the application cannot safely continue.

---

# 28. ADMIN PORTAL

Admin is desktop-first and operationally dense.

The visual language remains PondFish, but the information architecture prioritizes efficiency.

---

## AP-01 — ADMIN LOGIN

### Fields

- Username/email.
- Password.

### States

- Invalid credentials.
- Session expired.
- Network failure.
- Account disabled/unauthorized.

---

## AP-02 — ADMIN DASHBOARD

### Purpose

Operational overview.

### Summary

- Transactions.
- Revenue.
- Subscription activity.
- Inventory.
- Low stock.
- Freshness alerts.
- Workers.
- GPS journey.
- Offers.
- Bookings.
- Failed/pending transactions.

### Design Rule

Dashboard is an operational summary, not a replacement for detailed management pages.

---

## AP-03 — FISH MANAGEMENT

### Purpose

Manage fish catalogue records.

### Data

- Name.
- Category.
- Image.
- Description.
- Price.
- Active state.
- Online booking eligibility.
- Freshness configuration.
- Inventory reference.

### Actions

- Create.
- Edit.
- Activate.
- Deactivate.

### Validation

- Required fields.
- Valid price.
- Valid category.
- Valid freshness configuration.
- Valid image where required.

### States

- Loading.
- Empty.
- Validation error.
- Save success.
- Save failure.
- Concurrent update conflict.

### Audit

Critical changes must be recorded.

---

## AP-04 — CATEGORY MANAGEMENT

### Actions

- Create.
- Edit.
- Activate/deactivate.
- Assign fish.

### Important Rule

Categories organize discovery.

They are not subscription eligibility groups.

---

## AP-05 — INVENTORY MANAGEMENT

### Display

- Physical quantity.
- Reserved quantity.
- Available quantity.
- Freshness.
- Movement history.

### Actions

- Increase.
- Decrease.
- Correction.
- Removal.
- Wastage/disposal.

### Visual

Use strong quantity/status hierarchy.

### Error States

- stale data,
- concurrent update,
- negative quantity attempt,
- insufficient stock.

### Audit

Every critical adjustment is auditable.

---

## AP-06 — FRESHNESS MANAGEMENT

### Display

- Fish.
- Freshness batch.
- Current state.
- Start time.
- Configured durations.

### States

```text
Green / Fresh
Grey / Aging
Red / Expired
```

### Actions

- Configure durations.
- Inspect.
- Decide physical disposition when expired.

### Red State

Online availability is removed according to the business rules.

Admin chooses the physical disposition.

---

## AP-07 — DISCOUNTS / OFFERS

### Fields

- Fish.
- Discount type.
- Value.
- Start.
- End.
- Campaign.
- Visibility.
- Flash-sale state.

### Actions

- Create.
- Schedule.
- Activate.
- Stop.

### Validation

Prevent invalid date ranges and unsupported stacking.

### Visual

Use Offer Coral sparingly.

---

## AP-08 — GPS / JOURNEYS

### Purpose

Manage OneLap truck journey and customer publication.

### Journey Form

- Journey ID.
- Truck.
- Fish.
- Quantities.
- Origin.
- Fixed destination.
- Start.
- ETA.
- Publication state.

### Actions

- Create journey.
- Start journey.
- Publish customer tracking.
- Stop/close publication where supported.
- Continue admin monitoring.

### Map States

- Loading.
- Live.
- Stale.
- Provider unavailable.
- Arrived.
- Processing.
- Closed.

### Important Rule

Admin always has GPS visibility when data is available.

Customer sees GPS only after explicit publication.

---

## AP-09 — CUSTOMER MANAGEMENT

### Search

- Name.
- Phone.
- Identifier where authorized.

### Display

- Profile.
- Account status.
- Subscription.
- Transactions.
- Purchases.
- Bookings.

### Actions

- Edit permitted information.
- Block/deactivate where authorized.

### Security

Do not expose unrelated customer data.

### Audit

Status changes must be auditable.

---

## AP-10 — WORKER MANAGEMENT

### Actions

- Create.
- Edit.
- Disable.
- Inspect worker activity.

### Data

- Name.
- Email.
- Status.
- Worker-linked transaction/activity history.

### Security

Disabled workers cannot authenticate.

---

## AP-11 — SUBSCRIPTION MANAGEMENT

### Manage

- Plans.
- Eligibility.
- Weekly limits.
- Credit.
- Customer assignments.

### Customer Assignment

```text
Search Customer
→ Select Plan
→ Select Payment Source
→ Confirm
→ Activate / Add Credit
→ Record Ledger
```

### Payment Sources

- Cash.
- Razorpay where applicable.

### Audit

Subscription assignment and credit adjustments require traceability.

---

## AP-12 — TRANSACTION MANAGEMENT

### Search/Filter

- Transaction ID.
- Bill.
- Customer.
- Phone.
- Date.
- Payment method.
- Status.

### Detail

- Bill image.
- Payment.
- Subscription usage.
- Worker.
- Inventory effect.
- Audit reference.

### Important

Successful, failed and pending states must remain visually distinct.

---

## AP-13 — BOOKING MANAGEMENT

### Search/Filter

- Booking ID.
- Customer.
- Status.
- Date.
- Expiry.
- Source.

### Detail

- Customer.
- Fish.
- Quantity.
- Payment.
- Subscription.
- Reservation.
- Expiry.
- Completion/cancellation.

### State

Do not show an action unless the backend state permits it.

---

## AP-14 — NOTIFICATION MANAGEMENT

### Actions

- Create.
- Send.
- Schedule.
- Cancel unsent notification.
- Inspect delivery history.

### Audiences

- Everyone.
- Subscription customers.
- Specific plan.
- Individual customer.

### Data

- Title.
- Message.
- Audience.
- Channel.
- Schedule.
- Delivery state.

### Failure

Notification failure does not undo the underlying business transaction.

---

## AP-15 — REPORTS

### Reports

- Revenue.
- Transactions.
- Fish sales.
- Subscriptions.
- Inventory.
- Wastage.
- Worker cash.
- Worker activity.

### Export

- CSV.
- Excel.

### UI

Use filters and date range before generating large reports.

---

## AP-16 — AUDIT LOGS

### Display

- Actor.
- Action.
- Target.
- Previous value.
- New value.
- Timestamp.
- Reference/correlation ID.

### Rules

Audit logs are read-only for normal users.

---

## AP-17 — SETTINGS

### Configurable Values

- Razorpay fee.
- GST on gateway fee.
- Booking expiry.
- Freshness durations.
- Post-arrival tracking duration.
- Notification settings.
- Store destination.
- Other approved business configuration.

### UI

Settings should be grouped by domain.

Avoid one giant unstructured form.

### Save

Use:

```text
Edit
→ Validate
→ Confirm if significant
→ Save
→ Success
```

---

# 29. SYSTEM AND FAILURE PAGES

These pages/states are mandatory parts of the product, not optional polish.

---

## SYS-01 — 404 PAGE NOT FOUND

### Purpose

Handle invalid/nonexistent routes.

### Layout

```text
PondFish Header
Friendly 404 Visual
Page Not Found
Short explanation
Back to PondFish
View Today's Fish
Footer
```

### Example Copy

```text
We couldn't find that page.
```

### Actions

- Back to PondFish.
- View Today's Fish.

### Rule

Retain global navigation where safe.

---

## SYS-02 — 500 SERVER ERROR

### Purpose

Handle unexpected server failure.

### Copy

```text
Something went wrong.
Please try again.
```

### Actions

- Try Again.
- Go Home.

### Never show

- stack traces,
- database errors,
- internal IDs,
- infrastructure details.

---

## SYS-03 — NETWORK / OFFLINE

### Purpose

Handle loss of internet connectivity.

### UI

```text
Connection lost
Please check your internet connection and try again.
```

Actions:

- Retry.
- Continue where safe.

### Important

Preserve:

- typed forms,
- selected quantities,
- safe local UI state.

Do not assume payment failure.

---

## SYS-04 — API / SERVICE UNAVAILABLE

### Purpose

Handle backend/service unavailability while the browser itself may remain online.

### Copy

```text
PondFish services are temporarily unavailable.
Please try again.
```

### Actions

- Retry.
- Home.

If stale data is intentionally shown, label it as stale.

---

## SYS-05 — SESSION EXPIRED

### Purpose

Handle expired authentication.

### Copy

```text
Your session has expired.
Please log in again.
```

### Actions

- Login Again.

### Rule

Preserve original destination where safe.

Do not preserve sensitive payment state in unsafe client storage.

---

## SYS-06 — UNAUTHORIZED / FORBIDDEN

### Purpose

Handle authenticated users without required permission.

### Copy

```text
You don't have permission to access this page.
```

### Actions

- Back.
- Home.

Do not reveal protected resource details.

---

## SYS-07 — MAINTENANCE

### Purpose

Communicate planned service downtime.

### UI

- PondFish branding.
- Maintenance icon/illustration.
- Short explanation.
- Retry/refresh.
- Return home where applicable.

Only show an estimated return time if it is known.

---

## SYS-08 — EMPTY CATALOGUE

### Copy

```text
No fish are available right now.
```

### Actions

- Refresh.
- View all categories.
- Contact store.

---

## SYS-09 — SEARCH NO RESULTS

### Display

```text
No results for “<search term>”
```

Actions:

- Clear search.
- Browse categories.
- View today's available fish.

---

## SYS-10 — OUT OF STOCK

### Purpose

Represent a fish that cannot currently be booked/purchased through the current channel.

### UI

- Out of stock badge.
- Disabled booking action.
- Alternative fish where available.

Do not hide the fish unnecessarily if it remains useful to explain availability.

---

## SYS-11 — BOOKING EXPIRED

### Copy

```text
This booking has expired after the collection window.
```

### Actions

- View booking history.
- Return to catalogue.

Backend restoration occurs according to the Master PRD.

---

## SYS-12 — PAYMENT FAILED

### Copy

```text
Payment was not completed.
You can retry the payment.
```

### Actions

- Retry payment.
- Return.

---

## SYS-13 — PAYMENT PENDING

### Copy

```text
Your payment is still being confirmed.
```

### Actions

- Refresh status.
- View transaction.

Do not create a second payment solely because the browser timed out.

---

## SYS-14 — PERMISSION DENIED

### Purpose

Communicate lack of permission without exposing sensitive information.

### Copy

```text
You don't have permission to perform this action.
```

Where supported:

- Retry.
- Open settings.

---

# 30. CUSTOMER RESPONSIVE DESIGN

## <640px

- Single-column sections.
- Compact header.
- Touch-first controls.
- Fish cards may become 2-column only if readability remains comfortable.
- Avoid horizontal overflow.
- Sticky CTA only where it improves the task.

## 640–1024px

- 2–3 column catalogue.
- Simplified navigation.
- Comfortable touch targets.

## 1024–1440px

- Full navigation.
- 3–4 column catalogue.
- Split hero.
- Wider information layouts.

## >1440px

Constrain maximum content width.

Do not stretch:

- text,
- cards,
- forms,

excessively across the screen.

## Universal

- Minimum touch target approximately 44px.
- No critical information depends on hover.
- Visible keyboard focus.
- Respect reduced-motion preference.
- Avoid horizontal scrolling except for intentional tables.

---

# 31. WORKER RESPONSIVE RULES

Worker portal is tablet-first.

### Primary target

Approximately 768px and above.

### Priorities

1. Fast search.
2. Large touch controls.
3. Scan/capture access.
4. Booking status.
5. Customer identity.
6. Payment confirmation.
7. Completion action.

Avoid tiny desktop-style controls.

---

# 32. ADMIN RESPONSIVE RULES

Admin is desktop-first.

### Priorities

- Data density.
- Tables.
- Filters.
- Detail panels.
- Bulk operations where approved.
- Clear permission boundaries.

Tablet support should remain usable but may simplify tables and navigation.

---

# 33. SHOP TV RESPONSIVE RULES

TV is fullscreen.

Priorities:

1. Large type.
2. High contrast.
3. Distance readability.
4. Minimal content.
5. Automatic updates.
6. Connection state.

No hover interactions.

No operational controls.

---

# 34. ACCESSIBILITY REQUIREMENTS

## Color

Never communicate state with color alone.

Example:

Bad:

```text
Green = success
Red = failure
```

Better:

```text
✓ Booking confirmed
```

and:

```text
Payment failed
```

## Forms

Every input requires:

- accessible label,
- error association,
- focus state.

## Keyboard

- Logical tab order.
- Visible focus.
- Keyboard-operable controls.

## Images

Informative fish images require meaningful alt text.

Decorative images should not add unnecessary screen-reader noise.

## Motion

Respect reduced-motion preferences.

Avoid:

- excessive animation,
- flashing,
- distracting transitions.

## Errors

Every error should communicate:

1. What happened.
2. What the user can do next.

---

# 35. CONTENT AND MICROCOPY RULES

Use practical retail language.

Approved examples:

- `Book for collection`
- `Available: 14.5 kg`
- `Today's offers`
- `Store Open Now`
- `Fresh / 0–24h`
- `Limited stock at store`
- `In-store collection only`

Avoid:

- technical API terminology,
- internal status codes,
- engineering language,
- blame-oriented error messages.

## Variable Pricing

If final price can change because of actual packed weight, explain that before commitment.

## Error Writing

Bad:

```text
HTTP 500.
```

Better:

```text
Something went wrong.
Please try again.
```

---

# 36. MASTER PAGE INVENTORY

## Public Website

- PW-01 Home
- PW-02 Fish Catalogue
- PW-03 Fish Detail
- PW-04 Subscription Plans
- PW-05 Offers
- PW-06 How PondFish Works
- PW-07 About Store
- PW-08 Contact / Store Information

## Customer Authentication

- CP-01 Login / OTP
- CP-02 Registration / Profile Setup
- CP-03 Session Expired
- CP-04 Unauthorized / Forbidden

## Customer Shopping

- CP-05 Customer Dashboard
- CP-06 Fish Discovery
- CP-07 Fish Detail
- CP-08 Quantity Selection / Cart
- CP-09 Booking Review
- CP-10 Booking Confirmation
- CP-11 Booking History
- CP-12 Booking Detail

## Customer Physical Purchase

- CP-13 Scan Bill
- CP-14 AI Bill Processing
- CP-15 Extracted Bill Confirmation
- CP-16 Manual Bill ID
- CP-17 Subscription Coverage Breakdown
- CP-18 Payment Processing
- CP-19 Payment Success / Receipt
- CP-20 Payment Failed
- CP-21 Payment Pending
- CP-22 Payment Cancelled
- CP-23 Refund / Credit Return Status
- CP-24 Transaction History
- CP-25 Subscription
- CP-26 GPS Live Tracking
- CP-27 Notifications
- CP-28 Profile / Account

## Worker

- WP-01 Login
- WP-02 Dashboard
- WP-03 Booking Queue
- WP-04 Booking Search
- WP-05 Booking Details
- WP-06 Complete Booking
- WP-07 Customer Search
- WP-08 Bill Capture
- WP-09 AI Bill Review
- WP-10 Subscription / Payment
- WP-11 Transaction Result
- WP-12 Transaction History

## Admin

- AP-01 Login
- AP-02 Dashboard
- AP-03 Fish Management
- AP-04 Category Management
- AP-05 Inventory
- AP-06 Freshness
- AP-07 Discounts / Offers
- AP-08 GPS / Journeys
- AP-09 Customers
- AP-10 Workers
- AP-11 Subscriptions
- AP-12 Transactions
- AP-13 Bookings
- AP-14 Notifications
- AP-15 Reports
- AP-16 Audit Logs
- AP-17 Settings

## TV

- TV-01 Transaction Display
- TV-02 Realtime State
- TV-03 No Transactions
- TV-04 Offline / Reconnection
- TV-05 Maintenance

## System

- SYS-01 404
- SYS-02 500
- SYS-03 Offline / Network Error
- SYS-04 API Unavailable
- SYS-05 Session Expired
- SYS-06 Unauthorized / Forbidden
- SYS-07 Maintenance
- SYS-08 Empty Catalogue
- SYS-09 Search No Results
- SYS-10 Out of Stock
- SYS-11 Booking Expired
- SYS-12 Payment Failed
- SYS-13 Payment Pending
- SYS-14 Permission Denied

---

# 37. IMPLEMENTATION RULES

## 37.1 Build Primitives First

Build and approve reusable primitives before page-specific implementation:

1. Button
2. Input
3. Search
4. Select
5. Badge
6. Status
7. Card
8. Fish Card
9. Modal
10. Drawer
11. Toast
12. Tabs
13. Table
14. Pagination
15. Empty State
16. Error State
17. Skeleton
18. Confirmation
19. Timeline
20. Price Breakdown
21. Quantity Control
22. Notification Item
23. Map/Tracking State

## 37.2 No One-Off Styling

Do not create a different button style for every page.

Do not create a different card style for every module unless there is a documented semantic reason.

## 37.3 Tokens Only

Colors, typography, spacing, radius and elevation must use shared design tokens.

## 37.4 Data-Driven Screens

Every data-driven screen must support:

```text
Loading
→ Populated
→ Empty / Filtered Empty
→ Error
→ Retry
```

where applicable.

## 37.5 Business Rules Must Be Visible Before Commitment

Where relevant, users should see:

- stock,
- pickup,
- estimated/final-weight pricing explanation,
- credit balance,
- weekly allowance,
- booking validity,
- payment breakdown.

## 37.6 Backend Authority

UI may:

- hide unavailable actions,
- disable unavailable controls,
- provide early validation.

UI must never become the authoritative source for:

- payment success,
- inventory,
- subscription balance,
- booking state,
- transaction success,
- GPS publication,
- authorization.

---

# 38. DESIGN-TO-CODE WORKFLOW

The implementation workflow is:

```text
PRD
 ↓
Frontend Architecture
 ↓
Design System
 ↓
Screen Requirements
 ↓
Stitch / UI Starting Point
 ↓
Human Design Review
 ↓
Polished UI Specification
 ↓
Code
 ↓
QA
```

Design tools may create the visual starting point.

They must not invent business workflows.

AI coding agents must follow the approved specification and must not invent:

- new screens,
- new business states,
- new payment methods,
- new subscription rules,
- new inventory behavior,
- new booking behavior.

---

# 39. PAGE COMPLETION CHECKLIST

A page is not considered implementation-ready until the following are answered:

### Structure

- [ ] Page ID exists.
- [ ] Purpose defined.
- [ ] Access/role defined.
- [ ] Entry points defined.
- [ ] Exit/navigation behavior defined.

### UI

- [ ] Sections defined.
- [ ] Fields defined.
- [ ] Data displayed defined.
- [ ] Primary action defined.
- [ ] Secondary actions defined.
- [ ] Component types defined.

### Behavior

- [ ] Main workflow defined.
- [ ] Validation defined.
- [ ] Confirmation defined where necessary.
- [ ] Permission behavior defined.
- [ ] Backend dependency defined.
- [ ] Cross-portal effect defined.

### States

- [ ] Loading.
- [ ] Empty.
- [ ] Filtered empty where relevant.
- [ ] Success.
- [ ] Error.
- [ ] Retry.
- [ ] Offline/network where relevant.
- [ ] Stale data where relevant.

### Quality

- [ ] Edge cases.
- [ ] Accessibility.
- [ ] Responsive behavior.
- [ ] Audit requirement.
- [ ] Acceptance criteria.

---

# 40. UI/UX ACCEPTANCE CRITERIA

The PondFish UI system is considered correctly implemented when:

1. PondFish has one consistent visual language across all portals.
2. Customer screens feel like premium retail rather than generic SaaS.
3. The approved navy/blue/green/coral system is used consistently.
4. Fish discovery is photography-led.
5. Operational screens remain efficient and data-led.
6. There is one clear primary action per major section.
7. Cards and buttons use shared components.
8. No page invents one-off styling without a documented reason.
9. Price, stock and freshness are easy to scan.
10. Online booking eligibility is visually clear.
11. Subscription Credit and weekly quantity are visually distinct.
12. Payment states are explicit.
13. Network failure does not falsely report payment failure.
14. 404, 500, offline, API unavailable, maintenance and permission states exist.
15. Every important data-driven page has loading/empty/error behavior.
16. Every important asynchronous action prevents duplicate submission.
17. Status is never communicated by color alone.
18. Customer pages work comfortably on mobile.
19. Worker pages work comfortably on tablets.
20. Admin pages remain usable at desktop data density.
21. TV pages are readable from a distance.
22. Accessibility requirements are implemented.
23. Business rules remain owned by the backend/Master PRD.
24. UI state reflects authoritative backend state.
25. No later screen contradicts the approved design system.

---

# 41. FINAL PONDFISH DESIGN STANDARD

## Locked Visual Baseline

Use:

- navy brand header,
- white/light-blue surfaces,
- fresh green status,
- restrained coral offers,
- clean medium-radius cards,
- photography-led fish discovery,
- strong CTA hierarchy,
- practical retail language.

## Premium Factor

Do **not** make PondFish premium by adding visual noise.

The premium quality should come from:

- typography,
- photography,
- spacing,
- hierarchy,
- consistency,
- micro-interactions,
- polished loading states,
- polished empty states,
- polished error states,
- polished offline states.

The product should feel:

> **Fresh. Trustworthy. Modern. Premium. Local.**

PondFish is one product ecosystem.

Therefore:

> **One product ecosystem. One visual language. One reusable UI system.**
