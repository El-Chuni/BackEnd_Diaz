//const fs = require('fs');
import fs from 'fs';

class Product {
    
    constructor(title, description, price, thumbnail, code, stock, id){
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
        this.id = id;
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

    addProduct(title, description, price, thumbnail, code, stock){

        const codeFound = this.products.find((product) => product.code === code)

        if(!codeFound){
            let id = this.products.length
            const product = new Product(title, description, price, thumbnail, code, stock, id)
            this.products.push(product)
            console.log(`Product ${product.title} successfully added.`)
            fs.writeFileSync(this.filePath, JSON.stringify(this.products))
        }else{
            console.log("We already have this, try again or leave.")
        }
    }

    getProducts(){
        const detailsOfProducts = this.products.map((product) => Object.entries(product))
        console.log("detailsOfProducts",detailsOfProducts)
    }

    getProductById(id){
        let productFound = this.products.find(product => product.id === id)

        productFound ? console.log(Object.values(productFound)) : console.error("not found")
    }

    updateProduct(id, productUpdate){
        const productFound = this.products.find((product) => product.id === id)
        

        if (productFound) {
            const arrayUpdate = this.products.filter(product => product.id !== id)
            
            arrayUpdate.push({id, ...productUpdate})

            this.products = arrayUpdate

            console.log("Product updated.")
        }else{
            console.error("not found")
        }
    }

    deleteProduct(id){
        let productFound = this.products.find((product) => product.id === id)
        if (productFound){
            this.products.filter(product => product.id !== id)

            console.log("Product deleted")
        }else{
            console.error("not found or already deleted")
        }
    }
}

let managerDeProductos = new ProductManager()
//managerDeProductos.tester()
/*managerDeProductos.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc123", 25)
managerDeProductos.getProducts()
managerDeProductos.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc123", 25)
managerDeProductos.getProducts()
managerDeProductos.addProduct("La mano arriba", "cintura sola", 15, "la media vuelta", "DANZA KUDURO", 2)
managerDeProductos.getProductById(1)
managerDeProductos.updateProduct(1, ("I AM THE STORM", "THAT IS APPROACHING", 400, "PROVOKING", "BLACK CLOUDS IN ISOLATION", 8001))
managerDeProductos.getProductById(1)
managerDeProductos.deleteProduct(1)
managerDeProductos.getProducts()*/

