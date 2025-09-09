import Router from 'express';
import US from './user.service';
import { Validation } from '../../middleware/validation';
import * as UV from './user.validation';
import { Authountcation } from '../../middleware/authountcation';
import { TokenType } from '../../services/Token';

const UserRouter=Router()


UserRouter.post("/signup",Validation(UV.SignUpSchema),US.signUp)
UserRouter.patch("/confirmEmail",Validation(UV.ConfirmEmailSchema),US.confirmEmail)
UserRouter.post("/signin",Validation(UV.SignInSchema),US.signIn)
UserRouter.get("/getProfile",Authountcation(),US.getProfile)
UserRouter.get("/refreshToken",Authountcation(TokenType.refresh),US.refreshToken)
UserRouter.post("/LogOut",Authountcation(),Validation(UV.LogOutSchema),US.logOut)


export default UserRouter