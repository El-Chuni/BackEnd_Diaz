import express from 'express';
//const express = require("express")
import ProductManager from './ProductManager.js';

const app = express();
const SERVER_PORT = 8080;
let managerDeProductos = new ProductManager();

app.use(express.urlencoded({extended:true}))

app.get('/saludo',(req,res) => {
    res.send("https://www.youtube.com/watch?v=3V93ZyaiDPA")
})


app.get('/products',(req,res) => {
    let limit = req.query.limit;
    let products = managerDeProductos.products;

    if (limit > 0) {
        products.filter(product => (product.id) < limit)
        console.log(products)
    }

    res.send(products)
})

app.get('/products/:pid', (req,res) => {
    let pid = req.params.pid;
    const products = managerDeProductos.products;
    let productFound = products.find(product => product.id === pid)
    console.log(productFound)
    console.log(products)
    res.send(productFound)
    //res.send(managerDeProductos.getProductById(pid))
})

app.listen(SERVER_PORT, () => {
    console.log(`No abran cualquier cosa en el server numero ${SERVER_PORT}.`);
})