const MONGO_CONNECTION = process.env.MONGO_CONNECTION;
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;







module.exports = function(opts, callback) {
    const database = opts.database;
    const winston = opts.winston;


    const OauthClient = database.collection('oauth_client');

    const Migration = database.collection('coderuss_migration');



    var add_coderuss_oauth_client = '2017-04-06 add coderuss oauth client';

    // Migration.deleteOne({
    //     name: add_coderuss_oauth_client
    // }, function(err, result) {
    //     if (err) {
    //         winston.error(err);
    //     }
    //     else {
    //         winston.info(result.result);
    //     }
    // });

    Migration.findOne({
        name: add_coderuss_oauth_client
    }, function(err, result) {
        if (err) {
            return callback();
        }
        winston.info(err);
        if (!result) {
            doCoderussOauthClient(OauthClient, function(err, result) {
                if (err) {
                    winston.error(err);
                    return callback();
                }
                else {
                    Migration.insertOne({
                        name: add_coderuss_oauth_client,
                        created: Date.now()
                    }, function(err, result) {
                        winston.info(result.result);
                        return callback();
                    });
                }

            });

        }
        else {
            winston.info('no migrations to run');
            callback();
        }
    });


    function doCoderussOauthClient(OauthClient, callback) {

        var coderussClient = {
            _id: ObjectID(process.env.CODERUSS_CLIENT_ID),
            client_secret: process.env.CODERUSS_CLIENT_SECRET,
            redirect_uri: process.env.BASE_URL,
            created: Date.now()
        };

        OauthClient.findOne({
            _id: coderussClient._id
        }, function(err, result) {
            if (result) {
                winston.info('updating coderuss client');

                OauthClient.updateOne({
                    _id: coderussClient._id
                }, {
                    $set: coderussClient
                }, callback);
            }
            else {
                winston.info('inserting coderuss client');
                OauthClient.insertOne(coderussClient, callback);
            }
        });

    }
};
