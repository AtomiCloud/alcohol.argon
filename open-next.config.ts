import { defineCloudflareConfig } from '@opennextjs/cloudflare';
export default defineCloudflareConfig({
  // Disable R2 incremental cache override while debugging routing/SSG
  // incrementalCache: r2IncrementalCache,
});
