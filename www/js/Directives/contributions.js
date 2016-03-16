var cb_debug;

angular.module('gitphaser')
  .directive("contributions", Contributions);

// @directive: <contributions name='github.me.login'></contributions>
// @params: name (the value of the login key in the github user object). 
//
// The github contributions graph scraped from the svg resource. This has to be obtained
// by server proxy. The directive shows a spinner until the svg is received. SVG is embedded
// in a lateral scroll container that gets moved right-wards the maximum amount on load. 
function Contributions($http, $window, $reactive, $ionicScrollDelegate){
    return {
        restrict: 'E',   
        replace: true,
        scope: {name: '='},
        template:

       		'<div class="center grey">' +
       			'<ion-spinner ng-show="loading" icon="dots"></ion-spinner>' + 
       		'</div>',

       link: function(scope, elem, attrs){
       		$reactive(this).attach(scope);

       		var graph, where, url, width;

       		where = 'Contributions:';
      		url = "https://github.com/users/" + scope.name + "/contributions";
      		width = 721 - $window.screen.width;

      		scope.loading = true;
      
       		if (scope.name){

       			this.call('getContributions', url, function(err, response){

       				if (err){
       					logger(where, err);
       				} else {
       					graph = angular.element(response);
       					elem.append(graph);
       					$ionicScrollDelegate.$getByHandle('graph').scrollTo(width, 0, true);
       					scope.loading = false;
       				}
       			});

       		} else {
       			logger(where, 'attribute value missing');
       		}

       }
    }
};

