import { Router } from "express";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

let products = [{"title":"La mano arriba","description":"cintura sola","price":15,"thumbnail":"la media vuelta","code":"DANZA KUDURO","stock":2,"id":1,"status": true, "category": "test"}];

router.get('/get', (req,res) => {
    console.log("Loading products...");
    console.log(products);
    res.send(products);
})

router.get('/get/:pid', (req, res) => {
    let pid = parseInt(req.params.pid);
    let productFound = products.find(product => product.id === pid);
    
    productFound ? res.send(productFound) : res.status(404).send({status: "Error", message: "The product doesn't exist, use GET to check the inventory."});
})

router.post('/post', upload.array(), (req,res) => {
    let product = req.body; 

    product.id = Math.floor(Math.random()*1000+1);
    while (products.find((existingProduct) => existingProduct.id === product.id)){
        product.id = Math.floor(Math.random()*1000+1);
    }

    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category) {
        console.error("Invalid product, check it and try again.");
        console.error(product);
        res.status(400).send({status: "Error", message: "Invalid product, check it and try again."});
    }else{
        let productFound = products.find(existingProduct => existingProduct.code === product.code);
        if (productFound){
            return res.status(406).send({status: "Error", message: "The product already exists, if you want to update it use PUT instead."});
        }

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

router.delete('/delete/:pid', (req,res) => {
    let pid = parseInt(req.params.pid);

    let productFound = products.find((product) => product.id === pid);

    if (productFound){
        products = products.filter(product => product.id !== pid);

        console.log("Product deleted.")
        res.send("Product deleted.");
    }else{
        console.error("not found or already deleted.")
        res.send("Not found or already deleted.");
    }
})

router.put('/put/:pid', upload.array(), (req,res) =>{
    let pid = parseInt(req.params.pid);
    let productUpdate = req.body;
    let productFound = products.find((product) => product.id === pid);

    if (productFound){
        products = products.map(product => {
            if (product.id === pid) {
                return { ...product, ...productUpdate };
            }    
            return product;
        })
    }else{
        res.status(404).send({status: "Error", message: "The product doesn't exist, use GET to check the inventory."});
    }
    
    res.send(products);
})

export default router;