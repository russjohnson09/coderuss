var express = require('express');
const moment = require('moment-timezone');
const r = require('request');

const FAX_URL = process.env.FAX_URL || 'http://localhost:3000/api/v1/files/tmp'

module.exports = function(opts) {
    var module = {};
    var router = express.Router();
    var app = opts.app;
    var winston = opts.winston;


    module.router = router;

    var multer = require('multer');

    var storage = multer.memoryStorage();

    var upload = multer({
        storage: storage
    }).single('file');

    router.post('/', function(req, res) {
        upload(req, res, function(err) {
            winston.warn(req.file);

            var faxRequestFormMultipart = r.post({
                    url: FAX_URL,
                },
                function(err, response, body) {
                    if (response.statusCode < 400) {
                        res.status(201).json({
                            filename: req.file.originalname,
                            fax: req.requestBody.fax
                        });
                    }
                    else {
                        res.status(response.statusCode).send(body);
                    }

                });

            var form = faxRequestFormMultipart.form();
            form.append('file', req.file.buffer, {
                filename: req.file.originalname,
                fax: req.fax
            });

        });

    });

    module.router = router;

    return module;
};
