import multer from "multer";
import {fileURLToPath} from 'url';
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'./')
    }
})

export default __dirname;