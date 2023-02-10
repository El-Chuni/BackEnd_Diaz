import { Router } from "express";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

let carts = [];

router.get('/get', (req,res) => {
    console.log("Loading carts...");
    console.log(carts);
    res.send(carts);
})

router.get('/get/:cid', (req, res) => {
    let cid = parseInt(req.params.cid);
    let cartFound = carts.find(cart => cart.id === cid);

    cartFound ? res.send(cartFound) : res.status(404).send({status: "Error", message: "The cart doesn't exist, use GET to check the inventory."});
})

router.post('/post', upload.array(), (req,res) => {
    let products = req.body; 
    
    let id = Math.floor(Math.random()*1000+1);
    while (carts.find((cart) => cart.id === id)){
        id = Math.floor(Math.random()*1000+1);
    }

    let cart = {
        id: id,
        products: products
    };

    carts.push(cart);
    console.log(carts);
    res.send(carts);
})

router.post('/post/:cid/product/:pid', (req,res) => {
    let cid = parseInt(req.params.cid);
    let pid = parseInt(req.params.pid);
    let quantity = parseInt(req.query.quantity);

    

    //Se verifica la existencia del producto en el carrito
    let cartFound = carts.find(cart => cart.id === cid);

    if (cartFound){
        //Ahora hacemos lo mismo buscando si existe en producto en el carrito
        let productFound = cartFound.find(product => product.id === pid);

        if(!productFound){
            //Si no existe, añadimos el producto
            let product = {
                id: pid,
                quantity: 1,
            }

            cartFound.products.push(product);
        }else{
            //Caso contrario, le sumamos uno.
            productFound.quantity++;
            cartFound = cartFound.map(product => {
                if (product.id === pid) {
                    return {...productFound};
                }
                return product;
            });
        }

        //Actualizamos el carrito
        carts = carts.map(cart => {
            if (cart.id === cid) {
                return {...cartFound};
            }
            return cart;
        })

    }else{

        res.status(404).send({status: "Error", message: "The cart doesn't exist, use GET to check the inventory."});
    
    }

    console.log(cartFound);
    res.send(cartFound);
})

export default router;