export interface StudentFilter {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  pageNumber: number;
  pageSize: number;
}