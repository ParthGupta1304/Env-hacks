# RebootRoute — Repair First. Recycle Right.

**Detailed product requirements document**  
**Version:** 1.0 — hackathon build specification  
**Track:** Waste & Energy  
**Pilot:** One college campus, its IT department, student volunteers, and one authorised e-waste partner  
**Format:** Mobile-first progressive web application (PWA)  
**Build window:** Four-day hackathon MVP

---

## 1. Executive summary

RebootRoute is a repair-first e-waste decision and chain-of-custody platform for colleges. A student or institution photographs an unused phone, laptop, or power bank and completes a short guided checklist. AI assists with label reading and visible-condition hints. A transparent safety rules engine then recommends the device's highest safe next use:

1. **Repair** — return the device to service;
2. **Reuse / donate** — pass a functional device to a verified campus or community use case;
3. **Recycle** — route a device that cannot reasonably be reused to an authorised recycler;
4. **Safety review** — isolate potentially hazardous devices, particularly damaged batteries, for human handling.

Every decision explains its evidence and limitations. Every physical handover has a QR-based record. An administrator sees a live, auditable view of what the campus collected and where each item went.

RebootRoute is deliberately **not** a resale/scrap marketplace. It does not arrange pickup, take payments, remotely erase devices, certify data destruction, or make an electrical-safety guarantee. Its core value is upstream: **preventing a usable device from becoming e-waste too soon.**

---

## 2. Hackathon alignment

### 2.1 Theme fit

The hackathon's **Waste & Energy** track explicitly includes e-waste and informal recyclers. RebootRoute closes the loop before recycling: it prioritises repair and reuse, identifies unsafe items, and helps a campus hand remaining items to responsible downstream partners.

### 2.2 Real-world impact

| Problem | RebootRoute intervention | Verifiable outcome |
|---|---|---|
| Usable devices remain in drawers or are discarded prematurely | Repairability assessment and next-step checklist | Devices assigned to repair/reuse instead of immediate recycling |
| Owners fear personal-data loss | Guided backup, sign-out, SIM/SD removal, and reset declaration | More owners complete donation/reuse handover |
| Institutions cannot prove what happened after an e-waste drive | QR receipt and custody timeline | Devices with a recorded final outcome |
| Damaged batteries may enter general waste | Hard safety escalation rules | Risky devices blocked from normal flow |
| Downstream work is fragmented | Structured partner handover | Confirmed receipt by repair/refurbishment/recycling partner |

### 2.3 AWS requirement and implementation

The event requires a project to use an AWS open-source tool or to deploy on AWS. RebootRoute meets both paths:

- The application deploys on AWS: Amplify Hosting or S3 + CloudFront, API Gateway, Lambda, DynamoDB, S3, Cognito, EventBridge, SNS, and CloudWatch.
- The backend is defined with **AWS SAM**, an AWS open-source developer tool.
- The system is serverless and sized for the AWS Free Tier/hackathon credits.
- The AI layer is optional and replaceable. A rules-only fallback ensures the complete safety flow works if an AI service fails.

**Judging evidence:** live deployed URL, AWS architecture diagram, short service screenshots, test notes, and a video showing an actual device move from intake to handover.

### 2.4 Judging map

| Judging dimension | RebootRoute response |
|---|---|
| Idea and impact | Solves a specific campus e-waste decision with measured outcomes |
| Built on AWS | Working serverless AWS deployment and SAM infrastructure |
| Design and usability | Guided flow for non-technical owners; focused dashboard for an IT administrator |
| Execution | Three categories, four outcomes, one end-to-end handover path |
| Demo video | Two real devices: one reuse decision, one battery safety escalation |

---

## 3. Problem, users, and pilot boundary

### 3.1 Problem statement

Students, hostels, labs, and small offices accumulate old electronics. Before discarding or handing over a device, they cannot confidently answer:

1. Is it repairable, and is repair worthwhile?
2. Is it still useful to someone else?
3. How do I remove personal/institutional data before reuse?
4. If it is at end-of-life, did it reach a responsible recycler?

The default is storage, informal disposal, or recycling before repair/reuse was considered. A generic marketplace helps transact material; it does not make the safer upstream decision or provide a campus audit trail.

### 3.2 Target personas

