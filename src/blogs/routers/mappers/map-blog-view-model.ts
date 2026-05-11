import { BlogDocument } from "../../domain/blogs.entity";
import {BlogViewModel } from "../../types/blog.type";


export function mapToBlogViewModel(blog: BlogDocument ): BlogViewModel {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
}