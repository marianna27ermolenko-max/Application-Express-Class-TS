import { SortDirections } from "../../../common/types/sort-direction"
import { PostSortField } from "../../../posts/api/input/post-sort-field"; 

//тип - то что нам приходит из req.query
export type BlogsBlogIdQueryInput = {

  sortBy?: PostSortField;  
  sortDirection?: SortDirections;
  pageNumber?: number;
  pageSize?: number;

}
