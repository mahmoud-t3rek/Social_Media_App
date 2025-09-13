import { DeleteOptions} from "mongodb";
import { DeleteResult, HydratedDocument, Model, MongooseBaseQueryOptions, ProjectionType, QueryOptions, RootFilterQuery, Types, UpdateQuery, UpdateResult } from "mongoose";




export class DBRepository<TDocument>{

    constructor(protected readonly model:Model<TDocument>){}

    async create(data:Partial<TDocument>):Promise<HydratedDocument<TDocument>>{
        return this.model.create(data)
    }
    async findOne(filter:RootFilterQuery<TDocument>,select?:ProjectionType<TDocument>): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOne(filter,select);
      }
       async updateOne(filter:RootFilterQuery<TDocument>,update: UpdateQuery<TDocument>): Promise<UpdateResult | null> {
        return await this.model.updateOne(filter,update); 
      }
       async DeleteOne( filter: RootFilterQuery<TDocument>,options?: DeleteOptions & MongooseBaseQueryOptions<TDocument>): Promise<DeleteResult | null> {
        return await this.model.deleteOne(filter,options); 
      }
       async findByIdAndUpdate(  id?: string | Types.ObjectId,update?: UpdateQuery<TDocument>,options?: QueryOptions<TDocument> | null):  Promise<TDocument | null> {
        return await this.model.findByIdAndUpdate(id,update,options); 
      }
}