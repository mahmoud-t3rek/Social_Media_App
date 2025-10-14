import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import Limiter from "./middleware/ratelimit";
import GlobalErrorHandling from "./middleware/GlobalErrorHandling";
import { AppError } from "./utils/ClassError";
import ConnectionDB from "./DB/connectionDB";
import UserRouter from "./moduls/user/user.controller";
import PostRouter from "./moduls/Post/Post.controller";
import { Get_File, getUrlRequestPresigner } from "./utils/S3config";
import { pipeline } from "nodemailer/lib/xoauth2";
import {promisify} from "node:util"
import { intializationIo } from "./moduls/gateway/gateway";
import chatRouter from "./moduls/Chat/chat.controller";

const writepipelline=promisify(pipeline)

export const bootstrap = (app: Application) => {
  
  app.use(express.json());
  ConnectionDB()
  app.use(cors());
  app.use(helmet());
  app.use(Limiter());
  app.use("/users",UserRouter)
  app.use("/post",PostRouter)
  app.use("/chat",chatRouter)
  app.get("/", (req: Request, res: Response, next: NextFunction) =>
    res.status(200).json({ message: "Welcome to my app.................✌️💙" })
  );
  


  app.use("{/demo}", (req: Request, res: Response, next: NextFunction) => {
    throw new AppError(`Invalid url ${req.originalUrl}`,404); 
  });
  const port:string |Number = process.env.PORT || 5000
  const server=app.listen(port, () => console.log(`Example app listening on port ${port}!`))
  intializationIo(server)
  app.use(GlobalErrorHandling)
};

export default bootstrap;
