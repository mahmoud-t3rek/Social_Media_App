import { NextFunction,Response,Request } from "express";
import * as UV from "./user.validation";
import userModel, { RoleType } from "../../DB/models/user.model";
import { UserReposotry } from "../../DB/repository/user.repository";
import { Compare, Hash } from "../../utils/hashPassword";
import { AppError } from "../../utils/ClassError";
import crypto from 'crypto-js';
import {CreateOTP} from "../../services/SendEmail";
import { eventEmitter } from "../../utils/EventEmail";
import { createToken } from "../../services/Token";
import { v4 as uuidv4 } from "uuid";
import { RevokeTokenReposotry } from "../../DB/repository/RevokeToken.repository";
import RevokeTokenModel from "../../DB/models/RevokeToken.model";

class UserService{
    private _userModel=new UserReposotry(userModel)
    private _RovekeToken=new RevokeTokenReposotry(RevokeTokenModel)
    constructor(){}
//=========================SignUp==================================
signUp=async(req: Request, res: Response, next: NextFunction)=>{

   const {fName,lName,email,password,Cpassword,age,role,gender,address,phone}:UV.SignUpSchemaType=req.body

   await this._userModel.checkEmail(email)



  const crypt=crypto.AES.encrypt(phone,process.env.PHONE_SECRETKEY as unknown as string).toString();
  const hash = await Hash(password)
 const otp= await CreateOTP()
 const hashotp=await Hash(String(otp))

  const user=await this._userModel.createUser({fName,lName,email,otp:hashotp,password:hash,age,phone:crypt,role,gender,address})
  if(!user)throw new AppError("faild create",400)
    eventEmitter.emit("confirm email",{email,otp})

  res.status(201).json({message:"user created",user})

}

//===========================confirmEmail==========================
confirmEmail= async(req: Request, res: Response, next: NextFunction)=>{
    const {email,otp}:UV.ConfirmEmailSchemaType=req.body
      const user=await this._userModel.findByEmail({email,confirmed:{$exists :false}})
      if(!user){
        throw new AppError("email not found or confirmed",404)
      }
      if(!await Compare(otp,user?.otp!)){
        throw new AppError("Invalid otp",400)
      }
      const updateuser=await this._userModel.UpdateOne({email:user?.email},{confirmed:true,$unset:{otp:" "}})
      res.status(200).json({message:"confirmed"})

    }
//============================SignIn===================================================
signIn=async(req: Request, res: Response, next: NextFunction)=>{
 const {email,password}:UV.SignInSchemaType=req.body
  const user=await this._userModel.findByEmail({email,confirmed:true})
  if(!user || !await Compare(password,user?.password)){
    throw new AppError("Invalid email or password",400);
  }
  const jwtid=uuidv4()
  const isUser=user.role===RoleType.user
  const access_Token=await createToken({
    payload:{email,Id:user?._id},
    signature: isUser? process.env.ACCSESS_TOKENUSER!: process.env.ACCSESS_TOKENADMIN!,
    options:{expiresIn: 60*60,jwtid}
})
  const refresh_Token= await createToken({
    payload:{email,Id:user?._id},
    signature: isUser? process.env.REFRESCH_TOKENUSER!: process.env.REFRESCH_TOKENADMIN!,
    options:{expiresIn: "1y",jwtid}
})
   res.status(200).json({message:"success LogIn",access_Token,refresh_Token})

    }

getProfile=async(req: Request, res: Response, next: NextFunction)=>{

   res.status(200).json({message:"success LogIn",user:req?.user})

    }
    
refreshToken=async(req: Request, res: Response, next: NextFunction)=>{
  const jwtid=uuidv4()
  const user=req.user
  const isUser=user?.role=== RoleType.user
  const access_Token=await createToken({
    payload:{email:user?.email,Id:user?._id},
    signature: isUser? process.env.ACCSESS_TOKENUSER!: process.env.ACCSESS_TOKENADMIN!,
    options:{expiresIn: 60*60,jwtid}
})
  const refresh_Token= await createToken({
    payload:{email:user?.email,Id:user?._id},
    signature: isUser? process.env.REFRESCH_TOKENUSER!: process.env.REFRESCH_TOKENADMIN!,
    options:{expiresIn: "1y",jwtid}
})
  await this._RovekeToken.create({
        userId:req?.user?.id!,
        TokenId:req.decoded?.jti!,
        expireAt:new Date(req?.decoded?.exp! * 1000)
      })


   res.status(200).json({message:"success LogIn",access_Token,refresh_Token})

    }

logOut=async(req: Request, res: Response, next: NextFunction)=>{
      const {flag}:UV.LogOutSchemaType=req.body
      if(flag==UV.FlagType.all){
        await this._userModel.UpdateOne({_id:req?.user?.id},{changeCardnality:new Date()})
        return  res.status(200).json({message:"Log out successfulliy from all devices"})
      }
      await this._RovekeToken.create({
        userId:req?.user?.id!,
        TokenId:req.decoded?.jti!,
        expireAt:new Date(req?.decoded?.exp! * 1000)
      })
       res.status(201).json({message:"Log out successfulliy from this device"})
    }
}
export default new UserService()