# ApproveIQ

**B2B Enterprise Intake & Compliance Orchestrator**

ApproveIQ is a SaaS platform designed to streamline complex B2B onboarding and compliance workflows. It features a dynamic "Atomic Checklist" engine, AI-powered document verification, and enterprise-grade audit logging.

## Core Features

-   **Atomic Checklist Engine**: Granular state management (Missing, Pending, Needs Action, Approved).
-   **Command Center Dashboard**: High-visibility "Action Required" views.
-   **Smart Recognition Engine**: AI-powered entity extraction and organization-wide data memory for seamless re-application.
-   **Document Intelligence**: Mobile-optimized upload with AI-simulated verification and governance.
-   **Hardened Enterprise Security**: Industrial-grade tenant isolation via Supabase RLS and immutable database audit triggers.
-   **Compliance & Governance**: Production-ready audit ledger with administrative CSV/JSON exports.
-   **System Admin Portal**: Restricted-access internal governance engine with real-time AI and cost monitoring.

## Tech Stack

-   **Frontend**: Next.js 14, Tailwind CSS, Shadcn/UI
-   **Backend**: Supabase (PostgreSQL, Auth, Storage)
-   **Payment**: Stripe Integration
-   **AI**: Mock Integration (Ready for Google Gemini / OpenAI)

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open Browser**:
    Navigate to [http://localhost:3005](http://localhost:3005)

## 🔑 Development Access

To access the **System Admin Portal** (`/admin`), you must grant your user account `is_system_admin` privileges. 
1. Log in to the application.
2. If you hit the "Access Restricted" screen, note your User ID.
3. Run the SQL in `db/seed.sql` (replacing the ID if necessary) in your Supabase SQL Editor.

## License

Private / Proprietary.
