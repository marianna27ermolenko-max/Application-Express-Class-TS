import { Blog } from "../types/blog.type";
import { BlogInputModel } from "../dto/blog.dto.model";
import { blogCollection } from "../../db/mongo.db";
import { WithId, ObjectId } from "mongodb";
import { PaginationAndSorting } from "../../common/types/pagination_and_sorting";
import { BlogSortField } from "../routers/input/blogs-sort-field";

export const blogsRepository = {

async findMany(queryDTO: PaginationAndSorting<BlogSortField> & {searchNameTerm?: string | null;
  }): Promise<{ items: WithId<Blog>[]; totalCount: number }> { 

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

  const items = await blogCollection
     .find(filter)
     
      // "asc" (по возрастанию), то используется 1
      // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
      .sort({[sortBy]: sortDirection})
 
      // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
      .skip(skip)
 
      // ограничивает количество возвращаемых документов до значения pageSize
      .limit(pageSize)
      .toArray();
 
      const totalCount = await blogCollection.countDocuments(filter);


       return {items, totalCount};
},

async findByIdOrFail(id: string): Promise<WithId<Blog> | null>{
return blogCollection.findOne({_id: new ObjectId(id)})
},

async createBlog(newBlog: Blog): Promise<WithId<Blog>> {

    const insertResult = await blogCollection.insertOne(newBlog);
    const createdBlog = await blogCollection.findOne({ _id: insertResult.insertedId }) as WithId<Blog>;
    return createdBlog; //ПОЧЕМУ С ЛЕШЕЙ ЭТО ПОСТАВИЛИ???
},

async updateBlog(id: string, dto: BlogInputModel): Promise<void>{

    const updateResult = await blogCollection.updateOne(
     {_id: new ObjectId(id)},
     { $set: {
    name: dto.name, 
    description: dto.description, 
    websiteUrl: dto.websiteUrl,
     }}
    )
   
    if(updateResult.matchedCount < 1){

    throw new Error('Blog not exist')
    }

    return;
},

async deleteBlog(id: string): Promise<void>{ 

const deleteResult = await blogCollection.deleteOne({_id: new ObjectId(id)});

if(deleteResult.deletedCount === 0){
    throw new Error('Blog not exist')
}
    return;
},
};

