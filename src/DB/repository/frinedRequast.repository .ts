import {  Model } from "mongoose";
import { DBRepository } from "./class.repository";
import { IFrinedRequest } from "../models/frinedrequaste.model";


export class frinedRequastReposotry extends DBRepository<IFrinedRequest>{
constructor(protected readonly model:Model<IFrinedRequest>){
    super(model)
}

}




