import passport from "passport";
import passportLocal from 'passport-local';
import GitHubStrategy from 'passport-github2';
import userModel from "../Dao/DB/models/user.js";
import { createHash, isValidPassword } from "../utils.js";
import config from "./config.js";
import { addCart } from "../Dao/DB/carts.service.js";

//Una condición para register para darle un rol al usuario
const assignRole = (email, password) => {
    if (email === config.adminName && password === config.adminPassword) {
        return 'admin';
    } else {
        return 'usuario';
    }
}


//Declaramos nuestra estrategia:
const localStrategy = passportLocal.Strategy;
const initializePassport = () => {
   /**
     *  Inicializando la estrategia para github.
     *  Done será nuestro callback
    */ 

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
                        role: 'usuario'
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
            try {
                const exists = await userModel.findOne({email});
                if (exists){
                    console.log("El usuario ya existe.");
                    return done(null, false);
                };
                
                //Le da el rol según su email y contraseña
                const role = assignRole(email, password);

                const cart = await addCart();

                const user = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password : createHash(password),
                    role,
                    cart: cart._id
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

    /*passport.use('onlyAdmin', new localStrategy({ passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) => {
            const userRole = req.cookies.userRole;
            if (!userRole) {
                return done(null, false);
            }

            if (userRole === 'admin') {
                //El usuario tiene el rol de administrador, se permite el acceso
                return done(null, user);
            } else {
                //El usuario no tiene el rol de administrador, se deniega el acceso
                console.warn("Access denied, only admin can use this.")
                return done(null, false);
            }
        }
    ));

    passport.use('onlyUser', new localStrategy({ passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) => {
            const userRole = req.options.userRole;
            if (!userRole) {
                return done(null, false);
            }

            if (userRole !== 'admin') {
                //El usuario no tiene el rol de administrador, se permite el acceso
                return done(null, user);
            } else {
                //El usuario tiene el rol de administrador, se deniega el acceso
                console.warn("Access denied, only user can use this.")
                return done(null, false);
            }
        }
    ));

    passport.use('forbiddenForCommonUser', new localStrategy({ passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) => {
            const userRole = req.cookies.userRole;
            if (!userRole) {
                return done(null, false);
            }

            if (userRole !== 'usuario') {
                //El usuario no tiene el rol de usuario, se permite el acceso
                return done(null, user);
            } else {
                //El usuario tiene el rol de usuario, se deniega el acceso
                console.warn("Access denied, only premium or admin users are allowed.");
                return done(null, false);
            }
        }
    ));*/

      

    
};

export default initializePassport;
