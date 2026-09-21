# PONDFISH — PAGE-BY-PAGE UI SPECIFICATION
## Public Website
**Document Type:** Implementation UI Specification  
**Status:** Detailed Build Reference  
**Platform:** Responsive Web Application  
**Related Applications:** Customer React Native App, Worker Portal, Admin Portal, Store Transaction TV  
**Source of Truth:** PondFish Master PRD + locked system architecture + approved Design System

---

# 1. DOCUMENT PURPOSE

This document translates the locked PondFish product requirements and approved UI/UX system into buildable page-level specifications for the **Public Website**.

It is intended to support:

- Stitch UI generation
- Human UI review and polishing
- AI-assisted frontend implementation
- Frontend/backend integration
- QA and acceptance testing

This document does **not** redefine PondFish business rules. Business rules remain authoritative in the Master PRD and backend. The purpose here is to define how those rules appear, behave and communicate on the public website.

The Public Website is a responsive web application for public visitors. It exposes fish discovery, categories, store availability, freshness, active discounts, subscription plans, offers, business information and contact information. Availability and discounts are dynamically controlled by Admin/backend data.

---

# 2. APPLICATION SCOPE

## 2.1 Platform

The Public Website must support:

- Mobile
- Tablet
- Desktop
- Modern evergreen browsers
- Touch and mouse interaction
- Keyboard navigation where applicable

The public website is **not** the customer application.

Customer-only actions such as OTP authentication, subscription purchase, online checkout, bill scanning, transaction history and GPS tracking belong to the Customer React Native application.

## 2.2 Public Website Route Inventory

The frontend architecture defines the public feature areas as:

- Home
- Fish
- Categories
- Discounts
- Booking Entry
- About
- Contact

The page specification expands these into concrete screens and system states.

Recommended route structure:

```text
/
 /fish
 /fish/:id
 /categories
 /categories/:id
 /discounts
 /booking
 /about
 /contact
```

System routes:

```text
/404
/500
/maintenance
/offline
/network-error
```

---

# 3. GLOBAL PUBLIC WEBSITE RULES

## 3.1 Header

The public header must provide:

- PondFish brand/logo
- Primary navigation
- Fish/Catalogue access
- Categories access
- Discounts/Offers access
- About access
- Contact access
- Customer-app/booking entry action where applicable

The header must remain visually stable across all public pages.

Mobile behavior:

- Collapse navigation into a mobile menu
- Preserve primary booking/catalogue access
- Keep logo visible
- Avoid overcrowding

## 3.2 Footer

Footer should provide:

- PondFish branding
- Short business description
- Navigation links
- Contact information
- Store/business information
- Relevant legal/policy links when available

Footer content must not expose internal/admin information.

## 3.3 Fish Availability

The public website displays fish according to backend-controlled catalogue data.

Each fish may communicate:

- Available in store
- Not currently available in store
- Available for online booking
- Not available for online booking

Physical availability and online-booking eligibility are separate concepts.

A fish may be physically available while not being available for online booking.

## 3.4 Online Booking

Only fish explicitly enabled for online booking can enter the online booking flow.

The public website may direct the user into the customer application for authenticated booking/payment functionality.

The public website must never imply that every physically available fish is online-bookable.

## 3.5 Discounts

Discounts shown publicly must come from active Admin/backend discount data.

The public website must not invent or calculate discount rules independently.

## 3.6 Freshness

Freshness status shown publicly must come from backend/Admin-controlled fish freshness information.

Do not expose internal operational notes.

## 3.7 Dynamic Data

Dynamic public data includes:

- Fish availability
- Fish catalogue information
- Categories
- Freshness
- Active discounts
- Offers
- Subscription plans where publicly configured

The frontend must handle stale/unavailable data safely.

---

# 4. GLOBAL UI STATE MODEL

Every data-driven public page must account for:

1. Initial loading
2. Loaded state
3. Empty state
4. No-search/no-match state where search exists
5. API failure
6. Retry
7. Offline/network failure
8. Partial image failure
9. Unexpected server response

