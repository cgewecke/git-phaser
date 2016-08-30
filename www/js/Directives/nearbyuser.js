angular.module('gitphaser').directive("nearbyUser", nearbyUser);

/**
 * @ngdoc directive
 * @name  gitphaser.directive:nearbyUser
 * @module  gitphaser
 *
 * @description 
 * `<nearby-user>` Template to represent a proximity detected github user in a list view on
 *     the nearbyUser route. Obtains account from GitHub service (it may be cached).
 */
function nearbyUser(GitHub){
    return {
        restrict: 'E',   
        replace: true,
        template: 
        
            '<ion-item class="item-chat item-avatar item-icon-right" type="item-text-wrap"' +
                       'href="#/others/{{user.info.login}}"' +
                       'ng-show="user">' +
                '<img ng-src="{{user.info.avatar_url}}">' +
                '<h2>{{user.info.name}}</h2>' +
                '<p>{{user.info.login}}</p>' +
                '<span class="last-message-timestamp">{{proximity | proximityFilter }}</span>' +
                '<i class="icon ion-chevron-right icon-accessory"></i>' +
            '</ion-item>', 

        link: function(scope, elem, attrs){
            
            var where = "<nearby-user>: ";            
            scope.model = scope.$eval(attrs.model);
            scope.user = null;

            // Initialize
            if (scope.model && scope.model.receiver_name ){

                scope.proximity = scope.model.proximity;
                GitHub.getAccount(scope.model.receiver_name).then( 
                    function(account){ scope.user = account },
                    function(error){ logger(where, error) }
                );
            } else {
                logger(where, 'no model value');
            } 
        
            // Update Proximity
            scope.$watch('model.proximity', function(newVal, oldVal){
                if (newVal)
                    scope.proximity = newVal;
            });     
        }
    }
}
