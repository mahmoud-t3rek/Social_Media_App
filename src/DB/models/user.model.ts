import mongoose, { Types } from 'mongoose';

export enum GenderType{
  male="male",
  female="female"
}
export enum RoleType {
  user="user",
  admin = "admin"
}
export enum ProviderType {
  Google="Google",
  system = "system"
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
  provider:ProviderType
  address?:string,
  image?:string,
  gender?:GenderType,
  otp?:string,
  confirmed:boolean,
  role?:RoleType,
  changeCardnality?:Date,
  otpExp:Date,
  createdAt:string,
  updatedAt:string,
  stepVerification:boolean
}


const userSchema=new mongoose.Schema<Iuser>({
  fName:{type:String,required:true,trim:true,minLength:3,maxLength:10},
  lName:{type:String,required:true,trim:true,minLength:3,maxLength:10},
  email:{type:String,required:true,trim:true,unique:true},
  password:{type:String,required:function(){
    return this.provider===ProviderType.Google ? false : true 
  }},
  phone:{type:String},
  otp:{type:String},
  otpExp:{type:Date},
  confirmed:{type:Boolean},
  changeCardnality:{type:Date},
  age:{type:Number,required:function(){
    return this.provider===ProviderType.Google ? false : true }},
  address:{type:String},
  provider:{type:String,enum:ProviderType,default:ProviderType.system},
  stepVerification:{type:Boolean,default:false},
  gender:{type:String,enum:GenderType,required:function(){
    return this.provider===ProviderType.Google ? false : true }},
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