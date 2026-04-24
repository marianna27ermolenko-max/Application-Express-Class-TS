import { ISessionDB } from "../types/ISessionDB";
import { sessionsCollection } from "../../db/mongo.db";
import { WithId } from "mongodb";
import { sessionViewModel } from "../types/sessionViewModel";
import { injectable } from "inversify";

@injectable()
export class SessionsQwRepository {

    async findSessionsWithUserId( userId: string ): Promise< sessionViewModel []>{

     const result = await sessionsCollection.find({ userId: userId }).toArray();
     return result.map((d) => this._getViewModelSession(d))                        //sessionsQwRepository._getViewModelSession
   }

     _getViewModelSession(session: WithId<ISessionDB>): sessionViewModel{
        return {
         ip: session.ip,
         title: session.title,
         lastActiveDate: session.lastActiveDate,
         deviceId: session.deviceId,
        }
     }
   
}

