# git-phaser

[![Build Status](https://travis-ci.org/git-phaser/git-phaser.svg?branch=master)](https://travis-ci.org/git-phaser/git-phaser)

**git-phaser** is a proximity-triggered social networking app. It leverages iOS's ability to transmit and receive BLE beacon signal to make the public GitHub profiles of nearby users visible. Use cases for this kind of app include Meetups and conferences. 

Users only have to login once to be detectable. From then on the app will (briefly) wake up in the background whenever its host device encounters BLE signal emitted by active git-phaser users (i.e. users who have foregrounded git-phaser and are looking for other people). This gives it enough time to contact a Meteor server and notify clients that a proximity contact was triggered. On iOS this 'wake-up' occurs even if the user has killed the app. 

**Git-phaser does not track by location or store location data about its clients** Detection of proximate users is acccomplished by providing each app instance with a unique beacon signature linked to a public Github profile. If users are near each other, they can see each other. Revoking beacon permissions in the device settings disables the app. 

**Git-phaser does not store any GitHub data on its servers apart from usernames.** Passwordless access to git-phaser is accomplished by generating a client side key when an account is created and storing it in the device keychain. Deleting this key will disable the app. All profile data is retrieved by the mobile client from Github itself on a session by session basis.    

## iOS Simulator

The iOS Simulator doesn't have beacon functionality and is useful primarily as a way of verifying that Github login
works / exploring the UI. There are some buttons to mock user connections in the apps setting tab, so it's possible to see what connections look like.  

## Launch Meteor
Make sure devices are connected to dev computer's wifi. 

This branch is configured to connect the app to a live server on Heroku and should work without deploying anything. However, if you'd prefer to use a local server, find your IP address by looking at your Mac's `Server Preferences / Network` options. In the server directory run:

```
$ meteor run  --mobile-server <ip address>:3000
```

**Then** go to the [meteor runtime config file](https://github.com/git-phaser/git-phaser/blob/dev/www/lib/meteor-client-side/meteor-runtime-config.js) and set the app to point at your local server. (There are additional instructions in that file if this isn't clear).

## Meteor Mongo interactive shell

This is useful if you need to delete yourself from the server DB for some reason. Ex: the app crashed and now complains that your password is bad / advises you to contact `gitphaser.com`.

In the server directory:
```
$ meteor mongo                                      // Launch
$ db.users.find()                                   // List users
$ db.users.remove({"_id":"7YYNWfkX9tWjuw8k6"});     // Remove user
```

## Build:

```
$ ionic build ios
```

## XCode Development Settings

You should be able to deploy to a device by setting code signing to `automatic`. 