| Persona | Context | Need | Success |
|---|---|---|---|
| Student owner | Old phone/laptop in hostel | A simple, trustworthy next step | Safe handover in under 10 minutes |
| Collection volunteer | Running a campus drive | Fast, consistent intake | Labels 30 items without a paper register |
| IT administrator | Retires lab/office devices | Controlled disposition and reporting | Knows the status/destination of every item |
| Repair/refurbishment partner | Receives batch handovers | Accurate records and easy receipt confirmation | Confirms a receipt in seconds |
| Authorised recycler | Receives end-of-life devices | Clear, safe item record | Receives appropriate items without owner PII |

### 3.3 MVP boundary

Support exactly three categories:

- phones;
- laptops;
- power banks.

These are common on campuses, recognisable in photos, and have clear repair, reuse, and safety questions. No other category is added before the pilot proves the flow.

---

## 4. Vision, objectives, and non-goals

### Vision

Make the responsible choice for an old device the easiest choice: visible, safe, and accountable.

### Objectives

1. Recommend a safe next step for every submitted device.
2. Favour repair and reuse whenever evidence supports it.
3. Improve owner confidence around data privacy without false technical guarantees.
4. Record each transition from intake to final partner handover.
5. Let a small campus team run a drive without a spreadsheet.

### Pilot KPIs

| KPI | First-drive target | Measurement |
|---|---:|---|
| Devices processed | 30+ | Unique device records |
| Completed decisions | 100% | Assessment completed |
| Eligible diversion | 50%+ | Repair + reuse / non-safety devices |
| Accountable handovers | 60%+ | Partner receipt or owner-confirmed action |
| Median intake time | Under 5 minutes | Intake start to assessment finish |
| Safety routing | 100% | No flagged item receives normal reuse/recycle outcome |

### Non-goals

- Resale, auctions, scrap price comparison, payment, or pickup logistics.
- Remote wiping, forensic proof, or data-destruction certificates.
- Guaranteed repair pricing, electrical-safety certifications, or deep internal diagnostics.
- Nationwide compliance reporting.
- Replacing technicians, waste workers, or authorised recyclers.

---

## 5. Product principles and safety position

1. **Repair first; recycle last.** Recycling is not automatically the best outcome.
2. **Safety overrides automation.** Possible swelling, overheating, liquid damage, or exposed wiring always wins over AI/rules recommendations.
3. **AI assists; people decide.** AI extracts/suggests; users confirm; deterministic rules decide the initial outcome; admins control final disposition.
4. **Explain every decision.** Show evidence, rule, limitation, and next action.
5. **Privacy stays with the owner.** The app records a declaration only; it never says “we wiped your device.”
6. **No made-up impact.** Report confirmed item outcomes, not unverified CO2 numbers.
7. **Inclusive operations.** Support legitimate local repair, collection, refurbishment, and recycling partners rather than attempting to displace workers.

### Mandatory safety copy

> Stop using and do not charge this device. Keep it away from heat and combustible materials. Do not place it in household waste. Contact the campus coordinator or a qualified e-waste/battery handler for the next step.

This is a safety escalation, not professional or emergency advice.

---

## 6. Core journeys

### 6.1 Working phone → reuse/donation

1. Student selects **Phone**, submits front/back/label photos, and confirms extracted model.
2. They answer that it powers on, charges, and has a working screen; no safety issue is reported.
3. RebootRoute recommends **Reuse / Donate** and explains why.
4. Student completes backup, account sign-out, SIM/SD removal, and reset checklist.
5. App creates a QR receipt; a volunteer scans it at the collection drive.
6. Partner confirms receipt; the timeline becomes complete.

### 6.2 Swollen power bank → safety review

1. A volunteer photographs a bulging power bank.
2. The user-confirmed condition hint or checklist marks possible swelling.
3. The rules engine returns **Safety Review**; no ordinary repair/reuse/recycle path is offered.
4. Device receives a red QR label and admin-only assignment to a qualified partner.

### 6.3 Retired lab laptops → mixed batch

1. IT administrator bulk-adds six laptops with label photos.
2. Bounded faults (keyboard/charger) are marked **Repair**; incomplete/nonfunctional devices are **Recycle**.
3. Administrator can override after technician inspection, with a recorded reason.
4. They assign groups to partners and export the custody report.

---

## 7. Functional requirements

### 7.1 Identity and roles

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-01 | Guest submission with a short-lived intake session | Must | Owner can complete intake without creating an account |
| FR-02 | Roles: administrator, volunteer, partner | Must | API and UI restrict actions by role |
| FR-03 | Owner contact is optional | Must | Full intake works without email/phone |
| FR-04 | Admin approval required for partner accounts | Should | Unapproved partner cannot view devices |

