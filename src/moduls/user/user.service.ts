import { NextFunction,Response,Request } from "express";
import * as UV from "./user.validation";
import userModel, { GenderType, Iuser, ProviderType, RoleType } from "../../DB/models/user.model";
import { UserReposotry } from "../../DB/repository/user.repository";
import { Compare, Hash } from "../../utils/hashPassword";
import { AppError } from "../../utils/ClassError";
import crypto from 'crypto-js';
import {CreateOTP} from "../../services/SendEmail";
import { eventEmitter } from "../../utils/EventEmail";
import { createToken } from "../../services/Token/Token";
import { v4 as uuidv4 } from "uuid";
import { RevokeTokenReposotry } from "../../DB/repository/RevokeToken.repository";
import RevokeTokenModel from "../../DB/models/RevokeToken.model";
import { GenerateTokens } from "../../services/Token/GenreteToken";
import PostModel from "../../DB/models/post.model";
import { PostReposotry } from "../../DB/repository/Post.repository";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { createUrlRequestPresigner, uploadFile, UploadFiles, UploadLargeFile } from "../../utils/S3config";

class UserService{
    private _userModel=new UserReposotry(userModel)
    private _RovekeToken=new RevokeTokenReposotry(RevokeTokenModel)
    private _Postmodel=new PostReposotry(PostModel)
  
    constructor(){}
//=========================SignUp==================================
signUp=async(req: Request, res: Response, next: NextFunction)=>{

   const {fName,lName,email,password,Cpassword,age,role,gender,address,phone}:UV.SignUpSchemaType=req.body

    const finduser=await this._userModel.findOne({email})
  if (finduser) {
    throw new AppError("Email already exists", 400);
  }



  const crypt=crypto.AES.encrypt(phone,process.env.PHONE_SECRETKEY as unknown as string).toString();
  const hash = await Hash(password)
 const otp= await CreateOTP()
 const hashotp=await Hash(String(otp))

  const user=await this._userModel.createUser({fName,lName,email,otp:hashotp,password:hash,age,phone:crypt,role,gender,address,provider:ProviderType.system})
  if(!user)throw new AppError("faild create",400)
    eventEmitter.emit("confirm email",{email,otp})

  res.status(201).json({message:"user created",user})

}

//===========================confirmEmail==========================
confirmEmail= async(req: Request, res: Response, next: NextFunction)=>{
    const {email,otp}:UV.ConfirmEmailSchemaType=req.body
      const user=await this._userModel.findOne({email,confirmed:{$exists :false}})
      if(!user){
        throw new AppError("email not found or confirmed",404)
      }
      if(!await Compare(otp,user?.otp!)){
        throw new AppError("Invalid otp",400)
      }
      const updateuser=await this._userModel.updateOne({email:user?.email},{confirmed:true,$unset:{otp:" "}})
      res.status(200).json({message:"confirmed"})

    }
//============================SignIn===================================================
signIn=async(req: Request, res: Response, next: NextFunction)=>{
 const {email,password}:UV.SignInSchemaType=req.body
 const user=await this._userModel.findOne({email,confirmed:{$exists:true},provider:ProviderType.system})
 if(!user?.confirmed===true){
  throw new AppError("email not confirmed",400);
 }
 if(!user || !await Compare(password,user?.password)){
    throw new AppError("Invalid email or password",400);
  }

 if(user?.stepVerification===true){
 const otp= await CreateOTP()
 const hashotp=await Hash(String(otp))
 eventEmitter.emit("confirm 2stepVerification",{email,otp})
 user.otp=hashotp
 user.otpExp = new Date(Date.now() + 5 * 60 * 1000);
 await user.save()
return res.status(200).json({message: "please confirm from your email",email});

 }
const tokens = await GenerateTokens(user);
res.status(200).json({ message: "success LogIn", ...tokens });

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
        await this._userModel.updateOne({_id:req?.user?.id},{changeCardnality:new Date()})
        return  res.status(200).json({message:"Log out successfulliy from all devices"})
      }
      await this._RovekeToken.create({
        userId:req?.user?.id!,
        TokenId:req.decoded?.jti!,
        expireAt:new Date(req?.decoded?.exp! * 1000)
      })
       res.status(201).json({message:"Log out successfulliy from this device"})
} 
    
updatePassword=async(req: Request, res: Response, next: NextFunction)=>{
    const user=req?.user
    const {password,Cpassword}:UV.UpdatePasswordSchemaType=req.body
    const hash = await Hash(password)

    user!.password = hash
    await user!.save()
    await this._RovekeToken.create({
        userId:req?.user?.id!,
        TokenId:req.decoded?.jti!,
        expireAt:new Date(req?.decoded?.exp! * 1000)
      })

    res.status(200).json({ message: "Password updated successfully" })
    }
updateInfo = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const {gender,age,role,phone,address,lName,fName,email}: UV.UpdateInfoSchemaType = req.body;
   
  if (fName) user!.fName = fName;

  if (lName)user!.lName = lName;

  if (address)user!.address = address;

  if (gender) user!.gender = gender;

  if (age)user!.age = age;
  
  if (role){ 
    user!.role = role
    await this._RovekeToken.create({
    userId: req.user?.id!,
    TokenId: req.decoded?.jti!,
    expireAt: new Date(req.decoded?.exp! * 1000)
    })
  }
  
  if (phone) {
    const cryptPhone = crypto.AES.encrypt(phone,process.env.PHONE_SECRETKEY!).toString();
    user!.phone = cryptPhone;
  }
  if (email) {
  throw new AppError("you can't update your email from this api",403);
}

await user?.save();

  res.status(200).json({ message: "User info updated successfully", user });
};

