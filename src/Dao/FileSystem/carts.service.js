import fs from 'fs/promises';
import Cart from './models/carts.js';

const CARTS_FILE = 'carts.json';

export default class CartManager {
  static async getAllCarts() {
    try {
      const cartData = await fs.readFile(CARTS_FILE, 'utf8');
      const cartObjects = JSON.parse(cartData);
      const carts = cartObjects.map(c => new Cart(c.products, c.id));
      return carts;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Si el archivo no existe, devolvemos un array vacío
        return [];
      } else {
        throw error;
      }
    }
  }

  static async getCartById(cartId) {
    const carts = await CartManager.getAllCarts();
    const cart = carts.find(c => c.id === cartId);
    return cart || null;
  }

  static async addCart(cart) {
    const newCart = new Cart(cart.products);
    const carts = await CartManager.getAllCarts();
    carts.push(newCart);
    await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
    return newCart;
  }

  static async updateCart(cartId, updatedCart) {
    const carts = await CartManager.getAllCarts();
    const cartIndex = carts.findIndex(c => c.id === cartId);
    if (cartIndex === -1) {
      return null;
    } else {
      const updatedProducts = updatedCart.products || [];
      carts[cartIndex].products = updatedProducts;
      await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
      return carts[cartIndex];
    }
  }

  static async deleteCart(cartId) {
    const carts = await CartManager.getAllCarts();
    const cartIndex = carts.findIndex(c => c.id === cartId);
    if (cartIndex === -1) {
      return null;
    } else {
      const deletedCart = carts.splice(cartIndex, 1)[0];
      await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
      return deletedCart;
    }
  }

  static async updateProductStock(cartId, productId, newStock) {
    const carts = await CartManager.getAllCarts();
    const cartIndex = carts.findIndex(c => c.id === cartId);
    if (cartIndex === -1) {
      return null;
    } else {
      const products = carts[cartIndex].products;
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex === -1) {
        return null;
      } else {
        products[productIndex].stock = newStock;
        await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
        return carts[cartIndex];
      }
    }
  }
}
