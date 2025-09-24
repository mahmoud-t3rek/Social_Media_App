import z from "zod";



export  enum likeType{
  like="like",
  unlike="unlike"
}
const commentSchema = z.object({
  userId: z.string().nonempty("userId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  text: z.string().nonempty("Comment text is required"),
  createdAt: z.date().optional(), 
});

export const CreatePostSchema = {
  body:z.object({
        post:z.string().nonempty("post is required"),
        content: z.string().nonempty("Content is required")
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
  export const createCommentSchema = {
  body:z.object({
        text: z.string()
      .nonempty("Comment text is required")
  }),
    params:z.object({
      postId:z.string().nonempty("postId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
    })
  }
  export const ReplayCommentSchema = {
  body:z.object({
        text: z.string()
      .nonempty("Comment text is required")
  }),
    params:z.object({
      postId:z.string().nonempty("postId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
      commentId:z.string().nonempty("commentId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
    })
  }
    export const deleteCommentSchema = {
    params:z.object({
      postId:z.string().nonempty("postId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
      commentId:z.string().nonempty("commentId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
    })
  }
    export const deleteReplayCommentSchema = {
    params:z.object({
      postId:z.string().nonempty("postId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
      commentId:z.string().nonempty("commentId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
      replayId:z.string().nonempty("commentId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
    })
  }
    export const getCommentSchema = {
    params:z.object({
      postId:z.string().nonempty("postId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
    })
  }

  
export type LikeAndULikeSchemabodyType = z.infer<typeof LikeAndULikeSchema.body>;
export type LikeAndULikeSchemaparamsType = z.infer<typeof LikeAndULikeSchema.params>;
export type CreatePostSchemaType = z.infer<typeof CreatePostSchema.body>;
export type createCommentSchemaType = z.infer<typeof createCommentSchema.body>;
export type CommentParamsSchemaType = z.infer<typeof createCommentSchema.params>;
export type ReplayCommentParamsSchemaType = z.infer<typeof ReplayCommentSchema.params>;
export type ReplayCommentbodySchemaType = z.infer<typeof ReplayCommentSchema.body>;
export type deleteCommentSchemaType = z.infer<typeof deleteCommentSchema.params>;
export type deleteReplayCommentSchemaType = z.infer<typeof deleteReplayCommentSchema.params>;