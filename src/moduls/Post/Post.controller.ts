import Router from 'express';
import { TokenType } from '../../services/Token/Token';
import { Validation } from '../../middleware/validation';
import * as PV from './post.validation';
import PS from './post.service';

const PostRouter=Router()



PostRouter.post("/CreatePost",Validation(PV.CreatePostSchema),PS.createPost)
PostRouter.patch("/likeAndUnLike/:postId",Validation(PV.LikeAndULikeSchema),PS.likeAndUnLike)


export default PostRouter