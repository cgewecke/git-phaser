angular.module('gitphaser').directive("hireable", Hireable);

/**
 * @ngdoc directive
 * @name  gitphaser.directive:hireable
 * @module  gitphaser
 *
 * @description 
 * `<hireable>` Cash icon visible if attr 'available' is true. Tapping icon shows a brief toast
 *     with message: `{{name}}` is available for hire
 *      
 * @param {boolean=} hireable Value of `hireable` key in the github user object
 * @param {string=} name Value of the `login` key of an github account.info object
 */
function Hireable(ionicToast){
   return {
        restrict: 'E',   
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