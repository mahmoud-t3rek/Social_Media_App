 import { graphql, GraphQLEnumType, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { GenderType } from "../../../DB/models/user.model";
import { AllowComment, Availability } from "../../../DB/models/post.model";


export  const PostType = new GraphQLObjectType({
    name: "Post",
    fields: {
      content: { type: new GraphQLNonNull(GraphQLString) },
      likes: { type:new GraphQLList(GraphQLID) },
      tags:{
        type:new GraphQLList(GraphQLID)
      },
      allowComment: { type: new GraphQLNonNull(new GraphQLEnumType({
              name:"EnumallowComment",
              values:{
                all:{value:AllowComment.all},
                any:{value:AllowComment.any},
              }
            }))
           },
      availability: { type: new GraphQLNonNull(new GraphQLEnumType({
              name:"EnumAvalibailty",
              values:{
                frineds:{value:Availability.friends},
                private:{value:Availability.private},
                public:{value:Availability.public},
              }
            }))
           },
    },
  });