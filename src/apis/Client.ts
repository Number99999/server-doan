import { Router } from 'express';
import Database from '../database';

const timeRemainPerBattery = 10 * 60 // in second

export function GetInfoInHome(router: Router) {
    router.get("/client/home", async (req: any, res) => {

    })
}

// export function 