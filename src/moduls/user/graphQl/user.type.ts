 import { graphql, GraphQLEnumType, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { GenderType } from "../../../DB/models/user.model";


export  const userType = new GraphQLObjectType({
    name: "user",
    fields: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
      gender: { type: new GraphQLNonNull(new GraphQLEnumType({
              name:"EnumGender",
              values:{
                male:{value:GenderType.male},
                female:{value:GenderType.female},
              }
            }))
           },
    },
  });