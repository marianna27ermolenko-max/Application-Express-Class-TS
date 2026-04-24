import { WithId } from "mongodb";
import { UsersRepository } from "../../users/infrastructure/user.repository";
import { BcryptService } from "../adapters/bcrypt.service";
import { IUserAuthMe } from "../../users/types/user.auth.me.output";
import { UsersQwRepository } from "../../users/infrastructure/user.query.repository";
import { NodemailerServise } from "../adapters/nodemailer.server";
import { UserAccountDbType } from "../types/user.account.db.type";
import { v4 as uuidv4 } from "uuid";
import { add } from "date-fns";
import { CreateUserDto } from "../../users/types/create.user.dto";
import { Result } from "../../common/result/result.type";
import { ResultStatus } from "../../common/result/resultCode";
import { UserUpdateEmailResending } from "../../users/types/updateUserByEmailResending";
import { JwtService } from "../adapters/jwt.service";
import { ISessionDB } from "../../security-devices/types/ISessionDB";
import { SessionsRepository } from "../../security-devices/infrastructure/security-devices.repository";
import { inject, injectable } from "inversify";

@injectable()
export class AuthService {
  jwtService: JwtService;
  usersRepo: UsersRepository;
  bcryptService: BcryptService;
  sessionsRepo: SessionsRepository;
  usersQwRepo: UsersQwRepository;
  nodemailerServise: NodemailerServise;

  constructor( @inject(UsersRepository) usersRepo: UsersRepository,  @inject(BcryptService) bcryptService: BcryptService, @inject(JwtService) jwtService: JwtService, 
  @inject(SessionsRepository) sessionsRepo: SessionsRepository,
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
    

    const session: ISessionDB = {
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
  ): Promise<WithId<UserAccountDbType> | null> {
    const user = await this.usersRepo.findByLoginOrEmail(loginOrEmail);
  
    if (!user) return null;

    const correctPassword = await this.bcryptService.checkPassword(
      password,
      user.accountData.passwordHash,
    );

    return correctPassword ? user : null;
  }


   async getUserByUserId(userId: string): Promise<IUserAuthMe | null> {
    const user = await this.usersQwRepo.findUserByUserId(userId);
    if (!user) return null;

    return user;
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

    const newUser: UserAccountDbType = {
      accountData: {
        login,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1, minutes: 30 }),
        isConfirmed: false,
      },
    };

    const resultCreateUser = await this.usersRepo.createUser(newUser);

    try {
      const sendEmail = await this.nodemailerServise.sendEmail(
        newUser.accountData.email,
        newUser.emailConfirmation.confirmationCode!,
      );
    } catch (e: unknown) {
      console.error("Ошибка отправки email:", e);
      await this.usersRepo.deleteUser(resultCreateUser);
    }

    return {
      status: ResultStatus.Success,
      data: resultCreateUser,
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

      if (user.emailConfirmation.isConfirmed) 
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "code", message: "Code already confirmed" }],
      };

    if (user.emailConfirmation.expirationDate! < new Date()) 
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "code", message: "Code expired" }],
      };

    const updateConfirm = await this.usersRepo.updateIsConfirmed(
      user.accountData.email,
    );
     return {
      status: ResultStatus.Success,
      data: updateConfirm,
      extensions: [],
    };
  }

   async confirmReplayEmailCode(email: string): Promise<Result<boolean | null>> {
    const confirmUser = await this.usersRepo.findByEmail(email);

    if (!confirmUser || confirmUser.emailConfirmation.isConfirmed) 
       return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "email", message: "Email address has already been confirmed or the user has not been found." }],
      };

    const updateUser: UserUpdateEmailResending = {  
     
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1, minutes: 30 }),

    };
     
    await this.usersRepo.updateUserByEmailResending(email, updateUser);
    
    try {
        await this.nodemailerServise.sendEmail(
        confirmUser.accountData.email,
        updateUser.confirmationCode!,
      );
    } catch (e: unknown) {
      console.error("Ошибка отправки email:", e);
      await this.usersRepo.deleteUser(confirmUser._id.toString());
    }

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };;
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
   const date = add(new Date(), { hours: 1, minutes: 30 });
   const updateRecoveryCode = await this.usersRepo.updateRecoveryCode(user._id.toString(), code, date)

   if(!updateRecoveryCode) return null;

    try {
        await this.nodemailerServise.sendEmailRecoveryPassword(
        user.accountData.email,
        code,
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

    if(user && user.recoveryCode?.expirationDate! < new Date())   
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "code", message: "Code expired" }],
      };

      const newPasswordHash = await this.bcryptService.generationHash(newPassword);
      const resultUpdateNewPassword = await this.usersRepo.updateNewPassword(user._id.toString(), newPasswordHash);
    
      return {
      status: ResultStatus.Success,
      data: resultUpdateNewPassword,
      extensions: [],
    };
  ;
};
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