import { SortDirections } from "../types/sort-direction"; 

export function setDefaultPostPagination<T extends string>(query: {   //утилита к-я собирает наши чистые значения и добавляет дефолтные значения если позиций нет в запросе
  pageNumber?: number | undefined;
  pageSize?: number | undefined;
  sortBy?: T;
  sortDirection?: SortDirections;
}) {
  return {
    pageNumber: Number(query.pageNumber) || 1,
    pageSize: Number(query.pageSize) || 10,
    sortBy: query.sortBy || ('createdAt' as T),
    sortDirection: query.sortDirection || SortDirections.Desc,
  };
}