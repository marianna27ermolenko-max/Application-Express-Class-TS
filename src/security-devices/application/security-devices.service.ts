import { inject, injectable } from "inversify";
import { JwtService } from "../../auth/adapters/jwt.service";
import { Result } from "../../common/result/result.type";
import { ResultStatus } from "../../common/result/resultCode";
import { SessionsRepository } from "../infrastructure/security-devices.repository";


@injectable()
export class SecurityDevicesService {

   
    private sessionsRepo: SessionsRepository;
    private jwtService: JwtService;

    constructor( @inject(JwtService) jwtService: JwtService, @inject(SessionsRepository) sessionsRepo: SessionsRepository){
      
      this.sessionsRepo = sessionsRepo;
      this.jwtService = jwtService;
    }

    async deleteDevices( userId: string, refreshToken: string ): Promise<boolean>{

     const payload = await this.jwtService.getPayloadByRefreshToken(refreshToken);
     if(!payload) return false;

     const deviceId = payload.deviceId;
      
    return  await  this.sessionsRepo.deleteDevices(userId, deviceId);
    }
    
     async deleteDevicesWithDeviceId( userId: string, deviceIdWithParams: string, ): Promise<Result<boolean>>{

     const session = await  this.sessionsRepo.findSession( deviceIdWithParams ); //она точно есть так как есть проверка в мидлваре - до хендлера
 
     if(!session){ return {  
       status: ResultStatus.NotFound,
       errorMessage: 'Session not found',
       extensions: [{ field: 'Session' , message: 'Session not found' }],
       data: false,
     }}

     if( session.userId !== userId){ return {  
       status: ResultStatus.Forbidden,
       errorMessage: 'Wrong refresh token',
       extensions: [{ field: 'Session' , message: 'DeviceId of other user' }],
       data: false,
     }}

   await  this.sessionsRepo.deleteDeviceWithDevicedId(userId, deviceIdWithParams);
    
    return {  
       status: ResultStatus.Success,
       extensions: [],
       data: true,
     }
    } 
}
