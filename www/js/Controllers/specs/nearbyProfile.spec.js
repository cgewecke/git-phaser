var np_debug;

describe('NearbyProfileCtrl', function(){

    var $controller, $scope, $stateParams, $compile, $templateCache, 
        compileProvider, template, ctrl, mini;

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

    beforeEach(inject(function(_$controller_, _$rootScope_, _$stateParams_, _$compile_, _$templateCache_,
                                _Mock_){


        $controller = _$controller_;
        $scope = _$rootScope_;
        $stateParams = _$stateParams_;
        $compile = _$compile_; 
        $templateCache = _$templateCache_;
        
        // Mock user to silence complaints of contact directive
        Meteor.user = _Mock_.Meteor.user;
        
        // Prime mini-mongo w/ connection
        mini = {
            receiver: '111', 
            transmitter: Meteor.user._id, 
            profile: { 
                id: '555', 
                firstName: 'xxx', 
                lastName: 'zzz'
            }
        }
        
        //Problem here (subscribe?)
        //Connections.insert(mini);
        $stateParams.userId = mini.profile.id;

        // Compile Template
        compileProvider.directive('nearbyProfileTest', function (){
            return {
                controller: 'NearbyProfileCtrl as vm',
                template: $templateCache.get('templates/tab-profile.html')
            }
        });
        
        template = angular.element('<ion-nav-bar><nearby-profile-test></nearby-profile-test></ion-nav-bar');            
        $compile(template)($scope);
        $scope.$digest();

        // Get controller
        ctrl = template.find('nearby-profile-test').controller('nearbyProfileTest');

    }));

    it('should reactively bind ctrl to Mongo.connection & profile of routes /:userId', function(){
        
        // Check explicit assignments
        expect(ctrl.user).toEqual(ctrl.connection.profile);
        expect(ctrl.viewTitle).toEqual(ctrl.user.name);

        // Validate helper & check explicit assignment
        expect(ctrl.user.name).toEqual(mini.profile.firstName + ' ' + mini.profile.lastName);
        

    });

});