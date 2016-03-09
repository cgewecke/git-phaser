describe('NearbyCtrl', function(){

    var $controller, $scope, $compile, $templateCache, 
        compileProvider, template, GeoLocate, Notify, ctrl, slidebox;

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

    beforeEach(inject(function(_$controller_, _$rootScope_, _GeoLocate_, _Notify_, _$compile_, 
                               _$templateCache_, _$ionicSlideBoxDelegate_ ){
        $controller = _$controller_;
        $scope = _$rootScope_;
        $compile = _$compile_;
        $templateCache = _$templateCache_;

        Notify = _Notify_;
        GeoLocate = _GeoLocate_;
        slidebox = _$ionicSlideBoxDelegate_;

        // Compile /tab-notifications
        compileProvider.directive('nearbyTest', nearbyTest);

        function nearbyTest(){
            return {
                controller: 'NearbyCtrl as vm',
                template: $templateCache.get('templates/tab-nearby.html')
            }
        };
        
        template = angular.element('<ion-nav-bar><nearby-test></nearby-test></ion-nav-bar>');            
        $compile(template)($scope);
        $scope.$digest();

        ctrl = template.find('nearby-test').controller('nearbyTest');
    }));


    it('should initialize slides & bind injected/reactive services to ctrl', function(){
        
        // Meteor
        expect(ctrl.connections).not.toBe(undefined);

        // Other
        expect(ctrl.listSlide).toBe(0);
        expect(ctrl.mapSlide).toBe(1);
        expect(ctrl.slide).toBe(0);
        expect(ctrl.geolocate).toEqual(GeoLocate);
        expect(ctrl.notify).toEqual(Notify);

    });

    it('should show/hide the scanning cover on list slide when no one is nearby', function(){

        var cover = template.find('section#nearby-scanning-cover');

        // Has connections
        ctrl.slide = 0;
        ctrl.connections.push({item: 'xxxxx'});
        $scope.$digest();

        expect(cover.hasClass('ng-hide')).toBe(true);

        // No connections
        ctrl.slide = 0;
        ctrl.connections.pop();
        $scope.$digest();

        expect(cover.hasClass('ng-hide')).toBe(false);

    });

    it('should wire the slide nav buttons correctly', function(){
        var listButton = template.find('button#nearby-list-button');
        var mapButton = template.find('button#nearby-map-button');

        listButton.triggerHandler('click');
        $scope.$digest();
        expect(ctrl.slide).toEqual(ctrl.listSlide);

        mapButton.triggerHandler('click');
        $scope.$digest();
        expect(ctrl.slide).toEqual(ctrl.mapSlide);

    });

    it('should bind ctrl.slide to ion-slide-box', function(){

        ctrl.slide = ctrl.listSlide;
        $scope.$digest();
        expect(slidebox.currentIndex()).toEqual(ctrl.listSlide);


        ctrl.slide = ctrl.mapSlide;
        $scope.$digest();
        expect(slidebox.currentIndex()).toEqual(ctrl.mapSlide);

    })  
})