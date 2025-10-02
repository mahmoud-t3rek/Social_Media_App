import {  Model } from "mongoose";
import { DBRepository } from "./class.repository";
import { IComment } from "../models/comments.model";


export class CommentReposotry extends DBRepository<IComment>{
constructor(protected readonly model:Model<IComment>){
    super(model)
}

}