The frontend must never display fake successful data when the backend request has failed.

## 4.1 Loading

Use the approved design-system loading pattern.

For catalogue pages:

- Skeleton cards
- Skeleton title/filter area
- Preserve final layout dimensions
- Avoid large layout shifts

## 4.2 Empty

Empty states must explain:

- What is empty
- Why it may be empty where useful
- What the visitor can do next

Example:

> No fish are currently available in this category.

Possible action:

> Browse all fish

## 4.3 Error

Error states must:

- Clearly communicate that the data could not be loaded
- Avoid technical stack traces
- Provide Retry
- Preserve navigation

Example:

> We couldn't load the fish catalogue right now.

Action:

> Try again

## 4.4 Offline

If the browser loses connectivity:

> You're offline. Check your internet connection and try again.

Do not claim that dynamic availability is current while offline.

## 4.5 Image Failure

If a fish image fails:

- Preserve card dimensions
- Show approved image fallback
- Keep fish name/data usable

---

# 5. PUBLIC-01 — HOME PAGE

## 5.1 Purpose

Provide a clear introduction to PondFish and immediately guide visitors toward:

- Fish discovery
- Categories
- Active offers
- Online booking entry
- Subscription information
- Business/contact information

## 5.2 Access

Public.

No authentication required.

## 5.3 Entry Points

- Direct URL
- Logo/header navigation
- External search/social link
- Advertisement/campaign link

## 5.4 Page Structure

```text
Header
↓
Hero
↓
Featured/Available Fish
↓
Categories
↓
Active Discounts / Offers
↓
Subscription Plans / Information
↓
Why PondFish / Business Information
↓
Booking CTA
↓
Contact / Store Information
↓
Footer
```

## 5.5 Hero

Display:

- Strong PondFish headline
- Short supporting message
- Primary catalogue/booking CTA
- Supporting visual
- Optional secondary CTA

The hero must prioritize real customer action rather than decorative AI-generated visual complexity.

Avoid:

- Excessive gradients
- Overlapping decorative elements
- Artificial floating cards with no functional meaning
- Excessive animation

## 5.6 Featured Fish

Display selected fish from backend-controlled catalogue data.

Each card should show, where configured:

- Fish image
- Fish name
- Category
- Availability
- Freshness
- Price/information where publicly permitted
- Online-booking availability

Actions:

- View details
- Start booking where eligible

## 5.7 Categories

Show available fish categories.

Each category card:

- Category image/icon
- Category name
- Fish count if configured

Action:

- Browse category

## 5.8 Discounts

Show active public discounts.

Each offer card:

- Discount title
- Fish/category applicability
- Validity information where configured
- Offer description
- CTA

Only active/public discounts should appear.

## 5.9 Subscription Section

Show public subscription information.

Do not perform customer account mutation on the public website.

CTA may direct the visitor to the customer application or relevant authenticated flow.

## 5.10 Home Loading

Skeleton:

- Hero placeholder
- Fish card placeholders
- Category placeholders
- Discount placeholders

## 5.11 Home Empty

If no featured fish are available:

- Keep hero and category navigation
- Show a neutral catalogue message
- Do not present fake fish

If no discounts are active:

- Hide the discount section or show a compact neutral state according to design-system rules

## 5.12 Home API Error

If dynamic catalogue data fails:

> Fish availability couldn't be loaded.

Actions:

- Retry
- Continue to other static sections where possible

Do not make the entire website unusable because one dynamic section failed.

## 5.13 Acceptance Criteria

- Home loads without authentication
- Current backend-controlled fish availability is represented
- Active discounts are represented only when active
- Online-bookable fish are clearly distinguished
- All CTAs route correctly
- Loading/empty/error states work
- Mobile/tablet/desktop layouts remain usable
- No internal data is exposed

---

# 6. PUBLIC-02 — FISH CATALOGUE

## 6.1 Purpose

Allow visitors to browse all publicly visible fish.

## 6.2 Access

Public.

## 6.3 Entry Points

