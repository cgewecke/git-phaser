describe('Directive: <add-contact>', function () {
    
    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('linkedin'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections

    var $scope, $compile,  
    	user, template, initTemplate, scope;

    var penelope = {
    	id: 'aaa',
    	name: 'penelope',
    	emailAddress: 'penelope@cyclop.se',
    	positions: {
    		values: [{company: 'cyclopse', title: 'engineer'}]
    	},
    	pictureUrl: 'http://hello.com'
    };

    beforeEach(inject(function(_$rootScope_, _$compile_, _Mock_ ){
        
        $scope = _$rootScope_;
        $compile = _$compile_;

        // Meteor
        Meteor.user = _Mock_.Meteor.user;
        user = _Mock_.user;

        // Potential contact
        $scope.penelope = penelope;
        
        // Allows us to initialize template against different mock users
        initTemplate = function(){
        	template = angular.element('<add-contact user="penelope"></add-contact>');            
        	$compile(template)($scope);
        	$scope.$digest();
        	scope = template.isolateScope();
        };
    }));

    it('should initialize correctly when current user DOES NOT have contact', function(){

    	initTemplate();
    	expect(scope.currentUserId).toEqual(user.username);
    	expect(scope.contactAdded).toEqual(false);
    	expect(scope.flasher).toEqual(false);
    	
    });

    it('should initialize correctly when user DOES have contact', function(){

    	user.profile.contacts.push(scope.user.id);
    	initTemplate();

    	expect(scope.contactAdded).toBe(true);

    });

    it('should hide itself if contact already exists', function(){

    	initTemplate();
    	
    	scope.contactAdded = false;
    	$scope.$digest();
    	expect(template.hasClass('ng-hide')).toBe(false);

    	scope.contactAdded = true;
    	$scope.$digest();
    	expect(template.hasClass('ng-hide')).toBe(true);

    });

    it('should hide itself if the current view is the users own profile', function(){
    	initTemplate();
    	scope.user.id = user.username;

    	$scope.$digest();
    	expect(template.hasClass('ng-hide')).toBe(true);
    });

    it('should wire its button to fn: createContact()', function(){
    	var button;

    	initTemplate();
    	spyOn(scope, 'createContact');

    	button = template.find('button#contact-button');
    	button.triggerHandler('click');
    	$scope.$digest();

    	expect(scope.createContact).toHaveBeenCalled();

    });

    describe('createContact()', function(){

    	var $cordovaContacts, $timeout, defer, expected_info, success, failure;

    	beforeEach(inject(function(_$cordovaContacts_, _Mock_, _$q_, _$timeout_ ){
    		$cordovaContacts = _$cordovaContacts_;
	        $timeout = _$timeout_;

	        defer = _$q_.defer();

	        expected_info = {
    			"displayName": scope.user.name,
				"emails": (scope.user.emailAddress) ? 
				[{ "value": scope.user.emailAddress, 
				   "type": "business" }] : null,
				"organizations": (scope.user.positions) ?
				[{"type": "Company", 
				  "name": scope.user.positions.values[0].company.name,
				  "title": scope.user.positions.values[0].title 
				}] : null,
				"photos": [{"value": scope.user.pictureUrl}],
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
            $timeout.flush(1200);

            expect(scope.contactAdded).toEqual(true);
            expect(Meteor.call).toHaveBeenCalledWith('addContact', scope.user.id)
            
    	})
    })
});