# PONDFISH — DEPLOYMENT / DEVOPS SPECIFICATION

**Version:** 1.0  
**Status:** Implementation Blueprint  
**Document Type:** Deployment, Infrastructure, CI/CD, Environment, Security, Operations, Backup, Recovery, Release and Runbook Specification  
**Scope:** Current MVP — Single Store + One Truck  
**Primary Consumers:** Backend, Frontend, React Native, DevOps, QA, Security, Product, AI coding agents and deployment operators

---

# 0. DOCUMENT PURPOSE

This document converts the locked PondFish architecture, backend PRD, integrations, QA strategy and operational requirements into an implementation-ready deployment and DevOps specification.

It defines:

- environments;
- infrastructure boundaries;
- application deployment;
- database deployment;
- web deployment;
- React Native release;
- Shop TV deployment;
- CI/CD;
- secrets;
- configuration;
- database migrations;
- domains/DNS;
- SSL/TLS;
- observability;
- logging;
- monitoring;
- backups;
- restoration;
- rollback;
- release gates;
- production smoke tests;
- incident handling;
- disaster recovery;
- integration operations;
- operational runbooks.

This document deliberately does **not** invent a hosting provider, exact server size, exact DNS records, exact performance numbers, or unsupported hardware capabilities where those values have not been locked by the project documents.

Those values remain deployment decisions/TBDs until the relevant infrastructure or vendor information is approved.

---

# 1. SOURCE-OF-TRUTH HIERARCHY

Deployment implementation must follow this authority order:

```text
Master PRD
      ↓
System / Technical Architecture
      ↓
Backend Technical Architecture PRD
      ↓
Database / ERD
      ↓
API Specification
      ↓
Business Engine Specifications
      ↓
Integration Specification
      ↓
Cross-System Validation / Error Specification
      ↓
QA / Test Specification
      ↓
Deployment / DevOps Specification
      ↓
Implementation
```

If an implementation decision conflicts with an authoritative business or architecture requirement, the deployment implementation must not silently redefine the product.

The discrepancy must be resolved through the appropriate project decision/change process.

---

# 2. ARCHITECTURE BASELINE

The current architecture defines:

```text
Internet
    ↓
Reverse Proxy / Load Balancer
    ↓
Web Apps + API
    ↓
Application Services
    ↓
Database
    ├── Backup
    └── Monitoring

Background Workers
Realtime Service
File Storage

External Providers
    ├── Razorpay
    ├── Firebase
    ├── OneLap
    └── AI/OCR
```

External providers remain outside the PondFish infrastructure boundary.

The application architecture is a modular monolith with background workers and realtime services for the initial system.

The relational database remains the transactional authority.

---

# 3. DEPLOYMENT PRINCIPLES

## 3.1 One Business Truth

Deployment must preserve one authoritative business state across:

```text
Public Website
Customer React Native App
Worker Portal
Admin Portal
Shop TV
Backend
Database
External Integrations
```

## 3.2 Backend Owns Business Truth

Frontend deployments must never become business authorities.

## 3.3 Database Owns Transactional Consistency

Deployment changes must preserve:

- transaction integrity;
- inventory integrity;
- subscription credit integrity;
- booking integrity;
- payment references;
- audit history.

## 3.4 External Integrations Are Replaceable

Razorpay, Firebase, OneLap and AI/OCR remain behind service/adapter boundaries.

Future POS/SI-801 integration must enter through an adapter and must not require rewriting the transaction engine.

## 3.5 Production Changes Are Controlled

No direct ad-hoc production code edits.

All production changes must be traceable to:

```text
Source Control
→ CI
→ Validation
→ Approved Deployment
```

## 3.6 Secrets Never Enter Source

Production secrets must never be committed to source control.

---

# 4. DEPLOYMENT SCOPE

The deployment system covers:

### Web

- Public Website
- Worker Portal
- Admin Portal
- Shop TV Web Application

### Mobile

- Customer React Native application
- Android release
- iOS release where applicable

### Backend

- API
- application services
- business engines
- background workers
- realtime service
- scheduled jobs where implemented

### Data

- relational database;
- object/file storage;
- cache where used;
- audit data;
- logs;
- operational metrics.

### Integrations

- Razorpay;
- Firebase Authentication;
- Firebase Push;
- OneLap;
- AI/OCR;
- future POS/SI-810 adapter.

---

# 5. ENVIRONMENT STRATEGY

Minimum environments:

```text
Development
     ↓
Staging
     ↓
Production
```

Each environment must be isolated.

---

# 6. DEVELOPMENT ENVIRONMENT

Development is for:

- local coding;
- unit tests;
- component tests;
- local integration development;
- controlled mock providers;
- development database;
- local realtime testing.

Development must not use production credentials.

Development must not casually use production customer data.

---

# 7. STAGING ENVIRONMENT

Staging is the production-like validation environment.

It is used for:

- integration testing;
- E2E testing;
- deployment testing;
- database migration validation;
- security checks;
- performance baseline;
- Razorpay test/sandbox;
- Firebase development configuration;
- controlled OneLap test configuration where available;
- AI/OCR controlled test data.

Staging must be as close to production as reasonably practical.

---

# 8. PRODUCTION ENVIRONMENT

Production serves real:

- customers;
- workers;
- admins;
- store operations;
- TV display;
- payment transactions;
- bookings;
- inventory;
- subscriptions;
- GPS journeys.

Production access must be restricted.

Production configuration must be explicitly reviewed before release.

---

# 9. ENVIRONMENT ISOLATION

Each environment must have separate:

```text
Database
Secrets
Payment configuration
Notification configuration
Object storage namespace/bucket
GPS configuration where possible
AI/OCR configuration where applicable
```

Production data must not be casually copied into development.

---

# 10. ENVIRONMENT NAMING

Use stable environment identifiers.

Example:

```text
dev
staging
prod
```

Provider resources should include environment identity where supported.

Example:

```text
pondfish-dev
pondfish-staging
pondfish-prod
```

Exact provider naming remains an implementation decision.

---

# 11. INFRASTRUCTURE BOUNDARIES

The infrastructure boundary should conceptually remain:

```text
                   INTERNET
                      |
              Reverse Proxy / LB
                      |
        +-------------+-------------+
        |             |             |
     Public        Worker         Admin
      Web           Web            Web
        \             |             /
         +------------+------------+
                      |
                     API
                      |
          +-----------+-----------+
          |           |           |
      Services    Workers     Realtime
          |           |           |
          +-----------+-----------+
                      |
                  Database
                  /      \
             Storage    Backup

External:
Razorpay / Firebase / OneLap / AI
```

---

# 12. WEB APPLICATION DEPLOYMENT

Web applications include:

```text
Public Website
Worker Portal
Admin Portal
Shop TV
```

They may be deployed as separate applications or as appropriately separated applications within the selected hosting architecture.

The final hosting provider is not locked by this document.

---

# 13. PUBLIC WEBSITE DEPLOYMENT

The public website must:

- be publicly accessible;
- use HTTPS;
- communicate with approved backend APIs;
- expose only public catalogue/content data;
- not contain private integration secrets;
- reflect admin-controlled fish availability/discount state according to backend rules.

The public website must not directly connect to private database credentials.

---

# 14. WORKER PORTAL DEPLOYMENT

The Worker Portal must:

- use authenticated access;
- use HTTPS;
- enforce server-side permissions;
- support QR scanning;
- support bill workflow;
- support transaction workflow;
- support approved operational functions.

Worker authorization must be validated by the backend.

---

# 15. ADMIN PORTAL DEPLOYMENT

The Admin Portal must:

- use authenticated access;
- enforce admin permissions server-side;
- expose only approved administrative capabilities;
- use HTTPS;
- not expose server secrets;
- provide access to audit/operational data according to permissions.

---

# 16. SHOP TV DEPLOYMENT

The Shop TV is a separate read-only web application.

It must:

- connect to approved realtime/backend services;
- display committed successful transactions;
- play the approved notification/bell sound;
- recover after temporary network loss;
- avoid duplicate event presentation;
- never become a business authority.

The TV must not require access to private admin APIs beyond what its read-only projection requires.

---

# 17. CUSTOMER REACT NATIVE DEPLOYMENT

The Customer Portal is a native React Native application.

Deployment must support:

```text
Android
iOS where applicable
```

The mobile application must use environment-specific configuration.

It must never embed:

