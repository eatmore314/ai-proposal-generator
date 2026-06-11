import type { AdvancedOptions } from '@/types';

/* ── Market rate calibration reference ── */
const MARKET_RATES = `
Market rate reference (use as calibration anchors — adjust for scope and region):
- Software / web development (freelancer): $60–150/hr | projects $3K–$80K
- Software / web development (agency): projects $15K–$250K+
- Mobile app development: $10K–$150K depending on complexity
- Digital marketing (agency): $1,500–$15,000/month retainer | $3K–$60K per campaign
- SEO / content marketing: $500–$5,000/month
- Social media management: $500–$5,000/month
- Video production (corporate): $2,000–$50,000 per project
- Video production (commercial/broadcast): $10,000–$200,000+
- Photography: $100–$500/hr | $500–$15,000 per shoot
- Graphic design / branding: $50–$150/hr | $1,000–$50,000 per project
- UX / UI design: $75–$175/hr | $5,000–$60,000 per project
- Copywriting: $0.10–$0.50/word | $500–$10,000 per project
- Management consulting: $150–$500/hr | $5,000–$200,000+ engagements
- IT consulting / infrastructure: $100–$250/hr
- Business coaching: $100–$500/hr | $1,000–$5,000/month retainer
- Construction (residential): $150–$500/sq ft
- Construction (commercial): $100–$350/sq ft
- General contractor / renovation: $50–$150/hr + materials
- Interior design: $50–$200/hr + 10–30% procurement markup
- Landscape / hardscape: $2,000–$50,000 per project
- Event planning: 15–20% of event budget or $50–$150/hr
- Accounting / bookkeeping: $25–$150/hr or $200–$2,500/month
- Legal services: $150–$500/hr
- PR / communications: $2,000–$10,000/month retainer
- Recruiting / HR consulting: 15–30% of annual salary or $100–$250/hr
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
Generate a realistic pricing analysis calibrated for the **detected industry, service type, and complexity level**.

Use the market rate anchor identified in your analysis section. Do NOT default to software development hourly rates for non-software engagements.

---

### Estimate Confidence

**Confidence Level:** [High / Medium / Low]

[2–3 sentences explaining the confidence level: what requirements details were present that support accurate estimation, and what was missing or ambiguous that introduces uncertainty. When confidence is Medium or Low, explain specifically what information would improve the estimate.]

---

### Three-Tier Estimate

| Tier | Investment | Best For |
|------|-----------|---------|
| **Low — Lean** | [amount or range] | [who chooses this and why] |
| **Recommended** | [amount or range] | [who chooses this and why] |
| **High — Premium** | [amount or range] | [who chooses this and why] |

---

**🟢 Low — Lean**
[Describe precisely what is included and what is cut to reach this price. Be specific and honest about the trade-offs. Use industry vocabulary.]
*Investment: [$ amount or range]*

**🔵 Recommended** *(Best Value)*
[Describe what makes this the professional standard for this engagement type. What does the client get that makes it worth the additional investment over the lean option? This should be the estimate to present to clients as the recommended path.]
*Investment: [$ amount or range]*

**🟣 High — Premium**
[Describe the additional polish, revisions, deliverables, documentation, or complexity buffer included at this tier. When would a client choose this over Recommended?]
*Investment: [$ amount or range]*

---

### Pricing Rationale
[2–3 sentences explaining why these specific numbers are appropriate for this industry and scope. Reference the complexity level and the key drivers of cost.]

---

### Payment Structure
[Recommend a payment structure appropriate for this type of engagement:
- Projects: milestone-based with percentages and specific trigger events
- Retainers: monthly billing terms and net days
- Packages: upfront or split options
Provide specific dollar amounts based on the Recommended tier.]

*Estimate valid for 30 days. Final investment confirmed after discovery call.*
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
