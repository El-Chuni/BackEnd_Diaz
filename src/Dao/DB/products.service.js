import { productModel } from "./models/products.js";

const getProducts = async () => productModel.find();

const getProductById = async (pid) => productModel.findById(pid);

//Hace la paginación de los productos.
const getProductsByParams = async (limit, page, query, sort) => {
  const order = { limit: limit || 10, page: page || 1 };

  if (sort) {
    order.sort = sort;
  }

  let products = await productModel.paginate(query, order);

  return {
    status: 'success',
    payload: products.docs,
    totalPages: products.totalPages,
    prevPage: products.prevPage,
    nextPage: products.nextPage,
    page: products.page,
    hasPrevPage: products.hasPrevPage,
    hasNextPage: products.hasNextPage,
    prevLink: products.hasPrevPage ? `?page=${products.prevPage}&limit=${limit}&query=${query}&sort=${sort}` : null,
    nextLink: products.hasNextPage ? `?page=${products.nextPage}&limit=${limit}&query=${query}&sort=${sort}` : null,
  };
}

const addProduct = async (body) => productModel.create(body);

const updateProduct = async (pid, update) => productModel.findOneAndUpdate({id: pid}, update);

const deleteProduct = async (pid) => {
  try {
    await productModel.deleteOne({ id: pid });
  } catch (error) {
    console.log(error);
    throw new Error('Error deleting product');
  }
}
  
export { getProducts, getProductById, getProductsByParams, addProduct, updateProduct, deleteProduct }