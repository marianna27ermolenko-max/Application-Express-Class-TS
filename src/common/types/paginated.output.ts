//mapToBlogListPaginatedOutput - испол в этом маппере, для обозначения типа для мета данных - как они будут подаваться

export type PaginatedOutput = {
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
};