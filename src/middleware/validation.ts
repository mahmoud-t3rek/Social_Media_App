import { NextFunction ,Request,Response} from "express"
import { ZodType } from "zod"
import { AppError } from "../utils/ClassError"
import { GraphQLError } from "graphql"

type ReqType=keyof Request
type SchemaType=Partial<Record<ReqType,ZodType>>
export const Validation=(Schema:SchemaType)=>{
return (req:Request,res:Response,next:NextFunction)=>{

    let ValdiationError:any[]= []

 for (const key of Object.keys(Schema) as ReqType[]) {
    if(!Schema[key]) continue
    if(req.file){
      req.body.attachments=req.file
    }
    if(req.files){
      req.body.attachments=req.files
    }
    const result=Schema[key]?.safeParse(req[key])
    if(!result?.success && result.error){
   ValdiationError.push({
          key,
          errors:result.error.issues .map((err) => ({
            path: err.path,
            message: err.message
          }))
        });
    }
 }
 if(ValdiationError.length>0){
   throw new AppError(ValdiationError, 400);
 }
 next()
}
}
export const ValidationGQl=(Schema:ZodType,args:any)=>{


    let ValdiationError:any[]= []


    const result=Schema.safeParse(args)
    if(!result?.success && result.error){
  ValdiationError.push(result.error)
 }
 if(ValdiationError.length){
     throw new GraphQLError("validation error ",{extensions:{
        message:"validation error",
        statusCode:400
      }});
 }

}