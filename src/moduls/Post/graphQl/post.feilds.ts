import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import { PostType } from "./post.type";
import { postArgs } from "./post.args";
import postService from "../post.service";

 


class PostFields {
  constructor() {}
query=()=>{
    return {
          getOnePost:{
                  type:PostType,
                  args:postArgs.getOnePost,
                  resolve:postService.getOnePost
                },

            //  getAllUsers:{
            //     type:new GraphQLList(PostType),
            //     resolve:UserService.getAllUsers
            //  }   
    }
}
mutaion = () => {
    return {
      createPost: {
        type: PostType,
        args:postArgs.createPostArgs,
        resolve:postService.createGqlPost
    },
    createLike:{
      type:PostType,
      args:postArgs.createLikeArgs,
      resolve:postService.createGqlLikePost
    }
}
};
}

export default new PostFields();
