export type Boundary = { grade: string; minZScore: number; gradePoint: number };
export type MarkInput = { obtainedMarks: number | null; totalMarks: number; weightage: number };

export function weightedMark(obtained: number, total: number, weightage: number) {
  return total > 0 ? (obtained / total) * weightage : 0;
}
export function calculateRelativeGrade(marks: MarkInput[], average: number | null, sd: number | null, boundaries: Boundary[]) {
  if (marks.some(m => m.obtainedMarks === null)) return { status: "draft" as const };
  const percentage = marks.reduce((sum, m) => sum + weightedMark(m.obtainedMarks!, m.totalMarks, m.weightage), 0);
  if (average === null || !sd) return { status: "unavailable" as const, percentage };
  const zScore = (percentage - average) / sd;
  const boundary = [...boundaries].sort((a, b) => b.minZScore - a.minZScore).find(b => zScore >= b.minZScore);
  return { status: "complete" as const, percentage, zScore, difference: percentage - average, grade: boundary?.grade ?? "F", gradePoint: boundary?.gradePoint ?? 0 };
}
export function requiredMark(currentWeighted: number, targetZ: number, average: number, sd: number, componentTotal: number, componentWeight: number) {
  const requiredPercentage = average + targetZ * sd;
  const neededWeighted = requiredPercentage - currentWeighted;
  const marks = componentWeight > 0 ? (neededWeighted / componentWeight) * componentTotal : Infinity;
  return { requiredPercentage, marks: Math.max(0, marks), possible: marks <= componentTotal };
}