### 7.2 Intake

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-10 | Phone, laptop, and power-bank flows | Must | Category selection controls correct checklist |
| FR-11 | Capture up to three photos per device | Must | Client compresses photo; private upload succeeds or retries |
| FR-12 | Capture category-specific fields | Must | Required questions differ per category |
| FR-13 | OCR suggests brand/model from label photo | Should | User can modify every extracted field |
| FR-14 | Explicit photo/data consent | Must | Upload cannot start without consent |
| FR-15 | Generate an unguessable device ID | Must | IDs are unique and non-sequential |

### 7.3 Assessment and decision

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-20 | Short, category-specific checklist | Must | No checklist contains more than seven questions |
| FR-21 | Ask direct safety questions | Must | Swelling, heat, liquid, exposed wires are supported |
| FR-22 | AI condition hints are editable | Should | User must confirm/dismiss every hint |
| FR-23 | Explainable outcome | Must | Outcome displays reasons, limits, confidence band, next action |
| FR-24 | Admin override with required note | Must | Original result is preserved in audit log |
| FR-25 | AI outage fallback | Must | Rules-only assessment completes when adapter fails |

### 7.4 3R and safety logic

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-30 | Any red flag → Safety Review | Must | It cannot receive a normal reuse/repair/recycle outcome |
| FR-31 | Bounded, non-hazard fault → Repair candidate | Must | Reason cites verified functional/condition inputs |
| FR-32 | Working device → Reuse/Donate candidate | Must | Decision includes privacy checklist |
| FR-33 | Non-repairable/non-reusable item → Recycle candidate | Must | Decision includes authorised-handover checklist |
| FR-34 | Confidence as Low/Medium/High | Should | No misleading precision percentage is shown |

### 7.5 Privacy, QR, and custody

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-40 | Phone/laptop privacy checklists | Must | Include backup, sign-out, SIM/SD removal, and reset guidance |
| FR-41 | Owner declaration—not wipe certification | Must | UI says “you confirmed,” never “we erased” |
| FR-42 | QR receipt after assessment | Must | QR opens a minimal privacy-safe receipt page |
| FR-43 | Custody statuses | Must | Submitted → reviewed → assigned → handed-over → partner-confirmed |
| FR-44 | Partner access is data-minimised | Must | Partner cannot access owner contact by default |

### 7.6 Administration and reporting

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-50 | Outcome/status dashboard | Must | Counts update after event changes |
| FR-51 | Queue filters | Should | Category, outcome, safety status, and partner filters work together |
| FR-52 | Partner assignment | Must | Assignment captures actor/timestamp |
| FR-53 | CSV custody export | Should | Export honours role permissions |
| FR-54 | Verified-outcomes dashboard | Must | Shows item counts, not speculative environmental savings |

---

## 8. Decision-engine specification

### Inputs

- category, model/brand, and estimated age;
- reported power/charging/display/accessory condition;
- direct safety answers;
- user-confirmed visible conditions;
- optional admin/technician note.

### Priority order

1. **Safety Review** if any safety flag exists.
2. **Reuse/Donate** if functional, no safety flag, and data-removal is feasible.
3. **Repair** if no safety flag and a bounded fault blocks reuse.
4. **Recycle** if reuse/repair is not reasonable.
5. **Manual Review** if key evidence is missing or contradictory.

### Baseline rules

| Category | Repair signals | Reuse signals | Recycle signals | Safety signals |
|---|---|---|---|---|
| Phone | Cracked screen, weak battery, charging-port issue; powers on | Power, charging, display/touch work; no account lock | Non-booting with no bounded fault; crucial parts absent | Swelling, strong heat, liquid/corrosion, exposed battery |
| Laptop | Keyboard, display, battery, or charger fault; powers on | Boots, display/keyboard work, reset possible | Non-booting/obsolete with multiple missing critical parts | Swelling, smoke/heat, liquid/corrosion, exposed wiring |
| Power bank | Manual technician review only | Intact and reliably charges/discharges | Fails charge/discharge or badly compromised | Swelling, heat, puncture, liquid damage, burn smell |

Power-bank repair is never recommended by the MVP.

### Explainability response

Every result includes:

- recommendation;
- up to three evidence bullets;
- a limitation statement;
- one clear next action;
- Low/Medium/High confidence;
- versioned rule ID.

