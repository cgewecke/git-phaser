angular.module('linkedin')
  .directive("addContact", AddContact);

// @directive: <add-contact user='someUserProfile'></add-contact>
// @params: user (the profile object of the user to be added). 
//
// A footer bar on the profile template that allows user to add info from
// a discovered LinkedIn profile to be added to the native contacts. Also manages
// a list of contact ids associated with the user account.
function AddContact($cordovaContacts, $timeout, $auth){
    return {
       restrict: 'E',   
       replace: true,
       scope: {user: '='},
       template: 
        
        '<ion-footer-bar id="contact-bar" align-title="left" class="bar-energized directive-footer"' +
                        'ng-show="!contactAdded && !(user.id === currentUserId)">' +
          '<h1 class="title" >' +
            '<span ng-show="!flasher"> Add {{user.firstName}} to contacts</span>' +
            '<span class="profile-add-contact" ng-show="flasher">Added {{user.firstName}} </span>' +
          '</h1>' +
          '<div class="buttons">' +
            '<button id="contact-button" class="button button-clear button-light icon ion-ios-plus-outline" ng-click="createContact()"></button>' +
          '</div>' +
        '</ion-footer-bar>',

       link: function(scope, elem, attrs){

          scope.currentUserId = Meteor.user().username; // user.username === LinkedIn profile 'id'
          scope.contactAdded = hasContact(); // Boolean determines visibility of this directive
          scope.flasher = false; // DOM message flag

          // @function: hasContact
          // @return: boolean
          // Determines if currentUser has already added this profile. 
          function hasContact(){
            if (!Meteor.user()) return false;

            var contacts = Meteor.user().profile.contacts;
            for(var i = 0; i < contacts.length; i++){
                if (contacts[i] === scope.user.id){
                  return true;
                }
            }
            return false;
          }; 
    
       		// @function: createContact
          // Adds profile to native contacts, calls meteor to push this contact id
          // onto the users list of added contacts
          scope.createContact = function(){
            
            //MSLog('@NearbyProfileCtrl:createContact');

            var contactInfo ={
              "displayName": scope.user.name,
              "emails": (scope.user.emailAddress) ? 
                [{ "value": scope.user.emailAddress, 
                   "type": "business" }] : null,
              "organizations": (scope.user.positions) ?
                [{"type": "Company", 
                  "name": scope.user.positions.values[0].company.name,
                  "title": scope.user.positions.values[0].title 
                }] : null,
              "photos": [{"value": scope.user.pictureUrl}],
              "birthday": Date('5/5/1973')
            };
            
      
            scope.flasher = true;
            $cordovaContacts.save(contactInfo).then(function(result) {
              
                $timeout(function(){
                    
                    scope.exit = true;
                    scope.contactAdded = true;
                    Meteor.call('addContact', scope.user.id); 
                    
                }, 1000)

            }, function(error) {
                scope.flasher = false;
                MSLog('@NearbyProfileCtrl:createContact: failed: ' + error);
            });    
          }
        }
    };
 };