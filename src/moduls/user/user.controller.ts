import Router from 'express';
import US from './user.service';
import { Validation } from '../../middleware/validation';
import { SignUpSchema } from './user.validation';

const UserRouter=Router()


UserRouter.post("/signup",Validation(SignUpSchema),US.signUp)
UserRouter.post("/signin",US.signIn)


export default UserRouter