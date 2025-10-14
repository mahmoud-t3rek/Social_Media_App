import z from "zod";
import { GenralRoles } from "../../utils/genralRoles";

export const getChatSchema = {
   params: z.object({
   userId:z.string().nonempty("userId is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
  })
}
export const sendMessageSchema =z.object({
  content: z.string().min(1, "Message content is required"),
  sendTo: z.string()
    .nonempty("sendTo is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
});
export const createMessageSchema =z.object({
  content: z.string().min(1, "Message content is required"),
  createdBy: z.string()
    .nonempty("createdBy is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId").optional(),
});
export const createChatGroupSchema ={
  body:z.object({
  group: z.string().min(5, "group name is required"),
  profileImage:z.string().optional(),
  attachments:z.array(GenralRoles.file).max(2).optional(),
  participantses:z.array(GenralRoles.id).refine((value)=>{
            return new Set(value).size===value?.length
          },
        {
          message:"dublicate mention"
        }),

 
  
})}


export type getChatSchemaType = z.infer<typeof getChatSchema.params>;
export type sendMessageSchemaType = z.infer<typeof sendMessageSchema>;