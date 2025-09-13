import { NextFunction, Request, Response } from "express";
import { RoleType } from "../DB/models/user.model";
import { AppError } from "../utils/ClassError";

export const Authorization=(accessRole:RoleType[])=>{
    return (req: Request, res: Response, next: NextFunction)=>{
        if(!accessRole.includes(req?.user?.role!)){
          throw new AppError("user not Authorization",403); 
        }
        return next()
    }
}