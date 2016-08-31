angular.module('gitphaser').controller('NotificationsCtrl', NotificationsCtrl);
/**
 * @ngdoc object
 * @module  gitphaser
 * @name  gitphaser.object:NotificationsCtrl
 * @description  Controller for `tab-notifications` route. Exposes array of notifications in 
 *               user.profile to DOM.
 */
function NotificationsCtrl ($scope, $reactive){
  	$reactive(this).attach($scope);
  
  	this.helpers({
	  	notifications: function () {
			if(Meteor.user()) 
		  		return Meteor.user().profile.notifications;
	  	}
  	});
};