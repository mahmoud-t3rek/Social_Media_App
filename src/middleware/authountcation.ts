import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/ClassError";
import * as  T from "../services/Token/Token";
import { GraphQLError } from "graphql";




export const Authountcation=(tokentype:T.TokenType=T.TokenType.access)=>{
    return async (req: Request, res: Response, next: NextFunction) =>{
   const {authorization}=req.headers
   if(!authorization){
    throw new AppError("Invalid Token",400);
   }
   const [prefix,token]=authorization?.split(" ") || []
   
   if(!prefix || !token){
    throw new AppError("Invalid Token",400);    
   }
   const signature=await T.GetSignutre(tokentype,prefix)
   if(!signature){
    throw new AppError("Invalid signture", 400 );  
   }
   const decode=await T.Decoded_Token(token,signature!)
   if(!decode){
    throw new AppError("Invalid tokan", 400 );  
   }
   
   req.user=decode?.user
   req.decoded=decode?.decoded
    next(); 

}
}
export const AuthountcationQQL=async(authorization:string,tokentype:T.TokenType=T.TokenType.access)=>{
    
   if(!authorization){
     throw new GraphQLError("Invalid token",{extensions:{
               message:"token not found",
               statusCode:404
             }});
   }
   const [prefix,token]=authorization?.split(" ") || []
   
   if(!prefix || !token){
     throw new GraphQLError("Invalid token",{extensions:{
            message:"token not found",
            statusCode:400
          }});    
   }
   const signature=await T.GetSignutre(tokentype,prefix)
   if(!signature){
     throw new GraphQLError("invalide signature",{extensions:{
            message:"Invalide Signature",
            statusCode:400
          }});
   }
   const {user,decoded}=await T.Decoded_Token(token,signature!)
   return {user,decoded}


}