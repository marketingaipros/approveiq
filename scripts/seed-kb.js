const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedKB() {
    console.log("Seeding Knowledge Base...");

    const entries = [
        {
            topic: 'Metro 2® File Validation',
            bureau: 'experian',
            content: `### Metro 2® Technical Requirements
The Metro 2® format is the standard for reporting consumer credit information. 

**Validation Checks:**
- **Header Record (Record 1):** Must contain valid Reporter ID and Cycle Date.
- **Base Segment:** Must include valid SSN, Name, and Address.
- **K1 Segment:** Required if reporting through a specialized mortgage program.

*Source: CDIA Metro 2® Technical Manual 2024*`
        },
        {
            topic: 'Data Subscriber Agreement (DSA)',
            bureau: 'experian',
            content: `### Legal Requirements (DSA)
The Data Subscriber Agreement is a binding legal contract between your organization and Experian.

**Key Provisions:**
- **Permissible Purpose:** You must have a legal reason (e.g., credit extension) to access or furnish data.
- **FCRA Compliance:** Governs how you handle consumer disputes.
- **Security:** Requires adherence to the Global Security Requirement (GSR).

*Source: Experian Legal Department*`
        },
        {
            topic: 'Security Audit Attestation',
            bureau: 'experian',
            content: `### Security Standards
To furnish data to Experian, you must provide proof of high-level security controls.

**Accepted Documents:**
- **SOC 2 Type 2:** Evaluation of controls over a period of time (preferred).
- **ISO 27001:** Certification of your Information Security Management System.
- **PCI-DSS:** If handling credit card data during the furnishing process.

*Source: Experian Information Security v4.2*`
        }
    ];

    const { error } = await supabase
        .from('knowledge_base')
        .insert(entries);

    if (error) {
        console.error("Seed error:", error);
    } else {
        console.log("Knowledge Base seeded successfully!");
    }
}

seedKB();