- Header
- Home featured fish
- Category page
- Search engine result
- Direct URL

## 6.4 Layout

```text
Page Header
↓
Search / Filters
↓
Category controls
↓
Fish Grid/List
↓
Pagination or incremental loading where implemented
```

## 6.5 Fish Card

Each card should contain:

- Image
- Fish name
- Category
- Availability
- Freshness
- Booking eligibility
- Price/information where configured
- View details action

### Availability Presentation

Use clear status treatment:

```text
Available in Store
```

or

```text
Currently Unavailable
```

Online-booking status must be separately communicated where relevant.

## 6.6 Search

If search is enabled:

- Search fish by name
- Provide clear input
- Support clearing search
- Preserve search state during normal navigation where practical

No-results state:

> No fish match your search.

Actions:

- Clear search
- Browse all fish

## 6.7 Filters

Where implemented, filters may include:

- Category
- Availability
- Online-booking availability
- Other backend-supported public filters

Filters must only use actual backend-supported attributes.

## 6.8 Catalogue Loading

Use card skeletons.

Do not show old inventory values as current after a failed refresh unless explicitly supported by a safe cache policy.

## 6.9 Catalogue Error

> We couldn't load the fish catalogue.

Action:

> Retry

## 6.10 Acceptance Criteria

- Fish data comes from backend
- Cards communicate availability clearly
- Search/filter results are correct
- Unavailable fish are not falsely shown as available
- Online-booking eligibility is not confused with physical availability
- Loading/error/empty states are implemented

---

# 7. PUBLIC-03 — FISH DETAILS

## 7.1 Purpose

Provide detailed public information for one fish.

## 7.2 Entry Points

- Fish card
- Search result
- Category page
- Home feature
- Direct URL

## 7.3 Page Structure

```text
Breadcrumb
↓
Fish Image Gallery / Main Image
↓
Fish Name
↓
Category
↓
Availability
↓
Freshness
↓
Public pricing/information
↓
Online-booking status
↓
Booking CTA where eligible
↓
Related Fish
```

## 7.4 Booking CTA

If online booking is enabled:

> Book Online

If online booking is disabled:

Do not present an active booking action.

Instead show an informative status such as:

> Online booking unavailable

Physical availability and booking availability must remain separate.

## 7.5 Unavailable Fish

If the fish becomes unavailable after the page was opened:

- Refresh backend state when required
- Update status
- Disable affected booking CTA
- Do not allow stale availability to create an invalid booking

## 7.6 Error

If fish does not exist or is no longer public:

> This fish is no longer available.

Action:

> Browse Fish

---

# 8. PUBLIC-04 — CATEGORIES

## 8.1 Purpose

Allow visitors to discover fish by category.

## 8.2 Display

Each category:

- Image/icon
- Name
- Optional description
- Number of public fish where configured

## 8.3 Empty Category

If a category contains no currently public fish:

> No fish are currently available in this category.

Action:

> Browse all fish

## 8.4 Error

> Categories couldn't be loaded.

Action:

> Retry

---

# 9. PUBLIC-05 — CATEGORY DETAILS

## 9.1 Purpose

Display fish belonging to one category.

## 9.2 Structure

```text
Category Header
↓
Category Description
↓
Fish List/Grid
```

Fish cards follow the global Fish Card specification.

## 9.3 Dynamic Availability

Fish availability must be refreshed/represented from current backend state.

Do not assume that a category containing fish means all fish are available.

---

# 10. PUBLIC-06 — DISCOUNTS / OFFERS

## 10.1 Purpose

Display currently active public discounts and offers.

## 10.2 Data

Show only backend/Admin-controlled public discounts.

Possible display data:

- Offer title
- Description
- Applicable fish/category
- Discount value/type where public
- Start/end information where configured
- Status

## 10.3 Scheduled Discount

A scheduled discount should not appear as an active discount before its configured active period unless the Admin configuration explicitly makes it publicly visible as upcoming.

## 10.4 Expired Discount

Expired discounts must not be represented as active.

## 10.5 Empty

> No active offers right now.

