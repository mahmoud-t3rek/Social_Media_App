import { Server, Socket } from "socket.io";
import {ChatServices} from "./chat.service"
export class chatEvents{
  private _chatService:ChatServices=new ChatServices()
    constructor(){}

  sayHi =(socket:Socket)=>{
   socket.on("sayhay", (data, callback) => {
  console.log("Received from client:", data);
  callback("Hello from backend!")
})}
registerSendMessageEvent =(socket:Socket,io:Server)=>{
  return socket.on("sendMessage",(data)=>{
this._chatService.sendMessage(data,socket,io)
})
}
join_room =(socket:Socket,io:Server)=>{
  return socket.on("join_room",(data)=>{
this._chatService.join_room(data,socket,io)
})
}
sendGroupMessage =(socket:Socket,io:Server)=>{
  return socket.on("sendGroupMessage",(data)=>{
this._chatService.sendGroupMessage(data,socket,io)
})
}

}