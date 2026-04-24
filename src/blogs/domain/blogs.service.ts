import { Blog, BlogViewModel } from "../types/blog.type";
import { BlogInputModel } from "../dto/blog.dto.model";
import { WithId } from "mongodb";
import { BlogsRepository } from "../infrastructure/blogs-repositories";
import { PaginationAndSorting } from "../../common/types/pagination_and_sorting";
import { BlogSortField } from "../routers/input/blogs-sort-field";
import { PostsRepository } from "../../posts/repositories/post-repositories";
import { BlogsQWRepository } from "../infrastructure/blogs-QWrepositories";
import { inject, injectable } from "inversify";

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
  {searchNameTerm?: string | null;}):Promise<{ items: WithId<Blog>[]; totalCount: number }> { 
  return this.blogsQWRepo.findMany(queryDTO);
}

 async findById(id: string): Promise<WithId<Blog> | null>{  
return this.blogsRepo.findById(id)
}

 async findBlogById(id: string): Promise<BlogViewModel | null>{  
return this.blogsQWRepo.findBlogById(id)
}

 async createBlog(newBlog: Blog): Promise<WithId<Blog>> {  
      const blogWithDefaults = {
    ...newBlog,
    createdAt: newBlog.createdAt ?? new Date().toISOString(),
    isMembership: newBlog.isMembership ?? true,
  };

  const createdBlog = await this.blogsRepo.createBlog(blogWithDefaults);  
  return createdBlog;
}


 async updateBlog(id: string, dto: BlogInputModel): Promise<void>{

    await this.blogsRepo.updateBlog(id,
     {
    name: dto.name, 
    description: dto.description, 
    websiteUrl: dto.websiteUrl,
     }
    )

    await  this.postsRepo.updateManyBlogNameByBlogId(id, dto.name)
}

 async deleteBlog(id: string): Promise<void>{ 
return this.blogsRepo.deleteBlog(id);

}

}



