import { Blog } from "../types/blog.type";
import { BlogInputModel } from "../dto/blog.dto.model";
import { WithId } from "mongodb";
import { blogsRepository } from "../infrastructure/blogs-repositories";
import { PaginationAndSorting } from "../../common/types/pagination_and_sorting";
import { BlogSortField } from "../routers/input/blogs-sort-field";
import { postsRepository } from "../../posts/repositories/post-repositories";


export const blogsService = {

async findMany(queryDTO: PaginationAndSorting<BlogSortField> & 
  {searchNameTerm?: string | null;}):Promise<{ items: WithId<Blog>[]; totalCount: number }> { 
   console.log(queryDTO)
  return blogsRepository.findMany(queryDTO);
},

async findByIdOrFail(id: string): Promise<WithId<Blog> | null>{   //ГОТОВО
return blogsRepository.findByIdOrFail(id)
},


async createBlog(newBlog: Blog): Promise<WithId<Blog>> {  //НАДО ПОСМОТРЕТЬ
      const blogWithDefaults = {
    ...newBlog,
    createdAt: newBlog.createdAt ?? new Date().toISOString(),
    isMembership: newBlog.isMembership ?? true,
  };

  const createdBlog = await blogsRepository.createBlog(blogWithDefaults);  
  return createdBlog;
},


async updateBlog(id: string, dto: BlogInputModel): Promise<void>{

    await blogsRepository.updateBlog(id,
     {
    name: dto.name, 
    description: dto.description, 
    websiteUrl: dto.websiteUrl,
     }
    )

    await postsRepository.updateManyBlogNameByBlogId(id, dto.name)
},

async deleteBlog(id: string): Promise<void>{ 
return blogsRepository.deleteBlog(id);

},

}

