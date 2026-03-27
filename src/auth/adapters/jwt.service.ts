import jwt  from "jsonwebtoken";
import { SETTINGS } from "../../common/settings/setting";
import { WithId } from "mongodb";
import { UserAccountDbType } from "../types/user.account.db.type";


export const jwtService = {
                                                             
    async createAccessToken(user: WithId<UserAccountDbType>): Promise<string>{ 
        
        const accessToken = jwt.sign({userId: user._id}, SETTINGS.JWT_SECRET, {expiresIn: '10s'});  //10s
        return accessToken;
    },   

    async createRefreshToken(user: WithId<UserAccountDbType>): Promise<string>{

        const refreshToken = jwt.sign({userId: user._id}, SETTINGS.JWT_SECRET, {expiresIn: '20s'});   //'20s'
        return refreshToken;
    },
 

    async getUserIdByToken(token: string): Promise<string | null >{      //а здесь когда нам прилеьтьь токен от клиента мы расштфруем токен - полезную нагрузку и из нее возьмем айди - так как сами написали это в пэйлоад
                                                                         
        try{
        const payload: any = jwt.verify(token, SETTINGS.JWT_SECRET); //вернет нам полез.нашрузку 
        
        if(!payload.userId) return null;
        return payload.userId;  

        }catch(e){
        return null;
        }
    }  

}

