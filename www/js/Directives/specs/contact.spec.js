"use strict"

var ct_debug, ct_debugII, ct_debugIII;

describe('Directive: <contact>', function () {
    
    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('gitphaser'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections

    var $scope, $compile, $ionicModal, ionicToast, GitHub, 
    	user, template, initTemplate, scope, localScope;

    var penelope = {
    	login: 'plp',
    	name: 'penelope',
    	email: 'penelope@cyclop.se',
    	company: 'cyclopse',
    	pictureUrl: 'http://hello.com'
    };

    beforeEach(inject(function(_$rootScope_, _$compile_, _$ionicModal_, _ionicToast_,
                               _Mock_, _GitHub_ ){
        
        $scope = _$rootScope_;
        $compile = _$compile_;
        $ionicModal = _$ionicModal_;
        ionicToast = _ionicToast_;
        GitHub = _GitHub_;

        // Mock GitHub
        GitHub.me = { login: 'someoneElse'};
        // Mock Meteor
        Meteor.user = _Mock_.Meteor.user;
        user = _Mock_.user;

        // Potential contact
        $scope.penelope = penelope;

        // ng-Model
        $scope.modalIsOpen = false;
        
        // Allows us to initialize template against different mock users
        initTemplate = function(){
        	template = angular.element('<contact user="penelope" ng-model="modalIsOpen"></contact>');            
        	$compile(template)($scope);
        	$scope.$digest();

        	scope = template.isolateScope();
            localScope = template.scope();
        };
    }));

    
    it('should initialize a modal object', function(){
        spyOn($ionicModal, 'fromTemplate').and.callThrough();
        initTemplate();
    
        expect(scope.modal).not.toBe(undefined);
    });

    it('should initialize correctly when user DOES NOT have contact', function(){

    	initTemplate();
    	expect(scope.contactAdded).toEqual(false);
    	
    });

    it('should initialize correctly when user DOES have contact', function(){

    	user.profile.contacts.push(scope.user.login);
    	initTemplate();

    	expect(scope.contactAdded).toBe(true);

    });

    it('should show/hide email icon if contact added/not added', function(){

    	var icon;

        initTemplate();
    	icon = template.find('#contact-added');
    	scope.contactAdded = false;
    	$scope.$digest();
    	expect(icon.hasClass('ng-hide')).toBe(true);

    	scope.contactAdded = true;
    	$scope.$digest();
    	expect(icon.hasClass('ng-hide')).toBe(false);

    });

    it('should hide/show plus icon if contact added/not added', function(){

        var icon;

        initTemplate();

        icon = template.find('#contact-addable');
        scope.contactAdded = false;
        $scope.$digest();
        expect(icon.hasClass('ng-hide')).toBe(false);

        scope.contactAdded = true;
        $scope.$digest();
        expect(icon.hasClass('ng-hide')).toBe(true);

    });


    describe('confirm()', function(){

        it('should be called when user taps the email field', function(){
            
            var contact;    
            initTemplate();

            spyOn(scope, 'confirm');
            template.triggerHandler('click');
            $scope.$digest();
            expect(scope.confirm).toHaveBeenCalled();
        });

        it('should do nothing if user is the current user', function(){
                
            

            initTemplate();
            GitHub.me = { login: scope.user.login };
            spyOn(ionicToast, 'show');
            spyOn(scope.modal, 'show');
    
            scope.confirm();
            expect(ionicToast.show).not.toHaveBeenCalled();
            expect(scope.modal.show).not.toHaveBeenCalled();
        });

        it('should show a toast saying the contact has already been added (when true)', function(){

            spyOn(ionicToast, 'show');

            initTemplate();
            scope.contactAdded = true;

            scope.confirm();
            expect(ionicToast.show).toHaveBeenCalled();
        });

        it('should open a modal prompt if the contact can be added', function(){

            
            initTemplate();
            spyOn(scope.modal, 'show');
            scope.contactAdded = false;
            scope.confirm();

            expect(scope.modal.show).toHaveBeenCalled();
        });

        it('should set outer scope background opacity flag to true when opening modal', function(){

            var ctrl;

            initTemplate();
            scope.contactAdded = false;
            scope.confirm();

            expect($scope.modalIsOpen).toBe(true);
        });

    });

    describe('createContact()', function(){

    	var $cordovaContacts, $timeout, defer, expected_info, success, failure;

    	beforeEach(inject(function(_$cordovaContacts_, _Mock_, _$q_, _$timeout_ ){
    		$cordovaContacts = _$cordovaContacts_;
	        $timeout = _$timeout_;

	        defer = _$q_.defer();

	        expected_info = {
    			"displayName": scope.user.name,
				"emails": (scope.user.email) ? 
				[{ "value": scope.user.email, 
				   "type": "business" }] : null,
				"organizations": (scope.user.company) ?
				[{"type": "Company", 
				  "name": scope.user.company,
				}] : null,
				"photos": [{"value": scope.user.avatarUrl}],
				"birthday": Date('5/5/1973')
			};

            $cordovaContacts.save = function(info){
                return defer.promise;
            }
    	}))


	    it('should correctly format the contact info for iOS', function(){
    		initTemplate();
    		
   			spyOn($cordovaContacts, 'save').and.callThrough();
    		scope.createContact();

    		expect($cordovaContacts.save).toHaveBeenCalledWith(expected_info);

    	});

    	it('should update DOM and the users Meteor record if contact add is succesful', function(){

    		initTemplate();
            
            spyOn($cordovaContacts, 'save').and.callThrough();
            spyOn(Meteor, 'call');

            defer.resolve();
            scope.createContact();

            $scope.$digest();

            expect(scope.contactAdded).toEqual(true);
            expect(Meteor.call).toHaveBeenCalledWith('addContact', scope.user.login)
            
    	});
    });

    describe('$on(): modal.hidden', function(){

        it('should set outer scope background opacity flag to false when modal closes', function(){

            initTemplate();

            scope.contactAdded = false;
            scope.confirm();

            $scope.$broadcast('modal.hidden');
            $scope.$digest();
            expect($scope.modalIsOpen).toBe(false);
        })
    });
});