import { z } from "zod";
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export const registerSchema = loginSchema.extend({ name: z.string().min(2).max(80), programId: z.string().min(1), semesterId: z.string().min(1), sectionId: z.string().min(1) });
export const entitySchema = z.object({ name: z.string().min(2).max(100) });
export const calculationSchema = z.object({ subjectOfferingId: z.string().min(1), marks: z.array(z.object({ componentId: z.string(), obtainedMarks: z.number().min(0).nullable() })) });
