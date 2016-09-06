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
     * Adds a notification to the receiver's notifications array, increments their notify count.
     * Push notifications are sent to the device if the transmitter is newly listed in the
     * notifications array. Otherwise the proximity contact is silently added. 
     * @param  {Object} info `{target: _id, notification: {}}
     */
    notify(info){
        var target, note, noteList, sendPush = true;

        target = Meteor.users.findOne({_id: info.target});
        
        if (target){
            noteList = target.profile.notifications;
        
            // Remove duplicate notifications and don't ping user.
            for (var i = 0; i < noteList.length; i++){
                if (info.notification.sender === noteList[i].sender){
                    noteList.splice(i, 1);
                    sendPush = false;
                }
            }
    
            // Update collection/client with new notification. At a minimum
            // the date will be newer and result in higher sort order filtering
            // on the client
            noteList.push(info.notification);
            Meteor.users.update({_id: info.target},{
                $set: {'profile.notifications': noteList} 
            });
    
            // Send push notification, update client badges.
            if(target.profile.pushToken && sendPush){
                Meteor.users.update({_id: info.target},{
                    $inc: {'profile.notifyCount': 1 }
                });
                note = { 
                    from: 'push', 
                    text: info.notification.name + 'is nearby.', 
                    sound: 'ping.aiff'
                };
                Push.sendAPN(target.profile.pushToken, note);
            }
        }
    },

    /**
     * Resets clients notifyCount to zero (for updating client side badges etc. . .)
     * notifyCount is the number of unchecked notifications.
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
     * Upserts a proximity connection. Clients subscribe to the subset of
     * records where they are the transmitter and someone else received the signal. 
     * Receivers get a notification that they have been transmitted to. If the transmitter 
     * already exists in their notification history, the old record is deleted and the new
     * contact pushed onto the notification stack with fresh date data.
     * @param  {Object} msg {transmitter: uuid, receiver: uuid, proximity: string, notification: {object}}
     */
    newConnection(msg){
        
        check(msg, {
            transmitter: String,
            receiver: String,
            proximity: String
        })

        var receiver = Accounts.findUserByEmail(msg.receiver),
            transmitter = Accounts.findUserByEmail(msg.transmitter);

        if (transmitter && receiver){

            Connections.upsert(
                {$and: [{transmitter: transmitter._id}, {receiver: receiver._id}]}, 
                {$set: { 
                    transmitter: transmitter._id, 
                    receiver: receiver._id,
                    transUUID: transmitter.profile.appId,
                    proximity: msg.proximity,
                    receiver_name: receiver.username,
                    created_at: new Date() }
                }
            );
            return transmitter.username;
    
        } else {
            console.log("Beacons ids are bad: " + JSON.stringify(msg));
            return null;
        }
    },
    
    /**
     * Removes a matching items from connections. Called by the receiving client's onExit method in 
     * the Beacons service
     * @param  {Object} beaconIds {transmitter: email, receiver: _id }
     */
    disconnect(beaconIds){

        var receiver, 
            transmitter;

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
        
        } else return undefined;
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