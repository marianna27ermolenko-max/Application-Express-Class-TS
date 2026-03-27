import { Request, Response, NextFunction } from "express" 
import { HttpStatus } from "../../common/types/http.status";
import { jwtService } from "../adapters/jwt.service";
import { usersRepository } from "../../users/infrastructure/user.repository";

export const jwtTokenGuardMiddleware = 
    async (req: Request , 
    res: Response, 
    next: NextFunction) => {

        const auth = req.headers['authorization'] as string;

        console.log(auth);  //+
        

        if(!auth){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const [authType, token] = auth.split(' ');
        if(authType !== 'Bearer' || !token){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return
        }

        const userId = await jwtService.getUserIdByToken(token);
        
        console.log(userId);
        

         if(!userId){
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }
          
        const user = await usersRepository.findById(userId);
        if(!user){
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }

        console.log(user);
        

            req.userId = user._id.toString();
            next();
    }