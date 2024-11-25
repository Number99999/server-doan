import { Router } from 'express';
import Database from '../database';
import { ObjectId } from 'mongodb';

export function AddNews(router: Router) {
    router.post('/admin/add', async (req, res) => {
        try {
            const { title, content, urlImg, timeUp, typeNews } = req.body;

            if (!title || !content || !urlImg || !typeNews) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const dbInstance = Database.getInstance();
            const db = await dbInstance.getDb();
            const newsCollection = db.collection("news");

            const newNews = {
                title,
                content,
                urlImg,
                timeUp: timeUp,
                typeNews,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await newsCollection.insertOne(newNews);

            res.status(201).json({
                message: "News added successfully",
                newsId: result.insertedId,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    })
}

export function GetNews(router: Router) {
    router.get("/admin/news", async (req, res) => {
        const dbInstance = Database.getInstance();
        const db = await dbInstance.getDb();

        try {
            const newsItems = await db.collection("news").find().toArray();
            return res.status(200).json(newsItems);
        } catch (error) {
            console.error("Failed to fetch news:", error);
            return res.status(500).json({ message: "Failed to fetch news" });
        }
    })
}

export function DeleteNew(router: Router) {
    router.delete("/admin/delete/:id", async (req, res) => {
        const { id } = req.params;
        const dbInstance = Database.getInstance();
        const db = await dbInstance.getDb();
        try {
            const result = await db.collection("news").deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: "News not found" });
            }
            return res.status(200).json({ message: "News deleted successfully" });
        } catch (error) {
            console.error("Failed to delete news:", error);
            return res.status(500).json({ message: "Failed to delete news" });
        }
    });

}

export function EditNews(router: Router) {
    router.put("/admin/edit/:id", async (req, res) => {
        const { id } = req.params; // Lấy ID bài viết từ URL
        const { title, content, urlImg, timeUp, typeNews } = req.body;

        try {
            const dbInstance = Database.getInstance();
            const db = await dbInstance.getDb();

            const result = await db.collection("news").updateOne(
                { _id: new ObjectId(id) }, // Tìm bài viết theo ID
                {
                    $set: { title, content, urlImg, timeUp, typeNews }, // Cập nhật dữ liệu
                }
            );

            if (result.modifiedCount === 1) {
                res.status(200).send({ message: "News updated successfully!" });
            } else {
                res.status(404).send({ message: "News not found" });
            }
        } catch (error) {
            console.error("Error updating news:", error);
            res.status(500).send({ message: "Failed to update news" });
        }
    });
}