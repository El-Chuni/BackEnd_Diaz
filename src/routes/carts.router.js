import { Router } from "express";
import multer from "multer";
import passport from "passport";
import { addACart, cleanCart, eliminateCart, getACartById, getAllCarts, purchaseCartContent, removeProductFromCart, updateCartProductQuantity, updateProductInCart } from "../controllers/carts.controller.js";

//Se define el router
const router = Router();

//Aplicamos el multer para que luego se puedan subir arrays en /post y /put
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Un aviso si la autentificación falla en ciertas funciones
router.get('/forbidden', async (req,res) => {
    res.send("No estás autorizado para ejecutar cambios acá.")
})

//Carga y muestra cada carrito
router.get('/get', getAllCarts)

//Carga un carrito en especifico.
router.get('/get/:cid', getACartById)

//Añade un carrito al array.
router.post('/post', passport.authenticate('onlyUser', { failureRedirect: '/forbidden' }), upload.array(), addACart)

//Se añade un producto especifico a un carrito especifico.
router.post('/post/:cid/product/:pid', passport.authenticate('onlyUser', { failureRedirect: '/forbidden' }), updateProductInCart)

//Limpiamos el carrito y ponemos otros productos en su lugar
router.put('/put/:cid', passport.authenticate('onlyUser', { failureRedirect: '/forbidden' }), cleanCart)

//Se actualiza el stock de un producto del carrito con el que le ingresamos
router.put('/put/:cid/products/:pid', passport.authenticate('onlyUser', { failureRedirect: '/forbidden' }), updateCartProductQuantity)

//Quitamos un producto del carrito (incluyendo su stock)
router.delete('/delete/:cid/products/:pid', passport.authenticate('onlyUser', { failureRedirect: '/forbidden' }), removeProductFromCart)

//Quitamos el carrito, así de simple.
router.delete('/delete/:cid', passport.authenticate('onlyUser', { failureRedirect: '/forbidden' }), eliminateCart)

//Se termina la compra y se envía el ticket.
router.post('/:cid/purchase', purchaseCartContent);

//
//Acá se usan las variaciones filesystem de las funciones anteriores
//

//Se define el array de carritos para los comandos FS viejos
let fsCarts = [];


//Carga y muestra cada carrito
router.get('/fs/get', (req,res) => {
    console.log("Loading carts...");
    
    console.log(fsCarts);
    res.send(fsCarts);
})

//Carga un carrito en especifico.
router.get('/fs/get/:cid', (req, res) => {
    let cid = parseInt(req.params.cid);

    let cartFound = fsCarts.find(cart => cart.id === cid);

    //Esta condicional pregunta si se encontró el carrito en el array
    //Si se encontró, lo muestra.
    //Caso contrario, manda error 404 (No encontrado) http.cat/404
    cartFound ? res.send(cartFound) : res.status(404).send({status: "Error", message: "The cart doesn't exist, use GET to check the inventory."});
})

//Añade un carrito al array.
router.post('/fs/post', upload.array(), (req,res) => {
    let products = req.body;
    //Se hace esto para evitar que se repita el ID
    //Se genera una y otra vez hasta que se vuelva único
    let id = Math.floor(Math.random()*1000+1);
    while (fsCarts.find((cart) => cart.id === id)){
        id = Math.floor(Math.random()*1000+1);
    }

    //Se define el carrito con un ID y un array con los productos que lleva
    let cart = {
        id: id,
        products: [...products]
    };

    fsCarts.push(cart);
    console.log(fsCarts);
    res.send(fsCarts);
})

//Se añade un producto especifico a un carrito especifico.
router.post('/fs/post/:cid/product/:pid', (req,res) => {
    let cid = parseInt(req.params.cid);
    let pid = parseInt(req.params.pid);
    //Este quantity solo existe de testeo, no vamos a usarlo de verdad
    let quantity = parseInt(req.query.quantity);    

    //Se verifica la existencia del producto en el carrito
    let cartFound = fsCarts.find(cart => cart.id === cid);

    if (cartFound){
        //Ahora hacemos lo mismo buscando si existe en producto en el carrito
        let productFound = cartFound.products.find(product => product.id === pid);

        if(!productFound){
            //Si no existe, añadimos el producto
            let product = {
                id: pid,
                stock: 1,
            }

            cartFound.products.push(product);
        }else{
            //Caso contrario, le sumamos uno.
            productFound.stock++;
            cartFound = {
                ...cartFound,
                products: cartFound.products.map(product => product.id === pid ? productFound : product)
              };
        }

        //Actualizamos el carrito
        fsCarts = fsCarts.map(cart => {
            if (cart.id === cid) {
                return {...cartFound};
            }
            return cart;
        })

    }else{

        //Como el carrito no exista, lo avisamos.
        res.status(404).send({status: "Error", message: "The cart doesn't exist, use GET to check the inventory."});
    
    }

    console.log(cartFound);
    res.send(cartFound);
})

export default router;