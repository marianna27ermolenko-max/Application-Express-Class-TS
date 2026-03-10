import { ObjectId, WithId } from "mongodb";
import { userCollection } from "../../db/mongo.db";
import { IUserBD } from "../types/user.db.interface";

export const usersRepository = {
  async createUser(newUser: IUserBD): Promise<string> {

    const createUser = await userCollection.insertOne({ ...newUser });
    return createUser.insertedId.toString();
  },

  async deleteUser(id: string): Promise<boolean> {
    
    const deleteUser = await userCollection.deleteOne({
      _id: new ObjectId(id),
    });
    return deleteUser.deletedCount === 1;
  },

  async findById(id: string): Promise<WithId<IUserBD> | null> {
    return await userCollection.findOne({ _id: new ObjectId(id) });
  },

  async findByLoginOrEmail( //удалить?
    loginOrEmail: string,
  ): Promise<WithId<IUserBD> | null> {
    return await userCollection.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  },

  async findByLogin(login: string): Promise<WithId<IUserBD> | null> {
  return await userCollection.findOne({ login });
},

 async findByEmail(email: string): Promise<WithId<IUserBD> | null> {
  return await userCollection.findOne({ email });
}
};
