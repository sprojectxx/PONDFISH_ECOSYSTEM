# PONDFISH — PAGE-BY-PAGE UI SPECIFICATION
## Customer React Native Mobile Application

**Document Type:** Implementation UI Specification  
**Version:** 1.0  
**Status:** Detailed Build Reference  
**Platform:** React Native Mobile Application  
**Initial Target:** Android  
**Future Target:** iOS  
**Backend:** Shared PondFish backend/API  
**Authentication:** Mobile Number + OTP  
**Payment:** Razorpay for customer self-service online payments  
**Primary Source of Truth:** PondFish Master PRD, Customer Portal PRD, Backend/Technical Architecture, Frontend/Application Architecture and approved Design System

---

# 1. DOCUMENT PURPOSE

This document converts the locked PondFish customer workflows into implementation-ready page and state specifications for the **native React Native Customer Application**.

This document is intended to be used for:

- Stitch/design reference
- Mobile UI implementation
- React Native feature planning
- API integration
- QA
- AI coding agents
- Developer handoff
- Acceptance testing

It does **not** replace the Master PRD, backend/API specification or business rules.

The UI must present and execute the customer-facing workflows defined by the backend. The backend remains authoritative for:

- Fish availability
- Online-booking eligibility
- Prices
- Subscription eligibility
- Subscription Credit
- Weekly quantity
- Payment amount
- Razorpay verification
- Booking creation
- Inventory reservation
- Booking cancellation/expiry
- Transaction finalization
- GPS publication
- Notification generation

The frontend must never invent authoritative financial, inventory or subscription values.

---

# 2. APPLICATION SCOPE

## 2.1 Customer Product

The customer product is a **React Native mobile application**, Android first, with an architecture suitable for iOS.

The application uses the same backend, APIs and business rules as the rest of PondFish.

The customer can:

- Register
- Authenticate with mobile OTP
- Browse fish
- Browse categories
- View fish details
- Add eligible fish to cart
- Book fish online
- Pay through Razorpay
- View booking confirmation
- Use a QR pickup ticket
- View booking history
- Cancel eligible bookings
- View subscription information
- Purchase/recharge subscriptions
- View Subscription Credit
- View weekly quantity
- Scan physical bills
- Upload bill images
- Review AI-extracted bill information
- Enter Bill ID manually when AI cannot read it
- Pay remaining physical-purchase amount through Razorpay
- View transaction results
- View transaction history/receipts
- View live delivery tracking when Admin has published it
- Receive notifications
- Manage permitted profile data
- Manage application notification preferences
- Contact support
- Log out

## 2.2 Explicit Boundaries

The customer application does not:

- Manage inventory
- Change fish master data
- Configure fish
- Configure subscription plans
- Change prices
- Create discounts
- Publish GPS journeys
- Operate worker workflows
- Scan customer QR tickets
- Complete online bookings
- Process worker cash
- Modify business settings
- Perform administrative reporting

---

# 3. APPLICATION ARCHITECTURE

The React Native application is structured around:

```text
React Native
    ↓
Navigation
    ↓
Screen / Feature Modules
    ↓
State Management
    ↓
API / Service Layer
    ↓
Backend
```

Supporting capabilities:

```text
OTP Authentication
Secure Session Storage
API Client
Realtime Client
Push Notifications
Camera
Image Upload
GPS / Map UI
Razorpay Integration
Error Mapping
Network Handling
```

The architecture specification requires the frontend to handle Initial, Loading, Success, Empty, Validation Error, Business Error, Network Error, Permission Error and Retry states.

---

# 4. CUSTOMER NAVIGATION

## 4.1 Primary Mobile Navigation

Recommended primary navigation:

```text
Home
Fish
Subscription
Notifications
Profile
```

Bookings and transactions remain accessible from Home/Profile and their dedicated history screens.

## 4.2 Secondary Navigation

Customer workflows include:

```text
Home
 ├── Browse Fish
 ├── Scan Bill
 ├── Subscription
 ├── Active Booking
 ├── Live Tracking
 ├── Recent Transaction
 └── Notifications

Fish
 ├── Categories
 ├── Fish Listing
 ├── Fish Details
 └── Cart

Profile
 ├── Booking History
 ├── Transaction History
 ├── Subscription
 ├── Settings
 └── Support
```

## 4.3 Global Navigation Rules

- Authentication screens do not show authenticated navigation.
- Authenticated screens show the main navigation.
- Payment screens may temporarily hide normal navigation to prevent accidental interruption.
- Camera screens use native navigation.
- Razorpay flow must safely return to the application.
- A customer must not lose the current transaction state because of ordinary navigation changes.
- Sensitive transaction data must not be placed in navigation parameters where it can be exposed unnecessarily.

---

# 5. GLOBAL MOBILE UI RULES

## 5.1 Design System

All screens must use the approved PondFish Design System.

Use:

- Approved typography
- Approved spacing
- Approved buttons
- Approved cards
- Approved inputs
- Approved status indicators
- Approved bottom sheets
- Approved dialogs
- Approved loading patterns
- Approved error patterns
- Approved navigation patterns

Do not create one-off visual components without a documented reason.

## 5.2 Native Mobile Behavior

The application must feel like a real mobile product rather than a website placed inside a mobile frame.

Use:

- Native-feeling navigation
- Safe-area handling
- Native keyboard behavior
- Native camera access
- Native permission prompts
- Touch-friendly controls
- Appropriate bottom sheets
- Appropriate system back behavior
- Scroll position preservation
- Pull-to-refresh where useful
- Haptic feedback where approved

## 5.3 Touch Targets

Interactive controls must have comfortable touch areas.

Avoid:

- Tiny text links
- Closely packed icon buttons
- Actions that require precise taps
- Destructive actions without confirmation

## 5.4 Keyboard

For forms:

- Automatically focus appropriate fields
- Avoid keyboard covering the active field
- Use correct keyboard type
- Support next/done navigation
- Dismiss keyboard when appropriate
- Validate on submit and on appropriate field transitions

---

# 6. GLOBAL STATE MODEL

Every API-backed screen must account for:

```text
Initial
↓
Loading
↓
Success
```

Alternative outcomes:

```text
Empty
Validation Error
Business Error
Network Error
Permission Error
Retry
```

## 6.1 Loading

Use skeletons or appropriate mobile loading indicators.

Loading must:

- Preserve layout structure
- Prevent duplicate actions
- Communicate progress for long operations
- Never falsely display successful financial data

## 6.2 Empty

Every empty state must explain:

- What is empty
- Why it matters
- What the customer can do next

## 6.3 Validation Error

Validation errors must be attached to the relevant field or action.

Example:

> Enter a valid mobile number.

## 6.4 Business Error

Example:

> This fish is no longer available for online booking.

## 6.5 Network Error

Example:

> We couldn't connect to PondFish. Check your connection and try again.

## 6.6 Retry

Retry should repeat the failed operation without unnecessarily resetting unrelated screen state.

## 6.7 Permission Error

For camera/location/notification permissions:

- Explain why permission is required
- Provide the relevant action
- Provide a path to system settings when permission has been permanently denied

---

# 7. AUTHENTICATION MODULE

# CP-01 — CUSTOMER ACCESS

## 7.1 Screen Group

CP-01 includes:

```text
Splash
↓
Welcome / Access
↓
Mobile Number
↓
OTP Verification
↓
Profile Completion when required
↓
Authenticated Home
```

---

# 8. CP-01A — SPLASH SCREEN

## Purpose

Initialize the customer application and determine the correct starting state.

## Responsibilities

- Initialize application services
- Check secure session
- Check authentication state
- Load minimum configuration
- Determine whether customer profile completion is required

## Display

- PondFish logo
- Minimal brand treatment
- Progress indicator only when needed

## Behavior

If valid session exists:

```text
Splash
↓
Session Validation
↓
Profile Complete?
 ├─ Yes → Home
 └─ No → Profile Completion
```

