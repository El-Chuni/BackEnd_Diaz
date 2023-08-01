import multer from "multer";
import {fileURLToPath} from 'url';
import { dirname } from "path";
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'./')
    }
})

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) => {
    console.log(`Datos a validar: user-password: ${user.password}, password: ${password}`);
    return bcrypt.compareSync(password, user.password);
}

export const ensureAdmin = (req, res, next) => {
    if (req.user && req.user.role == 'admin') {
        return next();
    } else {
        return res.send(401);
    }
}

export const ensureUser = (req, res, next) => {
    if (req.user && req.user.role != 'admin') {
        return next();
    } else {
        return res.send(401);
    }
}

export const ensureUncommon = (req, res, next) => {
    if (req.user && (req.user.role == 'admin' || req.user.role == 'premium')) {
        return next();
    } else {
        return res.send(401);
    }
}    


export default __dirname;