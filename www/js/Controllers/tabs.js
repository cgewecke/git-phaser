angular.module('gitphaser')
  .controller('TabsCtrl', TabsCtrl);

// @controller: TabsCtrl
// @params: $scope, $reactive
// @route: /tab
//
// Exposes user profile var 'notifyCount' (the number of unchecked notifications)
// to the DOM to determine badge display over tab icon
function TabsCtrl ($scope, $reactive){
  $reactive(this).attach($scope);

  this.helpers({
      notifyCount: function () {
        if(Meteor.user()) 
          return Meteor.user().profile.notifyCount;
      }
  }); 
};  