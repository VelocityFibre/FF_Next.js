# Procurement Portal Module — Fibre Construction (v1.1)

*Version 1.1.0 | 22 Aug 2025*

---

## Changelog (v1.1)
- **Project-Scoped Objects:** Every **project has its own** BOQ, RFQ, quotes, awards, POs, stock ledger, issues, returns, and reports. Cross-project visibility is restricted unless explicitly granted. 
- **RBAC (Phaseable):** Added design to implement **Role-Based Access Control** so only authorised staff can access the Procurement Portal and project objects. Supplier Portal access remains supplier-scoped.

---

## Executive Summary

### Product Vision
Create a single, **project-scoped**, BOQ-driven procurement portal that turns Excel take-offs into RFQs, orchestrates supplier collaboration, and tracks stock movements from supplier → warehouse/site → contractor → return/transfer — with full auditability and real-time visibility.

### Mission Statement
Reduce material cost, lead-time risk, and project delays by digitising the full source-to-site lifecycle for fibre builds (FTTH/FTTB/MDU/Backhaul), **per project**.

### Strategic Goals
1. **Cycle Time**: Cut RFQ-to-award lead time by 40%.
2. **Cost**: Achieve ≥8% savings via competitive quoting & volume bundling (optional later).
3. **Visibility**: 100% line-level traceability of materials and cable lengths.
4. **Compliance**: Enforce approvals, audit trails, and supplier documentation.
5. **Uptime**: 99.9% availability for the supplier portal.
6. **Access Control**: Gate procurement features behind RBAC with project-level scopes.

---

## 1. Product Overview

### 1.1 Problem Statement
**Current challenges**
- Spreadsheet-driven BOQs cause mismatched catalog items, double ordering, and low quote comparability.
- RFQs happen over email/WhatsApp, with poor auditability and inconsistent formats.
- Supplier lead times & stock positions are opaque; changes surface too late.
- Stock movements (drums, closures, connectors) lack meter-level and lot/serial traceability.
- Returns and inter-project transfers are manual, slow, and error-prone.
- Access is not restricted by role/project; risk of leakage and errors.

**Market need**
- **Per-project** BOQ import focusing only on items present in the Excel take-off.
- Line-item RFQs with structured price/lead-time/capacity data from suppliers.
- A supplier portal per invited RFQ to submit quotes and maintain stock & lead times.
- Robust stock movement (ASN → GRN → issues → returns → transfers) with project isolation.
- Role-based access to limit procurement to authorised staff and specific projects.

### 1.2 Solution Overview
- **Smart BOQ Import & Mapping (Project-Scoped)**: Excel ingest into a project’s own demand bucket; exceptions queue.
- **RFQ Management (Project-Scoped by Default)**: Multi-supplier RFQs per project; alternates/equivalents; auto-compare.
- **Supplier Portal**: Secure supplier access to invited project RFQs; structured quote entry; lead times; messaging; docs.
- **Award → PO (Project-Scoped)**: Weighted evaluation, approvals, PO generation, framework pricing.
- **Logistics & Stock Movements (Project-Scoped)**: ASN, GRN, cable-drum meter tracking, site issues, returns, transfers with dual-ledger entries when projects move stock between each other.
- **Reporting**: Savings, cycle time, supplier OTIF, stock ageing, budget variance **by project**.
- **RBAC**: Gate procurement access; project-level permissions; supplier tenant isolation.

### 1.3 Target Users
**Primary**
- **Procurement Manager/Buyer** — runs RFQs, evaluates, awards, raises POs on assigned projects.
- **Project Manager** — submits/approves BOQs, tracks delivery & budget for their projects.
- **Site Store/Materials Controller** — receives, issues, returns, transfers on assigned projects/sites.
- **Supplier (Portal User)** — submits quotes, confirms lead times/stock, ASNs for invited project RFQs only.

