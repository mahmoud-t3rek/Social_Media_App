import {  HydratedDocument, Model, ProjectionType, RootFilterQuery } from "mongoose";
import { DBRepository } from "./class.repository";
import { IChat } from "../models/chat.model";
import { QueryOptions } from "mongoose";


export class chatReposotry extends DBRepository<IChat>{
constructor(protected readonly model:Model<IChat>){
    super(model)
}
async findPaginate({
  filter,
  query,
  select,
  options
}: {
  filter: RootFilterQuery<IChat>,
  query: { page: number, limit: number },
  select?: ProjectionType<IChat>,
  options?: QueryOptions<IChat>
}) {
  let { page, limit } = query;
  if (page < 1 || !page) page = 1;
  page = page * 1 || 1;
 const chat = await this.findOne(filter, select, options);

  if (!chat) return { chat: null };
if (Array.isArray(chat.message)) {
    chat.message = chat.message.slice(-limit);
  }

  chat.message = chat.message?.slice(-limit) || [];
    return { chat};
}
}




