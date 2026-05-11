import { UsersRepository } from "../../users/infrastructure/user.repository";
import { BcryptService } from "../adapters/bcrypt.service";
import { UsersQwRepository } from "../../users/infrastructure/user.query.repository";
import { NodemailerServise } from "../adapters/nodemailer.server";
import { v4 as uuidv4 } from "uuid";
import { add } from "date-fns";
import { CreateUserDto } from "../../users/domain/types/dto/create.user.dto";
import { Result } from "../../common/result/result.type";
import { ResultStatus } from "../../common/result/resultCode";
import { JwtService } from "../adapters/jwt.service";
import { ISession } from "../../security-devices/domain/securety-devices.entity"; 
import { SessionsRepository } from "../../security-devices/infrastructure/security-devices.repository";
import { inject, injectable } from "inversify";
import { UserDocument, UserModel } from "../../users/domain/users.entity";



@injectable()
export class AuthService {
  jwtService: JwtService;
  usersRepo: UsersRepository;
  bcryptService: BcryptService;
  sessionsRepo: SessionsRepository;
  usersQwRepo: UsersQwRepository;
  nodemailerServise: NodemailerServise;

  constructor( @inject(UsersRepository) usersRepo: UsersRepository,  @inject(BcryptService) bcryptService: BcryptService, 
  @inject(JwtService) jwtService: JwtService, @inject(SessionsRepository) sessionsRepo: SessionsRepository,
  @inject(UsersQwRepository) usersQwRepo: UsersQwRepository, @inject(NodemailerServise) nodemailerServise: NodemailerServise){

    this.usersRepo = usersRepo;
    this.bcryptService = bcryptService;
    this.jwtService = jwtService;
    this.sessionsRepo = sessionsRepo;
    this.usersQwRepo = usersQwRepo;
    this.nodemailerServise = nodemailerServise;

  }

 async loginUser( 
    loginOrEmail: string,
    password: string,
    userAgent: string = 'unknown',
    ip: string,
  ): Promise<Result<string[] | null>>{

    const user = await this.checkUserCredentials(
      loginOrEmail,
      password,
    );

    if (!user) return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        data: null,                                                          
        extensions: [{ field: "loginOrEmail", message: "Email or login is wrong" }],  
    };

