import request from "supertest";
import { setupApp } from "../../../src/setup-app";
import express from "express";
import { runDB } from "../../../src/db/mongo.db";
import { SETTINGS } from "../../../src/common/settings/setting";
import {
  AUTH_PATH,
  SECURITY_DEVICES_PATH,
  TESTING_PATH,
} from "../../../src/common/paths/path";
import { HttpStatus } from "../../../src/common/types/http.status";
import { registerAndConfirmUser } from "../../../test-utils/sessions/registration.helper";
import { loginAndGetTokens } from "../../../test-utils/sessions/login.helper";
import mongoose from "mongoose";

describe("SECURITY_DEVICES_TEST", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
  });

  beforeEach(async () => {
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
      await mongoose.disconnect();
  });

  const validDtoCreateUser = {
    login: "admin_7",
    password: "Passw0rd!",
    email: "admin.test@mail.ru",
  };

  const validDtoCreateUser2 = {
    login: "admin_8",
    password: "Passw00rd!",
    email: "admins.test@mail.ru",
  };

  describe("GET /securety /devices", () => {
    it("STATUS 200", async () => {
      await registerAndConfirmUser(app, validDtoCreateUser);

      const device1 = await loginAndGetTokens( app, validDtoCreateUser, "device-1", '1.1.1.1');
      const device2 = await loginAndGetTokens(app, validDtoCreateUser, "device-2", '2.2.2.2');
      const device3 = await loginAndGetTokens( app, validDtoCreateUser, "device-3", '3.3.3.3');
      const device4 = await loginAndGetTokens( app, validDtoCreateUser, "device-4", '4.4.4.4');

      const res = await request(app)
        .get(SECURITY_DEVICES_PATH)
        .set("Cookie", [`refreshToken=${device1.refreshToken}`])
        .expect(HttpStatus.OK);

      const devicesIds = res.body.map((c: any) => c.deviceId);
      expect(devicesIds.length).toBe(4);

      res.body.forEach((device: any) => { //проверяем каждый элемент массива
      expect(device).toHaveProperty("ip");
      expect(device).toHaveProperty("title");
      expect(device).toHaveProperty("lastActiveDate");
      expect(device).toHaveProperty("deviceId");
       });
    })

    it("STATUS 401", async () => {
      await request(app)
        .get(SECURITY_DEVICES_PATH)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("DELETE /securety /devices", () => {
    it("STATUS 204", async () => {                 //ПРОВЕРИТЬ НА ДРУГОГО ПОЛЬЗОВАТЕЛЯ - СКРЕЩИВАНИЕ
      await registerAndConfirmUser(app, validDtoCreateUser);

      const device1 = await loginAndGetTokens( app, validDtoCreateUser, "device-1", '1.1.1.1');
       await loginAndGetTokens( app, validDtoCreateUser,"device-2", '2.2.2.2');
       await loginAndGetTokens( app, validDtoCreateUser, "device-3", '2.2.3.3');
       await loginAndGetTokens( app, validDtoCreateUser, "device-4", '4.4.4.4');

     await request(app)
        .delete(SECURITY_DEVICES_PATH)
        .set("Cookie", [`refreshToken=${device1.refreshToken}`])
        .expect(HttpStatus.NO_CONTENT);

      const devices = await request(app)
        .get(SECURITY_DEVICES_PATH)
        .set("Cookie", [`refreshToken=${device1.refreshToken}`])
        .expect(HttpStatus.OK);

      expect(devices.body.length).toBe(1);
      expect(devices.body[0].deviceId).toBe(device1.deviceId);
    });

    it("STATUS 401", async () => {
      await request(app)
        .delete(SECURITY_DEVICES_PATH)
        .expect(HttpStatus.UNAUTHORIZED);
    });

  //   it("STATUS 404", async () => {  //по заданию нет 404 статуса
  //  //????
  //     await registerAndConfirmUser(app, validDtoCreateUser);

  //     const device1 = await loginAndGetTokens( app, validDtoCreateUser, "device-1" );

  //     await request(app)
  //       .delete(SECURITY_DEVICES_PATH)
  //       .set("Cookie", [`refreshToken=${device1.refreshToken}`])
  //       .expect(HttpStatus.NO_CONTENT);

  //     const res = await request(app)
  //       .get(SECURITY_DEVICES_PATH)
  //       .set("Cookie", [`refreshToken=${device1.refreshToken}`])
  //       .expect(HttpStatus.OK); 

  // });
  })

  describe("DELETE /securety /devices / devicesId", () => {

    it("should delete devices except active device: STATUS 204", async () => {
      await registerAndConfirmUser(app, validDtoCreateUser);
      const device1 = await loginAndGetTokens( app, validDtoCreateUser, "device-1", '1.1.1.1' );
      const device2 = await loginAndGetTokens( app, validDtoCreateUser, "device-2", '2.1.1.1' );

      const { deviceId, refreshToken } = device1;
   
        await request(app)
        .delete(`${SECURITY_DEVICES_PATH}/${deviceId}`)
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(HttpStatus.NO_CONTENT);

        const res = await request(app)
        .get(`${SECURITY_DEVICES_PATH}`)
        .set('Cookie', [`refreshToken=${device2.refreshToken}`])
        .expect(HttpStatus.OK);

         const deviceIds = res.body.map((d: any) => d.deviceId);

        expect(deviceIds).not.toContain(deviceId);
        expect(deviceIds.length).toBe(1);

    })

    it("should not delete device if have not refresh token: STATUS 401", async () => {
      await registerAndConfirmUser(app, validDtoCreateUser);
      const device = await loginAndGetTokens( app, validDtoCreateUser, "device-1", '1.1.1.1' );

      const { deviceId } = device;

      await request(app)
        .delete(`${SECURITY_DEVICES_PATH}/${deviceId}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("should not delete device if device another user: STATUS 403", async () => {
      await registerAndConfirmUser(app, validDtoCreateUser);   //1й пользователь
      await registerAndConfirmUser(app, validDtoCreateUser2); //2й пользователь с другими данными входными

      const deviceUser1 = await loginAndGetTokens( app, validDtoCreateUser, "device-1", '1.1.1.1' );
      const deviceUser2 = await loginAndGetTokens( app, validDtoCreateUser2, "device-2", '2.2.2.2' );

      const deviceId1 = deviceUser1.deviceId;

      await request(app)
        .delete(`${SECURITY_DEVICES_PATH}/${deviceId1}`)
        .set("Cookie", [`refreshToken=${deviceUser2.refreshToken}`])
        .expect(HttpStatus.FORBIDDEN);
    });

    it("should not delete device if device not found:STATUS 404", async () => {
      await registerAndConfirmUser(app, validDtoCreateUser);

      const device1 = await loginAndGetTokens( app, validDtoCreateUser, "device-1", '1.1.1.1');
      const device2 = await loginAndGetTokens( app, validDtoCreateUser, "device-2", '2.2.2.2' );
    
      const deviceId1 = device1.deviceId;
      

      await request(app)
        .delete(`${SECURITY_DEVICES_PATH}/${deviceId1}`)
        .set("Cookie", [`refreshToken=${device1.refreshToken}`])
        .expect(HttpStatus.NO_CONTENT);
         

      await request(app)
        .delete(`${SECURITY_DEVICES_PATH}/${deviceId1}`)
        .set("Cookie", [`refreshToken=${device2.refreshToken}`])
        .expect(HttpStatus.NOT_FOUND);
       
    });
  });

  describe("ANOTHER CHECK", () => {
  it("flow", async () => {

     await registerAndConfirmUser(app, validDtoCreateUser);

      const device1 = await loginAndGetTokens( app, validDtoCreateUser, "device-1", '1.1.1.1');
      const device2 = await loginAndGetTokens(app, validDtoCreateUser, "device-2", '2.2.2.2');
      const device3 = await loginAndGetTokens( app, validDtoCreateUser, "device-3", '3.3.3.3');
      const device4 = await loginAndGetTokens( app, validDtoCreateUser, "device-4", '4.4.4.4');

      const refreshToken1 = device1.refreshToken;

      const beforeRes = await request(app)
       .get(SECURITY_DEVICES_PATH)
       .set("Cookie", [`refreshToken=${refreshToken1}`])
       .expect(HttpStatus.OK);

        const before = beforeRes.body.find(
        (d: any) => d.deviceId === device1.deviceId );

       const result = await request(app)
                .post(`${AUTH_PATH}/refresh-token`)
                .set("Cookie", [`refreshToken=${refreshToken1}`])
                .expect(HttpStatus.OK);

       const newRefreshToken = result.headers['set-cookie'][0].split(';')[0].split('=')[1];       

       const afterRes = await request(app)
      .get(SECURITY_DEVICES_PATH)
      .set("Cookie", [`refreshToken=${newRefreshToken}`])
      .expect(HttpStatus.OK);

      const after = afterRes.body.find( (d: any) => d.deviceId === device1.deviceId );

       expect(after.lastActiveDate).not.toBe(before.lastActiveDate);
       expect(after.deviceId).toBe(before.deviceId);
      
      await request(app)
        .delete(`${SECURITY_DEVICES_PATH}/${device2.deviceId}`)
        .set('Cookie', [`refreshToken=${newRefreshToken}`])
        .expect(HttpStatus.NO_CONTENT);

     
       const res1 = await request(app)
        .get(SECURITY_DEVICES_PATH)
        .set("Cookie", [`refreshToken=${newRefreshToken}`])
        .expect(HttpStatus.OK); 

        const ids = res1.body.map((d: any) => d.deviceId);
        expect(ids).not.toContain(device2.deviceId);

       await request(app)
               .post(`${AUTH_PATH}/logout`)
               .set("Cookie", [`refreshToken=${device3.refreshToken}`])
               .expect(HttpStatus.NO_CONTENT); 

        //проверяем что деваса 3 нет в списке        

       const res2 = await request(app)
        .get(SECURITY_DEVICES_PATH)
        .set("Cookie", [`refreshToken=${newRefreshToken}`])
        .expect(HttpStatus.OK);
        
        const ids3 = res2.body.map((d: any) => d.deviceId);
        expect(ids3).not.toContain(device3.deviceId);
        
       await request(app)
        .delete(SECURITY_DEVICES_PATH)
        .set("Cookie", [`refreshToken=${newRefreshToken}`])
        .expect(HttpStatus.NO_CONTENT); 
               
        const finalRes = await request(app)
        .get(SECURITY_DEVICES_PATH)
        .set("Cookie", [`refreshToken=${newRefreshToken}`])
        .expect(HttpStatus.OK); 
        
        expect(finalRes.body.length).toBe(1);
         expect(finalRes.body[0].deviceId).toBe(device1.deviceId);
 
  })

  })
});

// Обновить refreshToken девайса через соотвествующий эндопоинт - проверить
// Проверить псоле  deviceId после refresh - что он не поменялся
// еще наверное проверить сам ендоипонт логаут - ведь мы будем выходить из него? - сколько долдно остаться девайсов после проверить ? или как 
