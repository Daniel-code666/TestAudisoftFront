export interface StudentGradeDetail {
  id: number;
  name: string | null;
  gradeValue: number;
  professorId: number;
  professorFirstName: string | null;
  professorLastName: string | null;
  professorEmail: string | null;
}

export interface StudentWithGrades {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  grades: StudentGradeDetail[] | null;
}