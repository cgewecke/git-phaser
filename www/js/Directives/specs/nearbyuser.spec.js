"use strict"
var nu_debug, nu_debugII;

describe('Directive: <nearby-user>', function () {
    
    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('gitphaser'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections

    var $scope, scope, $compile, $q, GitHub,
        user, ctrl, template, defer, initTemplate;


    beforeEach(inject(function(_$rootScope_, _$compile_, _$q_, _GitHub_ ){
        
        $scope = _$rootScope_;
        $compile = _$compile_;
        GitHub = _GitHub_;
        $q = _$q_;

        defer = $q.defer();
        
        $scope.mock_model = { 
            proximity: 'near',
            receiver_name: 'penelope' 
        };

        // Mock server call 
        GitHub.getAccount = function(name){ return defer.promise }
        
        initTemplate = function(){
        	template = angular.element('<nearby-user model="mock_model"></nearby-user>');            
	        $compile(template)($scope);
	        $scope.$digest();
            scope = template.scope();
        };
        
    }));

    it('should initially be hidden', function(){
        initTemplate();
        expect(template.hasClass('ng-hide')).toBe(true);
    });

    it('should initialize scope correctly', function(){

        initTemplate();

        expect(scope.user).toBe(null);
        expect(scope.proximity).toBe($scope.mock_model.proximity);


    });

    it('should get a user account from GitHub service', function(){
        spyOn(GitHub, 'getAccount').and.callThrough();

        initTemplate();
        expect(GitHub.getAccount).toHaveBeenCalledWith($scope.mock_model.receiver_name);

    });

    it('should bind the resolved account to scope variable: "user"', function(){
        var expected_account = {obj: true};
        spyOn(GitHub, 'getAccount').and.callThrough();
        defer.resolve(expected_account);

        initTemplate();
        expect(scope.user).toEqual(expected_account);
    });

    it('should show itself when the user account resolves', function(){
        var expected_account = {obj: true};
        spyOn(GitHub, 'getAccount').and.callThrough();
        defer.resolve(expected_account);

        initTemplate();
        expect(template.hasClass('ng-hide')).toBe(false);

    });

    it('should not show itself if the user account rejects', function(){
        var expected_account = {obj: true};
        spyOn(GitHub, 'getAccount').and.callThrough();
        defer.reject();

        initTemplate();
        expect(template.hasClass('ng-hide')).toBe(true);
    });
});