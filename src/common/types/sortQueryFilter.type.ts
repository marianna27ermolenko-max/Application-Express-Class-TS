import { SortDirections } from "./sort-direction"

export type SortQueryFilterType = { 

    searchEmailTerm: string,
    searchLoginTerm: string,
    pageNumber: number,
    pageSize: number,
    sortDirection: SortDirections,
    sortBy: string
}