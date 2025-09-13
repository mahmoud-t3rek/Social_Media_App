import { Iuser, RoleType } from "../../DB/models/user.model";
import { createToken } from "./Token";
import { v4 as uuidv4 } from "uuid";

export const GenerateTokens = async (user: Iuser) => {
  const jwtid = uuidv4();
  const isUser = user.role === RoleType.user;

  const access_Token = await createToken({
    payload: { email: user.email, Id: user._id },
    signature: isUser ? process.env.ACCSESS_TOKENUSER! : process.env.ACCSESS_TOKENADMIN!,
    options: { expiresIn: 60 * 60, jwtid }
  });

  const refresh_Token = await createToken({
    payload: { email: user.email, Id: user._id },
    signature: isUser ? process.env.REFRESCH_TOKENUSER! : process.env.REFRESCH_TOKENADMIN!,
    options: { expiresIn: "1y", jwtid }
  });

  return { access_Token, refresh_Token };
};