If no valid session:

```text
Splash
↓
Welcome / Mobile Number
```

## Error

If startup services cannot initialize:

> We couldn't start PondFish.

Action:

> Try Again

Do not show internal error details.

---

# 9. CP-01B — WELCOME / ACCESS

## Purpose

Provide the entry point for customer authentication.

## Display

- PondFish branding
- Short value proposition
- Continue/Login action
- Create Account action if the UX separates the two flows

## Authentication Rule

Customer authentication uses:

```text
Mobile Number
↓
OTP
```

No customer password.

No:

- Email login
- Username login
- Password login
- Social login
- Forgot password flow

## Actions

Primary:

> Continue with Mobile Number

---

# 10. CP-01C — MOBILE NUMBER

## Purpose

Collect the customer's mobile number before OTP verification.

## Fields

### Mobile Number

Required.

Use:

- Country code
- Numeric keyboard
- Appropriate mobile-number formatting
- Validation

## Validation

Reject:

- Empty number
- Invalid format
- Unsupported format

Message:

> Enter a valid mobile number.

## Loading

After valid submission:

```text
Send OTP
↓
Loading
↓
OTP Screen
```

Prevent duplicate OTP requests while the request is processing.

## Network Error

> We couldn't send the OTP.

Action:

> Try Again

---

# 11. CP-01D — OTP VERIFICATION

## Purpose

Verify the customer's identity.

## Display

- Masked mobile number
- OTP input
- Countdown
- Resend OTP
- Change mobile number

## States

### Waiting

> Enter the OTP sent to your mobile.

### Invalid OTP

> The OTP is incorrect. Please try again.

### Expired OTP

> This OTP has expired. Request a new OTP.

### Attempt Limit

> Too many attempts. Please wait and try again.

### Resend

Resend remains disabled until the configured countdown expires.

## Successful Verification

Existing customer:

```text
OTP Success
↓
Load Customer
↓
Home
```

New customer:

```text
OTP Success
↓
Profile Completion
```

## Security

Do not expose OTP in logs or UI.

---

# 12. CP-01E — PROFILE COMPLETION

## Purpose

Complete the minimum customer profile after first registration.

## Fields

- Full Name
- Mobile Number — read-only
- Age
- Area / Locality

## Required

All required profile fields must be completed before entering authenticated features.

## Validation

### Full Name

Required.

### Age

Required and must satisfy configured valid range.

### Area

Required.

## Mobile Number

The verified mobile number is the account identifier and is not directly editable.

## Submit

> Complete Profile

## Loading

Disable submission while saving.

## Success

```text
Profile Created
↓
Load Customer Dashboard
↓
Home
```

## Error

> We couldn't complete your profile.

Action:

> Try Again

---

# 13. AUTHENTICATION SESSION RULES

## Session Storage

Use secure session storage.

## Logout

After logout:

- Clear authenticated session
- Clear sensitive cached data
- Remove customer-specific realtime subscriptions
- Remove/refresh device notification association as required
- Return to authentication

## Session Expired

Message:

> Your session has expired. Please sign in again.

Action:

> Sign In

Do not silently expose authenticated screens after session expiration.

---

# 14. CP-02 — HOME DASHBOARD

## Purpose

The Home Dashboard is the customer's control center.

It should answer quickly:

- Is my subscription active?
- How much Subscription Credit remains?
- How much weekly fish quantity remains?
- What fish are available today?
- Is a delivery currently published?
- Is there an active booking?
- Are there important notifications?
- Is there a recent transaction?

## Layout Order

Recommended mobile order:

```text
Welcome
↓
Subscription Summary
↓
Weekly Allowance
↓
Today's Fish
↓
Live Delivery
↓
Active Booking
↓
Recent Transaction
↓
Recent Notifications
```

## Data

Dashboard should retrieve:

- Customer profile
- Subscription
- Subscription Credit
- Weekly quantity
- Reset date
- Today's fish
- Active delivery
- Active booking
- Recent transaction
- Recent notifications

Where supported, use an aggregated dashboard API.

---

# 15. CP-02 — WELCOME CARD

Display:

- Customer name
- Membership/subscription status
- Contextual greeting

Example:

> Good morning, Stevan

Avoid exposing unnecessary personal data.

Action:

- Open Profile

---

# 16. CP-02 — SUBSCRIPTION SUMMARY

Display:

- Current plan
- Status
- Subscription Credit
- Weekly allowance
- Remaining weekly quantity

Actions:

> View Subscription

If exhausted:

> Recharge Subscription

If no active subscription:

> Explore Plans

## Empty

> No Active Subscription

Supporting text:

> Choose a subscription to use subscription benefits.

---

# 17. CP-02 — WEEKLY ALLOWANCE

Display:

```text
Weekly Allowance
2 Kg

Used
1.4 Kg

Remaining
0.6 Kg
```

Also show:

- Next reset date

The values are read-only.

The backend is authoritative.

---

# 18. CP-02 — TODAY'S FISH

Show a limited preview.

Each card:

- Fish image
- Fish name
- Price
- Physical availability
- Online-booking eligibility where applicable

Action:

> View Fish

If online booking is unavailable for the fish, do not provide an online-booking action.

---

# 19. CP-02 — LIVE DELIVERY

Show only when Admin has published an active delivery for customers.

Display:

- Delivery status
- ETA where available
- Current location
- Fish/quantity context where approved
- Tracking action

Action:

> Track Live

If no published delivery:

> No Delivery In Progress

Do not expose internal GPS information before publication.

---

# 20. CP-02 — ACTIVE BOOKING

If active booking exists:

- Booking ID
- Fish
- Quantity
- Status
- Expiry
- QR access

Action:

> View Booking

If no active booking:

> No Active Booking

---

# 21. CP-02 — RECENT TRANSACTION

Display recent successful physical transaction where available:

- Transaction ID
- Bill ID
- Amount
- Date/time
- Status

Action:

> View Transaction

If none:

> No Recent Transactions

---

# 22. CP-02 — RECENT NOTIFICATIONS

Show recent notification previews.

Action:

> View All

If none:

> You're all caught up.

---

# 23. CP-02 — HOME STATES

## Loading

Skeleton cards.

## Empty

Individual sections may be empty without making the entire dashboard empty.

## Error

> Unable to load dashboard information.

Action:

> Try Again

Independent sections may retry separately when supported.

## Business State

If a delivery is not published, hide or replace the live tracking section rather than showing unavailable GPS data.

---

# 24. CP-03 — FISH MARKETPLACE

## Purpose

Browse current fish catalogue.

## Layout

```text
Header
↓
Search
↓
Categories
↓
Availability Filter
↓
Fish Grid/List
```

## Search

Search by fish name.

Placeholder:

> Search fish...

## Categories

Categories are loaded dynamically.

Possible categories may include:

- Freshwater
- Marine
- Seasonal

Do not hardcode categories when the backend supplies them.

## Availability

Physical availability and online-booking eligibility are separate.

The marketplace must communicate:

- Available in store
- Online booking available
- Online booking unavailable
- Out of stock

## Default

Default browsing should prioritize currently available fish.

## Fish Card

Display:

- Image
- Fish name
- Category
- Price per kg
- Physical availability
- Online-booking availability
- Freshness indicator where public
- View Details

## User Actions

Can:

- Search
- Filter
- Browse categories
- Open details

Cannot directly:

- Pay
- Confirm booking
- Reserve stock

---

# 25. CP-03 — MARKETPLACE EMPTY

If no fish:

> No Fresh Fish Available Today.

Supporting text:

> Check back later or enable notifications for updates.

Action:

- Enable Notifications
- Refresh

## Search Empty

> No fish match your search.

Action:

> Clear Search

## Category Empty

> No fish are available in this category right now.

---

# 26. CP-03 — MARKETPLACE ERROR

> Unable to load today's fish.

Action:

> Try Again

---

# 27. CP-04 — FISH DETAILS

## Purpose

