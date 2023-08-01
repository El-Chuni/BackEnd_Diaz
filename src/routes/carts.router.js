import { Router } from "express";
import multer from "multer";
import passport from "passport";
import { addACart, cleanCart, eliminateCart, getACartById, getAllCarts, purchaseCartContent, removeProductFromCart, updateCartProductQuantity, updateProductInCart } from "../controllers/carts.controller.js";
import customError from "../controllers/error.controller.js";

//Se define el router
const router = Router();

//Aplicamos el multer para que luego se puedan subir arrays en /post y /put
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Un aviso si la autentificación falla en ciertas funciones
router.get('/forbidden', async (req,res) => {
    res.send("No estás autorizado para ejecutar cambios acá.");
    customError(401, "No estás autorizado para ejecutar cambios acá.");
})

//Carga y muestra cada carrito
router.get('/get', getAllCarts)

//Carga un carrito en especifico.
router.get('/get/:cid', getACartById)

//Añade un carrito al array.
router.post('/post', passport.authenticate('onlyUser', { failureRedirect: '/api/carts/forbidden' }), addACart)

//Se añade un producto especifico a un carrito especifico.
router.post('/post/:cid/product/:pid', passport.authenticate('onlyUser', { failureRedirect: '/api/carts/forbidden' }), updateProductInCart)

//Limpiamos el carrito y ponemos otros productos en su lugar
router.put('/put/:cid', passport.authenticate('onlyUser', { failureRedirect: '/api/carts/forbidden' }), cleanCart)

//Se actualiza el stock de un producto del carrito con el que le ingresamos
router.put('/put/:cid/products/:pid', passport.authenticate('onlyUser', { failureRedirect: '/api/carts/forbidden' }), updateCartProductQuantity)

//Quitamos un producto del carrito (incluyendo su stock)
router.delete('/delete/:cid/products/:pid', passport.authenticate('onlyUser', { failureRedirect: '/api/carts/forbidden' }), removeProductFromCart)

//Quitamos el carrito, así de simple.
router.delete('/delete/:cid', passport.authenticate('onlyUser', { failureRedirect: '/api/carts/forbidden' }), eliminateCart)

//Se termina la compra y se envía el ticket.
router.post('/:cid/purchase', purchaseCartContent);

export default router;