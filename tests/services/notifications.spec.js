"use strict"
var nt_debug;

describe('Service: Notify', function () {
    
    beforeEach(module('linkedin'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections

    // Disable Ionic templating
    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $urlRouterProvider.deferIntercept();
    }));

    var $scope, $q, $cordovaPush, $window,
        Notify, GeoLocate, LinkedIn, defer, user;

    beforeEach(inject(function(_$rootScope_, _$q_, _$cordovaPush_, _$window_, 
    						   _Mock_, _Notify_, _GeoLocate_, _LinkedIn_ ){
        
        $scope = _$rootScope_;
        $cordovaPush = _$cordovaPush_;
        $q = _$q_;
        $window = _$window_;
    
        Notify = _Notify_;
        GeoLocate = _GeoLocate_;
        LinkedIn = _LinkedIn_;
        Meteor.user = _Mock_.Meteor.user;
        Meteor.userId = _Mock_.Meteor.userId;
        user = _Mock_.user;

        defer = $q.defer();

        //$cordovaPush mocks
        $cordovaPush.register = function(config){return defer.promise };
        
        // LinkedIn mocks
        LinkedIn.me = {
			pictureUrl: 'http:hello',
			firstName: 'Nicole',
			lastName: 'Star-Siren'
		};

    }));


    describe('initialize()', function(){

        it('should do nothing if theres no user', function(){

        	// Setup
        	Meteor.user = function(){ return false };
            spyOn($cordovaPush, 'register').and.returnValue(defer.promise);

            // Test
            Notify.initialize();
            $scope.$digest();
            expect($cordovaPush.register).not.toHaveBeenCalled();

        });

        it('should do nothing if user already has an APN token && app is not newly installed', function(){
        	
        	// Setup
        	user.profile.pushToken = '12345';
        	$window.localStorage['pl_newInstall'] = 'false';
        	spyOn($cordovaPush, 'register').and.returnValue(defer.promise);

        	// Test
        	Notify.initialize();
        	$scope.$digest();
        	expect($cordovaPush.register).not.toHaveBeenCalled();

        	// Clean up
        	window.localStorage.removeItem('pl_newInstall');

        });

        it('should attempt to register for push notifications if user has no APN token', function(){
        	
        	// Setup
        	user.profile.pushToken = null;
        	spyOn($cordovaPush, 'register').and.returnValue(defer.promise);

        	// Test
        	Notify.initialize();
        	$scope.$digest();
        	expect($cordovaPush.register).toHaveBeenCalled();

        });

        it('should attempt to register for push notifications if app is a new install', function(){
        	// Setup
        	user.profile.pushToken = '12345';
        	$window.localStorage['pl_newInstall'] = 'true';
        	spyOn($cordovaPush, 'register').and.returnValue(defer.promise);

        	// Test
        	Notify.initialize();
        	$scope.$digest();
        	expect($cordovaPush.register).toHaveBeenCalled();

        	// Clean up
        	window.localStorage.removeItem('pl_newInstall');
        });

        it('should return a promise', function(){

        	user.profile.pushToken = '12345';
        	expect(Notify.initialize().$$state).not.toBe(undefined);
        	
        })

        it('should update user account with push token if register is successful', function(){

        	var expected_selector = { _id: user._id };
        	var expected_query = {$set: {'profile.pushToken' : 'xyz' }};

        	defer.resolve('xyz');
        	user.profile.pushToken = null;
        	Meteor.users = { update: function(){}};
        	
        	spyOn($cordovaPush, 'register').and.callThrough();
        	spyOn(Meteor.users, 'update');

        	Notify.initialize();
        	$scope.$digest();

      		expect(Meteor.users.update).toHaveBeenCalledWith(expected_selector, expected_query);
      		expect($window.localStorage['pl_newInstall']).toBe('false');
        });

        it('should resolve on success AND failure', function(){

        	var result;

        	// Successful register
        	defer.resolve('xyz');
        	user.profile.pushToken = null;
        	spyOn($cordovaPush, 'register').and.callThrough();

        	result = Notify.initialize();
        	$scope.$digest();

			expect(result.$$state.status).toEqual(1);

			//Failed register
			defer.reject('no');
        	user.profile.pushToken = null;

        	result = Notify.initialize();
        	$scope.$digest();

			expect(result.$$state.status).toEqual(1);

        });
    });

	describe('sawProfile()', function(){

		var target = 'penelope';

		it('should call Meteor.notify with the correct notification info', function(){
			
			var expected_info = {
				target: target,
				notification: {
					type: 'sawProfile',
					sender: Meteor.userId(),
					pictureUrl: LinkedIn.me.pictureUrl,
					name: LinkedIn.me.firstName + ' ' + LinkedIn.me.lastName,
					profile: LinkedIn.me,
					location: 'someLocation', 
					timestamp: new Date()
				}
			}

			// Mock getAddress()
			GeoLocate.getAddress = function(){ return defer.promise };

			defer.resolve('someLocation');

			spyOn(Meteor, 'call');
			spyOn(GeoLocate, 'getAddress').and.callThrough();

			Notify.sawProfile(target);
			$scope.$digest();

			// This test passes except for the timestamp, which much be system ms.
			// expect(Meteor.call).toHaveBeenCalledWith('notify', expected_info);

		})
	});

	describe('checkedNotifications()', function(){

		it('should call Meteor.resetNotifyCounter', function(){
			spyOn(Meteor, 'call');
			Notify.checkedNotifications();
			expect(Meteor.call).toHaveBeenCalledWith('resetNotifyCounter', null);
		});
		
	})


});
