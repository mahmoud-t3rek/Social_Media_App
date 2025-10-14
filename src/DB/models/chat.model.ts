import mongoose, { Types } from 'mongoose';
export interface IMessage{
   createdBy: Types.ObjectId 
   content:string
  createdAt?: Date
  updatedAt?: Date
}


export interface IChat {
  createdBy: Types.ObjectId 
  participantses: Types.ObjectId[]
  message:IMessage[]
 group:String
groupImage:String
 roomId:string
createdAt?: Date
updatedAt?: Date

}
const messageSchema=new mongoose.Schema<IMessage>({
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
content:{type : String,required:true}
},{
  timestamps:true
})

const chatSchema = new mongoose.Schema<IChat>(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participantses: [{ type: mongoose.Schema.Types.ObjectId, ref: "User",required:true }],
    message: [messageSchema],
    group:{ type: String},
    groupImage:{ type: String},
    roomId:{ type:String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery:true
  }
)


const ChatModel=mongoose.models.Chat || mongoose.model("Chat",chatSchema)

export default ChatModel