import z from "zod";
import { AllowComment, Availability } from "../../DB/models/post.model";
import mongoose, { Schema } from "mongoose";
import { GenralRoles } from "../../utils/genralRoles";



export  enum likeType{
  like="like",
  unlike="unlike"
}

export const CreatePostSchema = {
  body:z.object({
        content: z.string().nonempty("Content is required").max(2000).min(5).optional(),
        attachments:z.array(GenralRoles.file).max(2).optional(),
        assetFolderId:z.string().optional(),
        allowComment:z.enum(AllowComment).default(AllowComment.any).optional(),
        availability:z.enum(Availability).default(Availability.public).optional(),
        tags:z.array(GenralRoles.id).refine((value)=>{
          return new Set(value).size===value?.length
        },
      {
        message:"dublicate mention"
      }).optional()
    }).superRefine((data,ctx)=>{
      if(!data.content && !data.attachments){
        ctx.addIssue({
          code:"custom",
          path:["content"],
          message:"content or attachments you must send content at least"
        })
      }
    })
  }
  export const updatePostSchema = {
  body:z.object({
        content: z.string().nonempty("Content is required").max(2000).min(5).optional(),
        attachments:z.array(GenralRoles.file).max(2).optional(),
        assetFolderId:z.string().optional(),
        allowComment:z.enum(AllowComment).default(AllowComment.any).optional(),
        availability:z.enum(Availability).default(Availability.public).optional(),
        tags:z.array(GenralRoles.id).refine((value)=>{
          return new Set(value).size===value?.length
        },
      {
        message:"dublicate mention"
      }).optional()
    }).superRefine((data,ctx)=>{
      if(!Object.values(data).length){
        ctx.addIssue({
          code:"custom",
          message:"at least one field is required"
        })
      }
    })
  }

export const LikeAndULikeSchema = {
  body:z.object({
        action: z.nativeEnum(likeType, {message:`action must be ${likeType.like} or ${likeType.unlike}`})
    }),
    params:z.object({
      postId:z.string().nonempty("postId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
    })
  }


  
export type LikeAndULikeSchemabodyType = z.infer<typeof LikeAndULikeSchema.body>;
export type LikeAndULikeSchemaparamsType = z.infer<typeof LikeAndULikeSchema.params>;
export type CreatePostSchemaType = z.infer<typeof CreatePostSchema.body>;