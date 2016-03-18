var cb_debug;

angular.module('gitphaser')
  .directive("contributions", Contributions);

// @directive: <contributions name='github.me.login'></contributions>
// @params: name (the value of the login key in the github user object). 
//
// The github contributions graph scraped from the svg resource. This has to be obtained
// by server proxy. The directive shows a spinner until the svg is received. SVG is embedded
// in a lateral scroll container that gets moved right-wards the maximum amount on load. 
function Contributions($http, $window, $ionicScrollDelegate, GitHub){
    return {
        restrict: 'E',   
        replace: true,
        scope: {name: '='},
        template:

       		'<div class="center grey">' +
       			'<ion-spinner ng-show="loading" icon="dots"></ion-spinner>' + 
       		'</div>',

        link: function(scope, elem, attrs){

       		var graph, where, url, width;

       		where = '<contributions>:';
      		width = 721 - $window.screen.width;
      		scope.loading = true;
      
       		if (scope.name){

       			GitHub.getContribGraph(scope.name).then(function(svg){
                
                console.log('in get contrib callback')
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

