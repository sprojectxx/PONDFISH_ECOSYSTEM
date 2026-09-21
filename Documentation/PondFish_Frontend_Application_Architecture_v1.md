# PONDFISH --- FRONTEND & APPLICATION ARCHITECTURE SPECIFICATION

**Version:** 1.0\
**Status:** Implementation Baseline\
**Purpose:** Define the frontend/application architecture for all
PondFish application surfaces.

# 1. Purpose

Define the frontend architecture for the PondFish Public Website,
Customer React Native App, Worker Portal, Admin Portal and Transaction
TV Portal. This document converts the locked PRD and backend/API
specification into implementation structure.

# 2. Application Landscape

Five surfaces share one backend: Public Website, Customer Mobile App,
Worker Web/Tablet Portal, Admin Web Portal, and read-only Transaction TV
Portal.

# 3. Technology Direction

Public Website: Next.js/React/TypeScript/Tailwind. Customer: React
Native/TypeScript. Worker: React/TypeScript/Tailwind, tablet-first.
Admin: React or Next.js/TypeScript/Tailwind. TV:
React/Next.js/TypeScript fullscreen display.

# 4. Core Principle

Frontend handles presentation, input, navigation, UX validation, API
communication and realtime presentation. Backend remains authoritative
for inventory, price, subscription eligibility, payments, bookings,
transactions, freshness and GPS.

# 5. Shared Layers

Presentation → feature modules → state → API/service layer → backend.
Shared utilities include types, constants, validation, permissions,
error mapping, money/date utilities and network utilities.

# 6. Global UI States

Every operation supports Initial, Loading, Success, Empty, Validation
Error, Business Error, Network Error, Permission Error and Retry states.

# 7. API Client

Centralize base URL, authentication, token refresh, request IDs,
timeouts, file uploads, response parsing and backend error mapping. UI
components must not construct arbitrary HTTP requests.

# 8. Authentication

Customer uses mobile number + OTP, no password. Worker and Admin use
email/password. TV uses restricted display authentication. Route guards
must enforce role boundaries.

# 9. Public Website Pages

Home, Fish/Categories, Fish Details, Discounts, About, Contact,
Login/App Entry and online-booking entry. Catalogue and discount data
come from public APIs.

# 10. Public Catalogue

Show category, fish, image, price, discount, physical availability and
online-booking availability. A fish being available in store does not
automatically mean it is online-bookable.

# 11. Public Website States

Catalogue and discount pages require loading skeletons, successful
content, meaningful empty states, errors and retry. Backend timestamps
control discount status.

# 12. Customer Navigation

Recommended primary navigation: Home, Browse, Bookings, Transactions and
Profile. Subscription and Scan Bill should be prominent from
Home/profile.

# 13. Customer Auth Screens

Splash → mobile number → OTP → profile setup when required →
authenticated home. Support resend, countdown, invalid/expired OTP,
attempt limits and network errors.

# 14. Customer Home

Direct access to Browse Fish, Online Booking, Scan Bill, Subscription,
active GPS tracking, Discounts, Recent Transaction and Bookings.

# 15. Customer Browse

Category → fish list → fish detail → add to cart only when
online-bookable. Show physical availability separately from online
booking eligibility.

# 16. Customer Cart

Contains only online-bookable fish. Show fish, quantity, price, discount
and totals. Checkout must revalidate inventory, price, quantity and
booking eligibility.

# 17. Customer Checkout

Show items, quantities, prices, discounts, subscription coverage and
payable amount. Backend calculation is authoritative.

# 18. Customer Booking

After successful booking show Booking ID, items, quantities, amount,
subscription amount, payment amount, status and collection information.

# 19. Customer Booking Management

Booking list supports upcoming, completed, cancelled and expired.
Details show booking ID, date, fish, quantity, amount, payment and
status.

# 20. Customer Cancellation

Explain restoration of inventory, subscription quantity and subscription
credit, including applicable Razorpay-paid amount restoration. No
cancellation fee.

# 21. Customer Scan Bill

Home → Scan Bill → camera/image picker → preview → upload → AI
processing → extracted review. Bill image is stored with the
transaction.

# 22. Bill Scan Review

Show bill number, fish, quantity, unit price, line total and total bill.
Warn about low confidence, missing bill ID, unknown fish or unclear
quantity.

