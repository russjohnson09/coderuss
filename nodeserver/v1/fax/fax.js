var express = require('express');
const moment = require('moment-timezone');
const r = require('request');

const FAX_URL = process.env.FAX_URL || 'http://localhost:3000/api/v1/files/tmp';

const FAX_API_KEY = process.env.FAX_API_KEY || '123';
const FAX_API_ID = process.env.FAX_API_KEY || '123';

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

            if (req.user) {
                winston.warn('logged in as', req.user);

            }
            winston.warn('fax req body', req.body);
            
            var fax = req.body.fax;
            var faxUrl = FAX_URL;

            var faxRequestFormMultipart = r.post({
                    url: faxUrl,
                },
                function(err, response, body) {
                    if (err) {
                        winston.error(err);
                        return res.status(500);

                    }
                    if (response.statusCode < 400) {
                        res.status(201).json({
                            filename: req.file.originalname,
                            fax: fax,
                            url: faxUrl,
                            response: body
                        });
                    }
                    else {
                        res.status(response.statusCode).send(body);
                    }

                });

            // console.log('faxRequestForm');
            faxRequestFormMultipart.headers['api-id'] = FAX_API_KEY;
            faxRequestFormMultipart.headers['api-key'] = FAX_API_KEY;
            // console.log(faxRequestFormMultipart.headers);
            var form = faxRequestFormMultipart.form();
            form.append('file', req.file.buffer, {
                filename: req.file.originalname,
            });
            form.append('fax',fax);

        });

    });

    module.router = router;

    return module;
};
