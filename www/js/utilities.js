//utilities.js

// This will get overwritten by test/utilities if we are testing
// due to file load order in karma.config.js
// -------------------------------------------
var GLOBAL_TESTING = false;
// --------------------------------------------

function logger(where, message){
	
	if (GLOBAL_TESTING) return;

	if (Meteor){
		Meteor.call('ping', 'client: ' + where + ' ' + message);
	};

	console.log(where + ': ' + message);
};