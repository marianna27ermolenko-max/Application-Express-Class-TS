import { SortQueryFilterType } from "../../common/types/sortQueryFilter.type";
import { IPagination } from "../../common/types/pagination";
import { SortDirections } from "../../common/types/sort-direction"; 
import { IUserAuthMe } from "../domain/types/viewModel/user.auth.me.output";
import { injectable } from "inversify";
import { IUserView } from "../domain/types/viewModel/user.view.interface";
import { UserDocument, UserModel } from "../domain/users.entity";



@injectable()
export class UsersQwRepository {
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

    const sortDir = sortDirection === SortDirections.Asc ? 1 : -1;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if (searchEmailTerm || searchLoginTerm) {
      filter.$or = []; //Оператор $or выполняет логическое ИЛИ между условиями в массиве — возвращает документы, где хотя бы одно условие истинно.

      if (searchEmailTerm) {
        filter.$or.push({ "accountData.email": { $regex: searchEmailTerm, $options: "i" } });
      }
      if (searchLoginTerm) {
        filter.$or.push({ "accountData.login": { $regex: searchLoginTerm, $options: "i" } });
      }
    }

    const totalCount = await UserModel.countDocuments(filter);

    const sortMap: Record<string, string> = {
     login: "accountData.login",
     email: "accountData.email",
     createdAt: "accountData.createdAt",
    };

    const sortField = sortMap[sortBy] || "accountData.createdAt";

    const users = await UserModel
      .find(filter)
      .sort({ [sortField]: sortDir }) //если маппить сортировку 
      .skip(skip)
      .limit(pageSize)
      // .lean()
     

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: users.map((u) => this._getInView(u)),
    };
  }

   async findUserById(id: string): Promise<IUserView | null> {
    const user = await UserModel.findById(id);
     console.log("FIND USER BY ID:", user)
    if (!user) {
      return null;
    }
    
    return this._getInView(user);
  }


   _getInView(user: UserDocument ): IUserView {
     console.log("RAW USER DOC:", user);
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt.toString(),
    };
  }

    async findUserByUserId(userId: string): Promise<IUserAuthMe | null>{

    const user = await UserModel.findOne({ _id: userId });
    if(!user) return null;

    return this._getInViewAuthMe(user);
  }

    _getInViewAuthMe(user: UserDocument): IUserAuthMe {
    return {
     
      login: user.accountData.login,
      email: user.accountData.email,  
      userId: user._id.toString(),

    };
  }

};


