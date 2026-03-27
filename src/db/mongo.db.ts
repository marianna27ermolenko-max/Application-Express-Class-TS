import { Blog } from "../blogs/types/blog.type";
import { Post } from "../posts/types/post.type";
import { Collection, Db, MongoClient } from 'mongodb';
import { SETTINGS } from "../common/settings/setting";
import { ICommentDB } from "../comments/types/comment.db.interface";
import { UserAccountDbType } from "../auth/types/user.account.db.type";
import { RefreshTokenType } from "../auth/types/refrash.token.dto.for.black.list";

const BLOGS_COLLECTION_NAME = 'blogs';
const POSTS_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const REFRESH_TOKEN_BLACK_LIST_COLLECTION_NAME = 'refreshToken';

//обьявляем переменные которые будут доступны во всем проекте
export let client: MongoClient;
export let blogCollection: Collection<Blog>;
export let postCollection: Collection<Post>;
export let userCollection: Collection<UserAccountDbType>;
export let commentsCollection:Collection<ICommentDB>;
export let refreshTokenCollection:Collection<RefreshTokenType>;

//подключение к бд
export async function runDB(url: string): Promise<void>{

  try{
    client = new MongoClient(url);//поддготовка к соединению
    await client.connect(); //Вот здесь происходит реальное подключение к MongoDB серверу.
    
     const db: Db = client.db(SETTINGS.DB_NAME); //подключение к базе данных

  //инициализация коллекций - создаем доступ к колекциям - после этого можно применять методы - напр -  await blogCollection.insertOne(blog)
   blogCollection = db.collection<Blog>(BLOGS_COLLECTION_NAME);
   postCollection = db.collection<Post>(POSTS_COLLECTION_NAME);
   userCollection = db.collection<UserAccountDbType>(USERS_COLLECTION_NAME);
   commentsCollection = db.collection<ICommentDB>(COMMENTS_COLLECTION_NAME);
   refreshTokenCollection = db.collection<RefreshTokenType>(REFRESH_TOKEN_BLACK_LIST_COLLECTION_NAME);

    await db.command({ ping: 1 }); //Проверка соединения
    console.log('Connected to the database');
  } catch (e) {
    await client.close();
    console.error('Database not connected', e)
    throw new Error('Database not conected');
  }
}
