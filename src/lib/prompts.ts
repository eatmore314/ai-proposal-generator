import type { AdvancedOptions } from '@/types';

/* ── Market rate calibration reference ── */
const MARKET_RATES = `
Agency-level market rates by industry (use as the high-end anchor; derive Freelancer and Small Business from multipliers below):
- Software / web development: projects $15K–$250K+ | $150–300/hr
- Mobile app development: $20K–$200K depending on complexity
- Digital marketing: $3,000–$15,000/month retainer | $5K–$80K per campaign
- SEO / content marketing: $1,500–$8,000/month
- Social media management: $1,500–$6,000/month
- Video production (corporate): $5,000–$60,000 per project
- Video production (commercial/broadcast): $20,000–$300,000+
- Photography: $500–$5,000 per shoot | $150–500/hr
- Graphic design / branding: $3,000–$80,000 per project
- UX / UI design: $8,000–$100,000 per project
- Copywriting: $1,000–$20,000 per project
- Management consulting: $10,000–$300,000+ per engagement
- IT consulting / infrastructure: $10,000–$150,000 per engagement
- Business coaching: $2,000–$8,000/month retainer
- Construction (residential): $150–$500/sq ft + materials
- Construction (commercial): $100–$400/sq ft + materials
- General contractor / renovation: $20,000–$500,000+ per project
- Interior design: $10,000–$150,000 per project
- Landscape / hardscape: $5,000–$80,000 per project
- Event planning: 20–25% of event budget | $5,000–$50,000
- Accounting / bookkeeping: $500–$4,000/month
- Legal services: $5,000–$100,000+ per engagement
- PR / communications: $4,000–$15,000/month retainer
- Recruiting / HR consulting: $10,000–$80,000 per engagement

Provider type pricing multipliers (apply to agency rates above):
- Freelancer: 40–65% of agency rate (lower overhead, direct delivery, lean process)
- Small Business: 60–80% of agency rate (moderate overhead, more structure than freelancer)
- Agency: 100% — full market rate (formal PM, QA, documentation, larger teams)
`.trim();

function buildOverrides(opts: AdvancedOptions): string {
  const lines: string[] = [];

  if (opts.industryOverride.trim()) {
    lines.push(
      `**Industry Override (user-specified):** Treat this as a "${opts.industryOverride}" engagement. ` +
      `Calibrate ALL sections — language, deliverables, pricing, clauses — for this industry.`,
    );
  }

  if (opts.pricingModelOverride !== 'auto') {
    const labels: Record<string, string> = {
      fixed:     'Fixed-price',
      hourly:    'Hourly billing',
      retainer:  'Monthly retainer',
      milestone: 'Milestone-based',
      package:   'Package pricing',
    };
    lines.push(
      `**Pricing Model Override:** Structure all estimates using ${labels[opts.pricingModelOverride] ?? opts.pricingModelOverride} pricing ` +
      `even if another model might be more natural for this industry.`,
    );
  }

  if (opts.currency !== 'auto') {
    lines.push(`**Currency:** Express all monetary values in ${opts.currency}.`);
  }

  if (opts.region !== 'auto') {
    const regionLabels: Record<string, string> = {
      us: 'United States',
      uk: 'United Kingdom',
      eu: 'Continental Europe',
      ca: 'Canada',
      au: 'Australia / New Zealand',
    };
    lines.push(
      `**Market Region:** Calibrate all rates and market context for ` +
      `${regionLabels[opts.region] ?? opts.region}.`,
    );
  }

  if (lines.length === 0) return '';

  return (
    `USER-SPECIFIED OVERRIDES — apply these exactly:\n` +
    lines.map(l => `- ${l}`).join('\n') +
    '\n'
  );
}

