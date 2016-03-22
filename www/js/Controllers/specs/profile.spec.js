var np_debug;

describe('ProfileCtrl', function(){

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
    beforeEach(module(function($compileProvider) {
      compileProvider = $compileProvider;
    }));

    // Declare account
    beforeEach(module(function($provide) {
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
    
        // Compile Template
        compileProvider.directive('profileTest', function (){
            return {
                controller: 'ProfileCtrl as vm',
                template: $templateCache.get('templates/tab-profile.html')
            }
        });
        
        init = function(no_account){
            if (no_account) 
                account = null;

            template = angular.element('<ion-nav-bar><profile-test></profile-test></ion-nav-bar');            
            $compile(template)($scope);
            $scope.$digest();

            // Get controller
            ctrl = template.find('profile-test').controller('profileTest');
        }

    }));

    describe('Controller Instance @ route: tabs/profile ', function(){
    

        it('should initialize with the GitHub user if no account object is passed to ctrl', function(){
            
            // Cant get this test to work because of account injection mystery: 
            expect(true).toEqual(false);
            /*GitHub.me = { login: 'alberto' }, GitHub.repos = 2, GitHub.events = 3
            
            ctrl = $controller('ProfileCtrl', {$scope, $stateParams, $state, GitHub, account: false});
            expect(ctrl.user).toEqual(GitHub.me);
            expect(ctrl.repos).toEqual(GitHub.repos);
            expect(ctrl.events).toEqual(GitHub.events);
            expect(ctrl.canFollow).toEqual(false);
            expect(ctrl.viewTitle).toEqual(GitHub.me.login);*/

        })
    })

    describe('Controller Instance @ route: tabs/profile ', function(){

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
    })

});













