Chats = new Mongo.Collection('chats');
Messages = new Mongo.Collection('messages');
AppInstance = new Mongo.Collection('appInstance');
Connections = new Mongo.Collection('connections');

Connections.after.insert(function (userId, doc) {

	var linkedParams = 
      [ 'id', 'num-connections', 'picture-url', 'first-name', 'last-name', 'headline',
        'location', 'industry', 'specialties', 'summary', 'email-address', 'positions' ];

    var receiver = Meteor.users.findOne({_id: doc.receiver});

    if (receiver){
    	
	    // This is bad. There is no guarantee this token will be any good
		// since it expires every 60 days and we don't know if the receiver
		// ever uses this app. Apply for search API? 
		var linkedin = Linkedin().init(receiver.profile.authToken);

		linkedin.people.me(linkedParams, Meteor.bindEnvironment(
		  function(err, $in){

		    // LinkIn call success: Add connection
		    if (!err || !$in.errorCode) {     
		      Connections.update({_id: doc._id}, {$set: {profile: $in }});
		      console.log("Connection success: " + $in.firstName + $in.lastName);
		      return 'success';

		    // LinkIn call failure: Bad token ?  
		    } else {
		      error = 'NEW CONNECTION ERROR: LinkedIn call failed';
		      console.log(error);
		      console.log($in.message);
		      return error
		    }

		  // Bind Environment error  
		  }, function(err){
		    error = 'NEW CONNECTION ERROR: Couldnt bind: ' + err;
		    console.log(error);
		    return error;
		  })
		);	
	} else {
		console.log('couldnt find receiver in connections after insert');
	}

});