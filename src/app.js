import express from 'express';
import Handlebars from 'express-handlebars';
import ProductManager from './ProductManager.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import __dirname from './utils.js';
import { Server } from 'socket.io';


//Se hace lo necesario para activar el server
const app = express();
const SERVER_PORT = 8080;

const server = app.listen(SERVER_PORT, () => {
  console.log(`No abran cualquier cosa en el server numero ${SERVER_PORT}.`);
});

//Se crea el Websocket server
const socketServer = new Server(server)


app.engine('handlebars', Handlebars.engine());
app.set('views', __dirname+'/views');
app.set('view engine','handlebars');

//Se define el manager de productos acá
//Esto fue preparado para otra actividad y no se está usando (aún) para el proyecto final, así que ignorenlo por ahora
let managerDeProductos = new ProductManager();

//Estos app.use nos permitirán usar routers y varias funciones sin problemas
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname+'/public'))


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

//Se inicia el Websocket server
socketServer.on('connection', socket => {
  console.log("Welcome to the server.")

  socket.on('home',data=>{
    console.log(data);
  })
})

app.get('/', (req, res) => {
  let testUser = {
    name: "babe"
  }

  res.render('index', testUser);
})

app.get('/saludo', (req, res) => {
  res.send("https://www.youtube.com/watch?v=3V93ZyaiDPA");
});


app.get('/products', (req, res) => {
  let limit = parseInt(req.query.limit);
  let products = managerDeProductos.products;

  if (limit > 0) {
    products = products.filter(product => product.id < limit);
  }

  res.send(products);
});

app.get('/products/:pid', (req, res) => {
  let pid = parseInt(req.params.pid);
  const products = managerDeProductos.products;
  let productFound = products.find(product => product.id === pid);

  res.send(productFound || {});
});


