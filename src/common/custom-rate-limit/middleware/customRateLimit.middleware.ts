import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../types/http.status";
import { CustomModel, ICustomRateLimitDB } from "../custom-rate-limit.entity";

export const customRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => { 
    
    const limit = 5;
    const windowWS = 10000;
    const url = req.originalUrl;

    const date =  new Date();
    const ip = req.ip ?? 'unknown';
    if(typeof ip !== 'string'){ return res.status(HttpStatus.BAD_REQUEST).json({errorsMessages: [{ field: "IP", message: 'Invalid IP address' }]})}

    const newExist: ICustomRateLimitDB = { ip, url, date, };
    await CustomModel.insertOne(newExist); //обращаемся сразу в коллекцию без репозитория

    const count = await CustomModel.countDocuments({ip, url, date: { $gte: new Date(date.getTime() - windowWS)}}); //date.getTime() - переводим в милисекунды отнимает наше окно, апотом опять в дату
     
    if(count > limit){ return res.sendStatus(HttpStatus.TOO_MANY_REQUESTS)}


    next(); 
  }



// import { app } from './init-app';
// import { runDb } from './db/runDb';
// import { settings } from './settings';
// import {Request, Response, NextFunction} from 'express'
// import {rateLimitRepository} from "./repository/rate-limit-repository";

// const rateLimitMW = async (req: Request, res: Response, next: NextFunction) => {
//   const currentDate = new Date();

//   const fromDate = new Date(currentDate.XXX - YYY);

//   await rateLimitRepository.setAttempt(req.ip!, req.originalUrl, currentDate);
//   const requestsCount = await rateLimitRepository.getAttemptsCountFromDate(req.ip!, req.originalUrl, fromDate);

//   if (requestsCount > ZZZ) {
//     res.sendStatus(429);

//     return;
//   }

//   console.log(requestsCount);
//   next();
// };

// export async function startApp() {
//   await runDb();

//   app.listen(settings.PORT, () => {
//     console.log(`Example app listening on port: ${settings.PORT}`);
//   });


//   app.use('/login', rateLimitMW, (req: Request, res: Response) => {
//     res.send('success login');
//   })
// }

// startApp();

// /*
// Что нужно дописать вместо XXX, YYY, ZZZ чтобы 57 попытка(ок) запроса на '/login' в течении 1 секунд проходили нормально, а последующие блокировалась?

// В качестве ответа дай пропущенный код через пробел или с новой строки в последовательности: XXX YYY ZZZ.
// */