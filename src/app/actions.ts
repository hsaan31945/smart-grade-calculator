"use server";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { getDb } from "@/lib/db";
import { registerSchema, calculationSchema } from "@/lib/validators";
import { requireAdmin, requireStudent } from "@/lib/guards";
import { calculateRelativeGrade, weightedMark } from "@/lib/grading";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(_: unknown, formData: FormData) {
  try { await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirectTo: "/dashboard" }); }
  catch (e) { if (e instanceof AuthError) return { error: "Invalid email or password." }; throw e; }
}
export async function registerAction(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const db = getDb(); if (await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } })) return { error: "An account with this email already exists." };
  await db.user.create({ data: { ...parsed.data, email: parsed.data.email.toLowerCase(), passwordHash: await bcrypt.hash(parsed.data.password, 12), password: undefined } as never });
  await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: "/dashboard" });
}
export async function logoutAction() { await signOut({ redirectTo: "/" }); }

export async function saveCalculation(payload: unknown, calculationId?: string) {
  const session = await requireStudent(); const parsed = calculationSchema.parse(payload); const db = getDb();
  const offering = await db.subjectOffering.findFirst({ where: { id: parsed.subjectOfferingId, status: "PUBLISHED" }, include: { components: true, statistics: { where: { componentId: null } }, relativeGradePolicy: { include: { boundaries: true } } } });
  if (!offering) throw new Error("No subject data found. Please contact admin.");
  const markMap = new Map(parsed.marks.map(m => [m.componentId, m.obtainedMarks]));
  const marks = offering.components.map(c => { const value = markMap.get(c.id) ?? null; if (value !== null && value > c.totalMarks) throw new Error(`${c.name} cannot exceed ${c.totalMarks}.`); return { componentId: c.id, obtainedMarks: value, totalMarks: c.totalMarks, weightage: c.weightage }; });
  const stat = offering.statistics[0]; const result = calculateRelativeGrade(marks, stat?.average ?? null, stat?.standardDeviation ?? null, offering.relativeGradePolicy?.boundaries ?? []);
  const data = { subjectOfferingId: offering.id, totalObtained: marks.every(m => m.obtainedMarks !== null) ? marks.reduce((s,m)=>s+m.obtainedMarks!,0) : null, totalWeighted: "percentage" in result ? result.percentage : null, percentage: "percentage" in result ? result.percentage : null, zScore: result.status === "complete" ? result.zScore : null, differenceFromAverage: result.status === "complete" ? result.difference : null, predictedGrade: result.status === "complete" ? result.grade : null, gradePoint: result.status === "complete" ? result.gradePoint : null, passStatus: result.status === "complete" ? (result.grade === "F" ? "FAIL" : "PASS") : "DRAFT" };
  let id = calculationId;
  if (id) {
    const owned = await db.studentCalculation.findFirst({ where: { id, userId: session.user.id } }); if (!owned) throw new Error("Result not found.");
    await db.studentCalculation.update({ where: { id }, data: { ...data, marks: { deleteMany: {}, create: marks.map(m => ({ componentId: m.componentId, obtainedMarks: m.obtainedMarks, weightedMarks: m.obtainedMarks === null ? null : weightedMark(m.obtainedMarks, m.totalMarks, m.weightage) })) } } });
  } else {
    const created = await db.studentCalculation.create({ data: { userId: session.user.id, ...data, marks: { create: marks.map(m => ({ componentId: m.componentId, obtainedMarks: m.obtainedMarks, weightedMarks: m.obtainedMarks === null ? null : weightedMark(m.obtainedMarks, m.totalMarks, m.weightage) })) } } }); id = created.id;
  }
  revalidatePath("/dashboard"); revalidatePath("/results"); return { id, status: result.status };
}
export async function deleteCalculation(id: string) { const s = await requireStudent(); const result = await getDb().studentCalculation.deleteMany({ where: { id, userId: s.user.id } }); if (!result.count) throw new Error("Result not found."); revalidatePath("/results"); }