- Razorpay secret keys;
- OneLap private credentials;
- Firebase server credentials;
- AI private keys;
- database credentials;
- POS credentials.

---

# 18. MOBILE CONFIGURATION

Mobile builds must distinguish:

```text
Development
Staging
Production
```

Configuration may include:

- API base URL;
- Firebase configuration;
- application identifiers;
- analytics configuration where approved;
- notification configuration;
- feature flags where implemented.

Secrets must remain server-side.

---

# 19. MOBILE APPLICATION IDENTIFIERS

Production Android/iOS application identifiers must be stable after publication.

Development/staging identifiers should be isolated from production where practical.

Example pattern:

```text
Production:
com.pondfish.app

Staging:
com.pondfish.app.staging
```

Exact identifiers require project approval.

---

# 20. MOBILE RELEASE CHANNELS

Recommended:

```text
Development
    ↓
Internal QA
    ↓
Closed/Beta Testing
    ↓
Production
```

Android should use the appropriate Google Play testing/release channels.

iOS should use the appropriate Apple TestFlight/release process.

---

# 21. MOBILE RELEASE GATES

Before production mobile release:

- [ ] QA regression passed
- [ ] authentication verified
- [ ] catalogue verified
- [ ] booking verified
- [ ] payment verified
- [ ] QR verified
- [ ] notifications verified
- [ ] tracking verified where applicable
- [ ] crash-free smoke validation
- [ ] production API configuration verified
- [ ] no development credentials
- [ ] no debug logging
- [ ] privacy/security review passed

---

# 22. BACKEND DEPLOYMENT

Backend deployment includes:

```text
API
Application Services
Domain Engines
Background Workers
Realtime Service
Scheduled Jobs
```

The backend must be deployed as a coherent release.

---

# 23. MODULAR MONOLITH DEPLOYMENT

The initial backend architecture is a modular monolith.

Deployment must preserve module boundaries:

```text
Auth
Catalogue
Inventory
Freshness
Discount
Subscription
Payment
Transaction
Booking
Bill
Notification
GPS
Reporting
Audit
```

Deployment architecture must not create unnecessary distributed-service complexity for MVP.

---

# 24. BACKGROUND WORKERS

Background workers may process:

- outbox events;
- notifications;
- reconciliation;
- AI/OCR tasks where designed asynchronously;
- integration jobs;
- reporting jobs;
- cleanup/expiry jobs;
- other approved asynchronous tasks.

Workers must be idempotent where the operation can be retried.

---

# 25. REALTIME SERVICE

Realtime service supports approved projections such as:

- Shop TV transaction display;
- GPS tracking;
- other explicitly approved realtime features.

Realtime failure must not corrupt transactional state.

---

# 26. DATABASE DEPLOYMENT

The relational database is the transactional authority.

Deployment must protect:

- customers;
- subscriptions;
- credit ledger;
- weekly usage;
- transactions;
- payments;
- bookings;
- inventory;
- audit logs;
- journey state.

---

# 27. DATABASE MIGRATION PRINCIPLES

All schema migrations must be:

- version-controlled;
- reviewable;
- repeatable;
- tested;
- environment-aware;
- included in CI/CD;
- validated against staging before production.

---

# 28. FORWARD-SAFE MIGRATIONS

Where rolling deployments are used, migrations should be compatible with the currently deployed application during the transition.

Preferred sequence:

```text
Add compatible schema
        ↓
Deploy application
        ↓
Backfill/migrate
        ↓
Remove obsolete structure later
```

Do not perform destructive changes first when an older application version may still be running.

---

# 29. DESTRUCTIVE MIGRATIONS

Production destructive schema changes require:

- backup;
- migration plan;
- dependency review;
- rollback/recovery strategy;
- QA validation;
- explicit approval.

Never delete transactional history simply to simplify schema changes.

---

# 30. DATABASE BACKUPS

Backups must cover critical production data.

At minimum:

```text
Customers
Subscriptions
Credit Ledger
Weekly Usage
Transactions
Payments
Bookings
Inventory
Audit Logs
```

Also back up critical object/file metadata according to the approved storage policy.

---

# 31. BACKUP STRATEGY

The exact provider-native backup mechanism is TBD until infrastructure is selected.

The final strategy must define:

```text
Backup frequency
Retention
Encryption
Storage location
Access control
Restore procedure
Restore testing
Failure notification
```

Do not claim a backup frequency until it is approved.

---

# 32. BACKUP SECURITY

Backups must:

- be access-controlled;
- not be publicly accessible;
- use encryption where supported;
- have separate credentials;
- be protected against accidental deletion;
- have documented restoration procedures.

---

# 33. RESTORE TESTING

Backup existence is not sufficient.

QA/DevOps must periodically restore into a controlled environment and verify:

```text
Database opens
        ↓
Schema valid
        ↓
Transactions preserved
        ↓
Inventory consistent
        ↓
Subscription ledgers consistent
        ↓
Bookings preserved
        ↓
Audit logs preserved
```

---

# 34. DATA CONSISTENCY AFTER RESTORE

Restoration must verify business consistency, not only raw row restoration.

Check:

- transaction totals;
- payment references;
- inventory;
- subscription credit;
- weekly usage;
- booking status;
- audit records;
- journey records.

---

# 35. OBJECT / FILE STORAGE

Private bill images must use protected storage.

Requirements:

- private by default;
- authorized retrieval;
- no public bucket unless explicitly approved;
- signed/authorized access where applicable;
- lifecycle/retention policy;
- secure deletion policy where required.

---

# 36. FILE STORAGE BACKUP

The backup policy must define whether bill images are:

```text
backed up
archived
retained for a defined period
or recoverable through provider-native storage protection
```

Do not invent retention periods before product/legal requirements are approved.

---

# 37. CACHE DEPLOYMENT

Cache may be used for:

- public fish listing;
- categories;
- static configuration;
- non-critical display data.

Cache must never become authoritative for:

- payment;
- inventory deduction;
- subscription credit;
- weekly quantity;
- booking reservation;
- transaction success.

---

# 38. CACHE INVALIDATION

When admin changes:

```text
Fish availability
Discount
Catalogue data
```

the affected public/customer data must be revalidated or invalidated according to the application cache design.

A stale cache must never authorize an invalid business mutation.

---

# 39. DOMAIN STRATEGY

The project already has a client-provided project domain.

The final DNS plan must define approved hostnames.

A possible structure is:

```text
www.<domain>
api.<domain>
admin.<domain>
worker.<domain>
tv.<domain>
```

Exact domain names must be approved before DNS implementation.

---

# 40. DNS OWNERSHIP

The client/business should retain ownership of the production domain.

Deployment operators may receive controlled DNS access.

Do not transfer domain ownership to a developer account merely for deployment convenience.

---

# 41. DNS CHANGE CONTROL

Production DNS changes require:

- intended record;
- reason;
- target;
- TTL consideration;
- rollback plan;
- verification.

Avoid unnecessary DNS changes during critical business hours.

---

# 42. SSL/TLS

All production public endpoints must use HTTPS.

This includes:

- Public Website;
- Worker Portal;
- Admin Portal;
- TV;
- API;
- approved realtime endpoints.

HTTP should redirect to HTTPS where applicable.

---

# 43. CERTIFICATE MANAGEMENT

Certificate provisioning/renewal must be automated where the selected hosting provider supports it.

Before certificate expiry:

```text
Monitoring
→ Alert
→ Renewal
→ Verification
```

Manual certificate replacement should not be a normal production procedure.

---

# 44. REVERSE PROXY / LOAD BALANCER

The reverse proxy/load balancer layer may provide:

- TLS termination;
- routing;
- rate limiting where appropriate;
- request forwarding;
- health checks;
- security headers;
- access logging.

Exact product/provider remains TBD.

---

# 45. HEALTH CHECKS

Applications should expose appropriate health checks.

Separate:

```text
Liveness
Readiness
Dependency health
```

where practical.

A process being alive does not necessarily mean the application is ready to serve traffic.

---

# 46. READINESS

Readiness should account for required dependencies.

Do not expose a deployment as ready when critical startup configuration is missing.

---

# 47. DEPLOYMENT TOPOLOGY

Minimum logical topology:

```text
Internet
   ↓
Reverse Proxy / Load Balancer
   ↓
Web + API
   ↓
Application Services
   ↓
Database

Background Workers
Realtime
File Storage
Monitoring
Backup
```

External providers remain external.

---

# 48. SCALING DIRECTION

