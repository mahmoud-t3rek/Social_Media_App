import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { GenderType } from "../../DB/models/user.model";

export const genderType = new GraphQLEnumType({
  name: "genderType",
  values: {
    male: { value: GenderType.male },
    female: { value: GenderType.female },
  },
});

export const userType = new GraphQLObjectType({
  name: "user",
  fields: {
    fName: { type: new GraphQLNonNull(GraphQLString) },
    lName: { type: new GraphQLNonNull(GraphQLString) },
    userName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    role:{ type: new GraphQLNonNull(GraphQLString) },
    gender: { type: genderType },
     friends:{
    type:new GraphQLList(GraphQLID)
  }
  },
 
});