# 23. Manual Bill ID

If AI cannot read the Bill ID, require manual entry before processing.
User must confirm the entered ID.

# 24. Transaction Preview

Show original bill amount, fish quantities, subscription-covered
quantity/value, subscription credit used, extra quantity/value,
applicable Razorpay charges and 18% GST on gateway charges, and final
payable amount.

# 25. Customer Payment

Customer uses Razorpay for remaining amount. The app waits for backend
verification; returning from the payment SDK is not itself success.

# 26. Customer Success/Failure

Success shows transaction ID, customer, fish, quantity, bill number,
total, subscription usage, extra amount, payment method and time.
Failure provides retry/cancel and never shows a successful transaction
until verified.

# 27. Customer Transactions

List latest-first with transaction ID, date/time, amount and status.
Details show bill, fish, quantity, subscription amount, extra amount,
payment method and transaction ID.

# 28. Customer Subscription

Show plan, status, credit balance, weekly quantity limit/used/remaining,
expiry and eligible fish. Keep quantity and monetary credit visually
distinct.

# 29. Customer GPS

When Admin publishes a journey, show map, current location, ETA, journey
status and destination. After the customer publication window ends, show
that tracking has ended while Admin tracking may continue.

# 30. Customer Notifications/Profile

Notification center covers bookings, payments, subscriptions, discounts
and GPS. Profile shows name, mobile, age and area plus logout/settings.

# 31. Worker Architecture

Worker portal is tablet-first and operational. Main sections: Dashboard,
Bookings, Bill Processing, Transactions and Customers.

# 32. Worker Dashboard

Show today's bookings, pending/completed counts, recent successful
transactions and operational alerts.

# 33. Worker Bookings

Today's bookings with search by booking ID, customer name, phone and
total payment amount; filter by status/time. Online bookings have Mark
Complete.

# 34. Worker Customer Lookup

For customers without a phone, search and select customer, then
scan/upload the bill. Expose only necessary operational customer
information.

# 35. Worker Bill Processing

Select customer → scan bill → AI extraction → review → subscription
calculation → choose Razorpay or permitted Cash → confirm → successful
transaction.

# 36. Worker Bill Review

Show bill number, fish, quantity, prices, total, subscription
quantity/value, extra quantity/value and final payable. Worker confirms
before processing.

# 37. Worker Cash

Cash is available only in Worker Portal when permitted. Record amount,
worker identity, transaction ID and timestamp.

# 38. Worker Razorpay

Create payment → Razorpay → server verification → success. Prevent
duplicate submissions.

# 39. Worker Transactions

Operational history supports date, customer, transaction ID, payment
method and status.

# 40. Admin Architecture

Admin sections: Dashboard, Customers, Workers, Fish, Categories,
Inventory, Freshness, Discounts, Subscriptions, Bookings, Transactions,
GPS, Notifications, Settings and Audit Logs.

# 41. Admin Dashboard

Show today's sales, successful/failed transactions, bookings,
inventory/freshness alerts, discounts, subscription activity and GPS
journeys.

# 42. Admin Customers/Workers

Customer management supports search, profile, subscriptions,
transactions, bookings and subscription assignment. Worker management
supports creation, activation/deactivation, credential reset and
activity. Never display worker passwords.

# 43. Admin Fish/Categories

Manage fish, prices, categories, images, online-booking eligibility,
activation and freshness configuration. Category changes must preserve
existing fish references.

# 44. Admin Inventory

Show physical, reserved and available quantities, freshness and batch
information. Manual adjustments require quantity, reason and admin
identity and create ledger entries.

# 45. Admin Freshness

Configure green, grey and red duration per fish. System calculates
status automatically. Expired/red fish are removed from online
availability and Admin is notified; Admin decides physical sale, removal
or disposal.

# 46. Admin Discounts

Create scheduled/flash campaigns with fish/category, discount, start and
end times. Backend is authoritative for active status.

# 47. Admin Subscriptions

Manage plans, customer subscriptions, assignments, credit and ledger.
Admin can assign ₹2,000/₹6,000 plans using Cash or Razorpay and
additions join existing credit balance.

# 48. Admin Bookings CP-12

Show both online bookings and physical-store bookings with filters for
date, customer, booking status, booking type and payment status.

