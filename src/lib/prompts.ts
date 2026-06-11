import type { ProviderType } from '@/types';

interface ProviderContext {
  label: string;
  rateRange: string;
  blendedRate: string;
  characteristics: string;
  pricingPhilosophy: string;
  lowRate: string;
  recRate: string;
  highRate: string;
}

const PROVIDER_CONTEXTS: Record<ProviderType, ProviderContext> = {
  independent: {
    label: 'Independent Builder (AI-Assisted Freelancer)',
    rateRange: '$50–$100/hr',
    blendedRate: '~$65–75/hr',
    lowRate: '$55/hr',
    recRate: '$70/hr',
    highRate: '$85/hr',
    characteristics:
      'Solo engineer using Claude Code and modern AI tooling. Leverages managed services, existing frameworks, APIs, and templates to minimize build time. No team overhead, no PM layer.',
    pricingPhilosophy:
      'Lean and realistic. AI-assisted development significantly compresses hours — do not inflate estimates to match agency norms. Favor managed services (Auth0, Supabase, Vercel, etc.) that eliminate boilerplate. Be honest: an independent builder will genuinely cost less than an agency for equivalent output.',
  },
  consultant: {
    label: 'Mid-Level Consultant',
    rateRange: '$100–$175/hr',
    blendedRate: '~$125–150/hr',
    lowRate: '$110/hr',
    recRate: '$135/hr',
    highRate: '$160/hr',
    characteristics:
      'Experienced freelancer or small consultancy with strong engineering background. Includes more thorough planning, testing, documentation, and post-launch support. May engage a part-time collaborator for specific tasks.',
    pricingPhilosophy:
      'Thorough and professional. Add appropriate hours for architecture planning, code review, documentation, integration testing, and 30-day post-launch support. More predictable delivery with fewer surprises.',
  },
  agency: {
    label: 'Agency',
    rateRange: '$175–$300/hr',
    blendedRate: '~$200–250/hr (blended team rate)',
    lowRate: '$185/hr',
    recRate: '$220/hr',
    highRate: '$275/hr',
    characteristics:
      'Multiple team members including dedicated PM, senior engineers, QA engineer, and possibly UX. Formal processes: sprint planning, stand-ups, QA cycles, client reporting, handoff documentation.',
    pricingPhilosophy:
      'Team-based with process overhead. Include PM coordination, team meetings (~10–15% overhead), formal QA cycles, client-facing reporting, comprehensive handoff docs, and SLA-backed support. Agency estimates are genuinely higher — do not artificially compress them.',
  },
};

