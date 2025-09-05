import { HydratedDocument, Model } from "mongoose";



export class DBRepository<TDocument>{

    constructor(protected readonly model:Model<TDocument>){}

    async create(data:Partial<TDocument>):Promise<HydratedDocument<TDocument>>{
        return this.model.create(data)
    }
}