import mongoose, { Types } from 'mongoose';
export enum onModelEnum{
  post="Post",
  comment="Comment"
}

export interface IComment {
  text: string | undefined
  createdAt?: Date
  createdBy: Types.ObjectId | string
  assetFolderId?:string
  attachments?:string[]
  tags?: Types.ObjectId[]
  refId?: Types.ObjectId
  onModel:onModelEnum
  likes: Types.ObjectId[]
  updatedAt?: Date
   isDeleted?: boolean;
  deletedBy?: Types.ObjectId;
  restoredAt?: Date;
  restoredBy?: Types.ObjectId;
}


const CommentSchema = new mongoose.Schema<IComment>({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, refPath: "onModel", required: true },
  text: { type: String, required: true },
  onModel: { type: String,enum:onModelEnum, required: true },
  createdAt: { type: Date, default: Date.now },
    attachments:[String],
      assetFolderId:{type:String},
      tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
       likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      isDeleted: {type:Boolean},
      deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      restoredAt: Date,
      restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
},  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery:true
  }
)

CommentSchema.pre(["findOne","find"],function(next){
  const query=this.getQuery()
  const{paranoid,...rest}=query
  if(paranoid===false){
    this.setQuery({...rest})
  }else{
    this.setQuery({...rest,deletedAt:{$exists:false}})
  }
  next()
})

CommentSchema.virtual("replies",({
  ref:"Comment",
  localField:"_id",
  foreignField:"commentId"
}))


const CommentModel=mongoose.models.Comment || mongoose.model("Comment",CommentSchema)

export default CommentModel