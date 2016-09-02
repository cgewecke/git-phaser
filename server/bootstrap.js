if (Meteor.isServer) {

    Meteor.startup(function () {
        console.log('running startup');

        // Push Notifications Debug
        Push.debug = true;
        
        // Set up counter
        if (AppInstance.find().count() === 0){
            AppInstance.insert({major: 1, minor: 1});
        }
        
        //Connections.remove({});

    });
}