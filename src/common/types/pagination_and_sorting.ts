import { SortDirections } from "./sort-direction";

//это тип ответа API - что возвращаешь из repository / handler - используется обычно в  repository - 
// напр - async findAllBlogs(query: BlogsQueryInput): Promise<Paginator<BlogViewModel>>

export type Paginator<T> = {

pagesCount: number;
pageNumber: number;
pageSize: number;
totalCount: number;
items: T[];

} 

//Это универсальный тип (generic) для параметров запроса. Он описывает то, что приходит в query - Это тип уже обработанных query параметров(числа это числа , доб дефолты, знач валидны)
export type PaginationAndSorting<S> = {

  pageNumber: number;
  pageSize: number;
  sortBy: S;
  sortDirection: SortDirections;

}
