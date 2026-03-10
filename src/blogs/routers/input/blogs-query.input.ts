import { SortDirections } from "../../../common/types/sort-direction"
import { BlogSortField } from "./blogs-sort-field";

//тип - то что нам приходит из req.query
export type BlogsQueryInput = {
  searchNameTerm?: string | null;
  sortBy?: BlogSortField;  
  sortDirection?: SortDirections;
  pageNumber?: number;
  pageSize?: number;
}



export type BlogsQueryProcessed = {  //???
  searchNameTerm?: string;
  sortBy: BlogSortField;
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};