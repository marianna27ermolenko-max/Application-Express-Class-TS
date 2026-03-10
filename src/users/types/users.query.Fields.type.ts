import { SortQueryFieldsType } from "../../common/types/sort.queryFields.type"

// тип пагинация + поиск
export type  UsersQueryFieldsType = {

  searchLoginTerm?: string;
  searchEmailTerm?: string;

} & SortQueryFieldsType; 