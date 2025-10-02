import { NextFunction, Request, Response } from "express"
import RevokeTokenModel from "../../DB/models/RevokeToken.model"
import userModel, { Iuser, RoleType } from "../../DB/models/user.model"
import { PostReposotry } from "../../DB/repository/Post.repository"
import { RevokeTokenReposotry } from "../../DB/repository/RevokeToken.repository"
import { UserReposotry } from "../../DB/repository/user.repository"
import { AppError } from "../../utils/ClassError"
import { HydratedDocument, Types } from "mongoose"
import { v4 as uuidv4 } from "uuid";
import { deleteFiles, UploadFiles } from "../../utils/S3config"
import PostModel, { AllowComment, Availability, IPost } from "../../DB/models/post.model"
import CommentModel, { IComment, onModelEnum } from "../../DB/models/comments.model"
import { CommentReposotry } from "../../DB/repository/comment.repository "
import * as CV from "./comment.validation"
import { AvailabilityPost } from "../../services/avaliabilityPost"
import { populate } from "dotenv"



export class CommentService{
   private _userModel=new UserReposotry(userModel)
    private _RovekeToken=new RevokeTokenReposotry(RevokeTokenModel)
    private _Postmodel=new PostReposotry(PostModel)
    private _Commentmodel=new CommentReposotry(CommentModel)
  
    constructor(){}

createComment=async (req: Request, res: Response, next: NextFunction) => {
const {onModel,tags,text} = req.body as CV.createCommentSchemaType;
const {postId,commentId}:CV.CommentParamsSchemaType=req.params as CV.CommentParamsSchemaType
const userId=req.user!._id
let doc:HydratedDocument<IPost | IComment> | null=null
if(commentId && onModel===onModelEnum.comment){
    const findComment=await this._Commentmodel.findOne({
      _id:commentId,
      refId:postId,
       isDeleted: { $ne: true }
    },undefined,
    {
    populate:{
      path:"refId",
      match:{
        AllowComment:AllowComment.all,
        $or:AvailabilityPost(req),
         isDeleted: { $ne: true }
      }
    }
    })
    
    if (!findComment?.refId) {
      throw new AppError("No comment found or not authouraized", 404);
    }
    doc=findComment 
    
}else if(!commentId &&onModel===onModelEnum.post){
const findPost=await this._Postmodel.findOne({_id: postId,$or: AvailabilityPost(req),isDeleted: { $ne: true }
,allowComment:AllowComment.all})

    if (!findPost) {
      throw new AppError("No post found or not authouraized", 404);
    }
    doc=findPost
}else {
  throw new AppError("Invalid combination of commentId and onModel", 400);
}
    if (
      tags?.length &&
      (await this._userModel.find({filter:{ _id: { $in: tags }} })).length !== tags.length
    ) {
      throw new AppError("Invalid user id", 400);
    }

    const assetFolderId = uuidv4();
    let attachments: string[] = [];
    if (req.files?.length) {
      attachments = await UploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${doc!.createdBy}/posts/${doc?.assetFolderId}/comments/${assetFolderId}`,
      });
    } 
    const comment = await this._Commentmodel.create({
     text:text,
     tags:tags as unknown as Types.ObjectId[],
    refId: doc?._id as unknown as Types.ObjectId,
    onModel,
    assetFolderId,
    createdBy: req.user!._id,
    attachments, 
    });

if(!comment){
  await deleteFiles({
    urls:attachments || []
  })
   throw new AppError("faild create comment", 400);
}

  return res.status(201).json({message:" comment create successfully"})
}




// getcomments=async (req: Request, res: Response, next: NextFunction) => {
// const {postId}:PV.CommentParamsSchemaType=req.params as PV.CommentParamsSchemaType
// const user=req.user

// const post=await this._Postmodel.findOne({_id:postId})
// if(!post){
//   throw new AppError("post not found",404);
// }

// if(post.createdBy.toString()!=user?._id.toString()){
//    throw new AppError("you are not authouraized",400);
// }
// const comments=post.comments

// res.status(200).json({message:"done",comments})




// }

// ReplayToComment=async (req: Request, res: Response, next: NextFunction) => {
// const {postId,commentId}:PV.ReplayCommentParamsSchemaType=req.params as PV.ReplayCommentParamsSchemaType
// const {text}:PV.ReplayCommentbodySchemaType=req.body
// const user=req.user
// const post=await this._Postmodel.findOne({_id:postId})
// if(!post){
//   throw new AppError("post not found",404);
// }
// const comments=post.comments
// const comment = comments.find((key: IComment) => key._id!.toString() === commentId)
// if(!comment){
//    throw new AppError("comment not found",404);
// }

//  comment.replays?.push({userId:user?._id!,text})


// await post.save()


// res.status(200).json({message:"done",comment})

// }
// DeleteReplayComment=async (req: Request, res: Response, next: NextFunction) => {
// const {postId,commentId,replayId}:PV.deleteReplayCommentSchemaType=req.params as PV.deleteReplayCommentSchemaType
// const user=req.user
// const post=await this._Postmodel.findOne({_id:postId})
// if(!post){
//   throw new AppError("post not found",404);
// }
// const comments=post.comments
// const comment = comments.find((key: IComment) => key._id!.toString() === commentId)
// if(!comment){
//    throw new AppError("comment not found",404);
// }
// const replays=comment.replays
// const replay = replays!.find((key: IReplay) => key._id!.toString() === replayId)
// if(!replay){
//    throw new AppError("replay not found",404);
// }
// const isReplayOwner = user?._id?.toString() === replay.userId.toString();
// const isCommentOwner = user?._id?.toString() === comment.userId.toString();
// const isAdmin = user?.role === RoleType.admin;
// const isPostOwner = user?._id?.toString() === post.createdBy.toString();

// if (!(isReplayOwner || isCommentOwner || isAdmin || isPostOwner)) {
//   throw new AppError("You are not authorized to delete this comment", 403);
// }

// comment.replays= comment.replays!.filter((key) => key._id?.toString() !== replayId)
// await post.save()

//  res.status(200).json({ message: "Replay deleted successfully" });

// }
// DeleteComment=async (req: Request, res: Response, next: NextFunction) => {
// const {postId,commentId}:PV.deleteCommentSchemaType=req.params as PV.deleteCommentSchemaType
// const user=req.user

// const post=await this._Postmodel.findOne({_id:postId})
// if(!post){
//   throw new AppError("post not found",404);
// }
// const comments=post.comments
// const comment = comments.find((key: IComment) => key._id!.toString() === commentId)
// if(!comment){
//    throw new AppError("comment not found",404);
// }
// const isCommentOwner = user?._id?.toString() === comment.userId.toString();
// const isAdmin = user?.role === RoleType.admin;
// const isPostOwner = user?._id?.toString() === post.createdBy.toString();

// if (!(isCommentOwner || isAdmin || isPostOwner)) {
//   throw new AppError("You are not authorized to delete this comment", 403);
// }

// post.comments = post.comments.filter((key) => key._id?.toString() !== commentId)
// await post.save()

//  res.status(200).json({ message: "Comment deleted successfully" });

// }


}




export default new CommentService()


