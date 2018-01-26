
(function addGithubReview() {
    //http://www.webdeveasy.com/angularjs-data-model/
    //https://api.github.com/repos/russjohnson09/coderuss/commits/4c20768f288af579519e887674ddcea5300a7d1d
    app.factory('Gitcommit', ['$http', function ($http) {
        function Gitcommit(data) {
            if (data) {
                this.setData(data);
            }
        };

        /**
         *     "head": {
        "label": "russjohnson09:0123_github_review",
        "ref": "0123_github_review",
            "base": {
        "label": "russjohnson09:master",
        "ref": "master",
        "sha": "f7b9cd77ff8691a57720160d672c23201e84ed47",
        {{BASE_URL}}/repos/russjohnson09/coderuss/pulls/{{pull.number}}
         * @type {string}
         */
        const GITHUB_API = '/v1/proxy/github';

        var context = '';
        Gitcommit.prototype = {
            setContext: function (val) {
                context = val;
            },
            getContext: function () {
                return context;
            },
            setData: function (data) {
                angular.extend(this, data);
            },
            getStats: function () {
                console.log('getStats', this, this.stats);
                if (typeof this.stats == 'undefined') {
                    this.stats = {};
                    this.populateCommit();
                }

                return this.stats;
            },
            populateStatus: function()
            {
                let self = this;
                self.statuses = {
                    _status: 'loading',
                    data: null
                };
                let url = GITHUB_API
                    + '/repos/russjohnson09/coderuss/commits/'+ self.sha+'/status';
                $http(
                    {
                        method: 'GET',
                        url: url,
                        // data: JSON.stringify(data),
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    let data = [];
                    if (response.data) {
                        self.statuses.data = response.data;
                    }
                });

            },
            getStatus: function() {
                let self = this;
                if (self.statuses === undefined) {
                    this.populateStatus();
                }
                return this.statuses;
                ///repos/russjohnson09/coderuss/commits/7e25704aba6189550820278c9bd453183551fb98/status
            },
            updateCommitStatusPending: function () {
                var self = this;
                var url = GITHUB_API
                    + '/repos/russjohnson09/coderuss/statuses/' + self.sha;

                var data = {
                    "state": "pending",
                    "target_url": window.location.origin + self.sha,
                    "description": "pending",
                    "context": self.getContext()
                };

                console.log('updateCommitStatusPending', data);

                $http(
                    {
                        method: 'POST',
                        url: url,
                        data: JSON.stringify(data),
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    console.log('updateCommitStatusPending', response);
                    if (response.data && response.data) {
                        self.setData(response.data);
                    }
                });
            },
            updateCommitStatusSuccess: function () {
                var self = this;
                var url = GITHUB_API
                    + '/repos/russjohnson09/coderuss/statuses/' + self.sha;

                var data = {
                    "state": "success",
                    "target_url": window.location.origin + self.sha,
                    "description": "success description",
                    "context": self.getContext()
                };

                console.log('updateCommitStatusPending', data);

                $http(
                    {
                        method: 'POST',
                        url: url,
                        data: JSON.stringify(data),
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    console.log('updateCommitStatusPending', response);
                    if (response.data && response.data) {
                        self.setData(response.data);
                    }
                });
            },
            populateCommit: function () {
                var self = this;
                console.log('populateCommit');
                var url = GITHUB_API
                    + '/repos/russjohnson09/coderuss/commits/' + self.sha;
                //X-GitHub-Request-Id
                //xsrfHeaderName
                console.log('populateCommit', url);

                $http(
                    {
                        method: 'GET',
                        url: url,
//                        xsrfHeaderName: 'X-GitHub-Request-Id ',
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
//                        params: {
////                            _proxy: 1,
////                            query: $scope.movie.query
//                        }
                    }
                ).then(function (response) {
                    console.log('populateCommit', response);
                    if (response.data && response.data) {
                        self.setData(response.data);
                    }
                });
//                /repos/russjohnson09/coderuss/commits/{{sha}}
//                $http.get()
//                    .then(function(data) {
//                        console.log(data);
//                });
            },
            loadCommitData: function (sha) {
                var scope = this;
                $http.get('ourserver/books/' + bookId).success(function (bookData) {
                    scope.setData(bookData);
                });
            },
            load: function (id) {
                var scope = this;
                $http.get('ourserver/books/' + bookId).success(function (bookData) {
                    scope.setData(bookData);
                });
            },
        };

        return Gitcommit;
    }]);


    app.factory('PullService', ['$http', function ($http) {

        let baseUrl = GITHUB_API;
        let service = {};

        //        {{BASE_URL}}/repos/russjohnson09/coderuss/pulls/{{pull.number}}

        service.getPulls = function()
        {
            let items = {
                _status: 'loading',
                data: null
            };
            let url = baseUrl + '/repos/russjohnson09/coderuss/pulls';

            $http(
                {
                    method: 'GET',
                    url: url,
//                        xsrfHeaderName: 'X-GitHub-Request-Id ',
                    headers: {
                        'content-type': 'application/json',
                        'cache-control': 'no-cache'
                    },
//                        params: {
////                            _proxy: 1,
////                            query: $scope.movie.query
//                        }
                }
            ).then(function (response) {
                if (response.data && response.data) {
                    items.data = response.data; //TODO ure PULL FACTORY.
                }
            });

            return items;
        };

        return service;
    }]);


    app.factory('Pull', ['$http', function ($http) {
        function Pull(data) {
            if (data) {
                this.setData(data);
            }
        };

        /**
         *     "head": {
        "label": "russjohnson09:0123_github_review",
        "ref": "0123_github_review",
            "base": {
        "label": "russjohnson09:master",
        "ref": "master",
        "sha": "f7b9cd77ff8691a57720160d672c23201e84ed47",
        {{BASE_URL}}/repos/russjohnson09/coderuss/pulls/{{pull.number}}
         * @type {string}
         */
        const GITHUB_API = '/v1/proxy/github';

        var context = '';
        Pull.prototype = {
            getContext: function () {
                return context;
            },
            setData: function (data) {
                angular.extend(this, data);
            },
            load: function (id) {
                // let url = GITHUB_API + '/repos/russjohnson09/coderuss/pulls/'
                // $http.get('ourserver/books/' + bookId).success(function (bookData) {
                //     scope.setData(bookData);
                // });
            },
        };

        return Gitcommit;
    }]);


    app.controller('gitreviewCtl', ['$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'Gitcommit','PullService',
        function ($rootScope, $cookies, $scope, $location, $http, $routeParams, Gitcommit,
                  PullService) {

            console.log('gitreviewCtl');

            console.log('cookies', $cookies.getAll());

            $scope.showIdx = {};

            $scope.toggleShow = function(idx)
            {
                let isShown = $scope.getShow(idx);
                console.log('showIdx',$scope.showIdx,isShown,!isShown);

                $scope.showIdx[idx] = !isShown;
            };

            $scope.getShow = function(idx)
            {
                return $scope.showIdx[idx] == true;
            };

            //        $scope.sha = $routeParams.sha;

            var gitcommit = $scope.gitcommit = new Gitcommit({sha: $routeParams.sha});

            $scope.statusPanelColor = function(state)
            {
                if (state === 'pending') {
                    return 'panel-warning';
                }
                else if (state === 'error') {
                    return 'panel-danger';
                }
                else if (state === 'success') {
                    return 'panel-success';
                }
                return 'panel-primary';
            };

            $scope.pulls = PullService.getPulls();

            var url = '/v1/ping';
            $http(
                {
                    method: 'GET',
                    url: url,
                    headers: {
                        'content-type': 'application/json',
                        'cache-control': 'no-cache'
                    },
                }
            ).then(function (response) {
                console.log(url, response);
                gitcommit.setContext(response.data.server.context);
            });
        }]);

})();