export async function saveGpaRecord(payload: { semesterId: string; courses: { subjectId?: string; calculationId?: string; courseName: string; creditHours: number; grade: string; gradePoint: number }[] }, id?: string) {
  const s = await requireStudent(); const courses = payload.courses.map(c => ({ ...c, qualityPoints: c.creditHours * c.gradePoint })); const credits = courses.reduce((a,c)=>a+c.creditHours,0); const semesterGpa = credits ? courses.reduce((a,c)=>a+c.qualityPoints,0)/credits : 0; const db = getDb();
  if (id) { const owned = await db.gpaRecord.findFirst({ where: { id, userId: s.user.id } }); if (!owned) throw new Error("GPA record not found."); await db.gpaRecord.update({ where: { id }, data: { semesterId: payload.semesterId, semesterGpa, courses: { deleteMany: {}, create: courses } } }); }
  else await db.gpaRecord.create({ data: { userId: s.user.id, semesterId: payload.semesterId, semesterGpa, courses: { create: courses } } });
  revalidatePath("/calculator/gpa"); revalidatePath("/dashboard"); return { semesterGpa };
}
export async function deleteGpaRecord(id: string) { const s = await requireStudent(); await getDb().gpaRecord.deleteMany({ where: { id, userId: s.user.id } }); revalidatePath("/calculator/gpa"); }

export async function upsertSimpleEntity(kind: "program"|"semester"|"section"|"teacher", data: Record<string, string|number>, id?: string) { await requireAdmin(); const db = getDb(); const model = kind === "program" ? db.program : kind === "semester" ? db.semester : kind === "section" ? db.section : db.teacher; if (id) await (model as never as { update(args: unknown): Promise<unknown> }).update({ where: { id }, data }); else await (model as never as { create(args: unknown): Promise<unknown> }).create({ data }); revalidatePath(`/admin/${kind === "teacher" ? "teachers" : `${kind}s`}`); }
export async function deleteSimpleEntity(kind: "program"|"semester"|"section"|"teacher", id: string) { await requireAdmin(); const db = getDb(); const model = kind === "program" ? db.program : kind === "semester" ? db.semester : kind === "section" ? db.section : db.teacher; await (model as never as { delete(args: unknown): Promise<unknown> }).delete({ where: { id } }); revalidatePath("/admin"); }
export async function saveSubject(data:{name:string;code:string;creditHours:number;subjectType:"THEORY"|"LAB"|"THEORY_AND_LAB";programId:string;semesterId:string},id?:string){await requireAdmin();if(id)await getDb().subject.update({where:{id},data});else await getDb().subject.create({data});revalidatePath("/admin/subjects");}
export async function deleteSubject(id:string){await requireAdmin();await getDb().subject.delete({where:{id}});revalidatePath("/admin/subjects");}
export async function saveOffering(data:{subjectId:string;programId:string;semesterId:string;sectionId:string;teacherId:string;academicTerm:string;relativeGradePolicyId?:string;status:"DRAFT"|"PUBLISHED"|"ARCHIVED"},id?:string){await requireAdmin();if(data.status==="PUBLISHED"&&id){const o=await getDb().subjectOffering.findUnique({where:{id},include:{components:true,statistics:{where:{componentId:null}}}});const weight=o?.components.reduce((a,c)=>a+c.weightage,0)??0;if(Math.abs(weight-100)>.001)throw new Error("Publishing requires component weightage to equal 100%.");if(!o?.statistics[0]?.standardDeviation)throw new Error("Publishing requires a non-zero standard deviation.");}if(id)await getDb().subjectOffering.update({where:{id},data});else await getDb().subjectOffering.create({data});revalidatePath("/admin/subject-offerings");}
export async function saveComponent(offeringId:string,data:{name:string;totalMarks:number;weightage:number;sortOrder:number;isRequired:boolean},id?:string){await requireAdmin();if(id)await getDb().assessmentComponent.update({where:{id},data});else await getDb().assessmentComponent.create({data:{...data,subjectOfferingId:offeringId}});revalidatePath(`/admin/subject-offerings/${offeringId}`);}
export async function deleteComponent(id:string,offeringId:string){await requireAdmin();await getDb().assessmentComponent.delete({where:{id}});revalidatePath(`/admin/subject-offerings/${offeringId}`);}
export async function saveClassStatistic(data:{subjectOfferingId:string;average:number;standardDeviation:number;totalStudents?:number;verificationStatus:"DRAFT"|"UNVERIFIED"|"ADMIN_VERIFIED"|"UPDATED_RECENTLY"}){const s=await requireAdmin();const db=getDb();const existing=await db.classStatistic.findFirst({where:{subjectOfferingId:data.subjectOfferingId,componentId:null}});if(existing)await db.classStatistic.update({where:{id:existing.id},data:{...data,updatedById:s.user.id}});else await db.classStatistic.create({data:{...data,updatedById:s.user.id}});revalidatePath("/admin/class-statistics");}
export async function goTo(path: string) { redirect(path); }
