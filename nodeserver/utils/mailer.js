require('dotenv').config();
const uuid = require('node-uuid');
const nodemailer = require('nodemailer');
const path = require('path');

var self = {};

if (process.env.SMTP_TRANSPORT) {
    var transporter = nodemailer.createTransport(process.env.SMTP_TRANSPORT);
}
else {
    var pickupTransport = require('nodemailer-pickup-transport');
    var transporter = nodemailer.createTransport(
        pickupTransport(
            { directory: path.join(__dirname, '..', 'logs', 'emails') }
        )
    );
}

self.transporter = transporter;

self.sendMail = function (mailOptions, callback) {
    mailOptions.headers = mailOptions.headers || {};
    mailOptions.headers['mailer-message-id'] = uuid.v1();
    transporter.sendMail(mailOptions, callback);
}

module.exports = self;