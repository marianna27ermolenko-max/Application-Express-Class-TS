import { SessionDocument, SessionModel } from "../../security-devices/domain/securety-devices.entity";  
import { sessionViewModel } from "../types/sessionViewModel";
import { injectable } from "inversify";

@injectable()
export class SessionsQwRepository {

    async findSessionsWithUserId( userId: string ): Promise< sessionViewModel []>{

     const result = await SessionModel.find({ userId: userId });
     return result.map((d) => this._getViewModelSession(d))                        
   }

     _getViewModelSession(session: SessionDocument): sessionViewModel{
        return {
         ip: session.ip,
         title: session.title,
         lastActiveDate: session.lastActiveDate,
         deviceId: session.deviceId,
        }
     }
   
}

