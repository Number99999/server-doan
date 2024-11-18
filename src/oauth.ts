import { CLIENT_URL, CLIENT_WEB_URL, upsertUser } from "./config";
import jwt from 'jsonwebtoken'
export async function authenticate(req: any, res: any) {
  // console.log("authenticate >>>", req.headers['authorization'].substring(6));
  const token = req.headers['authorization'].substring(6);
  const decode = jwt.decode(token) as any;
  const user = await upsertUser(decode?.sub);
  return user;
}