### Overrides

Only an administrator can override. They select: technician inspected, institutional reuse need, partner cannot accept, input was wrong, or other with note. The original result and override event remain immutable.

---

## 9. AI: scope, limits, and evaluation

### AI features

| Feature | Input | Output | Human control |
|---|---|---|---|
| OCR | Product/serial-label photo | Candidate brand/model/visible text | User verifies/edits |
| Condition hints | Device image | Possible crack, casing damage, corrosion, swelling cue | User confirms/rejects hint |
| Explanation writer | Verified rule output | Clear non-technical explanation | Rules determine outcome, never the model |

### AI must not

- declare a device electrically safe;
- say a photo proves internal battery health;
- claim a wipe was performed;
- give repair instructions for damaged lithium batteries;
- predict exact repair/resale/carbon value.

### Fallback

If OCR/vision fails, intake continues with manual entry. If an explanation model fails, the UI renders deterministic rule text. No safety or intake flow depends on successful AI inference.

### Demo evaluation

Create a 12–20 photo consented test set across the three categories; manually label visible-damage/no-visible-damage. Report OCR correction rate, hint acceptance rate, and safety false negatives. Do not claim production safety-classifier performance.

---

## 10. UX requirements

### Design principles

- Mobile first; large controls; minimal typing.
- One decision per page, with plain language.
- Red/orange reserved for real safety states.
- Accessible contrast, keyboard operation, and errors not expressed only by colour.
- English-first architecture with localisation-ready copy.

### Essential screens

| Screen | User | Content | Primary action |
|---|---|---|---|
| Landing | Anyone | Repair-first promise, 3R story, drive CTA | Start assessment |
| Category picker | Owner/volunteer | Phone/laptop/power-bank cards | Choose category |
| Intake | Owner/volunteer | Photos, model, age, consent | Continue |
| Checklist | Owner/volunteer | Questions + condition confirmations | Get recommendation |
| Decision | Owner/admin | Outcome, why, limits, confidence, next action | Start required checklist |
| Privacy declaration | Owner | Backup/reset/sign-out/SIM guidance | Confirm declaration |
| QR receipt | Owner/volunteer | Item ID, status, no sensitive data | Save/share |
| Admin queue | Admin | Filtered list and controls | Review/assign |
| Device detail | Admin/partner | Assessment + custody timeline | Confirm handover |
| Dashboard | Admin | Counts, pending items, export | Export report |

### Required error states

- Camera denied → choose photo or continue manually.
- AI unavailable → manual checklist message.
- Network interruption → local draft and retry.
- Invalid QR → generic error without record data.
- Restricted role → access denied, not raw API error.

---

## 11. Technical architecture and stack

```text
React PWA
  │
Amplify Hosting OR S3 + CloudFront
  │
API Gateway + Cognito
  │
Lambda functions
  ├─ intake / uploads
  ├─ assessment rules
  ├─ AI adapter
  ├─ QR and custody
  └─ dashboard/reporting
  │
S3 (private images) ─ DynamoDB ─ EventBridge/SNS ─ CloudWatch
```

### Frontend

| Layer | Choice | Reason |
|---|---|---|
| Framework | React, TypeScript, Vite | Fast build and type safety |
| UI | Tailwind CSS + accessible primitives | Responsive, cohesive mobile UI |
| Forms | React Hook Form + Zod | Category validation and useful errors |
| Data | TanStack Query | Caching, retries, loading/error states |
| QR | `qrcode.react` or equivalent | Simple receipt generation |
| Drafts | IndexedDB/local storage | Resilient drive intake under weak networks |

### Backend and AWS

| Layer | Choice | Responsibility |
|---|---|---|
| Infrastructure | AWS SAM | Versioned, repeatable serverless deployment |
| API | API Gateway REST | Authenticated application endpoints |
| Runtime | Node.js 22 + TypeScript Lambda | Intake, rules, events, reports |
| Identity | Cognito groups | `ADMIN`, `VOLUNTEER`, `PARTNER` authorisation |
| Data | DynamoDB | Devices, assessment snapshot, partners, custody events |
| Images/exports | Private S3 | Photos and report files via short-lived URLs |
| Notifications | EventBridge + SNS | Assignment/reminder events |
| Observability | CloudWatch | Structured logs, metrics, error alarms |

### AI adapter boundary

