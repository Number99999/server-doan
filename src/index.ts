import express from "express";
import dotenv from "dotenv";
import path from 'path';
import Database from "./database";

dotenv.config({ path: path.join(process.cwd(), (process.env.ENV_PATH || ""), ".env") });
const version = "26062024";
console.log("current version >>>", version)

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 3001;


app.use(express.json());

app.listen(SERVER_PORT, () => console.log(`Server listening on port ${SERVER_PORT}`));

// check and create datanase
(async () => {
  const dbInstance = Database.getInstance();
  const db = await dbInstance.getDb();
  const listCollection = await db.listCollections().toArray();
  const listCollectionName = ["news"];
  for (const nameColl of listCollectionName) {
    if (listCollection.findIndex(e => e.name === nameColl) === -1) {
      await db.createCollection(nameColl);
    }
  }
  console.log("DB load succeed")
})();
