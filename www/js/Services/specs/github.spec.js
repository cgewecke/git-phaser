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

    })
});



