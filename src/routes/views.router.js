import { Router } from "express";
import ProductManager from "../ProductManager.js";
import { Server } from "socket.io";

const productManager = new ProductManager();

const router = Router();

router.get('/', (req,res) => {
    res.render('views',{products: productManager.getProducts()});
})

export default router;