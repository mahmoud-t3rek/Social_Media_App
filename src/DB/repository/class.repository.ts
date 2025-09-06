import { HydratedDocument, Model, ProjectionType, RootFilterQuery } from "mongoose";




export class DBRepository<TDocument>{

    constructor(protected readonly model:Model<TDocument>){}

    async create(data:Partial<TDocument>):Promise<HydratedDocument<TDocument>>{
        return this.model.create(data)
    }
    async findByEmail(filter:RootFilterQuery<TDocument>,select?:ProjectionType<TDocument>): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOne(filter,select);
      }
}