var express = require('express');
const moment = require('moment-timezone');
const r = require('request')

module.exports = function (opts) {
    var module = {};
    var router = express.Router();
    var app = opts.app;
    var winston = opts.winston;


    function getLogSeneUrl(user) {
        return ' https://logsene-receiver.sematext.com/'
            + user.logsene_token + '/_search'
    }


    function getElasticSearchErrors() {
        var start = parseInt(moment.tz('America/New_York').startOf('day').format('x'));
        var end = parseInt(moment.tz('America/New_York').endOf('day').format('x'));
        var obj = {
            "highlight": {
                "pre_tags": [
                    "@kibana-highlighted-field@"
                ],
                "post_tags": [
                    "@/kibana-highlighted-field@"
                ],
                "fields": {
                    "*": {}
                },
                "require_field_match": false,
                "fragment_size": 2147483647
            },
            "query": {
                "filtered": {
                    "query": {
                        "query_string": {
                            "query": "_type: coderuss severity: error",
                            "analyze_wildcard": true,
                            "default_operator": "AND"
                        }
                    },
                    "filter": {
                        "bool": {
                            "must": [
                                {
                                    "range": {
                                        "@timestamp": {
                                            "gte": start,
                                            "lte": end,
                                            "format": "epoch_millis"
                                        }
                                    }
                                }
                            ],
                            "must_not": []
                        }
                    }
                }
            },
            "size": 500,
            "sort": [
                {
                    "@timestamp": {
                        "order": "desc",
                        "unmapped_type": "boolean"
                    }
                }
            ],
            "aggs": {
                "2": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "interval": "1m",
                        "time_zone": "America/New_York",
                        "min_doc_count": 0,
                        "extended_bounds": {
                            "min": start,
                            "max": end
                        }
                    }
                }
            },
            "fields": [
                "*",
                "_source"
            ],
            "script_fields": {},
            "fielddata_fields": [
                "@timestamp"
            ]
        }
        return obj;
    }


    router.get('/errors', function (req, res) {
        res.setHeader('content-type', 'application/json; charset=utf-8');

        body = JSON.stringify(getElasticSearchErrors());
        winston.info(body);
        if (req.user && req.user.logsene_token) {
            r.post({
                headers: {
                    'content-type': 'application/json',
                },
                url: getLogSeneUrl(req.user),
                body: body
            }, function (error, response, body) {
                console.log(body);
                if (error) {
                    console.log(error);
                }
                else if (response.statusCode !== 200) {
                    console.log(response.statusCode);
                }
                else {
                    return res.status(200).send(body);
                }

            });
        }
        else {
            res.status(401).json({
                'status': 'unauthorized'
            });
        }

    })

    module.router = router;

    return module;
};