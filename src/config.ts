// @ts-nocheck
import jwt from "jsonwebtoken";
import Database from "./libs/database";
import dotenv from 'dotenv';
import path from 'path';
import { generateWallet } from './libs/wallet';
import { getInjectiveAddress, getEthereumAddress } from '@injectivelabs/sdk-ts';
import CryptoJS from 'crypto-js';
import { Request, Response, NextFunction } from "express";

dotenv.config({ path: path.join(process.cwd(), (process.env.ENV_PATH || ""), ".env") });

export const EXT_URL = process.env.EXT_URL!;
export const CLIENT_WEB_URL = process.env.CLIENT_WEB_URL!;
export const CLIENT_URL = process.env.CLIENT_URL!;
export const SERVER_URI = process.env.SERVER_URI!;
export const SERVER_PORT = process.env.SERVER_PORT!;
export const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY!;
export const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET!;
export const JWT_SECRET = process.env.JWT_SECRET!;
function generateRandomString(length: number): string {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function upsertUser(idUser: string) {
  if (!idUser) {
    console.error('Error login:', user);
    return;
  }

  const dbInstance = Database.getInstance();
  const db = await dbInstance.getDb();
  const userCollection = db.collection('users');
  const userDB = await userCollection.findOne({ idUser: idUser }, { projection: { _id: 0 } });
  if (userDB != null) {
    if (userDB.privateKey === undefined || userDB.privateKey === null) {
      const serverSecretKey = process.env.SECRET_KEY;
      // @ts-ignore
      const encryptedPrivateKey = CryptoJS.AES.encrypt(userDB.addr, serverSecretKey).toString();
      // user.addr = addr;
      // user.privateKey = encryptedPrivateKey;
      await userCollection.updateOne({ idUser: idUser }, { $set: { privateKey: encryptedPrivateKey } }); // update nếu user chưa có private key
    }
  } else {// case chưa có addr (chưa có user)
    await userCollection.insertOne({ idUser: idUser, currency: { gold: 0, crystal: 0, soulStone: 0 }, timeRemainingBattery: 0 });
  }
  const user = await userCollection.findOne({ idUser: idUser }, {
    projection: { _id: 0 }
  })

  return user;
}

export type PAYLOAD = {
  idUser: string,
  addr: string;
  accessToken: string;
};

export interface RequestWithUser extends Request {
  payload?: PAYLOAD;
};

// export function middleWare(req: any, res: Response, next: NextFunction) {
//   try {
//     const token = req.headers['match3-type'] === 'web' ? req.headers['match3-auth_token'] : (req.headers['match3-auth_token'] || req.headers['match3-auth_token']) as string;
//     // console.log("middleWare >>> ", token, req.headers['match3-type'], req.headers['match3-auth_token'], req.cookies['match3-auth_token'])
//     if (!token) {
//       throw new Error("Not Authenticated");
//     };

//     const payload = (jwt.verify(token, JWT_SECRET)) as PAYLOAD;
//     if (!payload.addr) {
//       throw new Error("Not Authenticated");
//     };

//     req.payload = payload;

//     next();
//   } catch (err) {
//     res.status(403).json("Not Authenticated");
//   };
// };

export function middleWare(req: any, res: any, next: any) {
  try {

    // let token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IkEzRERFODFCODcxQUU4QjVCMjlGMDk1MTQwMTVCRjRENkEzODI3M0RSUzI1NiIsIng1dCI6Im85M29HNGNhNkxXeW53bFJRQldfVFdvNEp6MCIsInR5cCI6ImF0K2p3dCJ9.eyJpc3MiOiJodHRwczovL2lkLm1hc3RlcmR1ZWwuaW8iLCJuYmYiOjE3MTg2ODAxNjMsImlhdCI6MTcxODY4MDE2MywiZXhwIjoxNzE4NjgzNzYzLCJhdWQiOlsibWF0Y2gzLWFwaSIsImh0dHBzOi8vaWQubWFzdGVyZHVlbC5pby9yZXNvdXJjZXMiXSwic2NvcGUiOlsibWF0Y2gzOmFwaSIsIm9wZW5pZCIsInByb2ZpbGUiXSwiYW1yIjpbInRva2VuLWV4Y2hhbmdlIl0sImNsaWVudF9pZCI6Im1hdGNoMy1hcGkiLCJzdWIiOiIzODEwMjczNjI1NTQyNDkyMTYiLCJhdXRoX3RpbWUiOjE3MTg2ODAxNjMsImlkcCI6IndlYjNfd2FsbGV0IiwicHJlZmVycmVkX3VzZXJuYW1lIjoiMHg0MjMwOTdjZDdFNzkyNjM0YkM3NjQwYjRiQmI4ZTJiRTRCODIxNzlkIiwibmFtZSI6IjB4NDIzMDk3Y2Q3RTc5MjYzNGJDNzY0MGI0YkJiOGUyYkU0QjgyMTc5ZCIsInNpZCI6IjI0ZDM4M2FiNjMwNTRhYjlhNWYyMTBiNjQ1NjlkYzkxIn0.BjhR6NHAVDIT9RFvV9jDTY4abBB37gmNkEVRfK77XbIiKPCPB_LRoUZfUrBgyXlsbLnPweGupPtGrt5FoZRQdpZB7E4PIJw4QKOLFxB0UASsM9uLhwMVOIzmcj0aLJ7f2h_WBgypIS2jccZIz6X9NJsjEHQyofk4YyvgjqgvMg1UQ1mdFw9dqZl8GKsJjPIdHx8ub_jboRdh91g7YNJaC2B0BC9mVG4n6CCusHiRZov3Je4LmnY6PDQBdMP8gx9LZRVyajfEzAgSR2CCP4fxzpl-s7aCmllfNMw9RSIDJN4Al55PSNpGxwLLz02Yfg4EpvBoFnHywkmPLGMb0Z0wI61iQSJkf9hXEV0Nq35PC5ALDr6emmtyITBlbwJHjCQCOE32ACrdWum6HCMQZmc1KTeg-J3Lx95k0NjiHmiPla8XQKVQkPuuAgrYLShKxomiqH4Kt13F2K1mizxLeK3VHoWxfmqpgfN7gEjal9xO7Uu1-3Z6pAvkfwV1aWJ0_anvcrYqzptr6H51OqR6qNo15I9jSTaRlxkLo2CLeBnFUx3f7zaTrLTmxcSWqgFTsc5PnsZjGWXQ8psthzmBHGwZLB9tP2Lldw_m_bziVPJW9VJT0u2RGohR7SLmNYQnlQdev87cnuR8KeJGnxvSTfccrcE_3Er5RS8J1KSG2GJxt50";
    let token = req.headers['authorization'] + '';
    // console.log("token middleware >>>", token);

    token = token.substring(6);
    const decode = jwt.decode(token) as any;

    const configCheckMiddleWare = {
      Authority: "https://id.masterduel.io",
      ValidAudiences: "masterduel-api",
      ValidIssuers: "https://id.masterduel.io"
    }

    /*
      correct config
      dentityServer:
        clientid: match3-api
        scope: match3:api
        ValidAudiences: match3-api

      iss == authority
      validAudiend == aud
      validIssues == iis
    */

    // console.log(decode.iss, decode.scope[0], decode.client_id, decode.iss != configCheckMiddleWare.Authority || decode.scope[0] != 'match3:api' || decode.client_id != 'match3-api');
    if (decode.iss != configCheckMiddleWare.Authority || decode.scope[0] != 'match3:api' || decode.client_id != 'match3-api') {
      throw new Error("Not Authenticated");
    }
    // req.payload.idUser = decode.sub;
    req.idUser = decode.sub
    next();
  } catch (err) {
    console.log("errrrrrrrrr >>>", err)
    res.status(403).json("Not Authenticated");
  }
}