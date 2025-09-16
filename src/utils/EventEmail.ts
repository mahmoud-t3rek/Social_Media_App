import { EventEmitter } from "events";
import {  SendEmail } from "../services/SendEmail";
import { TempleteEmail } from "../services/templeteEmail";

export const eventEmitter=new EventEmitter()



eventEmitter.on("confirm email",async (data)=>{
    const {email,otp}=data
   await SendEmail({to:email,subject:"confirm email",html:TempleteEmail("Email confirmation",otp as unknown as string )})
})

eventEmitter.on("confirm 2stepVerification",async (data)=>{
    const {email,otp}=data
   await SendEmail({to:email,subject:"confirm email",html:TempleteEmail("Email confirmation",otp as unknown as string )})
})
eventEmitter.on("forgetpassword",async (data)=>{
    const {email,otp}=data
   await SendEmail({to:email,subject:"forget password",html:TempleteEmail("forget password",otp as unknown as string )})
})