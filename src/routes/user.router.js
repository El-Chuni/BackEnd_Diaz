import { Router } from "express";
import passport from "passport";
import userModel from "../Dao/DB/models/user.js";
import customError from "../controllers/error.controller.js";

const router = Router();

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

router.get("/premium/:uid", passport.authenticate('onlyAdmin', { failureRedirect: '/forbidden' }), async (req, res) =>{
    let uid = req.params.uid;
    const user = await userModel.findById(uid);
    let changeRoleTo = 'usuario';

    if (user.role == 'usuario'){
        changeRoleTo = 'premium';
    } 

    await userModel.findOneAndUpdate({_id: user._id}, {role: changeRoleTo});
    res.send(`El usuario con ID ${uid} ahora es un ${changeRoleTo}.`);
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