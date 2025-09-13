import * as z from "zod";
import { GenderType, RoleType } from "../../DB/models/user.model";


export const enum FlagType{
  all="all",
  current="current"
}
export  enum likeType{
  like="like",
  unlike="current"
}
const baseUserInfo = {
  fName: z.string().min(3, { message: "Name must be at least 3 characters long" }).trim(),
  lName: z.string().min(3, { message: "Name must be at least 3 characters long" }).trim(),
  address: z.string().trim(),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, {
    message: "Your number must be an Egyptian number",
  }),
   role: z.nativeEnum(RoleType),
  age: z.number().min(18, { message: "your age must be greater than 18" }).max(60, { message: "your age must be less than 60" }),
  gender: z.nativeEnum(GenderType),
}

export const SignInSchema = {
   body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" })
  })
}

export const SignUpSchema = {
  body: SignInSchema.body.safeExtend({
     ...baseUserInfo,
   Cpassword: z.string()
  }).refine((data) => data.password === data.Cpassword, {message: "Passwords do not match",path: ["Cpassword"]})
}


export const UpdateInfoSchema = {
  body: SignUpSchema.body.partial()
}

export const Enable_STSchema = {
  body:z.object({
    stepVerification:z.boolean({ message: "To activate verification, you must stepVerification=true" })
  }) 
}
export const UpdateEmailSchema = {
  body:z.object({
        email: z.string().email({ message: "Invalid email address" }),
  })
}

export const UpdatePasswordSchema={
  body:z.object({
     password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
     "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
      .min(6, { message: "Password must be at least 6 characters long" }),
      Cpassword: z.string()
  }).refine((data) => data.password === data.Cpassword, {message: "Passwords do not match",path: ["Cpassword"], })
}

export const ConfirmEmailSchema = {
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
    otp:z.string().length(6, { message: "OTP must be 6 digits" })
  })
}

export const LogOutSchema = {
  body: z.object({
    flag:z.enum([FlagType.all,FlagType.current])
  })
}




export type SignUpSchemaType = z.infer<typeof SignUpSchema.body>
export type SignInSchemaType = z.infer<typeof SignInSchema.body>
export type ConfirmEmailSchemaType = z.infer<typeof ConfirmEmailSchema.body>;
export type LogOutSchemaType = z.infer<typeof LogOutSchema.body>;
export type UpdatePasswordSchemaType = z.infer<typeof UpdatePasswordSchema.body>;
export type UpdateInfoSchemaType = z.infer<typeof UpdateInfoSchema.body>;
export type UpdateEmailSchemaType = z.infer<typeof UpdateEmailSchema.body>;
export type Enable_STSchemaSchemaType = z.infer<typeof Enable_STSchema.body>;