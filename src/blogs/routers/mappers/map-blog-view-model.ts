import { Blog, BlogViewModel } from "../../types/blog.type";
import { WithId } from "mongodb";

export function mapToBlogViewModel(blog: WithId<Blog>): BlogViewModel {
  return new BlogViewModel(
  blog._id.toString(),
  blog.name,
  blog.description,
  blog.websiteUrl,
  blog.createdAt,
  blog.isMembership,
);
}