```ts
interface AiAdapter {
  extractLabel(image: ImageRef): Promise<LabelCandidate[]>;
  suggestVisibleConditions(
    image: ImageRef,
    category: DeviceCategory
  ): Promise<ConditionHint[]>;
}
```

The adapter outputs suggestions only. The decision engine receives only user-confirmed values, which makes the core product provider-agnostic and safer.

### Environment configuration

```text
APP_ENV=development|staging|production
AWS_REGION=ap-south-1
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
DEVICES_TABLE_NAME=
CUSTODY_EVENTS_TABLE_NAME=
PARTNERS_TABLE_NAME=
DEVICE_IMAGES_BUCKET=
AI_ADAPTER_MODE=manual|mock|provider
PUBLIC_RECEIPT_BASE_URL=
```

No secrets are committed. Use environment configuration/Secrets Manager for provider credentials if an AI provider is enabled.

---

## 12. Data model

### Device

| Field | Type | Notes |
|---|---|---|
| `deviceId` | UUID | Public-safe non-sequential ID |
| `category` | enum | `PHONE`, `LAPTOP`, `POWER_BANK` |
| `brand`, `model` | optional string | User-verified after OCR |
| `estimatedAgeYears` | optional number | 0–20 range |
| `ownerContact` | optional encrypted string | Not shown to partners by default |
| `consentVersion` | string | Wording accepted at upload |
| `photoKeys` | string[] | Private S3 object keys |
| `status` | enum | Current custody stage |
| timestamps | ISO values | Created/updated tracking |

### Assessment

| Field | Type | Notes |
|---|---|---|
| `assessmentId`, `deviceId` | UUID | Identifiers |
| `responses` | JSON | Checklist answers |
| `confirmedConditions` | enum[] | Only user-confirmed observations |
| `safetyFlags` | enum[] | Safety inputs |
| `recommendedOutcome` | enum | `REPAIR`, `REUSE`, `RECYCLE`, `SAFETY_REVIEW`, `MANUAL_REVIEW` |
| `confidenceBand` | enum | `LOW`, `MEDIUM`, `HIGH` |
| `reasonCodes`, `rulesVersion` | strings | Reproducibility/explanation |
| `override` | optional JSON | Actor, reason, note, timestamp |

### Custody event and partner

| Entity | Required fields |
|---|---|
| Custody event | event ID, device ID, event type, actor role, partner ID if relevant, note, timestamp |
| Partner | partner ID, name, type (`REPAIR`, `REFURBISH`, `NGO`, `RECYCLER`), accepted categories, verification status, authorisation evidence reference |

### Storage and retention

- Photos: 90-day automatic deletion in pilot unless admin renews retention.
- Owner contact: successful handover + 30 days, then delete unless new consent exists.
- Custody audit events: retain one year.
- Public QR receipt: exposes no contact, raw serial, or image data.

---

## 13. API contract

Protected requests use Cognito JWTs. Images use S3 pre-signed URLs rather than direct API upload.

| Method | Route | Purpose | Allowed role |
|---|---|---|---|
| `POST` | `/uploads/presign` | Temporary image upload URL | Guest/volunteer/admin |
| `POST` | `/devices` | Create intake | Guest/volunteer/admin |
| `GET` | `/devices/{id}` | Read role-safe record | Admin; scoped partner; receipt token |
| `POST` | `/devices/{id}/assessment` | Submit checklist/get outcome | Guest/volunteer/admin |
| `POST` | `/devices/{id}/privacy-declaration` | Record owner declaration | Guest/volunteer/admin |
| `POST` | `/devices/{id}/assignments` | Assign partner | Admin |
| `POST` | `/devices/{id}/handover` | Record physical transfer | Volunteer/admin |
| `POST` | `/devices/{id}/receipt-confirmation` | Confirm partner receipt | Assigned partner/admin |
| `POST` | `/devices/{id}/override` | Change recommendation | Admin |
| `GET` | `/dashboard` | Counts/action queue | Admin |
| `GET` | `/reports/custody.csv` | Download export | Admin |
| `GET` | `/receipts/{publicToken}` | QR receipt | Public token only |

### Example assessment response

```json
{
  "deviceId": "dvc_8b0ce1",
  "outcome": "REUSE",
  "confidenceBand": "HIGH",
  "reasons": [
    "The phone powers on, charges, and has a working screen.",
    "No safety concern was reported or confirmed.",
    "Complete the data-removal checklist before handover."
  ],
  "limitations": [
    "This assessment cannot verify internal battery health or confirm your data was erased."
  ],
  "nextAction": "COMPLETE_PRIVACY_CHECKLIST",
  "rulesVersion": "2026-10-mvp-1"
}
```

