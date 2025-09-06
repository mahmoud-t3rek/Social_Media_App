import {compare,hash} from "bcrypt";

export const HashPassword = (plainText: string, saltRounds: number=Number(process.env.PHONE_SECRETKEY))=>{
  return hash(plainText, saltRounds);
};
export const comparePassword = (plainText: string, cipherText:string)=>{
  return compare(plainText, cipherText);
};
