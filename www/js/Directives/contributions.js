angular.module('gitphaser').directive("contributions", Contributions);
 
/**
 * @ngdoc directive
 * @name  gitphaser.directive:contributions
 * @module  gitphaser
 * @restrict E
 * 
 * @description 
 * `<contributions>` A Github contributions graph scraped from an svg resource. This has to be obtained
 *     by server proxy. The directive shows a spinner until the svg is received. SVG is embedded
 *     in a lateral scroll container that gets moved right-wards the maximum amount on load. 
 *      
 * @param {String=} name The `login` key of an github account.info object
 */
function Contributions($http, $window, $ionicScrollDelegate, GitHub){
    return {
        restrict: 'E',   
        replace: true,
        scope: {name: '='},
        template:

            '<div class="center grey">' +
                '<ion-spinner id="contrib-spinner" ng-show="loading" icon="dots"></ion-spinner>' + 
            '</div>',

        link: function(scope, elem, attrs){

            var graph, where, url, width;

            where = '<contributions>:';
            width = 721 - $window.screen.width;
            scope.loading = true;
      
            if (scope.name){

                GitHub.getContribGraph(scope.name).then(function(svg){
                
                    graph = angular.element(svg);
                    elem.append(graph);
                    $ionicScrollDelegate.$getByHandle('graph').scrollTo(width, 0, true);
                    scope.loading = false;

            }, function(){ logger(where, err) } )

            } else {
                logger(where, 'attribute value missing');
            }
        }
    }
};

