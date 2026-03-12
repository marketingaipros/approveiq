import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendAdminBatchedAlert } from "@/lib/notifications";

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Use service role to bypass RLS for backend cron job
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Find applications completed over an hour ago that haven't been notified yet
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data: applications, error } = await supabase
            .from('bureau_applications')
            .select(`
                *,
                organizations (name)
            `)
            .not('completed_at', 'is', null)
            .is('notified_at', null)
            .lte('completed_at', oneHourAgo);

        if (error) {
            console.error("Cron Error fetching applications:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!applications || applications.length === 0) {
            return NextResponse.json({ message: "No new completions to notify." });
        }

        const orgIds = [...new Set(applications.map((a: any) => a.org_id))];
        
        // Pre-fetch all answers for these organizations and map their field keys
        const { data: allAnswers } = await supabase
            .from('dynamic_answers')
            .select(`
                *,
                dynamic_requirements (field_key)
            `)
            .in('org_id', orgIds);

        const mappedAnswers = (allAnswers || []).map((a: any) => ({
            org_id: a.org_id,
            field_key: a.dynamic_requirements?.field_key,
            answer_value: a.answer_value
        }));

        // Format for the notification service
        const formattedApps = applications.map((app: any) => ({
            bureau_name: app.bureau_name,
            org_name: app.organizations?.name || 'Unknown Company',
            dynamic_answers: mappedAnswers.filter((a: any) => a.org_id === app.org_id)
        }));

        // Fire off emails/SMS via background payload builder
        await sendAdminBatchedAlert(formattedApps);

        // Mark them as notified
        const appIds = applications.map((a: any) => a.id);
        const { error: updateError } = await supabase
            .from('bureau_applications')
            .update({ notified_at: new Date().toISOString() })
            .in('id', appIds);

        if (updateError) {
            console.error("Cron Error updating notified_at:", updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ 
            message: `Successfully processed and notified for ${applications.length} completions.` 
        });

    } catch (err: any) {
        console.error("Cron exception:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
