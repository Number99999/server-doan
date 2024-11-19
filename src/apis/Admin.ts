import { Router } from 'express';
import Database from '../database';

const timeRemainPerBattery = 10 * 60 // in second

export function AddNews(router: Router) {
    router.post("/admin/add", async (req: any, res) => {

    })
}

export function DeleteNew(router: Router) {
    router.post("/admin/delete", async (req: any, res) => {

    })
}

export function Update(router: Router) {
    router.post("/admin/update", async (req: any, res) => {

    })
}
