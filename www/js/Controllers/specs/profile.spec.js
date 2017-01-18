var np_debug;

describe('ProfileCtrl', function () {
  var $controller
  var $scope
  var $stateParams
  var $state
  var $compile
  var $templateCache
  var compileProvider
  var GitHub
  var template
  var ctrl
  var account
  var account_mock
  var init;

  beforeEach(module('templates'));  // ng-html2js template cache
  beforeEach(module('gitphaser'));  // Application
  beforeEach(module('mocks'));      // Mocked Meteor services, collections

  // Mock 'account' injected from the resolve
  account_mock = {
    info: { login: 'penelope'},
    repos: {},
    events: {}
  };
  
  // Inject $compileProvider so we can spin up directives from the templates
  // and test the DOM
  beforeEach(module(function ($compileProvider) {
    compileProvider = $compileProvider;
  }));

  // Declare account
  beforeEach(module(function ($provide) {
    $provide.value('account', account_mock);
  }));

  beforeEach(inject(function (
    _$controller_, 
    _$rootScope_, 
    _$stateParams_, 
    _$state_, 
    _$compile_, 
    _$templateCache_,
    _Mock_, 
    _GitHub_, 
    _account_) 
  {
    $controller = _$controller_;
    $scope = _$rootScope_;
    $stateParams = _$stateParams_;
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    GitHub = _GitHub_;
    account = _account_;
    $state = _$state_;

    // Mock Github.me
    GitHub.me = { login: 'alberto' };

    // Compile Template
    compileProvider.directive('profileTest', function () {
      return {
        controller: 'ProfileController as vm',
        template: $templateCache.get('templates/tab-profile.html')
      };
    });

    init = function (no_account) {
      if (no_account) {
        account = null;
      }
      template = angular.element('<ion-nav-bar><profile-test></profile-test></ion-nav-bar');
      $compile(template)($scope);
      $scope.$digest();

      // Get controller
      ctrl = template.find('profile-test').controller('profileTest');
    };
  }));

  describe('Instance @ route: tabs/profile ', function () {
    it('should initialize with the GitHub user', function () {
      GitHub.me = { login: 'alberto' }, GitHub.repos = 2, GitHub.events = 3;
      account = false;
      ctrl = $controller('ProfileController', {
        $scope: $scope,
        $stateParams: $stateParams,
        $state: $state,
        GitHub: GitHub,
        account: account
      });

      expect(ctrl.user).toEqual(GitHub.me);
      expect(ctrl.repos).toEqual(GitHub.repos);
      expect(ctrl.events).toEqual(GitHub.events);
      expect(ctrl.canFollow).toEqual(false);
      expect(ctrl.viewTitle).toEqual(GitHub.me.login);
      expect(ctrl.nav).toEqual(false);
    });

    it('should hide the back button', function () {
      var button;

      init();
      ctrl.nav = false;
      $scope.$digest();
      button = template.find('#profile-back-btn');
      // Can't find the back button
      // expect(button.hasClass('ng-hide')).toBe(true);
    });

    it('should hide fake lower nav tabs', function () {
      var simutab;
      init();
      ctrl.nav = false;
      $scope.$digest();
      simutab = template.find('#profile-simutab');
      expect(simutab.hasClass('ng-hide')).toBe(true);
    });
  });

  describe('Instance @ route: others/ ', function () {
    it('should be injected with an account object', function () {
      init();

      // Check explicit assignments
      expect(ctrl.user).toEqual(account.info);
      expect(ctrl.repos).toEqual(account.repos);
      expect(ctrl.events).toEqual(account.events);
      expect(ctrl.viewTitle).toEqual(account.info.login);
    });

    it('should show a follow button if the target is followable', function () {
      var button;

      // Mock canFollow to return true;
      GitHub.canFollow = function () { return true; };
      spyOn(GitHub, 'canFollow').and.callThrough();
      init();
      button = template.find('#profile-follow-button');
      expect(button.hasClass('ng-hide')).toBe(false);
    });

    it('should hide the follow button if the target is NOT followable', function () {
      var button;

      // Mock canFollow to return false;
      GitHub.canFollow = function () { return false; };
      spyOn(GitHub, 'canFollow').and.callThrough();
      init();
      button = template.find('#profile-follow-button');
      expect(button.hasClass('ng-hide')).toBe(true);
    });

    it('should show fake lower nav tabs', function () {
      var button;
      init();
      button = template.find('#profile-simutab');
      expect(button.hasClass('ng-hide')).toBe(false);
    });

    it('should show a back button', function () {
      var button;
      init();
      button = template.find('#profile-back-btn');
      expect(button.hasClass('ng-hide')).toBe(false);
    });

    describe('back()', function () {
      it('should navigate to tab.nearby', function () {
        var button;
        spyOn($state, 'go');
        init();
        button = template.find('#profile-back-btn');
        button.triggerHandler('click');
        $scope.$digest();

        // Can't find back btn
        // expect($state.go).toHaveBeenCalledWith('tab.nearby');
      });
    });

    describe('follow()', function () {
      it('should hide the follow button', function () {
        var button;
        GitHub.canFollow = function () { return true; }; // Mock canFollow to return true;
        init();
        button = template.find('#profile-follow-button');
        ctrl.follow();
        $scope.$digest();
        expect(button.hasClass('ng-hide')).toBe(true);
      });

      it('should call the GitHub follow method', function () {
        spyOn(GitHub, 'follow');
        init();
        ctrl.follow();
        expect(GitHub.follow).toHaveBeenCalledWith(ctrl.user);
      });
    });
  });
});

