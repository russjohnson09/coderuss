var request = require('request');
var expect = require("chai").expect;
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

const PORT = 3000;

const BASE_URL = "http://localhost:" + PORT;

describe(path.basename(__dirname), function () {

    let headers = {};



    let mainDataSourceId;
    describe('create data source', function() {
        let dataSource;
        it('/fitness/v1/users/me/dataSources POST', function() {

            let data = {
                'name': 'example-fit-heart-rate',
                "dataStreamId":
                    "raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456",
                'dataType': {
                    'field': [
                        {
                            "name": "bpm",
                            "format": "floatPoint"
                        }
                    ],
                    "name": "18811"
                },
                "application": {
                    "packageName": "com.example.fit.someapp",
                    "version": "1.0"
                },
                "device": {
                    "model": "fit-hrm-1",
                    "version": "2",
                    "type": "watch",
                    "uid": "123456",
                    "manufacturer":"Coderuss Fit"
                },
                "type": "raw"
            };

            //  "dataStreamId": "raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456",
            let dataStreamId = [
                data['type'],
                data['dataType']['name'],
                data['application']['packageName'],
                data['device']['manufacturer'],
                data['device']['model'],
                data['device']['uid'],
            ].join(':');
            expect(dataStreamId).to.be.equal(data['dataStreamId']);
            //dataStreamId = {}
        });

        /**
         POST /fitness/v1/users/me/dataSources HTTP/1.1
         Host: www.googleapis.com
         Content-length: 570
         Content-type: application/json
         Authorization: Bearer ya29.GlsZBTwli76hvf2AeKBfs1VPYD7gTGvcvlCzH5J1EleAiGazyRgjMdjT-57g7VmCf4RGYyCMc4shzO2wsCiVWa7Gephh54wzFZXQ-cZ5GLRhZPv7CGHDdLUOPq9z
         {
        "name": "example-fit-heart-rate",
        "dataStreamId":
            "raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456",
        "dataType": {
            "field": [{
                "name": "bpm",
                "format": "floatPoint"
            }],
            "name": "18811"
        },
        "application": {
            "packageName": "com.example.fit.someapp",
            "version": "1.0"
        },
        "device": {
            "model": "fit-hrm-1",
            "version": "2",
            "type": "watch",
            "uid": "123456",
            "manufacturer":"Coderuss Fit"
        },
        "type": "raw"
    }
         HTTP/1.1 200 OK
         Content-length: 492
         X-xss-protection: 1; mode=block
         X-content-type-options: nosniff
         Transfer-encoding: chunked
         Expires: Mon, 01 Jan 1990 00:00:00 GMT
         Vary: Origin, X-Origin
         Server: GSE
         Etag: "PjnfXIH-V-kHaIrgA_pwLjqdIzM/RvHehvPRXebshrN_ycN_JRg0kGc"
         Pragma: no-cache
         Cache-control: no-cache, no-store, max-age=0, must-revalidate
         Date: Tue, 05 Dec 2017 13:14:25 GMT
         X-frame-options: SAMEORIGIN
         Alt-svc: hq=":443"; ma=2592000; quic=51303431; quic=51303339; quic=51303338; quic=51303337; quic=51303335,quic=":443"; ma=2592000; v="41,39,38,37,35"
         Content-type: application/json; charset=UTF-8
         -content-encoding: gzip
         {
           "name": "example-fit-heart-rate",
           "dataQualityStandard": [],
           "dataType": {
             "field": [
               {
                 "name": "bpm",
                 "format": "floatPoint"
               }
             ],
             "name": "18811"
           },
           "application": {
             "packageName": "com.example.fit.someapp",
             "version": "1.0"
           },
           "device": {
             "model": "fit-hrm-1",
             "version": "2",
             "type": "watch",
             "uid": "123456",
             "manufacturer": "Coderuss Fit"
           },
           "dataStreamId": "raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456",
           "type": "raw"
         }
         */
    });


    describe('creating a duplicate data source', function() {
        it('/fitness/v1/users/me/dataSources POST 409');
        /**
         POST /fitness/v1/users/me/dataSources HTTP/1.1
         Host: www.googleapis.com
         Content-length: 570
         Content-type: application/json
         Authorization: Bearer ya29.GlsZBTwli76hvf2AeKBfs1VPYD7gTGvcvlCzH5J1EleAiGazyRgjMdjT-57g7VmCf4RGYyCMc4shzO2wsCiVWa7Gephh54wzFZXQ-cZ5GLRhZPv7CGHDdLUOPq9z
         {
        "name": "example-fit-heart-rate",
        "dataStreamId":
            "raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456",
        "dataType": {
            "field": [{
                "name": "bpm",
                "format": "floatPoint"
            }],
            "name": "18811"
        },
        "application": {
            "packageName": "com.example.fit.someapp",
            "version": "1.0"
        },
        "device": {
            "model": "fit-hrm-1",
            "version": "2",
            "type": "watch",
            "uid": "123456",
            "manufacturer":"Coderuss Fit"
        },
        "type": "raw"
    }
         HTTP/1.1 409 Conflict
         Content-length: 334
         X-xss-protection: 1; mode=block
         X-content-type-options: nosniff
         Transfer-encoding: chunked
         Expires: Tue, 05 Dec 2017 13:21:34 GMT
         Vary: Origin, X-Origin
         Server: GSE
         -content-encoding: gzip
         Cache-control: private, max-age=0
         Date: Tue, 05 Dec 2017 13:21:34 GMT
         X-frame-options: SAMEORIGIN
         Alt-svc: hq=":443"; ma=2592000; quic=51303431; quic=51303339; quic=51303338; quic=51303337; quic=51303335,quic=":443"; ma=2592000; v="41,39,38,37,35"
         Content-type: application/json; charset=UTF-8
         {
           "error": {
             "code": 409,
             "message": "Data Source: raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456 already exists",
             "errors": [
               {
                 "domain": "global",
                 "message": "Data Source: raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456 already exists",
                 "reason": "alreadyExists"
               }
             ]
           }
         }
         */
    });

    //get dataSources
    describe('/fitness/v1/users/me/dataSources GET 200', function() {

        /**
         GET /fitness/v1/users/me/dataSources HTTP/1.1
         Host: www.googleapis.com
         Content-length: 0
         Authorization: Bearer ya29.GlsZBTwli76hvf2AeKBfs1VPYD7gTGvcvlCzH5J1EleAiGazyRgjMdjT-57g7VmCf4RGYyCMc4shzO2wsCiVWa7Gephh54wzFZXQ-cZ5GLRhZPv7CGHDdLUOPq9z
         HTTP/1.1 200 OK
         Content-length: 2363
         X-xss-protection: 1; mode=block
         Content-location: https://www.googleapis.com/fitness/v1/users/me/dataSources
         X-content-type-options: nosniff
         Transfer-encoding: chunked
         Expires: Tue, 05 Dec 2017 13:22:37 GMT
         Vary: Origin, X-Origin
         Server: GSE
         Etag: "PjnfXIH-V-kHaIrgA_pwLjqdIzM/zD_TdTrJcMjY7L6trEdHaH_nmJA"
         Cache-control: private, max-age=0, must-revalidate, no-transform
         Date: Tue, 05 Dec 2017 13:22:37 GMT
         X-frame-options: SAMEORIGIN
         Alt-svc: hq=":443"; ma=2592000; quic=51303431; quic=51303339; quic=51303338; quic=51303337; quic=51303335,quic=":443"; ma=2592000; v="41,39,38,37,35"
         Content-type: application/json; charset=UTF-8
         -content-encoding: gzip
         {
           "dataSource": [
             {
               "name": "myDataSource",
               "dataStreamName": "",
               "dataType": {
                 "field": [
                   {
                     "name": "steps",
                     "format": "integer"
                   }
                 ],
                 "name": "com.google.step_count.delta"
               },
               "dataQualityStandard": [],
               "application": {
                 "version": "1",
                 "name": "Foo Example App",
                 "detailsUrl": "http://example.com"
               },
               "device": {
                 "model": "ExampleTablet",
                 "version": "1",
                 "type": "tablet",
                 "uid": "1000001",
                 "manufacturer": "Example Manufacturer"
               },
               "dataStreamId": "derived:com.google.step_count.delta:407408718192:Example Manufacturer:ExampleTablet:1000001:",
               "type": "derived"
             },
             {
               "name": "example-fit-heart-rate",
               "dataQualityStandard": [],
               "dataType": {
                 "field": [
                   {
                     "name": "bpm",
                     "format": "floatPoint"
                   }
                 ],
                 "name": "18810"
               },
               "application": {
                 "packageName": "com.example.fit.someapp",
                 "version": "1.0"
               },
               "device": {
                 "model": "fit-hrm-1",
                 "version": "2",
                 "type": "watch",
                 "uid": "8f98367c",
                 "manufacturer": "Coderuss Fit"
               },
               "dataStreamId": "raw:18810:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:8f98367c",
               "type": "raw"
             },
             {
               "name": "example-fit-heart-rate",
               "dataQualityStandard": [],
               "dataType": {
                 "field": [
                   {
                     "name": "bpm",
                     "format": "floatPoint"
                   }
                 ],
                 "name": "18811"
               },
               "application": {
                 "packageName": "com.example.fit.someapp",
                 "version": "1.0"
               },
               "device": {
                 "model": "fit-hrm-1",
                 "version": "2",
                 "type": "watch",
                 "uid": "8f98367c",
                 "manufacturer": "Coderuss Fit"
               },
               "dataStreamId": "raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:8f98367c",
               "type": "raw"
             },
             {
               "name": "example-fit-heart-rate",
               "dataQualityStandard": [],
               "dataType": {
                 "field": [
                   {
                     "name": "bpm",
                     "format": "floatPoint"
                   }
                 ],
                 "name": "digital-arbor-18810"
               },
               "application": {
                 "packageName": "com.example.fit.someapp",
                 "version": "1.0"
               },
               "device": {
                 "model": "example-fit-hrm-1",
                 "version": "1",
                 "type": "watch",
                 "uid": "8f98367c",
                 "manufacturer": "Example Fit"
               },
               "dataStreamId": "raw:digital-arbor-18810:com.example.fit.someapp:Example Fit:example-fit-hrm-1:8f98367c",
               "type": "raw"
             }
           ]
         }
         */
    });

    //add data points to datasource
    describe('/fitness/v1/users/me/dataSources/:dataSourceID/datasets/:startNanoSec-endNanoSec PATCH', function() {

        /**
         PATCH /fitness/v1/users/me/dataSources/raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456/datasets/1411053997000000000-1411057556000000000 HTTP/1.1
         Host: www.googleapis.com
         Content-length: 854
         Content-type: application/json
         Authorization: Bearer ya29.GlsZBTwli76hvf2AeKBfs1VPYD7gTGvcvlCzH5J1EleAiGazyRgjMdjT-57g7VmCf4RGYyCMc4shzO2wsCiVWa7Gephh54wzFZXQ-cZ5GLRhZPv7CGHDdLUOPq9z
         {
           "minStartTimeNs": 1411053997000000000,
           "maxEndTimeNs": 1411057556000000000,
           "dataSourceId":
               "raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456",
           "point": [
             {
               "startTimeNanos": 1411053997000000000,
               "endTimeNanos": 1411053997000000000,
               "dataTypeName": "com.google.heart_rate.bpm",
               "value": [
                 {
                   "fpVal": 78.8
                 }
               ]
             },
             {
               "startTimeNanos": 1411055000000000000,
               "endTimeNanos": 1411055000000000000,
               "dataTypeName": "com.google.heart_rate.bpm",
               "value": [
                 {
                   "fpVal": 89.1
                 }
               ]
             },
             {
               "startTimeNanos": 1411057556000000000,
               "endTimeNanos": 1411057556000000000,
               "dataTypeName": "com.google.heart_rate.bpm",
               "value": [
                 {
                   "fpVal": 62.45
                 }
               ]
             }
           ]
         }
         HTTP/1.1 400 Bad Request
         Content-length: 536
         X-xss-protection: 1; mode=block
         X-content-type-options: nosniff
         Transfer-encoding: chunked
         Expires: Tue, 05 Dec 2017 13:29:10 GMT
         Vary: Origin, X-Origin
         Server: GSE
         -content-encoding: gzip
         Cache-control: private, max-age=0
         Date: Tue, 05 Dec 2017 13:29:10 GMT
         X-frame-options: SAMEORIGIN
         Alt-svc: hq=":443"; ma=2592000; quic=51303431; quic=51303339; quic=51303338; quic=51303337; quic=51303335,quic=":443"; ma=2592000; v="41,39,38,37,35"
         Content-type: application/json; charset=UTF-8
         {
           "error": {
             "code": 400,
             "message": "DataSourceId in request: raw:18811:com.example.fit.someapp:CoderussFit:fit-hrm-1:123456 does not match DataSourceId in Dataset. raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456",
             "errors": [
               {
                 "domain": "global",
                 "message": "DataSourceId in request: raw:18811:com.example.fit.someapp:CoderussFit:fit-hrm-1:123456 does not match DataSourceId in Dataset. raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:123456",
                 "reason": "invalidArgument"
               }
             ]
           }
         }
         */
    })


    let dataSourceList = {
        "dataSource": [
            {
                "name": "myDataSource",
                "dataStreamName": "",
                "dataType": {
                    "field": [
                        {
                            "name": "steps",
                            "format": "integer"
                        }
                    ],
                    "name": "com.google.step_count.delta"
                },
                "dataQualityStandard": [],
                "application": {
                    "version": "1",
                    "name": "Foo Example App",
                    "detailsUrl": "http://example.com"
                },
                "device": {
                    "model": "ExampleTablet",
                    "version": "1",
                    "type": "tablet",
                    "uid": "1000001",
                    "manufacturer": "Example Manufacturer"
                },
                "dataStreamId": "derived:com.google.step_count.delta:407408718192:Example Manufacturer:ExampleTablet:1000001:",
                "type": "derived"
            },
            {
                "name": "example-fit-heart-rate",
                "dataQualityStandard": [],
                "dataType": {
                    "field": [
                        {
                            "name": "bpm",
                            "format": "floatPoint"
                        }
                    ],
                    "name": "18810"
                },
                "application": {
                    "packageName": "com.example.fit.someapp",
                    "version": "1.0"
                },
                "device": {
                    "model": "fit-hrm-1",
                    "version": "2",
                    "type": "watch",
                    "uid": "8f98367c",
                    "manufacturer": "Coderuss Fit"
                },
                "dataStreamId": "raw:18810:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:8f98367c",
                "type": "raw"
            },
            {
                "name": "example-fit-heart-rate",
                "dataQualityStandard": [],
                "dataType": {
                    "field": [
                        {
                            "name": "bpm",
                            "format": "floatPoint"
                        }
                    ],
                    "name": "18811"
                },
                "application": {
                    "packageName": "com.example.fit.someapp",
                    "version": "1.0"
                },
                "device": {
                    "model": "fit-hrm-1",
                    "version": "2",
                    "type": "watch",
                    "uid": "8f98367c",
                    "manufacturer": "Coderuss Fit"
                },
                "dataStreamId": "raw:18811:com.example.fit.someapp:Coderuss Fit:fit-hrm-1:8f98367c",
                "type": "raw"
            },
            {
                "name": "example-fit-heart-rate",
                "dataQualityStandard": [],
                "dataType": {
                    "field": [
                        {
                            "name": "bpm",
                            "format": "floatPoint"
                        }
                    ],
                    "name": "digital-arbor-18810"
                },
                "application": {
                    "packageName": "com.example.fit.someapp",
                    "version": "1.0"
                },
                "device": {
                    "model": "example-fit-hrm-1",
                    "version": "1",
                    "type": "watch",
                    "uid": "8f98367c",
                    "manufacturer": "Example Fit"
                },
                "dataStreamId": "raw:digital-arbor-18810:com.example.fit.someapp:Example Fit:example-fit-hrm-1:8f98367c",
                "type": "raw"
            }
        ]
    };

    return;

    describe('/v1/login', function() {
        it("successfully login with admin@foo.com:admin@foo.com", function(done) {
            username = 'admin@foo.com';
            request({
                method: "POST",
                json: {
                    "username": username,
                    "password": "admin@foo.com"
                },
                uri: BASE_URL + '/v1/login'
            }, function(error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(201);
                expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                expect(response.headers['set-cookie']).not.to.be.undefined;
                cookie = response.headers['set-cookie'];
                done();
            });
        });
    });

    describe('fitbit', function () {
        describe('/v1/fitbit as admin', function () {
            it("successfully login", function (done) {
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/fitbit',
                    headers: {
                        Cookie: cookie
                    }
                }, function (error, response, body) {
                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });
    })


});