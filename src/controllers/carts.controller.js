import config from "../config/config.js";
import { getCarts, getCartById, addCart, updateCart, deleteCart, removeFromCart, replaceCartContent, updateCartProductStock } from "../Dao/DB/carts.service.js";
import CartManager from "../Dao/FileSystem/carts.service.js";
import { getProductById, updateProduct } from "../Dao/DB/products.service.js";
import ProductManager from "../Dao/FileSystem/products.service.js";
import { addTicket } from "../Dao/DB/tickets.service.js";
import { sendTicketByEmail } from "./email.controller.js";

//Carga y muestra cada carrito
export const getAllCarts = async (req,res) => {
    console.log("Loading carts...");

    let carts = config.useFS ? await CartManager.getAllCarts() : await getCarts();
    
    console.log(carts);
    res.send(carts);
};

//Carga un carrito en especifico.
export const getACartById = async (req, res) => {
    //FS y Mongo tienen forma distintas de clasificar el carrito, así que 
    let cartFound;
    let cid =  req.params.cid;

    if (!config.useFS){
        cartFound = await getCartById(cid);
    }else{
        cartFound = CartManager.getCartById(cid);
    }

    //Esta condicional pregunta si se encontró el carrito en el array
    //Si se encontró, lo muestra.
    //Caso contrario, manda error 404 (No encontrado) http.cat/404
    cartFound ? res.send(cartFound) : res.status(404).send({status: "Error", message: "The cart doesn't exist, use the normal GET to check the inventory."});
}

//Añade un carrito al array.
export const addACart = async (req,res) => {
    let products = req.body; 
    let newCart;

    try{
        if (!config.useFS) {
            let cart = {
                products: [...products]
            };

            newCart = await addCart(cart);
        }else{
            newCart = await CartManager.addCart({ products });
        }

        console.log('Cart created:', newCart);
        res.send(newCart);
    } catch (error) {
        console.error('Error creating cart:', error);
        res.status(500).send('Error creating cart');
    }
}

//Se añade un producto especifico a un carrito especifico.
export const updateProductInCart = async (req,res) => {
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
}

//Limpiamos el carrito y ponemos otros productos en su lugar
export const cleanCart = async (req, res) => {
    let cid = req.params.cid;
    let products = req.body; 
    let updatedCart;

    try {
        
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
}

//Se actualiza el stock de un producto del carrito con el que le ingresamos
export const updateCartProductQuantity = async (req, res) => {
    let cid = req.params.cid;
    let pid = req.params.pid;
    let stock = req.body;  
    let updatedCart;

    try {
        if (!config.useFS) {
            await updateCartProductStock(cid, pid, stock);
            updatedCart = await getCartById(cid);
        }else{
            await CartManager.updateProductStock(cid, pid, stock);
            updatedCart = await CartManager.getCartById(cid);
        }

        res.send(updatedCart);
    } catch (error) {
        console.error(`Error updating product stock for cart ${cid} and product ${pid}:`, error);
        res.status(500).send('Error updating product stock');
    }
}

//Quitamos un producto del carrito (incluyendo su stock)
export const removeProductFromCart = async (req, res) => {
    let cid = req.params.cid;
    let pid = req.params.pid;
    let carts;

    try {
        
        if (!config.useFS) {
            await removeFromCart(cid,pid);
            carts = await getCarts();
        } else {
            await CartManager.removeProduct(cid, pid);
            carts = await CartManager.getAllCarts();
        }
        
        res.send(carts);
    } catch (error) {
        console.error(`Error removing product ${pid} from cart ${cid}:`, error);
        res.status(500).send('Error removing product from cart');
    }
}

//Quitamos el carrito, así de simple.
export const eliminateCart = async (req, res) => {
    let cid = req.params.cid;
    let carts;

    try {
        if (!config.useFS) {
            await deleteCart(cid);

            carts = await getCarts();
        } else {
            await CartManager.deleteCart(cid);
            carts = await CartManager.getAllCarts();
        }
            
        res.send(carts);
    } catch (error) {
        console.error(`Error deleting cart ${cid}:`, error);
        res.status(500).send('Error deleting cart');
    }
}

//Se termina la compra y se envía el ticket.
export const purchaseCartContent = async (req, res) => {
    let cid = req.params.cid;
    let totalAmount = 0;
    let buyingProducts = [];

    if (!config.useFS){
        const cart = await getCartById(cid);
        for (const item of cart.products) {
            const product = await getProductById(item.product);
            if (product.stock < item.quantity) {
                console.log(`There isn't enough stock of ${product.title} to buy`)
            }else{
                let newStock = product.stock - item.quantity;
                await updateProduct(item.product, { stock: newStock });
                totalAmount += (item.quantity * product.price);
                buyingProducts.push({
                    product: item.product,
                    quantity: item.quantity
                });
                await removeFromCart(cid, item.product);
            }
        }
    }else{
        const cart = CartManager.getCartById(cid);
        for (const item of cart.products) {
            const product = ProductManager.getProductById(item.product);
            if (product.stock < item.quantity) {
                console.log(`There isn't enough stock of ${product.title} to buy`)
            }else{
                let newStock = product.stock - item.quantity;
                ProductManager.updateProduct(item.product, { stock: newStock });
                totalAmount += (item.quantity * product.price);
                buyingProducts.push({
                    product: item.product,
                    quantity: item.quantity
                });
                ProductManager.removeFromCart(cid, item.product);
            }
        }
    }

    const ticket = await addTicket({
        products: buyingProducts,
        amount: totalAmount,
        purchaser: req.session.email,
    });
    await sendTicketByEmail(ticket._id, req.session.email);
      
    
    if (!config.useFS){
        let updateCart = await getCartById(cid);
        res.send(updateCart);
    }else{
        res.send(CartManager.getCartById(cid));
    }
};