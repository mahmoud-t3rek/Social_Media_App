import Router from 'express';
import US from './user.service';
import { Validation } from '../../middleware/validation';
import * as UV from './user.validation';
import { Authountcation } from '../../middleware/authountcation';
import { TokenType } from '../../services/Token/Token';
import { fileValidation, MulterCloud } from '../../middleware/Multer';

const UserRouter=Router()


UserRouter.post("/signup",Validation(UV.SignUpSchema),US.signUp)
UserRouter.patch("/confirmEmail",Validation(UV.ConfirmEmailSchema),US.confirmEmail)
UserRouter.post("/confirmVerification",Validation(UV.ConfirmEmailSchema),US.confirmStep_Verification)
UserRouter.post("/loginWithGmail",Validation(UV.LoginWithEmailSchema),US.LoginWithGmail)
UserRouter.post("/signin",Validation(UV.SignInSchema),US.signIn)
UserRouter.post("/enablestep_verification",Authountcation(),Validation(UV.Enable_STSchema),US.enableStep_Verification)
UserRouter.get("/getProfile",Authountcation(),US.getProfile)
UserRouter.get("/refreshToken",Authountcation(TokenType.refresh),US.refreshToken)
UserRouter.post("/LogOut",Authountcation(),Validation(UV.LogOutSchema),US.logOut)
UserRouter.patch("/updatePassword",Authountcation(),Validation(UV.UpdatePasswordSchema),US.updatePassword)
UserRouter.patch("/updateInfo",Authountcation(),Validation(UV.UpdateInfoSchema),US.updateInfo)
UserRouter.patch("/updateEmail",Authountcation(),Validation(UV.UpdateEmailSchema),US.updateEmail)
UserRouter.post("/forgetpassword",Validation(UV.forgetpasswordSchema),US.forgetPassword)
UserRouter.patch("/resetpassword",Validation(UV.ResetPasswordSchema),US.resetPassword)
UserRouter.post("/uploadimage",Authountcation(),MulterCloud({fileTypes:fileValidation.image}).array("files"),US.uploadProfileImage)
UserRouter.post("/frezzeaccount/:id",Authountcation(),US.freezeAccount)
UserRouter.post("/unfrezzeaccount/:id",Authountcation(),US.UnfreezeAccount)





export default UserRouter