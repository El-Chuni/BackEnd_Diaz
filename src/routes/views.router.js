import { Router } from "express";
import ProductManager from "../ProductManager.js";
import { Server } from "socket.io";

const productManager = new ProductManager();

const router = Router();

const socketServer = new Server();

router.get('/', (req,res) => {
    res.render('views',{products: productManager.getProducts()});
})

socketServer.on('connection', (socket) => {
    console.log('New socket connection');

    socket.on('views', (data) => {
        console.log(`Received data: ${data}`);

        socketServer.emit('updateViews', { products: productManager.getProducts() });
    });

    socket.emit('updateViews', { products: productManager.getProducts() })
});

export default router;