import nodemailer from "nodemailer";
import { SETTINGS } from "../../common/settings/setting";
import { EmailExamples } from "./emailExamples";
import { injectable } from "inversify";

@injectable()
export class NodemailerServise {

  async sendEmail(email: string, code: string, subject: string = 'Your code is here',){
  
    let transport = nodemailer.createTransport({

      service: "Mail.ru",
      auth: {
        user: SETTINGS.EMAIL,
        pass: SETTINGS.EMAIL_PASS,
      },
    });
 
    let arg = {
        from: `"Marianna" <${SETTINGS.EMAIL}>`,
        to: email,
        subject: subject,
        html: EmailExamples.registrationEmail(code),
    }

    let info = await transport.sendMail(arg);
    return !!info; 
  }

   async sendEmailRecoveryPassword(email: string, code: string, subject: string = 'Your code is here',){
  
    let transport = nodemailer.createTransport({

      service: "Mail.ru",
      auth: {
        user: SETTINGS.EMAIL,
        pass: SETTINGS.EMAIL_PASS,
      },
    });
 
    let arg = {
        from: `"Marianna" <${SETTINGS.EMAIL}>`,
        to: email,
        subject: subject,
        html: EmailExamples.passwordRecoveryEmail(code),
    }

    let info = await transport.sendMail(arg);
    return !!info; 
  }
};


