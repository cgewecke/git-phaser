var g_debug;

describe('Service: GitHub', function () {
    
    beforeEach(module('gitphaser'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections

    // Disable Ionic templating
    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $urlRouterProvider.deferIntercept();
    }));

    var $scope, $q, $cordovaBeacon, $window, $auth, $cordovaOauth, $ionicPlatform,
        GitHub, Mock, user, d1, d2, d3, d4;

    beforeEach(inject(function(_$rootScope_, _$q_, _$window_, _Mock_, _GitHub_, _$github_,
                               _$auth_, _$cordovaOauth_, _$ionicPlatform_ ){
        
        $scope = _$rootScope_;
        $q = _$q_;
        $window = _$window_;

        GitHub = _GitHub_;
        $github = _$github_;
        $auth = _$auth_;
        $cordovaOauth = _$cordovaOauth_;
        $ionicPlatform = _$ionicPlatform_;

        Mock = _Mock_;
        Meteor.user = Mock.Meteor.user;
    
        // Some promises
        d1 = $q.defer();
        d2 = $q.defer();
        d3 = $q.defer();
        d4 = $q.defer();

        // Misc Mocks
        $auth.requireUser = function(){ return d1.promise };
        $cordovaOauth.github = function(){ return d1.promise };
        $ionicPlatform.ready = function(fn){ (fn)() };
        

    }));

    it('should initialize correctly', function(){
        expect(GitHub.me).toBe(null);
        expect(GitHub.repos).toBe(null);
        expect(GitHub.api).toBe(null);
        expect(GitHub.cache.length).toEqual(0);
        expect(GitHub.cache_time).toBe('hour');
    });

    describe( 'setAuthToken()/getAuthToken()', function(){
        
        it('should set/get the services token value', function(){
            
            var value;

            GitHub.setAuthToken('hello');
            value = GitHub.getAuthToken();
            expect(value).toEqual('hello');

        });

        it('should register token with $github', function(){

            spyOn($github, 'setOauthCreds');
            GitHub.setAuthToken('hello');
            expect($github.setOauthCreds).toHaveBeenCalledWith('hello');
        });
    });

    describe('initialize()', function(){
        
        it('should resolve true immedidately if service has already initialized', function(){
            var promise;
            GitHub.me = {something: 'already happened'};
            promise = GitHub.initialize();
            expect(promise.$$state.value).toEqual(true);
        });

        it('should wait for Meteor user to be available before initializing', function(){
            
            spyOn($auth, 'requireUser').and.callThrough();
            GitHub.initialize();
            expect($auth.requireUser).toHaveBeenCalled();

        });

        it('should reject with "AUTH REQUIRED" if the meteor user is unavailable', function(){

            var promise;

            spyOn($auth, 'requireUser').and.callThrough();
            d1.reject();
            
            promise = GitHub.initialize();
            $scope.$digest();
            expect(promise.$$state.status).toEqual(2); 
            expect(promise.$$state.value).toEqual('AUTH_REQUIRED');

        });

        it('should obtain token from Meteor user and set credentials during initialization', function(){

            Mock.user.profile.authToken = "testToken";

            spyOn($auth, 'requireUser').and.callThrough();
            spyOn(GitHub, 'setAuthToken');

            d1.resolve();
            GitHub.initialize();
            $scope.$digest();
            expect(GitHub.setAuthToken).toHaveBeenCalledWith("testToken");

        });

        it('should fetch the current users account and resolve true', function(){

            var promise;

            Mock.user.profile.authToken = "testToken";
            GitHub.getMe = function() {return d2.promise };

            spyOn($auth, 'requireUser').and.callThrough();
            spyOn(GitHub, 'getMe').and.callThrough();

            d1.resolve();
            d2.resolve()
            promise = GitHub.initialize();
            $scope.$digest();
            expect(GitHub.getMe).toHaveBeenCalled();
            expect(promise.$$state.value).toBe(true);

        });

        it('should reject with "AUTH REQUIRED" if the users account is unavailable', function(){

            var promise;

            Mock.user.profile.authToken = "testToken";
            GitHub.getMe = function() {return d2.promise };

            spyOn($auth, 'requireUser').and.callThrough();
            spyOn(GitHub, 'getMe').and.callThrough();

            d1.resolve();
            d2.reject()
            promise = GitHub.initialize();
            $scope.$digest();
            expect(promise.$$state.status).toBe(2)
            expect(promise.$$state.value).toBe('AUTH_REQUIRED');

        });

    });

    describe('authenticate()', function(){

        it ('should wait for platform ready before trying to open inAppBrowser', function(){
            spyOn($ionicPlatform, 'ready');
            GitHub.authenticate();
            expect($ionicPlatform.ready).toHaveBeenCalled();
        });

        it('should call $cordovaOauth correctly, redirecting through cyclop.se/help', function(){

            spyOn($ionicPlatform, 'ready').and.callThrough();
            spyOn($cordovaOauth, 'github').and.callThrough();
            GitHub.authenticate();

            $scope.$digest();
            expect($cordovaOauth.github).toHaveBeenCalledWith(

                secure.github.id,
                secure.github.secret,
                [],
                { redirect_uri: 'http://cyclop.se/help'}
            );
        });

        it('should parse/set the authToken it receives and resolve', function(){
            
            spyOn($ionicPlatform, 'ready').and.callThrough();
            spyOn($cordovaOauth, 'github').and.callThrough();
            spyOn(GitHub, 'setAuthToken');

            d1.resolve('access_token=ABCD&other_stuff=898989');

            GitHub.authenticate();
            $scope.$digest();
            expect(GitHub.setAuthToken).toHaveBeenCalledWith('ABCD');
            
        });


        it('should reject on failure', function(){

            var promise;

            spyOn($ionicPlatform, 'ready').and.callThrough();
            spyOn($cordovaOauth, 'github').and.callThrough();

            d1.reject();

            promise =  GitHub.authenticate();
            $scope.$digest();
            expect(promise.$$state.status).toEqual(2);

        });
    });

    describe('getMe()', function(){

        var user;

        beforeEach(function(){
            $github.getUser = function(){ return d1.promise};
            user = { show: function(){ return d2.promise } };
            GitHub.getAccount = function(){ return d3.promise};
        });

        it('should get a $github api instance', function(){
            spyOn($github, 'getUser').and.callThrough();
            GitHub.getMe();
            expect($github.getUser).toHaveBeenCalled();

        });

        it('should reject if getting $github instance fails', function(){
            var promise;

            spyOn($github, 'getUser').and.callThrough();
            d1.reject();
            promise = GitHub.getMe();
            $scope.$digest();

            expect(promise.$$state.status).toEqual(2);
        })


        it('should get public info for the user', function(){

            spyOn($github, 'getUser').and.callThrough();
            spyOn(user, 'show').and.callThrough();

            d1.resolve(user);
            GitHub.getMe();
            $scope.$digest();

            expect(user.show).toHaveBeenCalled();

        });

        it('should reject if getting users public info fails', function(){

            var promise;

            spyOn($github, 'getUser').and.callThrough();
            spyOn(user, 'show').and.callThrough();

            d1.resolve(user);
            d2.reject();
            promise = GitHub.getMe();
            $scope.$digest();

            expect(promise.$$state.status).toEqual(2);
        });

        it('should get the rest of the users account data and resolve true', function(){

            var info = {login: 'somename'};
            var account = {info: 'a', repos: 'b', events: 'c', followers: 'd'};

            var promise;

            spyOn($github, 'getUser').and.callThrough();
            spyOn(user, 'show').and.callThrough();
            spyOn(GitHub, 'getAccount').and.callThrough();

            d1.resolve(user);
            d2.resolve(info);
            d3.resolve(account);
            
            promise = GitHub.getMe();
            $scope.$digest();

            expect(GitHub.getAccount).toHaveBeenCalledWith(info.login, user);

            expect(GitHub.api).toEqual(user);
            expect(GitHub.me).toEqual(account.info);
            expect(GitHub.repos).toEqual(account.repos);
            expect(GitHub.events).toEqual(account.events);
            expect(GitHub.followers).toEqual(account.followers);
            expect(promise.$$state.value).toBe(true);

        });

        it('should reject if getting users account data fails', function(){

            var info = {login: 'somename'};
            var account = {info: 'a', repos: 'b', events: 'c', followers: 'd'};

            var promise;

            spyOn($github, 'getUser').and.callThrough();
            spyOn(user, 'show').and.callThrough();
            spyOn(GitHub, 'getAccount').and.callThrough();

            d1.resolve(user);
            d2.resolve(info);
            d3.reject();
            
            promise = GitHub.getMe();
            $scope.$digest();

            expect(promise.$$state.status).toEqual(2);
        });
    });

    describe('getAccount()', function(){

        var user;

        beforeEach(function(){
            
            user = { 
                show: function(){ return d1.promise },
                userRepos: function(){ return d2.promise},
                userEvents: function(){ return d3.promise},
                userFollowers: function(){ return d4.promise} 
            };
            
        });

        it ('should resolve a cached account if there is one', function(){
            var promise;
            var expected_account = { info: {login: 'penelope'}, cached_at: new Date() };
            GitHub.cache.push(expected_account);
            promise = GitHub.getAccount('penelope', null);
            $scope.$digest();

            expect(promise.$$state.value).toEqual(expected_account);

        });

        it ('should NOT resolve a cached account if the cached item is stale', function(){
            var promise;
            var expected_account = { info: {login: 'penelope'}, cached_at: new Date(1980, 5, 18) };

            GitHub.cache.push(expected_account);
            promise = GitHub.getAccount('penelope', user);
            $scope.$digest();

            expect(promise.$$state.status).toEqual(0);
        });

        it('should remove the stale item from the cache when discovered', function(){

            var promise;
            var expected_account = { info: {login: 'penelope'}, cached_at: new Date(1980, 5, 18) };

            GitHub.cache.push(expected_account);
            promise = GitHub.getAccount('penelope', user);
            $scope.$digest();

            expect(GitHub.cache.length).toEqual(0);

        });

        it('should get, cache and resolve necessary data from github', function(){

            var promise;

            var expected_account = {

                info: 'a',
                repos: 'b',
                events: { commits: {}, commits_total: 0, issues: [], issues_total: 0 },
                followers: 'd'
            };

            spyOn(user, 'show').and.callThrough();
            spyOn(user, 'userRepos').and.callThrough();
            spyOn(user, 'userEvents').and.callThrough();
            spyOn(user, 'userFollowers').and.callThrough();

            d1.resolve(expected_account.info);
            d2.resolve(expected_account.repos);
            d3.resolve(expected_account.events);
            d4.resolve(expected_account.followers);

            promise = GitHub.getAccount('penelope', user);
            $scope.$digest();

            expect(promise.$$state.value.info).toEqual(expected_account.info);
            expect(promise.$$state.value.repos).toEqual(expected_account.repos);
            expect(promise.$$state.value.events).toEqual(expected_account.events);
            expect(promise.$$state.value.followers).toEqual(expected_account.followers);
            expect(promise.$$state.value.cached_at instanceof Date).toBe(true);

            expect(GitHub.cache.length).toBe(1);
        
        });
    });

    describe('getContribGraph', function(){

        it('should resolve a graph from cache if available', function(){
            var promise;
            var expected_account = { info: {login: 'penelope'}, cached_at: new Date(), graph: 'a' };
            GitHub.cache.push(expected_account);
            promise = GitHub.getContribGraph('penelope');
            $scope.$digest();

            expect(promise.$$state.value).toEqual(expected_account.graph);
        });

        it('should fetch by server proxy, cache, and resolve the graph', function(){

            var promise;
            var temp = Meteor.call;

            var expected_account = { info: {login: 'penelope'}, cached_at: new Date() };
            var expected_response = '<etc></etc>';

            Meteor.call = function(name, param, fn){
                (fn)(false, expected_response);
            }
            GitHub.cache.push(expected_account);
            
            promise = GitHub.getContribGraph('penelope');
            $scope.$digest();

            expect(promise.$$state.value).toEqual(expected_response);
            expect(GitHub.cache[0].graph).toEqual(expected_response);

            // Reset mock
            Meteor.call = temp;

        });

    });

    describe('canFollow', function(){

        it('should return false if the user is already followed', function(){

            GitHub.followers = [{login: 'penelope'}];
            expect(GitHub.canFollow('penelope')).toBe(false);
        });

        it('should return true if the user is NOT already followed', function(){
            GitHub.followers = [{login: 'antonio'}];
            expect(GitHub.canFollow('penelope')).toBe(true);
        });

    });

    describe('follow', function(){

    })
});



