angular.module('gitphaser').directive("simuTab", simuTab);

/**
 * @ngdoc directive
 * @name  gitphaser.directive:simuTab
 * @module  gitphaser
 * @restrict E
 * 
 * @description 
 * `<simu-tab>` Nav bar that is decoupled from the main tab stack for 'others' profiles,
 *     which have their own tabs.      
 */
function simuTab(GitHub){
    return {
        restrict: 'E',   
        replace: true,
        templateUrl: 'templates/simutab.html',
        link: function(scope, elem, attrs){}
    }
}
        
      