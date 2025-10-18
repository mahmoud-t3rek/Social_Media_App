import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import { userType } from "../user.type";
import { GenderType } from "../../../DB/models/user.model";
import { AppError } from "../../../utils/ClassError";
import UserService from "../user.service";
import userService from "../user.service";
import { userArgs } from "./user.args";
 
 export const users = [
  { id: 1, name: "ahmed", email: "ahmd@gmail.com",password:"111",gender:GenderType.male},
  { id: 2, name: "ali", email: "ali@gmail.com",password:"111",gender:GenderType.male },
];

class UserFields {
  constructor() {}
query=()=>{
    return {
          getOneUser:{
                  type:userType,
                  args:userArgs.getOneUser,
                  resolve:userService.getOneUser
                },

             getAllUsers:{
                type:new GraphQLList(userType),
                resolve:UserService.getAllUsers
             }   
    }
}
mutaion = () => {
    return {
      createUser: {
        type: userType,
        args:userArgs.createUserArgs,
        resolve:userService.createUser
    }
}
};
}

export default new UserFields();
