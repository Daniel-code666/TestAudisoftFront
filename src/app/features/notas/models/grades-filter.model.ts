export interface GradesFilter {
  name?: string | null;
  grade?: number | null;
  creationDateFrom?: string | null;
  creationDateTo?: string | null;
  modificationDateFrom?: string | null;
  modificationDateTo?: string | null;
  pageNumber: number;
  pageSize: number;
}