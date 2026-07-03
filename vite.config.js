import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      {
        name: "mycel-local-ai",
        configureServer(server) {
          server.middlewares.use("/api/chat", async (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }
            if (!env.ANTHROPIC_API_KEY) {
              res.statusCode = 503;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Add ANTHROPIC_API_KEY to .env.local, then restart Mycel." }));
              return;
            }
            try {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const upstream = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": env.ANTHROPIC_API_KEY,
                  "anthropic-version": "2023-06-01",
                },
                body: Buffer.concat(chunks),
              });
              res.statusCode = upstream.status;
              res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
              res.setHeader("Cache-Control", "no-cache");
              if (!upstream.body) return res.end();
              for await (const chunk of upstream.body) res.write(chunk);
              res.end();
            } catch (error) {
              res.statusCode = 502;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: error?.message || "Could not reach the AI service." }));
            }
          });
        },
      },
    ],
  };
});
