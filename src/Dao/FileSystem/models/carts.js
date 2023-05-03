export default class Cart {
    constructor(products = [], id = null) {
      this.products = products;
      this.id = id || Date.now().toString();
    }
  }
  