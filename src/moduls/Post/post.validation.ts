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
        userId: z.string().nonempty("userId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
        post:z.string().nonempty("post is required"),
        content: z.string().nonempty("Content is required")
    })
  }

export const LikeAndULikeSchema = {
  body:z.object({
        userId: z.string().nonempty("userId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
        action: z.nativeEnum(likeType, {message:`action must be ${likeType.like} or ${likeType.unlike}`})
    }),
    params:z.object({
      postId:z.string().nonempty("postId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
    })
  }

  
export type LikeAndULikeSchemabodyType = z.infer<typeof LikeAndULikeSchema.body>;
export type LikeAndULikeSchemaparamsType = z.infer<typeof LikeAndULikeSchema.params>;
export type CreatePostSchemaType = z.infer<typeof CreatePostSchema.body>;