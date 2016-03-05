"use strict"
var test_debug;

describe('Small Controllers/Templates', function () {
    
    var compileProvider;

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
 
    
    describe('TabsCtrl', function(){

        var $controller, $scope, $reactive, user, MeteorMock;

        beforeEach(inject(function(_$controller_, _$rootScope_, _Mock_){
            $controller = _$controller_;
            $scope = _$rootScope_;

            $reactive = _Mock_.$reactive;
            Meteor.user = _Mock_.Meteor.user;
            user = _Mock_.user;
        }));

        it('should reactively bind "Meteor.user().notifyCount" to the controller', function(){

            var vm = $controller('TabsCtrl', {$scope: $scope, $reactive: $reactive });
                 
            user.profile.notifyCount = 1;
            vm.autorun();

            expect(vm.notifyCount).toEqual(1);

            user.profile.notifyCount = 1;
            vm.autorun();

            expect(vm.notifyCount).toEqual(1);

        }); 

    });


    describe('SetupCtrl', function(){

        var $controller, $scope, $state, $timeout, $compile, $templateCache

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
    
    describe('NotificationsCtrl', function(){

        var $controller, $scope, $compile, $templateCache, $reactive, $inject, user, template, ctrl;

        beforeEach(inject(function(_$controller_, _$rootScope_, _Mock_, _$compile_, _$templateCache_){
            
            $controller = _$controller_;
            $scope = _$rootScope_;
            $compile = _$compile_;
            $templateCache = _$templateCache_;

            $reactive = _Mock_.$reactive;
            Meteor = _Mock_.Meteor;
            user = _Mock_.user;
            
            // Compile /tab-notifications
            compileProvider.directive('notificationsTest', notificationsTest);

            function notificationsTest(){
                return {
                    controller: 'NotificationsCtrl',
                    controllerAs: 'vm',
                    template: $templateCache.get('templates/tab-notifications.html')
                }
            };
            
            template = angular.element('<ion-nav-bar><notifications-test></notifications-test></ion-nav-bar>');            
            $compile(template)($scope);
            $scope.$digest();

            ctrl = template.find('notifications-test').controller('notificationsTest');
              
        }));

        it('should reactively bind the users notifications array to ctrl', function(){
            
            var vm = $controller('NotificationsCtrl', {$scope: $scope, $reactive: $reactive });

            user.profile = { notifications: [] };
            vm.autorun();
            expect(vm.notifications.length).toBe(0);

            user.profile = { notifications: [{key: 'A'}] };
            vm.autorun();
            expect(vm.notifications.length).toBe(1);
        });

        it('should show/hide the "no notifications" item appropriately', function(){

            var item;

            item = template.find('ion-item#notifications-none');
            ctrl.notifications.push({key: 'X'});
            $scope.$digest();
            
            expect(item.hasClass('ng-hide')).toBe(true);

            ctrl.notifications.pop();
            $scope.$digest();

            expect(item.hasClass('ng-hide')).toBe(false);
            
        });

        it('should link a notification item to the correct profile view', function(){
            
            var item, html;

            ctrl.notifications.push({sender: 'nicole'});
            $scope.$digest();
            
            html = template.find('ion-item')[0];
            item = angular.element(html);

            expect(item.attr('href')).toEqual('#/tab/notifications/nicole');

        })

    })
        
    describe('NearbyCtrl', function(){

        var $controller, $scope, $compile, $templateCache, template, GeoLocate, Notify, ctrl, slidebox;

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
    
       
    describe('NotificationsProfileCtrl', function(){

        var $controller, $scope, $reactive, MeteorMock, user, $stateParams;

        beforeEach(inject(function(_$controller_, _$rootScope_, _Mock_, _$stateParams_){
            $controller = _$controller_;
            $scope = _$rootScope_;
            $stateParams = _$stateParams_;

            $reactive = _Mock_.$reactive;
            MeteorMock = _Mock_.Meteor;
            user = _Mock_.user;
            
        }));

        it('should bind to profile associated with relevant note sender to controller', function(){
               
            user.profile.notifications.push({sender: 'yyy', profile: {firstName: 'xxx', lastName: 'zzz'}});
            $stateParams.sender = 'yyy';
            Meteor.user = MeteorMock.user;

            var vm = $controller('NotificationsProfileCtrl', {$scope, $stateParams});

            expect(vm.user).toEqual(user.profile.notifications[0].profile);
            expect(vm.user.name).toEqual(vm.user.firstName + ' ' + vm.user.lastName);
            expect(vm.viewTitle).toEqual(vm.user.name);

        });
    })

    describe('NearbyProfileCtrl', function(){

        var $controller, $scope, $stateParams, $compile, $templateCache, template, ctrl, mini;

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

            Connections.insert(mini);
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

    describe('ProfileCtrl', function(){

        var $controller, $scope, LinkedIn;

        beforeEach(inject(function(_$controller_, _$rootScope_, _LinkedIn_){
            $controller = _$controller_;
            $scope = _$rootScope_;
            LinkedIn = _LinkedIn_;
        }));

        it('ProfileCtrl: Should bind ctrl to the current users LinkedIn profile', function(){

            LinkedIn.me = { firstName: 'Nicole', lastName: 'De Lorean'};
            var vm = $controller('ProfileCtrl', {$scope, LinkedIn});

            expect(vm.user).toEqual(LinkedIn.me);
            expect(vm.user.name).toEqual(vm.user.firstName + ' ' + vm.user.lastName);
            expect(vm.viewTitle).toEqual('You');
        })

    }); 

    describe('LoadingCtrl', function(){

        var $scope, $controller, $ionicPlatform, $state, $httpBackend, $timeout, ionicToast, mock_status;

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

            spyOn($ionicPlatform, 'ready').and.callThrough();
            spyOn($state, 'go');
            spyOn(ionicToast, 'show');

            var vm = $controller('LoadingCtrl', {$ionicPlatform: $ionicPlatform, $state: $state, $timeout, ionicToast });
            
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
        
    /*
        

        

        */

    //it('SettingsCtrl: . . . . .', function(){
        // STUB: THIS TAB GETTING REWRITTEN FOR ISSUE #56
    //})

});