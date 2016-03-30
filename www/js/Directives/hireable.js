angular.module('gitphaser')
  .directive("hireable", Hireable);

// @directive: <hireable available='user.hireable' name="user.login"></hireable>
// @params: available (boolean value of hireable key in the github user object). 
//          name (String)
//
// Cash icon visible if attr 'available' is true. Tapping icon shows a brief toast
// with message: {{name}} is available for hire
function Hireable(ionicToast){
   return {
        restrict: 'E',   
        //replace: true,
        scope: {available: '=', name: '=' },
        template:
            '<button id="hireable-btn" ng-show="available" ng-click="toast()"' +
               'class="button button-clear button-balanced icon ion-card">' +
            '</button>',

        link: function(scope, elem, attrs){

            var message;
            var where = '<hireable>: ';

            if (scope.name){

                message = scope.name + ' is available for hire.';

                scope.toast = function(){
                    ionicToast.show(message, 'middle', false, 1250);
                };
            
            } else {
                logger(where, 'missing name attribute');
            }
        }
    }
};