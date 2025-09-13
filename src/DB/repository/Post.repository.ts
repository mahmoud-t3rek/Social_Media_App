import {  Model } from "mongoose";
import { DBRepository } from "./class.repository";

import { Ipost } from "../models/post.model";


export class PostReposotry extends DBRepository<Ipost>{
constructor(protected readonly model:Model<Ipost>){
    super(model)
}

}




