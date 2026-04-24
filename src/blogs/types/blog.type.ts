export class BlogViewModel {

    constructor (
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
){ }
}

// export type BlogViewModel = {

//     id: string;
//     name: string;
//     description: string;
//     websiteUrl: string;
//     createdAt: string;
//     isMembership: boolean;

// }

export class Blog {

    constructor (
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
){ }

}


// export type Blog = {

//     name: string;
//     description: string;
//     websiteUrl: string;
//     createdAt: string;
//     isMembership: boolean;

// }