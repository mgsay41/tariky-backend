export interface CourseQuery {
  page?: string;
  limit?: string;
  level?: string;
  courseType?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}
