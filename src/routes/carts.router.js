import { Router } from "express";
import multer from "multer";
import { getCarts, getCartById, addCart, updateCart, deleteCart } from "../Dao/DB/carts.service.js";

//Se define el router
const router = Router();

//Aplicamos el multer para que luego se puedan subir arrays en /post y /put
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Se define el array de carritos (Comienza vacío en este caso)
//Edit: Debido a la implementación de MongoDB, este array en particular fue suspendido hasta que se defina todo el FileSystem
//let carts = [];

//Carga y muestra cada carrito
router.get('/get', async (req,res) => {
    console.log("Loading carts...");
    
    const carts = await getCarts();
    
    console.log(carts);
    res.send(carts);
})

//Carga un carrito en especifico.
router.get('/get/:cid', async (req, res) => {
    let cid = parseInt(req.params.cid);

    let cartFound = await getCartById(cid);
    //let cartFound = carts.find(cart => cart.id === cid);

    //Esta condicional pregunta si se encontró el carrito en el array
    //Si se encontró, lo muestra.
    //Caso contrario, manda error 404 (No encontrado) http.cat/404
    cartFound ? res.send(cartFound) : res.status(404).send({status: "Error", message: "The cart doesn't exist, use GET to check the inventory."});
})

//Añade un carrito al array.
router.post('/post', upload.array(), async (req,res) => {
    let products = req.body; 
    const carts = await getCarts();
    //Se hace esto para evitar que se repita el ID
    //Se genera una y otra vez hasta que se vuelva único
    let id = Math.floor(Math.random()*1000+1);
    while (carts.find((cart) => cart.id === id)){
        id = Math.floor(Math.random()*1000+1);
    }

    //Se define el carrito con un ID y un array con los productos que lleva
    let cart = {
        id: id,
        products: [...products]
    };

    //carts.push(cart);
    await addCart(cart);
    console.log(carts);
    res.send(carts);
})

//Se añade un producto especifico a un carrito especifico.
router.post('/post/:cid/product/:pid', async (req,res) => {
    let cid = parseInt(req.params.cid);
    let pid = parseInt(req.params.pid);
    //Este quantity solo existe de testeo, no vamos a usarlo de verdad
    let quantity = parseInt(req.query.quantity);

    const carts = await getCarts();    

    //Se verifica la existencia del producto en el carrito
    let cartFound = carts.find(cart => cart.id === cid);

    if (cartFound){
        //Ahora hacemos lo mismo buscando si existe en producto en el carrito
        let productFound = cartFound.products.find(product => product.id === pid);

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
            cartFound = {
                ...cartFound,
                products: cartFound.products.map(product => product.id === pid ? productFound : product)
              };
        }

        //Actualizamos el carrito
        await updateCart(cid, cartFound)
        /*carts = carts.map(cart => {
            if (cart.id === cid) {
                return {...cartFound};
            }
            return cart;
        })*/

    }else{

        //Como el carrito no exista, lo avisamos.
        res.status(404).send({status: "Error", message: "The cart doesn't exist, use GET to check the inventory."});
    
    }

    console.log(cartFound);
    res.send(cartFound);
})

export default router;