
export class PostViewModel{

   constructor ( 

   public id: string,
   public title: string,
   public shortDescription: string,
   public content: string,
   public blogId: string,
   public blogName: string,
   public createdAt: string, ){  }

}

// export type PostViewModel = {

//    id: string;
//    title: string;
//    shortDescription: string;
//    content: string;
//    blogId: string;
//    blogName: string;
//    createdAt: string;

// };

export class Post {

constructor(   

   public title: string,                    //создать поле title и сразу записать туда значение и тд благодаря public 
   public shortDescription: string,         // public title: string === this.title = title 
   public content: string,
   public blogId: string,
   public blogName: string,
   public createdAt: string,){  }

};




// export type Post = {

//    title: string;
//    shortDescription: string;
//    content: string;
//    blogId: string;
//    blogName: string;
//    createdAt: string;

// };

