import { cartModel } from "./models/carts.js"; 

const getCarts = async () => cartModel.find();

const getCartById = async (cid) => cartModel.findById(cid);

const addCart = async (body) => cartModel.create(body);

const updateCart = async (cid, update) => {
    return cartModel.findOneAndUpdate(
      { id: cid },
      update,
      { new: true } // devuelve el documento actualizado
    );
};

const deleteCart = async (cid) =>  cartModel.deleteOne({id: cid}, (err) => { if (err) return handleError(err);});

export { getCarts, getCartById, addCart, updateCart, deleteCart }