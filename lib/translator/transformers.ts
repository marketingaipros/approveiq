import { UploadRow } from './validators';
import Papa from 'papaparse';

// Transforms to Equifax CFN layout (simplified for demo)
export function transformToCFN(data: UploadRow[], memberNumber: string): string {
    // Member number goes in header row
    const headerRow = `HEADER,MEMBER_NUM:${memberNumber},DATE:${new Date().toISOString().split('T')[0]}\n`;
    
    const bodyRows = data.map(row => {
        return `DATA|${row.AccountID}|${row.LegalName}|${row.EIN}|${row.Address}|${row.City}|${row.State}|${row.Zip}|${row.OpenDate}|${row.CreditLimit}|${row.Balance}|${row.PastDue}|${row.Status}`;
    }).join('\n');
    
    return headerRow + bodyRows + '\nTRAILER,RECORDS:' + data.length;
}

// Transforms to Experian/SBFE Metro 2 layout (simplified layout string for demo)
export function transformToMetro2(data: UploadRow[]): string {
    const headerRow = `METRO2_HEADER_RECORD_VERSION_01\n`;
    
    const bodyRows = data.map(row => {
        // Metro 2 uses base segments (J1, J2, etc)
        // Here we just represent a fixed-ish looking string
        return `BASE_SEGMENT|${(row.AccountID || '').padEnd(20)}|${(row.LegalName || '').padEnd(30)}|${(row.EIN || '').padEnd(9)}|${(row.OpenDate || '').padEnd(8)}|${(row.Balance || '').padStart(10, '0')}|${(row.PastDue || '').padStart(10, '0')}|${(row.Status || '').padEnd(2)}`;
    }).join('\n');
    
    return headerRow + bodyRows + `\nMETRO2_TRAILER_RECORD`;
}

// Transforms to D&B/Creditsafe Aged A/R layout (simplified CSV)
export function transformToAgedAR(data: UploadRow[]): string {
    // We'll calculate simple aging buckets based on the "PastDue" amount for the demo
    const formattedData = data.map(row => {
        const pd = parseFloat(row.PastDue?.replace(/[^0-9.-]+/g,"") || "0");
        const bal = parseFloat(row.Balance?.replace(/[^0-9.-]+/g,"") || "0");
        
        // Mock simple buckets
        const current = pd === 0 ? bal : Math.max(0, bal - pd);
        const a1_30 = pd > 0 && pd <= 1000 ? pd : 0;
        const a31_60 = pd > 1000 && pd <= 5000 ? pd : 0;
        const a61_90 = pd > 5000 && pd <= 10000 ? pd : 0;
        const a91_plus = pd > 10000 ? pd : 0;
        
        return {
            "Account ID": row.AccountID,
            "Company Name": row.LegalName,
            "EIN": row.EIN,
            "Total Balance": bal,
            "Current": current,
            "1-30 Days": a1_30,
            "31-60 Days": a31_60,
            "61-90 Days": a61_90,
            "91+ Days": a91_plus
        };
    });
    
    return Papa.unparse(formattedData);
}
