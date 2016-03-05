var routes_debug, routes_debugII;

angular
  .module('linkedin')
  .config(config);

function config ($stateProvider, $urlRouterProvider, $angularMeteorSettings) {

  // Disables write of warnings to console
  $angularMeteorSettings.suppressWarnings = true; 

  $stateProvider

  // Each tab has its own nav history stack:
  .state('loading', {
      url: '/loading',
      templateUrl: 'templates/loading.html',
      controller: 'LoadingCtrl'
  })
  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
  })
  .state('setup', {
      url: '/setup',
      templateUrl: 'templates/setup.html',
      controller: 'SetupCtrl',
      controllerAs: 'vm'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'TabsCtrl',
    controllerAs: 'vm',
    resolve: {
        user: ['$auth', function($auth){
          return $auth.requireUser();
        }]
    }

  })


  .state('tab.nearby', {
      url: '/nearby',
      views: {
        'tab-nearby': {
          templateUrl: 'templates/tab-nearby.html',
          controller: 'NearbyCtrl',
          controllerAs: 'vm'
        }
      },

      resolve: {
        user: ['$auth', function($auth){
          return $auth.requireUser();
        }],
        linkInit: ['LinkedIn', 'user',function(LinkedIn, user){
            return LinkedIn.initialize();
        }],
        pushInit: ['Notify', 'linkInit', function(Notify, linkInit){
            return Notify.initialize();
        }],
        beaconInit: ['Beacons', 'pushInit', function(Beacons, pushInit){
            return Beacons.initialize();
        }],
        subscription: ['$q', 'beaconInit', function($q, beaconInit) {
            var deferred = $q.defer();
     
            var sub = Meteor.subscribe('connections', {
              onReady: function(){ deferred.resolve(sub) },
              onStop:  function(){ deferred.resolve(null) }
            });
     
            return deferred.promise;
        }], 
        geo: ['GeoLocate', 'subscription', function(GeoLocate, subscription){
            return GeoLocate.setup();
        }]
      }
  })
  .state('tab.nearby-profile', {
    url: '/nearby/:userId',
    views: {
      'tab-nearby': {
        templateUrl: 'templates/tab-profile.html',
        controller: 'NearbyProfileCtrl',
        controllerAs: 'vm'
      }
    },
    resolve: {
      user: ['$auth', function($auth){
          return $auth.requireUser();
      }]
    }
  })
  .state('tab.profile', {
      url: '/profile',
      views: {
        'tab-profile': {
          templateUrl: 'templates/tab-profile.html',
          controller: 'ProfileCtrl',
          controllerAs: 'vm'
        }
      },
      resolve: {
        user: ['LinkedIn',function(LinkedIn){
            return LinkedIn.initialize();
        }]
      }
  })
  .state('tab.notifications', {
      url: '/notifications',
      views: {
        'tab-notifications': {
          templateUrl: 'templates/tab-notifications.html',
          controller: 'NotificationsCtrl',
          controllerAs: 'vm'
        }
      },
      resolve: {
        user: ['$auth', function($auth){
            return $auth.requireUser();
        }],
        checked: ['Notify', function(Notify){
            return Notify.checkedNotifications();
        }],
      }
  })
  .state('tab.notifications-profile', {
    url: '/notifications/:sender',
    views: {
      'tab-notifications': {
        templateUrl: 'templates/tab-profile.html',
        controller: 'NotificationsProfileCtrl',
        controllerAs: 'vm'
      }
    },
    resolve: {
      user: ['$auth', function($auth){
          return $auth.requireUser();
      }]
    }
  })
  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
  })
  .state('tab.chat-detail', {
    url: '/chats/:chatId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })
  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl',
        controllerAs: 'vm',
      },
      resolve: {
        user: ['$auth', function($auth){
            return $auth.requireUser();
        }],
      }
    }
  })

  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('loading');
  //$urlRouterProvider.otherwise('login');

};