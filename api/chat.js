// Vercel Serverless Function — Anthropic API proxy for Mycel
// Place this file at:  api/chat.js  in your project root.
//
// It keeps your API key secret on the server. The browser calls /api/chat,
// this function adds the key and forwards to Anthropic. Handles BOTH
// streaming (Learn chat) and non-streaming (quiz, reports, etc).
//
// SETUP (one time, in Vercel dashboard):
//   Project -> Settings -> Environment Variables -> Add:
//     Name:  ANTHROPIC_API_KEY
//     Value: sk-ant-...   (your key from console.anthropic.com)
//   Then redeploy. NEVER put the key in code or commit it to git.

export const config = { runtime: "edge" }; // edge runtime streams cleanly

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "Server not configured: ANTHROPIC_API_KEY is missing. Add it in Vercel Settings -> Environment Variables, then redeploy.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let bodyText;
  try {
    bodyText = await req.text();
  } catch {
    return new Response(JSON.stringify({ error: "Could not read request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Is this a streaming request? Peek at the body.
  let isStream = false;
  try {
    isStream = JSON.parse(bodyText).stream === true;
  } catch {}

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: bodyText,
  });

  // Streaming: pipe the response straight back to the browser.
  if (isStream && anthropicRes.body) {
    return new Response(anthropicRes.body, {
      status: anthropicRes.status,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Non-streaming: return JSON.
  const data = await anthropicRes.text();
  return new Response(data, {
    status: anthropicRes.status,
    headers: { "Content-Type": "application/json" },
  });
}
