import config from "../config/config.js";
import ProductManager from "../Dao/FileSystem/products.service.js";
import { addProduct, deleteProduct, getProductById, getProducts, getProductsByParams, updateProduct } from "../Dao/DB/products.service.js";
import customError from "./error.controller.js";

//Se define el manager de productos 
const productManager = new ProductManager();

//Carga y muestra los productos
export const getProductsByParameters = async (req, res) => {
  if (!config.useFS) {
    let limit = parseInt(req.query.limit);
    let page = parseInt(req.query.page);
    let query = req.query.query || '';
    let sort = req.query.sort || null;
    console.log("Loading products...");
    let products = await getProductsByParams(limit, page, query, sort);
    console.log(products);
    products ? res.send(products) : customError(404,"No se encontraron productos");
    //products ? res.send(products) : res.status(404).send({status: "Error", message: "No se encontraron productos"});
  } else {
    res.send("Opción no disponible en FS.")
  }
}

//Lo mismo que /get pero con socket.io
export const getProductsList = async (req, res) => {
  if (!config.useFS) {
    let products = await getProducts();
    res.render('home', {products: products})
  } else {
    res.render('home',{products: productManager.getProducts()});
  }
}


//Carga y muestra un producto en particular
export const getAProductById = async (req, res) => {
    let pid = parseInt(req.params.pid);
    let productFound = config.useFS ? productManager.getProductById(pid) : await getProductById(pid);
  
    //Esta condicional pregunta si se encontró el producto en el array
    //Si se encontró, lo muestra.
    //Caso contrario, manda error 404 (No encontrado) http.cat/404
    
    
    productFound ? res.send(productFound) : customError(404, "The product doesn't exist, use GET to check the inventory.");
    //productFound ? res.send(productFound) : res.status(404).send({status: "Error", message: "The product doesn't exist, use GET to check the inventory."});
}

//Añade un producto al array
export const addAProduct = async (req, res) => {
  const product = req.body;

  //Se añade al creador del producto. 
  const owner = req.session.user.email;
  if (owner != config.adminName){
    product.owner = owner;
  }
  

  try {
    if (!config.useFS){
      await addProduct(product);
      let products = await getProducts();
      res.send(products)
    } else {
      productManager.addProduct(product);
      socket.emit('newProduct', { products: productManager.getProducts() });
      res.send(productManager.getProducts());
    }
  } catch (error) {
    customError(400, error.message);
    //res.status(400).send({status: "Error", message: error.message});
  };
}
 
//Se borra un producto especifico por ID
export const deleteAProduct = async (req, res) => {
    let pid = parseInt(req.params.pid);

    //Se hace un chequeo extra para ver si es un usuario autorizado para este producto en especifico
    const userMail = req.session.user.email;
    const product = config.useFS ? productManager.getProductById(pid) : await getProductById(pid);
    if (userMail != product.owner || userMail != config.adminName){
      customError(401, "You are neither the owner or an admin to do this.")
    }

    //Se verifica si existe y lo borra, sino manda error.
    try {
      config.useFS ? productManager.deleteProduct(pid) : await deleteProduct(pid);
 
      res.send("Product deleted.");
    } catch (error) {
      customError(404, error.message);
      //res.status(404).send({status: "Error", message: error.message});
    }
}

//Se actualiza un producto por ID
export const updateAProduct = async (req,res) =>{
    let pid = parseInt(req.params.pid);
    let productUpdate = req.body;

    //Se verifica su existencia y lo actualiza, sino avisa del error.
    try {
      if (!config.useFS){
          await updateProduct(pid, productUpdate)

          let products = await getProducts();

          res.send(products)
      }else{
          productManager.updateProduct(pid, productUpdate);

          res.send(productManager.getProducts());
      }
    } catch (error) {
      customError(404, error.message)
      //res.status(404).send({status: "Error", message: error.message});
    }
}