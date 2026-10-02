# Rule: PondFish Documentation-First Workflow Governance

All AI coding agents working in the PondFish repository MUST strictly observe the following 19 governance rules before, during, and after executing any coding task.

## 1. DOCUMENTATION-FIRST GATE
Every implementation task MUST begin by identifying and reading the relevant PondFish documentation before modifying code.
For Customer React Native App tasks, the minimum required baseline documentation set is:
1. `Documentation/PondFish_Master_PRD_v2.md`
2. `Documentation/PondFish_System_Technical_Architecture_v1.md`
3. `Documentation/PondFish_Frontend_Application_Architecture_v1.md`
4. `Documentation/PondFish_Page_By_Page_UI_Specification_Customer_React_Native_App.md`
5. `Documentation/PondFish_Complete_Design_System_UI_UX_Specification.md`
6. `Documentation/PondFish_Master_AI_Coding_Prompt_v1.md`
7. `Documentation/PondFish_Integration_Specification_v1.md`
8. `Documentation/PondFish_Cross_System_Validation_Error_Specification_v1.md`
9. `Documentation/PondFish_QA_Test_Specification_v1.md`

The agent MUST NOT start implementation until these documents have been inspected for the requested task.

## 2. TASK-SPECIFIC DOCUMENTATION
Do not blindly read unrelated documentation and then wander into unrelated work.
After reading the baseline documentation, identify the exact documents relevant to the current task.
Examples:
- **Customer Home UI:** Master PRD, Customer UI Specification, Design System, Frontend Architecture, QA Specification.
- **Customer Scan Bill:** Master PRD, Customer UI Specification, AI Bill Processing Specification, Integration Specification, API Specification, QA Specification, Security Specification.
- **Admin Customer Management:** Master PRD, Admin UI Specification, Backend/API Specification, Database Specification, QA Specification.

Only use additional documents when the task actually depends on them.

## 3. DOCUMENTATION COMPLIANCE CHECK
Before coding, the agent MUST create an internal implementation checklist containing:
A. Relevant requirements
B. Required screens/components
C. Required states
D. Required API/backend dependencies
E. Required business rules
F. Required acceptance criteria
G. Explicitly excluded work

The agent must verify each implementation decision against the documentation.
If a requested implementation conflicts with documentation: DO NOT silently choose one. STOP and report:
- Conflicting requirement
- Source document
- Relevant section
- Proposed resolution

## 4. SCOPE LOCK
Every task must have a strict scope.
Example for "Rebuild Customer Home UI":
- **ALLOWED:** Customer Home screen, Home components, Home styling, Home navigation presentation, temporary UI-only mock data if explicitly approved.
- **NOT ALLOWED:** backend changes, database changes, authentication changes, payment changes, booking business logic, GPS implementation, Scan Bill implementation, Android configuration, API architecture changes, unrelated refactoring, other portals, unrelated test rewrites.

The agent MUST NOT expand the task automatically. If an unrelated problem is discovered, REPORT IT. Do not fix it unless the user explicitly requests it.

## 5. DESIGN SOURCE-OF-TRUTH RULE
For UI work, the source-of-truth order is:
1. Figma / design reference explicitly provided for the task
2. PondFish Complete Design System (`Documentation/PondFish_Complete_Design_System_UI_UX_Specification.md`)
3. PondFish Page-by-Page UI Specification (`Documentation/PondFish_Page_By_Page_UI_Specification_Customer_React_Native_App.md`)
4. Master PRD (`Documentation/PondFish_Master_PRD_v2.md`)
5. Frontend Architecture (`Documentation/PondFish_Frontend_Application_Architecture_v1.md`)
6. Existing implementation

Existing code is NOT the design authority. If existing UI differs from the approved design, do not preserve the incorrect design merely because it already exists. Do not invent a new visual style.

## 6. NO GENERIC UI RULE
PondFish must NOT be implemented using generic placeholder UI when a detailed specification exists.
Do not replace specified designs with:
- generic cards
- generic Material UI
- arbitrary gradients
- arbitrary colors
- emoji icons
- generic navigation
- random badges
- invented layouts
- invented copy
- invented business states

Every visual decision must have a source in provided Figma, Design System, or Page-by-Page UI Specification, or must be explicitly marked as an implementation detail.

## 7. NO BUSINESS-RULE INVENTION
Never invent:
- prices
- subscription values
- inventory values
- stock quantities
- discounts
- availability rules
- freshness rules
- payment calculations
- booking states
- GPS states
- customer eligibility

The backend is authoritative for business data. Mock data may only be used when:
1. the task is explicitly UI-only,
2. the mock data is clearly isolated,
3. the mock data does not become production business logic,
4. it can later be replaced by the documented API.

