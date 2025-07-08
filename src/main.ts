import * as pretty_print from "saihex/pretty_logs";
import sharp from "sharp";

const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
];

const lossless_types = ["image/png", "image/svg+xml", "image/webp"];

const allowedPathRegex = Deno.env.get("allowedPathRegex") ?? "public/*";
const s3Endpoint = Deno.env.get("s3endpoint");

if (s3Endpoint == undefined) {
  throw new Error("S3 ENDPOINT NOT SET!");
}

async function convertToWebP(
  buffer: Uint8Array,
  contentType: string
): Promise<Response> {
  try {
    const webpBuffer = await sharp(buffer, { animated: true })
      .webp({
        quality: 80,
        lossless: lossless_types.includes(contentType),
      })
      .toBuffer();

    return new Response(webpBuffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (err) {
    pretty_print.logError(`[webpS3] sharp conversion failed:`, err);
    return new Response("Failed to convert image", { status: 500 });
  }
}

async function serveHandler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const fullURL = new URL(req.url);

  if (fullURL.pathname == "/health") {
    return new Response("I'm Alive", {
      status: 200,
      headers: {
        "Cache-Control": "no-cache",
      },
    });
  }

  const desiredFile = fullURL.searchParams.get("src");
  const pathRegex = new RegExp(allowedPathRegex);

  if (desiredFile == null) {
    return new Response("missing 'src' parameter", { status: 400 });
  }

  if (!pathRegex.test(desiredFile)) {
    pretty_print.logWarning(`[webpS3] Blocked src: ${desiredFile}`);
    return new Response(null, { status: 403 });
  }

  //

  const s3URL = `${s3Endpoint}/${desiredFile}`;

  {
    let headRes: Response;
    try {
      headRes = await fetch(s3URL, { method: "HEAD", signal: abortController.signal });
    } catch (err) {
      pretty_print.logError(`Failed to fetch: ${s3URL}`, err);
      return new Response("Failed to fetch from S3", { status: 502 });
    }

    if (!headRes.ok) {
      return new Response(null, { status: headRes.status });
    }

    const contentType = headRes.headers.get("content-type") || "";

    if (!allowedTypes.includes(contentType)) {
      return new Response(`Unsupported content type: ${contentType}`, {
        status: 415,
      });
    }
  }

  let fileRes: Response;
  try {
    fileRes = await fetch(s3URL, {signal: abortController.signal});
  } catch (err) {
    pretty_print.logError(`Failed to fetch: ${s3URL}`, err);
    return new Response("Failed to fetch from S3", { status: 502 });
  }

  if (!fileRes.ok) {
    return new Response(null, { status: fileRes.status });
  }

  const contentType = fileRes.headers.get("content-type") || "";
  const inputBuffer = new Uint8Array(await fileRes.arrayBuffer());

  return await convertToWebP(inputBuffer, contentType);
}

// Server

const abortController = new AbortController();

async function SeverCleanup() {
  pretty_print.log("Starting cleanup... 🧹😸");

  await new Promise((resolve) => setTimeout(resolve, 2000));
  pretty_print.log("Cleanup completed, exiting...");
  Deno.exit(0);
}

function setupGracefulShutdown() {
  const signals: Deno.Signal[] = ["SIGTERM", "SIGINT"];

  for (const sig of signals) {
    Deno.addSignalListener(sig, async () => {
      pretty_print.log(`Received ${sig}, starting graceful shutdown...`);
      abortController.abort("SERVER SHUTTING DOWN");
      await SeverCleanup();
    });
  }
}

setupGracefulShutdown();
Deno.serve(
  { port: 8080, hostname: "0.0.0.0", signal: abortController.signal },
  serveHandler
);

pretty_print.log("Setup complete!");
