import {  WithId } from "mongodb";
import { usersRepository } from "../../users/infrastructure/user.repository";
import { bcryptService } from "../adapters/bcrypt.service";
import { IUserAuthMe } from "../../users/types/user.auth.me.output";
import { usersQwRepository } from "../../users/infrastructure/user.query.repository";
import { nodemailerServise } from "../adapters/nodemailer.server";
import { UserAccountDbType } from "../types/user.account.db.type";
import { v4 as uuidv4 } from "uuid";
import { add } from "date-fns";
import { CreateUserDto } from "../../users/types/create.user.dto";
import { Result } from "../../common/result/result.type";
import { ResultStatus } from "../../common/result/resultCode";
import { UserUpdateEmailResending } from "../../users/types/updateUserByEmailResending";
import { jwtService } from "../adapters/jwt.service";
import { refreshTokenRepository } from "../infrastructure/refreshToken.repositiry";
import { RefreshTokenType } from "../types/refrash.token.dto.for.black.list";

export const authServer = {
  async loginUser(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<string[] | null>>{

    const isCorrectCredentials = await this.checkUserCredentials(
      loginOrEmail,
      password,
    );

    if (!isCorrectCredentials) return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        data: null,                                                          
        extensions: [{ field: "loginOrEmail", message: "Email or login is wrong" }],  
    };
    
    const accessToken = await jwtService.createAccessToken(isCorrectCredentials);
    const refreshToken = await jwtService.createRefreshToken(isCorrectCredentials);

    return {
      status: ResultStatus.Success,
      data: [accessToken, refreshToken],
      extensions: [],
    };; 
  },

  //проверяем логин/почту и пароль юзера (созданног через админку) есть ли он в базе, если нет , то неверные данные , если есть то возвращаем юзера
  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<WithId<UserAccountDbType> | null> {
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
  
    if (!user) return null;

    const correctPassword = await bcryptService.checkPassword(
      password,
      user.accountData.passwordHash,
    );

    return correctPassword ? user : null;
  },


  async getUserByUserId(userId: string): Promise<IUserAuthMe | null> {
    const user = await usersQwRepository.findUserByUserId(userId);
    if (!user) return null;

    return user;
  },

  async registrationUser(dto: CreateUserDto): Promise<Result<string | null>> {
    const { login, email, password } = dto;

    const userByEmail = await usersRepository.findByEmail(email);
    if (userByEmail)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,                                                          
        extensions: [{ field: "email", message: "Email already exists" }],  
      };

    const userByLogin = await usersRepository.findByLogin(login);    
    if (userByLogin)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "login", message: "Login already exists" }],
      };

    const passwordHash = await bcryptService.generationHash(password);

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

    const resultCreateUser = await usersRepository.createUser(newUser);

    try {
      const sendEmail = await nodemailerServise.sendEmail(
        newUser.accountData.email,
        newUser.emailConfirmation.confirmationCode!,
      );
    } catch (e: unknown) {
      console.error("Ошибка отправки email:", e);
      await usersRepository.deleteUser(resultCreateUser);
    }

    return {
      status: ResultStatus.Success,
      data: resultCreateUser,
      extensions: [],
    };
  },

  async confirmEmail(code: string): Promise<Result<boolean | null>>  {
    const user = await usersRepository.findUserByConfirmationCode(code);
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

    const updateConfirm = await usersRepository.updateIsConfirmed(
      user.accountData.email,
    );
     return {
      status: ResultStatus.Success,
      data: updateConfirm,
      extensions: [],
    };
  },

  async confirmReplayEmailCode(email: string): Promise<Result<boolean | null>> {
    const confirmUser = await usersRepository.findByEmail(email);

    if (!confirmUser || confirmUser.emailConfirmation.isConfirmed) 
       return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "email", message: "Email address has already been confirmed or the user has not been found." }],
      };;

    const updateUser: UserUpdateEmailResending = {  
     
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1, minutes: 30 }),

    };
     
    const resultUpdateUser = await usersRepository.updateUserByEmailResending(email, updateUser);
    
    try {
      const sendEmail = await nodemailerServise.sendEmail(
        confirmUser.accountData.email,
        updateUser.confirmationCode!,
      );
    } catch (e: unknown) {
      console.error("Ошибка отправки email:", e);
      await usersRepository.deleteUser(confirmUser._id.toString());
    }

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };;
  },

    async updatingAccsesAndRefrefhTokens(
    userId: string,
  ): Promise<Result<string[] | null>>{

    const user = await usersRepository.findById(userId)
    
    const accessToken = await jwtService.createAccessToken(user!);  //юзер точно есть так как мы проверили это в мидлваре
    const refreshToken = await jwtService.createRefreshToken(user!);

    return {
      status: ResultStatus.Success,
      data: [accessToken, refreshToken],
      extensions: [],
    };; 
  },

    async insertIntoBlackListRefreshToken(
    refreshToken: string,
  ): Promise<Result<string | null>>{
     
    const refreshTokenBlackList = await refreshTokenRepository.insertIntoBlackList(refreshToken);

    return {                                  //нАДО ЗДЕСЬ ОБЖЕСТ РЕЗАЛТ?
      status: ResultStatus.Success,
      data: refreshTokenBlackList,
      extensions: [],
    };
  },


   async checkRefreshTokenBlackList(
    refreshToken: string,
  ): Promise<Result<boolean>>{
     
    const result = await refreshTokenRepository.findRefreshTokenBlackList(refreshToken);

      if (result){
      return {
        status: ResultStatus.Forbidden,
        errorMessage: 'Refresh token is on the blacklist',
        extensions: [{field: 'refreshToken',  message: 'Refresh token s on the blacklist'}],
        data: true,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: false,
    };
  },
};
