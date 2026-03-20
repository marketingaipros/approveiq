export function getEnvVar(key: string): string {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key] as string;
    }
    // Fallback for Cloudflare Worker bindings if not mapped to process.env
    if (typeof globalThis !== 'undefined' && (globalThis as any).env && (globalThis as any).env[key]) {
        return (globalThis as any).env[key] as string;
    }
    return '';
}