Provide complete information before a customer starts a booking.

## Display

- Fish image
- Fish name
- Category
- Price/kg
- Availability
- Freshness
- Source/origin
- Description
- Online-booking eligibility
- Subscription information
- Booking action

## Data

- Fish ID
- Name
- Images
- Description
- Category
- Price
- Availability
- Online booking status
- Freshness
- Origin
- Subscription eligibility summary

---

# 28. CP-04 — AVAILABILITY

Possible states:

```text
Available Today
Coming Today
Out of Stock
```

Additionally communicate:

```text
Available for Online Booking
```

or

```text
Online Booking Unavailable
```

A fish being available physically does not automatically make it bookable online.

---

# 29. CP-04 — SUBSCRIPTION INFORMATION

If active subscription:

- Plan
- Weekly allowance
- Remaining quantity
- Subscription Credit
- Eligibility information

If no subscription:

> No Active Subscription

Supporting text:

> You can still book fish and pay the applicable amount through Razorpay.

Do not block non-subscription booking.

---

# 30. CP-04 — BOOKING CTA

If eligible:

> Book Online

If not eligible:

Disable booking and explain:

> Online booking is currently unavailable for this fish.

If the fish becomes unavailable before booking:

> This fish is currently unavailable.

Action:

> Browse Fish

---

# 31. CP-04 — FISH DETAIL STATES

## Loading

Image and content skeleton.

## Not Found

> This fish is no longer available.

Action:

> Browse Fish

## API Error

> Unable to load fish details.

Action:

> Try Again

---

# 32. CP-05 — CART

## Purpose

Hold only fish that are eligible for online booking.

## Critical Rule

Only fish explicitly enabled for online booking can enter the cart.

Physical availability alone is insufficient.

## Cart Item

Display:

- Fish image
- Fish name
- Price/kg
- Quantity
- Online-booking status
- Item subtotal
- Remove action

## Quantity

Support:

- Increase
- Decrease
- Valid quantity entry

All quantity values use kilograms.

Reject:

- Zero
- Negative
- Invalid quantity
- Quantity beyond available stock

## Cart Empty

> Your cart is empty.

Action:

> Browse Fish

## Stale Eligibility

If a fish becomes non-bookable:

> This fish is no longer available for online booking.

Remove/disable the item according to the backend response and require the customer to review the cart.

---

# 33. CP-05 — CART REVALIDATION

Before checkout:

```text
Cart
↓
Availability Revalidation
↓
Price Revalidation
↓
Quantity Revalidation
↓
Online Eligibility Revalidation
↓
Subscription Calculation
↓
Checkout
```

Never assume the values displayed in the cart are still authoritative.

---

# 34. CP-06 — ONLINE BOOKING PREPARATION

## Purpose

Collect quantity and prepare the customer booking.

For a simple current MVP flow, the cart may feed directly into this preparation stage.

## Display

For each item:

- Fish
- Quantity
- Price
- Availability

## Validation

Backend validates:

- Customer
- Fish eligibility
- Freshness
- Inventory
- Quantity
- Subscription eligibility
- Subscription Credit
- Price

## Important

No booking is created merely by opening this screen.

---

# 35. CP-06 — SUBSCRIPTION CALCULATION

The backend determines:

1. Whether customer has active subscription.
2. Whether fish is eligible.
3. Weekly quantity remaining.
4. Subscription Credit remaining.
5. Quantity/value covered.
6. Remaining payable amount.

The frontend displays the returned calculation.

It does not independently decide coverage.

## Example

```text
Selected Quantity
3 Kg

Subscription-covered
2 Kg

Extra Quantity
1 Kg

Subscription Credit Used
₹640

Additional Amount
₹320
```

---

# 36. CP-06 — NO SUBSCRIPTION

Display:

> No Active Subscription

Then:

> You can still continue with your booking.

The full applicable amount is payable through Razorpay.

Optional action:

> View Subscription Plans

Do not force subscription purchase before booking.

---

# 37. CP-06 — INSUFFICIENT SUBSCRIPTION CREDIT

If eligible quantity exists but credit is insufficient:

```text
Use remaining valid Subscription Credit
↓
Calculate remainder
↓
Collect remainder through Razorpay
```

Display clearly:

- Subscription coverage
- Credit used
- Remaining payable amount

---

# 38. CP-06 — CHECKOUT SUMMARY

Display:

### Fish

- Name
- Quantity
- Price

### Subscription

- Plan
- Covered quantity
- Credit used
- Weekly quantity used

### Payment

- Additional quantity
- Base payable amount
- Razorpay fee where applicable
- GST on Razorpay fee
- Final payable amount

The server calculation is authoritative.

---

# 39. CP-06 — RAZORPAY FEE DISPLAY

Current reference configuration:

```text
Gateway fee = 2%
GST on gateway fee = 18%
```

The rates are configurable business settings.

The UI must show the server-provided final calculation.

Example:

```text
Additional Amount       ₹1,000.00
Gateway Fee 2%             ₹20.00
GST on Fee 18%              ₹3.60
Final Payable           ₹1,023.60
```

Do not hardcode the final amount in the app.

---

# 40. CP-06 — CHECKOUT CONFIRMATION

Before payment:

- Confirm booking details
- Confirm quantity
- Confirm store collection
- Confirm payment amount

Required acknowledgement where configured:

> I confirm my booking details.

> I understand that booked fish will be prepared after QR verification at the store.

---

# 41. CP-06 — PAYMENT FLOW

If final payable amount is zero:

```text
Confirm
↓
Backend Finalization
↓
Booking Created
↓
Inventory Reserved
↓
QR Generated
```

If payable amount is greater than zero:

```text
Confirm
↓
Razorpay
↓
Payment
↓
Backend Verification
↓
Booking Created
↓
Inventory Reserved
↓
QR Generated
```

The frontend callback is not authoritative.

---

# 42. CP-06 — PAYMENT FAILURE

If payment fails:

> Payment was not completed.

> Your booking has not been created.

Actions:

- Retry Payment
- Return to Booking

No booking should be created.

No inventory reservation should occur.

No subscription balance/weekly quantity should be mutated for an unsuccessful payment.

---

# 43. CP-06 — PAYMENT CANCELLED

If customer exits/cancels Razorpay:

> Payment was cancelled.

> Your booking has not been created.

Actions:

- Try Again
- Return to Cart/Booking

---

# 44. CP-06 — INVENTORY RACE CONDITION

If stock becomes unavailable before final confirmation:

> The selected quantity is no longer available. Please select a different quantity.

Do not create a booking.

Do not charge the customer.

Return the customer to the quantity/cart stage.

---

# 45. CP-07 — BOOKING CONFIRMATION / QR TICKET

## Purpose

Show successful online booking and provide the digital pickup ticket.

## Success Requirement

QR appears only after:

- Booking exists
- Inventory reservation succeeded
- Payment is verified when applicable
- Backend finalization succeeds

## Display

- Booking success
- Booking ID
- QR code
- Fish
- Quantity
- Amount
- Subscription amount/coverage
- Paid amount
- Pickup information
- Created date/time
- Expiry date/time
- Booking status

## QR Security

QR contains a secure booking reference/token.

It must not directly expose customer personal data.

---

# 46. CP-07 — PICKUP INSTRUCTIONS

Display:

> Please visit the PondFish store.

> Show this QR code to the store worker.

> The worker will scan your booking and prepare your fish.

Current release does not manage PondFish delivery of online bookings.

Customers may independently arrange an external delivery service, but PondFish does not manage that external delivery workflow.

---

# 47. CP-07 — BOOKING STATUS

Authoritative booking states include:

```text
Created
Confirmed
Pending Collection
Completed
Cancelled
Expired
```

Normal path:

```text
Created
→ Confirmed
→ Pending Collection
→ Completed
```

Terminal alternatives:

```text
Cancelled
Expired
```

---

# 48. CP-07 — QR STATES

## Active

QR is valid.

