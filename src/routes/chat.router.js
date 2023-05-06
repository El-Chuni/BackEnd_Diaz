import express from 'express';
import { getMessages } from '../Dao/DB/messages.service.js';

const router = express.Router();

router.get("/", passport.authenticate('onlyAdmin', { failureRedirect: '/adminview' }), async (req, res)=>{
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