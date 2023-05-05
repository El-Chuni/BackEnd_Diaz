import { Router } from "express";

const router = Router();

//La descripción de "evitar información sensible" y "solo con la información
//necesaria" no es suficientemente detallada como para que la función
//actual requiera un cambio, pues solo el nombre tecnicamente cumple ambas
router.get('/current', async (req,res) => {
    req.session.user ? res.send(`Bienvenido a la sesión, ${req.session.user.name}`) : res.send(`No está conectado para ver cierto mensaje.`);
});

export default router;