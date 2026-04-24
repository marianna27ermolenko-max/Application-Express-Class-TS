import { Request, Response, NextFunction } from "express" 
import { HttpStatus } from "../../common/types/http.status";
import { container } from "../../composition-root";
import { JwtService } from "../adapters/jwt.service";
import { UsersRepository } from "../../users/infrastructure/user.repository";

const jwtService = container.resolve(JwtService)
const usersRepo  = container.resolve(UsersRepository)

export const jwtTokenGuardMiddleware = 
    async (req: Request , 
    res: Response, 
    next: NextFunction) => {

        const auth = req.headers['authorization'] as string;
       
        if(!auth){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const [authType, token] = auth.split(' ');
        if(authType !== 'Bearer' || !token){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return
        }

        const userId = await jwtService.getUserIdFromAccessToken(token);
        
         if(!userId){
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }
          
        const user = await usersRepo.findById(userId);
        if(!user){
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }

            req.userId = user._id.toString();
            next();
    }