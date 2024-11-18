import { Router } from 'express';
import { middleWare, type RequestWithUser } from '../../config';
import Database from '../../libs/database';
import { startFarm } from '../farm/farm_pet';

const timeRemainPerBattery = 10 * 60 // in second

export function InfoBattle(router: Router) {
    router.post("/pve/info_battle", middleWare, async (req: any, res) => {
        if (!req.idUser) {
            res.status(403).send();
            return
        }
        const idUser = req.idUser;
        const dbInstance = Database.getInstance();
        const db = await dbInstance.getDb();
        const levelUser = db.collection("level_pve_user");
        const totalLevel = await db.collection("level_config").countDocuments();
        const infoLevelUser = await levelUser.findOne({ idUser: idUser });
        const now = Math.floor((new Date()).getTime() / 1000);
        const userCollection = db.collection('users');
        let infoPVE = (await db.collection('users').findOne({ idUser: idUser }) as any).infoPVE;
        const listPetUser = (await db.collection('pets_user').find({ owner: idUser }, { projection: { _id: 0 } }).toArray());
        let respone = {
            totalLevel: totalLevel,
            infoPet: [listPetUser],
            currentLevel: 1,
            infoPVE: infoPVE,
            now: now
        }
        if (infoLevelUser?.current_level) respone.currentLevel = infoLevelUser.current_level;
        if (!infoPVE) {
            infoPVE = {
                maxBattery: 20,
                curBattery: 20,
                startTimeRemining: now,
                timeRemainingPerBattery: timeRemainPerBattery
            }
        }
        // console.log(infoPVE);

        if (infoPVE.curBattery == 0) {
            let data = {
                payload: {
                    success: false
                }
            }
            res.status(400).send(JSON.stringify(data));
            return;
        }

        // re calc curBatterry
        if (infoPVE.curBattery < infoPVE.maxBattery) {
            let timeCD = now - infoPVE.startTimeRemining;
            let batteryRemain = Math.floor(timeCD / timeRemainPerBattery);
            let newBattery = infoPVE.curBattery + batteryRemain;
            if (newBattery != infoPVE.curBattery) {
                if (newBattery < infoPVE.maxBattery) {
                    infoPVE.timeRemainingPerBattery += batteryRemain * timeRemainPerBattery;
                }
                infoPVE.curBattery = Math.min(newBattery, infoPVE.maxBattery);
                await userCollection.updateOne({ idUser: idUser }, {
                    $set: {
                        infoPVE: infoPVE
                    }
                })
            }

        }
        // console.log(respone)
        res.status(200).send(respone);
    });
}

export function ResultBattle(router: Router) {
    router.post("/pve/result_battle", middleWare, async (req: any, res) => {
        if (!req.idUser) {
            res.status(403).send();
            return;
        }
        const payload = req.body.payload;
        const idUser = req.idUser;
        const level = payload.level;
        if (!payload || !idUser) {
            res.status(403).send();
            return;
        }
        const dbInstance = Database.getInstance();
        const db = await dbInstance.getDb();
        const levelUser = db.collection("level_pve_user");
        const infoLevelUser = await levelUser.findOne({ idUser: idUser });
        try {
            if (level == 5) {
                startFarm(idUser);
            }
            if (infoLevelUser) {
                await levelUser.updateOne({ idUser: idUser }, { $set: { [`level.${level}`]: true, current_level: level + 1 } })
            }
            else await levelUser.insertOne({ idUser: idUser, level: { [level]: true }, current_level: 2 });
            let data = {
                success: true
            }
            res.status(200).send(JSON.stringify(data));
        } catch (err) {
            res.status(403).send();
        }
    })
}

export function StartBattle(router: Router) {
    router.post("/pve/start_battle", middleWare, async (req: any, res) => {
        if (!req.idUser) {
            res.status(403).send();
            return;
        }
        try {
            /*
                listIdPet
            */
            const db = await Database.getInstance().getDb();
            const payload = req.body.payload;
            const userCollection = db.collection('users');
            const idUser = req.idUser;
            const pveUserCollection = db.collection('level_pve_user');
            const userPVE = await pveUserCollection.findOne({ idUser: idUser }) as any;
            if (userPVE) {
                await pveUserCollection.updateOne({ idUser: idUser }, {
                    $set: {
                        team: payload.listIdPet
                    }
                })
            }
            else {
                await userPVE.insertOne({ idUser: idUser, level: {}, current_level: 1, team: payload.listIdPet });
            }
            res.status(200).send();
        } catch (err) {
            console.log(err);
            res.status(400).send();
        }
    })
}

export function InfoLevelBattle(router: Router) {
    router.post("/pve/info_level", middleWare, async (req: any, res) => {
        if (!req.idUser) {
            res.status(403).send();
            return;
        }
        try {
            const payload = req.body.payload;
            const level = payload.level;
            const db = await Database.getInstance().getDb();
            const level_config = db.collection("level_config");
            const listPetConfig = db.collection('pets_config');
            const listpet = await listPetConfig.find({}, { projection: { _id: 0 } }).toArray();
            let infoLevel = await level_config.findOne({ level: level }) as any;
            infoLevel.teamboss = [listpet[Math.floor(Math.random() * listpet.length)], listpet[Math.floor(Math.random() * listpet.length)], listpet[Math.floor(Math.random() * listpet.length)]];
            if (infoLevel) {
                const dataSend = {
                    payload: {
                        infoLevel: infoLevel
                    }
                }
                res.status(200).send(JSON.stringify(dataSend));
            }
            else {
                const data = {
                    payload: {
                        success: false
                    }
                }
                res.status(403).send(JSON.stringify(data));
            }
        } catch (error) {
            const data = {
                payload: {
                    success: false
                }
            }
            console.log(error)
            res.status(403).send(JSON.stringify(data));
        }
    })
}