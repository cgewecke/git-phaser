angular.module('gitphaser').service('Beacons', Beacons);

/**
 * @ngdoc service
 * @module  gitphaser
 * @name  gitphaser.service:Beacons
 * @description  Service that transmits and receives iBeacon signal.
 */
function Beacons ($rootScope, $q, $cordovaBeacon, GitHub) {
  var self = this;

  // The set of uuids to monitor for
  var uuids = [
    '4F7C5946-87BB-4C50-8051-D503CEBA2F19',
    'D4FB5D93-B1EF-42CE-8C08-CF11685714EB',
    '98983597-F322-4DC3-A36C-72052BF6D612',
    '8960D5AB-3CFA-46E8-ADE2-26A3FB462053',
    '458735FA-E270-4746-B73E-E0C88EA6BEE0',
    '01EC8B5B-B7DB-4D65-949C-81F4FD808A1A',
    '33A93F3C-9CAA-4D39-942A-6659AD039232',
    '774D64CA-91C9-4C3A-8DA3-221D9CF755E7',
    '9BD991F7-0CB9-4FA7-A075-B3AB1B9CFAC8',
    '05DEE885-E723-438F-B733-409E4DBFA694'
  ];

  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:Beacons
   * @name  gitphaser.service:Beacons.regions
   * @description `Array` of beacon region objects the service monitors for.
   */
  self.regions = [];

  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:Beacons
   * @name  gitphaser.service:Beacons.quantity
   * @description `Number` of available beacon uuids to select a broadcast user id from
   */
  self.quantity = uuids.length;

  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:Beacons
   * @name  gitphaser.service:Beacons.initialized
   * @type { boolean }
   * @description `Boolean` state: true when user has authorized background beacon use, false otherwise.
   */
  self.initialized = false;

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:Beacons
   * @name  gitphaser.service:Beacons.getUUID
   * @param {number} index The index of the uuid array to select
   * @description Exposes the uuid array. When the user is creating an account by logging in for the first
   *              time the modulus of the server-generated Beacon minor and the uuid array length is used to select a uuid.
   *              This allows them to be distributed evenly across acounts and minimizes the likelyhood that a duplicate
   *              uuid will be present in any group of phones.
   */
  self.getUUID = function (index) {
    return uuids[index];
  };

  /**
   * @ngdoc method
   * @methodOf gitphaser.service:Beacons
   * @name  gitphaser.service:Beacons.initialize
   * @description Sets up beaconing in app. This method resolves on the Nearby tab, so it may
   *              have already run as user navigates around.
   * @returns {promise} Rejects if user does not authorize background beacon use
   */
  self.initialize = function () {
    var where = 'Beacons:initialize';
    var profile;
    var appBeacon;
    var deferred = $q.defer();

    // Return if initialized. Also beacons cannot run in browser + output is annoying in XCode.
    if ($rootScope.DEV || $rootScope.beaconsOFF || self.initialized) { deferred.resolve(); return deferred; }

    // Init region array. Set device to wake app up when killed/backgrounded
    setUpRegions();
    $cordovaBeacon.requestAlwaysAuthorization();

    // Monitor all uuids
    angular.forEach(self.regions, function (region) {
      $cordovaBeacon.startMonitoringForRegion(region);
    });

    // Range for all regions
    angular.forEach(self.regions, function (region) {
      $cordovaBeacon.startRangingBeaconsInRegion(region);
    });

    // Register handlers
    $rootScope.$on('$cordovaBeacon:didExitRegion', function (event, result) {
      onExit(result);
    });
    $rootScope.$on('$cordovaBeacon:didRangeBeaconsInRegion', function (event, result) {
      onCapture(result);
    });

    // Transmit
    profile = Meteor.user().profile;
    appBeacon = $cordovaBeacon.createBeaconRegion(
      profile.beaconName,
      profile.appId,
      parseInt(profile.major),
      parseInt(profile.minor),
      true
    );
    $cordovaBeacon.startAdvertising(appBeacon);

    // Check authorization before resolving. Remove newInstall key
    // from local storage so that a pw/login will redirect to the settings
    // page.
    $cordovaBeacon.getAuthorizationStatus()
      .then(function (status) {
        self.initialized = true;
        deferred.resolve();
      }, function (error) {
        self.initialized = false;
        window.localStorage.removeItem('pl_newInstall');
        deferred.reject('AUTH_REQUIRED');
      }
    );
    return deferred;
  };

  /**
   * Initialize an array beaconRegion obj to all our possible uuid vals
   */
  function setUpRegions () {
    for (var i = 0; i < uuids.length; i++) {
      self.regions.push($cordovaBeacon.createBeaconRegion('r_' + i, uuids[i], null, null, true));
    }
  }

  /**
   * Called when monitoring exits a region. Pulls app identifier from local storage and
   * attempts to remove any connections where this app is the receiver and the transmitter
   * has the uuid specified by 'result'.
   * @param  {Object} result Beacon object (this only contains uuid, not major/minor)
   */
  function onExit (result) {
    var transmitter, pkg, beacon;
    var where = 'Beacons:onExit';
    var localId = window.localStorage['pl_id'];
    var receiver = (localId != undefined) ? localId : Meteor.user().emails[0].address;

    beacon = result.region;

    if (receiver && beacon) {
      pkg = { transmitter: beacon.uuid, receiver: receiver };
      Meteor.call('disconnect', pkg);
    } else {
      logger(where, 'error: receiver or beacon null');
    }
  }

  /**
   * Called when ranging detects a beacon. Pulls app identifier from local storage and
   * attempts to create a connection record in the meteor DB.
   * @param  {Object} result Ranged beacons object (result.beacons is an array)
   */
  function onCapture (result) {
    var receiver, proximity, pkg, localId, notification, beacons = result.beacons;

    if (beacons.length) {
      localId = window.localStorage['pl_id'];
      receiver = (localId != undefined) ? localId : Meteor.user().emails[0].address;

      angular.forEach(beacons, function (beacon) {
        pkg = {};
        pkg.transmitter = beacon.major + '_' + beacon.minor + '_' + beacon.uuid;
        pkg.receiver = receiver;
        pkg.proximity = beacon.proximity;

        // Check to see if we already have this in Connections. Add if possible.
        if (!hasConnection(pkg.transmitter)) {
          Meteor.call('newConnection', pkg, function (err, val) {
            if (err || !val) return;

            // Acquire profile of transmitter and notify receiver they were transmitted to.
            GitHub.initialize()
              .then(function () {
                GitHub.getAccount(val)
              .then(function (account) {
                pkg = {};
                pkg.target = Meteor.userId();
                pkg.notification = {
                  sender: account.info.login,
                  type: 'detection',
                  pictureUrl: account.info.avatar_url,
                  name: account.info.name,
                  timestamp: new Date()
                };
                Meteor.call('notify', pkg);
              });
              });
          });
        }
      });
    }
  }

  /**
   * Checks local Connections to see if this proximity contact already exists
   * This prevents hammering the server as the beacon signal gets picked up.
   * When contact is first made, hasConnection will produce a few false negatives
   * because of latency.
   * @param  {String}  transmitter Unique transmitter uuid
   * @return {Boolean} `True` if connection already exists, `false` otherwise.
   */
  function hasConnection (transmitter) {
    var connections;
    if (Meteor.userId()) {
      connections = Connections.find({transUUID: transmitter });
      return !!(connections.length);
    }
    return true;
  }
}
