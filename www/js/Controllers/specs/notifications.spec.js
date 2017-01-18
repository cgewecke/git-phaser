describe('NotificationsCtrl', function () {
  var $controller
  var $scope
  var $compile
  var $templateCache
  var $reactive
  var $inject
  var compileProvider
  var user
  var template
  var ctrl;

  beforeEach(module('templates'));  // ng-html2js template cache
  beforeEach(module('gitphaser'));  // Application
  beforeEach(module('mocks'));      // Mocked Meteor services, collections

  // Disable Ionic templating
  beforeEach(module(function ($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function () {});
    $urlRouterProvider.deferIntercept();
  }));

  // Inject $compileProvider so we can spin up directives from the templates
  // and test the DOM
  beforeEach(module(function ($compileProvider) {
    compileProvider = $compileProvider;
  }));

  beforeEach(inject(function (
    _$controller_, 
    _$rootScope_, 
    _Mock_, 
    _$compile_, 
    _$templateCache_) 
  {
    $controller = _$controller_;
    $scope = _$rootScope_;
    $compile = _$compile_;
    $templateCache = _$templateCache_;

    $reactive = _Mock_.$reactive;
    Meteor = _Mock_.Meteor;
    user = _Mock_.user;

    // Compile /tab-notifications
    compileProvider.directive('notificationsTest', notificationsTest);

    function notificationsTest () {
      return {
        controller: 'NotificationsController',
        controllerAs: 'vm',
        template: $templateCache.get('templates/tab-notifications.html')
      };
    }

    template = angular.element('<ion-nav-bar><notifications-test></notifications-test></ion-nav-bar>');
    $compile(template)($scope);
    $scope.$digest();

    ctrl = template.find('notifications-test').controller('notificationsTest');
  }));

  it('should reactively bind the users notifications array to ctrl', function () {
    var vm = $controller('NotificationsController', {$scope: $scope, $reactive: $reactive });

    user.profile = { notifications: [] };
    vm.autorun();
    expect(vm.notifications.length).toBe(0);
    
    user.profile = { notifications: [{key: 'A'}] };
    vm.autorun();
    expect(vm.notifications.length).toBe(1);
  });

  it('should show/hide the "no notifications" item appropriately', function () {
    var item;

    item = template.find('ion-item#notifications-none');
    ctrl.notifications.push({key: 'X'});
    $scope.$digest();

    expect(item.hasClass('ng-hide')).toBe(true);

    ctrl.notifications.pop();
    $scope.$digest();

    expect(item.hasClass('ng-hide')).toBe(false);
  });

  it('should link a notification item to the correct profile view', function () {
    var item, html;

    ctrl.notifications.push({sender: 'nicole'});
    $scope.$digest();

    html = template.find('ion-item')[0];
    item = angular.element(html);

    expect(item.attr('href')).toEqual('#/others/notifications/nicole');
  });
});
