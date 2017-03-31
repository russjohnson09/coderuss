require('dotenv').config();

const low = require('lowdb');
const fs = require('fs');
const path = require('path');
var winston = require('winston');
const NODE_ENV = process.env.NODE_ENV || 'dev';
const LOGSENE_LOG_TYPE = 'coderuss_'+NODE_ENV;

winston.transports.Logsene = require('winston-logsene');


    var transports = [
        new winston.transports.Console({
            level: 'debug',
            colorize: true,
        })
    ];
    

transports.push(new (winston.transports.Logsene)({
    token: process.env.LOGSENE_TOKEN,
    ssl: 'true',
    type: LOGSENE_LOG_TYPE
}))
// exceptionHandlers.push(new (winston.transports.Logsene)({
//     token: process.env.LOGSENE_TOKEN,
//     ssl: 'true',
//     type: LOGSENE_LOG_TYPE
// }))


    var mainLogger = new winston.Logger({
        transports: transports,
        // exceptionHandlers: exceptionHandlers,
        // exitOnError: false
    })
    
mainLogger.info('hello')