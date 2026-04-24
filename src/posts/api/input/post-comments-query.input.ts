import { SortDirections } from "../../../common/types/sort-direction";
import { CommentSortField } from "./comment-sort-field";



export type CommentsQueryInput = {

    sortBy?: CommentSortField | undefined;
    sortDirection?: SortDirections;
    pageNumber?: number;
    pageSize?: number;
};