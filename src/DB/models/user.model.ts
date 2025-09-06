import mongoose, { Types } from 'mongoose';
export enum GenderType{
  male="male",
  female="female"
}
export enum RoleType {
  user="user",
  admin = "admin"
}

export interface Iuser{
  _id:Types.ObjectId,
  fName:string,
  lName:string,
  userName:string,
  email:string,
  password:string,
  phone?:string,
  age:number,
  address?:string,
  gender?:GenderType,
  role?:RoleType,
  createdAt:string,
  updatedAt:string
}


const userSchema=new mongoose.Schema<Iuser>({
  fName:{type:String,required:true,trim:true,minLength:3,maxLength:10},
  lName:{type:String,required:true,trim:true,minLength:3,maxLength:10},
  email:{type:String,required:true,trim:true,unique:true},
  password:{type:String,required:true},
  phone:{type:String},
  age:{type:Number,required:true},
  address:{type:String},
  gender:{type:String,enum:GenderType,required:true},
  role:{type:String,enum:RoleType,default:RoleType.user},
},{
  timestamps:true,
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
})

userSchema.virtual("userName").set(function(value){
  const [fName,lName]=value.split(" ")
  this.set({fName,lName})
}).get(function(){
  return this.fName+" "+this.lName
})

const userModel=mongoose.models.User || mongoose.model("User",userSchema)

export default userModel