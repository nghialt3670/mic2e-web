export interface ApiResponse<T> {
  message: string | null;
  code: number;
  data?: T;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
