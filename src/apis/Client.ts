import { request, Router } from 'express';
import Database from '../database';
import { ObjectId } from 'mongodb';

export function GetInfoInHome(router: Router) {
    router.get("/client/home", async (req: any, res) => {
        try {
            const dbInstance = Database.getInstance();
            const db = await dbInstance.getDb();
            const newsCollection = db.collection("news");
            const distinctTypes = await newsCollection.distinct("typeNews");
            const newsSummary = [];

            for (const type of distinctTypes) {
                const newsItem = await newsCollection
                    .find({ typeNews: type })
                    .sort({ timeUp: -1 }) // Sắp xếp theo thời gian (mới nhất)
                    .limit(1)
                    .toArray();

                if (newsItem.length > 0) {
                    const { title, content, timeUp, urlImg } = newsItem[0];
                    newsSummary.push({
                        typeNews: type,
                        title,
                        content,
                        timeUp,
                        urlImg,
                    });
                }
            }

            res.status(200).json(newsSummary);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    })
}


export function GetByNewsType(router: Router) {
    router.get("/client/news/:typeNews", async (req, res) => {
        const { typeNews } = req.params;
        try {
            const dbInstance = Database.getInstance();
            const db = await dbInstance.getDb();
            const newsCollection = db.collection("news");

            const newsItem = await newsCollection
                .find({ typeNews })
                .sort({ timeUp: -1 })
                .toArray();

            if (newsItem.length > 0) {
                res.status(200).json(newsItem);
            } else {
                res.status(404).json({ error: "News not found" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
}

export function GetInfoNews(router: Router) {
    router.get("/client/infor/:id", async (req, res) => {
        const { id } = req.params;
        const dbInstance = Database.getInstance();
        const db = await dbInstance.getDb();
        const newsCollection = db.collection("news");

        const news = await newsCollection.findOne({ _id: new ObjectId(id) });
        if (news) {
            res.status(200).send(JSON.stringify(news));
        }
        else {
            res.status(404).send("can't get news")
        }
    });
}