     if (!user.emailConfirmation.isConfirmed) return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        data: null,                                                          
        extensions: [{ field: "loginOrEmail", message: "Email not confirm" }],  
    };
    
    const accessToken = await this.jwtService.createAccessToken(user);

    const deviceId = uuidv4();
    const refreshToken = await this.jwtService.createRefreshToken(user, deviceId);
    const payloadRefreshToken = await this.jwtService.getPayloadByRefreshToken(refreshToken);

    if(!payloadRefreshToken) return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        data: null,                                                          
        extensions: [{ field: "PayloadRefreshToken", message: "Refresh token is wrong" }],  
    };
    

    const session: ISession = {
    userId: user._id.toString(),
    ip, 
    title: userAgent,
    lastActiveDate: new Date(payloadRefreshToken?.iat * 1000).toISOString(), 
    expirationDate: new Date(payloadRefreshToken?.exp * 1000).toISOString(), 
    deviceId,
    }

    await this.sessionsRepo.createSession(session);

    return {
      status: ResultStatus.Success,
      data: [ accessToken, refreshToken, payloadRefreshToken.deviceId ], //payloadRefreshToken.deviceId - вынули чтобы тесты могли норм тестировать 
      extensions: [],
    };; 
  }

  //проверяем логин/почту и пароль юзера (созданног через админку) есть ли он в базе, если нет , то неверные данные , если есть то возвращаем юзера
 async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise< UserDocument | null> {
    const user = await this.usersRepo.findByLoginOrEmail(loginOrEmail);
  
    if (!user) return null;

    const correctPassword = await this.bcryptService.checkPassword(
      password,
      user.accountData.passwordHash,
    );

    return correctPassword ? user : null;
  }

  async registrationUser(dto: CreateUserDto): Promise<Result<string | null>> {
    const { login, email, password } = dto;

    const userByEmail = await this.usersRepo.findByEmail(email);
    if (userByEmail)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,                                                          
        extensions: [{ field: "email", message: "Email already exists" }],  
      };

    const userByLogin = await this.usersRepo.findByLogin(login);    
    if (userByLogin)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "login", message: "Login already exists" }],
      };

    const passwordHash = await this.bcryptService.generationHash(password);
    const confirmationCode = uuidv4();
    const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

    const newUser = UserModel.createUser({login, email, passwordHash, confirmationCode, expirationDate})

    await this.usersRepo.save(newUser);
    
    try {
       await this.nodemailerServise.sendEmail(
        newUser.accountData.email,
        newUser.emailConfirmation.confirmationCode!,
      );
    } catch (e: unknown) {
      console.error("Ошибка отправки email:", e);
      await this.usersRepo.deleteUser(newUser._id.toString()); 
      throw e;
    }

    return {
      status: ResultStatus.Success,
      data: newUser._id.toString(),
      extensions: [],
    };
  }

  async confirmEmail(code: string): Promise<Result<boolean | null>>  {
    const user = await this.usersRepo.findUserByConfirmationCode(code);
    if (!user) 
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "code", message: "Code not found" }],
      };

    try{

    user.confirmEmail();
    await this.usersRepo.save(user);

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };

    } catch (e: unknown){

        return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "code", message: e instanceof Error ? e.message : 'Unknown error'}],
      };
    }
  }

   async confirmReplayEmailCode(email: string): Promise<Result<boolean | null>> {
    const user = await this.usersRepo.findByEmail(email);

    if (!user /* || confirmUser.emailConfirmation.isConfirmed */) 
       return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "email", message: "Email address has already been confirmed or the user has not been found." }],
      };

   try{   
      const code = uuidv4();
      const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

      user.refreshConfirmationCode(code, expirationDate);
      await this.usersRepo.save(user);
    
    try {
        await this.nodemailerServise.sendEmail(
        user.accountData.email,
        user.emailConfirmation.confirmationCode!,
      );
    } catch (e: unknown) {
      console.error("Ошибка отправки email:", e);
    }

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  } catch(e: unknown){
     return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "email", message:  e instanceof Error ? e.message : 'Unknown error' }],
      };
  }

  }

  async updatingAccessAndRefreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<Result<string[] | null>>{

    const user = await this.usersRepo.findById(userId);

    const payloadRefreshToken = await this.jwtService.getPayloadByRefreshToken(refreshToken);
    if(!payloadRefreshToken) return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        data: null,                                                          
        extensions: [{ field: "PayloadRefreshToken", message: "Refresh token is wrong" }],  
    };

    const { deviceId } = payloadRefreshToken;
    
    const newAccessToken = await this.jwtService.createAccessToken(user!);  //юзер точно есть так как мы проверили это в мидлваре
    const newRefreshToken = await this.jwtService.createRefreshToken(user!, deviceId); 

    const payloadNewRefreshToken = await this.jwtService.getPayloadByRefreshToken(newRefreshToken);
    if(!payloadNewRefreshToken) return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        data: null,                                                          
        extensions: [{ field: "PayloadRefreshToken", message: "Refresh token is wrong" }],  
    };

    const dataIapRefresh = new Date(payloadNewRefreshToken.iat * 1000).toISOString();
    const dataExpRefresh = new Date(payloadNewRefreshToken.exp * 1000).toISOString();

    await this.sessionsRepo.updateLastActiveDate( deviceId, dataIapRefresh ) ; //обновили дату сессии(сщздания и протухания)
    await this.sessionsRepo.updateExpDateRefreshToken( deviceId, dataExpRefresh )

    return {
      status: ResultStatus.Success,
      data: [ newAccessToken, newRefreshToken ],
      extensions: [],
    };
  }

 async deleteSession( refreshToken: string ): Promise<Result<boolean | null>>{
    const payload = await this.jwtService.getPayloadByRefreshToken(refreshToken);
    if(!payload) return {                                  
     status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        data: null,
        extensions: [{ field: "RefreshToken", message: "RefreshToken is not payload" }],
    };

    const { userId, deviceId } = payload;
    const result = await this.sessionsRepo.deleteDeviceWithDevicedId(userId, deviceId);
    if(!result)return {                                  
     status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        data: null,
        extensions: [{ field: "Session", message: "Session is not delete" }],
    };
     
    return {                                  
      status: ResultStatus.Success,
      data: true , 
      extensions: [],
    };
  }

 async recoveryPassword(email: string): Promise<boolean | null>{
   
  const user = await this.usersRepo.findByEmail(email);

   if(user){ 
   
   const code = uuidv4();
   const expirationDate = add(new Date(), { hours: 1, minutes: 30 });
   
   user.recoveryPassword(code, expirationDate); 

  await this.usersRepo.save(user);

    try {
        await this.nodemailerServise.sendEmailRecoveryPassword(
        user.accountData.email,
        user.recoveryCode.confirmationCode!,
      );
    } catch (e: unknown) {
      console.error("Ошибка отправки email:", e);
    }

   }

   return true;
  }

 async newPassword(newPassword: string, recoveryCode: string): Promise<Result<boolean | null>>{  
    const user = await this.usersRepo.checkRecoveryCode(recoveryCode);

    if (!user) 
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "recoveryCode", message: "Code not found" }],
      }; 

      try{

      const newPasswordHash = await this.bcryptService.generationHash(newPassword);

      user.updatePassword(newPasswordHash);
      await this.usersRepo.save(user);

      return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  } catch (e: unknown){
        return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "code", message:  e instanceof Error ? e.message : 'Unknown error'  }],

  }
};
}
}









//проверка старая когда не было сессии - перед тем как зайти проверяли токен есть ли он в блэк листе - те не валидный
// async checkRefreshTokenBlackList(
//     refreshToken: string,
//   ): Promise<Result<boolean>>{
     
//     const result = await refreshTokenRepository.findRefreshTokenBlackList(refreshToken);

//       if (result){
//       return {
//         status: ResultStatus.Forbidden,
//         errorMessage: 'Refresh token is on the blacklist',
//         extensions: [{field: 'refreshToken',  message: 'Refresh token s on the blacklist'}],
//         data: true,
//       };
//     }

//     return {
//       status: ResultStatus.Success,
//       extensions: [],
//       data: false,
//     };
//   },



//метод когда не было сессии - заносили рефрешь в блэк оист чтобы пользоваьель не мог зайти 
//  async insertIntoBlackListRefreshToken(
//     refreshToken: string,
//   ): Promise<Result<string | null>>{
     
//     const refreshTokenBlackList = await refreshTokenRepository.insertIntoBlackList(refreshToken);

//     return {                                  
//       status: ResultStatus.Success,
//       data: refreshTokenBlackList,
//       extensions: [],
//     };
//   },