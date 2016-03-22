describe('ProfileCtrl', function(){

    var $controller, $scope, GitHub;

    beforeEach(module('gitphaser'));    // Application
    
    // Disable Ionic templating
    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $urlRouterProvider.deferIntercept();
    }));
    
    beforeEach(inject(function(_$controller_, _$rootScope_, _GitHub_){
        $controller = _$controller_;
        $scope = _$rootScope_;
        GitHub = _GitHub_;
    }));

    it('ProfileCtrl: Should bind ctrl to the current users GitHub profile', function(){

        GitHub.me = { firstName: 'Nicole', lastName: 'De Lorean'};
        var vm = $controller('ProfileCtrl', {$scope, GitHub});

        expect(vm.user).toEqual(GitHub.me);
        expect(vm.repos).toEqual(GitHub.repos);
        expect(vm.events).toEqual(GitHub.events);
        expect(vm.canFollow).toEqual(false);
        expect(vm.viewTitle).toEqual(GitHub.me.login);
    })

}); 