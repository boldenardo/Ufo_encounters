// Simple health check — tests Vercel function cold-start latency.
export default function handler(_req: Request): Response {
  return new Response(
    JSON.stringify({ ok: true, ts: Date.now(), region: process.env.VERCEL_REGION ?? 'unknown' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
