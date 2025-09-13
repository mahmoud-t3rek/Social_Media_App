import { NextFunction, Request, Response } from "express"
import PostModel from "../../DB/models/post.model"
import RevokeTokenModel from "../../DB/models/RevokeToken.model"
import userModel from "../../DB/models/user.model"
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
  const{userId,post,content}:PV.CreatePostSchemaType=req.body
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
  const {userId,action}:PV.LikeAndULikeSchemabodyType = req.body
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
}

export default new PostService()


