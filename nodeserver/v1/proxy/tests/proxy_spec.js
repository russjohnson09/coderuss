var request = require('request');
var expect = require("chai").expect;
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

const PORT = 3000;

const BASE_URL = "http://localhost:" + PORT;


//TODO add to other user funds
describe(path.basename(__dirname), function () {

    let headers = {};

    let user = {
        username: 'admin@foo.com',
        password: 'admin@foo.com'
    };

    describe('/v1/login', function () {
        it("successfully login with admin@foo.com:admin@foo.com", function (done) {
            request({
                method: "POST",
                json: {
                    "username": user.username,
                    "password": user.password
                },
                uri: BASE_URL + '/v1/login'
            }, function (error, response, body) {
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


    let user_profile = {};
    //GET USER_PROFILE with their amount
    describe('/v1/proxy/travelwarning/api GET', function() {
        it("/v1/proxy/travelwarning/api GET", function (done) {
            request({
                method: "GET",
                uri: BASE_URL + '/v1/proxy/travelwarning/api',
                headers: {
                    Cookie: cookie,
                    'content-type': 'application/json'
                },
            }, function (error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(200);

                user_profile = JSON.parse(body);
                // expect(user_profile.amount).not.to.be.undefined;
                done();
            });
        });

    });



    //https://www.npmjs.com/package/winston-rsyslog

    //https://blog.heroku.com/websockets-public-beta
    //https://gist.github.com/sid24rane/6e6698e93360f2694e310dd347a2e2eb

    //http://blog.papertrailapp.com/introducing-syslog-ratelimits/

    //syslog sender must be non-blocking is the major issue.


    //https://www.loggly.com/docs/troubleshooting-rsyslog/

    //TroubleshootingTest send
    //logger -p local0.error "TroubleshootingTest"

    //sudo cat /var/log/syslog

    //syslog -> file -> tcp transfer

    //*.*          @127.0.0.1/v1/hook:3000

    //*.*          @@127.0.0.1:1337

    //http://kb.monitorware.com/kbeventdb-detail-id-6904.html



    //https://gist.github.com/tedmiston/5935757
    //https://gist.github.com/creationix/707146
    // var net = require('net');

    // var server = net.createServer(function(socket) {
    //     socket.write('Echo server\r\n');
    //     socket.pipe(socket);
    //
    //
    //
    //     socket.on('data', function (data) {
    //         console.log(socket.name + "> " + data, socket);
    //     });
    //
    //     // Remove the client from the list when it leaves
    //     socket.on('end', function () {
    //         // clients.splice(clients.indexOf(socket), 1);
    //         console.log(socket.name + " left the chat.\n");
    //     })
    // });
    //
    // //https://www.digitalocean.com/community/tutorials/how-to-use-netcat-to-establish-and-test-tcp-and-udp-connections-on-a-vps
    // //netcat -z -v localhost 1337
    // server.listen(1337, '127.0.0.1');


    // var client = new net.Socket();
    // client.connect(3000, '127.0.0.1', function() {
    //     console.log('Connected');
    //     client.write('Hello, server! Love, Client.');
    // });
    //
    // client.on('data', function(data) {
    //     // console.log('Received: ' + data.toString());
    //     client.destroy(); // kill client after server's response
    // });
    //
    // client.on('close', function() {
    //     console.log('Connection closed');
    // });

});