import { NextFunction, Request, Response } from "express"
import PostModel, { IComment, IReplay } from "../../DB/models/post.model"
import RevokeTokenModel from "../../DB/models/RevokeToken.model"
import userModel, { RoleType } from "../../DB/models/user.model"
import { PostReposotry } from "../../DB/repository/Post.repository"
import { RevokeTokenReposotry } from "../../DB/repository/RevokeToken.repository"
import { UserReposotry } from "../../DB/repository/user.repository"
import * as PV from "./post.validation"
import { AppError } from "../../utils/ClassError"
import { Types } from "mongoose"



export class PostService{
   private _userModel=new UserReposotry(userModel)
    private _RovekeToken=new RevokeTokenReposotry(RevokeTokenModel)
    private _Postmodel=new PostReposotry(PostModel)
  
    constructor(){}

createPost=async (req: Request, res: Response, next: NextFunction) => {
  const{post,content}:PV.CreatePostSchemaType=req.body
  const userId=req.user?._id as Types.ObjectId| string 
   const user = await this._userModel.findOne({_id:userId});
    if (!user) {
      throw new AppError("User not found", 404);
    }
  const CreatePost=await this._Postmodel.create({userId,post,content})
  if(!CreatePost){
    throw new AppError("faild to create post",400); 
  }
  return res.status(201).json({message:" post create successfully", CreatePost })

}

likeAndUnLike = async (req: Request, res: Response, next: NextFunction) => {
 const userId=req.user?._id as Types.ObjectId| string 
   const {action}:PV.LikeAndULikeSchemabodyType = req.body
  const {postId}: PV.LikeAndULikeSchemaparamsType = req.params as PV.LikeAndULikeSchemaparamsType
    const user = await this._userModel.findOne({_id:userId});
  
    
    if (!user) {
      throw new AppError("User not found", 404);
    }
 let updateQuery = {};
    if (action === PV.likeType.unlike) {
      updateQuery = { $pull: { likes: userId } };
    } else if (action === PV.likeType.like) {
      updateQuery = { $addToSet: { likes: userId } };
    }
  const updatedPost = await this._Postmodel.findByIdAndUpdate(postId, updateQuery, { new: true });
    if (!updatedPost) {
      throw new AppError("Post not found ", 404);
    }

   res.status(200).json({message: `Success ${action}`,likesCount: updatedPost.likes.length});
}
createComment=async (req: Request, res: Response, next: NextFunction) => {
const {text}:PV.createCommentSchemaType=req.body
const {postId}:PV.CommentParamsSchemaType=req.params as PV.CommentParamsSchemaType
const userId=req.user!._id
const findPost=await this._Postmodel.findOne({_id:postId})
if(!findPost){
  throw new AppError("no post found",404)
}

findPost.comments.push({userId,text})
await findPost.save();

 res.status(201).json({message:"success create comment", post: findPost});


}

getcomments=async (req: Request, res: Response, next: NextFunction) => {
const {postId}:PV.CommentParamsSchemaType=req.params as PV.CommentParamsSchemaType
const user=req.user

const post=await this._Postmodel.findOne({_id:postId})
if(!post){
  throw new AppError("post not found",404);
}

if(post.userId.toString()!=user?._id.toString()){
   throw new AppError("you are not authouraized",400);
}
const comments=post.comments

res.status(200).json({message:"done",comments})




}

ReplayToComment=async (req: Request, res: Response, next: NextFunction) => {
const {postId,commentId}:PV.ReplayCommentParamsSchemaType=req.params as PV.ReplayCommentParamsSchemaType
const {text}:PV.ReplayCommentbodySchemaType=req.body
const user=req.user
const post=await this._Postmodel.findOne({_id:postId})
if(!post){
  throw new AppError("post not found",404);
}
const comments=post.comments
const comment = comments.find((key: IComment) => key._id!.toString() === commentId)
if(!comment){
   throw new AppError("comment not found",404);
}

 comment.replays?.push({userId:user?._id!,text})


await post.save()


res.status(200).json({message:"done",comment})

}
DeleteReplayComment=async (req: Request, res: Response, next: NextFunction) => {
const {postId,commentId,replayId}:PV.deleteReplayCommentSchemaType=req.params as PV.deleteReplayCommentSchemaType
const user=req.user
const post=await this._Postmodel.findOne({_id:postId})
if(!post){
  throw new AppError("post not found",404);
}
const comments=post.comments
const comment = comments.find((key: IComment) => key._id!.toString() === commentId)
if(!comment){
   throw new AppError("comment not found",404);
}
const replays=comment.replays
const replay = replays!.find((key: IReplay) => key._id!.toString() === replayId)
if(!replay){
   throw new AppError("replay not found",404);
}
const isReplayOwner = user?._id?.toString() === replay.userId.toString();
const isCommentOwner = user?._id?.toString() === comment.userId.toString();
const isAdmin = user?.role === RoleType.admin;
const isPostOwner = user?._id?.toString() === post.userId.toString();

if (!(isReplayOwner || isCommentOwner || isAdmin || isPostOwner)) {
  throw new AppError("You are not authorized to delete this comment", 403);
}

comment.replays= comment.replays!.filter((key) => key._id?.toString() !== replayId)
await post.save()

 res.status(200).json({ message: "Replay deleted successfully" });

}
DeleteComment=async (req: Request, res: Response, next: NextFunction) => {
const {postId,commentId}:PV.deleteCommentSchemaType=req.params as PV.deleteCommentSchemaType
const user=req.user

const post=await this._Postmodel.findOne({_id:postId})
if(!post){
  throw new AppError("post not found",404);
}
const comments=post.comments
const comment = comments.find((key: IComment) => key._id!.toString() === commentId)
if(!comment){
   throw new AppError("comment not found",404);
}
const isCommentOwner = user?._id?.toString() === comment.userId.toString();
const isAdmin = user?.role === RoleType.admin;
const isPostOwner = user?._id?.toString() === post.userId.toString();

if (!(isCommentOwner || isAdmin || isPostOwner)) {
  throw new AppError("You are not authorized to delete this comment", 403);
}

post.comments = post.comments.filter((key) => key._id?.toString() !== commentId)
await post.save()

 res.status(200).json({ message: "Comment deleted successfully" });

}


}




export default new PostService()


