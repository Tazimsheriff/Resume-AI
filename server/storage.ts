import { db } from "./db";
import {
  resumes,
  type InsertResume,
  type UpdateResumeRequest,
  type Resume,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getResumes(): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, updates: UpdateResumeRequest): Promise<Resume>;
  deleteResume(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getResumes(): Promise<Resume[]> {
    return await db.select().from(resumes).orderBy(resumes.createdAt);
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const [resume] = await db
      .insert(resumes)
      .values(insertResume)
      .returning();
    return resume;
  }

  async updateResume(id: number, updates: UpdateResumeRequest): Promise<Resume> {
    const [updated] = await db
      .update(resumes)
      .set(updates)
      .where(eq(resumes.id, id))
      .returning();
    return updated;
  }

  async deleteResume(id: number): Promise<void> {
    await db.delete(resumes).where(eq(resumes.id, id));
  }
}

export const storage = new DatabaseStorage();
