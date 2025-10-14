import { Server, Socket } from "socket.io";
import { chatEvents } from "./chatEvents";

export class ChatGetWay{
    private chatEvents: chatEvents=new chatEvents()
    constructor(){}

    register=(socket:Socket,io:Server)=>{
      this.chatEvents.sayHi(socket)
      this.chatEvents.registerSendMessageEvent(socket,io)

      this.chatEvents.join_room(socket,io)
      this.chatEvents.sendGroupMessage(socket,io)
  

    
   }
} 