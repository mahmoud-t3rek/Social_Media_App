import { EventEmitter } from "events";
import {  SendEmail } from "../services/SendEmail";
import { TempleteEmail } from "../services/templeteEmail";
import { deleteFile, Get_File } from "./S3config";
import { UserReposotry } from "../DB/repository/user.repository";
import userModel from "../DB/models/user.model";

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

eventEmitter.on("uploadProfileImage",async (data)=>{
 const {Key,oldkey,userId,expireIn}=data
 const  _userModel=new UserReposotry(userModel)
 setTimeout(async() => {
    try {
        await Get_File({ Key })
         await _userModel.findOneAndUpdate({_id:userId},{$unset:{tempProfileImage:""}})
         if(oldkey){
            await deleteFile({
                Key:oldkey
            })
         }
    } catch (error:any) {
        if(error?.Code=="NoSuchKey"){
            if(!oldkey){
                await _userModel.findOneAndUpdate({_id:userId},{$unset:{ProfileImage:""}})
            }else{
         await _userModel.findOneAndUpdate({_id:userId},{profileImage:oldkey,$unset:{tempProfileImage:""}})
 
            }
        }
    }
 }, expireIn * 1000);

})