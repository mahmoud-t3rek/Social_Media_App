import { graphql, GraphQLEnumType, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { GenderType, RoleType } from "../../../DB/models/user.model";
import { AllowComment, Availability } from "../../../DB/models/post.model";
import { likeType } from "../post.validation";


export const postArgs={
createPostArgs: {
        content: { type: new GraphQLNonNull(GraphQLString) },
        likes: { type:new GraphQLList(GraphQLID) },
        tags:{
          type:new GraphQLList(GraphQLID)
        },
        allowComment: { type: new GraphQLNonNull(new GraphQLEnumType({
                name:"EnumComment",
                values:{
                  all:{value:AllowComment.all},
                  any:{value:AllowComment.any},
                }
              }))
             },
        availability: { type: new GraphQLNonNull(new GraphQLEnumType({
                name:"Enumavalibailty",
                values:{
                  frineds:{value:Availability.friends},
                  private:{value:Availability.private},
                  public:{value:Availability.public},
                }
              }))
             },
      },

   getOnePost:{
       postId: { type: new GraphQLNonNull(GraphQLID) }
    },
    createLikeArgs:{
       postId: { type: new GraphQLNonNull(GraphQLID) },
       action:{ type: new GraphQLNonNull(new GraphQLEnumType({
                name:"Enumaction",
                values:{
                  Like:{value:likeType.like},
                  unLike:{value:likeType.unlike},
                }
              }))
             }
        
  }
}