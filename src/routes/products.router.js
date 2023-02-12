import { Router } from "express";
import multer from "multer";

//Se define el router
const router = Router();

//Aplicamos el multer para que luego se puedan subir arrays en /post y /put
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Hago una lista de productos ya predefinida con un producto, así muestra un ejemplo en el /get desde el principio
let products = [{"title":"La mano arriba","description":"cintura sola","price":15,"thumbnail":"la media vuelta","code":"DANZA KUDURO","stock":2,"id":1,"status": true, "category": "test"}];

//Carga y muestra los productos
router.get('/get', (req,res) => {
    console.log("Loading products...");
    console.log(products);
    res.send(products);
})


//Carga y muestra un producto en particular
router.get('/get/:pid', (req, res) => {
    let pid = parseInt(req.params.pid);
    let productFound = products.find(product => product.id === pid);
    
    //Esta condicional pregunta si se encontró el producto en el array
    //Si se encontró, lo muestra.
    //Caso contrario, manda error 404 (No encontrado) http.cat/404
    productFound ? res.send(productFound) : res.status(404).send({status: "Error", message: "The product doesn't exist, use GET to check the inventory."});
})

//Añade un producto al array
router.post('/post', upload.array(), (req,res) => {
    let product = req.body; 

    //Se hace esto para evitar que se repita el ID
    //Se genera una y otra vez hasta que se vuelva único
    product.id = Math.floor(Math.random()*1000+1);
    while (products.find((existingProduct) => existingProduct.id === product.id)){
        product.id = Math.floor(Math.random()*1000+1);
    }

    //Se revisa cada parte del producto para ver si tiene el formato valido
    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category) {
        //Si el producto está mal, se rechaza.
        //http.cat/400
        console.error("Invalid product, check it and try again.");
        console.error(product);
        res.status(400).send({status: "Error", message: "Invalid product, check it and try again."});
    }else{
        //Si resulta que ya existe, no se acepta y avisa que si quiere actualizar que use /put
        //http.cat/406
        let productFound = products.find(existingProduct => existingProduct.code === product.code);
        if (productFound){
            return res.status(406).send({status: "Error", message: "The product already exists, if you want to update it use PUT instead."});
        }

        //En caso de que alguien haya hecho el array con status lo vuelve true pero sino se le crea uno.
        if (!product.status){
            const status = true;
            product.push(status);
        }else{
            product.status = true;
        }

        products.push(product);
        console.log(products);
        res.send(products);
    }
})

//Se borra un producto especifico por ID
router.delete('/delete/:pid', (req,res) => {
    let pid = parseInt(req.params.pid);

    let productFound = products.find((product) => product.id === pid);

    //Se pregunta si existe.
    if (productFound){
        //Si existe, se hace un filtro para quitarlo
        products = products.filter(product => product.id !== pid);

        console.log("Product deleted.")
        res.send("Product deleted.");
    }else{
        //Sino, se avisa que no fue hallado.
        console.error("Product not found or already deleted.")
        res.status(404).send({status: "Error", message: "Product not found or already deleted."});
    }
})

//Se actualiza un producto por ID
router.put('/put/:pid', upload.array(), (req,res) =>{
    let pid = parseInt(req.params.pid);
    let productUpdate = req.body;
    let productFound = products.find((product) => product.id === pid);

    //Se pregunta si existe.
    if (productFound){
        //Si existe, se actualiza con un map que solo reemplaza el que tiene la ID
        products = products.map(product => {
            if (product.id === pid) {
                return { ...product, ...productUpdate };
            }    
            return product;
        })
    }else{
        //Sino, se avisa que no existe.
        res.status(404).send({status: "Error", message: "The product doesn't exist, use GET to check the inventory."});
    }
    
    res.send(products);
})

export default router;