Optional CTA:

> Browse Fish

## 10.6 Error

> Offers couldn't be loaded.

Action:

> Retry

---

# 11. PUBLIC-07 — BOOKING ENTRY

## 11.1 Purpose

Provide the transition from public discovery to the authenticated customer booking experience.

## 11.2 Rule

The public website does not independently implement the full customer checkout business workflow.

The customer product is the React Native application and uses the same backend, APIs and business rules.

## 11.3 Entry

Possible entry points:

- Fish Details → Book Online
- Home → Booking CTA
- Catalogue → Book Online

## 11.4 Eligibility

Only online-bookable fish may initiate the booking flow.

## 11.5 Transition

The UI should clearly explain that the visitor is being taken to the customer booking experience where authentication and checkout are required.

## 11.6 Stale Availability

If backend validation says the selected fish is no longer bookable:

> This fish is no longer available for online booking.

Action:

> Browse Fish

---

# 12. PUBLIC-08 — ABOUT

## 12.1 Purpose

Provide public business information.

## 12.2 Content

May include:

- PondFish story
- Business description
- Service explanation
- Store information
- Customer-facing operational information

Content must be editable/configurable where the backend/CMS architecture supports it.

## 12.3 Error

If dynamic content fails:

- Preserve static page structure where possible
- Show retry for failed dynamic section

---

# 13. PUBLIC-09 — CONTACT

## 13.1 Purpose

Help visitors contact or locate PondFish.

## 13.2 Content

Where configured:

- Phone
- Email
- Store address
- Business hours
- Map/location link
- Contact action

## 13.3 Contact Action States

For phone:

- Open device dialer where supported

For email:

- Open mail client where supported

For map:

- Open supported map destination

Do not expose internal operational contacts.

---

# 14. GLOBAL SYSTEM PAGE — 404

## Purpose

Handle unknown public routes.

## UI

- PondFish branding
- Clear message
- Short explanation
- Return Home
- Browse Fish

Example:

> Page not found.

Secondary:

> The page you're looking for doesn't exist or may have moved.

## Acceptance Criteria

- Unknown route never produces a blank screen
- Navigation remains usable
- Home CTA works

---

# 15. GLOBAL SYSTEM PAGE — 500

## Purpose

Handle unexpected server/application failures.

Message:

> Something went wrong.

Actions:

- Try again
- Return Home

Do not expose stack traces, API internals or database details.

---

# 16. GLOBAL SYSTEM PAGE — NETWORK ERROR

## Purpose

Handle failed requests caused by network connectivity or inability to reach the service.

Message:

> We couldn't connect to PondFish.

Actions:

- Retry
- Return to previous safe page where possible

Preserve safe non-sensitive UI state.

---

# 17. GLOBAL SYSTEM PAGE — OFFLINE

## Purpose

Clearly communicate browser connectivity loss.

Message:

> You're offline.

Supporting text:

> Check your internet connection and try again.

Dynamic availability must not be represented as guaranteed current while offline.

---

# 18. GLOBAL SYSTEM PAGE — MAINTENANCE

## Purpose

Provide a controlled experience when the public website is intentionally unavailable.

Message:

> PondFish is temporarily unavailable.

Supporting text:

> We're working on it. Please try again shortly.

Action:

- Retry

If configured, show expected return information.

---

# 19. RESPONSIVE BEHAVIOR

## 19.1 Mobile

Priorities:

1. Navigation
2. Catalogue discovery
3. Availability clarity
4. Booking CTA
5. Contact

Cards may become single-column or compact two-column depending on viewport and approved design.

## 19.2 Tablet

Use balanced grid layouts.

Avoid excessive whitespace.

## 19.3 Desktop

Use:

- Wider content container
- Multi-column catalogue
- Clear visual hierarchy
- Comfortable reading width

Do not stretch text/content across the entire viewport.

---

# 20. ACCESSIBILITY

All public pages must provide:

- Sufficient contrast
- Visible keyboard focus
- Semantic headings
- Accessible labels
- Keyboard navigation
- Meaningful alt text for meaningful images
- Non-color-only status communication
- Adequate touch targets
- Accessible error messages

