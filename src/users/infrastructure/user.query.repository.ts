import { ObjectId, WithId } from "mongodb";
import { userCollection } from "../../db/mongo.db";
import { IUserView } from "../types/user.view.interface";
import { IUserBD } from "../types/user.db.interface";
import { SortQueryFilterType } from "../../common/types/sortQueryFilter.type";
import { IPagination } from "../../common/types/pagination";
import { SortDirections } from "../../common/types/sort-direction"; 



export const usersQwRepository = {
  async findAllUsers(
    sortQueryDto: SortQueryFilterType,
  ): Promise<IPagination<IUserView[]>> {
    const {
      pageNumber,
      pageSize,
      sortDirection,
      sortBy,
      searchEmailTerm,
      searchLoginTerm,
    } = sortQueryDto;

    console.log(sortQueryDto);
    

    const sortDir = sortDirection === SortDirections.Asc ? 1 : -1;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if (searchEmailTerm || searchLoginTerm) {
      filter.$or = []; //Оператор $or выполняет логическое ИЛИ между условиями в массиве — возвращает документы, где хотя бы одно условие истинно.

      if (searchEmailTerm) {
        filter.$or.push({ email: { $regex: searchEmailTerm, $options: "i" } });
      }
      if (searchLoginTerm) {
        filter.$or.push({ login: { $regex: searchLoginTerm, $options: "i" } });
      }
    }
  
    console.log(filter);
    


    const totalCount = await userCollection.countDocuments(filter);

    const users = await userCollection
      .find(filter)
      .sort({ [sortBy]: sortDir })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: users.map((u) => this._getInView(u)),
    };
  },

  async findById(id: string): Promise<IUserView | null> {
    const user = await userCollection.findOne({ _id: new ObjectId(id) });

    
    if (!user) {
      return null;
    }
    
    return this._getInView(user);
  },

  _getInView(user: WithId<IUserBD>): IUserView {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toString(),
    };
  },
};
