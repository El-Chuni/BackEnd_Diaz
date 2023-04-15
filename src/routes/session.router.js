import { Router } from "express";

const router = Router();

router.get('/current', async (req,res) => {
    req.session.user ? res.send(`Bienvenido a la sesión, ${req.session.user.name}`) : res.send(`No está conectado para ver cierto mensaje.`);
});

export default router;