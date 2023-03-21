import { Router } from "express";
import { getCartById } from "../Dao/DB/carts.service.js";
import { getProducts, getProductsByParams, countProductsByParams } from "../Dao/DB/products.service.js";
import ProductManager from "../ProductManager.js";


const productManager = new ProductManager();

const router = Router();

//Esta es la vista normal que usa filesystem para un desafío previo a la segunda pre-entrega
router.get('/', (req,res) => {
  res.render('views',{products: productManager.getProducts()});
})

//Esta es para mostrar los productos con mongoDB pero extendido
router.get('/products', async (req,res) => {
  let limit = parseInt(req.query.limit);
  let page = parseInt(req.query.page);
  let query = req.query.query || ''; //Si no recibe query, el valor predeterminado es un string vacío así no clasifica nada
  let sort = req.query.sort || null; //Si no recibe sort, el valor se vuelve nulo y no se cuenta
  let products = await getProductsByParams(limit, page, query, sort);

  //Calcula el número total de productos y de páginas
  const count = await countProductsByParams(query);
  const totalPages = Math.ceil(count / limit);

  //Calcular los números de página previa y siguiente
  const prevPage = (page > 1) ? page - 1 : null;
  const nextPage = (page < totalPages) ? page + 1 : null;

  // Renderizar la vista con la información de los productos y la paginación
  res.render('productsview', {
    products: products,
    totalPages: totalPages,
    prevPage: prevPage,
    nextPage: nextPage
  });
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