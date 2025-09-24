import Router from 'express';
import { Validation } from '../../middleware/validation';
import * as PV from './post.validation';
import PS from './post.service';
import { Authountcation } from '../../middleware/authountcation';

const PostRouter=Router()



PostRouter.post("/CreatePost",Authountcation(),Validation(PV.CreatePostSchema),PS.createPost)
PostRouter.patch("/likeAndUnLike/:postId",Authountcation(),Validation(PV.LikeAndULikeSchema),PS.likeAndUnLike)
PostRouter.patch("/:postId/Comment",Authountcation(),Validation(PV.createCommentSchema),PS.createComment)
PostRouter.get("/:postId/Comments",Authountcation(),Validation(PV.getCommentSchema),PS.getcomments)
PostRouter.patch("/:postId/comments/:commentId",Authountcation(),Validation(PV.ReplayCommentSchema),PS.ReplayToComment)
PostRouter.delete("/:postId/comments/:commentId",Authountcation(),Validation(PV.deleteCommentSchema),PS.DeleteComment)
PostRouter.delete("/:postId/comments/:commentId/replays/:replayId",Authountcation(),Validation(PV.deleteReplayCommentSchema),PS.DeleteReplayComment)


export default PostRouter