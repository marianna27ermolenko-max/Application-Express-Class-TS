import { UserSortFields } from "../../users/api/handlers/input/user-sort-field";
import { SortDirections } from "./sort-direction";

//тип пагинации
export type SortQueryFieldsType = {

    sortBy?: UserSortFields;
    pageNumber?: number;
    pageSize?: number;
    sortDirection?: SortDirections;
}