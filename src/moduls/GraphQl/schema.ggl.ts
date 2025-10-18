 import { graphql, GraphQLEnumType, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { GenderType } from "../../DB/models/user.model";
import { AppError } from "../../utils/ClassError";
import UserFields from '../user/graphQl/user.feilds';
import userFeilds from "../user/graphQl/user.feilds";
import postFeilds from "../Post/graphQl/post.feilds";

  
 export const schemaQql=new GraphQLSchema({
    query: new GraphQLObjectType({
      name:"query",
      fields:{
      ...userFeilds.query(),
      ...postFeilds.query()
      }
    }),
    mutation:new GraphQLObjectType({
      name:"mutaion",
      fields:{
       ...UserFields.mutaion(),
       ...postFeilds.mutaion()
      }
    })
  
 })

 