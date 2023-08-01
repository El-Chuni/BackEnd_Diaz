import express from 'express';
//import passport from 'passport';
import { getMessages } from '../Dao/DB/messages.service.js';
import { ensureUser } from '../utils.js';

const router = express.Router();

router.get("/", ensureUser, async (req, res)=>{
    const messages = await getMessages();
    const adminView = false;
    res.render("chat", { messages, adminView });
});

router.get("/adminview", async (req, res)=>{
    const messages = await getMessages();
    const adminView = true;
    res.render("chat", { messages, adminView });
});


export default router;