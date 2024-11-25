import express from "express";
import dotenv from "dotenv";
import path from 'path';
import Database from "./database";
import cors from 'cors';
import router from "./apis/index";
dotenv.config({ path: path.join(process.cwd(), (process.env.ENV_PATH || ""), ".env") });

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 3001;

app.use(express.json());
app.use(cors());

app.use("/api", router);
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
