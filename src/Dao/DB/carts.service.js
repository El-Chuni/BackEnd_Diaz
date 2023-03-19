import { cartModel } from "./models/carts.js";

const getCarts = async () => cartModel.find();

const getCartById = async (cid) => {
  const cartFound = await cartModel.findOne({ _id: cid }).populate('products.product');
  return cartFound;
};

const addCart = async (body) => cartModel.create(body);

const updateCart = async (cid, update) => {
    return cartModel.findOneAndUpdate(
      { id: cid },
      update,
      { new: true } // devuelve el documento actualizado
    );
};

const replaceCartContent = async (cid, products) => cartModel.replaceOne({ id: cid }, { products: products }); 

const updateCartProductStock = async (cid, pid, stock) => {
  return cartModel.updateOne(
    { id: cid, "products.id": pid},
    { $set: { "products.$.stock": stock }}
  );
};

const removeFromCart = async (cid, pid) => {
  cartModel.update(
    { id: cid },
    { $pull : { products : { id: pid } } })
}

const deleteCart = async (cid) => {
  try {
      await cartModel.deleteOne({_id: cid});
  } catch (err) {
      console.log(err);
  }
}

export { getCarts, getCartById, addCart, updateCart, deleteCart, removeFromCart, replaceCartContent, updateCartProductStock }