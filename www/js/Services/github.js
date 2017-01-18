angular.module('gitphaser').service('GitHub', GitHub);
/**
 * @ngdoc service
 * @module  gitphaser
 * @name  gitphaser.service:GitHub
 * @description  Provides access to the GitHub API
 */
function GitHub (
  $rootScope, 
  $http, 
  $q, 
  $auth, 
  $cordovaOauth, 
  $cordovaKeychain, 
  $ionicPlatform, 
  $github) 
{
  var self = this;

  // ------------------------------   Utilities  ------------------------------------
  // Keys
  var id = secure.github.id;          // oAuth Github id
  var secret = secure.github.secret;  // oAuth Github secret
  var perm = ['user:follow'];         // oAuth Github requested permissions
  var keychain = $cordovaKeychain;     // Keychain service

  /**
   * Checks cache to see if we have recently loaded this profile. Clears cache every
   * 'cache_time'
   * @param  {String} username GitHub.login
   * @return {Object} account OR null if not found
   */
  function accountCached (username) {
    var account;
    var now = new Date();

    for (var i = 0; i < self.cache.length; i++) {
      account = self.cache[i];
      if (account.info.login === username) {
        if (moment(account.cached_at).isSame(now, self.cache_time)) {
          return account;
        } else {
          self.cache.splice(i, 1);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Attempts to retrieve contributions graph from account cache
   * @param  {String} username  GitHub login value
   * @return {String} svg       An svg string representing the contributions graph OR
   *                            null if not found
   */
  function graphCached (username) {
    for (var i = 0; i < self.cache.length; i++) {
      if (self.cache[i].info.login === username && self.cache[i].graph) {
        return self.cache[i].graph;
      }
    }
    return null;
  }

  /**
   * Caches contributions graph
   * @param  {String} username Github login value
   * @param  {String} svg      An svg string representing the contributions graph
   * @return {boolean}         Returns true if the graph was cached, null if user wasn't found.
   */
  function cacheGraph (username, svg) {
    for (var i = 0; i < self.cache.length; i++) {
      if (self.cache[i].info.login === username) {
        self.cache[i].graph = svg;
        return true;
      }
    }
    return null;
  }

  /**
   * Compiles commit metrics and generates list of issues open/closed from
   * events object returned by GitHub
   * @param  {Array} events Array of Github event objects
   * @return {Object} parsed Object containing user's commits and issues
   */
  function parseEvents (events) {
    var duplicate = false;

    var parsed = {
      commits: {},
      commits_total: 0,
      issues: [],
      issues_total: 0
    };

    angular.forEach(events, function (event) {
      // Commits
      if (event.type === 'PushEvent') {
        var name = event.repo.name;
        var date = event.created_at;

        if (!parsed.commits[name]) {
          parsed.commits[name] = {};
          parsed.commits[name].name = name;
          parsed.commits[name].url = 'https://github.com/' + event.repo.name,
          parsed.commits[name].size = event.payload.distinct_size;
          parsed.commits[name].first = date;
          parsed.commits[name].last = date;
        } else {
          parsed.commits[name].size += event.payload.distinct_size;
        }

        // Update total commits
        parsed.commits_total += event.payload.distinct_size;

        // Update timespan
        if (moment(date).isBefore(parsed.commits[name].first)) {
          parsed.commits[name].first = date;
        }
        if (moment(date).isAfter(parsed.commits[name].last)) {
          parsed.commits[name].last = date;
        }

      // Issues
      } else if (event.type === 'IssuesEvent') {
        if (event.payload.action === 'opened' || event.payload.action == 'closed') {
          var issue = {
            repo: event.repo.name,
            url: 'https://github.com/' + event.repo.name,
            action: event.payload.action,
            title: event.payload.issue.title,
            state: event.payload.issue.state,
            number: event.payload.issue.number,
            issue_url: event.payload.issue.url,
            date: event.payload.issue.updated_at
          };

          // Eliminate stale issues
          // Github lists in 'most recent' order.
          duplicate = false;
          angular.forEach(parsed.issues, function (item) {
            if (item.number === issue.number) {
              duplicate = true;
            }
          });

          if (!duplicate) {
            parsed.issues.push(issue);
          }
        }
      }
    });
    parsed.issues_total = parsed.issues.length;
    return parsed;
  }

  // ------------------------------  Public API ------------------------------------
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.me
   * @description `Object`: The user's profile
   */
  self.me = null; // The user profile;
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.repos
   * @description `Array`: The users public repos
   */
  self.repos = null;
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.api
   * @description `Object`: GitHub.js api
   */
  self.api = null; // GitHub.js api
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.cache
   * @description `Array`: Cached account object and contrib graphs fetched from Github
   */
  self.cache = [];
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.cache_time
   * @description `String`: Duration to cache for. Options are: second, minute, hour, week
   */
  self.cache_time = 'hour';

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.setAuthToken
   * @param {String} Github token acquired by user during oAuth login
   * @description Sets authToken when app is already authenticated
   *              from previous use.
   */
  self.setAuthToken = function (token) {
    var where = 'GitHub:setAuthToken';
    var key = 'gh_token';

    if ($rootScope.DEV) {
      $github.setOauthCreds(secure.github.auth);
    }

    window.localStorage[key] = token;
    $github.setOauthCreds(token);
  };

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.getAuthToken
   * @description Convenience method to get authToken when it needs to be saved in user account.
   * @returns { String } authToken Github token acquired by user during oAuth login
   */
  self.getAuthToken = function () {
    var key = 'gh_token';

    return ($rootScope.DEV)
      ? secure.github.auth
      : window.localStorage[key];
  };

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.initialize
   * @description Invoked in the routing resolve at tab/nearby - if user autologs into Meteor,
   *              we still need to fetch a fresh GitHub profile for them. Only initializes
   *              if self.me doesn't exist yet.
   * @returns {Promise} Resolves when github responds with profile, rejects with 'AUTH_REQUIRED'
   */
  self.initialize = function () {
    var token;
    var where = 'GitHub:initialize';
    var d = $q.defer();

    if (!self.me) {
      $auth.requireUser()
        .then(function () {
          token = self.getAuthToken();
          $github.setOauthCreds(token);
          self.getMe()
            .then(function () { d.resolve(); })
            .catch(function () { d.reject('AUTH_REQUIRED'); });
        })
        .catch(function () { d.reject('AUTH_REQUIRED'); });
    } else d.resolve();

    return d.promise;
  };

  self.devInitialize = function () {
    $github.setOauthCreds(secure.github.auth);
  };

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.authenticate
   * @description Logs user into GitHub via inAppBroswer. Sets authToken
   * @returns {Promise} Resolves on success, rejects if $cordovaOauth fails.
   */
  self.authenticate = function () {
    var token;
    var where = 'GitHub:authenticate';
    var d = $q.defer();
    var uri = { redirect_uri: 'http://cyclop.se/help'};

    $ionicPlatform.ready(function () {
      $cordovaOauth.github(id, secret, perm, uri)
        .then(function (result) {
          token = result.split('&')[0].split('=')[1];
          self.setAuthToken(token);
          logger(where, token);
          d.resolve();
        }, function (e) {
          logger(where, e);
          d.reject(e);
        });
    });

    return d.promise;
  };

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.getMe
   * @description Collects user's profile info, repos, events and followers from Github.
   * @returns {Promise} Resolves on success.
   */
  self.getMe = function () {
    var where = 'GitHub:getMe';
    var d = $q.defer();

    // Get API, then current user profile, then full account info.
    $github.getUser()
      .then(function (user) {
        user.show(null)
      .then(function (info) {
        self.getAccount(info.login, user)
      .then(function (account) {
        self.api = user;
        self.me = account.info;
        self.repos = account.repos;
        self.events = account.events;
        self.followers = account.followers;
        self.following = account.following;
        d.resolve();
      })
      .catch(function (e) { logger(where + 'last ', JSON.stringify(e)); d.reject(e); });
      })
      .catch(function (e) { logger(where + 'account ', JSON.stringify(e)); d.reject(e); });
      })
      .catch(function (e) { logger(where + 'show ', JSON.stringify(e)); d.reject(e); });

    return d.promise;
  };

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.getAccount
   * @param { string } username User's github login name
   * @param { object}  auth_api GitHub.js api initialized with users oAuth credentials
   * @description Gets GitHub profile, public repos and public events from GitHub
   *              for an arbitrary user
   * @returns {Promise} Resolves account object on success.
   */
  self.getAccount = function (username, auth_api) {
    var cached, api;
    var where = 'GitHub:getMe';
    var d = $q.defer();
    var account = {};

    cached = accountCached(username);

    // Check cache
    if (cached) {
      d.resolve(cached);
    } else {
      // Service either initialized or initializing with auth_api param
      (auth_api === undefined)
        ? api = self.api
        : api = auth_api;

      // Get profile, then repos, then events, then followers
      $q.all([
        api.show(username),
        api.userRepos(username),
        api.userEvents(username),
        api.userFollowers(username),
        api.userFollowing(username)
      ])
      .then(function (results) {
        account.info = results[0];
        account.repos = results[1];
        account.events = parseEvents(results[2]);
        account.followers = results[3];
        account.following = results[4];
        account.cached_at = new Date();
        self.cache.push(account);

        d.resolve(account);
      })
      .catch(function (e) {
        logger(where, JSON.stringify(e));
        d.reject(e);
      });
    }
    return d.promise;
  };

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.getContribGraph
   * @param { string } username Any github login name
   * @description Retrieves svg string representing a contributions graph from cache
   *              or by having the Meteor server fetch it.
   * @returns {Promise} Resolves svg string.
   */
  self.getContribGraph = function (username) {
    var d = $q.defer();
    var url = 'https://github.com/users/' + username + '/contributions';
    var where = 'GitHub:getContribGraph';
    var cached = graphCached(username);

    if (cached) {
      d.resolve(cached);
    } else {
      Meteor.call('getContributions', url, function (err, response) {
        if (err) {
          logger(where, err);
          d.reject(err);
        } else {
          cacheGraph(username, response);
          d.resolve(response);
        }
      });
    }
    return d.promise;
  };

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.canFollow
   * @param { string } username GitHub login name of the target to follow.
   * @description  Searches the users following list to see if target is
   *               already followed.
   * @returns {boolean} Returns true if user can follow person, false otherwise.
   */
  self.canFollow = function (username) {
    var can = true;
    angular.forEach(self.following, function (following) {
      if (following.login === username) {
        can = false;
      }
    });
    return can;
  };

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:GitHub
   * @name  gitphaser.service:GitHub.follow
   * @param { string } username GitHub login name of the target to follow.
   * @description  Attempts to follow the user specified by param username.
   *               Increments follower/following metrics and adds a mock follower
   *               to the followers array to keep cache current w/ GitHub remote.
   * @returns {promise} Resolves on success, rejects on error
   */
  self.follow = function (user) {
    var d = $q.defer();

    self.api && self.api.follow(user.login)
      .then(function () {
        self.me.following++;
        user.followers++;
        self.followers.push({login: user.login});
        d.resolve();
      }, function (e) { d.reject(); });
    return d.promise;
  };

  // DEVELOPMENT INIT;
  if ($rootScope.DEV) {
    self.setAuthToken(secure.github.auth);
  }
}
