import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../utils/ClassError';
import { UserReposotry } from '../DB/repository/user.repository';
import userModel from '../DB/models/user.model';
import { RevokeTokenReposotry } from '../DB/repository/RevokeToken.repository';
import RevokeTokenModel from '../DB/models/RevokeToken.model';

const _RovekeToken=new RevokeTokenReposotry(RevokeTokenModel)

export const createToken = async({ payload, signature, options }: {
  payload: Object,
  signature: string,
  options?: jwt.SignOptions
}): Promise<string> => {
  return jwt.sign(payload,signature,options);
};


export const verifyToken= async ({ token, signature }: {
  token: string,
  signature: string
}): Promise<JwtPayload> => {
  return jwt.verify(token,signature) as JwtPayload;
}


export enum TokenType{
    access="access",
    refresh="refresh"
}

const _userModel=new UserReposotry(userModel)

export const GetSignutre=(tokenType:TokenType,prefix:string)=>{


    if(tokenType==TokenType.access){
       if(prefix=="bearer"){
        return process.env.ACCSESS_TOKENUSER
       }else if(prefix == "Admin"){
          return process.env.ACCSESS_TOKENADMIN
       }else{
        return null
       }
    }
     if(tokenType==TokenType.refresh){
       if(prefix=="bearer"){
        return process.env.REFRESCH_TOKENUSER
       }else if(prefix == "Admin"){
          return process.env.REFRESCH_TOKENADMIN
       }else{
        return null
       }
    }
    return null
}
export const Decoded_Token=async(token:string,signature:string)=>{
    const decoded=await verifyToken({token,signature})
if(!decoded || !decoded.email){
throw new AppError("Invalid token payload", 401)
}

const user=await _userModel.findByEmail({email:decoded?.email})

if(!user){
    throw new AppError("email not exist",400);
}
if(!user?.confirmed){
    throw new AppError("please confirm your email",400);
}
console.log(decoded.jti);


if(await _RovekeToken.findByEmail({TokenId: decoded?.jti})){
  throw new AppError("token has been revoked",401);
}
if(user?.changeCardnality?.getTime()! > decoded.iat! * 1000){
throw new AppError("token has been revoked",401);
}
return {decoded,user}

}