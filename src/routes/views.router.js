import { Router } from "express";
import { getCartById } from "../Dao/DB/carts.service.js";
import { productModel } from "../Dao/DB/models/products.js";
import ProductManager from "../ProductManager.js";
import { addACart } from "../controllers/carts.controller.js";


const productManager = new ProductManager();

const router = Router();

//Esta es la vista normal que usa filesystem para un desafío previo a la segunda pre-entrega
router.get('/', (req,res) => {
  res.render('views',{products: productManager.getProducts()});
})

//Esta es para mostrar los productos con mongoDB pero extendido
//Originalmente e planeaba usar cierta función de service (que de hecho funciona)
//pero su estructura no funcionaba acá porque Handlebars no lo leía, así que
//hice un paginate directo.
router.get('/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  const content = await productModel.paginate({}, { page, limit, lean: true });
  const prevLink = content.hasPrevPage ? `/views/products?page=${content.prevPage}` : '';
  const nextLink = content.hasNextPage ? `/views/products?page=${content.nextPage}` : '';
  const isValid = !(page <= 0 || page > content.totalPages);
  
  const user = req.session.user;
  const userCartId = user && user.cart ? user.cart : null;

  let cartLink = '';
  if (userCartId) {
    cartLink = `/views/carts/${userCartId}`;
  }


  res.render('productsView', { ...content, prevLink, nextLink, isValid, user, cartLink });
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