// @ts-ignore
import express, { NextFunction, Router } from "express";
import { AddNews, DeleteNew, EditNews, GetNews } from "./Admin";
import { GetByNewsType, GetInfoInHome } from "./Client";

const router = express.Router();

AddNews(router);
GetInfoInHome(router);
GetByNewsType(router);
DeleteNew(router);
GetNews(router);
EditNews(router);
export default router;
