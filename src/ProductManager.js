import fs from 'fs';

export class Product {
    
    constructor(title, description, price, thumbnail, code, stock, id, status, category){
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
        this.id = id;
        this.status = status;
        this.category = category;
    }
    
}

export default class ProductManager {
    constructor(){
        this.filePath = './ProductList.txt';
        fs.readFile(this.filePath, 'utf-8', (error, result) => {
            if (error){
                this.products = [];
                fs.writeFile(this.filePath, JSON.stringify(this.products), (err) => {
                  if (err) throw err;
                  console.log('The file has been saved!');
                });
            } else {
                this.products = JSON.parse(result);
            }
        })
    }

    addProduct(newProduct) {
        const { title, description, price, thumbnail, code, stock, category } = newProduct;
        
        const existingProduct = this.products.find(product => product.code === newProduct.code);
        if (existingProduct) {
            throw new Error(`Product with code ${product.code} already exists, try another one.`);
        }
        
        const id = Math.floor(Math.random()*1000+1);
        const status = true;

        const product = new Product(title, description, price, thumbnail, code, stock, id, status, category);

        while (this.products.find(existingProduct => existingProduct.id === product.id)) {
            product.id = Math.floor(Math.random()*1000+1);
        }
    
        this.products.push(product);
        console.log(`Product ${product.title} successfully added.`);
        fs.writeFileSync(this.filePath, JSON.stringify(this.products));
    }
    
    getProducts() {
        console.log(this.products);
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data).map(productData => new Product(productData));
    }

    getProductById(id){
        const productFound = this.products.find(product => product.id === id)

        if (productFound) {
            console.log(productFound);
            return productFound;
        } else {
            console.error("Product not found.")
        }
    }

    updateProduct(id, productUpdate){
        let productFound = this.products.find((product) => product.id === id)

        if (productFound) {
            const updatedProduct = { ...productFound, ...productUpdate }
            const updatedProducts = this.products.map(product => {
                if (product.id === id) {
                    return updatedProduct
                }
                return product
            })
            this.products = updatedProducts
            fs.writeFileSync(this.filePath, JSON.stringify(this.products))
            console.log("Product updated successfully.")
        } else {
            console.error("Product not found.")
        }
    }

    deleteProduct(id){
        const updatedProducts = this.products.filter(product => product.id !== id)

        if (this.products.length === updatedProducts.length) {
            console.error("Product not found.")
        } else {
            this.products = updatedProducts
            fs.writeFileSync(this.filePath, JSON.stringify(this.products))
            console.log("Product deleted successfully.")
        }
    }
}

