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

## Pricing Derivation Order

Pricing must be derived from project complexity first. Never begin with hourly rates.

Determine in this order:

1. **Industry** — what sector and service type is this?
2. **Complexity** — how hard is the work?
3. **Scope** — what exactly will be delivered?
4. **Deliverables** — what tangible outputs does the client receive?
5. **Risk** — what unknowns could expand effort?

Then estimate effort. Then generate:

- **Low Estimate** — lean, minimum viable, deliberate trade-offs named
- **Recommended Estimate** — professional standard, right balance of quality and cost
- **High Estimate** — premium, additional polish, full risk buffer

Then map those estimates to market pricing for the detected industry. Only after pricing has been established should the proposal sections be written.

---

## Proposal Estimation Engine Rules

These rules govern how the `pricing` section is generated. They live in `src/lib/prompts.ts` and must be preserved when editing prompts.

### Pricing Philosophy

ProposalAI generates **provider-based pricing comparisons** — not a single "correct" price.

The core question is: *"What would different types of providers realistically charge for this project?"*

Users never select a provider type. The AI always generates all three perspectives automatically.

### Provider Types

| Provider | Overhead | Profile |
|----------|----------|---------|
| **Freelancer** | Low | Solo operator, independent consultant, or one-person business. Lean delivery, direct communication, fast decisions, minimal PM overhead. |
| **Small Business** | Moderate | Boutique agency, small firm, or small consulting team. More structure, dedicated support, additional revisions, moderate overhead. |
| **Agency** | High | Established agency, larger firm, or enterprise-focused provider. Formal PM, QA, dedicated account management, documentation, larger delivery teams. |

**Pricing relationship:** Freelancer rates are typically 40–65% of Agency rates for equivalent scope. Small Business rates are typically 60–80% of Agency rates.

### Complexity Classification

Classify every project into one of four levels:

| Level | Indicators |
|-------|-----------|
| **Simple** | Clear scope, few deliverables, standard process, low risk |
| **Moderate** | Some complexity, multiple deliverables, coordination required |
| **Complex** | Many moving parts, integrations, specialized expertise, higher risk |
| **Enterprise** | Large scope, compliance requirements, formal processes, multi-team |

### Pricing Derivation Order

1. Determine industry and service type from the uploaded document
2. Classify complexity (Simple / Moderate / Complex / Enterprise)
3. Assess confidence (High / Medium / Low) — flag missing information that affects the estimate
4. Estimate likely scope and effort
5. Generate three provider-perspective ranges: Freelancer / Small Business / Agency
6. Map to market rates for the detected industry and region
7. Write all other proposal sections using the established pricing as context

### Three-Provider Output (always generate all three)

- **Freelancer**: Solo/lean delivery, lower overhead, direct communication
- **Small Business**: More structure, support, and revisions, moderate overhead
- **Agency**: Full process, PM, QA, documentation, enterprise-ready delivery

### Special Rules

- **Only estimate the current scope.** Future roadmap items → `Future Opportunities` only; never in current pricing.
- **Do not inflate estimates.** Do not assume enterprise requirements unless explicitly stated in the document.
- **Sensitive data** (HIPAA, FERPA, PCI, legal) → add compliance and security line items across all three tiers.
- **Explain the estimate**: reference the complexity classification and key cost drivers.

### Calibration Reference

Software project (auth, RBAC, dashboards, file uploads, OCR, search, deployment, training):

| Provider | Range |
|----------|-------|
| Freelancer | $8,000–$15,000 |
| Small Business | $15,000–$28,000 |
| Agency | $30,000–$60,000+ |
