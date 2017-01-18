angular.module('gitphaser').controller('NotificationsProfileController', NotificationsProfileCtrl);
/**
 * @ngdoc object
 * @module  gitphaser
 * @name  gitphaser.object:NotificationsProfileCtrl
 * @description  Governs child view of `notifications` route and shows github profile of target
 *               when a notification is selected. Iterates through current user's array
 *               of notifications to locate correct `:sender` and populates the default profile
 *               template. Is cached per unique $stateParams `Meteor.userId`
 */
function NotificationsProfileCtrl ($scope, $stateParams) {
  var self = this;
  var notes = Meteor.user().profile.notifications;

  self.user = null; // The note sender's profile;

  if (notes) {
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].sender === $stateParams.sender) {
        self.user = notes[i].profile;
        self.user.name = this.user.firstName + ' ' + this.user.lastName;
        self.viewTitle = this.user.name;
        break;
      }
    }
  }
}
