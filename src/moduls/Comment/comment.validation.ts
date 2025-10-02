import z from "zod";
import { AllowComment, Availability } from "../../DB/models/post.model";
import mongoose, { Schema } from "mongoose";
import { GenralRoles } from "../../utils/genralRoles";
import { text } from "express";
import { onModelEnum } from "../../DB/models/comments.model";



export  enum likeType{
  like="like",
  unlike="unlike"
}


export const createCommentSchema = {
  body:z.object({
        text: z.string().nonempty("Content is required").max(2000).min(5).optional(),
        attachments:z.array(GenralRoles.file).max(2).optional(),
        assetFolderId:z.string().optional(),
        onModel:z.enum(onModelEnum),
        tags:z.array(GenralRoles.id).refine((value)=>{
          return new Set(value).size===value?.length
        },
      {
        message:"dublicate mention"
      },
    ).optional()
    }).superRefine((data,ctx)=>{
      if(!data.text && !data.attachments){
        ctx.addIssue({
          code:"custom",
          path:["content"],
          message:"content or attachments you must send content at least"
        })
      }
    }),
     params:z.object({
   postId:z.string().nonempty("postId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
   commentId:z.string().nonempty("postId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId").optional()
    })
  
  }




export type createCommentSchemaType = z.infer<typeof createCommentSchema.body>;
export type CommentParamsSchemaType = z.infer<typeof createCommentSchema.params>;
// export type deleteCommentSchemaType = z.infer<typeof deleteCommentSchema.params>;
// export type deleteReplayCommentSchemaType = z.infer<typeof deleteReplayCommentSchema.params>;