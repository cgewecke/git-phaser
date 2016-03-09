angular.module('linkedin')
  .controller('LoadingCtrl', LoadingCtrl);

// @controller: LoadingCtrl
// @params: $ionicPlatform, $state, $timeout, ionicToast
// @route: /loading
//
// Controller for the default/otherwise route. Waits for platform ready,
// then attempts to navigate to the 'nearby' tab, which will kick back
// to 'login' if there is a problem. Run 5s timeout to redirect to login with
// a warning toast if there's no Meteor server connection, because that causes the 
// nearby resolves to hang.
function LoadingCtrl ($ionicPlatform, $state, $timeout, ionicToast ){
   
  var self = this;

  $ionicPlatform.ready(function(){
      
      $state.go('tab.nearby');
      
      $timeout(function(){
        var message;

        if (Meteor.status().status != 'connected'){
          message = "There's a problem connecting to the server. Try again later."
          ionicToast.show(message, 'top', true, 2500);

          $state.go('login');
        }
      }, 5000)
  });
};