import {ObjectCannedACL, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import { storageType } from '../middleware/Multer';
import { uuidv4 } from 'zod';
import { createReadStream } from "fs";

import { AppError } from './ClassError';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';



export const s3Client=()=>{
    return new S3Client({
        region:process.env.AWS_REGION!,
        credentials:{
             accessKeyId:process.env.ACCESSkEY_AWS!,
            secretAccessKey:process.env.SECRETACCESSkEY_AWS!
        }
    })
}

export const uploadFile=async({
    storetype=storageType.cloud,
    Bucket=process.env.AWS_BUCKETNAME!,
    path="genreal",
    ACL="private" as ObjectCannedACL,
    file
}:{
path:string
Bucket?:string
ACL?:ObjectCannedACL,
storetype?:storageType,
file:Express.Multer.File
}
):Promise<string>=>{
const commend= new PutObjectCommand({
    Bucket,
    ACL,
    Key:`${process.env.APLICATION_NAME!}/${path}/${uuidv4()}_${file.originalname}`,
    Body:storetype===storageType.cloud ? file.buffer : createReadStream(file.path),
    ContentType:file.mimetype
})
await s3Client().send(commend)
if(!commend.input.Key){
    throw new AppError("failed to upload file s3",400)
}
return commend.input.Key
}



export const UploadLargeFile=async({
    storetype=storageType.cloud,
    Bucket=process.env.AWS_BUCKETNAME!,
    path="genreal",
    ACL="private" as ObjectCannedACL,
    file
}:{
path:string
Bucket?:string
ACL?:ObjectCannedACL,
storetype?:storageType,
file:Express.Multer.File
})=>{
    const upload=new Upload({
        client:s3Client(),
    params:{
         Bucket,
    ACL,
    Key:`${process.env.APLICATION_NAME!}/${path}/${uuidv4()}_${file.originalname}`,
    Body:storetype===storageType.cloud ? file.buffer : createReadStream(file.path),
    ContentType:file.mimetype
    }
    })
   const {Key}= await upload.done()!
   if(!Key){
 throw new AppError("failed to upload file s3",400)
   }
   return Key
}



export const UploadFiles=async({
    storetype=storageType.cloud,
    Bucket=process.env.AWS_BUCKETNAME!,
    path="genreal",
    ACL="private" as ObjectCannedACL,
    files,
    LargeFile=false
}:{
path:string
Bucket?:string
ACL?:ObjectCannedACL,
storetype?:storageType,
files:Express.Multer.File[]
LargeFile:Boolean
})=>{
let urls:string[]=[]
if(LargeFile==true){
urls=await Promise.all(files.map(file=>UploadLargeFile({Bucket,ACL,path,file})))
}else{
urls=await Promise.all(files.map(file=>uploadFile({Bucket,ACL,path,file})))
}
return urls

}


export const createUrlRequestPresigner=async({
    Bucket=process.env.AWS_BUCKETNAME!,
    path="genreal",
    ContentType,
    originalname
}:{
path?:string
Bucket?:string
ContentType:string,
originalname:string
})=>{


    const command=new PutObjectCommand({
        Bucket,
        Key:`${process.env.APLICATION_NAME!}/${path}/${uuidv4()}_${originalname}`,
        ContentType
    })
    const url = await getSignedUrl(s3Client(), command, { expiresIn: 60 * 60 });
    return url


}