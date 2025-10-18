import { GraphQLEnumType, GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { GenderType, RoleType } from "../../../DB/models/user.model";


export const userArgs={
createUserArgs: {
          fName: { type: new GraphQLNonNull(GraphQLString) },
          lName: { type: new GraphQLNonNull(GraphQLString) },
          email: { type: new GraphQLNonNull(GraphQLString) },
          password: { type: new GraphQLNonNull(GraphQLString) },
          age: { type: new GraphQLNonNull(GraphQLString) },
          gender: {
            type: new GraphQLNonNull(
              new GraphQLEnumType({
                name: "gender",
                values: {
                  male: { value: GenderType.male },
                  female: { value: GenderType.female },
                },
              })
            ),
          },
          role: {
            type: new GraphQLNonNull(
              new GraphQLEnumType({
                name: "role",
                values: {
                  Admin: { value: RoleType.admin },
                  user: { value: RoleType.user },
                  superAdmin: { value: RoleType.superAdmin },
                },
              })
            ),
          },
        },

   getOneUser:{
       id: { type: new GraphQLNonNull(GraphQLID) }
    }     
}