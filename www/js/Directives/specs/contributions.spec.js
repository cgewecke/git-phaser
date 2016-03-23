"use strict"
var ct_debug;

describe('Directive: <contributions>', function () {
    
    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('gitphaser'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections

    var $scope, $compile, $ionicScrollDelegate, $q, GitHub,
        user, ctrl, template, defer, initTemplate, scope, mock_status;


    beforeEach(inject(function(_$rootScope_, _$compile_, _$q_, _GitHub_, _$ionicScrollDelegate_ ){
        
        $scope = _$rootScope_;
        $compile = _$compile_;
        GitHub = _GitHub_;
        $ionicScrollDelegate = _$ionicScrollDelegate_;
        $q = _$q_;

        defer = $q.defer();
        $scope.mock_name = 'penelope';

        // Mock server call 
        GitHub.getContribGraph = function(name){ return defer.promise }
        
        initTemplate = function(){
        	template = angular.element('<contributions name="mock_name"></contributions>');            
	        $compile(template)($scope);
	        $scope.$digest();
	        scope = template.isolateScope();
        };
        
    }));

    it('should show a spinner while loading the graph', function(){
        
        var spinner;

        initTemplate();
        spinner = template.find('#contrib-spinner');
        expect(spinner.hasClass('ng-hide')).toBe(false);
    });

    it('should get the graph from the GitHub', function(){

    	spyOn(GitHub, 'getContribGraph').and.callThrough();
   
    	initTemplate();
    	scope.$digest();
    	expect(GitHub.getContribGraph).toHaveBeenCalledWith('penelope');

    });

    it('should append the graph to itself', function(){

    	spyOn(GitHub, 'getContribGraph').and.callThrough();
    	defer.resolve('<div id="graph"></div>');
    	initTemplate();

    	var added = template.find('#graph');
    	expect(added.length).toEqual(1);

    });

    it('should hide the spinner on success', function(){
    	spyOn(GitHub, 'getContribGraph').and.callThrough();

    	defer.resolve('<div id="graph"></div>');
    	initTemplate();

    	var spinner = template.find('#contrib-spinner');
    	expect(spinner.hasClass('ng-hide')).toBe(true);
    });

});

