import { createClient } from '@supabase/supabase-js'

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    const { data: buckets } = await admin.storage.listBuckets()
    const exists = buckets?.some((b: any) => b.name === 'bureau-docs')

    if (exists) {
        console.log('✅ bureau-docs bucket already exists!')
        return
    }

    const { error } = await admin.storage.createBucket('bureau-docs', {
        public: true,
        fileSizeLimit: 10485760
    })

    if (error) {
        console.error('❌ Failed:', error.message)
        process.exit(1)
    }

    console.log('✅ bureau-docs bucket created successfully!')
}

main()
