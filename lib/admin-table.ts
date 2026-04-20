export const ADMIN_TABLE_PAGE_SIZE = 10;

export type AdminTableQuery = {
  search: string;
  page: number;
  pageSize: number;
};

export type AdminTableResult<T> = {
  rows: T[];
  total: number;
};
