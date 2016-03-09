describe('LoadingCtrl', function(){

    var $scope, $controller, $ionicPlatform, $state, $httpBackend, $timeout, 
        compileProvider, ionicToast, mock_status;

    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('linkedin'));    // Application
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

    beforeEach(inject(function(_$rootScope_,_$controller_, _$ionicPlatform_, _$state_, 
                               _$timeout_, _ionicToast_, _$httpBackend_){
        $scope = _$rootScope_;
        $controller = _$controller_;
        $ionicPlatform = _$ionicPlatform_;
        $state = _$state_;
        $timeout = _$timeout_;
        $ionicPlatform = _$ionicPlatform_;
        ionicToast = _ionicToast_;
        $httpBackend = _$httpBackend_;

        Meteor.status = function() { return {status: mock_status } };
        $ionicPlatform.ready = function(fn){ (fn)();}

        spyOn($ionicPlatform, 'ready').and.callThrough();
        spyOn($state, 'go');
        spyOn(ionicToast, 'show');

        var vm = $controller('LoadingCtrl', {$ionicPlatform, $state, $timeout, ionicToast });
        $scope.$digest();

        
    }));


    it('it should navigate to tab.nearby on ionicPlatform ready', function(){

        expect($ionicPlatform.ready).toHaveBeenCalled(); 
        expect($state.go).toHaveBeenCalledWith('tab.nearby');
        
    });

    it('it should handle "no connection to meteor" state: (route resolve hang bug)', function(){

        mock_status = 'not_connected';
        $timeout.flush();
        expect(ionicToast.show).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('login');
    });

    it('it should handle "connection to meteor ok" state', function(){

        mock_status = 'connected';
        $timeout.flush();
        expect(ionicToast.show).not.toHaveBeenCalled();
        expect($state.go).not.toHaveBeenCalledWith('login');
    })
    

});