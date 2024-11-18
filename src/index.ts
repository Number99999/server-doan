import {
  middleWare,
  EXT_URL,
  CLIENT_URL,
  JWT_SECRET,
  SERVER_URI,
  SERVER_PORT,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  CLIENT_WEB_URL,
} from "./config";
import type { RequestWithUser } from "./config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { authenticate } from "./oauth";
import dotenv from "dotenv";
import path from 'path';
import Apis from "./apis/index";
import Database from "./libs/database";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Passport } from "passport";
import session from "express-session";
import IORedis from 'ioredis';
import RedisStore from "connect-redis";
import morgan from 'morgan';


dotenv.config({ path: path.join(process.cwd(), (process.env.ENV_PATH || ""), ".env") });
const version = "26062024";
console.log("current version >>>", version)
const allowedDomains = [
  CLIENT_WEB_URL,
  CLIENT_URL,
  EXT_URL,
  "http://10.0.4.43:3000",
  "http://10.0.4.43:3001",
  "http://www.localhost:3000",
  "http://localhost:7456",
  "http://10.0.1.114:7456",
  "http://10.0.1.87:7456",
  "https://twitter.com",
  "https://testnet.masterduel.io",
  "https://testnet.masterduel.io/static",
  "https://testnet.masterduel.io/m3rpg-api",
  "chrome-extension://mallhneohekkbpfkfolgdpdfjnhhdjfa", // Kane
  "chrome-extension://kppphllppbadjfdcnfaeiaegncdnkjie", //
  "chrome-extension://dacjcoeobmabhadnkpdlleeelfjolhog", // Main
  "chrome-extension://negbflckincnpeijakdenoaihhgjombb", // Son
  "chrome-extension://jpndipfjaiajefiodgcdolicekcdfodb", // CJ
  "chrome-extension://ongadmgaeencmdilhiahhboddfagjaea", // CJ
  "chrome-extension://cljlallcahflbdmohjdjdmgbopjpiell", // More
  "chrome-extension://ejipopigjhmcfcgnijficigpmhmlepbk", // More
];


const corsOptions = {
  // origin: allowedDomains,
  origin: "*",
  credentials: true,
};

const app = express();

const redisClient = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

redisClient.on('ready', () => {
  console.log('Connected to Redis successfully!');
});

redisClient.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    },
  })
)

app.use(morgan('common'));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

const passport = new Passport();
const passport_web = new Passport();

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: `${SERVER_URI}/auth/twitter/callback`,
    },
    //@ts-ignore
    function (token, tokenSecret, profile, done) {
      const user = {
        tw_id: profile.id,
        name: profile.displayName,
        username: profile.username,
        profile_image_url: profile._json.profile_image_url,
        created_at: profile._json.created_at,
        accessToken: token,
      };
      done(null, user);
    }
  )
);

passport_web.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: `${SERVER_URI}/auth2/twitter/callback`,
    },
    //@ts-ignore
    function (token, tokenSecret, profile, done) {
      const user = {
        tw_id: profile.id,
        name: profile.displayName,
        username: profile.username,
        profile_image_url: profile._json.profile_image_url,
        created_at: profile._json.created_at,
        accessToken: token,
      };
      done(null, user);
    }
  )
);

app.use("/m3rpg-api/api", Apis);
app.use("/m3rpg-api/login", middleWare, async (req, res) => {
  const user = await authenticate(req, res);
  if (user) res.status(200).send(JSON.stringify(user));
  else {
    let response = {
      payload: {
        success: false
      }
    }
    res.status(403).send(JSON.stringify(response));
  }
})

app.use("/m3rpg-api/info_user", middleWare, async (req: any, res) => {
  if (!req.idUser) {
    res.status(400).send();
    return;
  }
  try {
    const db = await Database.getInstance().getDb();
    const userCollection = db.collection("users");
    const idUser = req.idUser;
    const user = await userCollection.findOne({ idUser: idUser }, { projection: { _id: 0, privateKey: 0 } }) as any;
    const pveUserCollection = await db.collection('level_pve_user').findOne({ idUser: idUser }) as any;
    const listPetUser = await db.collection('pets_user').find({ owner: idUser }).toArray();
    user.level = pveUserCollection?.current_level ? pveUserCollection?.current_level : 1;
    const data = {
      payload: {
        user: user,
        listPet: listPetUser
      }
    }
    res.status(200).send(JSON.stringify(data))
  } catch (err) {
    console.log(err)
    res.status(403).send(err);
    return;
  }
})

app.post("/m3rpg-api/signout", (req, res) => {
  if (req.headers['match3-type'] === 'web') {
    res.clearCookie('match3-auth_token').status(200).end();
  };
});

app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

app.listen(SERVER_PORT, () => console.log(`Server listening on port ${SERVER_PORT}`));

(async () => {
  const dbInstance = Database.getInstance();
  const db = await dbInstance.getDb();
  const userCollection = db.collection("users");
  const petConfigCollection = db.collection("pets_config");
  const petsUserCollection = db.collection("pets_user");
  const levelPVEConfigCollection = db.collection("level_pve_config");
  const levelPVEUserCollection = db.collection("level_pve_user");

  await userCollection.createIndex({ addr: 1 })
  await petsUserCollection.createIndex({ owner_id: 1 });
  await levelPVEUserCollection.createIndex({ addr: 1 });

  console.log("DB load succeed")
})();
