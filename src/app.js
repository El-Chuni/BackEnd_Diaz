import express from 'express';
import Handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import ProductManager from './ProductManager.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import chatRouter from './routes/chat.router.js';
import __dirname from './utils.js';
import { Server } from 'socket.io';
import { getMessages, addMessage } from './Dao/DB/messages.service.js';


//Se hace lo necesario para activar el server
const app = express();
const SERVER_PORT = 8080;

const server = app.listen(SERVER_PORT, () => {
  console.log(`No abran cualquier cosa en el server numero ${SERVER_PORT}.`);
});

//Se crea el Websocket server
const socketServer = new Server(server);


app.engine('handlebars', Handlebars.engine());
app.set('views', __dirname+'/views');
app.set('view engine','handlebars');

//Se define el manager de productos acá
//Esto fue preparado para otra actividad y no se está usando (aún) para el proyecto final, así que ignorenlo por ahora
let productManager = new ProductManager();

//Estos app.use nos permitirán usar routers y varias funciones sin problemas
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname+'/public'))

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/realtimeproducts', viewsRouter);
app.use('/api/chat', chatRouter)

//Se inicia el Websocket server
socketServer.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('views', (data) => {
    console.log(`Received data: ${data}`);
    socketServer.emit('updateViews', { products: productManager.getProducts() });
  });

  socket.on("saludo", data => {
    console.log(data);
  });
  
  socket.on('message', async (data) => {
    console.log(`Received data: ${data}`);
    const message = JSON.parse(data);
    await addMessage(message.user, message.message);
    const messages = await getMessages();
    socketServer.emit('updateMessages', messages);
  });
});

//Se conecta a MongoDB
const connectMongoDB = async ()=>{
  try {
      //Usuario: TestMongo
      //Contraseña: Gvy7CjhQf9zlMSgo
      await mongoose.connect('mongodb+srv://TestMongo:Gvy7CjhQf9zlMSgo@cluster0.lg3tyb6.mongodb.net/ecommerce');
      console.log("Conectado con exito a MongoDB usando Moongose.");
  } catch (error) {
      console.error("No se pudo conectar a la BD usando Moongose: " + error);
      process.exit();
  }
};
connectMongoDB();


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
  let products = productManager.products;

  if (limit > 0) {
    products = products.filter(product => product.id < limit);
  }

  res.send(products);
});

app.get('/products/:pid', (req, res) => {
  let pid = parseInt(req.params.pid);
  const products = productManager.products;
  let productFound = products.find(product => product.id === pid);

  res.send(productFound || {});
});


