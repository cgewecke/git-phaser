//utilities.js

// This will get overwritten by test/utilities if we are testing
// due to file load order in karma.config.js
// -------------------------------------------
var GLOBAL_TESTING = false;
// --------------------------------------------

function logger(where, message){
	
	if (Meteor) 		 Meteor.call('ping', 'client: ' + where + ' ' + message)
	if (!GLOBAL_TESTING) console.log(where + ': ' + message);
	
	return null;
};

var disp = JSON.stringify;

var secure = {
	mapbox: {
		token: 'pk.eyJ1IjoiZXBpbGVwb25lIiwiYSI6ImNpanRyY3IwMjA2cmp0YWtzdnFoenhkbjkifQ._Sg2cIhMaGfU6gpKMmrGBA',
		id: 'epilepone.2f443807'
	},
	github: {
		id: 'cc2cd9f335b94412c764',
		secret: '1f4838b6f17c07b6d91761930a2f484adc25762f',
		auth: 'a8f0df75a7ef0c647890d80f5c7ec4951d1909ef'
	},
	meteor: {
		password: "gb38ke",
		penelope: "6bja7"
	}
}