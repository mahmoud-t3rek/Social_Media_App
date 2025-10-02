import { Router } from 'express';
import { Validation } from '../../middleware/validation';
import { Authountcation } from '../../middleware/authountcation';
import { fileValidation, MulterCloud } from '../../middleware/Multer';
import UC from './comment.service';
import * as CV from './comment.validation';

const CommentRouter=Router({mergeParams:true})

CommentRouter.post("/",Authountcation(),
MulterCloud({fileTypes:fileValidation.image}).array("attachments"),Validation(CV.createCommentSchema),UC.createComment
)
CommentRouter.delete("/",Authountcation(),
MulterCloud({fileTypes:fileValidation.image}).array("attachments"),Validation(CV.createCommentSchema),UC.createComment
)
// CommentRouter.post("/:commentId",Authountcation(),
// MulterCloud({fileTypes:fileValidation.image}).array("attachments"),Validation(CV.createReplaySchema),UC.createReplay
// )
// CommentRouter.patch("/:postId/Comment",Authountcation(),PS.createComment)
// CommentRouter.get("/:postId/Comments",Authountcation(),Validation(.getCommentSchema),PS.getcomments)
// CommentRouter.patch("/:postId/comments/:commentId",Authountcation(),Validation(.ReplayCommentSchema),PS.ReplayToComment)
// CommentRouter.delete("/:postId/comments/:commentId",Authountcation(),Validation(.deleteCommentSchema),PS.DeleteComment)
// CommentRouter.delete("/:postId/comments/:commentId/replays/:replayId",Authountcation(),Validation(.deleteReplayCommentSchema),PS.DeleteReplayComment)


export default CommentRouter