var express = require('express');
const moment = require('moment-timezone');
const r = require('request');

const userRouter = require('./../users/main');
const GITHUB_API_URL = 'https://api.github.com';

const POSTCARD_COST = 1;

const GITHUB_CODERUSS_TOKEN = process.env.GITHUB_CODERUSS_TOKEN || '';

const TVMAZE_API_URL = 'http://api.tvmaze.com';

module.exports = function(opts) {
    var module = {};
    var router = express.Router();
    var app = opts.app;
    var winston = opts.winston;

    var last_request = null;

    console.log(opts);

    var db = opts.database;

    var ObjectID = require('mongodb').ObjectID;

    // const User = db.collection('user');

    router.use(function(req, res, next) {

        if (req.isAuthenticated()) {
            if (req.user.username === process.env.MAIN_ADMIN_USERNAME) {
                req.headers['authorization'] = req.headers['authorization'] || 'Token '+ GITHUB_CODERUSS_TOKEN
            }
        }
        return next();
    });

    // router.get('/github/repos/russjohnson09/coderuss/commits/4c20768f288af579519e887674ddcea5300a7d1d', function(req, res) {
    //     res.json({status:1}).end();
    // });

    var doStub = function(req,res,next) {
        console.log('doStub');
        console.log(process.env.NODE_ENV,req.params.proxy);

        if (process.env.NODE_ENV != 'DEV' && process.env.NODE_ENV != 'TEST') {
            return next();
        }
        if (req.params.proxy == 'tvmaze') {
            var path = req.params.path;
            console.log(path);
            if (path == '/shows/4189') {
                return res.json({
                    "id": 4189,
                    "url": "http://www.tvmaze.com/shows/4189/general-hospital",
                    "name": "General Hospital stubbed",
                    "type": "Scripted",
                    "language": "English",
                    "genres": ["Drama", "Medical"],
                    "status": "Running",
                    "runtime": 60,
                    "premiered": "1987-01-02",
                    "officialSite": "http://abc.go.com/shows/general-hospital",
                    "schedule": {"time": "14:00", "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
                    "rating": {"average": null},
                    "weight": 90,
                    "network": {
                        "id": 3,
                        "name": "ABC",
                        "country": {"name": "United States", "code": "US", "timezone": "America/New_York"}
                    },
                    "webChannel": null,
                    "externals": {"tvrage": 3653, "thetvdb": 75332, "imdb": "tt0056758"},
                    "image": {
                        "medium": "http://static.tvmaze.com/uploads/images/medium_portrait/20/50438.jpg",
                        "original": "http://static.tvmaze.com/uploads/images/original_untouched/20/50438.jpg"
                    },
                    "summary": "<p><b>General Hospital</b>, which celebrated its golden anniversary on April 1, 2013, continues its tradition of passion, intrigue and adventure that takes place in the fictional town of Port Charles in upstate New York. The glamour and excitement of those who have come to find their destinies in this familiar seaport town intertwine with the lives, loves and fortunes of beloved, well-known faces. As always, love, danger and mind blowing plot twists continue to abound on General Hospital with contemporary storylines and unforgettable characters.</p>",
                    "updated": 1501006916,
                    "_links": {
                        "self": {"href": "http://api.tvmaze.com/shows/4189"},
                        "previousepisode": {"href": "http://api.tvmaze.com/episodes/1251058"},
                        "nextepisode": {"href": "http://api.tvmaze.com/episodes/1251059"}
                    }
                });
            }
            else if (path == '/episodes/1251058') {
                return res.json({
                    "id": 1251058,
                    "url": "http://www.tvmaze.com/episodes/1251058/general-hospital-55x78-ep-13856",
                    "name": "Ep. #13856 stubbed",
                    "season": 55,
                    "number": 78,
                    "airdate": "2017-07-25",
                    "airtime": "14:00",
                    "airstamp": "2017-07-25T18:00:00+00:00",
                    "runtime": 60,
                    "image": null,
                    "summary": null,
                    "_links": {"self": {"href": "http://api.tvmaze.com/episodes/1251058"}}
                });
            }
            else if (path == '/episodes/1251059') {
                return res.json({
                    "id": 1251059,
                    "url": "http://www.tvmaze.com/episodes/1251059/general-hospital-55x79-ep-13857",
                    "name": "Ep. #13857 stubbed",
                    "season": 55,
                    "number": 79,
                    "airdate": "2017-07-26",
                    "airtime": "14:00",
                    "airstamp": "2017-07-26T18:00:00+00:00",
                    "runtime": 60,
                    "image": null,
                    "summary": null,
                    "_links": {"self": {"href": "http://api.tvmaze.com/episodes/1251059"}}
                });
            }
            else if (path == '/shows/16559') {
                return res.json({
                    "id": 16559,
                    "url": "http://www.tvmaze.com/shows/16559/hello-world",
                    "name": "Hello World",
                    "type": "Reality",
                    "language": "English",
                    "genres": [],
                    "status": "Running",
                    "runtime": 30,
                    "premiered": "2016-03-25",
                    "officialSite": "http://www.bloomberg.com/features/2016-hello-world/",
                    "schedule": {"time": "21:30", "days": ["Friday"]},
                    "rating": {"average": null},
                    "weight": 0,
                    "network": {
                        "id": 172,
                        "name": "Bloomberg TV",
                        "country": {"name": "United States", "code": "US", "timezone": "America/New_York"}
                    },
                    "webChannel": null,
                    "externals": {"tvrage": 51691, "thetvdb": null, "imdb": null},
                    "image": {
                        "medium": "http://static.tvmaze.com/uploads/images/medium_portrait/55/137988.jpg",
                        "original": "http://static.tvmaze.com/uploads/images/original_untouched/55/137988.jpg"
                    },
                    "summary": "<p><b>Hello World</b> invites the viewer to come on a journey. It's a journey that stretches across the globe to find the inventors, scientists and technologists shaping our future. Each episode explores a different country and uncovers the ways in which the local culture and surroundings have influenced their approach to technology. Join journalist and best-selling author Ashlee Vance on a quest to find the freshest, weirdest tech creations and the beautiful freaks behind them.</p>",
                    "updated": 1482891502,
                    "_links": {
                        "self": {"href": "http://api.tvmaze.com/shows/16559"},
                        "previousepisode": {"href": "http://api.tvmaze.com/episodes/1025561"}
                    }
                }).end();
            }
            else if (path == '/episodes/1025561') {
                return res.json({
                    "id": 1025561,
                    "url": "http://www.tvmaze.com/episodes/1025561/hello-world-1x10-chile",
                    "name": "Chile",
                    "season": 1,
                    "number": 10,
                    "airdate": "2016-12-30",
                    "airtime": "21:30",
                    "airstamp": "2016-12-31T02:30:00+00:00",
                    "runtime": 30,
                    "image": null,
                    "summary": "<p>stub - In Chile, Ashlee Vance explores outer space with giant telescopes, pulls water out of thin air and trips on frog poison.</p>",
                    "_links": {"self": {"href": "http://api.tvmaze.com/episodes/1025561"}}
                })
            }

            if (req.query && req.query.q) {
                var searchstring = req.query.q;
                console.log(searchstring);
                if (searchstring == 'general hospital') {
                    res.json([{
                        "score": 36.06839,
                        "show": {
                            "id": 4189,
                            "url": "http://www.tvmaze.com/shows/4189/general-hospital",
                            "name": "General Hospital",
                            "type": "Scripted",
                            "language": "English",
                            "genres": ["Drama", "Medical"],
                            "status": "Running",
                            "runtime": 60,
                            "premiered": "1987-01-02",
                            "officialSite": "http://abc.go.com/shows/general-hospital",
                            "schedule": {
                                "time": "14:00",
                                "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                            },
                            "rating": {"average": null},
                            "weight": 90,
                            "network": {
                                "id": 3,
                                "name": "ABC",
                                "country": {"name": "United States", "code": "US", "timezone": "America/New_York"}
                            },
                            "webChannel": null,
                            "externals": {"tvrage": 3653, "thetvdb": 75332, "imdb": "tt0056758"},
                            "image": {
                                "medium": "http://static.tvmaze.com/uploads/images/medium_portrait/20/50438.jpg",
                                "original": "http://static.tvmaze.com/uploads/images/original_untouched/20/50438.jpg"
                            },
                            "summary": "<p><b>stubbed General Hospital</b>, which celebrated its golden anniversary on April 1, 2013, continues its tradition of passion, intrigue and adventure that takes place in the fictional town of Port Charles in upstate New York. The glamour and excitement of those who have come to find their destinies in this familiar seaport town intertwine with the lives, loves and fortunes of beloved, well-known faces. As always, love, danger and mind blowing plot twists continue to abound on General Hospital with contemporary storylines and unforgettable characters.</p>",
                            "updated": 1501006916,
                            "_links": {
                                "self": {"href": "http://api.tvmaze.com/shows/4189"},
                                "previousepisode": {"href": "http://api.tvmaze.com/episodes/1251058"},
                                "nextepisode": {"href": "http://api.tvmaze.com/episodes/1251059"}
                            }
                        }
                    }, {
                        "score": 19.930511,
                        "show": {
                            "id": 26874,
                            "url": "http://www.tvmaze.com/shows/26874/general-hospital-night-shift",
                            "name": "General Hospital: Night Shift",
                            "type": "Scripted",
                            "language": "English",
                            "genres": [],
                            "status": "Ended",
                            "runtime": 60,
                            "premiered": "2007-07-12",
                            "officialSite": null,
                            "schedule": {"time": "22:00", "days": ["Tuesday"]},
                            "rating": {"average": null},
                            "weight": 0,
                            "network": {
                                "id": 1380,
                                "name": "Soapnet",
                                "country": {"name": "United States", "code": "US", "timezone": "America/New_York"}
                            },
                            "webChannel": null,
                            "externals": {"tvrage": null, "thetvdb": 301692, "imdb": "tt1039251"},
                            "image": {
                                "medium": "http://static.tvmaze.com/uploads/images/medium_portrait/105/264683.jpg",
                                "original": "http://static.tvmaze.com/uploads/images/original_untouched/105/264683.jpg"
                            },
                            "summary": "<p>A spin-off of the ABC Daytime soap opera General Hospital, SOAPnet's first original scripted drama series follows the nighttime adventures of familiar and new characters around the hospital.</p>",
                            "updated": 1491944738,
                            "_links": {
                                "self": {"href": "http://api.tvmaze.com/shows/26874"},
                                "previousepisode": {"href": "http://api.tvmaze.com/episodes/1126737"}
                            }
                        }
                    }]).end();
                }
                if (searchstring == 'hello world') {
                    return res.status(200).json([{
                        "score": 19.64788, "show": {
                            "id": 16559,
                            "url": "http://www.tvmaze.com/shows/16559/hello-world",
                            "name": "Hello World",
                            "type": "Reality",
                            "language": "English",
                            "genres": [],
                            "status": "Running",
                            "runtime": 30,
                            "premiered": "2016-03-25"
                            ,
                            "officialSite": "http://www.bloomberg.com/features/2016-hello-world/",
                            "schedule": {"time": "21:30", "days": ["Friday"]},
                            "rating": {"average": null},
                            "weight": 0,
                            "network": {
                                "id": 172,
                                "name": "Bloomberg TV",
                                "country": {"name": "United States", "code": "US", "timezone": "America/New_York"}
                            },
                            "webChannel": null,
                            "externals": {"tvrage": 51691, "thetvdb": null, "imdb": null},
                            "image": {
                                "medium": "http://static.tvmaze.com/uploads/images/medium_portrait/55/137988.jpg",
                                "original": "http://static.tvmaze.com/uploads/images/original_untouched/55/137988.jpg"
                            },
                            "summary": "<p>This is a stubbed response<b>Hello World</b> invites the viewer to come on a journey. It's a journey that stretches across the globe to find the inventors, scientists and technologists shaping our future. Each episode explores a different country and uncovers the ways in which the local culture and surroundings have influenced their approach to technology. Join journalist and best-selling author Ashlee Vance on a quest to find the freshest, weirdest tech creations and the beautiful freaks behind them.</p>",
                            "updated": 1482891502,
                            "_links": {
                                "self": {"href": "http://api.tvmaze.com/shows/16559"},
                                "previousepisode": {"href": "http://api.tvmaze.com/episodes/1025561"}
                            }
                        }
                    }, {
                        "score": 19.64788,
                        "show": {
                            "id": 18830,
                            "url": "http://www.tvmaze.com/shows/18830/hello-world",
                            "name": "Hello World!",
                            "type": "Reality",
                            "language": "English",
                            "genres": ["Music", "Nature"],
                            "status": "To Be Determined",
                            "runtime": 30,
                            "premiered": "2016-07-09",
                            "officialSite": "http://www.discovery.com/tv-shows/hello-world/",
                            "schedule": {"time": "", "days": ["Saturday"]},
                            "rating": {"average": 9},
                            "weight": 0,
                            "network": {
                                "id": 66,
                                "name": "Discovery Channel",
                                "country": {"name": "United States", "code": "US", "timezone": "America/New_York"}
                            },
                            "webChannel": null,
                            "externals": {"tvrage": null, "thetvdb": 314154, "imdb": null},
                            "image": {
                                "medium": "http://static.tvmaze.com/uploads/images/medium_portrait/66/167295.jpg",
                                "original": "http://static.tvmaze.com/uploads/images/original_untouched/66/167295.jpg"
                            },
                            "summary": "<p>Presented in association with World Wildlife Fund (WWF), <b>Hello World</b>! is a six-part series taking a look at the wonders of the natural world through the eyes of some of today's most celebrated musicians. The series brings out the universal themes of the artists' music by using it as a soundtrack for the stories of animals in the wild.</p>",
                            "updated": 1479053699,
                            "_links": {
                                "self": {"href": "http://api.tvmaze.com/shows/18830"},
                                "previousepisode": {"href": "http://api.tvmaze.com/episodes/863817"}
                            }
                        }
                    }]).end();
                }
            }
        }
        next();
    };

    var getProxy = function(req,res)
    {
        console.log('getProxy');
        delete req.headers['referer'];
        delete req.headers['host'];
        req.headers['accept-encoding'] = 'deflate';

        var proxy = req.params.proxy;
        var url;
        if ('github' === proxy) {
           url = GITHUB_API_URL;
        }
        else if ('tvmaze' === proxy) {
           url = TVMAZE_API_URL;
        }
        else if ('travelwarning' === proxy) {
            url = 'https://www.reisewarnung.net/';
        }
        url += req.params.path;
        r({
            method: 'GET',
            headers: req.headers,
            url: url,
            qs: req.query
        }, function (err, proxyResponse, proxyBody) {

            if (err) {
                return res.status(500).send(err).end();
            }
            // console.log('GET',proxyBody,proxyResponse.statusCode,proxyResponse.headers);

            // 'transfer-encoding': 'chunked' error
            // res.set(proxyResponse.headers);
            return res
                .status(proxyResponse.statusCode)
                .send(proxyBody).end();
        });
    };

    router.get('/:proxy(github|tvmaze|travelwarning):path(*)', doStub,getProxy);

    router.post('/github:path(*)', function(req, res) {
        delete req.headers['referer'];
        delete req.headers['host'];
        req.headers['accept-encoding'] = 'deflate';
        // console.log('/github:path(*)',req.headers);
        r({
            method: 'POST',
            headers: req.headers,
            json: req.body,
            url: GITHUB_API_URL + req.params.path,
        }, function (err, proxyResponse, proxyBody) {
            if (err) {
                return res.status(500).send(err).end();
            }
            res.set(proxyResponse.headers);
            return res.status(proxyResponse.statusCode).send(proxyBody).end();
        });
    });

    module.router = router;

    return module;
};
