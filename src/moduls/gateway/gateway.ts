import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { authorizationSocketIo, connectionSockets } from "../../middleware/authoraization.socketIo";
import { chatEvents } from "../Chat/chatEvents";
import { AppError } from "../../utils/ClassError";
const ChatEvents=new chatEvents
let io:Server | undefined =undefined
export const intializationIo = (HttpServer: HttpServer) => {

const io = new Server(HttpServer, {
cors: { origin: "*" },
});

io.use(async (socket: Socket, next) => {
  
  try {
  
    await authorizationSocketIo(socket, next);

  } catch (err:any) {
    next(err);
  }
});

io.on("connection", (socket: Socket) => {
  const userId = socket.data.user._id.toString();
  const existingSockets = connectionSockets.get(userId) || [];
  connectionSockets.set(userId, [...existingSockets, socket.id]);
ChatEvents.registerSendMessageEvent(socket, io);
ChatEvents.join_room(socket, io);
ChatEvents.sendGroupMessage(socket, io);

const DisconnectUser = () => {
  if (!socket.data.user?._id) return;

  const userId = socket.data.user._id.toString();
  const sockets = connectionSockets.get(userId) || [];
  const remainingTabs = sockets.filter((tab) => tab !== socket.id);

  if (remainingTabs.length > 0) {
    connectionSockets.set(userId, remainingTabs);
  } else {
    connectionSockets.delete(userId);
  }

  socket.broadcast.emit("userdisconnect", { userId });
};



socket.on("disconnect", () => {
  DisconnectUser();
});


});

};

export const getIo=():Server =>{
  if(!io){
    throw new AppError("io no intilaized",400);
    
  }
  return io
}
