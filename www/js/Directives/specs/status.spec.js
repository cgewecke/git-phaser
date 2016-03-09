"use strict"

describe('Directive: <server-status>', function () {
    
    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('linkedin'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections

    var $scope, $compile, ionicToast, 
        user, ctrl, template, initTemplate, scope, mock_status;


    beforeEach(inject(function(_$rootScope_, _$compile_, _Mock_, _ionicToast_ ){
        
        $scope = _$rootScope_;
        $compile = _$compile_;
        ionicToast = _ionicToast_;

        // Meteor
        Meteor.status = function(){ return {status: mock_status }}

        // Allows us to initialize template against different mock users
        initTemplate = function(){

            // 'ion-nav-buttons' requires the ion-nav-bar controller, unfortunately.
            template = angular.element('<ion-nav-bar><server-status></server-status></ion-nav-bar>');            
            $compile(template)($scope);
            $scope.$digest();
            scope = template.find('ion-nav-buttons').scope();
        };

    }));

    it('should initialize status to false', function(){
        initTemplate();
        expect(scope.status).toBe(false);
    });

    // There are some weird issues here testing ng-class, possibly because the 
    // the inner scope of the button is not the ion-nav-buttons scope for the 
    // purposes of the test, because of the necessity of wrapping it in <ion-nav-bar>?
    // In any case, the childScope of the button is being manually updated to the 
    // directive scope to make the test work. 
    it('should make the cloud icon green if app is connected to Meteor', function(){
        
        spyOn( scope.self, 'autorun').and.callThrough();
        mock_status = 'connected';
        
        initTemplate();
        var button = template.find('button#status-button');
        var childScope = button.scope();
        childScope.status = scope.status;

        $scope.$digest();
        expect(button.hasClass('button-balanced')).toBe(true);
        
    })

    it('should make the cloud icon red if app is NOT connected to Meteor', function(){
        
        spyOn( scope.self, 'autorun').and.callThrough();
        mock_status = 'disconnected';
        
        initTemplate();
        var button = template.find('button#status-button');
        var childScope = button.scope();
        childScope.status = scope.status;

        $scope.$digest();
        expect(button.hasClass('button-assertive')).toBe(true);

    });

    it('should show a toast with a status message when the icon is clicked', function(){

        var true_msg = 'You are connected to the server.';
        
        spyOn( scope, 'toast').and.callThrough();
        spyOn( ionicToast, 'show');
        mock_status = 'connected';

        initTemplate();

        var button = template.find('button#status-button');
        
        button.triggerHandler('click');
        $scope.$digest();
        expect(ionicToast.show).toHaveBeenCalledWith(true_msg, 'middle', false, 1000);

    })


})