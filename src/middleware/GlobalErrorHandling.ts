import  {  Request, Response, NextFunction } from "express";
import { AppError } from "../utils/ClassError";


const GlobalErrorHandling=(err:AppError,req: Request, res: Response, next: NextFunction)=>{
    const statusCode = err.statuscode || 500;
    res.status(statusCode).json({message:err.message, stack:err.stack})
}
export default GlobalErrorHandling