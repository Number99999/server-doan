// @ts-ignore
import express, { NextFunction, Router } from "express";
import { AddNews, DeleteNew, GetAllNews, GetNews, UpdateNews } from "./Admin";
import { GetByNewsType, GetInfoInHome, GetInfoNews } from "./Client";

const router = express.Router();

AddNews(router);
GetInfoInHome(router);
GetByNewsType(router);
DeleteNew(router);
GetNews(router);
GetAllNews(router);
GetInfoNews(router);
UpdateNews(router);
DeleteNew(router);
export default router;
