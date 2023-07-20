import { Router } from "express";
import passport from "passport";
import customError from "../controllers/error.controller.js";
import multer from "multer";
import __dirname from "../utils.js";
import { changePassword, deleteAUser, deleteDatedUsers, getUsersList, loginUser, logoutUser, updateUserDocuments, updateUserRole } from "../controllers/users.controller.js";

const router = Router();

//Se define como será el almacenamiento

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uid = req.params.uid;
        const userFolder = path.join(__dirname, 'src', 'public', 'userDocs', uid);

        //Crea la carpeta del usuario si no existe
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder);
        }

        //Define a cual subcarpeta va el documento
        const folder = req.body.documentType === 'profile' ? 'profiles' :
            req.body.documentType === 'product' ? 'products' :
            req.body.documentType === 'document' ? 'documents' :
            '';

        const destinationPath = path.join(userFolder, folder);

        // Crea la subcarpeta si no existe
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath);
        }

        cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});


const upload = multer({ storage });

//Registramos al usuario
router.post("/post/register", passport.authenticate('register',{failureRedirect:'/failregister'}), async (req, res)=>{
    passport.authenticate('login', { failureRedirect: '/faillogin' })(req, res, () => {
        //Una vez registrado, usamos el passport de login para ingresarlo y enviarlo a los productos
        res.redirect('/views/products');
    });
});

  
router.get("/register", (req, res) => {
    res.render("register");
});

router.get("/failregister", (req, res) => {
    console.log("Auth failed.");
    res.send({error:"Auth failed."});
});
  
  
//Ingresa el usuario
router.post("/post/login", passport.authenticate('login',{failureRedirect:'/faillogin'}), loginUser);

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/faillogin", (req, res) => {
    res.send({error:"Failed login"});
});

router.get("/github", passport.authenticate('github', {scope:['user:email']}), async (req, res) =>{});

router.get("/callback", passport.authenticate('github', {failureRedirect:'/login'}), async (req, res) =>{
    req.session.user = req.user;
    res.redirect('/');
});

//Muestra los datos de los usuarios del sitio web
router.get("/", getUsersList);

//Borra los usuarios que no se hayan conectado desde hace dos días
router.delete("/", passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), deleteDatedUsers);

//Borra un usuario en especifico
router.delete("/:uid", passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), deleteAUser);

//Sube el archivo (documento) y marca al usuario con el nombre y dirección de lo que se subió
router.post("/:uid/documents", upload.single("document"), updateUserDocuments);

//Cambia el rol de usuario a premium y viceversa
router.get("/premium/:uid", passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), updateUserRole);

//Un aviso si la autentificación falla en ciertas funciones
router.get('/forbidden', async (req,res) => {
    res.send("No estás autorizado para ejecutar cambios acá.");
    customError(401, "No estás autorizado para ejecutar cambios acá.");
})

//Visualiza para "recuperar" la cuenta
router.get("/recoveraccount", async (req, res) => {
    res.render("recover");
});

//Visualiza para el cambio de contraseña
router.get("/changePassword", changePassword);

//Se acaba la sessión
router.get("/logout", logoutUser);


export default router;