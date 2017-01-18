describe('TabsCtrl', function () {
  var $controller
  var $scope
  var $reactive
  var user
  var MeteorMock;

  beforeEach(module('gitphaser')); // Application
  beforeEach(module('mocks'));     // Mocked Meteor services

  // Disable Ionic templating & routing
  beforeEach(module(function ($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function () {});
    $urlRouterProvider.deferIntercept();
  }));

  beforeEach(inject(function (_$controller_, _$rootScope_, _Mock_) {
    $controller = _$controller_;
    $scope = _$rootScope_;

    $reactive = _Mock_.$reactive;
    Meteor.user = _Mock_.Meteor.user;
    user = _Mock_.user;
  }));

  it('should reactively bind "Meteor.user().notifyCount" to the controller', function () {
    var vm = $controller('TabsController', {$scope: $scope, $reactive: $reactive });

    user.profile.notifyCount = 1;
    vm.autorun();
    expect(vm.notifyCount).toEqual(1);
    user.profile.notifyCount = 1;
    vm.autorun();
    expect(vm.notifyCount).toEqual(1);
  });
});
