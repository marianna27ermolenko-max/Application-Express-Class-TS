import { query } from "express-validator";
import { SortDirections } from "../types/sort-direction";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_DIRECTION = SortDirections.Desc;

// export const paginationAndSortingDefault: PaginationAndSorting<string> = {
//   page: DEFAULT_PAGE,
//   pageSize: DEFAULT_PAGE_SIZE,
//   sortBy: DEFAULT_SORT_BY,
//   sortDirection: DEFAULT_SORT_DIRECTION,
// }

export function paginationAndSortingValidation<T extends string>(sortFieldsEnum: Record<string, T>){
return [
    query('pageNumber')
    .default(DEFAULT_PAGE)
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer')
    .toInt(),

     query('pageSize')
    .default(DEFAULT_PAGE_SIZE)
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100')
    .toInt(),

     query('sortBy')
    .default(Object.values(sortFieldsEnum)[0]) // Дефолтное значение - первое поле
    .isIn(Object.values(sortFieldsEnum))
    .withMessage(`Allowed sort fields: ${Object.values(sortFieldsEnum).join(', ')}`),

     query('sortDirection')
    .default(DEFAULT_SORT_DIRECTION)
    .isIn(Object.values(SortDirections))
     .withMessage(`Sort direction must be one of: ${Object.values(SortDirections).join(', ')}`),

    // query('searchNameTerm')
    // .default(null)  
]

}