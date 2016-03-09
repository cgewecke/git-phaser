describe('NotificationsProfileCtrl', function(){

    var $controller, $scope, $reactive, MeteorMock, user, $stateParams;

    beforeEach(module('gitphaser'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections
    
    // Disable Ionic templating
    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $urlRouterProvider.deferIntercept();
    }));

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
});