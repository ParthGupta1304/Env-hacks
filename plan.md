# RebootRoute MVP Implementation Plan

This plan turns the requirements in [`prd.md`](prd.md) into an ordered, four-day build plan. It keeps the PRD's stack and safety rules. The frontend hosting choice is **AWS Amplify Hosting**, one of the two options already allowed by the PRD.

## Product goal

Deliver a mobile-first PWA where someone can assess a phone, laptop, or power bank; receive an explained Repair, Reuse, Recycle, Safety Review, or Manual Review outcome; and track a privacy-safe QR receipt through partner handover. Admins can manage the queue and see verified outcomes. The deterministic rules and safety escalation must work when AI is unavailable.

## Stack to keep

| Area | Use |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, accessible primitives |
| Forms and validation | React Hook Form + Zod |
| API state | TanStack Query |
| QR | `qrcode.react` or an equivalent QR library |
| Offline drafts | IndexedDB/local storage |
| Frontend hosting | AWS Amplify Hosting |
| Infrastructure definition | AWS SAM |
| API and compute | API Gateway REST + Node.js 22 TypeScript Lambda |
| Identity and roles | Amazon Cognito groups: `ADMIN`, `VOLUNTEER`, `PARTNER` |
| Data | DynamoDB |
| Images and exports | Private S3 buckets with short-lived pre-signed URLs |
| Events and notifications | EventBridge + SNS |
| Logs and monitoring | CloudWatch |
| Optional AI | Provider-independent adapter; manual/mock mode first, provider only if time permits |

Do not add a different framework, database, backend runtime, hosting platform, or AI dependency without revising this plan against the PRD first. Do not commit secrets.

## Beginner's AWS map

Think of AWS as a set of hosted building blocks. Each service below has one job; SAM describes how the backend building blocks fit together so they can be recreated consistently.

| Service | What it does here | Why this project needs it |
|---|---|---|
| Amplify Hosting | Publishes the React website and serves it to phones and browsers | Gives the team a deployed web app URL without managing a web server |
| AWS SAM | Describes and deploys backend resources from files in the repository | Makes the backend setup repeatable and is the PRD's AWS open-source tool |
| API Gateway | Receives HTTPS requests from the website and routes them to backend code | Provides the app's API entry point |
| Lambda | Runs small Node.js functions when an API request or event arrives | Handles intake, assessment, QR/custody, and reporting without a server to keep running |
| Cognito | Signs users in and puts them in groups | Lets the API distinguish admins, volunteers, and partners |
| DynamoDB | Stores device records, assessments, partners, and custody events | Keeps the app's structured records available to the API |
| S3 | Stores uploaded photos and generated report files | Keeps files separate from structured records; bucket access stays private |
| Pre-signed S3 URL | A temporary, narrowly scoped upload/download link | Lets a browser transfer a photo without making the bucket public |
| EventBridge | Routes application events to interested services | Supports assignment and reminder events without coupling every feature together |
| SNS | Delivers notifications from events | Optional reminders/notifications when the MVP has time |
| CloudWatch | Collects logs, metrics, and alarms | Helps see failures and unexpected AWS spend |

**Request path in plain language:** the browser is hosted by Amplify. It calls API Gateway over HTTPS. API Gateway invokes a Lambda function. The function checks the caller's permissions with Cognito information, reads/writes DynamoDB, and may create a temporary S3 upload link. CloudWatch records operational logs. EventBridge/SNS can handle notifications separately.

AWS account setup should use the team's approved account and region (`ap-south-1` in the PRD). Set a budget alert before deploying. Use separate development resources if practical, least privilege, and the PRD's retention settings. Never put account keys or provider secrets in source control or the browser.

## Build order and milestones

The four days are the PRD's hackathon sequence, not a promise about elapsed time. Each milestone has a concrete checkpoint. Update [`progress.md`](progress.md) whenever a milestone starts, completes, is blocked, or changes scope.

### Day 1 — Safe foundation and rules-first user flow

1. Read and confirm the PRD's category fields, safety signals, decision priority, mandatory safety copy, and non-goals.
2. Initialize the existing repository with the React + TypeScript + Vite frontend and the PRD's UI/form/data packages. Add only project files needed to build and run it.
3. Build category selection, basic intake, photo selection, and a category-aware checklist for phones, laptops, and power banks.
4. Implement the deterministic rules engine and tests for safety priority and the PRD's baseline outcome cases. Add explainable reasons, limitations, confidence bands, and a versioned rules ID.
5. Render Safety Review as a hard stop with the exact safety copy; never let AI or a volunteer downgrade the safety state.

**Checkpoint:** a manual assessment works locally for all three categories, including swollen power bank → Safety Review; no AWS account or AI is required to prove the core logic.

### Day 2 — AWS backend, records, and custody trail

