import { updateSharedData } from "../actions";

export type ExtractedData = {
    [key: string]: string | object;
};

/**
 * Simulates AI analysis of an uploaded document.
 * In a real production environment, this would call Gemini / Vertex AI.
 */
export async function analyzeDocument(tag: string, file: File): Promise<ExtractedData | null> {
    console.log(`[AI ANALYZER] Analyzing ${file.name} for tag: ${tag}`);

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock extraction logic based on the requirement tag
    switch (tag) {
        case 'METRO2_VALIDATION':
            return {
                metro2_compliant: "true",
                last_validation_date: new Date().toISOString(),
                file_sample_hash: "sha256:7f8a9b..."
            };

        case 'SERVICE_AGREEMENT':
            return {
                agreement_signed: "true",
                signer_name: "Business Owner",
                agreement_date: new Date().toISOString()
            };

        case 'SECURITY_AUDIT':
            return {
                soc2_status: "active",
                compliance_rank: "A+",
                expiry_date: "2026-12-31"
            };

        case 'TAX_ID_VERIFICATION':
            // The "EIN" is the gold standard for data reuse in this platform
            const mockEin = "99-1234567";
            await updateSharedData('ein', mockEin); // Persist to global cache for reuse
            return {
                ein: mockEin,
                entity_type: "C-Corp",
                verification_source: "IRS W-9"
            };

        default:
            return {
                generic_extraction: "Completed",
                confidence: "0.98"
            };
    }
}
