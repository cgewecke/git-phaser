# git-phaser

[![Build Status](https://travis-ci.org/git-phaser/git-phaser.svg?branch=master)](https://travis-ci.org/git-phaser/git-phaser)

Gitphaser is an experiment in using phone-based beacons to create social networking tools based on physical proximity. It leverages iOS's ability to transmit and receive BLE beacon signal to make the public GitHub profiles of nearby users visible. Use cases for this kind of app are social events like Meetups and conferences. 

Users only have to login once to be detectable. From then on the app will (briefly) wake up in the background whenever its host device encounters BLE signal emitted by active git-phaser users (i.e. users who have foregrounded git-phaser and are looking for other people). This gives it enough time to contact a Meteor server and notify clients that a proximity contact was triggered. On iOS this 'wake-up' occurs even if the user has killed the app. 

**Git-phaser does not track by location or store location data about its clients** Detection of proximate users is acccomplished by providing each app instance with a unique beacon signature linked to a public Github profile. If users are near each other, they can see each other. Revoking beacon permissions in the device settings disables the app. 

**Git-phaser does not store any GitHub data on its servers apart from usernames.** Passwordless access to git-phaser is accomplished by generating a client side key when an account is created and storing it in the device keychain. Deleting this key will disable the app. All profile data is retrieved by the mobile client from Github itself on a session by session basis.    

## Documentation
[Docs for services, controllers and directives](https://git-phaser.github.io/git-phaser)

To build docs
```
$ gulp ngdocs
```

To view docs locally
```
$ gulp connect_ngdocs
```

## Tests: 
Individual tests are located in spec folders near their related js file e.g:

```
Controllers
| - specs
  | - controller_a.spec.js
  | - controller_b.spec.js
| - controller_a.js
| - controller_b.js
```

To run all:
```
$ gulp test
```
** Warning: ** Set all dev variables in platform.js to false or tests will fail. 
## Ionic Server
```
$ ionic serve
```

## Launch Meteor
Make sure devices are connected to dev computer's wifi. In the server directory:
```
$ meteor run  --mobile-server 10.0.0.8:3000
```

## Meteor Mongo interactive shell
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
```Product > Scheme > Edit``` should be debug
```Build Setting > Code Signing > Provisioning Profile```: should be IOS Team Provisioning Profile: com.ionicframework.git-phaser800962

## Deploy server 
1. In beacon-production/server: % mv .git ..
2. Trash server
3. Copy new server to beacon-production/ from beacon-testing/linkedin/server
4. % mv .git server

```
% git add -A
% git commit -a -m 'Server update & deploy: '
% git push heroku master
```

## Deploy to TestFlight
1. Make sure www/lib/meteor-client-side/meteor-runtime-config.js is set to Production address.
2. Make sure flags in config.platform AND server/config.push.json are set to production values.
3. Build project in ionic
4. In Xcode: General > Identity: Increment build or version number
5. In Xcode: Build Setting > Code Signing > Provisioning Profile: GitphaserProduction (All the other stuff should be 'distribution')
6. In Xcode: Product > Archive. Validate, then upload. [This issue has more.](https://github.com/cgewecke/beacon-testing/issues/36)
7. In iTunesConnect > Apps > TestFlight, select the new version to test. (These process for a while before they are available). 