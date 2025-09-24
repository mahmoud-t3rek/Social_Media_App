import mongoose, { Types } from 'mongoose';

export interface IReplay {
  _id?: Types.ObjectId
  userId: Types.ObjectId
  text: string
  createdAt?: Date
}
export interface IComment {
  _id?: Types.ObjectId
  userId: Types.ObjectId
  text: string
  createdAt?: Date
  replays?: IReplay[]
}

export interface IPost {
  _id?: Types.ObjectId
  userId: Types.ObjectId | string
  post: string
  likes: Types.ObjectId[]
  content: string
  comments: IComment[]
  createdAt?: Date
  updatedAt?: Date
}
const ReplaySchema = new mongoose.Schema<IReplay>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const CommentSchema = new mongoose.Schema<IComment>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replays: [ReplaySchema],
})

const PostSchema = new mongoose.Schema<IPost>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    content: { type: String, required: true },
    comments: [CommentSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

PostSchema.virtual('likesCount').get(function() {
  return this.likes.length
})

const PostModel=mongoose.models.Post || mongoose.model("Post",PostSchema)

export default PostModel