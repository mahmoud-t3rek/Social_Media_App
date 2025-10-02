import {  Model } from "mongoose";
import { DBRepository } from "./class.repository";

import { IPost } from "../models/post.model";


export class PostReposotry extends DBRepository<IPost>{
constructor(protected readonly model:Model<IPost>){
    super(model)
}

}




