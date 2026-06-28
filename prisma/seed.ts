import {
  OfferingStatus,
  PrismaClient,
  Role,
  SubjectType,
  VerificationStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

type ComponentSeed = [name: string, totalMarks: number, weightage: number];
type SubjectSeed = {
  name: string;
  code: string;
  creditHours: number;
  type: SubjectType;
  semesterOrder: 1 | 2 | 3;
  policy?: ComponentSeed[];
};

const standardTheory: ComponentSeed[] = [
  ["Quizzes", 20, 10],
  ["Assignments", 20, 10],
  ["CCP", 20, 10],
  ["Midterm", 30, 25],
  ["Final", 100, 45],
];

const labPolicy: ComponentSeed[] = [
  ["Labs", 100, 50],
  ["Midterm", 30, 15],
  ["Project", 100, 15],
  ["Final", 100, 20],
];

const dsaTheory: ComponentSeed[] = [
  ["Quizzes", 20, 15],
  ["Assignments", 20, 5],
  ["CCP", 20, 10],
  ["Midterm", 30, 25],
  ["Final", 100, 45],
];

const subjects: SubjectSeed[] = [
  { name: "Programming Fundamentals", code: "CS111", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 1 },
  { name: "Programming Fundamentals Lab", code: "CS111L", creditHours: 1, type: SubjectType.LAB, semesterOrder: 1 },
  { name: "Application of Information and Communication Technologies", code: "CS181", creditHours: 2, type: SubjectType.THEORY, semesterOrder: 1 },
  { name: "Application of Information and Communication Technologies Lab", code: "CS181L", creditHours: 1, type: SubjectType.LAB, semesterOrder: 1 },
  { name: "Functional English", code: "EL170", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 1 },
  { name: "Foundational Mathematics (Non-Credit)", code: "MA114", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 1 },
  { name: "Discrete Structures", code: "MA216", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 1 },
  { name: "Pre-Calculus (Non-Credit)", code: "MA118", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 1 },
  { name: "Ideology and Constitution of Pakistan", code: "HU405", creditHours: 2, type: SubjectType.THEORY, semesterOrder: 1 },

  { name: "Database Systems", code: "CS130", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 2 },
  { name: "Database Systems Lab", code: "CS130L", creditHours: 1, type: SubjectType.LAB, semesterOrder: 2 },
  { name: "Object Oriented Programming", code: "CS112", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 2 },
  { name: "Object Oriented Programming Lab", code: "CS112L", creditHours: 1, type: SubjectType.LAB, semesterOrder: 2 },
  { name: "Digital Logic Design", code: "EE123", creditHours: 2, type: SubjectType.THEORY, semesterOrder: 2 },
  { name: "Digital Logic Design Lab", code: "EE123L", creditHours: 1, type: SubjectType.LAB, semesterOrder: 2 },
  { name: "Calculus and Analytical Geometry", code: "MA110", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 2 },
  { name: "Probability and Statistics", code: "MA301", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 2 },

  { name: "Information Security", code: "CS215", creditHours: 2, type: SubjectType.THEORY, semesterOrder: 3, policy: standardTheory },
  { name: "Information Security Lab", code: "CS215L", creditHours: 1, type: SubjectType.LAB, semesterOrder: 3, policy: labPolicy },
  { name: "Introduction to Artificial Intelligence", code: "AI232", creditHours: 2, type: SubjectType.THEORY, semesterOrder: 3, policy: standardTheory },
  { name: "Introduction to Artificial Intelligence Lab", code: "AI232L", creditHours: 1, type: SubjectType.LAB, semesterOrder: 3, policy: labPolicy },
  { name: "Computer Networks", code: "CS260", creditHours: 2, type: SubjectType.THEORY, semesterOrder: 3, policy: standardTheory },
  { name: "Computer Networks Lab", code: "CS260L", creditHours: 1, type: SubjectType.LAB, semesterOrder: 3, policy: labPolicy },
  { name: "Data Structures", code: "CS216", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 3, policy: dsaTheory },
  { name: "Data Structures Lab", code: "CS216L", creditHours: 1, type: SubjectType.LAB, semesterOrder: 3, policy: labPolicy },
  { name: "Introduction to Software Engineering", code: "SE101", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 3, policy: standardTheory },
  { name: "Linear Algebra", code: "MA201", creditHours: 3, type: SubjectType.THEORY, semesterOrder: 3, policy: standardTheory },
];

async function clearDatabase() {
  await db.passwordResetToken.deleteMany();
  await db.gpaCourse.deleteMany();
  await db.gpaRecord.deleteMany();
  await db.studentComponentMark.deleteMany();
  await db.studentCalculation.deleteMany();
  await db.classStatistic.deleteMany();
  await db.assessmentComponent.deleteMany();
  await db.subjectOffering.deleteMany();
  await db.relativeGradeBoundary.deleteMany();
  await db.relativeGradePolicy.deleteMany();
  await db.subject.deleteMany();
  await db.user.deleteMany();
  await db.teacher.deleteMany();
  await db.section.deleteMany();
  await db.semester.deleteMany();
  await db.program.deleteMany();
}

async function main() {
  await clearDatabase();

  const programs = await Promise.all(
    ["BS Artificial Intelligence", "BS Computer Science", "BS Software Engineering"].map((name) =>
      db.program.create({ data: { name } }),
    ),
  );
  const semesters = await Promise.all(
    ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester"].map((name, index) =>
      db.semester.create({ data: { name, order: index + 1 } }),
    ),
  );
  const sections = await Promise.all(
    ["Section A", "Section B"].map((name) => db.section.create({ data: { name } })),
  );
  const teachers = await Promise.all(
    [
      { name: "Mam Tabasum", email: "tabasum@university.edu", department: "Computer Science" },
      { name: "Sir Ali", email: "ali@university.edu", department: "Mathematics" },
      { name: "Sir Ahmed", email: "ahmed@university.edu", department: "Cyber Security" },
    ].map((data) => db.teacher.create({ data })),
  );

  const program = programs[0];
  const thirdSemester = semesters[2];
  const policy = await db.relativeGradePolicy.create({
    data: {
      name: "University Relative Curve",
      description: "Default z-score based relative grading policy.",
      boundaries: {
        create: [
          ["A", 1.5, 4, 1], ["A-", 1, 3.7, 2], ["B+", 0.5, 3.3, 3], ["B", 0, 3, 4],
          ["C+", -0.5, 2.7, 5], ["C", -1, 2.3, 6], ["D", -1.5, 1, 7], ["F", -999, 0, 8],
        ].map(([grade, minZScore, gradePoint, sortOrder]) => ({
          grade: String(grade), minZScore: Number(minZScore), gradePoint: Number(gradePoint), sortOrder: Number(sortOrder),
        })),
      },
    },
  });

  const admin = await db.user.create({
    data: {
      name: "Vireonix Admin",
      email: "admin@vireonix.com",
      passwordHash: await bcrypt.hash("admin12345", 12),
      role: Role.ADMIN,
    },
  });
  await db.user.create({
    data: {
      name: "Test Student",
      email: "student@test.com",
      passwordHash: await bcrypt.hash("student12345", 12),
      role: Role.STUDENT,
      programId: program.id,
      semesterId: thirdSemester.id,
      sectionId: sections[0].id,
    },
  });

  for (const [subjectIndex, definition] of subjects.entries()) {
    const subjectSemester = semesters[definition.semesterOrder - 1];
    const subject = await db.subject.create({
      data: {
        name: definition.name,
        code: definition.code,
        creditHours: definition.creditHours,
        subjectType: definition.type,
        programId: program.id,
        semesterId: subjectSemester.id,
      },
    });

    if (!definition.policy) continue;

    const offering = await db.subjectOffering.create({
      data: {
        subjectId: subject.id,
        programId: program.id,
        semesterId: subjectSemester.id,
        sectionId: sections[0].id,
        teacherId: teachers[subjectIndex % teachers.length].id,
        academicTerm: "Spring 2026",
        relativeGradePolicyId: policy.id,
        status: OfferingStatus.PUBLISHED,
      },
    });
    await Promise.all(
      definition.policy.map(([name, totalMarks, weightage], sortOrder) =>
        db.assessmentComponent.create({
          data: {
            subjectOfferingId: offering.id,
            name,
            totalMarks,
            weightage,
            sortOrder: sortOrder + 1,
            isRequired: true,
          },
        }),
      ),
    );
    await db.classStatistic.create({
      data: {
        subjectOfferingId: offering.id,
        average: 68,
        standardDeviation: 11,
        totalStudents: 42,
        verificationStatus: VerificationStatus.UNVERIFIED,
        updatedById: admin.id,
      },
    });
  }
}

main().finally(() => db.$disconnect());
