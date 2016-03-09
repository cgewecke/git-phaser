describe('ProfileCtrl', function(){

    var $controller, $scope, LinkedIn;

    beforeEach(module('linkedin'));    // Application
    
    // Disable Ionic templating
    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $urlRouterProvider.deferIntercept();
    }));

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