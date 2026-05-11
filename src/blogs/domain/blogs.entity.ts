import mongoose, { HydratedDocument, model, Model } from "mongoose";
import { BLOGS_COLLECTION_NAME } from "../../db/mongo.db";
import { BlogInputModel } from "../dto/blog.dto.model";

export interface Blog{

    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;

}

class BlogEntity{
    private constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    ){}

    static createBlog(dto: BlogInputModel){
        const blog = new BlogModel({
            description: dto.description,
            name: dto.name,
            websiteUrl: dto.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        })

        return blog;
    }

    updateBlog(this: BlogDocument, dto: BlogInputModel){
        this.name = dto.name;
        this.description = dto.description;
        this.websiteUrl = dto.websiteUrl; 
    }
}

export interface BlogMethods{
updateBlog(this: BlogDocument, dto: BlogInputModel): void;
}

type BlogStatics = typeof BlogEntity;

const BlogSchema = new mongoose.Schema<Blog, BlogModelType, BlogMethods>({
    name: { type: String, required: true, }, 
    description: { type: String, required: true, maxLength: 500 }, 
    websiteUrl: { type: String, required: true, maxLength: 100 }, 
    createdAt: { type: String, required: true, }, 
    isMembership: { type: Boolean, required: true, default: false}, 

})

type BlogModelType = Model<Blog, {}, BlogMethods> & BlogStatics;
export type BlogDocument = HydratedDocument<Blog, BlogMethods>;

BlogSchema.loadClass(BlogEntity);

export const BlogModel = model<Blog, BlogModelType>(BLOGS_COLLECTION_NAME, BlogSchema);