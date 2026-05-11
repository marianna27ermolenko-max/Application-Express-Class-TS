import mongoose from "mongoose";

export const BLOGS_COLLECTION_NAME = 'blogs';
export const POSTS_COLLECTION_NAME = 'posts';
export const USERS_COLLECTION_NAME = 'users';
export const COMMENTS_COLLECTION_NAME = 'comments';
export const REFRESH_TOKEN_BLACK_LIST_COLLECTION_NAME = 'refreshToken';
export const SESSIONS_COLLECTION_NAME = 'sessions';
export const CUSTOM_RATE_LIMIT_COLLECTION_NAME = 'customRateLimit';
export const LIKE_COMMENT_COLLECTION_NAME = 'likesCommant';
export const LIKE_POST_COLLECTION_NAME = 'likesPost';


//подключение к бд
export async function runDB(url: string): Promise<void>{

  try{
    await mongoose.connect(url)
    console.log('Connected to the database');
  } catch (e) {
    await mongoose.disconnect();
    console.error('Database not connected', e)
    throw new Error('Database not conected');
  }
}


