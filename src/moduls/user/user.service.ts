import { NextFunction,Response,Request } from "express";
import { userRoleValid } from "./user.validation";
import { Model } from "mongoose";
import { DBRepository } from "../../DB/repository/class.repository";
import userModel, { Iuser } from "../../DB/models/user.model";
import { UserReposotry } from "../../DB/repository/user.repository";
import { HashPassword } from "../../utils/hashPassword";
import { AppError } from "../../utils/ClassError";
import crypto from 'crypto-js';
import {CreateOTP, SendEmail} from "../../services/SendEmail";
import { TempleteEmail } from "../../services/templeteEmail";
import { eventEmitter } from "../../utils/EventEmail";

class UserService{
    private _userModel=new UserReposotry(userModel)
    constructor(){}
//=========================SignUp==================================
signUp=async(req: Request, res: Response, next: NextFunction)=>{

   const {fName,lName,email,password,Cpassword,age,role,gender,address,phone}:userRoleValid=req.body

   await this._userModel.checkEmail(email)



  const crypt=crypto.AES.encrypt(phone,process.env.PHONE_SECRETKEY as unknown as string).toString();
  const hash = await HashPassword(password)


  const user=await this._userModel.createUser({fName,lName,email,password:hash,age,phone:crypt,role,gender,address})
  if(!user)throw new AppError("faild create",400)
    eventEmitter.emit("confirm email",{email})

  res.status(201).json({message:"user created",user})

}
//============================SignIn===================================================
signIn=(req: Request, res: Response, next: NextFunction)=>{

    }
}
export default new UserService()