The MVP does not require unnecessary microservice decomposition.

Scaling should initially focus on:

- application instances;
- database capacity;
- worker capacity;
- connection pooling;
- cache;
- realtime service capacity;
- file storage;
- external provider limits.

---

# 49. DATABASE CONNECTION MANAGEMENT

Application instances must use controlled database connections.

Do not allow uncontrolled connection creation during traffic spikes.

Production configuration must account for:

- pool size;
- timeout;
- idle connection handling;
- transaction timeout;
- provider/database limits.

Exact values are environment tuning decisions.

---

# 50. CI/CD PIPELINE

Required logical pipeline:

```text
Commit
  ↓
Install Dependencies
  ↓
Lint / Static Analysis
  ↓
Type Check where applicable
  ↓
Unit Tests
  ↓
Integration Tests
  ↓
Build
  ↓
Database Migration Validation
  ↓
Security Checks
  ↓
Deploy Staging
  ↓
Smoke Tests
  ↓
E2E Tests
  ↓
Approval
  ↓
Production Deployment
```

---

# 51. PULL REQUEST GATES

A change should not merge when required checks fail.

At minimum:

- lint;
- type checking where applicable;
- unit tests;
- integration tests;
- build;
- security checks.

Critical business changes require the appropriate additional test suite.

---

# 52. BRANCH STRATEGY

The exact Git branching strategy is a team decision.

At minimum maintain:

```text
Development work
Release-ready state
Production state
```

The production branch/tag must always identify exactly what version is deployed.

---

# 53. RELEASE VERSIONING

Every production deployment must have a unique version identifier.

Recommended:

```text
Application version
+
Git commit SHA
+
deployment timestamp
```

Mobile builds require platform-appropriate version/build numbers.

---

# 54. DEPLOYMENT ARTIFACTS

Every release should be traceable to:

- Git commit;
- build artifact;
- environment;
- migration version;
- configuration version where applicable;
- deployment time;
- deployer/process.

---

# 55. STAGING DEPLOYMENT

Every production-bound release should first reach staging.

Staging must execute:

```text
Migration validation
↓
Application startup
↓
Smoke tests
↓
Integration tests
↓
E2E tests
↓
QA approval
```

---

# 56. PRODUCTION DEPLOYMENT STRATEGY

The final strategy may be:

- rolling;
- blue/green;
- canary;
- controlled replacement.

The selected strategy depends on the hosting architecture.

For MVP, the priority is:

```text
Safety
Traceability
Rollback
Minimal downtime
```

rather than unnecessary deployment complexity.

---

# 57. PRODUCTION DEPLOYMENT APPROVAL

Production deployment requires approval according to the project's release process.

The deployment record must include:

- release version;
- change summary;
- migrations;
- known risks;
- test status;
- rollback plan;
- deployment operator.

---

# 58. DATABASE MIGRATION ORDER

Where required:

```text
Backup validation
      ↓
Migration compatibility check
      ↓
Database migration
      ↓
Application deployment
      ↓
Smoke tests
```

If the application can safely tolerate schema-first changes, use the forward-compatible approach defined by the migration plan.

---

# 59. MIGRATION FAILURE

If a migration fails:

```text
STOP
↓
Do not continue application deployment blindly
↓
Capture error
↓
Assess database state
↓
Use approved recovery plan
```

Never rerun an uncertain migration blindly against production.

---

# 60. ROLLBACK PRINCIPLE

Rollback is not always:

```text
Deploy previous application
```

because database and external side effects may already exist.

Rollback planning must distinguish:

```text
Application rollback
Database recovery
Configuration rollback
Integration credential rollback
Business reconciliation
```

---

# 61. APPLICATION ROLLBACK

Application rollback should restore the previous known-good application artifact.

Before rollback:

- identify deployed version;
- identify previous version;
- verify compatibility;
- assess migrations;
- assess external side effects.

---

# 62. DATABASE ROLLBACK

Database rollback must not blindly reverse committed financial data.

If a migration is backward-compatible, the application may roll back safely.

If not, use the approved recovery strategy.

---

# 63. FINANCIAL STATE AND ROLLBACK

A code rollback cannot undo:

- a completed payment;
- a completed transaction;
- inventory deduction;
- subscription credit usage.

Those require business reconciliation/correction mechanisms.

---

# 64. CONFIGURATION ROLLBACK

Configuration changes must be versioned/traceable where practical.

Rollback examples:

- API URL;
- provider configuration;
- feature flags;
- notification configuration;
- GPS settings.

Secrets should be rotated/replaced through secure secret management rather than committed configuration.

---

# 65. FEATURE FLAGS

Feature flags may be used for controlled rollout where useful.

A flag must not become a hidden replacement for business rules.

Flags require:

- owner;
- purpose;
- default;
- environment scope;
- removal plan.

---

# 66. SECRET MANAGEMENT

Secrets must live in secure environment/secret management.

Never place secrets in:

```text
Source code
Frontend bundle
Public repository
Admin-editable business settings
Client-visible API responses
```

---

# 67. REQUIRED SECRET CATEGORIES

Potential production secrets include:

```text
Database credentials
Razorpay secret credentials
Firebase server credentials
OneLap credentials
AI provider credentials
Object storage credentials
JWT/session signing secrets where applicable
Webhook secrets
Internal service credentials
```

Exact secret list follows actual implementation.

---

# 68. SECRET ROTATION

Credential replacement must not require source-code changes.

Rotation procedure:

```text
Create new credential
↓
Store securely
↓
Deploy/update configuration
↓
Verify
↓
Revoke old credential
↓
Monitor
```

---

# 69. LEAST PRIVILEGE

Every provider credential should have only required permissions.

Examples:

- read-only TV access;
- backend-only payment secret;
- restricted storage access;
- restricted database credentials.

---

# 70. SECRET EXPOSURE RESPONSE

If a secret is exposed:

```text
Revoke/rotate
↓
Identify exposure
↓
Assess affected systems
↓
Review logs
↓
Deploy replacement
↓
Document incident
```

Do not simply delete the secret from the source and assume the problem is solved.

---

# 71. FIREBASE DEPLOYMENT

Firebase configuration must be environment-aware.

Separate development/staging/production configuration where appropriate.

Mobile builds must use the correct Firebase configuration for the build environment.

---

# 72. FIREBASE AUTH OPERATIONS

Monitor:

- OTP failures;
- provider availability;
- authentication errors;
- abnormal request rates;
- token/session failures.

Firebase provider failure must result in a recoverable authentication state.

---

# 73. FIREBASE PUSH OPERATIONS

Notification delivery is asynchronous.

A notification failure must not roll back a successful business transaction.

Monitor:

- provider failures;
- invalid device tokens;
- retry queue;
- delivery issues;
- duplicate event attempts.

---

# 74. RAZORPAY DEPLOYMENT

Use Razorpay test/sandbox mode before production.

Production requires:

- approved account;
- production credentials;
- webhook configuration;
- signature verification;
- refund configuration;
- reconciliation process.

---

# 75. PAYMENT WEBHOOK DEPLOYMENT

Webhook endpoints must:

- use HTTPS;
- validate authenticity/signature according to provider documentation;
- be idempotent;
- log correlation/reference information;
- not expose secrets;
- handle duplicate callbacks safely.

---

# 76. PAYMENT FAILURE ISOLATION

If Razorpay is unavailable:

```text
Do not pretend payment succeeded.
```

Payment remains failed/pending/unknown according to the authoritative provider/application state.

---

# 77. PAYMENT RECONCILIATION

The operational system must be able to compare:

```text
PondFish Payment State
        vs
Razorpay State
```

Discrepancies must be identified rather than silently creating unrelated transactions.

---

# 78. ONELAP DEPLOYMENT

OneLap integration requires:

- official API documentation;
- credentials;
- tracker/device identifiers;
- endpoints;
- webhook/polling method;
- rate limits;
- test environment where available.

Do not implement undocumented provider behavior.

---

# 79. GPS FAILURE ISOLATION

If OneLap is unavailable:

```text
Admin sees stale/unavailable state.
Customer does not receive fabricated coordinates.
```

The rest of PondFish must continue operating where GPS is not required.

---

# 80. AI/OCR DEPLOYMENT

AI/OCR configuration must remain behind an adapter/service boundary.

Required configuration may include:

- provider;
- endpoint;
- API credential;
- model;
- timeout;
- retry policy;
- file limits.

Exact provider/model is a deployment decision unless locked elsewhere.