## Completed

QR remains viewable for history but cannot be reused.

Display:

> Booking Completed

## Cancelled

Display:

> Booking Cancelled

QR is invalid.

## Expired

Display:

> Booking Expired

QR is invalid.

## Invalid Retrieval

> This booking ticket is no longer valid.

---

# 49. CP-08 — BOOKING DETAILS

## Purpose

Show complete information for one booking.

## Display

- Booking ID
- Fish
- Quantity
- Price
- Subscription coverage
- Payment amount/status
- Booking status
- Created time
- Expiry time
- Completion time where applicable
- Cancellation/expiry information where applicable
- Pickup information
- QR status

## Timeline

```text
Created
↓
Confirmed
↓
Pending Collection
↓
Completed
```

Alternative:

```text
Cancelled
```

or:

```text
Expired
```

## Cancellation

If current booking state permits cancellation:

> Cancel Booking

Before action:

> Cancel this booking?

Explain that cancellation has no cancellation fee and that backend restoration will occur.

The UI does not perform restoration calculations.

---

# 50. CP-08 — CANCELLATION RESULT

After successful cancellation:

```text
Booking → Cancelled
Inventory Reservation → Released
Weekly Quantity → Restored
Subscription Credit → Restored
Applicable Razorpay-paid Booking Value → Added to Subscription Credit
```

Display a concise confirmation:

> Booking cancelled successfully.

> Your applicable booking benefits and payment value have been restored according to PondFish policy.

The backend remains authoritative.

---

# 51. CP-08 — BOOKING EXPIRY

Online bookings are valid for 48 hours from creation.

When expired:

```text
Booking → Expired
Inventory → Released
Weekly Quantity → Restored
Subscription Credit → Restored
Applicable Razorpay-paid booking value → Added to Subscription Credit
```

Display:

> This booking has expired.

The customer should be guided back to Fish.

---

# 52. CP-09 — SUBSCRIPTION MANAGEMENT

## Purpose

Provide the complete customer view of the active subscription and Subscription Credit.

## Display

- Current plan
- Subscription status
- Subscription Credit
- Used Subscription Credit where supported
- Remaining weekly quantity
- Weekly usage
- Start date
- Expiry date
- Usage history
- Purchase history
- Available plans

---

# 53. CP-09 — CURRENT SUBSCRIPTION

Current configured plans include:

```text
Type 1
₹2,000
2 Kg weekly

Type 2
₹6,000
3 Kg weekly
```

These are configurable/extensible.

The UI must retrieve plan configuration rather than hardcoding business rules.

## No Subscription

> No Active Subscription

Action:

> Choose Subscription

---

# 54. CP-09 — SUBSCRIPTION CREDIT

Subscription Credit represents monetary credit associated with the customer's subscription.

Example:

```text
Subscription purchased
₹5,000

Subscription Credit
₹5,000
```

Eligible purchases reduce the balance.

If multiple valid subscription purchases/additions exist:

```text
Existing Subscription Credit
+
New Subscription Credit
=
Updated Subscription Credit
```

Do not overwrite existing valid credit.

---

# 55. CP-09 — WEEKLY QUANTITY

Display:

- Weekly allowance
- Used
- Remaining
- Reset date

The weekly quantity is separate from monetary Subscription Credit.

Example:

```text
Weekly Allowance  2 Kg
Used              1.4 Kg
Remaining         0.6 Kg
```

---

# 56. CP-09 — SUBSCRIPTION HEALTH

Optional visual summary:

```text
Excellent
Low Credit
Subscription Exhausted
```

The health indicator must be derived from backend values/configuration.

Do not use it as an independent business rule.

---

# 57. CP-09 — PURCHASE / RECHARGE

Customer can choose an available plan.

Display:

- Plan
- Price
- Weekly quantity
- Description
- Purchase action

Action:

> Purchase

Flow:

```text
Select Plan
↓
Review
↓
Razorpay
↓
Backend Verification
↓
Subscription Activated/Updated
↓
Credit Added
↓
History Recorded
```

## Payment Failure

No subscription activation.

No credit addition.

Message:

> Payment was not completed. Your subscription has not been updated.

---

# 58. CP-09 — MANUAL RENEWAL

Subscription renewal is manual.

Do not create automatic renewal controls unless separately approved.

If expired:

> Subscription Expired

Action:

> Renew Subscription

---

# 59. CP-09 — SUBSCRIPTION HISTORY

Each record may display:

- Subscription ID
- Plan
- Purchase date
- Amount
- Payment status
- Credit added
- Status

Selecting a record opens its details.

---

# 60. CP-09 — SUBSCRIPTION STATES

## Loading

Skeleton.

## Empty

> No subscription history yet.

## Error

> Unable to load subscription details.

Action:

> Try Again

## Payment Pending

Do not show the subscription as active until backend payment verification succeeds.

---

# 61. CP-10 — NOTIFICATION CENTER

## Purpose

Provide permanent in-app history for important communication.

Push notifications are immediate alerts; Notification Center retains notification history.

## Categories

- All
- Bookings
- Subscriptions
- Delivery
- System

## Notification Card

Display:

- Icon
- Title
- Short description
- Date/time
- Read/unread state

## Actions

Customer can:

- Open notification
- Filter
- Mark read
- Mark all read

Optional delete behavior only if supported by the final product configuration.

---

# 62. CP-10 — NOTIFICATION TYPES

### Delivery

Examples:

- Live delivery started
- Live truck published
- Fish arrived
- Delivery completed

### Booking

Examples:

- Booking confirmed
- QR ticket generated
- Booking completed
- Booking cancelled
- Booking expired

### Subscription

Examples:

- Subscription activated
- Subscription recharged
- Weekly allowance reset
- Subscription Credit exhausted
- Recharge reminder

### System

Examples:

- Maintenance
- Application update
- Announcement

---

# 63. CP-10 — NOTIFICATION DEEP LINKS

Notifications may route to:

```text
Live Delivery Started → Live Tracking
Booking Confirmed → Booking/QR
Booking Completed → Booking History
Subscription Recharged → Subscription
```

The destination must be validated before navigation.

If the related object no longer exists:

> This information is no longer available.

---

# 64. CP-10 — PUSH + IN-APP FLOW

```text
Business Event
↓
Backend Creates Notification
↓
Notification Stored
↓
FCM Push
↓
Customer Device
↓
Notification Center
```

A dismissed push notification must remain available in the Notification Center.

---

# 65. CP-10 — NOTIFICATION STATES

## Empty

> You're all caught up.

## Error

> Unable to load notifications.

Action:

> Try Again

## Permission Disabled

If push notifications are disabled at OS level:

> Notifications are turned off for PondFish.

Action:

> Open Settings

Do not prevent core application usage solely because push notifications are disabled.

---

# 66. CP-11 — BOOKING HISTORY

## Purpose

Provide a permanent customer record of bookings.

## Display

Newest first.

Each card:

- Booking ID
- Fish
- Quantity
- Date
- Status
- Booking type/source where useful

## Search

Support:

- Booking ID
- Fish name

## Filters

Where supported:

- All
- Subscription bookings
- Full-payment bookings
- Partial-payment bookings
- Completed
- Cancelled
- Expired

---

# 67. CP-11 — BOOKING DETAIL

Display:

### Fish

- Fish
- Category
- Price
- Quantity

### Subscription

- Plan
- Covered quantity
- Credit used
- Remaining credit where historically relevant

### Payment

- Payable quantity
- Payment method
- Amount
- Payment status

### Booking

- Booking ID
- Date/time
- Pickup location
- Expiry
- Completion status

### QR

- QR ticket
- Active/used/invalid state

---

# 68. CP-11 — BOOKING TIMELINE

Where data exists:

```text
Booking Created
↓
Payment Completed
↓
QR Generated
↓
QR Scanned
↓
Fish Prepared
↓
Order Completed
```

Alternative terminal states:

```text
Cancelled
Expired
```

