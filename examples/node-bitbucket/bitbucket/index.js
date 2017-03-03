/**
 * Copyright 2010 Ajax.org B.V.
 *
 * This product includes software developed by
 * Ajax.org B.V. (http://www.ajax.org/).
 *
 * Author: Fabian Jaokbs <fabian@ajax.org>
 */

var Request = require("./request").Request;

/**
 * Simple JavaScript GitHub API
 *
 * Based on the PHP GitHub API project http://github.com/ornicar/php-github-api
 */

var BitBucket = exports.BitBucket = function(debug, proxy, http) {
    /**
     * Use debug mode (prints debug messages)
     */
    this.$debug = debug;
    
    /**
     * Define HTTP proxy in format localhost:3128
     */
    if (proxy) {
        this.$proxy_host = proxy.split(':')[0];
        this.$proxy_port = proxy.split(':')[1];
    }
    if (http) {
        this.$use_http = true;
    }
    /**
     * The list of loaded API instances
     */
    this.$apis = [];
};

(function() {

    /**
     * The request instance used to communicate with GitHub
     */
    this.$request = null;

    /**
     * Authenticate a user for all next requests
     *
     * @param {String} login      GitHub username
     * @param {String} token      GitHub private token
     * @return {GitHubApi}        fluent interface
     */
    this.authenticate = function(login, token) {
        console.log("Deprecated: use 'authenticateToken' instead!");
        return this.authenticateToken(login, token);
    };
    
    /**
     * Authenticate a user for all next requests using an API token
     *
     * @param {String} login      GitHub username
     * @param {String} token      GitHub API token
     * @return {GitHubApi}        fluent interface
     */
    this.authenticateToken = function(login, token)
    {
        this.getRequest()
            .setOption("login_type", "token")
            .setOption('username', login)
            .setOption('api_token', token);

        return this;
    };
    
    /**
     * Authenticate a user for all next requests using an API token
     *
     * @param {String} login      GitHub username
     * @param {String} password   GitHub password
     * @return {GitHubApi}        fluent interface
     */
    this.authenticatePassword = function(login, password)
    {
        this.getRequest()
            .setOption("login_type", "basic")
            .setOption('username', login)
            .setOption('password', password);

        return this;
    };
    
    /**
     * Authenticate a user for all next requests using an API token
     *
     * @param {OAuth} oauth      
     * @param {String} accessToken
     * @return {GitHubApi}        fluent interface
     */
    this.authenticateOAuth = function(oauth, accessToken, accessTokenSecret)
    {
        this.getRequest()
            .setOption("login_type", "oauth")
            .setOption('oauth', oauth)
            .setOption('oauth_access_token', accessToken)
            .setOption('oauth_access_token_secret', accessTokenSecret);
    
        return this;
    };    

    /**
     * Deauthenticate a user for all next requests
     *
     * @return {GitHubApi}               fluent interface
     */
    this.deAuthenticate = function() {
        this.getRequest()
            .setOption("login_type", "none");
            
        return this;
    };

    /**
     * Call any route, GET method
     * Ex: api.get('repos/show/my-username/my-repo')
     *
     * @param {String}  route            the GitHub route
     * @param {Object}  parameters       GET parameters
     * @param {Object}  requestOptions   reconfigure the request
     */
    this.get = function(route, parameters, requestOptions, callback) {
        return this.getRequest().get(route, parameters || {}, requestOptions, callback);
    };
    
    /**
     * Call any route, DELETE method
     * Ex: api.delete('repos/show/my-username/my-repo')
     *
     * @param {String}  route            the GitHub route
     * @param {Object}  parameters       GET parameters
     * @param {Object}  requestOptions   reconfigure the request
     */
    this["delete"] = function(route, parameters, requestOptions, callback) {
        return this.getRequest().send(route, parameters, 'DELETE', requestOptions, callback);
    };

    /**
     * Call any route, POST method
     * Ex: api.post('repos/show/my-username', {'email': 'my-new-email@provider.org'})
     *
     * @param {String}  route            the GitHub route
     * @param {Object}  parameters       POST parameters
     * @param {Object}  requestOptions   reconfigure the request
     */
    this.post = function(route, parameters, requestOptions, callback) {
        return this.getRequest().post(route, parameters || {}, requestOptions, callback);
    };

    /**
     * Get the request
     *
     * @return {Request}  a request instance
     */
    this.getRequest = function()
    {
        if(!this.request) {
            this.request = new Request({debug: this.$debug, "proxy_host": this.$proxy_host, "proxy_port": this.$proxy_port, "protocol" : this.$use_http? "http": "https"});
        }

        return this.request;
    };

    /**
     * Get the user API
     *
     * @return {UserApi}  the user API
     */
    this.getUserApi = function()
    {
        if(!this.$apis.user) {
            this.$apis.user = new (require("./user").UserApi)(this);
        }

        return this.$apis.user;
    };

    /**
     * Get the users API
     *
     * @return {UsersApi}  the users API
     */
    this.getUsersApi = function()
    {
        if(!this.$apis.users) {
            this.$apis.users = new (require("./users").UsersApi)(this);
        }

        return this.$apis.users;
    };

    /**
     * Get the repo API
     *
     * @return {RepoApi}  the repo API
     */
    this.getRepoApi = function()
    {
        if(!this.$apis.repo) {
            this.$apis.repo = new (require("./repo").RepoApi)(this);
        }

        return this.$apis.repo;
     };
     
    /**
     * Get the ssh API
     *
     * @return {SshApi}  the SSH API
     */
    this.getSshApi = function()
    {
        if(!this.$apis.ssh) {
            this.$apis.ssh = new (require("./ssh").SshApi)(this);
        }

        return this.$apis.ssh;
     };
     
    /**
     * Get the email API
     *
     * @return {EmailApi}  the email API
     */
    this.getEmailApi = function()
    {
        if(!this.$apis.email) {
            this.$apis.email = new (require("./email").EmailApi)(this);
        }

        return this.$apis.email;
     };

//    /**
//     * Get the issue API
//     *
//     * @return {IssueApi} the issue API
//     */
//    this.getIssueApi = function()
//    {
//        if(!this.$apis['issue']) {
//            this.$apis['issue'] = new (require("./github/IssueApi").IssueApi)(this);
//        }
//
//        return this.$apis['issue'];
//    };
//
//    /**
//     * Get the pull API
//     *
//     * @return {PullApi} the pull API
//     */
//    this.getPullApi = function()
//    {
//        if(!this.$apis['pull']) {
//            this.$apis['pull'] = new (require("./github/PullApi").PullApi)(this);
//        }
//
//        return this.$apis['pull'];
//    };
//
//    /**
//     * Get the object API
//     *
//     * @return {ObjectApi} the object API
//     */
//    this.getObjectApi = function()
//    {
//        if(!this.$apis['object']) {
//            this.$apis['object'] = new (require("./github/ObjectApi").ObjectApi)(this);
//        }
//
//        return this.$apis['object'];
//    };
//
//    /**
//     * Get the commit API
//     *
//     * @return {CommitTest} the commit API
//     */
//    this.getCommitApi = function()
//    {
//        if(!this.$apis['commit']) {
//            this.$apis['commit'] = new (require("./github/CommitApi").CommitApi)(this);
//        }
//
//        return this.$apis['commit'];
//    };

}).call(BitBucket.prototype);