---

# 81. AI FAILURE ISOLATION

If AI is unavailable:

```text
Bill extraction unavailable
        ↓
Clear recoverable state
        ↓
Approved manual handling where applicable
```

AI failure must not corrupt financial or inventory state.

---

# 82. FUTURE POS / SI-810 DEPLOYMENT

Current workflow remains:

```text
SI-810
 ↓
Printed Bill
 ↓
Customer/Worker Scan
 ↓
PondFish
```

Future:

```text
SI-810
 ↓
POS
 ↓
PondFish Integration Adapter
 ↓
Transaction Engine
```

The transaction engine must remain stable.

The actual protocol, ports, network behavior and vendor capabilities must be based on available vendor documentation and confirmed hardware.

---

# 83. EXTERNAL DEPENDENCY OWNERSHIP

Client/business should preferably own:

- production domain;
- Razorpay account;
- Firebase project;
- Supabase project;
- Apple Developer account;
- Google Play Console;
- OneLap account;
- provider accounts.

This supports long-term ownership and reduces vendor lock-in.

---

# 84. DOMAIN/DNS RUNBOOK

## Step 1

Confirm domain ownership.

## Step 2

Confirm DNS provider.

## Step 3

Create required records.

## Step 4

Point records to approved hosting/reverse proxy.

## Step 5

Verify DNS propagation.

## Step 6

Provision/verify TLS.

## Step 7

Test:

```text
Public Website
API
Admin
Worker
TV
```

---

# 85. PRODUCTION CONFIGURATION CHECKLIST

Before production:

```text
[ ] Production database
[ ] Production storage
[ ] Production API URL
[ ] Production web URLs
[ ] Production mobile configuration
[ ] Razorpay production configuration
[ ] Firebase production configuration
[ ] OneLap production configuration where applicable
[ ] AI production configuration where applicable
[ ] Secret management
[ ] Domain/DNS
[ ] SSL/TLS
[ ] Monitoring
[ ] Logging
[ ] Backup
[ ] Restore procedure
[ ] Alerting
```

---

# 86. PRODUCTION SECURITY CHECKLIST

```text
[ ] HTTPS
[ ] Secure headers where applicable
[ ] Secrets externalized
[ ] Database not publicly exposed unnecessarily
[ ] Least privilege
[ ] Admin access protected
[ ] Server-side authorization
[ ] Payment secrets server-side
[ ] Integration credentials server-side
[ ] Debug mode disabled
[ ] Production error pages sanitized
[ ] Sensitive logs disabled
[ ] Rate limits configured where appropriate
[ ] Backup access restricted
```

---

# 87. MONITORING

Monitoring should cover:

### Application

- uptime;
- error rate;
- latency;
- failed requests;
- worker failures.

### Database

- availability;
- connections;
- storage;
- slow queries;
- errors.

### Integrations

- Razorpay failures;
- payment verification failures;
- Firebase delivery failures;
- AI extraction failures;
- OneLap stale data;
- OneLap API failures;
- webhook failures;
- reconciliation discrepancies.

### Realtime

- connection failures;
- event delay;
- event processing failures.

---

# 88. ALERT CATEGORIES

Alerts should be classified as:

```text
Critical
High
Warning
Informational
```

Do not alert on every transient event.

Alerts must be actionable.

---

# 89. CRITICAL ALERT EXAMPLES

Examples:

- database unavailable;
- payment verification outage;
- production API unavailable;
- repeated transaction failures;
- backup failure;
- certificate expiry risk;
- storage exhaustion;
- severe error spike.

Exact thresholds require operational calibration.

---

# 90. HIGH ALERT EXAMPLES

Examples:

- OneLap unavailable;
- notification provider failure;
- worker queue backlog;
- realtime outage;
- AI extraction failure spike;
- elevated API latency.

---

# 91. LOGGING ARCHITECTURE

Logs should allow correlation:

```text
User Action
 ↓
Request ID
 ↓
API
 ↓
Domain Engine
 ↓
Database
 ↓
Integration
 ↓
Event
```

---

# 92. REQUIRED LOG CONTEXT

Where appropriate:

- timestamp;
- operation;
- request/correlation ID;
- actor context;
- business reference;
- provider reference;
- result;
- error code.

---

# 93. PROHIBITED LOG DATA

Do not log:

- passwords;
- OTPs;
- provider secrets;
- private keys;
- payment secrets;
- unnecessary personal information;
- raw sensitive credentials.

---

# 94. LOG RETENTION

Retention must be defined according to:

- operational needs;
- privacy requirements;
- security requirements;
- provider limits;
- cost.

Do not invent a retention duration without approval.

---

# 95. OBSERVABILITY DASHBOARDS

At minimum, operational dashboards should expose:

```text
API Health
Database Health
Payment Health
Booking Health
Inventory Errors
Worker Jobs
Realtime
TV Events
GPS
Notifications
AI
```

---

# 96. BUSINESS OBSERVABILITY

Technical monitoring should be supplemented by business consistency checks:

- successful transaction count;
- failed transaction count;
- payment mismatch count;
- booking conflict count;
- inventory conflict count;
- subscription credit anomalies;
- reconciliation discrepancies.

---

# 97. TV OBSERVABILITY

Monitor:

- TV connection;
- last event received;
- event latency;
- duplicate event detection;
- reconnect status.

The TV being offline must not cause transaction failure.

---

# 98. GPS OBSERVABILITY

Monitor:

- last provider update;
- stale status;
- provider errors;
- tracker identity;
- journey status;
- publication status.

Do not fabricate location values when the provider is unavailable.

---

# 99. BACKGROUND JOB OBSERVABILITY

Monitor:

- queue depth;
- processing time;
- retry count;
- failed jobs;
- dead-letter/failed-job state where applicable;
- idempotency behavior.

---

# 100. RETRY POLICY

Retries must be:

- bounded;
- controlled;
- backed off;
- idempotency-aware.

Do not blindly retry non-idempotent operations.

---

# 101. RETRY CLASSIFICATION

Distinguish:

```text
Network timeout
Provider 5xx
Validation failure
Authentication failure
Permanent business rejection
```

Only transient failures should normally be retried automatically.

---

# 102. CIRCUIT BREAKING

For unstable external providers, use circuit-breaking or equivalent protection where appropriate.

Purpose:

```text
Prevent provider failure
from becoming
system-wide failure.
```

---

# 103. DEPLOYMENT SMOKE TEST

After deployment:

```text
Health Check
   ↓
Authentication
   ↓
Catalogue
   ↓
Availability
   ↓
Booking
   ↓
Payment test/sandbox where applicable
   ↓
Worker workflow
   ↓
Transaction
   ↓
TV Event
   ↓
Admin
```

Only approved non-destructive production tests should be executed in production.

---

# 104. PRODUCTION SMOKE TEST SAFETY

Never create real financial/test transactions in production unless:

- explicitly approved;
- non-destructive;
- reversible;
- clearly identifiable;
- included in the release procedure.

---

# 105. DEPLOYMENT VERIFICATION

Immediately after release verify:

```text
Version
API health
Database connectivity
Authentication
Public website
Worker portal
Admin portal
Customer app compatibility
TV
Realtime
Payment integration
Notifications
GPS where applicable
```

---

# 106. INCIDENT RESPONSE

When a production incident occurs:

```text
Detect
 ↓
Classify
 ↓
Contain
 ↓
Protect business data
 ↓
Investigate
 ↓
Recover
 ↓
Verify
 ↓
Communicate
 ↓
Document
```

---

# 107. INCIDENT PRIORITY

## P0

Examples:

- financial corruption;
- unauthorized financial action;
- database loss;
- complete production outage;
- security breach.

## P1

Examples:

- booking unavailable;
- payment verification broadly failing;
- worker workflow unavailable;
- admin unavailable.

## P2

Examples:

- secondary feature degraded;
- notification delays;
- reporting issue.

---

# 108. INCIDENT CONTAINMENT

Containment may include:

- disabling a feature flag;
- pausing a failing integration;
- stopping a worker process;
- restricting an endpoint;
- rolling back application code;
- switching to an approved manual workflow.

Do not disable critical security controls merely to restore convenience.

---

# 109. PAYMENT INCIDENT RUNBOOK

If payment state is uncertain:

```text
Do not manually mark success without authoritative evidence.
```

Steps:

1. identify payment reference;
2. inspect PondFish state;
3. inspect provider state;
4. check webhook history;
5. reconcile;
6. correct through approved business process;
7. record audit information.