# 49. Admin Transactions CP-11

Show successful, failed, pending and cancelled transaction logs with
filters for date, customer, worker, transaction type, payment method and
status.

# 50. Admin GPS

Create journey by selecting fish, quantity and origin; destination is
the store. Publish live tracking after all journey details are ready.
Admin continues seeing GPS after customer publication ends.

# 51. GPS Customer Publication

Customer receives live location/ETA after Admin publishes. On arrival, a
configured waiting period (currently around 30 minutes to 1 hour
operationally) is used before customer publication automatically stops.
Admin tracking remains active.

# 52. TV Architecture

TV is a read-only display application. It has no admin functions and no
operational transaction controls.

# 53. TV Content

Show only successful transactions: Customer Name, Transaction ID, Fish
Name and Quantity, Bill Number, Time and Paid Amount.

# 54. TV Realtime

Successful transaction → backend event → realtime channel → TV receives
event → immediate display → notification sound. No manual refresh.

# 55. TV Sound/Deduplication

Play a short sound once for each new successful transaction.
Reconnects/reloads must not replay an already processed transaction.
Maintain event/transaction deduplication state.

# 56. TV Business Day

Display successful transactions for the current business day. Each new
business day has a new visible transaction session; database history
remains stored.

# 57. Loading/Empty/Error

Use skeletons for content loading, spinners for small actions, progress
indicators for AI/payment, actionable empty states, and retryable
errors. Never expose internal stack traces.

# 58. Forms/Validation

Validate on the client for UX and again on the backend. Critical actions
require backend confirmation. Destructive actions use confirmation
dialogs.

# 59. Network/Reconnection

Show connection state and retry. Preserve safe form data where possible.
Financial actions use idempotency. Realtime clients reconnect,
resubscribe and synchronize/deduplicate missed events.

# 60. Camera/File Upload

Customer/Worker bill scanning handles camera permissions, gallery
selection, preview, upload progress and invalid/large/poor-quality
images. Private bill images are not public.

# 61. Payment UI Protection

Disable duplicate submit, show payment progress, handle app return and
query backend state. Never infer payment success from client navigation
alone.

# 62. Responsive Design

Public Website: mobile/tablet/desktop. Worker: tablet-first and
desktop-compatible. Admin: desktop-first and tablet-compatible. TV:
fullscreen large-screen. Customer: native mobile.

# 63. Route Structure

Customer: /customer/home, /browse, /fish/:id, /cart, /checkout,
/scan-bill, /scan-bill/review, /payment, /transaction/:id, /bookings,
/bookings/:id, /subscription, /transactions, /gps/:journeyId, /profile,
/notifications. Worker: /worker/dashboard, /bookings, /bookings/:id,
/customers, /customers/:id, /bill-scan, /bill-scan/review,
/transactions, /transactions/:id. Admin: /admin/dashboard, /customers,
/customers/:id, /workers, /fish, /fish/:id, /categories, /inventory,
/inventory/:id, /freshness, /discounts, /subscriptions, /bookings,
/transactions, /gps, /notifications, /settings, /audit-logs. TV:
/tv/display and protected /tv/setup.

# 64. Component Architecture

Shared UI: buttons, inputs, cards, tables, badges, modals, toasts,
skeletons, navigation and status indicators. Feature components live
inside feature modules.

# 65. Feature Modules

Recommended modules: auth, fish, cart, subscriptions, bookings,
bill-scan, transactions, payments, inventory, freshness, discounts, GPS
and notifications. Each application uses only relevant modules.

# 66. State Management

Separate server state, UI state, session state, form state and realtime
state. Use query/cache management for server data; keep simple UI state
local rather than putting everything in a global store.

# 67. Caching

Cache stable categories, fish catalogue and plans. Invalidate dynamic
inventory, bookings, transactions, subscription balances and discounts
after mutations.

# 68. Optimistic Updates

Avoid optimistic updates for payment, transaction, inventory deduction,
subscription deduction and booking confirmation. Backend state must be
authoritative.

# 69. Permissions

UI may hide or disable unauthorized actions, but backend authorization
remains mandatory. Customer, Worker, Admin and TV must have separate
route and API permissions.

# 70. Shared Types

