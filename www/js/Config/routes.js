

angular.module('gitphaser').config(config);

function config ($stateProvider, $urlRouterProvider, $angularMeteorSettings ) {

    $stateProvider

    // ------------------------------  Login/Admin Views --------------------------------
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

    // ------------------------------  Profiles (Except Self) ----------------------------
    .state('others', {
        url: '/others/:origin/:username',
        templateUrl: 'templates/tab-profile.html',
        controller: 'ProfileCtrl',
        controllerAs: 'vm',
        resolve: {
            user: ['$auth', function($auth){
                    return $auth.requireUser();
            }],
            account: ['GitHub', '$stateParams', function(GitHub, $stateParams){
                    return GitHub.getAccount($stateParams.username);
            }] 
        }
    })

    // ------------------------------  Tabs ----------------------------------------------
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
            linkInit: ['GitHub', 'user',function(GitHub, user){
                    console.log('gh initialized');
                    return GitHub.initialize();
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
            user: ['GitHub',function(GitHub){
                    return GitHub.initialize();
            }],
            account: function(){ return false; }
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
};