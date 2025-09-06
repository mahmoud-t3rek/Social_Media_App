import nodemailer from "nodemailer"
import Mail from "nodemailer/lib/mailer";
export const SendEmail=async(malnOptional:Mail.Options)=>{

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 456,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Wrap in an async IIFE so we can use await.

  const info = await transporter.sendMail({
    from: `"SocailMediaApp" <${process.env.EMAIL}>`,
    ...malnOptional
});

  console.log("Message sent:", info.messageId);
;
}

export const  CreateOTP= async()=>{
return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)
}