The timeline is read-only.

---

# 69. CP-11 — BOOKING HISTORY EMPTY

> No Bookings Yet

> You haven't booked any fish yet.

Action:

> Browse Fish

---

# 70. CP-11 — BOOKING HISTORY ERROR

> Unable to retrieve your booking history.

Action:

> Try Again

---

# 71. CP-12 — TRANSACTION HISTORY

## Purpose

Provide a permanent record of successful and relevant physical-purchase transactions processed through the customer application.

## Display

Each transaction may show:

- Transaction ID
- Bill ID
- Date/time
- Total bill amount
- Subscription amount/credit used
- Additional paid amount
- Payment status
- Fish summary

## Search

Support:

- Transaction ID
- Bill ID

## Filters

Where supported:

- Successful
- Failed
- Pending
- Restored/refunded where applicable

Only finalized successful transactions are treated as completed purchase records.

---

# 72. CP-12 — TRANSACTION DETAIL / RECEIPT

Display:

### Transaction

- Transaction ID
- Date/time
- Status

### Bill

- Bill ID
- Original bill image where access is permitted
- Bill items

### Fish

- Fish name
- Quantity
- Price
- Line total

### Calculation

- Total bill amount
- Subscription-covered quantity
- Subscription Credit used
- Extra quantity
- Extra amount
- Razorpay fee
- GST on Razorpay fee
- Final payable amount

### Payment

- Payment method
- Payment status
- Amount paid

Internal gateway identifiers should not be exposed unless intentionally approved.

---

# 73. CP-12 — TRANSACTION EMPTY

> No Transactions Yet

> Your completed physical purchases will appear here.

Action:

> Scan Bill

---

# 74. CP-12 — TRANSACTION ERROR

> Unable to load transaction history.

Action:

> Try Again

---

# 75. PHYSICAL PURCHASE MODULE

# CP-13 — SCAN BILL

## Purpose

Allow a customer who purchased fish physically at the PondFish store to process the received printed bill through the app.

## Entry

- Home
- Transaction section
- Profile/quick action
- Scan Bill CTA

## Flow

```text
Customer receives physical bill
↓
Open Scan Bill
↓
Capture/upload bill image
↓
AI extraction
↓
Review extracted details
↓
Bill ID validation
↓
Duplicate check
↓
Subscription calculation
↓
Remaining amount
↓
Razorpay if required
↓
Server verification
↓
Transaction finalization
↓
Receipt/history
↓
TV successful event
```

---

# 76. CP-13 — BILL CAPTURE

## Input Methods

- Camera capture
- Image upload

## Camera Permission

First request:

> PondFish needs camera access to scan your fish bill.

Actions:

- Allow
- Not Now

If permanently denied:

> Camera access is disabled.

Action:

> Open Settings

Provide upload alternative if supported.

---

# 77. CP-13 — IMAGE VALIDATION

Reject:

- No image
- Unsupported image
- Unreadable image
- Clearly invalid bill image

Messages:

> Please capture or upload your bill.

> We couldn't read this bill clearly. Please take another photo.

> We couldn't identify a bill in this image. Please scan the bill again.

---

# 78. CP-14 — AI BILL PROCESSING

## Purpose

Show that the uploaded bill is being processed.

## Processing

> Reading your bill...

Potential progress states:

```text
Uploading
↓
Reading Bill
↓
Extracting Details
↓
Checking Bill
```

Do not allow financial confirmation while processing is incomplete.

## Extracted Fields

AI attempts to extract:

- Bill ID
- Fish names
- Quantity
- Price
- Line totals
- Total bill amount
- Printed date/time where available
- Other relevant printed data

---

# 79. CP-14 — AI FAILURE

If extraction fails:

> We couldn't extract the bill details.

Action:

> Scan Again

Do not create a successful transaction.

The customer's authenticated session remains intact.

---

# 80. CP-15 — EXTRACTED BILL REVIEW

## Purpose

Allow the customer to verify AI-extracted information before any financial mutation.

## Display

- Original bill image
- Bill ID
- Fish names
- Quantity
- Price
- Line totals
- Total bill
- Subscription coverage
- Subscription Credit used
- Extra quantity
- Extra amount
- Razorpay fee
- GST on Razorpay fee
- Final payable amount

## Important Rule

AI extraction is advisory.

The customer must confirm the extracted bill information before transaction processing.

## Actions

Primary:

> Confirm & Continue

Secondary:

> Scan Again

The current workflow does not provide free manual editing of AI-extracted line items.

---

# 81. CP-15 — BILL ID FALLBACK

If AI cannot read the Bill ID:

> We couldn't read the Bill ID.

> Please enter it manually.

Action:

> Enter Bill ID

Then:

```text
Manual Bill ID
↓
Validate
↓
Duplicate Successful Bill Check
↓
Continue
```

---

# 82. CP-16 — MANUAL BILL ID

## Field

Bill ID

Required.

## Validation

- Required
- Valid configured format
- Duplicate successful transaction check

## Duplicate

> This bill has already been processed successfully.

The system should prevent a second successful transaction for the same Bill ID.

---

# 83. PHYSICAL TRANSACTION CALCULATION

After bill confirmation:

```text
Confirmed Bill
↓
Fish Matching
↓
Subscription Eligibility
↓
Weekly Quantity
↓
Subscription Credit
↓
Subscription Coverage
↓
Extra Quantity/Amount
↓
Razorpay Fee
↓
GST
↓
Final Payable
```

The server calculates the authoritative result.

---

# 84. PHYSICAL TRANSACTION SUBSCRIPTION DISPLAY

Display:

```text
Bill Total                 ₹X
Subscription-covered       X kg
Subscription Credit Used   ₹X
Extra Quantity             X kg
Extra Amount              ₹X
Gateway Fee               ₹X
GST on Fee                ₹X
Final Payable             ₹X
```

If no subscription:

```text
Subscription
Not Applied

Amount Payable
₹X
```

---

# 85. PHYSICAL TRANSACTION PAYMENT

Customer self-service payment method:

**Razorpay only.**

Cash is not shown in the Customer Application.

If final payable amount is zero:

```text
Confirm
↓
Backend Finalization
```

If final payable amount is greater than zero:

```text
Confirm
↓
Razorpay
↓
Payment
↓
Server Verification
↓
Finalization
```

---

# 86. CP-17 — PHYSICAL TRANSACTION PAYMENT REVIEW

## Purpose

Provide final payment summary before opening Razorpay.

Display:

- Bill ID
- Total bill
- Subscription Credit used
- Additional amount
- Gateway fee
- GST
- Final payable amount

Action:

> Pay ₹X

Do not allow payment if the server has returned an invalid/expired calculation.

---

# 87. CP-17 — PAYMENT FAILURE

> Payment was not completed.

> Your transaction has not been finalized.

Actions:

- Retry Payment
- Review Bill

No inventory deduction.

No final subscription mutation.

No successful TV event.

---

# 88. CP-17 — PAYMENT INTERRUPTED

If the payment flow is interrupted:

> Payment status is being verified.

The app must query backend transaction/payment status rather than assuming failure or success.

Possible outcomes:

```text
Verified Successful
Verified Failed
Still Pending
```

---

# 89. CP-18 — TRANSACTION RESULT

## Success

Display:

> Payment Successful

> Transaction Completed

Show:

- Transaction ID
- Bill ID
- Customer
- Fish summary
- Total bill
- Subscription amount/credit used
- Additional payment
- Final paid amount
- Date/time

Actions:

- View Receipt
- View Transaction History
- Return Home

## Important

A successful transaction is finalized by the backend before the app displays final success.

---

# 90. PHYSICAL TRANSACTION SUCCESS SIDE EFFECTS

After backend finalization:

```text
Transaction Successful
↓
Inventory Deducted
↓
Subscription Ledger Updated
↓
Transaction Stored
↓
Bill Image Stored
↓
Successful Event
↓
Shop TV Realtime Update
↓
Customer Receipt/History
```

