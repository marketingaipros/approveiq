import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

// Initialize SDKs
// Intentionally not crashing if env vars are missing to allow local testing
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
    : null;

/**
 * Format and send batched notifications for newly completed bureau applications.
 * Extracts Equifax-specific thresholds automatically if Equifax is present.
 */
export async function sendAdminBatchedAlert(applications: any[]) {
    if (!applications || applications.length === 0) return;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@approveiq.com';
    const adminPhone = process.env.ADMIN_PHONE; // e.g., '+1234567890'

    let emailText = `Action Required: New Bureau Completions Pending Review\n\n`;
    emailText += `The following organizations have completed 100% of their required dashboard tasks and are awaiting admin verification:\n\n`;

    let smsText = `ApproveIQ Alert: ${applications.length} new bureau completions require admin review.\n`;

    // Process each application to construct the summary
    for (const app of applications) {
        let snippet = `• ${app.org_name} - Pipeline: ${app.bureau_name}\n`;

        // Equifax specific logic
        if (app.bureau_name === 'Equifax' && app.dynamic_answers) {
            const expectedRecordsAns = app.dynamic_answers.find((a: any) => a.field_key === 'expected_records');
            const records = expectedRecordsAns ? parseInt(expectedRecordsAns.answer_value) : 0;
            
            // Check for lending license implicitly (often just seeing if the file uploaded or the checkbox checked)
            // We assume 'lending_license' field_key exists if they are licensed
            // Based on earlier logic, low volume requires lending license.
            const hasLicense = app.dynamic_answers.some((a: any) => a.field_key === 'lending_license_completed' || a.field_key === 'lending_license_pdf');

            if (records >= 500) {
                snippet += `  ↳ Threshold Met: ${records} records standard volume.\n`;
            } else if (hasLicense) {
                snippet += `  ↳ Low Volume Exception: ${records} records, but Lending License present.\n`;
            } else {
                snippet += `  ↳ WARNING: Low Volume (${records} records) without Licensing.\n`;
            }
        }

        emailText += snippet;
    }

    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/requirement-manager`;
    emailText += `\nReview them here: ${verificationLink}\n`;
    
    // SMS truncation (we only want a quick alert via text)
    smsText += `Review immediately at: ${verificationLink}`;

    console.log("=== NOTIFICATION PAYLOAD ===");
    console.log(emailText);
    console.log("============================");

    // Send Email via SendGrid
    if (process.env.SENDGRID_API_KEY) {
        try {
            await sgMail.send({
                to: adminEmail,
                from: 'notifications@approveiq.com', // Must be verified sender in SendGrid
                subject: '🔥 ApproveIQ Action Required: Bureau Completions',
                text: emailText,
            });
            console.log("Email sent successfully.");
        } catch (error) {
            console.error("Failed to send SendGrid email:", error);
        }
    } else {
        console.warn("SENDGRID_API_KEY not defined. Skipping email dispatch.");
    }

    // Send SMS via Twilio
    if (twilioClient && adminPhone && process.env.TWILIO_FROM_PHONE) {
        try {
            await twilioClient.messages.create({
                body: smsText,
                from: process.env.TWILIO_FROM_PHONE,
                to: adminPhone
            });
            console.log("SMS sent successfully.");
        } catch (error) {
            console.error("Failed to send Twilio SMS:", error);
        }
    } else {
        console.warn("Twilio configuration missing. Skipping SMS dispatch.");
    }
}
