import { Router } from "express";
import multer from "multer";
import ProductManager, {Product} from "../ProductManager.js";

//Se define el router
const router = Router();

//Se define el manager de productos (En ingles esta vez debido
//a las condiciones de la última entrega)
const productManager = new ProductManager();

//Aplicamos el multer para que luego se puedan subir arrays en /post y /put
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Carga y muestra los productos
router.get('/get', (req,res) => {
    console.log("Loading products...");
    console.log(productManager.getProducts());
    res.send(productManager.getProducts());
})

//Lo mismo que /get pero con socket.io
router.get('/', (req,res) => {
    res.render('home',{products: productManager.getProducts()});
})


//Carga y muestra un producto en particular
router.get('/get/:pid', (req, res) => {
    let pid = parseInt(req.params.pid);
    let productFound = productManager.getProductById(pid);
    
    //Esta condicional pregunta si se encontró el producto en el array
    //Si se encontró, lo muestra.
    //Caso contrario, manda error 404 (No encontrado) http.cat/404
    productFound ? res.send(productFound) : res.status(404).send({status: "Error", message: "The product doesn't exist, use GET to check the inventory."});
})

//Añade un producto al array
router.post('/post', upload.array(), (req,res) => {
    const product = req.body;
    try {
        productManager.addProduct(product);
        res.send(productManager.getProducts());
    } catch (error) {
        res.status(400).send({status: "Error", message: error.message});
    }
})

//Se borra un producto especifico por ID
router.delete('/delete/:pid', (req,res) => {
    let pid = parseInt(req.params.pid);

    //Se verifica si existe y lo borra, sino manda error.
    try {
        productManager.deleteProduct(pid);
        res.send("Product deleted.");
    } catch (error) {
        res.status(404).send({status: "Error", message: error.message});
    }
})

//Se actualiza un producto por ID
router.put('/put/:pid', upload.array(), (req,res) =>{
    let pid = parseInt(req.params.pid);
    let productUpdate = req.body;

    //Se verifica su existencia y lo actualiza, sino avisa del error.
    try {
        productManager.updateProduct(pid, productUpdate);
        res.send(productManager.getProducts());
    } catch (error) {
        res.status(404).send({status: "Error", message: error.message});
    }
})

export default router;