The customer app does not directly perform these mutations.

---

# 91. CP-18 — TRANSACTION FAILURE

If backend finalization fails:

> We couldn't complete this transaction.

The app must show the authoritative status.

Do not show "Payment Successful" as equivalent to "Transaction Successful" unless backend finalization confirms it.

---

# 92. BILL IMAGE ACCESS

The original bill image is stored with the transaction.

Customer access, where enabled, should use authenticated/signed access.

Never expose public object-storage URLs.

The image should not be publicly enumerable.

---

# 93. CP-19 — LIVE GPS TRACKING

## Purpose

Allow customers to view an active delivery only after Admin has published customer tracking.

## Entry

- Home Live Delivery card
- Notification
- Delivery tracking CTA

## Visibility

Customer tracking is available only when:

- An active journey exists
- Admin has published tracking
- Backend permits the customer to view it

Admin may continue seeing GPS after customer tracking closes.

---

# 94. CP-19 — TRACKING SCREEN

Display:

- Map
- Truck/current location
- Destination/store
- Route where supported
- ETA
- Delivery status
- Last updated time

Avoid exposing:

- Internal driver details
- Private GPS data
- Unpublished journeys

---

# 95. CP-19 — TRACKING STATES

### Not Published

> Live tracking isn't available yet.

### Published

> Fish delivery is on the way.

### Near Destination

Show updated ETA.

### Arrived

> The delivery has arrived.

Customer tracking automatically stops after the configured arrival/waiting condition.

---

# 96. CP-19 — GPS RECONNECTION

If realtime connection drops:

> Live location temporarily unavailable.

Action:

> Reconnect

Display last known location with a clear timestamp if permitted.

Do not represent stale coordinates as live.

---

# 97. CP-19 — TRACKING CLOSED

When customer tracking closes:

> Live tracking has ended.

Supporting text:

> The delivery has reached its destination.

The customer may still receive relevant notification/status updates.

---

# 98. CP-20 — PROFILE

## Purpose

Provide the customer's identity and permitted personal information.

## Display

- Customer name
- Customer ID
- Mobile number
- Age
- Area
- Registration date
- Membership/subscription summary
- Permitted customer statistics

## Editable

Only fields approved by the business.

Mobile number remains protected and is not directly edited.

---

# 99. CP-20 — PROFILE EDIT

Editable fields:

- Full Name where permitted
- Age where permitted
- Area / Locality where permitted

Validation occurs before saving.

## Save

Disable repeated submissions.

Success:

> Profile updated successfully.

Error:

> Unable to save your profile.

Action:

> Try Again

---

# 100. CP-20 — PROFILE STATES

## Loading

Skeleton.

## Error

> Unable to load your profile.

Action:

> Try Again

## Empty

No full empty state is expected for an authenticated customer.

Optional missing values should show:

> Not added

with an action to complete the information where supported.

---

# 101. CP-21 — SETTINGS

## Purpose

Manage application behavior rather than business operations.

## Sections

```text
Application
Notifications
Privacy & Security
Help & Support
Legal
Account
```

---

# 102. CP-21 — APPLICATION SETTINGS

Display:

- App version
- Build version
- About PondFish
- Language

MVP language:

> English

Future language support may include:

- Telugu
- Hindi

Do not expose unfinished language options as selectable unless implemented.

---

# 103. CP-21 — NOTIFICATION SETTINGS

Categories:

- Live Delivery Updates
- Booking Notifications
- Subscription Notifications
- System Announcements

Each has a toggle.

Disabling a category affects future push notifications.

It does not delete existing Notification Center records.

---

# 104. CP-21 — PRIVACY & SECURITY

Display:

- Registered mobile number
- OTP authentication enabled
- Privacy Policy

No password-management UI.

---

# 105. CP-21 — HELP & SUPPORT

Actions:

- Contact Support
- Call Store
- Email Support
- FAQ

Use supported device actions where appropriate.

---

# 106. CP-21 — LEGAL

Display:

- Privacy Policy
- Terms & Conditions
- Refund Policy where applicable

Legal content is read-only from the customer application.

---

# 107. CP-21 — ACCOUNT ACTIONS

Primary:

> Log Out

Optional future:

> Request Account Deletion

For MVP, account deletion requests are handled by the business rather than immediate self-service deletion.

---

# 108. CP-21 — LOGOUT CONFIRMATION

Dialog:

> Log out of PondFish?

Actions:

- Cancel
- Log Out

After successful logout:

```text
Clear Session
↓
Unsubscribe Customer Realtime Channels
↓
Clear Sensitive Local State
↓
Authentication
```

---

# 109. GLOBAL ERROR SCREENS

# 109.1 404 / ROUTE NOT FOUND

Native apps should normally avoid a traditional browser 404.

If an unknown deep link is opened:

> This page isn't available.

Actions:

- Go Home

---

# 109.2 SERVER ERROR

> Something went wrong.

Actions:

- Try Again
- Go Home

Do not expose stack traces.

---

# 109.3 NETWORK ERROR

> We couldn't connect to PondFish.

Actions:

- Try Again

Where safe, preserve the last valid screen.

---

# 109.4 OFFLINE MODE

Display:

> You're offline.

Supporting text:

> Check your internet connection and try again.

Dynamic inventory, payment and booking data must not be presented as current while offline.

Cached non-sensitive content may remain visible if the implementation supports it.

---

# 109.5 SESSION EXPIRED

> Your session has expired.

Action:

> Sign In

---

# 109.6 UNAUTHORIZED

> You don't have permission to view this information.

Action:

> Go Home

---

# 109.7 MAINTENANCE

> PondFish is temporarily unavailable.

Supporting text:

> Please try again shortly.

Action:

> Try Again

---

# 110. PAYMENT GLOBAL STATES

All customer payment screens must support:

```text
Preparing
Opening Razorpay
Payment Processing
Payment Successful
Payment Failed
Payment Cancelled
Payment Pending
Verification
Verification Failed
Transaction Finalized
```

The app must distinguish:

**Gateway payment success** from **business transaction finalization success**.

---

# 111. PAYMENT PENDING

If payment result is uncertain:

> We're verifying your payment.

Do not immediately tell the customer to pay again.

Backend status must be checked first to avoid duplicate payments.

---

# 112. DUPLICATE PAYMENT PROTECTION

If the customer retries after an uncertain state:

- Check existing payment/transaction status
- Do not create a duplicate successful transaction
- Show existing successful transaction if already finalized

---

# 113. INVENTORY CHANGE DURING BOOKING

If stock changes during checkout:

> The selected quantity is no longer available. Please review your booking.

The app should:

- Refresh inventory
- Update cart/booking
- Preserve unaffected selections where safe

---

# 114. BOOKING CANCELLATION UX

## Entry

From:

- Booking Detail
- Active Booking

## Confirmation

Display:

- Booking ID
- Fish
- Quantity
- Current status
- Cancellation consequence

Action:

> Cancel Booking

Secondary:

> Keep Booking

## Success

> Booking cancelled successfully.

## Failure

> We couldn't cancel this booking.

Action:

> Try Again

Do not show the booking as cancelled until backend confirmation succeeds.

---

# 115. BOOKING EXPIRY UX

The booking detail should show:

- Created time
- Expiry time
- Remaining validity where useful

Near expiry:

> Booking expires soon.

After expiry:

> Booking expired.

The expiry itself is backend controlled.

The mobile app does not expire bookings by local timer.

---

# 116. CART + INVENTORY SAFETY

The cart is not a reservation.

Until successful booking finalization:

- Stock remains available to other customers
- Quantity must be revalidated
- Price must be revalidated
- Online-booking eligibility must be revalidated

Reservation begins only after successful booking creation.

---

# 117. CUSTOMER ONLINE BOOKING MASTER FLOW

