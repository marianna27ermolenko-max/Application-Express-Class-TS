import mongoose, { HydratedDocument, model, Model } from "mongoose";
import { SESSIONS_COLLECTION_NAME } from "../../db/mongo.db"; 

export interface ISession{
    
    userId: string;
    ip: string;
    title: string;
    lastActiveDate: string;
    expirationDate: string;
    deviceId: string;

}

export class SessionEntity{
    private constructor(
    public userId: string,
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public expirationDate: string,
    public deviceId: string,
    ){}

    static createSession(){}
}

export interface SessionMethods{
};

export const SessionSchema = new mongoose.Schema<ISession, SessionModelType, SessionMethods>({
    userId: { type: String, required: true },
    ip: { type: String, required: true, default: 'unknown'},
    title: { type: String, required: true },
    lastActiveDate: { type: String, required: true },
    expirationDate:{ type: String, required: true },
    deviceId: { type: String, required: true, unique: true },
})

export type SessionStatics = typeof SessionEntity;
type SessionModelType = Model<ISession, {}, SessionMethods> & SessionStatics;
export type SessionDocument = HydratedDocument<ISession, SessionMethods>

SessionSchema.loadClass(SessionEntity);

export const SessionModel = model<ISession, SessionModelType>(SESSIONS_COLLECTION_NAME, SessionSchema)
