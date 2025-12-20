import { z } from "zod";
import { insertResumeSchema, resumes, aiSuggestionSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  resumes: {
    list: {
      method: "GET" as const,
      path: "/api/resumes",
      responses: {
        200: z.array(z.custom<typeof resumes.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/resumes/:id",
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/resumes",
      input: insertResumeSchema,
      responses: {
        201: z.custom<typeof resumes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/resumes/:id",
      input: insertResumeSchema.partial(),
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/resumes/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    suggest: {
      method: "POST" as const,
      path: "/api/ai/suggest",
      input: aiSuggestionSchema,
      responses: {
        200: z.object({ suggestion: z.string() }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