---

# 110. INVENTORY INCIDENT RUNBOOK

If inventory appears inconsistent:

1. stop unsafe mutation if necessary;
2. identify affected fish;
3. inspect transaction history;
4. inspect reservation/ledger state;
5. inspect concurrent operations;
6. reconcile physical vs system state;
7. use approved correction process;
8. audit the correction.

Never directly edit historical transaction rows to hide an inconsistency.

---

# 111. SUBSCRIPTION INCIDENT RUNBOOK

If credit appears incorrect:

1. identify customer;
2. inspect subscription;
3. inspect credit ledger;
4. inspect weekly usage;
5. inspect transactions;
6. identify duplicate/concurrent operations;
7. calculate authoritative correction;
8. record audit.

---

# 112. TV INCIDENT RUNBOOK

If TV stops displaying successful transactions:

1. verify transaction is committed;
2. verify outbox/event state;
3. verify realtime service;
4. verify TV connectivity;
5. reconnect TV;
6. rehydrate authoritative display state where supported;
7. verify no duplicate event.

Never mark the transaction failed because the TV is offline.

---

# 113. GPS INCIDENT RUNBOOK

If GPS stops updating:

1. verify OneLap status;
2. verify last provider update;
3. mark state stale/unavailable;
4. do not fabricate coordinates;
5. verify journey state;
6. restore provider connectivity;
7. verify customer publication rules.

---

# 114. NOTIFICATION INCIDENT RUNBOOK

If notifications fail:

1. verify business transaction;
2. verify event;
3. verify notification job;
4. verify provider;
5. retry transient failure;
6. invalidate bad device token if appropriate.

A successful transaction remains successful.

---

# 115. AI INCIDENT RUNBOOK

If AI/OCR fails:

1. preserve bill;
2. mark extraction unavailable;
3. retry only when appropriate;
4. allow approved manual workflow;
5. do not create financial state from an unverified extraction.

---

# 116. DATABASE INCIDENT RUNBOOK

If database becomes unavailable:

```text
Detect
↓
Protect current state
↓
Assess availability
↓
Restore/repair using approved provider procedure
↓
Verify consistency
↓
Run application smoke tests
↓
Resume traffic
```

Do not improvise destructive repair commands.

---

# 117. BACKUP FAILURE RUNBOOK

If a backup fails:

1. alert;
2. identify last successful backup;
3. investigate;
4. restore backup coverage;
5. perform a test backup;
6. verify recoverability;
7. record incident.

---

# 118. CERTIFICATE INCIDENT RUNBOOK

If TLS certificate fails:

1. verify certificate;
2. verify DNS;
3. verify certificate provider;
4. renew/replace;
5. verify all production domains;
6. run smoke tests.

---

# 119. DNS INCIDENT RUNBOOK

If DNS fails:

1. verify authoritative nameservers;
2. inspect records;
3. verify recent changes;
4. restore approved records;
5. verify propagation;
6. verify HTTPS;
7. verify application endpoints.

---

# 120. DEPLOYMENT FAILURE RUNBOOK

If deployment fails before production traffic:

```text
Stop
↓
Inspect CI/CD
↓
Fix build/configuration
↓
Redeploy staging
```

If production deployment has already begun:

```text
Stop rollout
↓
Assess current version mix
↓
Verify compatibility
↓
Rollback or complete safely
↓
Run smoke tests
```

---

# 121. PARTIAL DEPLOYMENT

If some instances run old code and some new code:

- schema compatibility must be verified;
- API contracts must remain compatible;
- feature flags may be used;
- migration state must be checked.

Do not continue if versions cannot safely coexist.

---

# 122. DISASTER RECOVERY

Disaster recovery must address:

```text
Application outage
Database outage
Storage outage
Provider outage
Domain/DNS outage
Credential compromise
Deployment corruption
Infrastructure loss
```

---

# 123. RECOVERY PRIORITY

Business-critical recovery priority:

1. Database/business truth
2. Backend/API
3. Authentication
4. Payment verification
5. Worker operational workflow
6. Customer app
7. Admin
8. TV projection
9. Notifications
10. Reporting

Exact business priority may be refined during operational planning.

---

# 124. RECOVERY OBJECTIVES

The project must explicitly approve:

```text
RPO — acceptable data loss window
RTO — acceptable recovery time
```

These values are **TBD** until agreed.

Do not invent numeric RPO/RTO values.

---

# 125. RECOVERY TESTING

Recovery tests must prove:

```text
Backup
→ Restore
→ Application startup
→ Data consistency
→ Authentication
→ Booking
→ Transaction history
→ Inventory
→ Subscription ledger
→ Audit
```

---

# 126. PRODUCTION ACCESS

Production access should follow least privilege.

Access should be:

- authenticated;
- authorized;
- auditable;
- limited to required personnel;
- removed when no longer required.

---

# 127. ADMIN VS INFRASTRUCTURE ACCESS

Business Admin access and infrastructure/DevOps access are separate concerns.

A PondFish Admin user must not automatically receive:

- server shell access;
- database administrator access;
- secret-management access;
- deployment access.

---

# 128. DATABASE ACCESS

Application users should not receive direct database credentials.

Direct production database access should be restricted to authorized infrastructure personnel.

---

# 129. PRODUCTION DEBUGGING

Never enable unrestricted debug mode in production.

Debugging must use:

- logs;
- tracing;
- metrics;
- request IDs;
- controlled diagnostic tools.

---

# 130. SOURCE CONTROL

Production code must originate from the approved repository.

Protect:

- main/production branches;
- deployment credentials;
- CI secrets;
- signing keys.

---

# 131. MOBILE SIGNING

Android/iOS signing credentials must be protected.

Do not commit:

- keystores;
- signing certificates/private keys;
- provisioning secrets;
- App Store credentials.

---

# 132. MOBILE BACKUP

Mobile application source/configuration needed for future releases must be maintained in source control.

Store signing credentials securely and independently.

---

# 133. TV DEVICE OPERATIONS

The Shop TV device should have:

- stable network;
- approved browser/runtime;
- auto-launch configuration where supported;
- automatic recovery/reload;
- restricted local access;
- screen power configuration appropriate for store operations.

Exact device-management mechanism is TBD.

---

# 134. TV RECOVERY

If TV app crashes:

```text
Restart/reload
↓
Reconnect realtime
↓
Fetch/rehydrate current state
```

TV failure must not affect backend transactions.

---

# 135. STORE NETWORK

The store network must support:

- Worker Portal;
- Admin where used;
- TV;
- SI-810;
- future POS;
- OneLap connectivity where required.

The exact network topology and hardware remain deployment decisions.

---

# 136. STORE NETWORK FAILURE

If store internet fails:

- transaction workflows must follow approved online-only behavior;
- TV may become unavailable;
- GPS may become stale;
- notification delivery may be delayed.

Do not create an offline transaction queue unless explicitly approved.

---

# 137. OBSERVABILITY DURING NETWORK FAILURE

System should distinguish:

```text
Application failure
vs
Store network failure
vs
External provider failure
```

This prevents incorrect incident diagnosis.

---

# 138. PERFORMANCE DEPLOYMENT DIRECTION

Optimize:

- fish browsing;
- customer home;
- worker booking search;
- bill processing;
- transaction finalization;
- admin tables;
- TV realtime updates.

AI and external integrations should not block unrelated system operations.

---

# 139. CDN / STATIC ASSETS

A CDN may be used for:

- public static assets;
- images;
- CSS/JS;
- other non-sensitive static resources.

Private files must not be exposed through public caching.

Exact CDN choice is TBD.

---

# 140. IMAGE DELIVERY

Fish catalogue images should use appropriate:

- compression;
- dimensions;
- responsive delivery;
- caching.

Do not apply public caching to private bill images.

---

# 141. SECURITY HEADERS

Production web applications should use appropriate security headers according to the selected hosting/reverse proxy architecture.

Do not blindly copy a generic header set without validating application compatibility.

---

# 142. RATE LIMITING

Rate limiting should protect:

- authentication;
- OTP;
- public APIs where necessary;
- payment endpoints;
- webhook endpoints;
- sensitive administrative APIs.

Exact limits must be tuned against actual provider/application requirements.

---

# 143. WEBHOOK SECURITY

All provider webhook endpoints must:

- use HTTPS;
- validate provider authenticity;
- prevent replay/duplicate side effects;
- log reference IDs;
- remain idempotent.

