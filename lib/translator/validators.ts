export interface UploadRow {
    AccountID?: string;
    LegalName?: string;
    EIN?: string;
    Address?: string;
    City?: string;
    State?: string;
    Zip?: string;
    OpenDate?: string;
    CreditLimit?: string;
    Balance?: string;
    PastDue?: string;
    Status?: string;
    [key: string]: any;
}

export interface ValidationError {
    rowIndex: number;
    accountName: string;
    missingFields: string[];
}

export const requiredFields = ['AccountID', 'LegalName', 'EIN', 'Address', 'City', 'State', 'Zip', 'OpenDate', 'CreditLimit', 'Balance', 'PastDue', 'Status'];

export function validateTranslatorData(data: UploadRow[]): ValidationError[] {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
        const missing: string[] = [];
        requiredFields.forEach(field => {
            if (!row[field] || String(row[field]).trim() === '') {
                missing.push(field);
            }
        });

        if (missing.length > 0) {
            errors.push({
                rowIndex: index, // 0-indexed based on data array
                accountName: row.LegalName || row.AccountID || `Row ${index + 2}`, // +2 for header and 1-index
                missingFields: missing
            });
        }
    });

    return errors;
}
