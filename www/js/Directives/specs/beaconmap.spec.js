"use strict"
var bm_test_debug;

describe('Directive: <beacon-map>', function () {
    
    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('linkedin'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections

    var $scope, $compile, ionicToast, 
        user, ctrl, template, initTemplate, scope, mock_ipad;


    beforeEach(inject(function(_$rootScope_, _$compile_, _GeoLocate_ ){
        
        $scope = _$rootScope_;
        $compile = _$compile_;
        GeoLocate = _GeoLocate_;

        // Mock ionic.Platform 
        ionic.Platform.isIPad = function(){ return mock_ipad };

        // Mock nearby controller slide
        $scope.slide = 0;

        initTemplate = function(){

            template = angular.element('<beacon-map slide="slide"></beacon-map>');            
            $compile(template)($scope);
            $scope.$digest();
            scope = template.scope();
        }
                
    }));

    it('should add class "ipad" to element IFF device is an ipad', function(){

        mock_ipad = false;
        initTemplate();
        expect(template.hasClass('ipad')).toBe(false);

        mock_ipad = true;
        initTemplate();
        expect(template.hasClass('ipad')).toBe(true);

    });

    it('should load the map if it has become the active slide for the first time', function(){

        $scope.slide = 1;
        GeoLocate.map = null;
        spyOn(GeoLocate, 'loadMap');
        
        initTemplate();
        
        expect(GeoLocate.loadMap).toHaveBeenCalled();

    });

    it('should update the map on slide change if map is already loaded', function(){
        
        $scope.slide = 1;
        GeoLocate.map = null;
        spyOn(GeoLocate, 'updateMap');
        
        initTemplate();
        
        GeoLocate.map = 'notNull'
        $scope.slide = 0;
        $scope.$digest();
        $scope.slide = 1;
        $scope.$digest();

        expect(GeoLocate.updateMap).toHaveBeenCalled();

    })
});