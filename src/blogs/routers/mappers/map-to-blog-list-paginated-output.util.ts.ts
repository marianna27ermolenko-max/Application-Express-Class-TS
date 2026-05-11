import { BlogDocument } from "../../domain/blogs.entity"; 

export function mapToBlogListPaginatedOutput( //Он превращает: Он превращает+данные пагинации = готовый API ответ(преобразованный с пагинацией)
  blogs: BlogDocument[],
  meta: { pageNumber: number; pageSize: number; totalCount: number },
) {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),  
    page: meta.pageNumber,                                   
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items: blogs.map((blog) => ({
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    })),
  };
}
