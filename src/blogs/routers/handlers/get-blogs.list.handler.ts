import { Response, Request } from "express";
import { blogsService } from "../../domain/blogs.service";
import { HttpStatus } from "../../../common/types/http.status";
import { BlogsQueryInput } from "../input/blogs-query.input"; 
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../common/helpers/set-default-sort-and-pagination";
import { BlogSortField } from "../input/blogs-sort-field";
import { mapToBlogListPaginatedOutput } from "../mappers/map-to-blog-list-paginated-output.util.ts";


export async function getBlogsListHandler(req: Request<{}, {}, {}, BlogsQueryInput>, res: Response){


  try{
      
      //matchedData — это функция из библиотеки express-validator. Она достаёт из запроса только те поля, которые прошли валидаторы. 
      const sanitizedQuery = matchedData<BlogsQueryInput>(req, {  
      locations: ['query'], // - "Бери данные только из req.query"
      includeOptionals: true, // -Верни даже необязательные поля, если они есть
    }); 

    const pageNumber = Number(sanitizedQuery.pageNumber);
    const pageSize = Number(sanitizedQuery.pageSize);

    //потом применяем дефолты(создаем функцию которая если нет значения добавляет дефолтное)
    const pagination = setDefaultSortAndPaginationIfNotExist<BlogSortField>({
      ...sanitizedQuery,
       pageNumber,
       pageSize});
    
    const { items, totalCount }  = await blogsService.findMany(pagination); 

     const blogsListOutput = mapToBlogListPaginatedOutput(items, {
      pageNumber: Number(pagination.pageNumber),
      pageSize: Number(pagination.pageSize),
      totalCount,
    });

    res.status(HttpStatus.OK).json(blogsListOutput);
  } catch (err: unknown){
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 