```text
Fish Marketplace
        ↓
Fish Details
        ↓
Add to Cart
        ↓
Cart
        ↓
Revalidate Availability
        ↓
Select Quantity
        ↓
Subscription Calculation
        ↓
Payment Calculation
        ↓
Checkout Confirmation
        ↓
Razorpay if Required
        ↓
Backend Payment Verification
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
Worker Scans QR
        ↓
Worker Completes
        ↓
Customer Receives Completion Notification
        ↓
Booking History Updated
```

---

# 118. CUSTOMER PHYSICAL PURCHASE MASTER FLOW

```text
Physical Fish Purchase
        ↓
Printed Bill
        ↓
Scan Bill
        ↓
Bill Image
        ↓
AI Extraction
        ↓
Customer Review
        ↓
Bill ID Validation
        ↓
Duplicate Check
        ↓
Subscription Calculation
        ↓
Remaining Amount
        ↓
Razorpay Fee + GST
        ↓
Razorpay Payment
        ↓
Server Verification
        ↓
Atomic Transaction Finalization
        ↓
Inventory Deduction
        ↓
Subscription Ledger
        ↓
Transaction Stored
        ↓
Bill Image Stored
        ↓
Successful Event
        ↓
Shop TV
        ↓
Customer Receipt / History
```

---

# 119. CUSTOMER SUBSCRIPTION MASTER FLOW

```text
Subscription Screen
        ↓
Select Plan
        ↓
Review Plan
        ↓
Razorpay
        ↓
Payment Verification
        ↓
Subscription Activated/Updated
        ↓
Subscription Credit Added
        ↓
Weekly Allowance Initialized
        ↓
Subscription History
        ↓
Customer Notification
```

---

# 120. CUSTOMER GPS MASTER FLOW

```text
Admin Creates/Publishes Journey
        ↓
OneLap GPS
        ↓
Admin Live Tracking
        ↓
Customer Tracking Published
        ↓
Customer Opens Tracking
        ↓
Realtime Location
        ↓
Arrival Detection
        ↓
Customer Tracking Closes
        ↓
Customer Notification
```

---

# 121. CUSTOMER NOTIFICATION MASTER FLOW

```text
Business Event
        ↓
Backend Notification Engine
        ↓
Notification Saved
        ↓
FCM Push
        ↓
Customer Device
        ↓
Notification Center
        ↓
Optional Deep Link
```

---

# 122. ACCESSIBILITY

The React Native application must support:

- Screen-reader labels
- Accessible buttons
- Accessible form fields
- Sufficient contrast
- Dynamic text considerations
- Visible focus/selection states where applicable
- Non-color-only status communication
- Large touch targets
- Meaningful image descriptions
- Accessible loading/error messages

QR codes must have a text alternative containing the booking reference.

Maps must not be the only way to understand delivery status.

---

# 123. CAMERA ACCESSIBILITY

For bill scanning:

- Explain camera purpose
- Provide upload fallback where supported
- Provide retry
- Show image preview
- Allow retake

Do not trap the user in the camera flow.

---

# 124. NOTIFICATION PERMISSIONS

Request notification permission contextually rather than immediately on first launch unless required.

Explain:

> Get updates about bookings, subscriptions and live fish deliveries.

If denied, the application continues to work.

---

# 125. LOCATION PERMISSIONS

Customer live tracking may require location services depending on the map implementation.

If customer location is not required for the current tracking design, do not request it unnecessarily.

Do not request background location unless explicitly required and approved.

---

# 126. IMAGE UPLOAD RULES

Bill images:

- Validate file type
- Validate size
- Compress where safe
- Preserve readability
- Show upload progress
- Allow retry
- Do not expose public URLs

---

# 127. LOCAL DATA / CACHE RULES

Safe local data may include:

- Non-sensitive catalogue cache
- UI preferences
- Last selected filters
- Non-sensitive app configuration

Sensitive data should use secure storage or remain server-side.

Do not persist:

- OTP
- Payment secrets
- Raw gateway credentials
- Private bill URLs
- Sensitive tokens in insecure storage

---

# 128. REALTIME RULES

Realtime is required for:

- Customer GPS tracking
- Relevant live notifications
- Other approved live customer updates

Realtime subscriptions must be:

- Scoped to the authenticated customer
- Closed on logout
- Reconnected safely
- Validated after reconnection

Do not treat realtime events as the authoritative financial source.

---

# 129. OFFLINE / RECONNECT BEHAVIOR

## Catalogue

May show safe cached data with a stale indicator.

## Booking

Cannot finalize offline.

## Payment

Cannot initiate or finalize offline.

## Bill Scan

Image capture may be possible, but transaction processing requires connectivity.

## GPS

Show last known position with timestamp if appropriate.

## Notifications

Previously stored notifications remain visible.

---

# 130. SECURITY REQUIREMENTS

The app must:

- Use secure authentication
- Use secure token/session storage
- Use HTTPS
- Never trust client-side prices
- Never trust client-side inventory
- Never trust client-side subscription balances
- Never trust payment callbacks alone
- Validate backend ownership for bookings/transactions
- Prevent access to another customer's data
- Avoid logging sensitive payment/bill data
- Use signed/authenticated bill image access
- Never expose customer data inside QR payloads

---

# 131. DATA OWNERSHIP

The customer app reads and submits data through APIs.

Authoritative systems:

```text
Fish → Inventory/Fish Module
Price → Backend
Subscription → Subscription Engine
Payment → Razorpay + Backend Verification
Booking → Booking Engine
Transaction → Transaction Engine
GPS → GPS/Delivery Engine
Notifications → Notification Engine
Profile → Customer Management
```

The mobile app is not the source of truth.

---

# 132. ERROR MESSAGE PRINCIPLES

Errors must be:

- Human-readable
- Specific
- Actionable
- Short
- Non-technical
- Consistent

Avoid:

> HTTP 500

Prefer:

> Something went wrong. Please try again.

For actionable business errors, explain the reason.

---

# 133. SUCCESS MESSAGE PRINCIPLES

Success should confirm the actual backend state.

Examples:

> Booking created successfully.

> Payment verified successfully.

> Subscription updated successfully.

> Transaction completed successfully.

Avoid showing success before backend confirmation.

---

# 134. FORM SUBMISSION RULES

Every important submission must:

1. Validate locally where possible.
2. Send to backend.
3. Show loading.
4. Prevent duplicate submission.
5. Handle success.
6. Handle validation error.
7. Handle business error.
8. Handle network error.
9. Allow retry.

---

# 135. DESTRUCTIVE ACTIONS

Actions requiring confirmation:

- Cancel booking
- Logout where appropriate
- Account deletion request if later enabled

Use a confirmation dialog/bottom sheet.

Do not use destructive confirmation for routine navigation.

---

# 136. CUSTOMER APP PAGE INVENTORY

```text
CP-01A Splash
CP-01B Welcome / Access
CP-01C Mobile Number
CP-01D OTP Verification
CP-01E Profile Completion

CP-02 Home Dashboard

CP-03 Fish Marketplace
CP-03A Category View
CP-03B Search Results

CP-04 Fish Details

CP-05 Cart

CP-06 Online Booking Preparation
CP-06A Subscription Calculation
CP-06B Checkout Summary

CP-07 Booking Confirmation / QR Ticket

CP-08 Booking Details
CP-08A Cancellation Confirmation
CP-08B Expired Booking
CP-08C Cancelled Booking

CP-09 Subscription Management
CP-09A Plan Selection
CP-09B Subscription Payment
CP-09C Subscription History
CP-09D Subscription Detail

CP-10 Notification Center
CP-10A Notification Detail

CP-11 Booking History
CP-11A Booking Detail

CP-12 Transaction History
CP-12A Transaction Detail / Receipt

CP-13 Scan Bill
CP-14 AI Bill Processing
CP-15 Extracted Bill Confirmation
CP-16 Manual Bill ID
CP-17 Physical Transaction Payment
CP-18 Transaction Result

CP-19 Live GPS Tracking

CP-20 Customer Profile
CP-20A Edit Profile

CP-21 Settings

Global:
404 / Deep Link Not Found
Server Error
Network Error
Offline
Session Expired
Unauthorized
Maintenance
Permission Denied
Payment Pending
```

