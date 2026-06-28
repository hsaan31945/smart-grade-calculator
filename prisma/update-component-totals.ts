import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const quizzes = await db.assessmentComponent.updateMany({
    where: { name: { in: ["Quizzes", "Quizzes (4 × 10)"] } },
    data: { name: "Quizzes (4 × 10)", totalMarks: 40 },
  });
  const assignments = await db.assessmentComponent.updateMany({
    where: { name: { in: ["Assignments", "Assignments (4 × 10)"] } },
    data: { name: "Assignments (4 × 10)", totalMarks: 40 },
  });
  const labs = await db.assessmentComponent.updateMany({
    where: { name: { in: ["Labs", "Labs (13 × 25)"] } },
    data: { name: "Labs (13 × 25)", totalMarks: 325 },
  });

  const theoryOfferings = await db.subjectOffering.findMany({
    where: { subject: { subjectType: "THEORY" } },
  });
  for (const offering of theoryOfferings) {
    await db.assessmentComponent.updateMany({ where: { subjectOfferingId: offering.id, name: { startsWith: "Quizzes" } }, data: { name: "Quizzes (4 × 10)", totalMarks: 40 } });
    await db.assessmentComponent.updateMany({ where: { subjectOfferingId: offering.id, name: { startsWith: "Assignments" } }, data: { name: "Assignments (4 × 10)", totalMarks: 40 } });
    await db.assessmentComponent.updateMany({ where: { subjectOfferingId: offering.id, name: "CCP" }, data: { totalMarks: 10 } });
    await db.assessmentComponent.updateMany({ where: { subjectOfferingId: offering.id, name: "Midterm" }, data: { totalMarks: 25 } });
    await db.assessmentComponent.updateMany({ where: { subjectOfferingId: offering.id, name: "Final" }, data: { totalMarks: 45 } });
  }

  console.log(`Updated ${quizzes.count} quiz, ${assignments.count} assignment, and ${labs.count} lab components.`);
}

main().finally(() => db.$disconnect());
