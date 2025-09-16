import { HydratedDocument, Model } from "mongoose";
import userModel, { Iuser } from "../models/user.model";
import { DBRepository } from "./class.repository";
import { AppError } from "../../utils/ClassError";


export class UserReposotry extends DBRepository<Iuser>{
constructor(protected readonly model:Model<Iuser>){
    super(model)
}
async createUser(data:Partial<Iuser>):Promise<HydratedDocument<Iuser>>{
    const user:HydratedDocument<Iuser>= await this.model.create(data)
    if(!user){
        throw new AppError("faild created",400);
    }
return user
}





}