Loading states should not trap keyboard focus.

---

# 21. PERFORMANCE

The public website should prioritize:

- Fast initial render
- Optimized fish images
- Lazy loading below-the-fold imagery
- Avoiding unnecessary JavaScript
- Caching stable catalogue/category information where safe
- Revalidation of dynamic availability

Do not sacrifice current inventory/booking state for aggressive stale caching.

---

# 22. SECURITY

The public application must:

- Use HTTPS
- Avoid secrets in client bundles
- Validate backend responses
- Never trust client-side availability or price for transactions
- Never expose private bill images
- Never expose admin/worker-only data
- Avoid leaking internal API errors

---

# 23. ANALYTICS / OBSERVABILITY

Where analytics is approved, track public interaction events such as:

- Catalogue opened
- Fish viewed
- Category viewed
- Discount viewed
- Booking CTA clicked
- Contact action clicked
- Error/retry event

Do not collect unnecessary personal information.

---

# 24. CROSS-PORTAL CONSISTENCY

The public website and Customer application must use the same backend source for:

- Fish
- Categories
- Availability
- Freshness
- Discounts
- Subscription information where applicable

The public website must not create an alternate inventory system.

The backend remains authoritative.

---

# 25. PAGE DEFINITION OF DONE

A public page is complete only when:

- Approved design-system components are used
- Desktop layout is implemented
- Tablet layout is implemented
- Mobile layout is implemented
- Backend data is integrated where required
- Loading state works
- Empty state works
- Error state works
- Retry works
- Offline/network behavior is handled
- Accessibility checks are completed
- Images have proper fallback behavior
- Unauthorized/private data is not exposed
- Navigation works
- Acceptance criteria pass

---

# 26. PUBLIC WEBSITE FINAL ACCEPTANCE CHECKLIST

## Navigation

- [ ] Header works
- [ ] Mobile menu works
- [ ] Footer works
- [ ] All public routes resolve
- [ ] 404 works

## Catalogue

- [ ] Fish list loads
- [ ] Fish details load
- [ ] Categories load
- [ ] Availability is accurate
- [ ] Freshness is accurate
- [ ] Online-booking eligibility is clear
- [ ] Search works where enabled
- [ ] Empty states work

## Offers

- [ ] Active discounts appear
- [ ] Scheduled/expired states are handled correctly
- [ ] Empty offers state works

## Booking Entry

- [ ] Only eligible fish expose booking CTA
- [ ] Stale eligibility is rejected safely
- [ ] Customer booking experience transition works

## Reliability

- [ ] Loading states
- [ ] API errors
- [ ] Retry
- [ ] Offline
- [ ] Network failure
- [ ] Maintenance
- [ ] 500
- [ ] 404

## Accessibility

- [ ] Keyboard navigation
- [ ] Focus states
- [ ] Contrast
- [ ] Labels
- [ ] Alt text
- [ ] Touch targets

## Security

- [ ] No secrets in client
- [ ] No private operational data
- [ ] No private bill images
- [ ] Backend remains authoritative

---

# 27. IMPLEMENTATION RULE

This document is a **screen and interaction specification**, not a replacement for the Master PRD.

When a conflict appears:

```text
Backend / locked business rule
        ↓
Master PRD
        ↓
Architecture / API contract
        ↓
Design System
        ↓
This Page Specification
        ↓
Implementation
```

AI coding agents must not invent a new workflow because a screen specification appears incomplete.

If an implementation question cannot be answered by this document, the Master PRD, architecture or API contract must be consulted before introducing new behavior.

---

# 28. NEXT PUBLIC-WEBSITE ARTIFACT

After this document, the next design/build artifact for the Public Website should be the polished screen designs based on:

```text
Design System
+
Page-by-Page UI Specification
+
Existing PondFish Website Design
```

The existing design should be polished rather than replaced with an unrelated visual language.

The polished designs should then become the source for Stitch implementation and subsequent frontend coding.
