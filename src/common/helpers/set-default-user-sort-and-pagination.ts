import { SortDirections } from "../types/sort-direction";

//утилита к-я собирает наши чистые значения и добавляет дефолтные значения если позиций нет в запросе
export function setDefaultUserSortAndPagination<T extends string>(query: {
  searchEmailTerm?: string | undefined;
  searchLoginTerm?: string | undefined;
  pageNumber?: number | undefined; // СТРОКИ 
  pageSize?: number | undefined;   // СТРОКИ 
  sortBy?: T;
  sortDirection?: SortDirections;
}){
    return {
    searchEmailTerm: query.searchEmailTerm ?? '',
    searchLoginTerm: query.searchLoginTerm ?? '',
    pageNumber: query.pageNumber || 1,                 //ПРИВЕСТИ В НАМБЕР
    pageSize: query.pageSize || 10,                    //ПРИВЕСТИ В НАМБЕР
    sortBy: query.sortBy ||  ('createdAt' as T),
    sortDirection: query.sortDirection || SortDirections.Desc,
    }
}
