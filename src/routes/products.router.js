import { Router } from "express";
import multer from "multer";
import passport from "passport";
import { addAProduct, deleteAProduct, getAProductById, getProductsByParameters, getProductsList, updateAProduct } from "../controllers/products.controller.js";
import { generateMockProducts } from "../controllers/mocker.controller.js";
import customError from "../controllers/error.controller.js";
import { checkUserRole } from "../controllers/users.controller.js";

//Se define el router
const router = Router();

//Aplicamos el multer para que luego se puedan subir arrays en /post y /put
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Carga y muestra los productos
router.get('/get', getProductsByParameters);

//Lo mismo que /get pero con socket.io
router.get('/', getProductsList);

//Un aviso si la autentificación falla en ciertas funciones
router.get('/forbidden', async (req,res) => {
    res.send("No estás autorizado para ejecutar cambios acá.");
    customError(401, "No estás autorizado para ejecutar cambios acá.");
})

//Carga y muestra un producto en particular
router.get('/get/:pid', getAProductById)

//Hace un mock de products en mongo y cargo el resultado.
router.get('/mockingproducts', generateMockProducts)

//Añade un producto al array
router.post('/post', checkUserRole, passport.authenticate('forbiddenForCommonUser', { failureRedirect: '/forbidden' }), upload.array(), addAProduct);
  
//Se borra un producto especifico por ID
router.delete('/delete/:pid', checkUserRole, passport.authenticate('forbiddenForCommonUser', { failureRedirect: '/forbidden' }), deleteAProduct)

//Se actualiza un producto por ID
router.put('/put/:pid', checkUserRole, passport.authenticate('forbiddenForCommonUser', { failureRedirect: '/forbidden' }), upload.array(), updateAProduct)


export default router;