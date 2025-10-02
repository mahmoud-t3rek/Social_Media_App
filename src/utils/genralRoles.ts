import mongoose from "mongoose"
import z from "zod"

export const GenralRoles={

    id:z.string().refine((data)=>{
              return mongoose.Types.ObjectId.isValid(data)
            }, {message:"invalid userId"}).optional(),

    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    file: z.object({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      buffer: z.any().optional(),
      path: z.string().optional(),
      size: z.number(),
    }),
    otp:z.string().length(6, { message: "OTP must be 6 digits" })
}