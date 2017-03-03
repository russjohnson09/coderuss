/**
 * Copyright 2010 Ajax.org B.V.
 *
 * This product includes software developed by
 * Ajax.org B.V. (http://www.ajax.org/).
 *
 * Author: Fabian Jaokbs <fabian@ajax.org>
 */

var util = require('util');
var AbstractApi = require("./abstract_api").AbstractApi;

/**
 * API wrapper for https://confluence.atlassian.com/display/BITBUCKET/user+Endpoint
 */
var UserApi = exports.UserApi = function(api) {
    this.$api = api;
};

util.inherits(UserApi, AbstractApi);

(function() {

    /**
     * Get user data
     */
    this.get = function(callback) {
        this.$api.get("user", null, null, callback);
    };
    
    /**
     * Get a list of repositories visible to an account
     */
    this.getRepositories = function(callback) {
        this.$api.get("user/repositories", null, null, callback);
    };

}).call(UserApi.prototype);