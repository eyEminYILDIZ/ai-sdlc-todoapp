import { CanvasError, createCanvas, joinSession } from "@github/copilot-sdk/extension";
import { createServer } from "node:http";
import { renderBackendPage } from "./backend_page.mjs";

const instanceState = new Map();
let server;
let serverOrigin;

const canvas = createCanvas({
  id: "ai-sdlc-todoapp-backend-api",
  displayName: "AI SDLC Todo App Backend API",
  description: "Shows the todo app backend endpoint, JSON response contract, OpenAPI document, CORS policy, and current in-memory storage.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      projectName: {
        type: "string",
        description: "Project name shown in the endpoint canvas.",
        default: "ai-sdlc-todoapp",
      },
      apiBaseUrl: {
        type: "string",
        format: "uri",
        description: "API origin shown in the canvas.",
        default: "http://localhost:5000",
      },
      focus: {
        type: "string",
        enum: ["all", "get-todos", "openapi", "cors"],
        description: "Backend area to emphasize when the canvas opens.",
        default: "all",
      },
    },
  },
  actions: [
    {
      name: "focus_backend_area",
      description: "Emphasize the endpoint, OpenAPI, or CORS area in the backend canvas.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["focus"],
        properties: {
          focus: { type: "string", enum: ["all", "get-todos", "openapi", "cors"] },
        },
      },
      handler: async ({ instanceId, input }) => {
        const state = instanceState.get(instanceId);
        if (!state) throw new CanvasError("instance_not_found", "The backend canvas instance is not open.");
        if (!["all", "get-todos", "openapi", "cors"].includes(input?.focus)) {
          throw new CanvasError("invalid_focus", "Unsupported backend focus.");
        }
        const nextState = { ...state, focus: input.focus };
        instanceState.set(instanceId, nextState);
        return { instanceId, focus: nextState.focus, status: "updated" };
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
        title: "Todo app backend API",
        status: "GET /todos · OpenAPI · CORS · in-memory",
      };
    } catch (error) {
      if (error instanceof CanvasError) throw error;
      throw new CanvasError("canvas_open_failed", error instanceof Error ? error.message : "Unable to open the backend canvas.");
    }
  },
  onClose: () => {
    // The shared server and instance state remain available for a later reopen.
  },
});

await joinSession({ canvases: [canvas] });

function createState(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Canvas input must be an object.");
  }
  const projectName = readText(input.projectName, "ai-sdlc-todoapp", 80);
  const apiBaseUrl = readUrl(input.apiBaseUrl, "http://localhost:5000");
  const focus = input.focus ?? "all";
  if (!["all", "get-todos", "openapi", "cors"].includes(focus)) {
    throw new TypeError("Unsupported backend focus.");
  }
  return { projectName, apiBaseUrl, focus };
}

function readText(value, fallback, maxLength) {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maxLength) {
    throw new TypeError(`Expected a non-empty string of at most ${maxLength} characters.`);
  }
  return value.trim();
}

function readUrl(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== "string") throw new TypeError("apiBaseUrl must be a URL.");
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    return url.origin;
  } catch {
    throw new TypeError("apiBaseUrl must be an HTTP or HTTPS URL.");
  }
}

async function ensureServer() {
  if (serverOrigin) return;

  server = createServer((request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
      const instanceId = requestUrl.searchParams.get("instanceId") || "";
      if (request.method === "GET" && requestUrl.pathname === "/") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        response.end(renderBackendPage());
        return;
      }
      if (request.method === "GET" && requestUrl.pathname === "/state") {
        const state = instanceState.get(instanceId);
        if (!state) {
          sendError(response, 404, "Canvas instance was not found.");
          return;
        }
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
        response.end(JSON.stringify(state));
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

function sendError(response, status, message) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify({ error: message }));
}
