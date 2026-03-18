import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
    // This enables the "Standard" Cloudflare setup for OpenNext
    incrementalCache: {
        type: "dummy", // You can upgrade this to 'kv' later if you need high-performance caching
    },
});