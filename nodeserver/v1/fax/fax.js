var express = require('express');
const moment = require('moment-timezone');
const r = require('request');


// const FAX_URL = process.env.FAX_URL || 'https://api.phaxio.com/v2/faxes'; //429 response will cause test error
const FAX_URL = process.env.FAX_URL || 'http://localhost:3000/v1/ping';

const FAX_API_KEY = process.env.FAX_API_KEY || 'b04d8415a44c0b5156445ac4589f9cc9e5e5abde';
const FAX_API_SECRET = process.env.FAX_API_KEY || '65ca8b7e97d85c52e60dc9ef073eccab19d608a4';

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
                    'auth': {
                        'user': FAX_API_KEY,
                        'pass': FAX_API_SECRET,
                        // 'sendImmediately': false
                    }
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
            // faxRequestFormMultipart.headers['api-id'] = FAX_API_KEY;
            // faxRequestFormMultipart.headers['api-key'] = FAX_API_KEY;
            // console.log(faxRequestFormMultipart.headers);
            var form = faxRequestFormMultipart.form();
            form.append('file', req.file.buffer, {
                filename: req.file.originalname,
            });
            form.append('to', fax);

        });

    });

    module.router = router;

    return module;
};
