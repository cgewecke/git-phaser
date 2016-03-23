"use strict"
var hr_debug;

describe('Directive: <hireable>', function () {
    
    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('gitphaser'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections

    var $scope, scope, $compile, ionicToast,
        ctrl, template;

    beforeEach(inject(function(_$rootScope_, _$compile_, _ionicToast_ ){
        
        $scope = _$rootScope_;
        $compile = _$compile_;
        ionicToast = _ionicToast_;

        $scope.mock_status = true;
        $scope.mock_name = 'penelope';
        
        template = angular.element('<hireable available="mock_status" name="mock_name"></hireable>');            
	    $compile(template)($scope);
	    $scope.$digest();
	    scope = template.isolateScope();
        
    }));

    it('should be visible if the user is available', function(){

        var button = template.find('#hireable-btn');
        expect(button.hasClass('ng-hide')).toBe(false);
    });

    it('should be hidden if the user NOT available', function(){

        var button = template.find('#hireable-btn');

        $scope.mock_status = false;
        $scope.$digest();
        expect(button.hasClass('ng-hide')).toBe(true);
    });

    it('should show a toast when clicked', function(){
        
        var expected_message = scope.name + ' is available for hire.';
        var button = template.find('#hireable-btn');

        spyOn(ionicToast, 'show');
        button.triggerHandler('click');
        $scope.$digest();

        expect(ionicToast.show).toHaveBeenCalledWith(expected_message, 'middle', false, 1250);

    });

});