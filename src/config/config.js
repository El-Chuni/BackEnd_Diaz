import dotenv from 'dotenv';
import {Command} from 'commander';

const program = new Command(); //Crea la instancia de comandos de commander.

program
    .option('-d', 'Variable para debug', false)
    .option('-p <port>', 'Puerto del servidor', 8080)
    .option('--mode <mode>', 'Modo de trabajo', 'develop')
    .option('--fs', 'Usar filesystem en lugar de MongoDB', false) // opción para usar fs
program.parse();

console.log("Mode Option: ", program.opts().mode);

const environment = program.opts().mode;

dotenv.config({
    path:environment==="production"?"./src/config/.env.production":"./src/config/.env.development"
});

//useFS define cual sistema de almacenamiento de datos uso
export default {
    port: process.env.PORT,
    consoleLogger: process.env.CONSOLE_LOGGER,
    mongoUrl: process.env.MONGO_URL,
    adminName: process.env.ADMIN_NAME,
    adminPassword: process.env.ADMIN_PASSWORD,
    gmailAccount: process.env.GMAIL_ACCOUNT,
    gmailAppPassword: process.env.GMAIL_APP_PASSWD, 
    twilioAccount: process.env.TWILIO_ACCOUNT_SID, 
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN, 
    twilioSMSNumber: process.env.TWILIO_SMS_NUMBER,
    useFS: program.opts().fs,
};