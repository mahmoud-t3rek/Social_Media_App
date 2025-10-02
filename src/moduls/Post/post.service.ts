import { NextFunction, Request, Response } from "express"
import RevokeTokenModel from "../../DB/models/RevokeToken.model"
import userModel, { Iuser, RoleType } from "../../DB/models/user.model"
import { PostReposotry } from "../../DB/repository/Post.repository"
import { RevokeTokenReposotry } from "../../DB/repository/RevokeToken.repository"
import { UserReposotry } from "../../DB/repository/user.repository"
import * as PV from "./post.validation"
import { AppError } from "../../utils/ClassError"
import { Types } from "mongoose"
import { v4 as uuidv4 } from "uuid";
import { deleteFiles, UploadFiles } from "../../utils/S3config"
import PostModel, { Availability } from "../../DB/models/post.model"
import { CommentReposotry } from "../../DB/repository/comment.repository "
import CommentModel from "../../DB/models/comments.model"



export class PostService{
   private _userModel=new UserReposotry(userModel)
    private _RovekeToken=new RevokeTokenReposotry(RevokeTokenModel)
    private _Postmodel=new PostReposotry(PostModel)
     private _Commentmodel=new CommentReposotry(CommentModel)
  
    constructor(){}

createPost=async (req: Request, res: Response, next: NextFunction) => {
if (req?.body?.tags?.length &&((await this._userModel.find({filter:{ _id: { $in: req?.body?.tags }} })).length !==req?.body?.tags?.length) ){
  throw new AppError("Invalid user id", 400);
}

const assetFolderId = uuidv4();
let attachments: string[] = [];
if (req?.files?.length) {
  attachments = await UploadFiles({
    files: req?.files as unknown as Express.Multer.File[],
    path: `users/${req?.user?._id}/posts/${assetFolderId}`,
  });
}

const post = await this._Postmodel.create({
  ...req.body,
  attachments,
  assetFolderId,
  createdBy: req.user?._id,
});

if (!post) {
  await deleteFiles({ urls: attachments || [] });
  throw new AppError("failed to create post", 500);
}

  return res.status(201).json({message:" post create successfully"})


}
updatepost=async (req: Request, res: Response, next: NextFunction) => {
const{postId}=req.params
const{content,attachments,tags,availability,allowComment}=req.body
const Post=await this._Postmodel.findOne({_id:postId,createdBy:req.user?._id})
if(!Post){
throw new AppError("faild update od authouraized", 404);
}
if(content)Post.content=content
if (req?.files?.length) {
  if (Post.attachments?.length) {
    await deleteFiles({ urls: Post.attachments });
  }
  Post.attachments = await UploadFiles({
    files: req?.files as unknown as Express.Multer.File[],
    path: `users/${req?.user?._id}/posts/${Post.assetFolderId}`, 
  });
}

if (tags?.length) {
  const users = await this._userModel.find({filter:{ _id: { $in: tags } }});
  if (users.length !== tags.length) {
    throw new AppError("Invalid user id", 400);
  }
  Post.tags = tags;
}

if(availability){
  Post.availability=availability
}
 if (allowComment !== undefined) {
    Post.allowComment = allowComment;
  }
await Post.save();


  return res.status(200).json({message:" post updated successfully",Post})
 
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
  const updatedPost = await this._Postmodel.findOneAndUpdate({_id:postId,
     isDeleted: { $ne: true },
    $or:[
      { availability:Availability.public},
      { availability:Availability.private,createdBy:req.user?._id},
      { availability:Availability.friends,createdBy:{$in:[...req.user?.friends! || [],req.user?._id]}},
    ]},
    updateQuery, { new: true });
    if (!updatedPost) {
      throw new AppError("Post not found ", 404);
    }

   res.status(200).json({message: `Success ${action}`,likesCount: updatedPost.likes.length});
}
getPosts = async (req: Request, res: Response, next: NextFunction) => {
 let {page=1,limit=5}=req.query as unknown as {page:number,limit:number}

 const {currentPages,docs}=await this._Postmodel.paginate({filter:{},query:{page,limit},
  options:{ populate: { path: "comments", select: "_id text " }}})

   res.status(200).json({message:"success",currentPages,posts:docs});
}
freezePost = async (req: Request, res: Response, next: NextFunction) => {
 const {postId}=req.params
const userId=req.user
const post=await this._Postmodel.findOne({_id:postId,isDeleted:{$ne:true}})
if(!post){
  throw new AppError("post not found",404);
}
if(userId?.role!==RoleType.admin &&  userId!._id.toString()!==post.createdBy.toString()){
 throw new AppError("Not authorized to freeze this profile",403);
}
post.isDeleted=true
post.deletedBy=userId?._id as unknown as Types.ObjectId

await post.save()

res.status(200).json({message:"post frozen successfully"});
}
unfreezePost = async (req: Request, res: Response, next: NextFunction) => {
 const {postId}=req.params
const userId=req.user
const post=await this._Postmodel.findOne({_id:postId,isDeleted:true})
if(!post){
  throw new AppError("post has been unfreezed",404);
}
if(userId?.role!==RoleType.admin){
 throw new AppError("Not authorized to unfreeze this profile",403);
}
post.isDeleted=false
post.restoredBy=userId?._id as unknown as Types.ObjectId
post.restoredAt = new Date(); 
post.deletedBy = undefined; 

await post.save()

res.status(200).json({message:"post unfrozen successfully"});
}
hardDelete = async (req: Request, res: Response, next: NextFunction) => {
const {postId}=req.params
const userId=req.user
const post=await this._Postmodel.findOne({_id:postId})
if(!post){
  throw new AppError("post not found",404);
}
if(userId?.role!==RoleType.admin &&  userId!._id.toString()!==post.createdBy.toString()){
 throw new AppError("Not authorized to delete this profile",403);
}
    await deleteFiles({ urls: post.attachments ?? [] });
  const comments = await this._Commentmodel.find({filter:{ refId: postId }});
  const commentIds = comments.map((c) => c._id);
   const commentAttachments = comments.flatMap(c => c.attachments ?? []);
  if (commentAttachments.length > 0) {
    await deleteFiles({ urls: commentAttachments });
  }
    const replies = await this._Commentmodel.find({filter:{ refId: { $in: commentIds } }});

  const replyAttachments = replies.flatMap(r => r.attachments ?? []);
  if (replyAttachments.length > 0) {
    await deleteFiles({ urls: replyAttachments });
  }
  await this._Commentmodel.deleteMany({ refId: { $in: commentIds } });
  await this._Commentmodel.deleteMany({ refId: postId });
 
const deletePost=await this._Postmodel.findOneAndDelete({_id:postId})

res.status(200).json({message:"post deleted successfully"});
}

}




export default new PostService()


