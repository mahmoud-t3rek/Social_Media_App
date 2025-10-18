 import { NextFunction, Request, Response } from "express";
import { RoleType } from "../DB/models/user.model";
import { AppError } from "../utils/ClassError";
import { GraphQLError } from "graphql";

export const Authorization=(accessRole:RoleType[])=>{
    return (req: Request, res: Response, next: NextFunction)=>{
        if(!accessRole.includes(req?.user?.role!)){
          throw new AppError("user not Authorization",403); 
        }
        return next()
    }
}
export const AuthorizationQQl=({accessRole=[],role}:{accessRole:RoleType[],role:RoleType})=>{
   
        if(!accessRole.includes(role)){
              throw new GraphQLError("user not authorization",{extensions:{
               message:"user not authorization",
                statusCode:404
             }});
        }
}