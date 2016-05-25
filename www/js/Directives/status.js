var ss_debug, ss_debugII;

angular.module('gitphaser')
  .directive("serverStatus", ServerStatus);


function ServerStatus($reactive, ionicToast){
    return {
        restrict: 'E',   
        replace: true,
        template: 
        
            '<ion-nav-buttons side="right">' + 
                '<button id="status-button" class="button button-clear icon ion-ios-cloud-outline" ng-click="toast()"' +
                        'ng-class="{\'button-assertive\': !status, \'button-balanced\': status}">' +
                '</button>' +
            '</ion-nav-buttons>',

         link: function(scope, elem, attrs){
   
            scope.status = false;
            scope.self = this; // Unit testing

            scope.toast = function(){
                var message;

                (scope.status) ?
                    message = 'You are connected to the server.' :
                    message = 'You are not connected to the server.';

                ionicToast.show(message, 'middle', false, 1000);
            };

            scope.vm.autorun(function(){
             
                (Meteor.status().status === "connected") ?
                    scope.status = true:
                    scope.status = false;
            });              
        }
    };
};
