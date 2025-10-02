import Router from 'express';
import { Validation } from '../../middleware/validation';
import * as PV from './post.validation';
import PS from './post.service';
import { Authountcation } from '../../middleware/authountcation';
import { fileValidation, MulterCloud } from '../../middleware/Multer';
import CommentRouter from '../Comment/Comment.controller';
const PostRouter=Router()

PostRouter.use("/:postId/comments{/:commentId/reply}",CommentRouter)



PostRouter.post("/CreatePost",Authountcation(),
MulterCloud({fileTypes:fileValidation.image}).array("attachments"),Validation(PV.CreatePostSchema),
PS.createPost)
PostRouter.patch("/update/:postId",Authountcation(),MulterCloud({fileTypes:fileValidation.image}).array("attachments"),Validation(PV.updatePostSchema),PS.updatepost)
PostRouter.patch("/likeAndUnLike/:postId",Authountcation(),Validation(PV.LikeAndULikeSchema),PS.likeAndUnLike)
PostRouter.get("/",PS.getPosts)
PostRouter.patch("/:postId/freeze",Authountcation(),PS.freezePost)
PostRouter.patch("/:postId/unfreeze",Authountcation(),PS.unfreezePost)
PostRouter.delete("/:postId",Authountcation(),PS.hardDelete)

export default PostRouter