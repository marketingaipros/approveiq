import { NextResponse } from 'next/server'
import { getEnvVar } from '@/lib/utils/env'

export const dynamic = 'force-dynamic'

export async function GET() {
    return NextResponse.json({
        NEXT_PUBLIC_SUPABASE_URL: !!getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        SUPABASE_SERVICE_ROLE_KEY: !!getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
        RUNTIME: typeof process !== 'undefined' ? 'node/opennext' : 'edge',
        BINDINGS: typeof (globalThis as any).env !== 'undefined' ? 'present' : 'missing'
    })
}
