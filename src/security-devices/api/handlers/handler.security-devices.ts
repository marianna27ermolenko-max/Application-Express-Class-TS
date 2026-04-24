import { Response, Request } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { SecurityDevicesService } from "../../domain/security-devices.service";
import { ResultStatus } from "../../../common/result/resultCode";
import { inject, injectable } from "inversify";

@injectable()
export class SecurityDevicesController {

securityDevicesService: SecurityDevicesService;

constructor(@inject(SecurityDevicesService) securityDevicesService: SecurityDevicesService){
    this.securityDevicesService = securityDevicesService;
}

 async deleteAllDevicesHandler(req: Request, res: Response){

    try {

    const userId = req.userId;
    const refreshToken = req.cookies.refreshToken;
    const deleteSessions = await this.securityDevicesService.deleteDevices(userId!, refreshToken);
    if(!deleteSessions) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    res.sendStatus(HttpStatus.NO_CONTENT);
    
    }catch(e: any){
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

 async deleteDeviceHandler(req: Request, res: Response){

    try {
    const deviceId = req.params.deviceId as string;    
    const userId = req.userId;

    const deleteSession = await this.securityDevicesService.deleteDevicesWithDeviceId(userId!, deviceId);
    if(deleteSession.status === ResultStatus.Unauthorized) return res.sendStatus(HttpStatus.UNAUTHORIZED);
    if(deleteSession.status === ResultStatus.Forbidden) return res.sendStatus(HttpStatus.FORBIDDEN); 
    if(deleteSession.status === ResultStatus.NotFound) return res.sendStatus(HttpStatus.NOT_FOUND); 
    if(deleteSession.status === ResultStatus.Success) return res.sendStatus(HttpStatus.NO_CONTENT); 
    
    }catch(e: any){
    
    return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

 async getDevicesHandler(req: Request, res: Response){

    try {

    const userId = req.userId;
    const sessions = await this.securityDevicesService.findAllDevices(userId!);

    res.status(HttpStatus.OK).json(sessions);
  
    }catch(e: any){
    
     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
}

