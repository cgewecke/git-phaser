var c_debug;
angular.module('gitphaser')
  .directive("contact", Contact);

// @directive: <contact user='user'></add-contact>
// @params: user (the info object of a user account). 
//
// Displays the user's email address and provides a way to add user to the device contacts
// Opens modal on tap if the user is addable (i.e. does not exist in the Meteor DB list of 
// added contacts). Displays toast message if user already added. Email icon has green plus
// badge if user is addable
function Contact($cordovaContacts, $ionicModal, ionicToast, GitHub){
   return {
      restrict: 'E',   
      replace: true,
      require: 'ngModel',
      scope: {user: '='},
      template: 
         '<p ng-click="confirm()">' + 
            '<i class="ion-ios-email-outline"></i>' +
            '<span class="link"> {{user.email}} </span>' +
            '<i class="ion-plus-circled balanced" ng-show="!contactAdded"></i>' +
         '</p>',
     
      link: function(scope, elem, attrs, ngModel){

         var template =
            
            '<div class="contact-modal">' + 
               '<ion-modal-view class="row contact-popup">' +
                  '<div class="bold col align-center"> Add to contacts? </div>' +
                  '<div class="col align-center">' +
                     '<button class="button button-outline button-assertive thinner right-20"' +
                              'ng-click="modal.hide()">No</button>' +
                     '<button class="button button-outline button-balanced thinner"' +
                              'ng-click="createContact()">Yes</button>' +
                  '</div>' +
               '</ion-modal-view>' +
            '</div>';   

         var testing = true;

         // User addable?
         scope.contactAdded = hasContact(); 

         // Define Modal, turn bg opacity off on hide, destroy on destroy
         scope.modal = $ionicModal.fromTemplate(template, {scope: scope});
         
         scope.$on('$destroy', function() {
            scope.modal.remove();
         });

         scope.$on('modal.hidden', function() {
            ngModel.$setViewValue(false);
         });



         // ------------------------- PRIVATE -------------------------
         // @function: hasContact
         // @return: boolean
         // Determines if currentUser has already added this profile. 
         function hasContact(){
            
            var contacts;

            if (!Meteor.user()) 
               return false; 
            
            if (scope.user.login === GitHub.me.login && !testing) 
               return true;
            
            contacts = Meteor.user().profile.contacts;
            
            // Find
            for(var i = 0; i < contacts.length; i++){
               if (contacts[i] === scope.user.login) 
                  return true;
            }

            // Not found
            return false;
         }; 
 
         // ------------------------- PUBLIC -------------------------
         // @function: openModal
         // Opens modal asking if we should add this to user to device contacts if contact does 
         // not exist
         scope.confirm = function(){  
            var message = scope.user.name + ' is already added to your device contacts';

            if (scope.user.login === GitHub.me.login && !testing){
               return;
            } else if (scope.contactAdded) {
               ionicToast.show(message, middle, false, 1250);
            } else{
               ngModel.$setViewValue(true);
               scope.modal.show();
            }
         }
    		
         // @function: createContact
         // Adds profile to native contacts, calls meteor to push this contact id
         // onto the users list of added contacts
         scope.createContact = function(){
       
            var where = 'Contact:createContact';
            var contactInfo ={
               "displayName": scope.user.name,
               "emails": (scope.user.email) ? 
                  [{ "value": scope.user.email, 
                     "type": "business" }] : null,
               "organizations": (scope.user.positions) ?
                  [{"type": "Company", 
                    "name": scope.user.company
                  }] : null,
               "photos": [{"value": scope.user.avatarUrl}],
               "birthday": Date('5/5/1973')
            };
            
            $cordovaContacts.save(contactInfo).then(
               function(result){ 
                  
                  scope.contactAdded = true;
                  Meteor.call('addContact', scope.user.login); 
                  scope.modal.hide();

            }, function(error){ 

                  scope.modal.hide();
                  logger(where, error) 
            });

         }
      }
   };
};

/*
*/