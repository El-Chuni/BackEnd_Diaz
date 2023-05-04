import passport from "passport";
import passportLocal from 'passport-local';
import GitHubStrategy from 'passport-github2';
import userModel from "../Dao/DB/models/user.js";
import { createHash, isValidPassword } from "../utils.js";
import config from "./config.js"

//Declaramos nuestra estrategia:
const localStrategy = passportLocal.Strategy;
const initializePassport = () => {
   /**
     *  Inicializando la estrategia para github.
     *  Done será nuestro callback
    */ 
    //Estrategia de Login con GitHub:
    passport.use('github', new GitHubStrategy(
        {
            clientID: 'Iv1.6e86201d2d665d35', 
            clientSecret: '49b73a17b7eb2565e68e52953d3133e4021248ed',
            callbackUrl: 'http://localhost:8080/api/user/githubcallback'
        }, 
        async (accessToken, refreshToken, profile, done) => {
            console.log("Profile obtenido del usuario: ");
            console.log(profile);
            try {
                const user = await userModel.findOne({email: profile._json.email});
                console.log("Usuario encontrado para login:");
                console.log(user);
                if (!user) {
                    console.warn("User doesn't exists with username: " + profile._json.email);
                    let newUser = {
                        first_name: profile._json.name,
                        last_name: '',
                        age: 18,
                        email: profile._json.email,
                        password: '',
                        loggedBy: "GitHub",
                        role: 'user'
                    };
                    const result = await userModel.create(newUser);
                    return done(null, result);
                } else {
                    //Si entramos por acá significa que el usuario ya existía.
                    return done(null, user);
                }
            } catch (error) {
                return done(error);
            }
        })
    );
    //Estrategia de registro de usuario
    passport.use('register', new localStrategy(
        {passReqToCallback: true, usernameField: 'email'}, async (req, username, password, done) => {
            const {first_name, last_name, email, age} = req.body;
            let role = "user";
            try {
                const exists = await userModel.findOne({email});
                if (exists){
                    console.log("El usuario ya existe.");
                    return done(null, false);
                };
                if (email == "soyadmin" && password == "admin"){
                    role = "admin";
                }
                const user = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password : createHash(password),
                    role,
                    loggedBy: "App"
                };
                const result = await userModel.create(user);
                //Todo sale OK
                return done(null, result);
            } catch (error) {
                return done("Error registrando el usuario: " + error);
            }
        }
    ));
    
    //Estrategia de Login de la app:
    passport.use('login', new localStrategy(
        {passReqToCallback: true, usernameField: 'email'}, async (req, username, password, done) => {
            try {
                const user = await userModel.findOne({email: username});
                console.log("Usuario encontrado para login:");
                console.log(user);
                if (!user) {
                    console.warn("User doesn't exists with username: " + username);
                    return done(null, false);
                }
                if (!isValidPassword(user, password)) {
                    console.warn("Invalid credentials for user: " + username);
                    return done(null, false);
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );

    passport.use('onlyAdmin',new LocalStrategy({usernameField: 'username'},
      async (username, password, done) => {
        if (username == config.adminName) {
            //Se confirma que es admin y permite el acceso
            return done(null, config.adminName);
        }else{
            //Caso contrario.
            console.warn("Access denied, only admin can use this.")
            return done(null, false);
        }
      }
    ));

    //Funciones de Serializacion y Desserializacion
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await userModel.findById(id);
            done(null, user);
        } catch (error) {
            console.error("Error deserializando el usuario: " + error);
        }
    });
};

export default initializePassport;
