import  {  Request, Response, NextFunction } from "express";
import { AppError } from "../utils/ClassError";


const GlobalErrorHandling=(err:AppError,req: Request, res: Response, next: NextFunction)=>{
    res.status(err.cause as unknown as number).json({message:err.message, stack:err.stack})
}
export default GlobalErrorHandling