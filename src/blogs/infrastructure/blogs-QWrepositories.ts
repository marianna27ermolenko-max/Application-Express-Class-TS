import { BlogViewModel } from "../types/blog.type";
import { PaginationAndSorting } from "../../common/types/pagination_and_sorting";
import { BlogSortField } from "../routers/input/blogs-sort-field";
import { injectable } from "inversify";
import { BlogDocument, BlogModel } from "../domain/blogs.entity";

@injectable()
export class BlogsQWRepository {

 async findMany(queryDTO: PaginationAndSorting<BlogSortField> & {searchNameTerm?: string | null;
  }): Promise<{ items: BlogDocument[]; totalCount: number }> { 

    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchNameTerm,
    } = queryDTO;


   const skip = (pageNumber - 1) * pageSize;
   const filter: any = {};
 
  if(searchNameTerm){
    filter.name = {$regex: searchNameTerm, $options: 'i'};
  }

  const items = await BlogModel
     .find(filter)
     
      // "asc" (по возрастанию), то используется 1
      // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
      .sort({[sortBy]: sortDirection})
 
      // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
      .skip(skip)
 
      // ограничивает количество возвращаемых документов до значения pageSize
      .limit(pageSize)
     
 
      const totalCount = await BlogModel.countDocuments(filter);


       return {items, totalCount};
}

 async findBlogById(id: string): Promise<BlogViewModel | null>{
const result = await BlogModel.findOne({_id: id})
if(!result) return null;
return this._mapToBlogViewModel(result);
}

 _mapToBlogViewModel(blog: BlogDocument): BlogViewModel {
  return new BlogViewModel(
  blog._id.toString(),
  blog.name,
  blog.description,
  blog.websiteUrl,
  blog.createdAt,
  blog.isMembership,
)}
}

