export interface GradeCreate {
  name?: string | null;
  gradeValue: number;
  studentId: number;
  professorId: number;
}