**Secondary**
- **Finance/AP** — 3-way match, tax/VAT handling, accruals.
- **QS/Engineering** — item equivalencies, technical approvals.
- **Contractor Foreman** — requests issues, records returns (if allowed per role).

---

## 2. Functional Requirements

### 2.1 Project Scoping & Access

#### REQ-PROJ-001: Project-Scoped Domain Model
- **Description:** All procurement objects are **tied to a single project** via `project_id`. Default behaviour is strict isolation: users see and act only on projects they are assigned to through RBAC.
- **Objects:** BOQ, RFQ, Quotes, Awards, POs, ASNs, GRNs, Issues, Returns, Transfers, Reports, Messages, Attachments.
- **Acceptance:**
  - Creating or viewing any object requires `project_id` permission.
  - Inter-project transfer creates two entries (out/in) affecting each project’s ledger separately.
  - Supplier Portal displays only invited RFQs for the specific project; no cross-project leakage.

#### REQ-PROJ-002: Optional Cross-Project Sourcing (Later/Config Off by Default)
- **Description:** Enable “program-level” RFQs that reference multiple projects **without** breaking project isolation for awards/POs and stock ledgers.
- **Acceptance:**
  - Feature-flagged; off by default.
  - If enabled, each RFQ line still carries a `project_id`; award and PO issuance remain project-specific.

### 2.2 Core Features

#### REQ-CORE-001: BOQ Excel Import & Catalog Mapping (Project-Scoped)
- **Description:** Import a project BOQ from Excel; **only** create demand for items present in the file, for that project.
- **Specs:** .xlsx/.csv; template: `ItemCode/Description/UoM/Qty/Phase/Task/Site`. Fuzzy mapping; reviewer queue; UoM & pack validation.
- **Acceptance:** ≥95% auto-mapping; exceptions resolvable; audit log; demand created in the target project only.

#### REQ-CORE-002: RFQ Creation & Distribution (Project-Scoped by Default)
- **Description:** Convert project demand into RFQs; invite suppliers; sealed bidding; Q&A with addenda.
- **Acceptance:** RFQ created in ≤5 clicks from a project BOQ; status/deadline visible; supplier notifications; Q&A audited.

#### REQ-CORE-003: Supplier Portal (Per-Project Invitations)
- **Description:** External portal for suppliers to review invited **project** RFQs/BOQs, submit quotes, update lead times/stock, and communicate.
- **Acceptance:** Supplier submits complete quotes tied to the project RFQ; alternates flagged for technical review.

#### REQ-CORE-004: Quote Evaluation & Award (Project-Scoped)
- **Description:** Compare quotes on price/lead time/quality; support split awards **within the project**; alternates need technical approval.

#### REQ-CORE-005: Purchase Orders & Contracts (Project-Scoped)
- **Description:** Issue POs from awards; budget checks by project; taxes/currency; supplier acknowledgment.

#### REQ-CORE-006: Logistics & Stock Movements (Project-Scoped Ledger)
- **Description:** ASN → GRN → Issues → Returns → Transfers, all tied to a project ledger. Transfers create `TRANSFER_OUT` in source project and `TRANSFER_IN` in destination project.
- **Cable Drums:** Track remaining meters per drum; accuracy ±1m (configurable).

#### REQ-CORE-007: Communications & Notifications
- Threaded, contextual; linked to project objects; email/in-app alerts; audit trail.

#### REQ-CORE-008: Reporting & Analytics (Per-Project by Default)
- Dashboards and exports scoped to project; program view requires elevated RBAC.

### 2.3 RBAC (Phaseable)

#### REQ-SEC-001: Role-Based Access Control (Portal Gating)
- **Description:** Implement RBAC to restrict Procurement Portal access to authorised staff and restrict object access by project.
- **Roles (initial set):** `Admin`, `Procurement Manager`, `Buyer`, `Project Manager`, `Store Controller`, `Finance`, `Read-Only`, `Supplier` (external tenant role).
- **Scopes:** Project-level grants (e.g., `Buyer@Project:A`, `PM@Project:B`). Optional site/task sub-scopes later.
- **Permissions (examples):**
  - View/Create/Edit **BOQ** (project): Admin/PM/Buyer (create); Read-only (view).
  - Issue **RFQ** (project): Buyer/PM.
  - Evaluate/Award (project): Buyer (prepare), PM/Finance (approve by threshold).
  - Issue **PO** (project): Buyer (draft), Finance (release) per policy.
  - Post **GRN/Issue/Return/Transfer** (project): Store Controller.
