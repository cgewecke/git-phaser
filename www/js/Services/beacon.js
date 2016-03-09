// @service: Beacons
// Handlers for initializing, transmitting and receiving of beacon signals
angular.module('linkedin')
  .service("Beacons", Beacons);


function Beacons($rootScope, $q, $cordovaBeacon){

	var self = this;

    // The set of uuids to monitor for
	var uuids = [
		"4F7C5946-87BB-4C50-8051-D503CEBA2F19", //1
		"D4FB5D93-B1EF-42CE-8C08-CF11685714EB", //2
		"98983597-F322-4DC3-A36C-72052BF6D612", //3
		"8960D5AB-3CFA-46E8-ADE2-26A3FB462053", //4
		"458735FA-E270-4746-B73E-E0C88EA6BEE0", //5
		"01EC8B5B-B7DB-4D65-949C-81F4FD808A1A", //6
		"33A93F3C-9CAA-4D39-942A-6659AD039232", //7
		"774D64CA-91C9-4C3A-8DA3-221D9CF755E7", //8
		"9BD991F7-0CB9-4FA7-A075-B3AB1B9CFAC8", //9
		"05DEE885-E723-438F-B733-409E4DBFA694", //10
	];


    self.regions = [];
    
    // ------------------------  Public ---------------------------------
	self.quantity = uuids.length;
    self.initialized = false;
    
    // @function: getUUID 
    // Exposes the uuid array. In LoginCtrl, the modulus of the Beacon minor and the 
    // uuid array side is used to select a uuid. This allows them to be distributed evenly 
    // across acounts and minimizes the likelyhood that a duplicate uuid will be present
    // in any group of phones. See beacon-testing/issues/15 for details. 
    self.getUUID = function(index){
        return uuids[index];
    };

	// @function initialize() 
    // Sets up beaconing in app. This method resolves on the Nearby tab, so it may
    // have already run as user navigates around. Rejects if user does not authorize.
	self.initialize = function(){

        var deferred = $q.defer();

        // Return if initialized. Also beacons cannot run in browser + output is annoying in XCode.
        if ($rootScope.DEV || $rootScope.beaconsOFF || self.initialized  ) { deferred.resolve(); return deferred; }
           
        MSLog('@beacons:initialize');

		var profile, appBeacon;

        // Init region array. Set device to wake app up when killed/backgrounded
        setUpRegions();
		$cordovaBeacon.requestAlwaysAuthorization();

		// Monitor all uuids
		angular.forEach(self.regions, function(region){
            $cordovaBeacon.startMonitoringForRegion(region);
        });

        // Range for all regions
        angular.forEach(self.regions, function(region){
            $cordovaBeacon.startRangingBeaconsInRegion(region);
        });

        // Register handlers
        $rootScope.$on("$cordovaBeacon:didEnterRegion", function(event, result){
            onEntry(result);
        });
		$rootScope.$on("$cordovaBeacon:didExitRegion", function(event, result){
            onExit(result);
        });
        $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function(event, result){
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
        $cordovaBeacon.getAuthorizationStatus().then(
            function(status){
                self.initialized = true;
                deferred.resolve();
            }, function(error){
                self.initialized = false;
                window.localStorage.removeItem('pl_newInstall');
                deferred.reject('AUTH_REQUIRED');
            }
        );
        
        return deferred;
	};

    // ------------------------  Private ---------------------------------
    // setUpRegions(): initialize an array beaconRegion obj of all our possible uuid vals
    function setUpRegions(){
        for (var i = 0; i < uuids.length; i++){
            self.regions.push( $cordovaBeacon.createBeaconRegion('r_' + i, uuids[i], null, null, true));
        }
    };
    
    // @function onEntry
    // Stub. Called when monitoring enters a region. This is not run if waking up from the background, so
    // basically useless.
    function onEntry(result){
   
       MSLog('@beacons:onEntry');
    };

    // @function: onExit
    // @param: result (this only contains uuid, not major/minor)
    // Called when monitoring exits a region. Pulls app identifier from local storage and
    // attempts to remove any connections where this app is the receiver and the transmitter
    // has the uuid specified by 'result'.   
    function onExit(result){

        MSLog('@beacons:onExit');

        var transmitter, pkg, beacon;
        var localId = window.localStorage['pl_id']
        var receiver = (localId != undefined) ? localId : Meteor.user().emails[0].address;
        
        beacon = result.region;
        
        if (receiver && beacon){

            pkg = {
               transmitter: beacon.uuid,
               receiver: receiver,
            };
            
            Meteor.call('disconnect', pkg);

        } else {
            MSLog("@beacon:disconnect. Error: receiver - " + receiver);
        }
        
        
    };

    // @function: onCapture
    // @param: result (result.beacons is an array)
    // Called when ranging detects a beacon. Pulls app identifier from local storage and
    // attempts to create a connection record in the meteor DB.  
    function onCapture(result){

        var beacons = result.beacons

        if (beacons.length){
    
            var localId = window.localStorage['pl_id'];
            var receiver = (localId != undefined) ? localId : Meteor.user().emails[0].address;           
            var transmitter, pkg;

            angular.forEach(beacons, function(beacon){

                pkg = {
                   transmitter: beacon.major + '_' + beacon.minor + '_' + beacon.uuid,
                   receiver: receiver,
                   proximity: beacon.proximity 
                };
                
                Meteor.call('newConnection', pkg);
                
            })
        }
    };

}