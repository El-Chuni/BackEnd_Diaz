import { productModel } from "./models/products";

const getProducts = async () => productModel.find();

const getProductById = async (pid) => productModel.findById(pid);

const addProduct = async (body) => productModel.create(body);

const updateProduct = async (pid, update) => productModel.findOneAndUpdate({id: pid}, update);

const deleteProduct = async (pid) =>  productModel.deleteOne({id: pid}, (err) => { if (err) return handleError(err);});

export { getProducts, getProductById, addProduct, updateProduct, deleteProduct }