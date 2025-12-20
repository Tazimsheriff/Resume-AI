import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client - it will use the REPLIT_AI_KEY environment variable automatically
// or we can configure it if needed, but Replit's integration usually sets env vars.
// However, the blueprint description says "internally uses Replit AI Integrations".
// Often this means using the standard OpenAI SDK but with a specific base URL or key.
// Let's assume standard OpenAI SDK usage as per blueprint common practices.
// If REPLIT_AI_KEY is not set, we might need to handle it.
// The integration sets OPENAI_API_KEY usually.

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // -- AI Route --
  app.post(api.resumes.suggest.path, async (req, res) => {
    try {
      const { field, currentText, context } = api.resumes.suggest.input.parse(req.body);

      // Check for API Key
      const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

      if (!apiKey) {
         return res.status(500).json({ message: "OpenAI API Key not configured" });
      }

      const openai = new OpenAI({ 
        apiKey,
        baseURL
      });

      const prompt = `
        You are a professional resume editor. 
        Improve the following text for a resume's "${field}" section.
        Context/Instruction: ${context || "Make it more professional and impactful."}
        
        Original Text:
        "${currentText}"

        Provide only the improved text, nothing else.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Or gpt-4o-mini if available and cheaper/better
        messages: [{ role: "user", content: prompt }],
      });

      const suggestion = response.choices[0].message.content?.trim() || "";

      res.json({ suggestion });

    } catch (err) {
      console.error("AI Suggestion Error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Failed to generate suggestion" });
    }
  });

  // -- CRUD Routes --

  app.get(api.resumes.list.path, async (req, res) => {
    const resumes = await storage.getResumes();
    res.json(resumes);
  });

  app.get(api.resumes.get.path, async (req, res) => {
    const resume = await storage.getResume(Number(req.params.id));
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  });

  app.post(api.resumes.create.path, async (req, res) => {
    try {
      const input = api.resumes.create.input.parse(req.body);
      const resume = await storage.createResume(input);
      res.status(201).json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.resumes.update.path, async (req, res) => {
    try {
      const input = api.resumes.update.input.parse(req.body);
      const resume = await storage.updateResume(Number(req.params.id), input);
      res.json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.resumes.delete.path, async (req, res) => {
    await storage.deleteResume(Number(req.params.id));
    res.status(204).send();
  });

  // Seed Data (if empty)
  const existing = await storage.getResumes();
  if (existing.length === 0) {
    await storage.createResume({
      title: "Software Engineer Sample",
      content: {
        personalInfo: {
          fullName: "Jane Doe",
          email: "jane@example.com",
          location: "San Francisco, CA",
          linkedin: "linkedin.com/in/janedoe",
        },
        summary: "Passionate Full Stack Developer with 5 years of experience building scalable web applications.",
        experience: [
          {
            id: "1",
            company: "Tech Corp",
            position: "Senior Developer",
            startDate: "2020-01",
            endDate: "Present",
            description: "Led a team of 5 engineers. Improved system performance by 30%.",
          },
        ],
        education: [
          {
            id: "1",
            school: "University of Tech",
            degree: "BS Computer Science",
            year: "2019",
          }
        ],
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      },
    });
  }

  return httpServer;
}
