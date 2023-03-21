import { Router } from "express";
import { getCartById } from "../Dao/DB/carts.service.js";
import { productModel } from "../Dao/DB/models/products.js";
import { getProducts, getProductsByParams} from "../Dao/DB/products.service.js";
import ProductManager from "../ProductManager.js";


const productManager = new ProductManager();

const router = Router();

//Esta es la vista normal que usa filesystem para un desafío previo a la segunda pre-entrega
router.get('/', (req,res) => {
  res.render('views',{products: productManager.getProducts()});
})

//Esta es para mostrar los productos con mongoDB pero extendido
//Originalmente e planeaba usar cierta función de service (que de hecho funciona)
//pero su estructura no funcionaba acá, así que un paginate directo.
router.get('/products', async (req,res) => {
  let page = parseInt(req.query.page);
  if(!page) page=1;

  let contenido = await productModel.paginate({},{page,limit:10,lean:true});
  contenido.prevLink = contenido.hasPrevPage?`http://localhost:9090/products?page=${contenido.prevPage}`:'';
  contenido.nextLink = contenido.hasNextPage?`http://localhost:9090/products?page=${contenido.nextPage}`:'';
  contenido.isValid= !(page<=0||page>contenido.totalPages);
  res.render('productsview',contenido)
  
});


//Esto es para mostrar los productos de un carrito
router.get('/carts/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await getCartById(cid);
    //Debido a un extraño error de handlebars, paso los productos de esta forma:
    const products = cart.products.map(p => {
      return {
        title: p.product.title,
        quantity: p.quantity,
        price: p.product.price,
        stock: p.product.stock,
        total: (p.quantity * p.product.price)
      };
    });
    
    res.render('cart', { cid, products });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error interno del servidor');
  }
});
  

export default router;