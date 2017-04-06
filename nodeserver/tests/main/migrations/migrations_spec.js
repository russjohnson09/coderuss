require('dotenv').config();


const MONGO_CONNECTION = process.env.MONGO_CONNECTION;
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const expect = require('chai').expect;
const path = require('path');

describe(path.basename(__dirname), function() {
    describe('connect to mongodb', function() {
        it('using MongoClient', function(done) {
            MongoClient.connect(MONGO_CONNECTION, function(err, db) {
                database = db;

                OauthClient = database.collection('oauth_client');

                Migration = database.collection('coderuss_migration');

                done();
            });
        });
    });

    describe('migrations ran', function() {
        describe('2017-04-06 add coderuss oauth client', function() {
            it('migration exists', function(done) {
                Migration.findOne({
                    name: '2017-04-06 add coderuss oauth client'
                }, function(err, result) {
                    expect(err).to.be.null;
                    expect(result).not.to.be.empty;
                    expect(result.created).to.be.a('number');
                    expect(result.name).to.be.a('string');
                    done();
                })
            })
            it('oauth client created', function(done) {
                OauthClient.findOne({
                    _id: ObjectID(process.env.CODERUSS_CLIENT_ID)
                }, function(err, result) {
                    expect(err).to.be.null;
                    expect(result).not.to.be.empty;
                    expect(result.client_secret).to.be.a('string');
                    console.log(result);
                    done();
                })
            });
        })
 
    });

});





// module.exports = function(opts, callback) {
//     const database = opts.database;
//     const winston = opts.winston;


//     const OauthClient = database.collection('oauth_client');

//     const Migration = database.collection('coderuss_migration');



//     var add_coderuss_oauth_client = '2017-04-06 add coderuss oauth client';

//     // Migration.deleteOne({
//     //     name: add_coderuss_oauth_client
//     // }, function(err, result) {
//     //     if (err) {
//     //         winston.error(err);
//     //     }
//     //     else {
//     //         winston.info(result.result);
//     //     }
//     // });

//     Migration.findOne({
//         name: add_coderuss_oauth_client
//     }, function(err, result) {
//         if (err) {
//             return callback();
//         }
//         winston.info(err);
//         if (!result) {
//             doCoderussOauthClient(OauthClient, function(err, result) {
//                 if (err) {
//                     winston.error(err);
//                     return callback();
//                 }
//                 else {
//                     Migration.insertOne({
//                         name: add_coderuss_oauth_client,
//                         created: Date.now()
//                     }, function(err, result) {
//                         winston.info(result.result);
//                         return callback();
//                     });
//                 }

//             });

//         }
//         else {
//             winston.info('no migrations to run');
//             callback();
//         }
//     });


//     function doCoderussOauthClient(OauthClient, callback) {

//         var coderussClient = {
//             _id: ObjectID(process.env.CODERUSS_CLIENT_ID),
//             client_secret: process.env.CODERUSS_CLIENT_SECRET,
//             redirect_uri: process.env.BASE_URL
//         };

//         // Migration.deleteOne({
//         //     _id: coderussClient._id
//         // }, function(err, result) {
//         //     if (err) {
//         //         winston.error(err);
//         //     }
//         //     else {
//         //         winston.info(result.result);
//         //     }
//         // });

//         OauthClient.findOne({
//             _id: coderussClient._id
//         }, function(err, result) {
//             if (result) {
//                 OauthClient.updateOne({
//                     _id: coderussClient
//                 }, {
//                     $set: coderussClient
//                 }, callback);
//             }
//             else {
//                 OauthClient.insertOne(coderussClient, callback);
//             }
//         });

//     }
// };