## 8. CUSTOMER APP PLATFORM RULE
The Customer Portal is a NATIVE REACT NATIVE MOBILE APPLICATION.
Do not implement Customer App screens as web pages. Use:
- React Native components
- mobile-native interaction patterns
- SafeArea handling
- touch-friendly controls
- native scrolling
- device dimensions
- native permission behavior where required

The Customer App must not be treated as a responsive website.

## 9. STATE COMPLETENESS RULE
For every data-driven screen, inspect the documentation for:
- initial state
- loading
- success
- empty
- filtered-empty
- validation error
- business error
- network error
- retry
- offline
- permission state
- disabled state
- processing state

Do not implement only the happy path.

## 10. REUSE BEFORE CREATE
Before creating a component:
1. Search the existing codebase.
2. Determine whether an equivalent component already exists.
3. Reuse it if appropriate.
4. Extend it if appropriate.
5. Create a new component only when necessary.

Do not create duplicate components with slightly different names.

## 11. MONOLITH PREVENTION
Do not create or expand giant `App.tsx` files.
Separate:
- screens
- sections
- reusable components
- services
- data models
- API functions
- utilities

Business logic must not be duplicated inside visual components.

## 12. VALIDATION BEFORE COMMIT
Before any commit:
1. Run relevant typecheck.
2. Run relevant tests.
3. Build the affected application.
4. Verify that the task-specific workflow works.
5. For UI work, verify the actual UI on the target device/platform when practical.
6. Check `git diff`.
7. Confirm only intended files changed.
8. Confirm no unrelated files were modified.
9. Confirm no documentation requirements were silently skipped.

A passing TypeScript build alone is NOT sufficient.

## 13. UI TASK VALIDATION
For UI tasks the agent must explicitly compare the implementation against:
- Figma/reference screenshots
- design tokens
- typography
- spacing
- component hierarchy
- navigation
- colors
- iconography
- imagery
- states
- responsive/mobile behavior

The agent must report any remaining visual differences. Do not claim "matches Figma" merely because the screen builds successfully.

## 14. DOCUMENTATION TRACEABILITY
For every completed implementation task, report:
- **Documentation consulted:** filename, relevant section
- **Implementation mapping:** requirement, implementation file, component/function
- **Validation:** test, build, runtime verification
- **Unimplemented documented requirements:** list them explicitly

## 15. NO TASK DIVERSION
The agent must continuously maintain the current task objective.
Before making a change, ask internally: "Does this directly contribute to the requested task?"
If NO: Do not implement it.
If it is required as a dependency: Explain why it is required before modifying it.
Do not turn one task into a general cleanup/refactoring/security/migration project.

## 16. CHANGE BUDGET
Before implementation, estimate the affected files.
If the task unexpectedly expands beyond the expected scope: STOP.
Report:
- expected files
- actual files
- reason for expansion
Do not continue silently.

## 17. GIT RULE
Automatic Git Commit & Push to `main`:
Whenever any code changes, edits, bug fixes, refactors, UI updates, or documentation files are modified/created in this repository, the agent MUST perform a `git commit` and `git push origin main` before completing the turn.

Git commit/push must happen ONLY after:
- documentation compliance
- scope verification
- tests
- build
- runtime verification where applicable
- diff inspection

Never commit broken or unverified work merely because the task has reached the end of an agent turn.
Before committing:
- `git status`
- `git diff --check`
- relevant tests
- relevant build

Then commit only intended files with a clear, concise commit message (e.g. `feat(customer-app): rebuild home screen UI according to specification and design`), and push only the verified commit to `main`.

## 18. FINAL RESPONSE FORMAT
Every implementation task must finish with:

```
TASK:
<task name>

DOCUMENTATION READ:
<list>

SCOPE:
<what was changed>

FILES:
<files changed>

BUSINESS LOGIC:
<whether business logic changed>

TESTS:
<results>

BUILD:
<result>

RUNTIME VERIFICATION:
<result>

DESIGN VERIFICATION:
<result>

UNRELATED ISSUES FOUND:
<list>

REMAINING REQUIREMENTS:
<list>

GIT:
<commit SHA>
<push status>
```

Do not claim completion if any required verification failed.

## 19. CURRENT PROJECT PRIORITY
The current project priority is: **PONDFISH CUSTOMER APP**
Current active task: **CUSTOMER APP HOME SCREEN UI REBUILD**

Do NOT move to:
- Scan Bill
- Cart
- Payments
- GPS
- Notifications
- Admin
- Worker
- TV
- backend refactoring

until the current Customer Home UI task has been verified. The agent must preserve this task boundary.
