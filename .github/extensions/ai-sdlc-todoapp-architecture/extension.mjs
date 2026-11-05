import { CanvasError, createCanvas, joinSession } from "@github/copilot-sdk/extension";
import { createServer } from "node:http";
import { renderDiagramPage } from "./diagram_page.mjs";
import { createState, updateFocus } from "./diagram_state.mjs";

const instanceState = new Map();
let server;
let serverOrigin;

const canvas = createCanvas({
  id: "ai-sdlc-todoapp-architecture",
  displayName: "AI SDLC Todo App Architecture",
  description: "Shows the todo app's external architecture: user, React webapp, JSON API, current memory storage, and an assumed persistent database.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      projectName: {
        type: "string",
        description: "Project name shown in the diagram.",
        default: "ai-sdlc-todoapp",
      },
      apiBaseUrl: {
        type: "string",
        format: "uri",
        description: "API origin shown in the diagram.",
        default: "http://localhost:5000",
      },
      databaseMode: {
        type: "string",
        description: "Label for the assumed database boundary.",
        default: "Varsayımsal kalıcı veritabanı",
      },
      focus: {
        type: "string",
        enum: ["all", "user", "webapp", "api", "storage", "database"],
        description: "Component to emphasize when the canvas opens.",
        default: "all",
      },
    },
  },
  actions: [
    {
      name: "focus_component",
      description: "Emphasize one component in the architecture diagram.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["focus"],
        properties: {
          focus: {
            type: "string",
            enum: ["all", "user", "webapp", "api", "storage", "database"],
          },
        },
      },
      handler: async ({ instanceId, input }) => {
        const state = instanceState.get(instanceId);
        if (!state) throw new CanvasError("instance_not_found", "The architecture canvas instance is not open.");
        try {
          const nextState = updateFocus(state, input?.focus);
          instanceState.set(instanceId, nextState);
          return { instanceId, focus: nextState.focus, status: "updated" };
        } catch (error) {
          throw new CanvasError("invalid_focus", error instanceof Error ? error.message : "Invalid component focus.");
        }
      },
    },
  ],
  open: async ({ instanceId, input }) => {
    if (typeof instanceId !== "string" || instanceId.length === 0) {
      throw new CanvasError("invalid_instance", "A non-empty instanceId is required.");
    }
    try {
      if (!instanceState.has(instanceId)) {
        instanceState.set(instanceId, createState(input));
      }
      await ensureServer();
      return {
        url: `${serverOrigin}/?instanceId=${encodeURIComponent(instanceId)}`,
        title: "Todo app mimari görünümü",
        status: "Kullanıcı → Webapp → API → veri katmanı",
      };
    } catch (error) {
      if (error instanceof CanvasError) throw error;
      throw new CanvasError("canvas_open_failed", error instanceof Error ? error.message : "Unable to open the architecture canvas.");
    }
  },
  onClose: () => {
    // The shared server and instance state remain available for a later reopen.
  },
});

await joinSession({ canvases: [canvas] });

async function ensureServer() {
  if (serverOrigin) return;

  server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
      const instanceId = requestUrl.searchParams.get("instanceId") || "";

      if (request.method === "GET" && requestUrl.pathname === "/") {
        sendHtml(response, renderDiagramPage());
        return;
      }

      if (request.method === "GET" && requestUrl.pathname === "/state") {
        const state = instanceState.get(instanceId);
        if (!state) {
          sendError(response, 404, "Canvas instance was not found.");
          return;
        }
        sendJson(response, state);
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/focus") {
        const state = instanceState.get(instanceId);
        if (!state) {
          sendError(response, 404, "Canvas instance was not found.");
          return;
        }
        const body = await readJson(request);
        try {
          const nextState = updateFocus(state, body?.focus);
          instanceState.set(instanceId, nextState);
          sendJson(response, nextState);
        } catch (error) {
          sendError(response, 400, error instanceof Error ? error.message : "Invalid focus.");
        }
        return;
      }

      sendError(response, 404, "Not found.");
    } catch (error) {
      sendError(response, 500, error instanceof Error ? error.message : "Canvas server error.");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Canvas server did not expose a TCP address."));
        return;
      }
      serverOrigin = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
}

function sendHtml(response, html) {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  response.end(html);
}

function sendJson(response, value) {
  response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}

function sendError(response, status, message) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify({ error: message }));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 10_000) throw new Error("Request body is too large.");
  }
  if (!body) return {};
  const parsed = JSON.parse(body);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Request body must be a JSON object.");
  }
  return parsed;
}
