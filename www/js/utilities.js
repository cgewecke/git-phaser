//utilities.js

function MSLog(message){
	
	if (GLOBAL_TESTING) return;

	if (Meteor){
		Meteor.call('ping', 'client: ' + message);
	};
	console.log(message);
};