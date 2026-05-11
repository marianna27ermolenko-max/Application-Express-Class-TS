import { BlogViewModel } from "../types/blog.type";
import { BlogInputModel } from "../dto/blog.dto.model";
import { BlogsRepository } from "../infrastructure/blogs-repositories";
import { PaginationAndSorting } from "../../common/types/pagination_and_sorting";
import { BlogSortField } from "../routers/input/blogs-sort-field";
import { PostsRepository } from "../../posts/repositories/post-repositories";
import { BlogsQWRepository } from "../infrastructure/blogs-QWrepositories";
import { inject, injectable } from "inversify";
import { BlogDocument, BlogModel } from "../domain/blogs.entity";
import { ResultStatus } from "../../common/result/resultCode";
import { Result } from "../../common/result/result.type";

@injectable()
export class BlogsService {
  
postsRepo: PostsRepository;
blogsQWRepo: BlogsQWRepository;
blogsRepo: BlogsRepository;


constructor(@inject(BlogsQWRepository) blogsQWRepo: BlogsQWRepository, @inject(PostsRepository) postsRepo: PostsRepository, @inject(BlogsRepository) blogsRepo: BlogsRepository){
  this.blogsQWRepo =  blogsQWRepo;
  this.postsRepo =  postsRepo;
  this.blogsRepo =  blogsRepo;
}  

 async findMany(queryDTO: PaginationAndSorting<BlogSortField> & 
  {searchNameTerm?: string | null;}):Promise<{ items: BlogDocument[]; totalCount: number }> { 
  return this.blogsQWRepo.findMany(queryDTO);
}

 async findById(id: string): Promise<BlogDocument | null>{  //не удаляем мы его используем
return this.blogsRepo.findById(id)
}

 async createBlog(dto: BlogInputModel): Promise<BlogDocument> {  
  const blog = BlogModel.createBlog(dto); 
  await this.blogsRepo.save(blog);
  return blog;
}


 async updateBlog(id: string, dto: BlogInputModel): Promise<Result<boolean| null>>{

  const blog = await this.blogsRepo.findById(id);
  if(!blog) return {
          status: ResultStatus.NotFound,
          errorMessage: 'Not Found',
          extensions: [{ field: 'blogId' , message: 'blogId not found' }],
          data: null,
       }
    
    blog.updateBlog(dto); 

    await this.blogsRepo.save(blog);
    await this.postsRepo.updateManyBlogNameByBlogId(id, dto.name);

    return {
          status: ResultStatus.Success,
          extensions: [],
          data: true,
       }
}

 async deleteBlog(id: string): Promise<void>{ 
return this.blogsRepo.deleteBlog(id);

}

}