---

# 137. SCREEN IMPLEMENTATION STANDARD

Every screen implementation must document and implement:

## Identity

- Screen ID
- Screen name
- Feature/module

## Access

- Authentication requirement
- Role
- Permission

## Navigation

- Entry points
- Exit points
- Back behavior
- Deep links

## UI

- Header
- Sections
- Components
- Fields
- Actions
- Responsive/native behavior

## Data

- Required API data
- Display fields
- Backend ownership

## State

- Initial
- Loading
- Success
- Empty
- Validation error
- Business error
- Network error
- Permission error
- Retry

## Workflow

- Trigger
- Processing
- Backend interaction
- Result

## Security

- Sensitive data
- Ownership
- Session requirements

## Acceptance

- Functional criteria
- UI criteria
- Error criteria

---

# 138. MOBILE BUILD DEFINITION OF DONE

A customer screen is not complete until:

- Approved design system is used
- Native React Native layout is implemented
- Android behavior is tested
- iOS-compatible architecture is preserved
- Navigation works
- Back behavior works
- Loading works
- Empty works
- Error works
- Retry works
- Offline behavior works where relevant
- API integration works
- Backend validation is respected
- Duplicate submission protection exists
- Accessibility is considered
- Permissions are handled
- Security requirements are satisfied
- Acceptance criteria pass

---

# 139. CUSTOMER APPLICATION ACCEPTANCE CHECKLIST

## Authentication

- [ ] Mobile number login
- [ ] OTP verification
- [ ] Resend countdown
- [ ] Invalid OTP
- [ ] Expired OTP
- [ ] Attempt limit
- [ ] Profile completion
- [ ] Session persistence
- [ ] Session expiry
- [ ] Logout

## Fish

- [ ] Catalogue
- [ ] Categories
- [ ] Search
- [ ] Availability
- [ ] Online-booking eligibility
- [ ] Fish details
- [ ] Freshness

## Cart / Booking

- [ ] Only online-bookable fish
- [ ] Quantity validation
- [ ] Cart revalidation
- [ ] Subscription calculation
- [ ] Subscription Credit calculation
- [ ] Additional amount
- [ ] Razorpay fee
- [ ] GST
- [ ] Payment
- [ ] Booking creation
- [ ] Inventory reservation
- [ ] QR ticket
- [ ] 48-hour expiry
- [ ] Cancellation
- [ ] Restoration state
- [ ] Completion notification

## Subscription

- [ ] Current plan
- [ ] Subscription Credit
- [ ] Weekly allowance
- [ ] Usage
- [ ] Manual renewal
- [ ] Purchase
- [ ] Razorpay verification
- [ ] History
- [ ] Existing credit preserved

## Physical Purchase

- [ ] Camera
- [ ] Image upload
- [ ] AI extraction
- [ ] Review
- [ ] Manual Bill ID
- [ ] Duplicate Bill ID
- [ ] Subscription calculation
- [ ] Razorpay fee
- [ ] GST
- [ ] Payment
- [ ] Verification
- [ ] Transaction finalization
- [ ] Receipt
- [ ] Transaction history
- [ ] TV event

## GPS

- [ ] Published journey visibility
- [ ] Live location
- [ ] ETA
- [ ] Reconnection
- [ ] Arrival
- [ ] Tracking closure

## Notifications

- [ ] Push
- [ ] In-app history
- [ ] Categories
- [ ] Read/unread
- [ ] Deep links
- [ ] Permission handling

## Profile

- [ ] Profile view
- [ ] Editable fields
- [ ] Validation
- [ ] Save
- [ ] Error handling

## Settings

- [ ] Notification preferences
- [ ] Privacy
- [ ] Support
- [ ] Legal
- [ ] App information
- [ ] Logout

## Reliability

- [ ] Offline
- [ ] Network error
- [ ] API error
- [ ] Payment pending
- [ ] Session expired
- [ ] Retry
- [ ] Duplicate submission protection

---

# 140. CROSS-PORTAL CUSTOMER CONSISTENCY

The customer application must remain consistent with:

- Public Website
- Worker Portal
- Admin Portal
- Shop Transaction TV

Examples:

### Fish

Public Website and Customer App may show the same catalogue, but online booking eligibility is separately controlled.

### Booking

Customer creates booking.

Worker retrieves/completes booking.

Admin observes/manages approved operational state.

### Physical Transaction

Customer scans bill.

Backend finalizes transaction.

Shop TV displays successful transaction.

Admin records the transaction.

### Subscription

Customer sees balance.

Backend calculates usage.

Admin may perform approved operational adjustments.

### GPS

Admin publishes tracking.

Customer views published tracking.

Admin retains operational visibility.

---

# 141. IMPLEMENTATION PRIORITY

Recommended implementation order:

```text
1. Authentication
2. Navigation / App Shell
3. Home
4. Fish Marketplace
5. Fish Details
6. Cart
7. Online Booking
8. Checkout / Razorpay
9. QR Ticket
10. Booking Details / History
11. Subscription
12. Scan Bill
13. AI Bill Review
14. Physical Transaction Payment
15. Transaction History
16. Notifications
17. GPS Tracking
18. Profile
19. Settings
20. Global Error/Offline States
```

This order follows dependency flow rather than visual page count.

---

# 142. AI CODING AGENT RULES

When an AI coding agent implements this application:

1. Read the Master PRD first.
2. Read the architecture specification.
3. Read the API contract before implementing API calls.
4. Read this customer UI specification.
5. Read the Design System.
6. Never invent business rules.
7. Never calculate authoritative subscription balances locally.
8. Never calculate authoritative inventory locally.
9. Never trust frontend payment success.
10. Never create a booking before backend confirmation.
11. Never expose private bill storage.
12. Never allow customer access to another customer's records.
13. Preserve all defined loading/error/empty states.
14. Preserve mobile navigation behavior.
15. Reuse shared components.
16. Avoid duplicate business logic.
17. Add tests for critical flows.
18. Do not silently change locked workflows.

---

# 143. FINAL CUSTOMER JOURNEY

```text
INSTALL / OPEN APP
        ↓
OTP AUTHENTICATION
        ↓
PROFILE SETUP IF REQUIRED
        ↓
HOME
   ┌────┼──────────────┬─────────────┐
   ↓    ↓              ↓             ↓
 FISH  BOOKING       SCAN BILL    SUBSCRIPTION
   ↓    ↓              ↓             ↓
DETAILS CART          AI REVIEW     PURCHASE
   ↓    ↓              ↓             ↓
BOOK   CHECKOUT       BILL ID       RAZORPAY
   ↓    ↓              ↓             ↓
       RAZORPAY       PAYMENT       CREDIT
   ↓    ↓              ↓             ↓
BOOKING CREATED      TRANSACTION    HISTORY
   ↓                  ↓
QR TICKET             RECEIPT
   ↓
STORE COLLECTION
   ↓
WORKER SCANS
   ↓
ORDER COMPLETED
   ↓
CUSTOMER NOTIFICATION
   ↓
BOOKING HISTORY
```

---

# 144. SOURCE-OF-TRUTH RULE

When implementation conflicts appear, use this order:

```text
Backend/API Contract
        ↓
Master PRD
        ↓
Business Workflow Specification
        ↓
Application Architecture
        ↓
Design System
        ↓
This Page-by-Page UI Specification
        ↓
Implementation
```

The customer UI must not override backend authority.

If a new customer requirement is introduced during implementation, update the appropriate source document first rather than silently adding a different rule in the React Native code.

---

# 145. NEXT ARTIFACT

After completing this Customer React Native Page-by-Page UI Specification, continue with:

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

The polished mobile designs should be created after the PRD/page specification is locked and before final implementation.
