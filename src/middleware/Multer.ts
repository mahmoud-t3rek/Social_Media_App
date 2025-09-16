import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { AppError } from '../utils/ClassError';
import os from 'os';
import {  uuidv4 } from 'zod';


export const fileValidation = {
  image: ["image/png", "image/jpg", "image/jpeg"],
  video: ["video/mp4"],
  audio: ["audio/mpeg", "audio/mp3"],
  file: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
};
export enum storageType{
    disk="disk",
    cloud="cloud"
}

export const MulterCloud=({
    fileTypes=fileValidation.image,
    storetype=storageType.cloud,
    maxsize=5
}:{
fileTypes?:string[],
storetype?:storageType
maxsize?:number
})=>{

const storage=storetype===storageType.cloud?multer.memoryStorage():multer.diskStorage({
destination:os.tmpdir(),
filename(req:Request, file:Express.Multer.File, cb){
cb(null,`${uuidv4()}_${file.originalname}`)
}
})
function fileFilter (req:Request, file:Express.Multer.File, cb:FileFilterCallback){
    if(fileTypes!.includes(file.mimetype)){
          cb(null, true)
    }else{
     return cb(new AppError("invalid file type",400))
    }

}

const upload = multer({ storage: storage, limits:{fileSize:1024 * 1024 * maxsize},fileFilter })
return upload

}