---

## 14. Security, privacy, and safety

### Authentication and authorisation

- Cognito groups: `ADMIN`, `VOLUNTEER`, `PARTNER`.
- Guest receives only a short-lived intake/receipt token.
- Backend authorises every action; UI visibility never substitutes for API enforcement.
- Partners see only assigned devices and only necessary fields.

### Data protection

- Block all public S3 access; use short-lived pre-signed URLs.
- HTTPS in transit and managed encryption at rest.
- Never expose raw serial numbers/owner contact in QR receipts.
- Do not collect IDs, payment information, precise location history, or health data.
- Limit/sanitise free-text notes to prevent XSS and accidental PII leakage.

### Safety controls

- Hard safety flags override AI/normal recommendations.
- Volunteer cannot downgrade a safety status.
- Safety assignments require an administrator note.
- System never offers power-bank repair.
- Decisions state their limits prominently.

### Abuse controls

- Rate-limit guest upload/submission routes.
- Validate image MIME type, dimensions, size, and file signature.
- Generate unguessable receipt tokens; enable revoke/expiry.
- Audit all role changes, overrides, assignments, and receipt confirmations.

---

## 15. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Core mobile screens load in <3s on typical data; rules result in <5s excluding optional AI |
| Reliability | Manual checklist/rules work if AI is offline |
| Accessibility | Keyboard navigation, labels, large touch targets, non-colour-only errors |
| Compatibility | Latest Chrome Android and Safari iOS; responsive from 360px width |
| Observability | Request IDs, structured CloudWatch logs, upload/assessment error metrics, budget alarm |
| Maintainability | Shared TypeScript API types and versioned unit-tested rules |
| Cost | Fits Free Tier/credits for demo traffic; AWS budget alert enabled |

---

## 16. Testing and acceptance plan

### Unit tests

- Safety priority always wins.
- Correct required fields by category.
- Outcome rules across all meaningful input combinations.
- Every custody state transition creates an audit event.
- API role permissions.
- Public receipt redacts contact/serial/image data.

### Integration tests

- Pre-signed upload → device intake → assessment → QR receipt.
- Admin assignment → partner receipt → dashboard update.
- AI adapter timeout → manual fallback.
- Expired/revoked QR token exposes no information.

### Manual acceptance scenarios

| Scenario | Expected result |
|---|---|
| Working phone, no damage | Reuse/donate plus privacy declaration |
| Cracked-screen phone that powers on | Repair candidate unless another safety flag exists |
| Laptop with dead charger but otherwise functional | Repair candidate |
| Swollen power bank | Safety Review, no normal handover CTA |
| Missing required field | Form stops with clear inline error |
| OCR model is wrong | User can correct it |
| Partner opens unassigned item | Access denied |
| AI timeout | Full manual path completes |

### Demo checklist

- Use real, consented devices, not only stock images.
- Seed repair, reuse, recycle, and safety journeys.
- Reconcile dashboard counts with seeded records.
- Test deployed app in incognito and on a mobile browser.
- Verify receipt privacy before recording the video.

---

## 17. Four-day delivery plan

### Day 1: foundations and safety

- Finalise decision table and safety copy with a technician/repair contact where possible.
- Set up AWS account/project, budget alert, and SAM skeleton.
- Build category picker, image intake, manual checklist, and rules-only assessment.
- Implement Safety Review before any AI feature.

### Day 2: persistence and custody

- DynamoDB models, S3 upload, device records, and QR receipt.
- Cognito admin login, queue, assignment, and audit timeline.
- Seed demo partners and outcomes.

### Day 3: AI assist and experience

- Add OCR/condition-hint adapter behind manual fallback.
- Add confirmation UI for every hint.
- Build privacy declaration, CSV export, mobile polish, accessibility pass.

### Day 4: deploy and tell the story

- Deploy and test frontend/backend on AWS.
- Run a real-device dry run.
- Capture architecture/service evidence.
- Record demo, complete README, and write submission/blog materials.

### Scope-cut order

