import { cartModel } from "./models/carts.js"; 

const getCarts = async () => cartModel.find();

const getCartById = async (cid) => cartModel.findById(cid);

const addCart = async (body) => cartModel.create(body);

const updateCart = async (cid, update) => cartModel.findOneAndUpdate({id: cid}, update);

const deleteCart = async (cid) =>  cartModel.deleteOne({id: cid}, (err) => { if (err) return handleError(err);});

export { getCarts, getCartById, addCart, updateCart, deleteCart }