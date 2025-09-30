type HashObjectRequest = {
  storagePath: string;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
    ...init,
  });
}

async function computeSha256HexFromStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.byteLength;
    }
  }
  const joined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const digest = await crypto.subtle.digest("SHA-256", joined.buffer);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
// Access Deno via globalThis to avoid TS errors in non-Deno toolchains
const D = (globalThis as any).Deno;

D.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }

    const { storagePath } = (await req.json()) as HashObjectRequest;
    if (!storagePath || typeof storagePath !== "string") {
      return jsonResponse({ error: "Invalid storagePath" }, { status: 400 });
    }

    const url = D.env.get("SUPABASE_URL");
    const serviceKey = D.env.get("SUPABASE_SERVICE_ROLE_KEY") || D.env.get("SUPABASE_ANON_KEY");
    const bucket = D.env.get("STORAGE_BUCKET") || "user-uploads";

    if (!url || !serviceKey || !bucket) {
      return jsonResponse(
        { error: "Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STORAGE_BUCKET" },
        { status: 500 },
      );
    }

    // Use authenticated endpoint since bucket is private
    const objectUrl = `${url}/storage/v1/object/authenticated/${bucket}/${encodeURI(storagePath)}`;

    const fileResp = await fetch(objectUrl, {
      headers: { Authorization: `Bearer ${serviceKey}` },
    });
    if (!fileResp.ok || !fileResp.body) {
      return jsonResponse({ error: `Failed to fetch object: ${fileResp.status}` }, { status: 404 });
    }

    // Capture size while buffering for hashing
    const reader = fileResp.body.getReader();
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        size += value.byteLength;
      }
    }
    const merged = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const c of chunks) controller.enqueue(c);
        controller.close();
      },
    });

    const sha256 = await computeSha256HexFromStream(merged);

    return jsonResponse({ sha256, size });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, { status: 500 });
  }
});


