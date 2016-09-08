var auth_debug;

angular
  .module('gitphaser')
  .run(run);

// @function: run
// Registers routing error and kicks back to login page. By default the routing tries to send user
// to the Nearby tab - if those resolves fail they will trigger the $stateChangeError event. 
function run ($rootScope, $state) {

	$rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
		logger('$on:stateChangeError: ', disp(error));

		if (error === 'AUTH_REQUIRED') {
		  $state.go('login');
		}
	});

}