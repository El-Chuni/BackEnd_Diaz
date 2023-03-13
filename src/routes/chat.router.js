import express from 'express';
import { addMessage, getMessages } from '../Dao/DB/messages.service.js';

const router = express.Router();

router.get("/", async (req, res)=>{
    const messages = await getMessages();
    res.render("chat", { messages });
});

export default router;