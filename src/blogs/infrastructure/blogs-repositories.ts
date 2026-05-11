import { injectable } from "inversify";
import { BlogDocument, BlogModel as BlogsModel } from "../domain/blogs.entity";

@injectable()
export class BlogsRepository {

  async save(blog: BlogDocument): Promise<void>{
    await blog.save()
}
 
 async findById(id: string): Promise<BlogDocument | null>{
return BlogsModel.findOne({_id: id})
}

 async deleteBlog(id: string): Promise<void>{ 

const deleteResult = await BlogsModel.deleteOne({_id: id});

if(deleteResult.deletedCount === 0){
    throw new Error('Blog not exist')
}
    return;
}
};