Use shared/generated API types where practical: Fish, Category,
Customer, Subscription, Booking, BookingItem, Bill, BillItem,
Transaction, TransactionItem, Payment, Inventory, Discount, GPSJourney
and Notification.

# 71. API Contract

Use OpenAPI or equivalent contract generation/validation to reduce
frontend/backend drift. Every feature should implement against the
locked API specification.

# 72. Design-to-Code

PRD → frontend architecture → design system → screen requirements →
Stitch UI → human design review → polished design specification → code.
Stitch is a design starting point, not a source of business logic.

# 73. AI Coding Workflow

Architecture → API contract → design → feature prompt → AI coding agent
→ implementation → tests → review. AI tools must not invent new
workflows.

# 74. Folder Structure --- Customer

src/app or navigation, screens, features/auth, home, fish, cart,
bookings, scan-bill, payments, subscriptions, transactions, gps,
profile, notifications, components, services, store, hooks, utils, types
and assets.

# 75. Folder Structure --- Worker

src/routes, pages, features/dashboard, bookings, customers, bill-scan,
transactions, components, services, hooks, store, utils and types.

# 76. Folder Structure --- Admin

src/routes, pages, features/dashboard, customers, workers, fish,
categories, inventory, freshness, discounts, subscriptions, bookings,
transactions, gps, notifications, settings and audit, plus
components/services/hooks/store/utils/types.

# 77. Folder Structure --- TV

src/display, components, realtime, services, hooks, store, utils and
types. Keep the application intentionally small.

# 78. Folder Structure --- Public

src/app or pages, features/home, fish, categories, discounts,
booking-entry, about and contact, plus components, services, hooks,
types and utils.

# 79. Accessibility

Use readable contrast, visible focus, keyboard navigation for web,
accessible labels, adequate touch targets and screen-reader support. TV
follows large-screen readability requirements.

# 80. Security

Use HTTPS, secure token storage, RBAC, object-level authorization, rate
limits, input/file validation and no secrets in client bundles. TV
receives only its display payload.

# 81. Environment

Development, staging and production must be separated. Client variables
contain only public configuration. Razorpay private secrets, OneLap
secrets, AI credentials and database credentials remain server-side.

# 82. Testing

Unit, component, integration and E2E testing. Critical E2E flows: OTP
login, online booking, cancellation, bill scan, manual Bill ID,
subscription calculation, Razorpay, worker cash, duplicate bill, TV
realtime, GPS, freshness, discounts and admin subscription assignment.

# 83. Definition of Done --- Screen

Design implemented, API integrated, loading/empty/error/success handled,
validation and permissions handled, responsive/accessibility checks
complete.

# 84. Definition of Done --- Workflow

Happy path, validation, failure, retry, duplicate action, backend state,
realtime effects and audit/log effects must all work.

# 85. Definition of Done --- Payment

Order creation, provider payment, server verification, webhook,
duplicate-event handling, transaction finalization,
inventory/subscription updates, receipt and TV event must work.

# 86. Definition of Done --- Bill

Capture, store, AI extraction, confidence handling, manual Bill ID, fish
matching, subscription calculation, fees/tax, review, payment, duplicate
protection and receipt must work.

# 87. Definition of Done --- Booking

Eligibility, cart, checkout, inventory reservation, payment, creation,
worker visibility, collection, completion, cancellation, restoration and
expiry must work.

# 88. Definition of Done --- GPS

Journey creation, fish/quantity, origin/destination, provider
integration, admin publish, customer visibility, realtime updates, ETA,
arrival detection, waiting period, customer publication stop and
continuing Admin tracking must work.

# 89. Definition of Done --- TV

Authentication, business-day load, realtime connection, successful
transaction display, sound, deduplication, reconnect and data
restrictions must work.

# 90. Final Acceptance

Architecture is ready when the five applications, route boundaries,
authentication, APIs, loading/error/success states, bill scan,
subscription, booking, payment, inventory, freshness, discount, CP-11,
CP-12, GPS, TV realtime/sound, folder structure, testing and security
boundaries are explicitly defined.

# 91. Next Artifact

The next major document should be PONDFISH --- Design System & UI/UX
Specification. It should define polished visual language and
screen-level specifications for all five applications, using the
existing designs as the starting point rather than creating a
disconnected visual system.
