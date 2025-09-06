import { EventEmitter } from "events";
import { CreateOTP, SendEmail } from "../services/SendEmail";
import { TempleteEmail } from "../services/templeteEmail";

export const eventEmitter=new EventEmitter()



eventEmitter.on("confirm email",async (data)=>{
    const {email}=data
    const otp= await CreateOTP()
   await SendEmail({to:email,subject:"confirm email",html:TempleteEmail("Email confirmation",otp as unknown as string )})
})