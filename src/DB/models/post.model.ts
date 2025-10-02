import mongoose, { Types } from 'mongoose';
import { _discriminatedUnion } from 'zod/v4/core';
import CommentModel from './comments.model';

export enum AllowComment{
  any="any",
  all="all"
}

export enum Availability {
  public = "public",
  private = "private",
  friends = "friends"
}


export interface IPost {
  _id?: Types.ObjectId
  createdBy: Types.ObjectId | string
  post: string
  likes: Types.ObjectId[]
  content: string
  assetFolderId?:string
  allowComment?: AllowComment
  availability?: Availability
  attachments?:string[]
  tags?: Types.ObjectId[]
  createdAt?: Date
  updatedAt?: Date
  isDeleted?:boolean
  deletedBy?: Types.ObjectId | undefined;
  restoredAt?: Date;
  restoredBy?: Types.ObjectId;
}


const PostSchema = new mongoose.Schema<IPost>(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    content: { type: String, required: true },
    attachments:[String],
    assetFolderId:{type:String},
    allowComment: { type: String, enum: AllowComment, default: AllowComment.all },
    availability: { type: String, enum: Availability, default: Availability.public },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    isDeleted: {type:Boolean},
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restoredAt: Date,
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery:true
  }
)
PostSchema.pre(["findOne","find"],function(next){
  const query=this.getQuery()
  const{paranoid,...rest}=query
  if(paranoid===false){
    this.setQuery({...rest})
  }else{
    this.setQuery({...rest,deletedAt:{$exists:false}})
  }
  next()
})

PostSchema.virtual('likesCount').get(function() {
 return Array.isArray(this.likes) ? this.likes.length : 0;
})

PostSchema.virtual("comments",({
  ref:"Comment",
  localField:"_id",
  foreignField:"postId"
}))

const PostModel=mongoose.models.Post || mongoose.model("Post",PostSchema)

export default PostModel