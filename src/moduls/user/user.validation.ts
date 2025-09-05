import * as z from "zod";
import { RoleType } from "../../DB/models/user.model";

export const SignUpSchema = {
  body: z.object({
    name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters long" })
      .trim(),

    email: z.string().email({ message: "Invalid email address" }),

    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .min(6, { message: "Password must be at least 6 characters long" }),
    role: z.enum([RoleType.admin,RoleType.user]),
    phone: z.string().regex(/^01[0125][0-9]{8}$/, {
      message: "Your number must be an Egyptian number",
    }),
    age: z
      .number()
      .min(18, { message: "your age must be greater than 18" })
      .max(60, { message: "your age must be less than 60" }),
    Cpassword: z
      .string()
  })    .refine((data) => data.password === data.Cpassword, {
      message: "Passwords do not match",
      path: ["Cpassword"], 
    }),

};

export type userRoleValid = z.infer<typeof SignUpSchema.body>;
