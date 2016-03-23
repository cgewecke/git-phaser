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

var secure = {
	mapbox: {
		token: 'pk.eyJ1IjoiZXBpbGVwb25lIiwiYSI6ImNpanRyY3IwMjA2cmp0YWtzdnFoenhkbjkifQ._Sg2cIhMaGfU6gpKMmrGBA',
		id: 'epilepone.2f443807'
	},
	github: {
		id: 'cc2cd9f335b94412c764',
		secret: '1f4838b6f17c07b6d91761930a2f484adc25762f',
		auth: '4b6e119a5365ffdbe93f523a6a98bc8c2adf278f'
	}
}