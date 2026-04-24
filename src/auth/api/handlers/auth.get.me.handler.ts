// import { Request, Response } from "express";
// import { authService, AuthService } from "../../domain/auth.service";
// import { HttpStatus } from "../../../common/types/http.status";

// export async function getAuthUserHandler(req: Request, res: Response) {

//   try {
//     const userId = req.userId;
//     console.log(userId);
     

//     if (!userId) {
//       return res.sendStatus(HttpStatus.UNAUTHORIZED);
//     }


//     const user = await authService.getUserByUserId(userId);
//     if (!user) {
//       return res.sendStatus(HttpStatus.UNAUTHORIZED);
//     }
    
//     return res.status(HttpStatus.OK).json(user);
    
//   } catch (e: unknown) {
//     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//   }
// }
