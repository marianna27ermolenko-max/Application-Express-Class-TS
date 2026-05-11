import mongoose, { Model, HydratedDocument, model } from "mongoose";
import { CUSTOM_RATE_LIMIT_COLLECTION_NAME } from "../../db/mongo.db";

export interface ICustomRateLimitDB{

    ip: string;
    url: string;
    date: Date;
}

const CustomSchema = new mongoose.Schema<ICustomRateLimitDB>({

    ip: { type: String, required: true, default: 'unknown' },
    url: { type: String, required: true },
    date: { type: Date, required: true },
})

type CustomModelType = Model<ICustomRateLimitDB>;
export type CustomDocument = HydratedDocument<ICustomRateLimitDB>;

export const CustomModel = model<ICustomRateLimitDB, CustomModelType>(CUSTOM_RATE_LIMIT_COLLECTION_NAME, CustomSchema)