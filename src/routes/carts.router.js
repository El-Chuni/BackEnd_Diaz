import { Router } from "express";
import multer from "multer";
import config from "../config/config.js";
import { getCarts, getCartById, addCart, updateCart, deleteCart, removeFromCart, replaceCartContent, updateCartProductStock } from "../Dao/DB/carts.service.js";
import CartManager from "../Dao/FileSystem/carts.service.js";
//Se define el router
const router = Router();

//Aplicamos el multer para que luego se puedan subir arrays en /post y /put
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Carga y muestra cada carrito
router.get('/get', async (req,res) => {
    console.log("Loading carts...");

    let carts = config.useFS ? await CartManager.getAllCarts() : await getCarts();
    
    console.log(carts);
    res.send(carts);
})

//Carga un carrito en especifico.
router.get('/get/:cid', async (req, res) => {
    //FS y Mongo tienen forma distintas de clasificar el carrito, así que 
    let cartFound;
    let cid =  req.params.cid;

    if (!config.useFS){
        cartFound = await getCartById(cid);
    }else{
        cartFound = await CartManager.getCartById(cid);
    }

    //Esta condicional pregunta si se encontró el carrito en el array
    //Si se encontró, lo muestra.
    //Caso contrario, manda error 404 (No encontrado) http.cat/404
    cartFound ? res.send(cartFound) : res.status(404).send({status: "Error", message: "The cart doesn't exist, use the normal GET to check the inventory."});
})

//Añade un carrito al array.
router.post('/post', upload.array(), async (req,res) => {
    let products = req.body; 

    try{
        if (!config.useFS) {
            let cart = {
                products: [...products]
            };

            const newCart = await addCart(cart);
        }else{
            const newCart = await CartManager.addCart({ products });
        }

        console.log('Cart created:', newCart);
        res.send(newCart);
    } catch (error) {
        console.error('Error creating cart:', error);
        res.status(500).send('Error creating cart');
    }
})

//Se añade un producto especifico a un carrito especifico.
router.post('/post/:cid/product/:pid', async (req,res) => {
    let cid = req.params.cid;
    let pid = req.params.pid;

    const carts = config.useFS ? await CartManager.getAllCarts() : await getCarts();    
    

    //Se verifica la existencia del producto en el carrito
    let cartFound = carts.find(cart => cart.id === cid);

    if (cartFound){
        //Ahora hacemos lo mismo buscando si existe en producto en el carrito
        let productFound = cartFound.products.find(product => product.id === pid);

        if (!productFound) {
            // Si no existe, lo añadimos
            let product = {
              id: pid,
              stock: 1,
            };
            cartFound.products.push(product);
          } else {
            // Si existe, le sumamos uno a su stock
            productFound.stock++;
          }
        
          // Actualizamos el carrito en la base de datos
        config.useFS ? CartManager.updateCart(cartFound.id, cartFound) : await updateCart(cartFound.id, cartFound);
    }else{

        //Como el carrito no exista, lo avisamos.
        res.status(404).send({status: "Error", message: "The cart doesn't exist, use GET to check the inventory."});
    
    }

    console.log(cartFound);
    res.send(cartFound);
})

//Limpiamos el carrito y ponemos otros productos en su lugar
router.put('/put/:cid', async (req, res) => {
    let cid = req.params.cid;
    let products = req.body; 

    try {
        let updatedCart;
        if (config.useFS) {
            await replaceCartContent(cid, products);
            updatedCart = await getCartById(cid);
        } else {
            updatedCart = await CartManager.updateCart(cid, { products });
        }
    
        res.send(updatedCart);
      } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).send('Error updating cart');
      }
})

//Se actualiza el stock de un producto del carrito con el que le ingresamos
router.put('/put/:cid/products/:pid', async (req, res) => {
    let cid = req.params.cid;
    let pid = req.params.pid;
    let stock = req.body;  

    try {
        if (!config.useFS) {
            await updateCartProductStock(cid, pid, stock);
            let updatedCart = await getCartById(cid);
        }else{
            await CartManager.updateProductStock(cid, pid, stock);
            let updatedCart = await CartManager.getCartById(cid);
        }

        res.send(updatedCart);
    } catch (error) {
        console.error(`Error updating product stock for cart ${cid} and product ${pid}:`, error);
        res.status(500).send('Error updating product stock');
    }
})

//Quitamos un producto del carrito (incluyendo su stock)
router.delete('/delete/:cid/products/:pid', async (req, res) => {
    let cid = req.params.cid;
    let pid = req.params.pid;

    try {
        if (!config.useFS) {
            await removeFromCart(cid,pid);
            let carts = await getCarts();
        } else {
            await CartManager.removeProduct(cid, pid);
            let carts = await CartManager.getAllCarts();
        }
        
        res.send(carts);
    } catch (error) {
        console.error(`Error removing product ${pid} from cart ${cid}:`, error);
        res.status(500).send('Error removing product from cart');
    }
})

//Quitamos el carrito, así de simple.
router.delete('/delete/:cid', async (req, res) => {
    let cid = req.params.cid;
    
    try {
        if (!config.useFS) {
            await deleteCart(cid);

            let carts = await getCarts();
        } else {
            await CartManager.deleteCart(cid);
            let carts = await CartManager.getAllCarts();
        }
            
        res.send(carts);
    } catch (error) {
        console.error(`Error deleting cart ${cid}:`, error);
        res.status(500).send('Error deleting cart');
    }
})

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