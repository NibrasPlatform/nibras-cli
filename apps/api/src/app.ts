import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rawBodyPlugin from "fastify-raw-body";
import { PrismaClient } from "@prisma/client";
import { loadGitHubAppConfig } from "@nibras/github";
import { PrismaStore } from "./prisma-store";
import { AppStore, FileStore, getStorePath } from "./store";
import { registerGitHubRoutes } from "./features/github/routes";
import { registerHostedCliRoutes } from "./features/hosted-cli/routes";
import { registerTrackingRoutes } from "./features/tracking/routes";
import { registerAdminRoutes } from "./features/admin/routes";

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedCorsOrigins(): string[] {
  const configuredOrigins = process.env.NIBRAS_WEB_CORS_ORIGINS;
  const candidates = configuredOrigins
    ? configuredOrigins.split(",")
    : [
        process.env.NIBRAS_WEB_BASE_URL,
        process.env.NEXT_PUBLIC_NIBRAS_WEB_BASE_URL,
        "http://127.0.0.1:3000",
        "http://localhost:3000"
      ];

  const origins = new Set<string>();
  for (const candidate of candidates) {
    const normalized = normalizeOrigin(candidate?.trim());
    if (normalized) {
      origins.add(normalized);
    }
  }
  return Array.from(origins);
}

function createDefaultStore(): AppStore {
  if (process.env.DATABASE_URL) {
    return new PrismaStore();
  }
  return new FileStore(getStorePath());
}

export function buildApp(store: AppStore = createDefaultStore()): FastifyInstance {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
      transport: process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined
    },
    genReqId: () => `req_${Math.random().toString(36).slice(2, 10)}`
  });

  const githubConfig = loadGitHubAppConfig();
  const allowedCorsOrigins = new Set(getAllowedCorsOrigins());

  // Propagate Request-Id to response for tracing
  app.addHook("onSend", async (request, reply) => {
    void reply.header("X-Request-Id", request.id);
  });

  void app.register(cors, {
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["authorization", "content-type", "x-request-id"],
    exposedHeaders: ["x-request-id"],
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, allowedCorsOrigins.has(origin));
    }
  });

  void app.register(rawBodyPlugin, {
    field: "rawBody",
    global: false,
    encoding: false,
    routes: ["/v1/github/webhooks"]
  });

  // ── Health & readiness ────────────────────────────────────────────────────
  app.get("/healthz", async (_request, reply) => {
    return reply.send({ ok: true });
  });

  app.get("/readyz", async (_request, reply) => {
    if (process.env.DATABASE_URL) {
      try {
        const prisma = new PrismaClient();
        await prisma.$queryRaw`SELECT 1`;
        await prisma.$disconnect();
      } catch {
        return reply.status(503).send({ ok: false, reason: "database unavailable" });
      }
    }
    return reply.send({ ok: true });
  });

  app.addHook("onClose", async () => {
    if (store.close) {
      await store.close();
    }
  });

  registerGitHubRoutes(app, store, githubConfig);
  registerHostedCliRoutes(app, store, githubConfig);
  registerTrackingRoutes(app, store);
  registerAdminRoutes(app, store);

  return app;
}

