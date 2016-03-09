angular.module('gitphaser')
  .controller('NotificationsCtrl', NotificationsCtrl);

// @controller: NotificationsCtrl
// @params: $scope, $reactive
// @route: /tab/notifications
//
// Exposes array of notifications in user.profile to DOM for
// tab-notifications view
function NotificationsCtrl ($scope, $reactive){
  $reactive(this).attach($scope);
  
  this.helpers({
      notifications: function () {
        if(Meteor.user()) 
          return Meteor.user().profile.notifications;
      }
  });
 
};