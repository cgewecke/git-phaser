angular
  	.module('mocks', [])
  	.service('Mock', function(){

  		var self = this;

	  	this.user = { 
	        _id: '123', 
	        username: 'nicole', 
	        email: 'nicole@gmail.com', 
	        profile: { 
	            id: '777', 
	            beaconName: 'x',
	            appId: 'y',
	            major: 0,
	            minor: 1,
	            notifications: [],
	            contacts: []
	        } 
	    };
	    
	    this.Meteor = {
	        user: function(){ return self.user;},
	        call: function(){ return; },
	        status: function(){ return {status: self.status};},
	        userId: function(){ return self.user._id}
	    }

	    this.$cordovaContacts = {
	    	save: function(){}
	    }

	    this.$reactive = function(context){
	        
	        context.attach = function(scope){
	            context.scope = scope;
	        };

	        context.helpers = function(helpers){
	            context.helperCollection = helpers;
	            context.autorun();
	        };

	        context.autorun = function(){
	            var keys = Object.keys(context.helperCollection);
	            angular.forEach(keys, function(key){
	                context[key] = (context.helperCollection[key])();
	            });
	        };

	        context.subscribe = function(collection){

	        };
	        return context;   
	    };
	});