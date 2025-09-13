import mongoose, { Types } from 'mongoose';



export interface Ipost{
    userId: Types.ObjectId | string;
    post: string;
    likes: Types.ObjectId[],
    content:string,
    comments: {userId: Types.ObjectId;text: string;createdAt: Date}[];
    
}


const PostSchema=new mongoose.Schema<Ipost>({
 userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: String, required: true },
  likes: [{ type: Types.ObjectId, ref: 'User'}],
  content:{type:String,required:true},
 comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]

},{
  timestamps:true,
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
})

PostSchema.virtual('likesCount').get(function() {
  return this.likes.length;
})

const PostModel=mongoose.models.Post || mongoose.model("Post",PostSchema)

export default PostModel