1. Create the AWS SAM backend skeleton with API Gateway REST, Node.js 22 TypeScript Lambdas, and the required DynamoDB tables.
2. Add private S3 photo storage, upload validation, and pre-signed upload URLs. Keep photos and QR receipts private by default.
3. Implement intake, assessment persistence, receipt creation, and custody events using the PRD's API/data contracts.
4. Add Cognito sign-in and backend authorization for admin, volunteer, and partner actions. Enforce partner scoping in the backend.
5. Build a QR receipt with no contact information, serial number, or photo link; add a custody timeline that records actor and timestamp.
6. Connect the frontend with TanStack Query and show loading, retry, and network-error states.

**Checkpoint:** intake → saved assessment → QR receipt → recorded handover works against a development AWS deployment; unauthorized partner access is denied.

### Day 3 — Admin workflow, privacy, and optional AI assistance

1. Build the admin queue, device detail, partner assignment, override-with-reason flow, dashboard counts, and custody CSV export if time allows.
2. Add the owner privacy checklist and declaration. Explain that the app records a declaration and does not wipe or certify the device.
3. Add the AI adapter interface for label extraction and visible-condition hints. Start in `manual` or `mock` mode; show each suggestion for user confirmation before it reaches the rules engine.
4. Keep the app fully usable on AI failure. Add OCR correction and condition-hint accept/reject controls.
5. Add local draft recovery and retry for weak/interrupted network conditions. Check keyboard access, labels, touch target size, and errors that do not rely on colour alone.

**Checkpoint:** admins can inspect and assign records; privacy copy is accurate; AI remains advisory and can be disabled without breaking intake or safety decisions.

### Day 4 — Deploy, rehearse, and submit

1. Configure Amplify Hosting for the repository and deploy the frontend. Deploy the SAM backend to the approved AWS region.
2. Set environment configuration for the deployed frontend. Keep secrets server-side and use the PRD's named variables as appropriate.
3. Configure CloudWatch logs/metrics and an AWS budget alert. Review S3 privacy, Cognito/API permissions, and retention settings.
4. Run the PRD's unit, integration, and manual acceptance scenarios. Fix release-blocking failures; record any remaining limitations honestly.
5. Seed demo records for repair, reuse, recycle, and safety review. Reconcile dashboard counts and inspect the public QR response for sensitive fields.
6. Complete README, architecture diagram, deployment/setup instructions, AWS evidence, and the three-minute demo.

**Checkpoint:** deployed mobile flow passes the definition of done; demo and submission evidence are ready.

## Implementation slices

1. **Safety rules first:** pure decision logic with explicit safety precedence and table-driven cases.
2. **Intake UI:** category, model/age, photos, consent, checklist, manual assessment.
3. **AWS persistence:** SAM resources, validated upload, device/assessment records.
4. **QR and custody:** privacy-safe receipt, event timeline, partner handover confirmation.
5. **Admin operations:** queue, role-scoped detail, assignment, override audit, dashboard/export.
6. **Polish and AI:** drafts, accessibility, then optional OCR/condition hints behind confirmation and fallback.

## Safety, privacy, and release gates

- Safety flags take precedence over every ordinary recommendation and are not overridable by volunteers.
- Power-bank repair is never recommended by the MVP.
- AI only suggests; only user-confirmed observations reach deterministic decision rules.
- Do not claim electrical safety, internal battery health, completed data erasure, certified destruction, or speculative carbon savings.
- A QR/public receipt must not expose contact information, raw serials, or images.
- S3 buckets remain private; use validated uploads and short-lived pre-signed URLs.
- Backend authorization is required for every protected action; hiding a button is not authorization.
- Keep the PRD's photo (90 days), contact (handover + 30 days), and custody-event (one year) retention rules in the implementation.
- Deploy only after setting an AWS budget alert and confirming the active account and region.

## Definition of done

The PRD's done condition is met when someone can photograph one supported device, complete a safety-aware assessment, receive an explained Repair/Reuse/Recycle/Safety outcome, receive a privacy-safe QR receipt, and have an administrator record partner handover through a deployed AWS application.

Required checks before calling it done:

- All three supported categories have a manual intake path.
- Safety scenarios route to Safety Review and cannot enter a normal flow.
- OCR/AI failure does not block assessment.
- Intake, assessment, handover, role permissions, and public receipt privacy pass acceptance checks.
- Dashboard numbers reflect stored records; claims are limited to confirmed outcomes.
- App is tested in a mobile browser and the demo can be reproduced from README instructions.

## Explicit scope cuts if time runs short

Apply the PRD's order: remove AI vision/OCR first; remove partner login and have an admin record receipt; remove CSV export but retain dashboard; reduce categories to phone + power bank only as a last scope cut. Never cut safety escalation, decision explanation, custody evidence, or AWS deployment.

## Repository and Git status

The existing `origin` remote points to `https://github.com/ParthGupta1304/Env-hacks.git`. The current branch is `main` and the repository has no commits yet. Keep working in this initialized repository; commit milestones when the project is ready and the team chooses to commit. Do not push unless requested.
