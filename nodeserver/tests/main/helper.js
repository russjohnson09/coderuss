let helper = {
    BASE_URL: 'http://localhost:3000'
};


module.exports = function(opts)
{
    /**
     *
     * @param opts
     * @param cb headers to use in the response
     */
    helper.login = function(opts,cb)
    {
        request({
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                "username": "user123",
                "password": "user123"
            }),
            uri: helper.BASE_URL
        }, function (error, response, body) {
            cb (response.headers);
        });
    };

    return helper;
};