1. Remove AI vision/OCR before removing the deterministic decision path.
2. Remove partner login; retain admin-recorded partner receipt.
3. Remove CSV export; retain dashboard.
4. Reduce to phone + power bank if needed.
5. Never remove safety escalation, explanation, custody evidence, or AWS deployment.

---

## 18. Team responsibilities

| Role | Owns |
|---|---|
| Product/research | Technician/IT interview, decision rules, copy, pilot design, demo narrative |
| Frontend | Intake, decision, QR receipt, admin UX |
| Backend/cloud | SAM, Lambda/API, DynamoDB, Cognito, S3, deploy/monitoring |
| AI/data | OCR/vision adapter, test set, confidence/fallback evaluation |

Solo build order: **rules engine → intake → persistence → QR/custody → dashboard → AI hints**.

---

## 19. Three-minute demo script

| Time | Screen/action | Narrative |
|---:|---|---|
| 0:00–0:20 | Old-device drawer / drive | “A device should not become e-waste because its owner has no clear next step.” |
| 0:20–0:50 | Assess working phone | “A photo and short checklist produce an explainable repair/reuse/recycle recommendation.” |
| 0:50–1:15 | Reuse + privacy checklist | “This phone can help someone else after its owner removes their data.” |
| 1:15–1:40 | Swollen power bank | “Safety rules override AI: unsafe batteries never enter the normal collection flow.” |
| 1:40–2:10 | QR + custody timeline | “Every handover is recorded, not assumed.” |
| 2:10–2:35 | Admin dashboard | “The campus sees repair, reuse, recycling, and pending safety work in one place.” |
| 2:35–3:00 | AWS diagram + URL | “Deployed on AWS, RebootRoute lets a campus make repair-first e-waste handling practical today.” |

---

## 20. Submission deliverables

- Deployed app URL.
- Public repository with README, architecture diagram, setup/deployment guide, `.env.example`, and tests.
- Three-minute demo video.
- One-page problem/impact summary.
- AWS service list and relevant screenshots.
- Test results and clearly stated limitations.
- Short blog post: problem, build, AWS choices, lessons, next pilot.

README must cover: problem/user, 3R logic, AWS architecture, local setup, SAM deploy, decision rules/safety disclaimer, tests, seeded demo data, and limitations.

---

## 21. Risks, assumptions, and mitigations

| Risk or assumption | Mitigation |
|---|---|
| No live downstream partner | Recruit one local contact; otherwise label all partner records demo-only |
| AI misses damage | Direct safety questions, human confirmation, hard safety rules, manual review |
| User believes app erased data | Repeated declaration language; no wipe certificate claim |
| Marketplace feature creep | Explicitly exclude prices, payments, pickups, bids, and buyer matching |
| AI setup takes too long | Rules-first build and provider-independent adapter |
| Weak environmental claim | Show actual outcome/custody counts only |
| Personal information appears in photo | User guidance, private storage, retention limit, no public photo URLs |

---

## 22. Future roadmap

### Pilot iteration

- Technician inspection notes and actual repair outcomes.
- Partner capacity/accepted-category information.
- Drive scheduling, collection-volunteer assignments, Hindi localisation.

### Longer-term product

- Verified donation matching with schools/NGOs.
- Institutional asset-inventory imports.
- Repairability analytics by device type/age.
- Auditable downstream outcome documentation.

### Questions deferred beyond the MVP

- Local partner verification process and legal requirements.
- Whether repair-price data is dependable enough to show users.
- AI model/privacy/cost trade-offs for production.
- Compliance reporting needs after a campus pilot.

---

## 23. Definition of done

The MVP is done when a person can photograph one supported device, complete a safety-aware assessment, receive an explained Repair/Reuse/Recycle/Safety outcome, receive a privacy-safe QR receipt, and have an administrator record its partner handover—all through a deployed AWS application.

This proves a meaningful Waste & Energy intervention: usable devices are not treated as disposable, hazardous devices are escalated, and a campus can see the outcome of its e-waste drive.

---

## References

- [Environmental Hacks — WeMakeDevs](https://www.wemakedevs.org/aws/env): Waste & Energy track, e-waste/informal-recycler examples, AWS eligibility, and judging criteria.
- [CPCB — Guidelines for Recyclers and Refurbishers](https://cpcb.nic.in/uploads/Projects/E-Waste/Guidelines_Environmentally_Sound_Recycling_E-Waste.pdf): refurbishment-handling context.
- [CPCB Solid Waste Management portal](https://swm.cpcb.gov.in/): source-segregation context.
