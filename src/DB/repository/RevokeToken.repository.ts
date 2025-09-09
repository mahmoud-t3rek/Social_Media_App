import { HydratedDocument, Model } from "mongoose";
import userModel, { Iuser } from "../models/user.model";
import { DBRepository } from "./class.repository";
import { AppError } from "../../utils/ClassError";
import { IRevokeToken } from "../models/RevokeToken.model";


export class RevokeTokenReposotry extends DBRepository<IRevokeToken>{
constructor(protected readonly model:Model<IRevokeToken>){
    super(model)
}

}




