import mongoose from 'mongoose';

export let userRole={
admin:"admin",
user:"user"
}

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        min:3
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
     password: {
    type: String,
     required:true,
  },
  phone:{
    type: String,
    required:true,
    
  },
  ProfileImage:{
    public_id:{ type: String},
      secure_url:{ type: String}
  },
  coverImage:[String],
  age: {
    type: Number,
     required:true,
    min: [18, "age must greater than 18"],
    max: [60, "age must smaller than 60"]
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(userRole)
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  isDeleted:Boolean,
  deletedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
},{timestamps:true})