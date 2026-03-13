import { KBSeederPanel } from "@/components/admin/kb-seeder-panel"

export const dynamic = 'force-dynamic'

export default function AdminKBSeederPage() {
    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <KBSeederPanel />
        </div>
    )
}
