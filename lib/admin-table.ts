export const ADMIN_TABLE_PAGE_SIZE = 10;

export type AdminTableQuery = {
  search: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};

export type AdminTableResult<T> = {
  rows: T[];
  total: number;
};
