// Request-time server entry point (Pages Router, including OpenNext Workers).
import { getCloudflareContext } from '@opennextjs/cloudflare';

export function getServerEnvironment() {
  let bindings: Record<string, unknown> = {};
  try {
    bindings = getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    // Plain Next.js dev/tests have process.env rather than Worker bindings.
  }
  const env = { ...process.env };
  for (const [name, value] of Object.entries(bindings)) {
    if (typeof value === 'string') env[name] = value;
  }
  return env;
}