export function buildProposalPrompt(
  requirements: string,
  providerType: ProviderType = 'independent',
): string {
  const ctx = PROVIDER_CONTEXTS[providerType];

  return `You are a senior project consultant generating a complete professional proposal. The selected provider type is:

**${ctx.label}** | Rate range: ${ctx.rateRange}
${ctx.characteristics}

CRITICAL: Output ONLY the five XML-tagged sections below. No text before <scope> or after </questions>.

<scope>
Write a complete Project Scope section:
- **Executive Summary** (2–3 sentences: what is being built, for whom, and the core outcome)
- **Key Deliverables** (numbered list of 5–8 specific, measurable deliverables for the CURRENT scope only — exclude roadmap items)
- **Technical Approach** (methodology and key technology choices appropriate for a ${ctx.label})
- **In Scope** (explicit bullet list of what IS included in this engagement)
- **Out of Scope** (bullet list of what is NOT included — critical for preventing scope creep. If any future features are mentioned in the requirements, list them here as out of scope for Phase 1)
- **Assumptions** (3–5 assumptions underlying this proposal)
</scope>

<timeline>
Write a phased Project Timeline:
- 3–5 logical phases with phase name, duration in weeks, key activities, and the milestone/deliverable
- Markdown table:

| Phase | Duration | Key Activities | Milestone |
|-------|----------|---------------|-----------|

- Total estimated duration
- Adjust phase length and activities appropriately for a ${ctx.label} (e.g., agency includes sprint ceremonies; independent builder moves faster with AI tooling)
- Note that timeline assumes 48–72 hour client feedback turnaround
</timeline>

<quote>
Generate a detailed, realistic pricing analysis calibrated for a **${ctx.label}**.

Pricing philosophy: ${ctx.pricingPhilosophy}

---

### Complexity Analysis

Evaluate each factor present in the requirements. Score: 0 = not present, 1 = simple, 2 = moderate, 3 = complex.

| Complexity Factor | Score (0–3) | Notes |
|-------------------|------------|-------|
| Authentication & Login | | |
| User Roles & Permissions | | |
| Dashboards & Analytics | | |
| File Uploads & Storage | | |
| OCR / Document Processing | | |
| Search Functionality | | |
| AI / ML Features | | |
| Third-party Integrations | | |
| Security Requirements | | |
| Compliance (HIPAA / FERPA / PCI / etc.) | | |
| Deployment & Infrastructure | | |
| Data Migration | | |
| Training & Onboarding | | |

**Total Complexity Score:** [X] / 39
**Complexity Rating:** [Low | Medium | High | Very High]
**Risk Level:** [Low | Medium | High]
**Confidence:** [brief assessment — e.g., "High — requirements are detailed and well-scoped"]

> **Sensitive Data Note:** If this project involves healthcare, education, financial, legal, or other sensitive data, note here that additional security hardening, compliance review, and audit-trail time has been included in the estimates.

---

### Hours Estimate

Based on the complexity analysis above, estimate realistic hours for a **${ctx.label}**:

**Estimated Hours Range:** [low]–[high] hours

[Provide 3–5 sentences explaining the reasoning: what complexity factors drive the hours, how the provider type affects the estimate, what assumptions are baked in, and what could push toward the high end]

---

### Three-Tier Pricing

| Tier | Est. Hours | Rate | Total |
|------|-----------|------|-------|
| **Low — Lean MVP** | | ${ctx.lowRate} | |
| **Recommended — Production-Ready** | | ${ctx.recRate} | |
| **High — Polished + Buffer** | | ${ctx.highRate} | |

**🟢 Low — Lean MVP**
[Describe exactly what is included and what is deliberately cut or deferred to reach this price. Be specific about trade-offs.]

**🔵 Recommended — Production-Ready** *(lead with this)*
[Describe what makes this the right balance: what's production-grade, what's tested, what's documented. Explain why this is the estimate to present to the client. This should be a fully shippable, maintainable product.]

**🟣 High — Polished + Buffer**
[Describe what extra is included: additional test coverage, performance tuning, stronger documentation, onboarding materials, extra revision rounds, or implementation buffer for unknowns.]

*In 2–3 sentences: explain why these specific numbers are appropriate for a ${ctx.label} on this project, referencing the complexity score and key factors that drive cost.*

---

### Phase Breakdown

Align with the timeline phases. Use the **Recommended** estimate hours.

| Phase | Description | Est. Hours | Cost |
|-------|-------------|-----------|------|

**Total (Recommended):** $[X,XXX]

---

### Suggested Payment Schedule

Based on the **Recommended** estimate:
- **50%** on contract signing — $[X,XXX]
- **25%** at [key milestone from timeline] — $[X,XXX]
- **25%** on final delivery and sign-off — $[X,XXX]

*Quote is valid for 30 days. Final pricing confirmed after discovery call.*

---

### Future Opportunities

*Include this section ONLY if the requirements mention features intended for a future phase or roadmap beyond the current scope.*

[List any future-phase features mentioned in the requirements as separate line items with rough additional investment. Make clear these are NOT included in Phase 1 above.]

*If the requirements contain no future-phase items, omit this section entirely.*
</quote>

<contract>
Write a Service Agreement template. Start with: "*⚠️ TEMPLATE ONLY — Have this reviewed by a qualified attorney before signing.*"

Number and write each clause:
1. Parties & Effective Date
2. Services & Deliverables (reference the scope)
3. Fees & Payment Terms (reference the payment schedule from the quote)
4. Project Timeline
5. Intellectual Property (client owns all deliverables upon final payment)
6. Confidentiality (mutual)
7. Revisions (2 rounds included per deliverable; additional billed at hourly rate)
8. Termination (14 days written notice; client pays for all work completed to date)
9. Limitation of Liability (capped at total fees paid; no consequential damages)
10. Independent Contractor (provider is not an employee)
11. Governing Law ([JURISDICTION])

End with a signature block for both parties with date lines.
</contract>

<questions>
Write exactly 15 numbered Discovery Questions organized into 5 categories (3 questions each):

**Business Goals & Success Criteria**
**Technical Requirements & Constraints**
**Stakeholders, Process & Communication**
**Timeline, Budget & Constraints**
**Existing Assets & Dependencies**

Format each question as:
**N. [Question]**
*Why this matters: [one sentence explaining the impact on scope, timeline, or cost]*
</questions>

CLIENT REQUIREMENTS DOCUMENT:
${requirements}`;
}
