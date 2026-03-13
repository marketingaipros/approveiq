// D&B (Dun & Bradstreet) constants — safe to import in client and server components

export const DNB_KB_RULES = [
    {
        topic: "D&B Checklist Requirements — Business Entity & Address",
        bureau: "dnb",
        content: `## D&B Checklist Requirements

**Requirement Tags: DNB_ELIGIBILITY, LENDER_VERIFICATION**

Dun & Bradstreet requires the following from every applicant before establishing or updating a DUNS number file:

### Required Entity Structure
- **Legal Entity Type:** Must be an LLC or Corporation. Sole proprietorships are NOT eligible for standard D&B business credit file establishment.
- **EIN (Employer Identification Number):** A valid federal EIN is required. Social Security Numbers are not accepted.
- **Business Address:** Must be a verifiable commercial address. PO Boxes are not accepted as a primary business address.
- **Business Phone:** Must be a dedicated business landline or business VoIP number. Personal cell phones are not acceptable.

### AI Auditor Enforcement
- Residential addresses will be flagged High Risk and require manual compliance review.
- PO Boxes will be blocked at intake.
- Sole proprietorships will trigger an ineligibility warning.

### References
- D&B Data Cloud — File Establishment Standards
- D&B Business Credit Reporting Guide, Section 1.2`,
        rules_json: { tags: ["DNB_ELIGIBILITY", "LENDER_VERIFICATION"], category: "eligibility_checklist", enforced: true }
    },
    {
        topic: "Building Business Credit — Trade Reference Requirements",
        bureau: "dnb",
        content: `## Building Business Credit with D&B — Trade Reference Requirements

**Requirement Tag: DNB_CREDIT_BUILDING**

To establish a Paydex score and business credit profile with D&B, the applicant must supply B2B trade references.

### Requirements
- **Minimum References:** 3–4 active B2B trade references (business-to-business only).
- **Credit Limit Range:** Each reference should reflect a credit limit between $500 and $1,000 for new files.
- **Eligible Reference Types:** Net-30 vendor accounts, supplier credit, wholesale trade accounts, business-to-business services.

### Ineligible References (AI Auditor Flags)
- Personal credit cards or consumer accounts
- Utilities in a personal name
- Rent or lease payments to a residential landlord
- Any account where the counterparty is a natural person, not a business entity

### Notes
- Vendor names and contact information will be captured for manual verification by our internal operations team.
- References must be active and reflect payment history within the last 12 months.

### References
- D&B Paydex Score Methodology
- D&B Credibility Corp — Trade Reference Standards`,
        rules_json: { tag: "DNB_CREDIT_BUILDING", category: "trade_references", enforced: true }
    },
    {
        topic: "Reporting on Customers — Monthly Account Submission",
        bureau: "dnb",
        content: `## Reporting on Customers — Monthly Account Submission Standards

**Requirement Tag: DNB_REPORTING, MONTHLY_CONTRIBUTION**

Members contributing customer account data to the D&B commercial database must meet ongoing submission standards.

### Requirements
- **Active Accounts:** Must have 20–50 active customer accounts to report monthly.
- **Data Fields Required per Account:** Customer D-U-N-S, High Credit, Current Balance, Amount Past Due, Terms of Sale, Account Status.
- **Submission Frequency:** Monthly — data must be submitted within 30 days of each cycle.
- **Account Type:** B2B only — no consumer accounts.

### AI Auditor Enforcement
- Non-B2B accounts (consumer, personal, utilities) will be flagged and excluded.
- Accounts with missing Customer D-U-N-S numbers will be queued for manual match.

### References
- D&B Trade Contributor Program Guide
- D&B Data Submission Specification v4.1`,
        rules_json: { tags: ["DNB_REPORTING", "MONTHLY_CONTRIBUTION"], category: "reporting_standards", enforced: true }
    },
]

// D&B PO Box detection patterns for AI Auditor
export const PO_BOX_PATTERNS = [
    /\bP\.?O\.?\s*Box\b/i,
    /\bPost\s*Office\s*Box\b/i,
    /\bPOB\b/i,
]

// Non-B2B reference types the AI Auditor should flag
export const NON_B2B_KEYWORDS = [
    "visa", "mastercard", "american express", "amex", "discover",
    "personal", "consumer", "home depot", "walmart", "amazon",
    "electric", "gas", "water", "utility", "utilities", "pge", "con ed",
    "at&t personal", "verizon personal", "sprint", "t-mobile",
    "rent", "landlord", "residential",
]
