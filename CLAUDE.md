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

These rules govern how the `pricing` section is generated. They live in `src/lib/prompts.ts` and must be preserved when editing prompts.

### Provider Category Selector

Users select one provider category before generating. The selected category strongly controls the quote range. The AI generates **Low / Recommended / High estimates for the selected category only** — not a three-column comparison.

### Provider Types

| Provider | Overhead | Profile |
|----------|----------|---------|
| **Freelancer** | Low | Solo operator, independent contractor. Lean delivery, direct communication, minimal PM overhead. 40–65% of agency rates. |
| **Small Business** | Moderate | Small team, boutique firm, local agency. More structure, support, revisions. 60–80% of agency rates. |
| **Corporation / Agency** | High | Established agency, larger firm. PM, QA, documentation, formal process. Full market rates. |

### Complexity Classification

| Level | Indicators |
|-------|-----------|
| **Simple** | Clear scope, few deliverables, standard process, low risk |
| **Moderate** | Some complexity, multiple deliverables, coordination required |
| **Complex** | Many moving parts, integrations, specialized expertise, higher risk |
| **Enterprise** | Large scope, compliance, formal processes, multi-team delivery |

### Pricing Calibration Table (MUST USE)

| Complexity  | Freelancer          | Small Business       | Agency                  |
|-------------|---------------------|----------------------|-------------------------|
| Simple      | $500 – $2,500       | $1,500 – $5,000      | $5,000 – $15,000        |
| Moderate    | $2,500 – $8,000     | $6,000 – $15,000     | $12,000 – $30,000       |
| Complex     | $7,500 – $18,000    | $15,000 – $35,000    | $30,000 – $75,000       |
| Enterprise  | Scope down to MVP   | $35,000 – $75,000    | $75,000 – $150,000+     |

### Pricing Derivation Order

1. Read the selected provider category from the form input
2. Classify complexity (Simple / Moderate / Complex / Enterprise)
3. Assess confidence (High / Medium / Low) — flag missing information
4. Look up the calibration range for [selected category] × [complexity]
5. Generate Low / Recommended / High within that range
6. Only exceed the upper bound if explicit scope makes it unavoidable — state why

### Critical Rules

- **Do not inflate Freelancer quotes.** A Freelancer is never priced like an agency.
- **Freelancer + Enterprise complexity** → recommend phased MVP, price Phase 1 only within Complex range.
- **Do not auto-classify as Enterprise** unless the document explicitly requires compliance, large integrations, or large-scale deployment.
- **Only estimate current scope.** Future roadmap items → `Future Opportunities` section only.
- **Vague requirements = lower confidence, NOT higher price.**

### CampusCore Calibration Anchor

Complex project (auth, RBAC, dashboards, file uploads, OCR, search, deployment, training):

| Provider | Range |
|----------|-------|
| Freelancer | $7,500–$22,000 (Low $7.5K–$10K | Rec $10K–$16K | High $16K–$22K) |
| Small Business | $15,000–$40,000 |
| Agency | $30,000–$75,000 |
