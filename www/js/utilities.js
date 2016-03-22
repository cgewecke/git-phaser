//utilities.js

function logger(where, message){
	if (GLOBAL_TESTING) return;
	if (Meteor){
		Meteor.call('ping', 'client: ' + where + ' ' + message);
	};

	console.log(where + ': ' + message);
};