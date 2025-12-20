import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: jsonb("content").notNull(), // Stores the entire resume structure
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

// Request Types
export type CreateResumeRequest = InsertResume;
export type UpdateResumeRequest = Partial<InsertResume>;

// Structure of the Resume Content JSON
export const resumeContentSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
  summary: z.string().optional(),
  experience: z.array(z.object({
    id: z.string(),
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    description: z.string(),
  })).optional(),
  education: z.array(z.object({
    id: z.string(),
    school: z.string(),
    degree: z.string(),
    year: z.string(),
  })).optional(),
  skills: z.array(z.string()).optional(),
});

export type ResumeContent = z.infer<typeof resumeContentSchema>;

// AI Suggestion Types
export const aiSuggestionSchema = z.object({
  field: z.string(),
  currentText: z.string(),
  context: z.string().optional(), // e.g., "make it more professional"
});

export type AiSuggestionRequest = z.infer<typeof aiSuggestionSchema>;

export interface AiSuggestionResponse {
  suggestion: string;
}
