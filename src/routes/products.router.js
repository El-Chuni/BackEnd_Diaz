import { Router } from "express";
import multer from "multer";
import ProductManager, {Product} from "../ProductManager.js";
import { addProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../Dao/DB/products.service.js";

//Se define el router
const router = Router();

//Se define el manager de productos (En ingles esta vez debido
//a las condiciones de la última entrega)
const productManager = new ProductManager();

//Aplicamos el multer para que luego se puedan subir arrays en /post y /put
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Carga y muestra los productos
router.get('/get', async (req,res) => {
    console.log("Loading products...");
    
    const products = await getProducts();
    console.log(products);
    res.send(products)

    /*console.log(productManager.getProducts());
    res.send(productManager.getProducts());*/
})

//Lo mismo que /get pero con socket.io
router.get('/', async (req,res) => {
    const products = await getProducts();
    res.render('home', {products: products})

    //res.render('home',{products: productManager.getProducts()});
})


//Carga y muestra un producto en particular
router.get('/get/:pid', async (req, res) => {
    let pid = parseInt(req.params.pid);
    let productFound = await getProductById(pid);
    //let productFound = productManager.getProductById(pid);
    
    //Esta condicional pregunta si se encontró el producto en el array
    //Si se encontró, lo muestra.
    //Caso contrario, manda error 404 (No encontrado) http.cat/404
    productFound ? res.send(productFound) : res.status(404).send({status: "Error", message: "The product doesn't exist, use GET to check the inventory."});
})

//Añade un producto al array
router.post('/post', upload.array(), async (req,res) => {
    const product = req.body;
    try {
        await addProduct(product);
        //productManager.addProduct(product);
        //socket.emit('newProduct', { products: productManager.getProducts() });
        
        const products = await getProducts();
        res.send(products)
        //res.send(productManager.getProducts());
    } catch (error) {
        res.status(400).send({status: "Error", message: error.message});
    };

    
})

//Se borra un producto especifico por ID
router.delete('/delete/:pid', async (req,res) => {
    let pid = parseInt(req.params.pid);

    //Se verifica si existe y lo borra, sino manda error.
    try {
        await deleteProduct(pid);
        //productManager.deleteProduct(pid);
        //socket.emit('deleteProduct', { products: productManager.getProducts() });
        res.send("Product deleted.");
    } catch (error) {
        res.status(404).send({status: "Error", message: error.message});
    }
})

//Se actualiza un producto por ID
router.put('/put/:pid', upload.array(), async (req,res) =>{
    let pid = parseInt(req.params.pid);
    let productUpdate = req.body;

    //Se verifica su existencia y lo actualiza, sino avisa del error.
    try {
        await updateProduct(pid, productUpdate)
        //productManager.updateProduct(pid, productUpdate);

        const products = await getProducts();
        res.send(products)
        //res.send(productManager.getProducts());
    } catch (error) {
        res.status(404).send({status: "Error", message: error.message});
    }
})

export default router;