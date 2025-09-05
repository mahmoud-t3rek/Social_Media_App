import { NextFunction,Response,Request } from "express";
import { userRoleValid } from "./user.validation";
import { Model } from "mongoose";
import { DBRepository } from "../../DB/repository/class.repository";
import userModel, { Iuser } from "../../DB/models/user.model";

class UserService{
    private _userModel=new DBRepository<Iuser>(userModel)
    constructor(){}
    signUp=(req: Request, res: Response, next: NextFunction)=>{
 const {name,email,password,Cpassword,age,role}:userRoleValid=req.body
 
    }

    signIn=(req: Request, res: Response, next: NextFunction)=>{

    }
}
export default new UserService()