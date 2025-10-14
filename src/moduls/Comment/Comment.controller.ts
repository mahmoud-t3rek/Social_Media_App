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
CommentRouter.patch("/:commentId/freeze",Authountcation(),
Validation(CV.DeleteCommentSchema),UC.freezeComment
)
CommentRouter.patch("/:commentId/unfreeze",Authountcation(),
Validation(CV.DeleteCommentSchema),UC.unfreezeComment
)
CommentRouter.delete("/:commentId",Authountcation(),
Validation(CV.hardDeleteSchema),UC.hardDeleteComment
)


export default CommentRouter