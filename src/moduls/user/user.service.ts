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
import { createUrlRequestPresigner, Get_File, uploadFile, UploadFiles, UploadLargeFile } from "../../utils/S3config";
import { frinedRequastReposotry } from "../../DB/repository/frinedRequast.repository ";
import frinedRequastModel from "../../DB/models/frinedrequaste.model";
import { Types } from "mongoose";
import { chatReposotry } from "../../DB/repository/chat.repository";
import ChatModel from "../../DB/models/chat.model";
import { users } from "./graphQl/user.feilds";
import { graphql, GraphQLError } from "graphql";
import { AuthountcationQQL } from "../../middleware/authountcation";



class UserService{
    private _userModel=new UserReposotry(userModel)
    private _RovekeToken=new RevokeTokenReposotry(RevokeTokenModel)
    private _Postmodel=new PostReposotry(PostModel)
    private _frineRequestModel=new frinedRequastReposotry(frinedRequastModel)
    private _chatModel=new  chatReposotry(ChatModel)
    

  
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
const userDoc = await this._userModel.findOne({ _id: req.user?._id },undefined,{
  populate:[{
    path:"friends"
  }]
})
const groups=await this._chatModel.find({
  filter:{participantses:{$in:[req?.user?._id]},
 group: { $exists: true}
}})






res.status(200).json({ message: "success LogIn",data:{user:userDoc,groups}});



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
dashBoard=async(req: Request, res: Response, next: NextFunction)=>{
const results=await Promise.allSettled([
  this._userModel.find({filter:{}}),
  this._Postmodel.find({filter:{}})
])
  res.status(200).json({ message: " success" ,results})
}
changeRole=async(req: Request, res: Response, next: NextFunction)=>{
  const{id}=req.params 
  const user=req.user 
  const {role:newRole}=req.body 
const denyRoles:RoleType[]=[newRole,RoleType.superAdmin]
if(user?.role===RoleType.admin){
  denyRoles.push(RoleType.admin)
  if(newRole==RoleType.superAdmin){
    throw new AppError("un authouraized",401);
  }
}

const finduser=await this._userModel.findOneAndUpdate({
  _id:id,
  role:{$nin:denyRoles}
},{
  role:newRole
},{
  new:true
})
if(!finduser){
  throw new AppError("user not found",404);
}
  res.status(200).json({ message: " success" 

  })
}
sendRequest=async(req: Request, res: Response, next: NextFunction)=>{
const {id}=req.params
const user=req.user
const finduser=await this._userModel.findOne({_id:id})
if(!finduser){
  throw new AppError("user not found",404)
}
if(user?._id===id){
  throw new AppError("can't send request to your self ",404)
}

const checkfriend=await this._frineRequestModel.findOne({
  sendTo:{$in:[id , user?._id]},
  createdBy:{$in:[id , user?._id]},
})
if(checkfriend){
  throw new AppError("request already sent",404)
}
const request=await this._frineRequestModel.create({
  createdBy:user?._id as unknown as Types.ObjectId,
  sendTo:id as unknown as Types.ObjectId,
})
  res.status(200).json({ message: " success" })
}
acceptRequest=async(req: Request, res: Response, next: NextFunction)=>{
const{requestid}=req.params
const user=req.user



const checkRequast=await this._frineRequestModel.findOneAndUpdate({
  _id:requestid,
  sendTo:user?._id,
accepted: { $exists: false }
},{
accepted:true

})
if(!checkRequast){
  throw new AppError("not request found",404); 
}

const [res1, res2] = await Promise.all([
  this._userModel.updateOne(
    { _id: checkRequast.sendTo, friends: { $nin: [checkRequast.createdBy] } },
    { $push: { friends: checkRequast.createdBy } }
  ),
  this._userModel.updateOne(
    { _id: checkRequast.createdBy, friends: { $nin: [checkRequast.sendTo] } },
    { $push: { friends: checkRequast.sendTo } }
  )
]);

if (res1?.modifiedCount === 0 && res2?.modifiedCount === 0) {
  throw new AppError("users are already friends", 400);
}


  res.status(200).json({ message: " success" })
}
uploadpicture=async (req: Request, res: Response, next: NextFunction)=>{
    const {path}=req.params as unknown as {path:string[]}
    const Key=path.join("/")
    const result=await Get_File({Key})
    const stream=result.Body as NodeJS.ReadableStream
res.set("Cross-Origin-Resource-Policy", "cross-origin");
res.setHeader("Content-Type", result.ContentType || "application/octet-stream");
stream.pipe(res)
     
  }
 //==========================GraphQl======================================
 getAllUsers=async()=>{
   const user=await this._userModel.find({filter:{}})
   return user
 } 
 getOneUser=async(parent:any,args:any,context:any)=>{

  
       const {user}=  await AuthountcationQQL(context.req.headers.authorization)

        const finduser=await this._userModel.findOne({_id:user?._id})
          if(!finduser){
             throw new GraphQLError("user not found",{extensions:{
            message:"user not exist",
            statusCode:404
          }});
          }
            return user
  }
createUser=async(parent: any, args: any) => {
        const { fName,lName, email, password, gender,role,age } = args;
        const finduser=await this._userModel.findOne({email})
        if(finduser){
          throw new GraphQLError("email already exist",{extensions:{
            message:"email alreday exist",
            statusCode:400
          }});
        }
      const hashPassword=await Hash(password)
      const otp= await CreateOTP()
      const hashotp=await Hash(String(otp))
      const user=await this._userModel.create({
        fName,
        lName,
        email,
        password:hashPassword,
        gender,
        role,
        age
      })
      eventEmitter.emit("confirm email",{email,otp})

        return user;
        }
}
export default new UserService() 