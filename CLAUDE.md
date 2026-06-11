# AI Proposal Generator

Upload a client requirements PDF → generate project scope, timeline, quote, contract draft, and discovery questions.

## Rules
Detailed rule specs live in `.cursor/rules/`:

| File | Scope | Covers |
|------|-------|--------|
| `core-behavior.mdc` | always | Think, simplify, surgical changes, verify |
| `project-context.mdc` | always | Stack, structure, commands, data flow, architecture |
| `ai-generation.mdc` | auto: `lib/claude.ts`, `lib/prompts.ts`, `api/**` | Prompts, streaming, JSON output shape |
| `data-handling.mdc` | auto: `lib/pdf.ts`, `api/**`, `.env*` | PDF validation, size limits, secrets |

## Proposal Estimation Engine Rules

These rules govern how the quote section is generated. They live in `src/lib/prompts.ts` and must be preserved when editing prompts.

### Provider Types

Three provider types shape all pricing. Selected by the user before generation; passed as `providerType` in the form data.

| Provider | Rate Range | Blended Rate | Profile |
|----------|-----------|-------------|---------|
| `independent` | $50–$100/hr | ~$65–75/hr | Solo AI-assisted engineer. Uses Claude Code, managed services, existing frameworks. No team overhead. Lean estimates. |
| `consultant` | $100–$175/hr | ~$125–150/hr | Experienced freelancer or small firm. More planning, testing, documentation, and support. |
| `agency` | $175–$300/hr | ~$200–250/hr | Team engagement with PM, QA, formal process. Significantly higher due to overhead. |

**Independent Builder estimates must be meaningfully lower than agency estimates.** Do not inflate independent estimates to match agency norms.

### Complexity Scoring

13 factors, each scored 0–3 (max: 39). Score every factor that appears in the requirements:

Authentication · User Roles/Permissions · Dashboards · File Uploads · OCR · Search · AI/ML · Integrations · Security · Compliance · Deployment · Data Migration · Training

Derive **Complexity Rating** (Low/Medium/High/Very High), **Risk Level**, and **Confidence** from the total score.

### Three-Tier Output (always generate all three)

- **Low — Lean MVP**: fastest implementation, must-haves only, deliberate trade-offs named
- **Recommended — Production-Ready**: best balance of speed, quality, security, maintainability — lead with this
- **High — Polished + Buffer**: additional testing, documentation, scalability, implementation buffer

### Special Rules

- **Only estimate what is in the current scope.** Future roadmap items → `Future Opportunities` section only; never in Phase 1 pricing.
- **Sensitive data** (healthcare/HIPAA, education/FERPA, finance/PCI, legal) → add security hardening and compliance review time.
- **Explain the estimate**: reference the complexity score and key factors that drive cost.
- **Do not deflate or inflate artificially.** Favor realistic numbers for each provider type.

### Calibration Reference

CampusCore-style project (auth, RBAC, dashboards, file uploads, OCR, search, deployment, training):

| Provider | Range |
|----------|-------|
| Independent Builder | $6,000–$12,000 |
| Mid-Level Consultant | $12,000–$22,000 |
| Agency | $25,000–$50,000+ |
