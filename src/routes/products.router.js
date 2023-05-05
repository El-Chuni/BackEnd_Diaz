import { Router } from "express";
import multer from "multer";
import config from "../config/config.js";
import passport from "passport";
//import ProductManager, {Product} from "../ProductManager.js";
import ProductManager from "../Dao/FileSystem/products.service.js";
import { addProduct, deleteProduct, getProductById, getProducts, getProductsByParams, updateProduct } from "../Dao/DB/products.service.js";

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
    if (!config.useFS) {
        let limit = parseInt(req.query.limit);
        let page = parseInt(req.query.page);
        let query = req.query.query || ''; //Si no recibe query, el valor predeterminado es un string vacío así no clasifica nada
        let sort = req.query.sort || null; //Si no recibe sort, el valor se vuelve nulo y no se cuenta
    
        console.log("Loading products...");
    
        let products = await getProductsByParams(limit, page, query, sort);
        console.log(products);
        products ? res.send(products) : res.status(404).send({status: "Error", message: "No se encontraron productos"});
    }
})

//Lo mismo que /get pero con socket.io
router.get('/', async (req,res) => {
    let products = await getProducts();
    res.render('home', {products: products})
})

//Un aviso si la autentificación falla en ciertas funciones
router.get('/forbidden', async (req,res) => {
    res.send("No estás autorizado para ejecutar cambios acá.")
})


//Carga y muestra un producto en particular
router.get('/get/:pid', async (req, res) => {
    let pid = parseInt(req.params.pid);
    let productFound = await getProductById(pid);
    
    //Esta condicional pregunta si se encontró el producto en el array
    //Si se encontró, lo muestra.
    //Caso contrario, manda error 404 (No encontrado) http.cat/404
    productFound ? res.send(productFound) : res.status(404).send({status: "Error", message: "The product doesn't exist, use GET to check the inventory."});
})

//Añade un producto al array
router.post('/post', passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), upload.array(), async (req, res) => {
    const product = req.body;
    try {
      await addProduct(product);
      
      let products = await getProducts();
      res.send(products)
    } catch (error) {
      res.status(400).send({status: "Error", message: error.message});
    };
  });
  
//Se borra un producto especifico por ID
router.delete('/delete/:pid', passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), async (req,res) => {
    let pid = parseInt(req.params.pid);

    //Se verifica si existe y lo borra, sino manda error.
    try {
        await deleteProduct(pid);
        res.send("Product deleted.");
    } catch (error) {
        res.status(404).send({status: "Error", message: error.message});
    }
})

//Se actualiza un producto por ID
router.put('/put/:pid', passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), upload.array(), async (req,res) =>{
    let pid = parseInt(req.params.pid);
    let productUpdate = req.body;

    //Se verifica su existencia y lo actualiza, sino avisa del error.
    try {
        await updateProduct(pid, productUpdate)

        let products = await getProducts();
        res.send(products)
    } catch (error) {
        res.status(404).send({status: "Error", message: error.message});
    }
})

//
//Estas son versiones usando un filesystem en su lugar
//

//Carga y muestra los productos
router.get('/fs/get', (req,res) => {
    console.log("Loading products...");
    
    console.log(productManager.getProducts());
    res.send(productManager.getProducts());
})

//Lo mismo que /get pero con socket.io
router.get('/fs/', (req,res) => {
    res.render('home',{products: productManager.getProducts()});
})


//Carga y muestra un producto en particular
router.get('/fs/get/:pid', (req, res) => {
    let pid = parseInt(req.params.pid);
    let productFound = productManager.getProductById(pid);
    
    //Esta condicional pregunta si se encontró el producto en el array
    //Si se encontró, lo muestra.
    //Caso contrario, manda error 404 (No encontrado) http.cat/404
    productFound ? res.send(productFound) : res.status(404).send({status: "Error", message: "The product doesn't exist, use GET to check the inventory."});
})

//Añade un producto al array
router.post('/fs/post', passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), upload.array(), (req,res) => {
    const product = req.body;
    try {
        productManager.addProduct(product);
        socket.emit('newProduct', { products: productManager.getProducts() });
        
        res.send(productManager.getProducts());
    } catch (error) {
        res.status(400).send({status: "Error", message: error.message});
    };

    
})

//Se borra un producto especifico por ID
router.delete('/fs/delete/:pid', passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), (req,res) => {
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
router.put('/fs/put/:pid', passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), upload.array(), (req,res) =>{
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