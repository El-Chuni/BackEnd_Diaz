import { Router } from "express";
import userModel from "../Dao/DB/models/user.js";

const router = Router();

//Registramos al usuario
router.post("/post/register", async (req, res)=>{
    const { first_name, last_name, email, age, password, role} = req.body;
    console.log("Registrando usuario:");
    console.log(req.body);

    const exists = await userModel.findOne({email});
    if (exists){
        return res.status(400).send({status: "error", message: "Usuario ya existe."});
    }
    const user = {
        first_name,
        last_name,
        email,
        age,
        password,
        role
    };
    const result = await userModel.create(user);
    res.status(201).send({status: "success", message: "Usuario creado con extito con ID: " + result.id});
});


  
router.get("/register", (req, res) => {
    res.render("register");
});
  
  
//Ingresa el usuario
router.post("/post/login", async (req, res)=>{
    const {email, password} = req.body;
    const user = await userModel.findOne({email,password});
    if(!user) return res.status(401).send({status:"error",error:"Incorrect credentials"});
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

//Muestra el usuario y algunos datos
router.get("/", (req, res) =>{
    res.render("profile", {
        user: req.session.user
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