import {compare,hash} from "bcrypt";

export const Hash = (plainText: string, saltRounds: number=Number(process.env.PHONE_SECRETKEY))=>{
  return hash(plainText, saltRounds);
};
export const Compare = (plainText: string, cipherText:string)=>{
  return compare(plainText, cipherText);
};
