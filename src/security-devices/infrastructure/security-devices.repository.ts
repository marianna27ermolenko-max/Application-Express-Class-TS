import { ISessionDB } from "../types/ISessionDB";
import { sessionsCollection } from "../../db/mongo.db";
import { WithId } from "mongodb";
import { injectable } from "inversify";

@injectable()
export class SessionsRepository {

     async createSession(session: ISessionDB):Promise<string | null> {

    const result  = await sessionsCollection.insertOne(session);
    return result.insertedId.toString(); 
    }

     async updateLastActiveDate( deviceId: string, data: string ): Promise<boolean> {

    const result = await sessionsCollection.updateOne({deviceId: deviceId}, {$set: {lastActiveDate: data}})
    return result.matchedCount > 0;
    } 

     async updateExpDateRefreshToken( deviceId: string, data: string ): Promise<boolean> {

    const result = await sessionsCollection.updateOne({deviceId: deviceId}, {$set: {exp: data}})
    return result.matchedCount > 0;
    } 
    
     async deleteDevices(userId: string, deviceId: string): Promise<boolean>{

    const result =  await sessionsCollection.deleteMany({ userId: userId, deviceId: {$ne: deviceId}})
    return result.deletedCount > 0
    }

     async deleteDeviceWithDevicedId(userId: string, deviceId: string): Promise<boolean>{

    const result =  await sessionsCollection.deleteOne({ userId: userId, deviceId: deviceId})
    return result.deletedCount === 1;
    }

     async findSession( deviceId: string):Promise<WithId<ISessionDB> | null> { 
         const result = await sessionsCollection.findOne({ deviceId: deviceId }); 
         return result; 
    }
     
}
 
