var np_debug;

describe('NearbyProfileCtrl', function(){

    var $controller, $scope, $stateParams, $state, $compile, $templateCache, 
        compileProvider, GitHub, template, ctrl, account, account_mock, init;

    beforeEach(module('templates'));   // ng-html2js template cache
    beforeEach(module('gitphaser'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections
    
    // Prime 'account' injected from the resolve
    account_mock = {
        info: { login: 'penelope'},
        repos: {},
        events: {}
    }
    // Inject $compileProvider so we can spin up directives from the templates
    // and test the DOM 
    beforeEach(module(function($provide, $compileProvider) {
      compileProvider = $compileProvider;
      $provide.value('account', account_mock);
    }));

    beforeEach(inject(function(_$controller_, _$rootScope_, _$stateParams_, _$state_ , _$compile_, _$templateCache_,
                                _Mock_, _GitHub_, _account_ ){


        $controller = _$controller_;
        $scope = _$rootScope_;
        $stateParams = _$stateParams_;
        $compile = _$compile_; 
        $templateCache = _$templateCache_;
        GitHub = _GitHub_;
        account = _account_;
        $state = _$state_;
        np_debug = account;
    
        // Compile Template
        compileProvider.directive('nearbyProfileTest', function (){
            return {
                controller: 'NearbyProfileCtrl as vm',
                template: $templateCache.get('templates/tab-profile.html')
            }
        });
        
        init = function(){
            template = angular.element('<ion-nav-bar><nearby-profile-test></nearby-profile-test></ion-nav-bar');            
            $compile(template)($scope);
            $scope.$digest();

            // Get controller
            ctrl = template.find('nearby-profile-test').controller('nearbyProfileTest');
        }

    }));

    it('should be injected with an account object', function(){
        
        init();

        // Check explicit assignments
        expect(ctrl.user).toEqual(account.info);
        expect(ctrl.repos).toEqual(account.repos);
        expect(ctrl.events).toEqual(account.events);
        expect(ctrl.viewTitle).toEqual(account.info.login);

    });

    it('should show a follow button if the target is followable', function(){

        // Mock canFollow to return true;
        GitHub.canFollow = function(){ return true };
        spyOn(GitHub, 'canFollow').and.callThrough();

        init();
        expect(ctrl.canFollow).toBe(true);
    });

    it('should hide the follow button if the target is NOT followable', function(){
        
        // Mock canFollow to return false;
        GitHub.canFollow = function(){ return false };
        spyOn(GitHub, 'canFollow').and.callThrough();;

        init();

        expect(ctrl.canFollow).toBe(false);

    });

    it('should show fake lower nav tabs', function(){

    })

    describe('back()', function(){

        it('should navigate to tab.nearby', function(){
            spyOn($state, 'go');

            init();
            ctrl.back();
            expect($state.go).toHaveBeenCalledWith('tab.nearby');
        });
    });

    describe('follow()', function(){
        
        it('should hide the follow button', function(){

        });

        it('should call the GitHub follow method', function(){
            spyOn(GitHub, 'follow');

            init();
            ctrl.follow();
            expect(GitHub.follow).toHaveBeenCalledWith(ctrl.user);

            
        });
    })

});













