export type PageResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};