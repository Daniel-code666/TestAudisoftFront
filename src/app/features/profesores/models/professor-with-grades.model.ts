export interface ProfessorGradeDetail {
  id: number;
  name: string | null;
  gradeValue: number;
  studentId: number;
  studentFirstName: string | null;
  studentLastName: string | null;
  studentEmail: string | null;
}

export interface ProfessorWithGrades {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  grades: ProfessorGradeDetail[] | null;
}