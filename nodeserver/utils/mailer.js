require('dotenv').config();


const nodemailer = require('nodemailer');

var self = {};

if (process.env.SMTP_TRANSPORT) {
    var transporter = nodemailer.createTransport(process.env.SMTP_TRANSPORT);
}
else {
    var pickupTransport = require('nodemailer-pickup-transport');
    var transporter = nodemailer.createTransport(
        pickupTransport({ directory: __dirname + '/../email' }));
}

self.transporter = transporter;

module.exports = nodemailer;