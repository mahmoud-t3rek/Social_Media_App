import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import Limiter from "./middleware/ratelimit";
import GlobalErrorHandling from "./middleware/GlobalErrorHandling";
import { AppError } from "./utils/ClassError";
import ConnectionDB from "./DB/connectionDB";
import UserRouter from "./moduls/user/user.controller";
import PostRouter from "./moduls/Post/Post.controller";
import chatRouter from "./moduls/Chat/chat.controller";
import { intializationIo } from "./moduls/gateway/gateway";
import { createHandler } from "graphql-http/lib/use/express";
import { schemaQql } from "./moduls/GraphQl/schema.ggl";

export const bootstrap = async (app: Application) => {

  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(Limiter());


  await ConnectionDB();


  app.use("/users", UserRouter);
  app.use("/post", PostRouter);
  app.use("/chat", chatRouter);


  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      status: "success",
      message: "Server is running 🚀",
    });
  });

  app.all(
    "/graphql",
    createHandler({
      schema: schemaQql,
      context: (req) => ({ req }),
    })
  );

  app.all("*", (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Invalid URL ${req.originalUrl}`, 404));
  });


  app.use(GlobalErrorHandling);

  const port: number = Number(process.env.PORT) || 5000;

  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });


  intializationIo(server);
};

export default bootstrap;