---

# 144. SCHEDULED JOB DEPLOYMENT

Scheduled jobs may include:

- booking expiry;
- subscription period processing;
- reconciliation;
- notification retry;
- cleanup;
- reporting.

Jobs must be:

- idempotent;
- observable;
- retry-safe;
- environment-aware.

---

# 145. JOB DUPLICATE PROTECTION

If a scheduled job runs twice:

```text
Expected business result = same as one execution
```

No duplicate transaction, deduction or notification should occur where idempotency is required.

---

# 146. CLOCK/TIMEZONE

Production systems must use a consistent server/database time strategy.

Business date/time behavior must be explicitly defined.

Do not rely on device-local time for authoritative business timestamps.

---

# 147. AUDIT TIME

Audit timestamps must come from trusted server-side/database time.

Client timestamps may be retained as metadata only where useful.

---

# 148. LOG TIME

Logs should use a consistent timestamp format and timezone strategy.

Operational dashboards must make timezone clear to operators.

---

# 149. RELEASE CHECKLIST — INFRASTRUCTURE

```text
[ ] Infrastructure available
[ ] Database available
[ ] Storage available
[ ] Reverse proxy available
[ ] TLS valid
[ ] DNS valid
[ ] Secrets configured
[ ] Monitoring configured
[ ] Alerts configured
[ ] Backup verified
[ ] Restore procedure available
```

---

# 150. RELEASE CHECKLIST — APPLICATION

```text
[ ] API builds
[ ] Web builds
[ ] Worker builds
[ ] Admin builds
[ ] TV builds
[ ] Mobile builds
[ ] Environment configuration verified
[ ] Database migrations validated
[ ] Integration configuration verified
[ ] E2E tests passed
```

---

# 151. RELEASE CHECKLIST — BUSINESS

```text
[ ] Catalogue
[ ] Inventory
[ ] Discounts
[ ] Subscription
[ ] Booking
[ ] Payment
[ ] Transaction
[ ] QR
[ ] TV
[ ] GPS
[ ] Notifications
[ ] Audit
```

---

# 152. RELEASE CHECKLIST — SECURITY

```text
[ ] No production secrets in repository
[ ] No secrets in frontend bundle
[ ] Authentication tested
[ ] Authorization tested
[ ] Payment security tested
[ ] Webhooks verified
[ ] Sensitive logs checked
[ ] Admin access verified
[ ] Production debug disabled
```

---

# 153. RELEASE CHECKLIST — QA

```text
[ ] P0 defects = 0
[ ] P1 defects reviewed
[ ] Critical regression passed
[ ] Concurrency passed
[ ] Idempotency passed
[ ] Network failures passed
[ ] Integration failures passed
[ ] Recovery passed
[ ] Accessibility baseline passed
[ ] Performance baseline passed
[ ] UAT approved
```

---

# 154. PRODUCTION CHANGE RECORD

Every production release should record:

```text
Release ID
Version
Git SHA
Date/time
Environment
Deployer
Migration version
Change summary
QA result
Approval
Rollback plan
Post-deployment result
```

---

# 155. DEPLOYMENT AUDITABILITY

The deployment process must make it possible to answer:

```text
What version is running?
Who deployed it?
When?
From which commit?
Which migration ran?
Which configuration was active?
Did smoke tests pass?
```

---

# 156. POST-DEPLOYMENT MONITORING

After deployment monitor:

```text
Error rate
Latency
Database
Payments
Bookings
Inventory
Workers
Realtime
TV
GPS
Notifications
AI
```

The observation window should be defined by the release procedure.

---

# 157. POST-DEPLOYMENT BUSINESS VERIFICATION

Verify that:

- successful transaction creates correct records;
- inventory changes correctly;
- subscription credit changes correctly;
- TV receives committed event;
- customer receipt/status is correct;
- admin reports remain consistent.

---

# 158. DEPLOYMENT FAILURE — BUSINESS PROTECTION

If a deployment creates unexpected business behavior:

```text
Stop rollout
↓
Protect transaction state
↓
Assess affected records
↓
Rollback/recover application if safe
↓
Reconcile business state
↓
Verify
```

Do not use application rollback as a substitute for business reconciliation.

---

# 159. OPERATIONAL OWNERSHIP

The final deployment plan must identify:

```text
Client Owner
Infrastructure Owner
Application Owner
Database Owner
Payment Integration Owner
Mobile Release Owner
Domain/DNS Owner
Incident Contact
```

These names are project-specific and remain TBD.

---

# 160. CLIENT DEPENDENCIES

Deployment requires client/vendor cooperation for:

### Razorpay

- account;
- verification;
- keys;
- webhook;
- refunds;
- production approval.

### Firebase

- project;
- auth;
- notifications;
- Android;
- iOS;
- credentials.

### OneLap

- documentation;
- credentials;
- tracker IDs;
- endpoints;
- webhook/polling;
- rate limits;
- test environment.

### AI/OCR

- provider;
- credentials;
- formats;
- limits;
- privacy/retention;
- expected capability.

### ESSAE SI-810

- device;
- vendor documentation;
- communication protocol;
- network;
- IP/port;
- SDK/API;
- support.

### Deployment

- Supabase/project access;
- production database;
- hosting;
- domain/DNS;
- Apple Developer;
- Google Play Console.

---

# 161. PROVIDER SANDBOX STRATEGY

Where supported:

```text
Provider Sandbox
       ↓
Staging
       ↓
Production
```

Examples:

- Razorpay test mode;
- Firebase development project;
- AI controlled sample data;
- OneLap test credentials/device where available.

SI-810 requires physical-device validation before direct integration.

---

# 162. CI/CD SECURITY

CI/CD credentials must:

- be stored as protected secrets;
- use least privilege;
- not be printed in logs;
- be rotated;
- be scoped by environment where supported.

---

# 163. BUILD REPRODUCIBILITY

Production artifacts should be reproducible from:

```text
Git commit
+
lockfile
+
build configuration
+
environment configuration
```

Do not depend on untracked local machine state.

---

# 164. DEPENDENCY MANAGEMENT

Dependencies should be:

- version controlled;
- lockfile controlled;
- scanned;
- updated deliberately.

Security updates must be evaluated before production release.

---

# 165. DEPENDENCY FAILURE

If a third-party package introduces a critical vulnerability:

```text
Identify
↓
Assess exposure
↓
Patch/update
↓
Run regression
↓
Deploy
```

Do not upgrade major dependencies blindly during unrelated releases.

---

# 166. BUILD FAILURE

If CI build fails:

```text
Do not bypass required checks.
```

Investigate:

- dependency;
- source;
- environment;
- configuration;
- test;
- infrastructure.

---

# 167. TEST ENVIRONMENT RESET

Staging reset procedures must preserve required test fixtures.

Resetting staging must not affect production.

---

# 168. PRODUCTION DATA ACCESS FOR QA

QA should use:

- synthetic data;
- staging data;
- approved anonymized data.

Production personal/customer data must not be casually copied into test environments.

---

# 169. DATA ANONYMIZATION

If production-derived data is required for testing, it must follow an approved anonymization/redaction process.

---

# 170. MONITORING OF PERSONAL DATA

Monitoring/logging systems must minimize personal information.

Use identifiers/references rather than unnecessary raw personal data.

---

# 171. INCIDENT EVIDENCE

During incidents preserve:

- deployment version;
- logs;
- request IDs;
- relevant business references;
- provider references;
- timestamps;
- database state evidence.

Do not modify historical evidence to make an incident appear resolved.

---

# 172. CHANGE MANAGEMENT

Changes should be categorized:

```text
Feature
Bug Fix
Security
Infrastructure
Database
Integration
Configuration
Emergency
```

Each category may have different approval requirements.

---

# 173. EMERGENCY CHANGES

Emergency production changes should still be:

- documented;
- traceable;
- reviewed retrospectively;
- tested as much as safely possible.

---

# 174. MAINTENANCE MODE

If maintenance mode is implemented, deployment procedures must define:

```text
Enable
↓
Deploy/migrate
↓
Validate
↓
Disable
↓
Smoke test
```

Critical mutations must not silently succeed during maintenance.

---

# 175. ZERO-DOWNTIME EXPECTATION

Zero downtime is not assumed unless the selected infrastructure architecture supports it.

The deployment plan should optimize for controlled downtime and safe recovery rather than making an unsupported availability promise.

---

