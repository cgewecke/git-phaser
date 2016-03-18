var auth_debug;

angular
  .module('gitphaser')
  .run(run);

// @function: run
// Registers routing error and kicks back to login page. By default the routing tries to send user
// to the Nearby tab - if those resolves fail they will trigger the $stateChangeError event. 
function run ($rootScope, $state) {

	$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
		//logger('@stateChange TO: ', JSON.stringify(toState));
		//logger('@stateChange FROM: ', JSON.stringify(fromState));
	});

	$rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
		log('@stateChangeError: ', error);

		if (error === 'AUTH_REQUIRED') {
		  $state.go('login');
		}
	});

}