// import { PaginationAndSorting } from "../../../core/types/pagination_and_sorting";
import { SortDirections } from "../../../common/types/sort-direction";
import { PostSortField } from "./post-sort-field";



export type PostsQueryInput = {

    // searchNameTerm?: string | undefined;
    sortBy?: PostSortField | undefined;
    sortDirection?: SortDirections;
    pageNumber?: number;
    pageSize?: number;
};




