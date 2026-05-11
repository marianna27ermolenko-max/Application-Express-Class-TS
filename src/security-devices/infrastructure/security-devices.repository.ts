import { injectable } from "inversify";
import { ISession, SessionDocument, SessionModel } from "../domain/securety-devices.entity";

@injectable()
export class SessionsRepository {

    async save(session: SessionDocument):Promise<void> {
    await session.save();
    }

    async createSession(session: ISession):Promise<string | null> {
    const result  = await SessionModel.create(session);
    return result._id.toString(); 
    }

     async updateLastActiveDate( deviceId: string, data: string ): Promise<boolean> {

    const result = await SessionModel.updateOne({deviceId: deviceId}, {$set: {lastActiveDate: data}})
    return result.matchedCount > 0;
    } 

     async updateExpDateRefreshToken( deviceId: string, data: string ): Promise<boolean> {

    const result = await SessionModel.updateOne({deviceId: deviceId}, {$set: {exp: data}})
    return result.matchedCount > 0;
    } 
    
     async deleteDevices(userId: string, deviceId: string): Promise<boolean>{
    const result =  await SessionModel.deleteMany({ userId: userId, deviceId: {$ne: deviceId}})
    return result.deletedCount > 0
    }

     async deleteDeviceWithDevicedId(userId: string, deviceId: string): Promise<boolean>{

    const result =  await SessionModel.deleteOne({ userId: userId, deviceId: deviceId})
    return result.deletedCount === 1;
    }

     async findSession( deviceId: string):Promise<SessionDocument | null> { 
        return await SessionModel.findOne({ deviceId: deviceId }); 
    }
     
}
 
