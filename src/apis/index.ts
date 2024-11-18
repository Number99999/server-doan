// @ts-ignore
import { middleWare } from "../config";
import type { RequestWithUser } from '../config';
import Database from '../libs/database';
import express, { NextFunction, Router } from "express";

const router = express.Router();

import AuthDiscord from './auth/discord';
import { CONFIG_CHESTS, CONFIG_MANA_CLASSES, MANA_CLASSES } from "../libs/game.config";
import queueRequest from "../libs/queue-request";
import { InfoBattle, ResultBattle, InfoLevelBattle, StartBattle} from "./PVE/InfoBattle";
import ClaimFirstPet from "./pets/claim_first_pet";
import ClaimPet from "./pets/claim_pet";
import { GetInfoFarm, ClaimFarm } from "./farm/farm_pet";

StartBattle(router)
GetInfoFarm(router);
ClaimFarm(router);
ClaimPet(router);
ClaimFirstPet(router);
ResultBattle(router);
InfoBattle(router);
InfoLevelBattle(router);
AuthDiscord(router);

const [StartRequest, EndRequest] = queueRequest();

function getRandomClass(classes: MANA_CLASSES[]): MANA_CLASSES {
    const randomIndex = Math.floor(Math.random() * classes.length);
    return classes[randomIndex];
};

router.post("/claim_first_chest", middleWare, StartRequest, async (req: any, res, next) => {
    try {
        if (!req.idUser) {
            res.sendStatus(403);
            return;
        };
        const idUser = req.idUser;
        const dbInstance = Database.getInstance();
        const db = await dbInstance.getDb();
        const userCollection = db.collection('users');
        const ninjaCollection = db.collection('ninjas');
        const offChainLogCollection = db.collection('offchain_logs');

        const dbCount = await ninjaCollection.countDocuments({ ownerId: idUser });

        if (dbCount === 0) {
            const { level, classes, price } = CONFIG_CHESTS.chest_lv_0;

            const chest_class = getRandomClass(classes);

            const mana = new Date();

            mana.setHours(mana.getHours() + (8 * CONFIG_MANA_CLASSES[chest_class]));

            const chestData = { ownerId: idUser, class: chest_class, level, mana, created_at: new Date() };

            const ninjaInsert = await ninjaCollection.insertOne(chestData);

            if (ninjaInsert.acknowledged === true) {
                // @ts-ignore
                await userCollection.updateOne({ addr: idUser }, { $push: { ninjas: { id: ninjaInsert.insertedId.toHexString(), created_at: chestData.created_at } } });

                await offChainLogCollection.insertOne({ action: 'claim_first_chest', addr: req.payload.addr, price, ...chestData, chestId: ninjaInsert.insertedId });

                res.status(200).json({ class: chest_class, mana: chestData.mana });
                return;
            };
        };

        res.status(404).end();
    } catch (error) {
        throw error;
    } finally {
        next();
    };
}, EndRequest);

export default router;