# 176. EXTERNAL PROVIDER OUTAGES

PondFish should continue unaffected functionality when a non-critical external provider is down.

Examples:

```text
Firebase Push down
→ transaction remains successful

TV down
→ transaction remains successful

GPS down
→ GPS stale/unavailable

AI down
→ bill extraction unavailable/manual workflow

Razorpay down
→ payment cannot be falsely marked successful
```

---

# 177. RECONCILIATION JOBS

Where external provider state can diverge, reconciliation jobs should identify:

- payment discrepancies;
- GPS discrepancies;
- future POS discrepancies.

Reconciliation should be diagnostic and controlled.

It must not silently rewrite authoritative journey or financial history.

---

# 178. OUTBOX / EVENT DELIVERY

Where the backend uses an outbox pattern:

```text
Business Transaction
        ↓
Outbox Record
        ↓
COMMIT
        ↓
Worker Publishes Event
```

Event publication must not occur as an uncommitted business success.

---

# 179. OUTBOX RETRY

Outbox processing must:

- retry transient failures;
- prevent duplicate side effects;
- track failed events;
- provide operational visibility.

---

# 180. EVENT RECOVERY

If realtime delivery fails:

```text
Committed event remains recorded
        ↓
Realtime reconnect
        ↓
Projection rehydrates
```

The system must not lose committed business truth merely because a consumer was offline.

---

# 181. TV EVENT RECOVERY

TV must not invent transactions.

After reconnect:

```text
Fetch/subscribe
→ obtain authoritative latest state/events
→ display
```

according to the TV projection design.

---

# 182. MOBILE EVENT RECOVERY

The Customer App must revalidate critical state after:

- app resume;
- network reconnect;
- authentication refresh;
- checkout return.

---

# 183. WEB EVENT RECOVERY

Worker/Admin/Public web applications should revalidate stale critical data after reconnect or relevant navigation.

---

# 184. HEALTH ENDPOINT SECURITY

Health endpoints must not expose:

- secrets;
- database credentials;
- provider credentials;
- internal topology unnecessarily.

Detailed diagnostics should be restricted.

---

# 185. ERROR PAGE DEPLOYMENT

Production web applications require intentional:

```text
404
403
500
Network unavailable
Maintenance
```

states.

Production error pages must not expose stack traces.

---

# 186. STATIC ERROR FALLBACK

If the application cannot load:

- use the hosting/runtime fallback where appropriate;
- display safe user messaging;
- provide retry/navigation where possible.

---

# 187. CUSTOMER APP ERROR RECOVERY

For network failures:

```text
Explain
Retry
Revalidate
```

Do not create false success.

---

# 188. WORKER ERROR RECOVERY

Worker errors must clearly answer:

```text
Did the booking complete?
Did the transaction complete?
Can I retry?
```

This is particularly important during physical store operations.

---

# 189. ADMIN ERROR RECOVERY

Admin mutation failures must clearly distinguish:

```text
Not saved
Saved
Unknown
Conflict
Unauthorized
```

Do not show a generic success toast for an unconfirmed mutation.

---

# 190. TV ERROR RECOVERY

TV should favor:

```text
Connection state
Last successful update
Retry/reconnect
```

rather than exposing technical stack traces to store staff.

---

# 191. DEPLOYMENT DOCUMENTATION

Every production system should have:

```text
Architecture Diagram
Environment Variables Reference
Deployment Runbook
Rollback Runbook
Backup Runbook
Restore Runbook
Incident Runbook
Provider Runbooks
DNS Runbook
Mobile Release Runbook
TV Recovery Runbook
```

---

# 192. ENVIRONMENT VARIABLE DOCUMENTATION

Maintain a non-secret variable catalogue containing:

```text
Variable Name
Environment
Purpose
Required?
Secret?
Default/Example
Owner
```

Never put actual production secret values into documentation.

---

# 193. CONFIGURATION VALIDATION

Application startup should validate required configuration.

If required production configuration is missing:

```text
Application should fail readiness safely
```

rather than starting in a partially broken state.

---

# 194. CONFIGURATION DIFFERENCES

Differences between environments should be explicit.

Examples:

```text
API URLs
Provider credentials
Database
Firebase project
Payment mode
Debug settings
Allowed origins
```

---

# 195. CORS / ORIGIN CONFIGURATION

Production APIs should allow only approved origins where browser clients require cross-origin access.

Do not use unrestricted wildcard origins for authenticated/private APIs without a justified design.

---

# 196. MOBILE API SECURITY

The mobile application is not a trusted environment.

Never rely on:

```text
Hidden UI
Hardcoded secret
Client-side validation
```

for security.

All sensitive authorization and business validation must occur server-side.

---

# 197. PUBLIC API SECURITY

Public catalogue endpoints may be accessible without authentication where intended.

They must still:

- validate inputs;
- enforce rate limits where needed;
- avoid private data;
- avoid mutation without authorization.

---

# 198. ADMIN API SECURITY

Admin APIs require:

- authenticated identity;
- server-side role check;
- input validation;
- audit where required.

---

# 199. WORKER API SECURITY

Worker APIs require:

- authenticated worker identity;
- role check;
- resource authorization;
- operational scope.

---

# 200. TV API SECURITY

TV endpoints should expose only the minimum read-only data required for the projection.

Do not give TV credentials broad administrative permissions.

---

# 201. PRODUCTION DATABASE SECURITY

Database should not be publicly reachable unnecessarily.

Use:

- private networking where supported;
- restricted credentials;
- connection controls;
- backups;
- monitoring.

---

# 202. DATABASE PERFORMANCE MONITORING

Monitor:

- slow queries;
- connection saturation;
- locks;
- storage;
- CPU/memory where provider exposes them;
- failed transactions.

---

# 203. TRANSACTION LOCK MONITORING

Because inventory and subscription operations depend on transactional consistency, monitor for:

- excessive lock waits;
- deadlocks;
- long-running transactions;
- transaction retries.

---

# 204. DEADLOCK HANDLING

If database deadlocks can occur:

- capture diagnostics;
- retry only when safe;
- preserve idempotency;
- investigate query/locking strategy.

Do not blindly retry arbitrary non-idempotent operations.

---

# 205. PERFORMANCE REGRESSION

Every major release should compare:

```text
API latency
DB query performance
catalogue load
booking
transaction finalization
TV realtime latency
```

against the approved baseline.

---

# 206. RESOURCE EXHAUSTION

Monitor:

- CPU;
- memory;
- database storage;
- connection pool;
- worker queue;
- file storage;
- log storage.

Alerts must occur before exhaustion becomes an outage where practical.

---

# 207. STORAGE RETENTION

Define retention for:

- logs;
- bill images;
- backups;
- audit data;
- temporary files.

Final retention values require project/business/legal approval.

---

# 208. BACKUP RETENTION

Backup retention must balance:

```text
Recovery needs
Security
Compliance
Cost
```

Final values are TBD.

---

# 209. DISASTER RECOVERY OWNERSHIP

The project must identify the person/team responsible for executing recovery.

Do not assume the hosting provider automatically performs business recovery.

---

# 210. DR TEST CHECKLIST

```text
[ ] Restore database
[ ] Verify schema
[ ] Verify transactions
[ ] Verify inventory
[ ] Verify subscription ledger
[ ] Verify bookings
[ ] Verify customers
[ ] Verify audit
[ ] Verify application startup
[ ] Verify authentication
[ ] Verify smoke test
```

---

# 211. DEPLOYMENT ACCEPTANCE CRITERIA

Deployment architecture is ready when:

- environments are isolated;
- production secrets are protected;
- CI/CD gates are defined;
- migrations are version-controlled;
- backups exist;
- restore is tested;
- monitoring exists;
- logs are correlated;
- domains/DNS are defined;
- SSL is configured;
- production rollback is documented;
- mobile release path exists;
- TV deployment/recovery path exists;
- provider integrations are environment-aware;
- deployment smoke tests exist;
- incident runbooks exist.

---

# 212. AI CODING-AGENT DEPLOYMENT RULES

## Rule 01

Never hardcode production secrets.

## Rule 02

Never commit credentials.

## Rule 03

Never use production credentials in development.

## Rule 04

Never point staging at the production database.

## Rule 05

Never copy production data into development casually.

## Rule 06

Never bypass CI checks merely to deploy.

## Rule 07

Never perform destructive database migrations without an approved migration plan.

## Rule 08

Never assume an application rollback reverses business transactions.

