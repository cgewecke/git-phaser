angular.module('gitphaser')
  .directive("nearbyUser", nearbyUser);

// @directive: <nearby-user model='connection'></nearby-user>
// @params: model (the meteor connection object). 
//
// Obtains account from GitHub service (it may be cached) to populate template
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
            var model = scope.$eval(attrs.model);
            scope.user = null;

            if (model && model.receiver_name ){

                scope.proximity = model.proximity;
                
                GitHub.getAccount(model.receiver_name).then( 
                    
                    function(account){ scope.user = account },
                    function(error){ logger(where, error) }
                );
            } else {
                logger(where, 'no model value');
            }

        }
    }
}
