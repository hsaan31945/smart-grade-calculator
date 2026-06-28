import { PrismaClient, Role, SubjectType, OfferingStatus, VerificationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  await db.gpaCourse.deleteMany(); await db.gpaRecord.deleteMany();
  await db.studentComponentMark.deleteMany(); await db.studentCalculation.deleteMany();
  await db.classStatistic.deleteMany(); await db.assessmentComponent.deleteMany();
  await db.subjectOffering.deleteMany(); await db.relativeGradeBoundary.deleteMany();
  await db.relativeGradePolicy.deleteMany(); await db.subject.deleteMany();
  await db.user.deleteMany(); await db.teacher.deleteMany(); await db.section.deleteMany();
  await db.semester.deleteMany(); await db.program.deleteMany();

  const programs = await Promise.all(["BS Artificial Intelligence", "BS Computer Science", "BS Software Engineering"].map(name => db.program.create({ data: { name } })));
  const semesters = await Promise.all(["1st Semester", "2nd Semester", "3rd Semester", "4th Semester"].map((name, i) => db.semester.create({ data: { name, order: i + 1 } })));
  const sections = await Promise.all(["Section A", "Section B"].map(name => db.section.create({ data: { name } })));
  const teachers = await Promise.all([
    { name: "Mam Tabasum", email: "tabasum@university.edu", department: "Computer Science" },
    { name: "Sir Ali", email: "ali@university.edu", department: "Mathematics" },
    { name: "Sir Ahmed", email: "ahmed@university.edu", department: "Cyber Security" },
  ].map(data => db.teacher.create({ data })));
  const ai = programs[0], third = semesters[2];
  const subjectData = [
    ["Data Structures", "CS-215", 3, SubjectType.THEORY], ["Linear Algebra", "MTH-201", 3, SubjectType.THEORY],
    ["Software Engineering", "SE-301", 3, SubjectType.THEORY], ["Computer Networks", "CS-310", 3, SubjectType.THEORY],
    ["Artificial Intelligence Lab", "AI-220L", 1, SubjectType.LAB], ["Information Security Lab", "CY-315L", 1, SubjectType.LAB],
  ] as const;
  const subjects = await Promise.all(subjectData.map(([name, code, creditHours, subjectType]) => db.subject.create({ data: { name, code, creditHours, subjectType, programId: ai.id, semesterId: third.id } })));

  const policy = await db.relativeGradePolicy.create({ data: { name: "University Relative Curve", description: "Default z-score based relative grading policy.", boundaries: { create: [
    ["A", 1.5, 4, 1], ["A-", 1, 3.7, 2], ["B+", .5, 3.3, 3], ["B", 0, 3, 4],
    ["C+", -.5, 2.7, 5], ["C", -1, 2.3, 6], ["D", -1.5, 1, 7], ["F", -999, 0, 8],
  ].map(([grade, minZScore, gradePoint, sortOrder]) => ({ grade: String(grade), minZScore: Number(minZScore), gradePoint: Number(gradePoint), sortOrder: Number(sortOrder) })) } } });
  const offering = await db.subjectOffering.create({ data: { subjectId: subjects[0].id, programId: ai.id, semesterId: third.id, sectionId: sections[0].id, teacherId: teachers[0].id, academicTerm: "Spring 2026", relativeGradePolicyId: policy.id, status: OfferingStatus.PUBLISHED } });
  const components = await Promise.all([
    ["Assignments", 20, 10], ["Quizzes", 20, 10], ["Midterm", 30, 25], ["Final", 100, 50], ["Project", 20, 5],
  ].map(([name, totalMarks, weightage], i) => db.assessmentComponent.create({ data: { subjectOfferingId: offering.id, name: String(name), totalMarks: Number(totalMarks), weightage: Number(weightage), sortOrder: i + 1 } })));
  const passwordHash = await bcrypt.hash("admin12345", 12);
  const admin = await db.user.create({ data: { name: "Vireonix Admin", email: "admin@vireonix.com", passwordHash, role: Role.ADMIN } });
  await db.user.create({ data: { name: "Test Student", email: "student@test.com", passwordHash: await bcrypt.hash("student12345", 12), role: Role.STUDENT, programId: ai.id, semesterId: third.id, sectionId: sections[0].id } });
  await db.classStatistic.create({ data: { subjectOfferingId: offering.id, average: 68, standardDeviation: 11, totalStudents: 42, minMarks: 31, maxMarks: 94, verificationStatus: VerificationStatus.ADMIN_VERIFIED, updatedById: admin.id } });
  await Promise.all(components.map((c, i) => db.classStatistic.create({ data: { subjectOfferingId: offering.id, componentId: c.id, average: [14, 13, 21, 68, 15][i], standardDeviation: [3, 4, 6, 12, 3][i], totalStudents: 42, verificationStatus: VerificationStatus.ADMIN_VERIFIED, updatedById: admin.id } })));
}

main().finally(() => db.$disconnect());
