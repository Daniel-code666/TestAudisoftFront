export interface PagedResult<T> {
  items: T[] | null;
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}