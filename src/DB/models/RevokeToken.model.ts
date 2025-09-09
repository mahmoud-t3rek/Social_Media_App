import mongoose, { Types } from 'mongoose';


export interface IRevokeToken{
  userId:Types.ObjectId,
  TokenId:string,
  expireAt:Date
}


const RevokeTokenSchema=new mongoose.Schema<IRevokeToken>({
  userId:{type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User"

  },
  TokenId:{type:String,required:true},
  expireAt:{type:Date}
},{
  timestamps:true,
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
})

const RevokeTokenModel=mongoose.models.RevokeToken || mongoose.model("RevokeToken",RevokeTokenSchema)

export default RevokeTokenModel