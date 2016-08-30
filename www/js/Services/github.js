//
// @service: GitHub
// A service for interacting w/ the github.js api

var gh_debug, gh_debugII, gh_debugIII;
angular.module('gitphaser')
  .service("GitHub", GitHub);

function GitHub($rootScope, $http, $q, $auth, $cordovaOauth, $ionicPlatform, $github){

    var self = this;
    
    // ------------------------------   PRIVATE  ------------------------------------
    // Keys
    var id = secure.github.id;
    var secret = secure.github.secret;
    var state = "u79z234c06nq";
    var perm = [];
   

    // PRODUCTION 
    var authToken = null;
    // DEVELOPMENT
    authToken = '4b6e119a5365ffdbe93f523a6a98bc8c2adf278f';

    // @function: accountCached
    // @param: String (github login value)
    // @return: account object || null if not found
    //
    // Checks cache to see if we have recently loaded this profile
    // Clears cache every 'cache_time'
    function accountCached(username){

        var account;
        var now = new Date();

        for(var i = 0; i < self.cache.length; i++){

            account = self.cache[i];

            if (account.info.login === username){

                if(moment(account.cached_at).isSame(now, self.cache_time )){
                   return account;
                } else {   
                   self.cache.splice(i, 1);
                   return null;
                }
            }
        };
      
        // Not Found
        return null;
    }

    // @function: graphCached
    // @param: String (github login value)
    // @return: String (svg) || null if not found
    //
    // Attempts to retrieve graph from account cache 
    function graphCached(username){

        for(var i = 0; i < self.cache.length; i++){

            if (self.cache[i].info.login === username && self.cache[i].graph ){
                return self.cache[i].graph;
            }
        };  
        // Not Found
        return null;
    }

    // @function: graphCached
    // @param: String (github.info.login), String (svg html string)
    // @return: true on success, false on failure
    //
    // Attempts to retrieve graph from account cache 
    function cacheGraph(username, svg){

        for(var i = 0; i < self.cache.length; i++){

            if (self.cache[i].info.login === username){
               self.cache[i].graph = svg;
               return true;
            }
        };  
        // Not Found
        return null;
    }

    // @function: parseEvents
    // @param: JSON array of GitHub events
    // @return: {commits: {}, issues: []}
    //
    // Compiles commit metrics and generates list of issues open/closed from
    // events object returned by GitHub
    function parseEvents(events){
      
        var duplicate = false;

        var parsed = {
            commits: {},
            commits_total: 0,
            issues: [],
            issues_total: 0
        };

        angular.forEach(events, function(event){

            // Commits
            if (event.type === 'PushEvent'){

                var name = event.repo.name;
                var date = event.created_at;

                if (!parsed.commits[name]){

                   parsed.commits[name] = {};
                   parsed.commits[name].name = name;
                   parsed.commits[name].url = event.repo.url;
                   parsed.commits[name].size = event.payload.distinct_size;
                   parsed.commits[name].first = date;
                   parsed.commits[name].last = date;

                } else {
                   parsed.commits[name].size += event.payload.distinct_size
                }

                // Update total commits
                parsed.commits_total += event.payload.distinct_size;

                // Update timespan
                if (moment(date).isBefore(parsed.commits[name].first)){
                   parsed.commits[name].first = date;
                }; 

                if (moment(date).isAfter(parsed.commits[name].last)) {
                   parsed.commits[name].last = date;
                };

            // Issues
            } else if (event.type === 'IssuesEvent'){

                if (event.payload.action === 'opened' || event.payload.action == 'closed'){

                    var issue = {
                        repo: event.repo.name,
                        repo_url: event.repo.url,
                        action: event.payload.action,
                        title: event.payload.issue.title,
                        state: event.payload.issue.state,
                        number: event.payload.issue.number,
                        issue_url: event.payload.issue.url,
                        date: event.payload.issue.updated_at
                    }

                    // Eliminate stale issues 
                    // Github lists in 'most recent' order.
                    duplicate = false;
                    angular.forEach(parsed.issues, function(item){
                        if(item.number === issue.number){
                            duplicate = true;
                        }                  
                    }); 

                    if (!duplicate)
                        parsed.issues.push(issue);     
                }
            }

        });  

        parsed.issues_total = parsed.issues.length; 
        return parsed;
    };

    // ------------------------------   PUBLIC ------------------------------------
    
    // Init
    self.me = null; // The user profile;
    self.repos = null; // The user's public repos;
    self.api = null; // GitHub.js api 
    self.cache = [];
    self.cache_time = "hour" // Options are: second, minute, hour, week
    
    // @function: setAuthToken: 
    // @param: token
    // Convenience method to set authToken when app is already authenticated from previous use.
    self.setAuthToken = function(token){
        authToken = token;
        $github.setOauthCreds(token);
    }

    // @function: getAuthToken: 
    // Convenience method to get authToken when it needs to be saved in user account, etc
    self.getAuthToken = function(){
        if (authToken) 
            return authToken;
    
        return null;
    }

    // @function: initialize
    // Invoked in the routing resolve at tab/nearby - if user autologs into Meteor,
    // we still need to fetch a fresh GitHub profile for them. Only initializes
    // if self.me doesn't exist yet.
    self.initialize = function(){

        var where = 'GitHub:initialize';
        var d = $q.defer();

        if (!self.me){
            $auth.requireUser().then(function(userLoggedIn){

                self.setAuthToken(Meteor.user().profile.authToken);          
                self.getMe().then( 

                    function(success){
                        d.resolve(true);
                    }, 
                    function(error){
                        logger(where, error);
                        d.reject('AUTH_REQUIRED');
                    });
            }, 
            function(userLoggedOut){
                logger(where, userLoggedOut);
                d.reject('AUTH_REQUIRED');
            });

        } else {
            d.resolve(true);
        }

        return d.promise;
    }

    // @function: authenticate: 
    // @return: promise (rejects if $cordovaOauth fails)
    // Logs user into GitHub via inAppBroswer. sets authToken
    self.authenticate = function(){
        var token, d, uri;
        var where = 'GitHub:authenticate';

        d = $q.defer();
        uri = { redirect_uri: 'http://cyclop.se/help'};
        
        gh_debug = $cordovaOauth;

        $ionicPlatform.ready( function() {
            $cordovaOauth.github(id, secret, perm, uri).then( function(result) {

                token = result.split('&')[0].split('=')[1];
                self.setAuthToken(token);

                logger(where, authToken);
                d.resolve();
            }, 
            function(e) { logger(where, e); d.reject(e)});
        });

        return d.promise;   
    };

    // @function: getMe
    // @return: promise 
    //
    // Configures user with Github.js API and
    // collects profile info
    self.getMe = function(){
        var where = "GitHub:getMe";
        var d = $q.defer();

        // Get API, then current user profile, then full account info.
        $github.getUser().then( function(user){
            user.show(null).then( function(info){   
                self.getAccount(info.login, user).then(function(account){
               
                    self.api = user;
                    self.me = account.info;
                    self.repos = account.repos;
                    self.events = account.events;
                    self.followers = account.followers;
                    d.resolve(true);

                }, function(e){ logger(where, e); d.reject(e)});
            }, function(e){ logger(where,e); d.reject(e)});
        }, function(e){ logger(where, e); d.reject(e)});

        return d.promise
    };

    // @function: getAccount
    // @param: username - a users github username, 
    //         auth_api - the initialized github.js api 
    // @return: promise
    // 
    // Gets GitHub profile, public repos and public events for
    // an arbitrary user
    self.getAccount = function(username, auth_api ){

        var cached, api;
        var where = "GitHub:getMe";
        var d = $q.defer();
        var account = {};
      
        cached = accountCached(username);
      
        // Check cache
        if (cached){
            d.resolve(cached)
      
        } else {     

            // Service either initialized or initializing with auth_api param
            (auth_api === undefined) ? api = self.api : api = auth_api;

            // Get profile, then repos, then events, then followers
            api.show(username).then( function(info){
                api.userRepos(username).then( function(repos){
                    api.userEvents(username).then(function(events){
                        api.userFollowers(username).then(function(followers){
                           
                            account.info = info;
                            account.repos = repos;
                            account.followers = followers;
                            account.events = parseEvents(events);
                            account.cached_at = new Date();
                            self.cache.push(account);
                            d.resolve(account);

                            gh_debug = account;

                        },function(e){ logger(where, e); d.reject(e) });
                    }, function(e){ logger(where, e); d.reject(e) });
                }, function(e){ logger(where, e); d.reject(e) });
            }, function(e){ logger(where, e); d.reject(e) });  
        }

        return d.promise;     
    };

    // @function: getContribGraph
    // @param: username - a users github username, 
    //         auth_api - the initialized github.js api 
    // @return: promise resolving string
    // 
    // Retrieves svg string from cache or meteor call 
    self.getContribGraph = function(username){

        var d = $q.defer();
        var url = 'https://github.com/users/' + username + '/contributions';
        var where = 'GitHub:getContribGraph';
        var cached = graphCached(username);

        if (cached){
            d.resolve(cached)
      
        } else {
            Meteor.call('getContributions', url, function(err, response){
            
                if (err){
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

    // @function: canFollow()
    // @param: String - the target's github login name, 
    //         
    // @return: true || false
    // 
    // Searches the users following list to see if target is 
    // already followed.  
    self.canFollow = function(username){

        var can = true;
        angular.forEach(self.followers, function(follower){
            if (follower.login === username){
                can = false;
            }
        })
        return can;
    };

    // @function: follow
    // @param: user - the account's info object, 
    //         
    // @return: promise 
    // 
    // Attempts to follow the user specified by param username. 
    // Increments follower/following metrics and adds a mock follower
    // to the followers array to keep cache current w/ GitHub remote.  
    self.follow = function(user){

        var d = $q.defer();

        self.api && self.api.follow(user.login).then(
            function(){
                self.me.following++;
                user.followers++;
                self.followers.push({login: user.login}); 
                d.resolve()
            },
            function(e){ d.reject()}
        );
        return d.promise;
   };

    // DEVELOPMENT INIT;
    if ($rootScope.DEV){
        self.setAuthToken(secure.github.auth);
    };
};