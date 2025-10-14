import {Router} from 'express';
import { Authountcation } from '../../middleware/authountcation';
import  {ChatServices} from './chat.service';
import { Validation } from '../../middleware/validation';
import { createChatGroupSchema, getChatSchema } from './chat.validation';
import { fileValidation, MulterCloud } from '../../middleware/Multer';
const CS=new ChatServices()
const chatRouter=Router({mergeParams:true})


chatRouter.get("/",Authountcation(),Validation(getChatSchema),CS.getChat)
chatRouter.get("/group/:groupId",Authountcation(),CS.getGroupChat)
chatRouter.post("/group",Authountcation(),
MulterCloud({fileTypes:fileValidation.image}).array("attachments"),
Validation(createChatGroupSchema),
CS.createChatGroup)



export default chatRouter