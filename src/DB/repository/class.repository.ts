import { DeleteOptions} from "mongodb";
import { DeleteResult, GetLeanResultType, HydratedDocument, Model, MongooseBaseQueryOptions, ProjectionType, QueryOptions, QueryWithHelpers, RootFilterQuery, Types, UpdateQuery, UpdateResult } from "mongoose";




export class DBRepository<TDocument>{

    constructor(protected readonly model:Model<TDocument>){}

    async create(data:Partial<TDocument>):Promise<HydratedDocument<TDocument>>{
        return this.model.create(data)
    }
    async findOne(filter:RootFilterQuery<TDocument>,select?:ProjectionType<TDocument>, options?: QueryOptions<TDocument>): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOne(filter,select,options);
      }   
    async find({
          filter,
          select,
          options
         }:
        {
          filter:RootFilterQuery<TDocument>,
          select?:ProjectionType<TDocument>,
          options?:QueryOptions<TDocument>
        }): Promise<HydratedDocument<TDocument>[]> {
          return await this.model.find(filter,select,options)
        }
    async paginate({
  filter,
  query,
  select,
  options
}: {
  filter: RootFilterQuery<TDocument>,
  query: { page: number, limit: number },
  select?: ProjectionType<TDocument>,
  options?: QueryOptions<TDocument>
}) {
  let { page, limit } = query;
  if (page < 1) page = 1;
  page = page * 1 || 1;
  const skip = (page - 1) * limit;
  const finalOptions = {
    ...options,
    skip,
    limit
  };
  const count=await this.model.countDocuments({deletedAt:{$exists:false}})
  const numberOfPages=Math.ceil(count/limit)
  const docs = await this.model.find(filter, select || null, finalOptions).lean({ virtuals: true });
  return { docs, currentPages: page,countDocument:count,numberOfPages};
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
       async findOneAndUpdate(  filter: RootFilterQuery<TDocument>,update?: UpdateQuery<TDocument>,options?: QueryOptions<TDocument> | null):  Promise<TDocument | null> {
        return await this.model.findOneAndUpdate(filter,update,options); 
      }
     async findOneAndDelete(filter: RootFilterQuery<TDocument>,options?: QueryOptions<TDocument>) {
      return await this.model.findOneAndDelete(filter, options);
    }
     async deleteMany(filter: RootFilterQuery<TDocument>,options?: MongooseBaseQueryOptions<TDocument>| null) {
      return await this.model.deleteMany(filter, options);
    }

}