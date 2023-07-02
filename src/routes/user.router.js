import { Router } from "express";
import passport from "passport";
import userModel from "../Dao/DB/models/user.js";
import customError from "../controllers/error.controller.js";
import multer from "multer";
import __dirname from "../utils.js";

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
    res.status(201).send({status: "success", message: "Usuario creado con extito con ID: " + req.user.id});
});

  
router.get("/register", (req, res) => {
    res.render("register");
});

router.get("/failregister", (req, res) => {
    console.log("Auth failed.");
    res.send({error:"Auth failed."});
});
  
  
//Ingresa el usuario
router.post("/post/login", passport.authenticate('login',{failureRedirect:'/faillogin'}), async (req, res)=>{
    const user = req.user;
    delete user.password;
    req.session.user= {
        name : `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age
    };
    await userModel.findByIdAndUpdate(user._id, { last_connection: Date.now()});
    res.send({status:"success", payload:req.session.user, message:"¡Primer logueo realizado! :)" });
});

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

//Muestra el usuario y algunos datos
router.get("/", (req, res) =>{
    res.render("profile", {
        user: req.session.user
    });
});

//Sube el archivo (documento) y marca al usuario con el nombre y dirección de lo que se subió
router.post("/:uid/documents", upload.single("document"), async (req, res) => {
    //Este router también usa un valor string de req.body llamado
    //documentType que define que tipo de archivo se sube
    //pero se usa en el middleware de upload.single("document").
    //Se escribe este comentario como advertencia ya que no
    //se usa dicho valor en el router fuera del middleware
    const uid = req.params.uid;
    const file = req.file;
  
    try {
      const user = await userModel.findById(uid);
      if (!user) {
        return customError(404, "The user doesn't exist");
      }
  
      // Verificar si se recibió un archivo
      if (!file) {
        return customError(400, "No file was uploaded");
      }
  
      // Obtener el nombre y la referencia del archivo
      const documentName = req.body.name;
      const reference = path.join(file.destination, file.filename);
  
      // Agregar el documento al usuario
      user.documents.push({ name: documentName, reference });
      await user.save();
  
      res.status(200).send({ message: "Document uploaded to the user." });
    } catch (error) {
      customError(500, error.message);
    }
  });

//Cambia el rol de usuario a premium y viceversa
router.get("/premium/:uid", passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), async (req, res) =>{
    let uid = req.params.uid;
    const user = await userModel.findById(uid);
    
    //Verifica si tiene los documentos necesarios
    const requiredDocs = ["Identificación", "Comprobante de domicilio", "Comprobante de estado de cuenta"];
    const itHasTheDocs = requiredDocs.every((documentName) => {
        return user.documents.some((document) => document.name === documentName);
    });

    let changeRoleTo = 'usuario';

    if (itHasTheDocs){
        if (user.role == 'usuario'){
            changeRoleTo = 'premium';
        }

        await userModel.findOneAndUpdate({_id: user._id}, {role: changeRoleTo});
        res.status(200).send(`El usuario con ID ${uid} ahora es un ${changeRoleTo}.`);
    } else {
        customError(401, "The user doesn't have the requisites to become a premium");
    }

});

//Un aviso si la autentificación falla en ciertas funciones
router.get('/forbidden', async (req,res) => {
    res.send("No estás autorizado para ejecutar cambios acá.");
    customError(401, "No estás autorizado para ejecutar cambios acá.");
})

router.get("/recoveraccount", async (req, res) => {
    res.render("recover");
});

router.get("/changePassword", async (req, res) => {
    let id = req.params.id;
    const user = await userModel.findOne({_id: id});


    let first_name = user.first_name;
    res.render("change", {
        first_name,
        currentPasswordHash: user.password,
        id: id
    });
});

//Se acaba la sessión
router.get("/logout", async (req, res) => {
    try {
        const user = req.session.user;
    
        // Destruimos la sesión e informamos cuando se logeó por última vez esta persona
        req.session.destroy();
        await userModel.findByIdAndUpdate(user._id, { last_connection: Date.now() });
    
        // Redireccionamos o enviamos una respuesta, dependiendo de tus necesidades
        res.render("/login");
    } catch (error) {
        console.error("Error al cerrar la sesión:", error);
        res.status(500).json({ error: "error_logout", message: "Error al cerrar la sesión" });
    }
});


export default router;