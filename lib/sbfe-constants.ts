// Bureau-specific constants — safe to import in both client and server components

export const SBFE_KB_RULES = [
    {
        topic: "Mandatory Monthly Data Submission",
        bureau: "sbfe",
        content: `## Mandatory Monthly Data Submission

**Requirement Tag: SBFE_GOVERNANCE**

All SBFE members are required to submit small business credit data on a monthly basis. Submissions must be made within 30 days of each reporting cycle.

### Key Points
- Monthly reporting is not optional — consistent non-submission may result in membership suspension.
- Data submissions must conform to the SBFE-approved format (Metro 2® or SBFE Data Specification).
- Late or missing submissions are tracked and reviewed during the annual governance audit.

### References
- SBFE Operating Procedures, Section 3.1: Data Contribution Requirements`,
        rules_json: { tags: ["SBFE_GOVERNANCE", "MONTHLY_CONTRIBUTION"], category: "reporting_frequency", enforced: true }
    },
    {
        topic: "Small-Business Credit Originator or Processor Eligibility",
        bureau: "sbfe",
        content: `## Membership Eligibility — Small-Business Credit Originators and Processors

**Requirement Tag: LENDER_VERIFICATION**

SBFE membership is restricted to entities that originate or process small-business credit. Trade credit providers are explicitly excluded.

### Eligible Member Types
- Commercial banks and credit unions
- Non-bank small-business lenders
- SBA-approved lenders
- Commercial finance companies
- Equipment finance and leasing companies (where credit risk is carried)

### Ineligible
- Trade credit providers (net-30 accounts between businesses for goods/services)
- Consumer-only lenders with no small business portfolio
- Marketplace platforms not holding credit risk

### References
- SBFE Membership Charter, Section 2.4: Eligible Contributor Categories`,
        rules_json: { tag: "LENDER_VERIFICATION", category: "eligibility", enforced: true }
    },
    {
        topic: "Annual Dues Based on Account Volume",
        bureau: "sbfe",
        content: `## Annual Dues — Volume-Based Tier Structure

**Requirement Tag: SBFE_GOVERNANCE**

SBFE charges annual membership dues calculated on the basis of total active small-business account volume contributed by the member.

### Tier Structure (Approximate)
| Annual Account Volume | Dues Tier |
|---|---|
| < 1,000 accounts | Tier 1 (Lowest) |
| 1,000 – 10,000 | Tier 2 |
| 10,001 – 50,000 | Tier 3 |
| 50,001 – 250,000 | Tier 4 |
| 250,000+ | Tier 5 (Highest) |

Dues are invoiced annually. Failure to pay dues within 60 days of invoice may result in data access suspension.

### References
- SBFE Fee Schedule (current year) — provided upon application approval`,
        rules_json: { tag: "SBFE_GOVERNANCE", category: "dues", enforced: true }
    },
    {
        topic: "Data Use Restricted to Credit and Risk Purposes",
        bureau: "sbfe",
        content: `## Data Use Policy — Credit and Risk Purposes Only

**Requirement Tag: SBFE_GOVERNANCE, LENDER_VERIFICATION**

SBFE data is exclusively licensed for credit underwriting, risk management, and portfolio monitoring. Use of SBFE data for marketing, solicitation, or any non-credit purpose is strictly prohibited.

### Permitted Uses
- Credit origination and underwriting decisions
- Portfolio risk monitoring and early warning
- Fraud detection (credit-related)
- Regulatory reporting (where permitted by law)

### Prohibited Uses
- Marketing or pre-screening for product offers
- Resale or redistribution of SBFE data
- Employment screening or tenant screening
- Any purpose not directly related to credit risk assessment

### References
- SBFE Data License Agreement, Section 5: Permitted Use of Data`,
        rules_json: { tags: ["SBFE_GOVERNANCE", "LENDER_VERIFICATION"], category: "data_use", enforced: true }
    },
]