updateEmail = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const {email}: UV.UpdateEmailSchemaType = req.body;
   
   const finduser=await this._userModel.findOne({email})
  if (finduser) {
    throw new AppError("Email already exists", 400);
  }
 const otp= await CreateOTP()
 const hashotp=await Hash(String(otp))
  if(user?.email==email){
    throw new AppError("this your email already",403);
  }
  eventEmitter.emit("confirm email",{email,otp})
  
  const updateuser=await this._userModel.updateOne({ _id: user?.id },{$set: { email, otp: hashotp,new:true },$unset: { confirmed: "" }})
  if(!updateuser){
    throw new AppError("faild Update",400);
    
  }
  res.status(200).json({ message: "email updated successfully please confirm your new email"});
};

enableStep_Verification = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const {stepVerification}: UV.Enable_STSchemaSchemaType = req.body;
  
  if(user?.stepVerification === stepVerification){
    throw new AppError(`the stepVerification already = ${stepVerification}`,400)
  }
   user!.stepVerification=stepVerification
    await user?.save()
  if(stepVerification===false){
    return res.status(200).json({ message: "2 step Verification has now been disabled on your account."});
  }
  return res.status(200).json({ message: "2 step Verification is now activated on your account"});

};

confirmStep_Verification = async (req: Request, res: Response, next: NextFunction) => {
  const {email,otp}: UV.ConfirmEmailSchemaType = req.body;
  const finduser=await this._userModel.findOne({email,confirmed:true})
 if(!finduser){
  throw new AppError("email not exist or not confirmed",403); 
 }
  if (finduser.otpExp && finduser.otpExp < new Date() || !await Compare(otp,finduser.otp!)) {
    throw new AppError("Invalid or expired OTP", 400);
  }
 await this._userModel.updateOne(
    { email },
    { $unset: { otp: "", otpExpire: "" } }
  );
 const tokens = await GenerateTokens(finduser);
res.status(200).json({ message: "success LogIn", ...tokens });
}

LoginWithGmail=async(req: Request, res: Response, next: NextFunction)=>{
  const {idToken}:UV.LoginWithEmailSchemaType=req.body
   
const client = new OAuth2Client();
async function verify() {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID!, 
      
  });
  const payload = ticket.getPayload();
  
  return payload
  
}


const {email,name,email_verified,picture}=await verify() as TokenPayload


let user = await this._userModel.findOne({ email:email });


if (!user) {
  user = await this._userModel.create({
    email:email!,
    image: picture!,
    userName: name!,
    confirmed: email_verified!,
    provider: ProviderType.Google,
  });

}

if (user.provider === ProviderType.system) {
  throw new AppError("you must login on system", 400);
}

const tokens = await GenerateTokens(user);
return res.status(200).json({ message: "success LogIn", ...tokens });
}

forgetPassword=async(req: Request, res: Response, next: NextFunction)=>{
  const {email}:UV.forgetpasswordSchemaType=req.body
 const user=await this._userModel.findOne({email,confirmed:{$exists:true}})
 if(!user){
  throw new AppError("email not exist or not confirmed",400);
  
 }
 const otp= await CreateOTP()
 const hashotp=await Hash(String(otp))
user!.otp=hashotp

await user!.save()
eventEmitter.emit("forgetpassword",{email,otp})

return res.status(200).json({ message: "please check your email"});
}
resetPassword=async(req: Request, res: Response, next: NextFunction)=>{
  const {password,Cpassword,email,otp}:UV.ResetPasswordSchemaType=req.body
  const user=await this._userModel.findOne({email,otp:{$exists:true}})
  if(!user){
  throw new AppError("email not exist or otp expire ",400);
  }
if(!await Compare(otp,user.otp!)){
throw new AppError("Invalid Otp",400);
}
const hashPassword=await Hash(password)

const updatePassword=await this._userModel.updateOne({email},{password:hashPassword,$unset:{otp:""}})
  
return res.status(200).json({ message: "your password has been changed"});
}

uploadProfileImage=async(req: Request, res: Response, next: NextFunction)=>{
const {ContentType,originalname}=req.body
const key=await createUrlRequestPresigner({
  path:`users/${req.user?._id}/coverImages`,
ContentType,originalname

})
const finduser=await this._userModel.findOneAndUpdate({_id:req.user?._id},
  {
    $set:{
      profileImage:key,
      tempProfileImage:req.user?.profileImage
    }
  }
)
if(!finduser){
  throw new AppError("faild upload image",400);
}
eventEmitter.emit("uploadProfileImage",{userId:req.user?._id,oldkey:req.user?.profileImage,key,expireIn:60})
return res.status(200).json({message:"success", key});
}
UnfreezeAccount=async(req: Request, res: Response, next: NextFunction)=>{
const user=req.user
 const id = req.params.id;

if( user?.role !== "admin"){
throw new AppError("Not authorized to unfreeze this profile",403);
}
  const UpdateUser = await this._userModel.updateOne(
    { _id: id, isDeleted: { $exists: true } },
    {  $unset: { deletedBy: "", isDeleted: "" } }
  );
  if(!UpdateUser){
    throw new AppError("Fail to unfreeze",400);
  }
  res.status(200).json({ message: "Account has been Unfrozen successfully" })
}
freezeAccount=async(req: Request, res: Response, next: NextFunction)=>{
const user=req.user
const id = req.params.id;

if(user?._id.toString() !== id && user?.role !== "admin"){
throw new AppError("Not authorized to freeze this profile",403);
}
  const UpdateUser = await this._userModel.updateOne(
    { _id: id, isDeleted: { $exists: false } },
    { isDeleted: true, deletedBy: user?._id }
  );
  if(!UpdateUser){
    throw new AppError("faild updateAccount",400);
  }
  res.status(200).json({ message: "Account has been frozen successfully" })
}


}
export default new UserService()