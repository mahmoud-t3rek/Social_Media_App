import { HydratedDocument, Model, ProjectionType, RootFilterQuery, UpdateQuery, UpdateResult } from "mongoose";




export class DBRepository<TDocument>{

    constructor(protected readonly model:Model<TDocument>){}

    async create(data:Partial<TDocument>):Promise<HydratedDocument<TDocument>>{
        return this.model.create(data)
    }
    async findByEmail(filter:RootFilterQuery<TDocument>,select?:ProjectionType<TDocument>): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOne(filter,select);
      }
       async UpdateOne(filter:RootFilterQuery<TDocument>,update: UpdateQuery<TDocument>): Promise<UpdateResult | null> {
        return await this.model.updateOne(filter,update); 
      }
}