angular.module('gitphaser').controller('NotificationsController', NotificationsCtrl);
/**
 * @ngdoc object
 * @module  gitphaser
 * @name  gitphaser.object:NotificationsCtrl
 * @description  Controller for `tab-notifications` route. Exposes array of notifications in
 *               user.profile to DOM.
 */
function NotificationsCtrl ($scope, $reactive) {
  $reactive(this).attach($scope);
  var self = this;

  this.helpers({
    notifications: function () {
      if (Meteor.user()) {
        return Meteor.user().profile.notifications;
      }
    }
  });

  /**
   * @ngdoc method
   * @methodOf gitphaser.object:NotificationsCtrl
   * @name  gitphaser.object:NotificationsCtrl.remove
   * @description Deletes a notification on client and server.
   */
  this.remove = function (note) {
    for (var i = 0; i < self.notifications.length; i++) {
      if (note.sender === self.notifications.sender) {
        self.notifications.splice(i, 1);
        break;
      }
    }

    Meteor.users.update(
      {_id: Meteor.userId()},
      {$set: {'profile.notifications': self.notifications } }
    );
  };
}
