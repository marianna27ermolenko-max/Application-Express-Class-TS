import jwt  from "jsonwebtoken";
import { SETTINGS } from "../../common/settings/setting";
import { WithId } from "mongodb";
import { UserAccountDbType } from "../types/user.account.db.type";
import { injectable } from "inversify";

@injectable()
export class JwtService {
                                                             
     async createAccessToken(user: WithId<UserAccountDbType>): Promise<string>{ 
        
        const accessToken = jwt.sign({userId: user._id}, SETTINGS.JWT_SECRET, {expiresIn: '10s'});  //10s
        return accessToken;
    }   

     async createRefreshToken(user: WithId<UserAccountDbType>, deviceId: string): Promise<string>{

        const refreshToken = jwt.sign({ userId: user._id, deviceId, createdAt: new Date()}, SETTINGS.JWT_SECRET, {expiresIn: '20s'});  
        return refreshToken;
    }
 
    async checkRefreshToken(token: string): Promise<{userId: string, deviceId: string, iat: number, exp: number} | null >{      //а здесь когда нам прилеьтьь токен от клиента мы расштфруем токен - полезную нагрузку и из нее возьмем айди - так как сами написали это в пэйлоад
                                                                         
        try{
        const payload: any = jwt.verify( token, SETTINGS.JWT_SECRET); //вернет нам полез.нашрузку и этот метод проверяет протухание токена и валидность 
        if(!payload.userId || !payload.deviceId) return null;

        const { userId, deviceId, iat, exp } = payload;

        return { userId, deviceId, iat, exp };  

        }catch(e){
        return null;
        }
    }

     async getPayloadByRefreshToken(token: string): Promise<{userId: string, deviceId: string, iat: number, exp: number} | null >{      //а здесь когда нам прилеьтьь токен от клиента мы расштфруем токен - полезную нагрузку и из нее возьмем айди - так как сами написали это в пэйлоад
                                                                         
        try{
        const payload: any = jwt.decode( token ); //вернет нам полез.нашрузку 
        if(!payload.userId || !payload.deviceId) return null;

        const { userId, deviceId, iat, exp } = payload;

        return { userId, deviceId, iat, exp };  

        }catch(e){
        return null;
        }
    }  

     async getUserIdFromAccessToken(token: string): Promise< string | null >{      //а здесь когда нам прилеьтьь токен от клиента мы расштфруем токен - полезную нагрузку и из нее возьмем айди - так как сами написали это в пэйлоад
                                                                         
        try{
        const payload: any = jwt.verify(token, SETTINGS.JWT_SECRET); //вернет нам полез.нашрузку 
        if(!payload.userId) return null;

        const userId = payload.userId;
    
        return userId;  

        }catch(e){
        return null;
        }
    }  

}



