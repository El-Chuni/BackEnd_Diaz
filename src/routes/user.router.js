import { Router } from "express";
import passport from "passport";

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
    }
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
router.get("/logout", (req, res) => {
    req.session.destroy(error => {
        if (error){
            res.json({error: "error logout", mensaje: "Error al cerrar la sesion"});
        }
        res.render("login");
    });
});


export default router;