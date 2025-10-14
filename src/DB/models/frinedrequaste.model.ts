import mongoose, { Types } from 'mongoose';
export enum onModelEnum{
  post="Post",
  comment="Comment"
}

export interface IFrinedRequest {
  createdBy: Types.ObjectId 
  sendTo: Types.ObjectId
  accepted?: boolean

}


const frinedRequastSchema = new mongoose.Schema<IFrinedRequest>({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sendTo: { type: mongoose.Schema.Types.ObjectId, refPath: "User", required: true },
  accepted:{type:Boolean}

 },  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery:true
  }
)



const frinedRequastModel=mongoose.models.FrinedRequast || mongoose.model("FrinedRequast",frinedRequastSchema)

export default frinedRequastModel