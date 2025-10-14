import { Socket } from "socket.io";
import { Decoded_Token, GetSignutre, TokenType } from "../services/Token/Token";
import { AppError } from "../utils/ClassError";
export const connectionSockets=new Map<string,string[]>()

export const authorizationSocketIo = async (socket: Socket, next: (err?: Error) => void) => {
try {
const { authorization } = socket.handshake.auth;

if (!authorization) {
  return next(new AppError("Missing authorization", 400));
}

const [prefix, token] = (authorization || "").split(" ");
if (!prefix || !token) {
  return next(new AppError("Invalid token", 400));
}

const signature = await GetSignutre(TokenType.access,prefix);
if (!signature) {
  return next(new AppError("Invalid signature", 400));
}
const { decoded, user } = await Decoded_Token(token, signature);


const userId = user._id.toString();
const socketIds = connectionSockets.get(userId) || [];
if (!socketIds.includes(socket.id)) {
  socketIds.push(socket.id);
}
connectionSockets.set(userId, socketIds);

socket.data.user = user;
socket.data.decoded = decoded;

next()

} catch (err: any) {
next(new AppError(err.message || "Authentication failed", 400));
}
};
