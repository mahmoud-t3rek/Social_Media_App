import { NextFunction, Request, Response } from "express";
import { Server, Socket } from "socket.io";
import { chatReposotry } from "../../DB/repository/chat.repository";
import ChatModel from "../../DB/models/chat.model";
import { AppError } from "../../utils/ClassError";
import { UserReposotry } from "../../DB/repository/user.repository";
import userModel from "../../DB/models/user.model";
import mongoose, { Types } from "mongoose";
import { connectionSockets } from "../../middleware/authoraization.socketIo";
import { getChatSchemaType, sendMessageSchemaType } from "./chat.validation";
import { v4 as uuidv4 } from "uuid";
import { deleteFile, uploadFile } from "../../utils/S3config";
import multer from "multer";

 export class ChatServices {
    private _chatModel=new  chatReposotry(ChatModel)
    private _userModel=new UserReposotry(userModel)
    
    constructor() {   }
 
getChat=async(req: Request, res: Response, next: NextFunction)=>{
    const {userId}:getChatSchemaType=req.params as getChatSchemaType
    
    let {page,limit=5}=req.query as unknown as {page:number,limit:number}
    if(!page || page < 0) page=1
    page = page * 1 || 1
    limit =limit * 1 || 5

 const { chat } = await this._chatModel.findPaginate({
      filter: {
        participantses: {
          $all: [
            new mongoose.Types.ObjectId(userId),
            new mongoose.Types.ObjectId(req?.user?._id)
          ]
        },
        $or: [
          { group: { $exists: false } },
         { $expr: { $eq: [ { $size: "$group" }, 0 ] } }
        ]
      },
      query: { page, limit },
      options: {
        populate: [{ path: "participantses" }]
      }
    });
    
    

  res.status(200).json({ message: " success" ,data:{chat}})
}
getGroupChat=async(req: Request, res: Response, next: NextFunction)=>{
    const {groupId}=req.params 
    let {page,limit=5}=req.query as unknown as {page:number,limit:number}
    if(!page || page < 0) page=1
    page = page * 1 || 1
    limit =limit * 1 || 5
 const {chat} = await this._chatModel.findPaginate({
     filter: {_id:groupId,
        participantses: {
          $in:[req?.user?._id]  
        },
         group: { $exists: true } },
         query: { page, limit },   
      options:{
        populate: [{ path: "message.createdBy" }]
      }
 } );
  
    console.log(chat);
    
    if(!chat){
      throw new AppError("chat not found",404);
    }
    

  res.status(200).json({ message: " success" ,data:{chat:chat}})
}
createChatGroup=async(req: Request, res: Response, next: NextFunction)=>{
    let {group,groupImage,participantses}=req.body
  const createdBy=req?.user?._id!
  const dbparticipantes=participantses.map((participantes:string)=>Types.ObjectId.createFromHexString(participantes))
  const user=await this._userModel.find({
    filter:{
   _id:{
      $in:dbparticipantes
    },
    friends: { $in: [createdBy] }
    }
  })
  if(!user.length==participantses.length){
    throw new AppError("some user not found",404);
  }

  let roomId=group.replaceAll(/\s+/g,"_") + "-" + uuidv4()
if(req?.file){
groupImage=await uploadFile({
  path:`chat/${roomId}`,
  file:req.file as Express.Multer.File
})
}
dbparticipantes.push(createdBy)
const chat=await this._chatModel.create({
  group,
  groupImage,
  createdBy,
  participantses:dbparticipantes,
  roomId
})
if(!chat){
  if(groupImage){
    await deleteFile({
      Key:groupImage
    })
  }
  throw new AppError("faild create chat",400);
  
}


  res.status(200).json({ message: " success" ,chat})
}
 sendMessage=async(data: sendMessageSchemaType, socket: Socket, io: Server)=>{
const {content,sendTo}=data 
const createdBy=socket.data.user._id


const user=await this._userModel.findOne({_id:sendTo,
  friends:{$in:[createdBy]}
})
if(!user){
  throw new AppError("user not found",404); 
}


const chat = await this._chatModel.findOneAndUpdate(
   {
      participantses:{$all: [
      new mongoose.Types.ObjectId(createdBy),
      new mongoose.Types.ObjectId(sendTo)
    ]},
     $or: [
    { group: { $exists: false } },
    { group: { $size: 0 } }
  ]
  },
  {
    $push: {
      message: { content, createdBy }
    }
  },
  { new: true }
);




if(!chat){
const createChat=await this._chatModel.create({
 participantses:[createdBy,sendTo],
 createdBy,
 message:[{
  createdBy,
  content
 }]
})
}
io.to(connectionSockets.get(createdBy.toString())!).emit("successMessage",{content})
io.to(connectionSockets.get(sendTo.toString())!).emit("newMessage",{content,from:socket.data.user})

}
sendGroupMessage=async(data: any, socket: Socket, io: Server)=>{
const {content,groupId}=data 
const createdBy=socket.data.user._id


const findGroup=await this._chatModel.findOne({_id:groupId,
 participantses:{$in:[createdBy]}
})
if(!findGroup){
  throw new AppError("chat not found",404); 
}


const chat = await this._chatModel.findOneAndUpdate(
   {
    _id:groupId,
   participantses:{$all:[createdBy]},
     group: { $exists: true 
    },
  },
  {
    $push: {
      message: { content, createdBy }
    }
  },
  { new: true }
);




if(!chat){
throw new AppError("no group found",404);

}
io.to(connectionSockets.get(createdBy.toString())!).emit("successMessage",{content})
io.to(chat.roomId).emit("newMessage",{content,from:socket.data.user,groupId})

}
join_room=async(data: any, socket: Socket, io: Server)=>{
const {roomId}=data 



const chat=await this._chatModel.findOne({
  roomId,
  participantses:{
    $in:[socket.data.user._id]
  }
})
if(!chat){
  throw new AppError("chat not found",404); 
}



socket.join(chat.roomId!)

}

   
}