## Rule 09

Never mark payment success because the payment request was sent.

## Rule 10

Never allow TV success display to represent uncommitted state.

## Rule 11

Never allow external provider failure to corrupt unrelated business operations.

## Rule 12

Never invent undocumented OneLap/SI-810 behavior.

## Rule 13

Never put private provider credentials in frontend/mobile source.

## Rule 14

Never expose private bill files publicly.

## Rule 15

Never disable authorization merely to make a workflow work.

## Rule 16

Never create an offline transaction queue unless explicitly approved.

## Rule 17

Never silently change deployment architecture to solve an application problem.

## Rule 18

When an infrastructure value is not locked, mark it as TBD rather than inventing a production value.

## Rule 19

All production deployments must be traceable to a source commit/build.

## Rule 20

All deployment changes must preserve the business source of truth.

---

# 213. DEPLOYMENT RUNBOOK — STANDARD RELEASE

```text
1. Create release candidate
2. Run CI
3. Review migration
4. Deploy staging
5. Run smoke tests
6. Run E2E
7. Run integration tests
8. QA approval
9. Confirm production backup
10. Confirm production configuration
11. Confirm rollback plan
12. Deploy
13. Run production smoke tests
14. Monitor
15. Record release result
```

---

# 214. DEPLOYMENT RUNBOOK — ROLLBACK

```text
1. Detect release problem
2. Classify severity
3. Stop rollout
4. Identify deployed version
5. Identify previous version
6. Assess database migration compatibility
7. Assess financial/business side effects
8. Roll back application if safe
9. Recover database if required
10. Reconcile business state
11. Run smoke tests
12. Monitor
13. Document incident
```

---

# 215. DEPLOYMENT RUNBOOK — DATABASE MIGRATION

```text
1. Review migration
2. Validate against staging
3. Backup/restore readiness
4. Check application compatibility
5. Run migration
6. Verify schema
7. Deploy compatible application
8. Smoke test
9. Monitor
```

---

# 216. DEPLOYMENT RUNBOOK — MOBILE RELEASE

```text
1. Freeze release scope
2. Run full mobile QA
3. Verify production API config
4. Verify Firebase production config
5. Verify signing
6. Build release
7. Internal testing
8. Beta/testing track
9. Approval
10. Production release
11. Monitor crash/error reports
```

---

# 217. DEPLOYMENT RUNBOOK — TV

```text
1. Build approved TV web application
2. Deploy
3. Open TV URL
4. Authenticate/configure read-only access
5. Verify realtime connection
6. Trigger controlled test event
7. Verify transaction display
8. Verify bell/sound
9. Disconnect network
10. Reconnect
11. Verify recovery
```

Only approved non-destructive test events should be used in production.

---

# 218. DEPLOYMENT RUNBOOK — PUBLIC WEBSITE

```text
1. Deploy approved build
2. Verify DNS
3. Verify TLS
4. Verify homepage
5. Verify catalogue
6. Verify categories
7. Verify availability
8. Verify discounts
9. Verify API connectivity
10. Verify mobile/responsive behavior
11. Verify 404/500
```

---

# 219. DEPLOYMENT RUNBOOK — WORKER

```text
1. Deploy approved build
2. Verify login
3. Verify QR
4. Verify booking retrieval
5. Verify bill workflow
6. Verify transaction
7. Verify completion
8. Verify error states
9. Verify network recovery
```

---

# 220. DEPLOYMENT RUNBOOK — ADMIN

```text
1. Deploy approved build
2. Verify login
3. Verify permissions
4. Verify inventory
5. Verify fish/catalogue
6. Verify discount
7. Verify booking
8. Verify transactions
9. Verify GPS
10. Verify audit
```

---

# 221. DEPLOYMENT RUNBOOK — INCIDENT HOTFIX

```text
1. Identify incident
2. Reproduce safely
3. Define minimal fix
4. Add regression test
5. Run CI
6. Deploy staging
7. Validate
8. Approve emergency release
9. Deploy production
10. Smoke test
11. Monitor
12. Document
```

---

# 222. OPERATIONAL HANDOVER

Before final production handover:

```text
[ ] Repository access
[ ] Hosting access
[ ] Domain/DNS access
[ ] Supabase/database access
[ ] Firebase access
[ ] Razorpay access
[ ] OneLap access
[ ] Apple Developer access
[ ] Google Play Console access
[ ] Secret-management ownership
[ ] Backup ownership
[ ] Monitoring ownership
[ ] Runbooks
[ ] Architecture docs
[ ] Deployment docs
```

The actual credentials should be transferred through secure account/secret-management procedures, not written into this document.

---

# 223. THIRD-PARTY COST BOUNDARY

Third-party costs remain separate from the development fee where specified by the commercial documentation.

Potential operational costs include:

- Razorpay charges;
- Supabase/cloud database;
- Firebase/Google Cloud usage;
- Apple Developer Program;
- Google Play Console;
- hosting/VPS/cloud;
- storage;
- bandwidth;
- OneLap;
- OTP/SMS/WhatsApp;
- vendor SDK/hardware licensing.

Exact current pricing must be verified from the provider at procurement time.

---

# 224. HOSTING DECISION

The final hosting provider is **not locked by this document**.

The selected provider must satisfy:

- HTTPS;
- secure environment variables;
- deployment automation;
- database connectivity;
- backup/recovery;
- logging;
- monitoring;
- scaling path;
- domain support;
- required regional/operational constraints.

Do not force a provider choice merely because it is familiar.

---

# 225. SUPABASE DEPLOYMENT

Where Supabase is used as the selected backend/database platform:

- production project must be separate;
- database migrations must remain version-controlled;
- secrets must remain protected;
- storage policies must be reviewed;
- Row Level Security must be treated as an additional boundary where applicable;
- backups/restoration must be validated;
- service-role credentials must never reach clients.

Exact Supabase plan/configuration remains a deployment decision.

---

# 226. APPLICATION HOSTING DECISION

Web/API hosting may use:

- managed platform;
- VPS;
- cloud infrastructure;
- other approved architecture.

The final choice must preserve:

```text
Security
Reliability
Deployability
Observability
Recovery
Cost control
```

---

# 227. NO UNDOCUMENTED INFRASTRUCTURE

AI coding agents must not create:

- undocumented production servers;
- hidden databases;
- unknown external services;
- unmanaged storage;
- personal developer accounts as production dependencies.

Every production dependency must be documented.

---

# 228. PERSONAL ACCOUNT RESTRICTION

Production ownership should not depend on a developer's personal:

- email;
- cloud account;
- GitHub account;
- payment account;
- domain account.

Client/business-owned accounts are preferred.

---

# 229. FINAL DEPLOYMENT CHECK

The production system must be explainable as:

```text
Source
 ↓
CI
 ↓
Build
 ↓
Staging
 ↓
QA
 ↓
Approval
 ↓
Production
 ↓
Monitoring
 ↓
Backup
 ↓
Recovery
```

No hidden manual step should be required for normal deployment.

---

# 230. FINAL OPERATIONAL PRINCIPLE

PondFish deployment is successful when the production environment can safely preserve the same business truth under:

```text
Normal traffic
High traffic
Deployment
Rollback
Network failure
Provider failure
Database failure
Realtime failure
Mobile reconnect
TV reconnect
Credential rotation
Backup restoration
Incident recovery
```

The infrastructure must support the product.

The infrastructure must never redefine the product.

The backend owns business truth.

The database preserves transactional truth.

Events communicate committed state.

External integrations provide capabilities.

CI/CD provides controlled change.

Monitoring provides visibility.

Backups provide recoverability.

Runbooks provide operational response.

---

# 231. NEXT DOCUMENT

After this Deployment / DevOps Specification, the documentation sequence reaches the final synthesis artifact:

```text
MASTER AI CODING PROMPT
```

The Master AI Coding Prompt must be generated **only after the preceding documents are locked**, because it must instruct an AI coding agent to build the complete PondFish system from the approved documentation set.

It should reference, at minimum:

```text
Master PRD
Design System / UI-UX Specification
System Technical Architecture
Backend Technical Architecture PRD
Database / ERD
API Specification
Business Engine Specifications
Portal Specifications
Integration Specification
Cross-System Validation & Error Specification
QA / Test Specification
Deployment / DevOps Specification
```

It must not become a replacement for those documents.

The Master Prompt is the execution layer that tells the coding agent how to consume them.

---

# DOCUMENT END
