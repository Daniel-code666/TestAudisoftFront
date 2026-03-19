export interface Grade {
  id: number;
  name: string | null;
  gradeValue: number;
  studentId: number;
  professorId: number;
  studentFullName: string | null;
  professorFullName: string | null;
}