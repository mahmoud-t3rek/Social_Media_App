import { HydratedDocument, HydrateOptions } from "mongoose";
import { Iuser } from "../DB/models/user.model";
import { JwtPayload } from "jsonwebtoken";


declare module "express-serve-static-core" {
    interface Request {
        user?:HydratedDocument<Iuser>,
        decoded?:JwtPayload
    }
}