- **Admin Mapping:** SSO group → Role; manual overrides per project.
- **Audit:** All RBAC changes logged with actor/time/diff.
- **Acceptance:**
  - Unauthorised users cannot access Procurement Portal or project objects.
  - Users see only assigned projects; actions blocked without permissions.

---

## 3. Data Requirements

**Input:** Project BOQs, supplier quotes, ASNs, compliance docs, receipts, returns.

**Output:** Awards, POs, GRNs, stock ledgers, audit logs, per-project reports.

**Storage:** PostgreSQL (OLTP), S3-compatible objects, Redis (cache), optional ClickHouse (BI). Retention 7+ years; immutable audit logs.

**Multitenancy:** Supplier tenant isolation; project isolation for internal users via RBAC.

---

## 4. API (Project-Scoped Paths)

- **BOQ Import**  
  `POST /api/v1/projects/{projectId}/boqs/import` → { importId, mappedLines, exceptions }

- **RFQs**  
  `POST /api/v1/projects/{projectId}/rfqs`  
  `GET  /api/v1/projects/{projectId}/rfqs/{id}`  
  `POST /api/v1/projects/{projectId}/rfqs/{id}/invite-suppliers`  
  `POST /api/v1/projects/{projectId}/rfqs/{id}/close`

- **Supplier Quotes (Portal)**  
  `POST /api/v1/suppliers/{supplierId}/projects/{projectId}/rfqs/{rfqId}/quotes`

- **Awards & POs**  
  `POST /api/v1/projects/{projectId}/rfqs/{id}/evaluate`  
  `POST /api/v1/projects/{projectId}/awards/{id}/purchase-orders`

- **Logistics**  
  `POST /api/v1/projects/{projectId}/asn`  
  `POST /api/v1/projects/{projectId}/grn`  
  `POST /api/v1/projects/{projectId}/stock/issues`  
  `POST /api/v1/projects/{projectId}/stock/returns`  
  `POST /api/v1/projects/{projectId}/stock/transfers`

- **RBAC**  
  `POST /api/v1/rbac/roles`  
  `POST /api/v1/rbac/projects/{projectId}/assignments`  
  `GET  /api/v1/rbac/projects/{projectId}/me/permissions`

All endpoints: JWT (internal), magic-link/OAuth (suppliers); idempotency keys; OpenAPI docs.

---

## 5. Technical Specifications

**Backend:** TypeScript + NestJS (or Python + FastAPI)

**DB:** PostgreSQL 16; Redis; S3; optional ClickHouse

**Queue/Event Bus:** RabbitMQ/Kafka (events carry `project_id`)

**Frontend:** React + Vite; shadcn/ui; Tailwind; Supplier Portal as separate SPA

**Infra:** Docker; K8s/ECS; GitHub Actions; OpenTelemetry; Prometheus/Grafana; Sentry

**Security:** TLS 1.3; AES-256 at rest; field-level encryption (banking docs); OWASP; WORM audit logs

---

## 6. Non-Functional Requirements

- **Performance:** p95 API < 250 ms; RFQ compare (5 suppliers × 1k lines) < 5 s.
- **Scalability:** Horizontal API nodes; queue jobs; partitioning by `project_id`.
- **Availability:** 99.9%; read-only maintenance.
- **Reliability:** Outbox pattern; retries; circuit breakers.
- **Usability:** WCAG 2.1 AA; responsive; inline validations; Excel templates.
- **Access Control:** RBAC enforcement at API & UI; project filte