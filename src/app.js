import express from 'express';
import Handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import ProductManager from './ProductManager.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import chatRouter from './routes/chat.router.js';
import userRouter from './routes/user.router.js';
import sessionRouter from './routes/session.router.js';
import __dirname from './utils.js';
import { Server } from 'socket.io';
import session from 'express-session';
import { getMessages, addMessage } from './Dao/DB/messages.service.js';
import { getProductsByParams } from './Dao/DB/products.service.js';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import config from './config/config.js';
import initializePassport from './config/passport.config.js';
import cors from 'cors';
import { addLogger } from './config/logger.js';
import cookieParser from 'cookie-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';


//Se hace lo necesario para activar el server
const app = express();
const SERVER_PORT = config.port;

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
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname+'/public'));
app.use(addLogger);
app.use(cookieParser());

app.use(session({
  store:MongoStore.create({
    mongoUrl: config.mongoUrl,
    mongoOptions:{useNewUrlParser: true, useUnifiedTopology: true},
    ttl:60
  }),
  secret: 'backEndCoder',
  resave: true,
  saveUninitialized:true
}));

//Se define el swagger
const options = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Back-End Diaz',
      version: '1.0.0',
      description: 'API para la clase de Back-End',
    },
  },
  apis: ["./src/docs/**/*.yaml"] 
};

const specs = swaggerJSDoc(options);

//Se inicia el pasaporte
initializePassport();
app.use(passport.initialize());

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/views', viewsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/user', userRouter);
app.use('/api/sessions', sessionRouter);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

//Se inicia el Websocket server
socketServer.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('views', (data) => {
    console.log(`Received data: ${data}`);
    socketServer.emit('updateViews', { products: productManager.getProducts() });
  });

  socket.on('productsview', async (data) => {
    console.log(`Received data: ${data}`);

    let products = await getProductsByParams();
    console.log(products.payload);
    socketServer.emit('productList', { products: products.payload});
  });

  socket.on("saludo", data => {
    console.log(data);
  });

  socket.on("cart", data => {
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
      await mongoose.connect(config.mongoUrl);
      console.log("Conectado con exito a MongoDB usando Moongose.");
  } catch (error) {
      req.logger.error("No se pudo conectar a la BD usando Moongose: " + error)
      //console.error("No se pudo conectar a la BD usando Moongose: " + error);
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


app.get('/session', (req, res) => {
  if(req.session.counter){
    req.session.counter++;
    res.send(`Entraste ${req.session.counter} veces.`)
  }else{
    req.session.counter = 1;
    res.send('¡Bienvenido a tu primer visita!')
  }
})

app.get('/loggerTest', (req, res) => {
  console.log("DEPLOYING ALL THE LOGGERS.");

  req.logger.debug("Guldo!");  
  req.logger.info("Jeice!");
  req.logger.warning("Burter!");
  req.logger.error("Recoome!");
  req.logger.fatal("Ginyu!");  
})