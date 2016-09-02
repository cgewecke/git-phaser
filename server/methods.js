Meteor.methods({

    //-------------------------------- Git Contributions -------------------------------------
    /**
     * Synchronous call to GitHub to get users contributions chart
     * @param  {String} url The address of the svg chart to scrape)
     * @return {String}     HTML svg string OR error
     */
    getContributions(url){
        
        var response;
        try  {
            response = HTTP.get(url);
            return response.content;
        } catch(error){
            return error
        }       
    },
    //----------------------------------- Notifications ---------------------------------------
    /**
     * Adds a notification to the receiver's notifications array, increments their notify count
     * @param  {Object} info `{taget: _id, notification: {}}
     */
    notify(info){
        console.log('in notify');

        var target, note;

        // Device Notify
        Meteor.users.update({_id: info.target},{
            $inc: {'profile.notifyCount': 1 },
            $push: {'profile.notifications': info.notification} 
        });

        // Push Notify  
        target = Meteor.users.findOne({_id: info.target});
        
        if (target && target.profile.pushToken){
            console.log("Token:" + target.profile.pushToken);
            
            note = { 
                from: 'push', 
                text: info.notification.name + ' checked your profile.', 
                sound: 'ping.aiff'
            };
            
            Push.sendAPN(target.profile.pushToken, note);
        }
    },

    /**
     * Resets clients notifyCount to zero (for updating client side badges etc. . .)
     * @method  resetNotifyCounter
     */
    resetNotifyCounter(){
        Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.notifyCount': 0}});
    },

    //----------------------------------- Contacts ---------------------------------------
    /**
     * Adds specified id to an array representing contacts added by this user;
     * @method  addContact
     * @param {String} id Meteor user id
     */
    addContact(id){
        check(id, String);
        Meteor.users.update({_id: Meteor.userId()}, {$push: {'profile.contacts': id}});
    },

    //----------------------------------- Connections ------------------------------------    
    /**
     * Upserts a transmitter/receiver record into Connections. Clients subscribe to the subset of
     * records in which they are the transmitter and someone else received the signal. That list
     * of receivers is reflected in the 'Nearby' view of the app. Receivers get a notification
     * that they have been transmitted to. If the transmitter already exists in their notification
     * history, the old record is deleted an placed at the front of the notification list with 
     * fresh date data.
     * @param  {Object} beaconIds {transmitter: email, receiver: email}
     */
    newConnection(beaconIds){
        
        check(beaconIds, {
            transmitter: String,
            receiver: String,
            proximity: String
        })

        var receiver = Accounts.findUserByEmail(beaconIds.receiver);
        var transmitter = Accounts.findUserByEmail(beaconIds.transmitter);

        if (transmitter && receiver){

            Connections.upsert(
                {$and: [{transmitter: transmitter._id}, {receiver: receiver._id}]}, 
                {$set: { 
                    transmitter: transmitter._id, 
                    receiver: receiver._id,
                    transUUID: transmitter.profile.appId,
                    proximity: beaconIds.proximity,
                    receiver_name: receiver.username,
                    created_at: new Date() }
                }
            );
    
        } else {
            console.log("Beacons ids are bad: " + JSON.stringify(beaconIds));
            return;
        }
    },
    
    /**
     * Removes a matching items from connections. Called by the receiving client's onExit method in 
     * the Beacons service
     * @param  {Object} beaconIds {transmitter: email, receiver: _id }
     */
    disconnect(beaconIds){

        var receiver, transmitter;

        check( beaconIds, {
            transmitter: String,
            receiver: String
        });

        console.log('Disconnecting: ' + JSON.stringify(beaconIds));
        receiver = Accounts.findUserByEmail(beaconIds.receiver);
        transmitter = beaconIds.transmitter;

        if (transmitter && receiver){
            Connections.remove({$and: 
                [
                    {transUUID: transmitter}, 
                    {receiver: receiver._id}
                
                ]}, function(err){
                    console.log('Removal error: ' + JSON.stringify(err))     
                });
            console.log('Successful removal');
            return 'Success';
        } else {
            return 'Discovery Failure';
        }   
    },

    // ---------------- Authentication Utilities -------------------------
    /**
     * Checks to see if user has already created a meteor account, on login.
     * @param  {String}  name Github username
     * @return {Boolean} 
     */
    hasRegistered(name){
        check(name, String);
        var user = Meteor.users.find({username: name});
        return (user.count()) 
            ? true
            : false;
    },

    /**
     * Generates a unique major/minor combination and updates a master counter. These
     * numbers are combined with a beacon uuid to make identification of unique users
     * by beacon signal possible.
     * @return {Object} {major: Number, minor: Number}
     */
    getUniqueAppId(){
        
        var instance = AppInstance.findOne();
        if (instance){
            
            var major = instance.major;
            var minor = instance.minor;

            if (minor < 65000){
                minor = minor + 1;
            } else {
                major = major + 1;
                minor = 1;
            }

            AppInstance.update(instance._id, {major: major, minor: minor}); 
            return {major: major, minor: minor};
        
        } else {
            return undefined;
        }
        
    },

    //---------------- Logging/Debugging -------------------------
    ping(message){
        var user = Meteor.user();
        (user) ?
            console.log(user.username + ': ' + message) :
            console.log(message);
    }, 

    pushTest(){
        Push.sendAPN("79b229d8a40309c5498c75fba2b2c16a5cf6065be976c89e3c0f25ec2870633a", 
            {from: 'push',title: 'Congratulations',text: 'You can now Push to this device!'});
    }
});