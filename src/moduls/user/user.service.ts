import { NextFunction,Response,Request } from "express";
import { userRoleValid } from "./user.validation";

class UserService{
    signUp=(req: Request, res: Response, next: NextFunction)=>{
 const {name,email,password,Cpassword,age,role}:userRoleValid=req.body
 
 
    }

    signIn=(req: Request, res: Response, next: NextFunction)=>{

    }
}
export default new UserService()