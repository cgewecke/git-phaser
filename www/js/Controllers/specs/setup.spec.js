describe('SetupCtrl', function(){

    var $controller, $scope, $state, $timeout, $compile, $templateCache,
        compileProvider;

    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('gitphaser'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections
    
    // Disable Ionic templating
    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $urlRouterProvider.deferIntercept();
    }));
 
    // Inject $compileProvider so we can spin up directives from the templates
    // and test the DOM 
    beforeEach(module(function($compileProvider) {
      compileProvider = $compileProvider;
    }));

    beforeEach(inject(function(_$controller_, _$rootScope_,  _$state_, _$timeout_, 
                               _$compile_, _$templateCache_){
        
        $controller = _$controller_;
        $scope = _$rootScope_;
        $state = _$state_;
        $timeout = _$timeout_;
        $compile = _$compile_;
        $templateCache = _$templateCache_;

    }));

    it('should navigate to tab.nearby on accept()', function(){

        var vm = $controller('SetupCtrl', {$scope: $scope, $state: $state });

        spyOn($state, 'go');

        vm.accept();
        expect($state.go).toHaveBeenCalledWith('tab.nearby');
            
    }); 

    it('should navigate back to login on reject()', function(){

        var vm = $controller('SetupCtrl', {$scope: $scope, $state: $state });

        spyOn($state, 'go');

        vm.reject();
        expect($state.go).toHaveBeenCalledWith('login');
            
    }); 

    it('accept/reject buttons should be wired correctly', function(){

        var template, vm, acceptButton, rejectButton;

        compileProvider.directive('setupTest', function(){
            return {
                controller: 'SetupCtrl as vm',
                template: $templateCache.get('templates/setup.html')
            }
        })
        
        template = angular.element('<setup-test></setup-test>');
        $compile(template)($scope);
        $scope.$digest();
        
        vm = template.controller('setupTest');

        spyOn(vm, 'reject');
        spyOn(vm, 'accept');

        acceptButton = template.find('button#setup-accept');
        rejectButton = template.find('button#setup-reject');

        acceptButton.triggerHandler('click');
        $scope.$digest();
        expect(vm.accept).toHaveBeenCalled();
        
        rejectButton.triggerHandler('click');
        $scope.$apply();
        expect(vm.reject).toHaveBeenCalled();      
    })
});