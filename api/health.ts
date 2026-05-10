// Simple health check — tests Vercel function cold-start latency.
export default function handler(_req: Request): Response {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return new Response(
    JSON.stringify({ ok: true, ts: Date.now(), region: env?.VERCEL_REGION ?? 'unknown' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
