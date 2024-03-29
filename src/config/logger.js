import winston, { transports } from "winston";
import config from "./config.js";
//require('colors');

//Custom logger options:
const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        debug: 4
    },
    colors: {
        fatal: 'red',
        error: 'orange',
        warning: 'yellow',
        info: 'blue',
        debug: 'white'
    }
};

//Custom Logger:
const devLogger = winston.createLogger({
    //Levels:
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console(
            {
                level: config.consoleLogger,
                format: winston.format.combine(
                    winston.format.colorize({colors: customLevelsOptions.colors}),
                    winston.format.simple()
                )
            }
        ),
        new winston.transports.File(
            {
                filename: './errors.log', 
                level: 'error', //Cambiamos el logger level name.
                format: winston.format.simple()
            }
        )
    ]
});

//Creating our logger:
const prodLogger = winston.createLogger({
    //Declare transports:
    transports: [
        new winston.transports.Console({level: "http"}),
        new winston.transports.File({filename: './errors.log', level: 'warn'})
    ]
});

//Declare a middleware:
export const addLogger = (req, res, next) => {
    if (config.environment === 'production'){
        req.logger = prodLogger;
    } else {
        req.logger = devLogger;
    }
    req.logger.info(`${req.method} en ${req.url} - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
    next();
};