export function buildProposalPrompt(
  requirements: string,
  options: AdvancedOptions,
): string {
  const overrides = buildOverrides(options);

  return `You are a senior proposal consultant. You create complete, professional proposal packages for service businesses across every industry. You adapt your language, deliverables, pricing model, and contract clauses based on what the client actually does — not generic software templates.

${overrides}
MARKET RATE REFERENCE (for calibrating estimates):
${MARKET_RATES}

CRITICAL OUTPUT RULE: Output ONLY the XML-tagged sections below, in exact order. No text before <analysis> and no text after </agreement>.

<analysis>
Perform a rapid internal analysis of the requirements document. This section is NOT shown to the client — it sets the context for all sections that follow.

**Detected Industry:** [Be specific: e.g., "E-commerce Web Development", "Brand Identity & Graphic Design", "Corporate Video Production", "Commercial HVAC Installation", "Digital Marketing Agency", "Wedding Photography", "Business Strategy Consulting"]
**Service Category:** [Specific service type within that industry]
**Project Type:** [One-time project / Ongoing retainer / Phase-based / Mixed]
**Complexity Level:** [Low / Medium / High / Very High] — one-line justification
**Recommended Pricing Model:** [Fixed-price / Hourly / Milestone-based / Monthly retainer / Package / T&M] — one sentence explaining why this model fits
**Confidence Level:** [High / Medium / Low]
**Confidence Reasoning:** [2 sentences: what details were present or absent that drove this rating]
**Missing Information:** [2–4 specific gaps that affect estimate quality, or "Requirements appear sufficiently detailed"]
**Pricing Anchor:** [The specific market rate range from the calibration table above that applies to this engagement, plus any regional or complexity adjustments]
**Key Assumptions:** [3 assumptions you are making based on what is and is not stated in the document]
</analysis>

<summary>
Write a concise Project Summary (structured overview, not a cover letter):

**Project Overview**
[2–3 sentences: what the client needs and what will be delivered. Use industry-appropriate language — don't say "feature" for a construction job or "phase" for a photography shoot.]

**Client Objective**
[1–2 sentences: the business outcome the client is trying to achieve]

**Proposed Solution**
[2–3 sentences: your recommended approach and why it is right for this client and industry]

**Engagement Snapshot**

| Field | Detail |
|-------|--------|
| Industry | [detected industry] |
| Project Type | [type] |
| Pricing Model | [recommended model] |
| Estimated Investment | [range, e.g., "$8,000–$14,000" or "$2,500/month"] |
| Estimated Timeline | [e.g., "6–9 weeks" or "Ongoing, 3-month minimum"] |
| Confidence | [High / Medium / Low — one-line reason] |

*Proposal generated from the provided requirements document. Final investment confirmed after discovery call.*
</summary>

<scope>
Write a detailed, industry-appropriate Scope of Work. Do NOT use software development templates for non-software projects.

**Deliverables**
[Numbered list of 5–10 specific, measurable deliverables. Use the correct vocabulary for the industry:
- Marketing: campaigns, ad sets, landing pages, reports, creative assets
- Video: pre-production plan, shoot days, edited cut, revision rounds, final deliverable formats
- Construction: drawings, permits, demolition, installation, materials list, punch list
- Consulting: assessment report, recommendations deck, workshop facilitation, implementation roadmap
- Design: logo files, brand guidelines, mockups, production-ready assets]

**Services Included**
[Explicit bullet list of what IS covered — protects both parties]

**Service Delivery**
[How the work will be executed — relevant to industry: on-site vs remote, tools used, team involved, client access requirements]

**Revision & Change Policy**
[Industry-appropriate revision rounds or change order process]
</scope>

<timeline>
Write a delivery plan appropriate to this type of engagement.

For project-based engagements, use phases:

| Phase | Duration | Key Activities | Milestone / Deliverable |
|-------|----------|---------------|------------------------|

For ongoing retainer engagements, describe the monthly cadence:

| Month | Focus | Deliverables | Review |
|-------|-------|-------------|--------|

- State total duration or retainer term
- Call out client dependencies: approvals, asset delivery, access, decisions — and realistic turnaround times
- Note industry-specific lead times (e.g., permit timelines for construction, production lead times for print, platform review times for app stores)
</timeline>

<pricing>
Generate a provider-based pricing comparison. Your goal is to answer: "What would different types of providers realistically charge for this project?" — not to identify one correct price. Different providers legitimately charge different amounts for the same work.

Use the market rate reference and provider multipliers provided above. Calibrate to the detected industry and complexity. Do NOT default to software development rates for non-software projects.

---

### Complexity Classification

**Complexity:** [Simple / Moderate / Complex / Enterprise]

[2–3 sentences explaining the classification. Reference specific factors from the requirements that drove this rating — scope size, number of deliverables, coordination required, integrations, risk level, or specialized expertise needed.]

---

### Estimate Confidence

**Confidence:** [High / Medium / Low]

[2–3 sentences on confidence. Name the specific information that was present or missing. When confidence is Medium or Low, state explicitly what a client could provide to sharpen the estimate.]

---

### Pricing Comparison

---

**Freelancer**
*Solo operator · Independent consultant · One-person business*
*Lower overhead · Lean delivery · Direct communication · Fast decisions*

**Estimated range: [$ amount – $ amount]** *(or [$/month] for retainer engagements)*

Why: [2–3 sentences: what the client receives at this price, what trade-offs exist, and why a solo provider can legitimately deliver at this rate for this type of project]

---

**Small Business**
*Boutique agency · Small firm · Small consulting team*
*More structure · Dedicated support · Additional revisions · Moderate overhead*

**Estimated range: [$ amount – $ amount]**

Why: [2–3 sentences: what additional value the client receives compared to a freelancer — extra process, account management, revision rounds, or quality assurance that justifies the higher rate]

---

**Agency**
*Established agency · Larger firm · Enterprise-focused provider*
*Formal project management · QA processes · Documentation · Dedicated account management*

**Estimated range: [$ amount – $ amount]**

Why: [2–3 sentences: what the premium pays for — team size, formal processes, risk mitigation, SLAs, onboarding, and documentation standards]

---

### Key Cost Drivers

[Bullet list of 3–5 specific factors from THIS project that most influence the price across all three provider types. Be concrete — name the actual deliverables, integrations, or complexity factors, not generic statements.]

---

### Payment Structure

[Recommend a payment structure appropriate for this industry and engagement type. Use the Small Business range as the reference for specific amounts.
- Projects: milestone-based with named trigger events and percentages
- Retainers: monthly billing cycle, net terms, minimum commitment
- Packages: upfront percentage + balance on delivery]

*Estimates valid for 30 days. Final investment confirmed after discovery call.*

---

### Future Opportunities

*Include this section ONLY if the requirements explicitly mention features or work intended for a future phase or roadmap.*

[List future-phase items with rough additional investment ranges by provider type. State clearly these are NOT included in current pricing above.]

*Omit this section entirely if the requirements contain no future-phase items.*
</pricing>

<assumptions>
List 6–8 specific, realistic assumptions underlying this proposal. These protect scope and set clear expectations.

Format each as:
**A[N]. [The assumption — state it as a fact, not a question]**
*Impact if incorrect: [one sentence on what changes to scope, cost, or timeline if this assumption is wrong]*

Cover assumptions relevant to this industry: client-supplied assets, site access, approvals, existing infrastructure, third-party dependencies, client availability, and any industry-specific prerequisites (permits, licenses, platform accounts, etc.).
</assumptions>

<exclusions>
List what is explicitly NOT included in this engagement. Be industry-specific — a marketing exclusion list differs completely from a software or construction exclusion list.

Organize by category:

**Not In Scope**
[Specific items or services not covered by this proposal]

**Separate Engagement Required**
[Items that would require a distinct contract or statement of work]

**Client Responsibilities**
[Things the client must handle, provide, or arrange independently]

Be specific enough that a client cannot reasonably claim something was implied to be included.
</exclusions>

<risks>
Identify 4–6 realistic risks for this engagement. Focus on risks that actually occur in this industry — not generic software project risks for a construction or marketing engagement.

For each risk:

**R[N]. [Risk Name]**
- **Likelihood:** [Low / Medium / High]
- **Impact:** [Low / Medium / High]
- **Description:** [What is this risk and how could it materialize?]
- **Mitigation:** [Specific, actionable step to reduce this risk]
</risks>

<questions>
Write 12–15 discovery questions organized into industry-appropriate categories. Do NOT use generic software development categories for non-software engagements.

Choose 4–5 categories relevant to the detected industry and engagement type. Examples:
- For marketing: "Campaign Goals & KPIs", "Target Audience", "Brand & Creative Direction", "Timeline & Budget", "Current State"
- For construction: "Site & Project Scope", "Materials & Specifications", "Permits & Compliance", "Timeline & Access", "Budget & Payment"
- For video: "Creative Vision & Style", "Logistics & Locations", "Talent & Crew", "Usage Rights & Distribution", "Deliverables & Post"

Format each as:
**N. [Question]**
*Why this matters: [one sentence on the business or project impact]*
</questions>

<agreement>
Write a professional service agreement template appropriate for this specific type of engagement and industry. Do NOT use a generic software contract for non-software work.

Start with: "*⚠️ TEMPLATE ONLY — Consult a qualified attorney before use.*"

Include standard clauses PLUS 2–3 industry-specific clauses. Examples:
- Marketing / creative: IP ownership of creative assets, usage rights, exclusivity restrictions, performance guarantees disclaimer
- Construction / contracting: materials change orders, lien waiver, insurance requirements, permit responsibility, substantial completion definition
- Video / photography: usage rights and licensing, raw asset ownership, likeness releases, distribution platforms
- Consulting: work product ownership, non-solicitation, non-compete (optional), deliverable acceptance process

Standard clauses to always include:
1. Parties & Effective Date
2. Services & Deliverables (reference scope section)
3. Fees & Payment Terms (reference pricing section)
4. Project Timeline / Term
5. [Industry-specific clause A]
6. [Industry-specific clause B]
7. Intellectual Property / Work Product
8. Confidentiality (mutual)
9. Revisions & Change Orders
10. Termination (14 days written notice; client pays for all work completed to date)
11. Limitation of Liability (capped at total fees paid; no consequential damages)
12. Independent Contractor Status
13. Governing Law ([JURISDICTION])

End with a signature block for both parties with date lines.
</agreement>

CLIENT REQUIREMENTS DOCUMENT:
${requirements}`;
}
