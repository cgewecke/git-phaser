# git-phaser

[![Build Status](https://travis-ci.org/git-phaser/git-phaser.svg?branch=master)](https://travis-ci.org/git-phaser/git-phaser)

Gitphaser is an experiment in using phone-based beacons to create social networking tools based on physical proximity. It exploits iOS's ability transmit and receive BLE beacon signal to make the GitHub profiles of nearby Gitphaser users visible and create a record of who the app user has been near. Backend services like the association of unique beacon uuid signals with user accounts are provided by a cloud based Meteor server. Users only have to open the app and login once to be detectable. iOS allows apps to register to listen continuously for specific beacon signals and be woken up in the background when they're encountered. This means users can kill Gitphaser and still be visible to users who are actively using the app. Use cases for GitPhaser are social/professional gatherings MeetUps and conferences. This app is in pre-alpha user testing and some features like the ability to send other users a chat message are in active development.  

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

**WARNING** Tests will fail if the $rootscope.DEV is set in config/platform.js

## Launch Meteor
Make sure devices are connected to dev computer's wifi. In the server directory:

```
$ meteor run  --mobile-server 10.0.0.8:3000
```

## Build:

```
$ ionic build ios
```

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
1. Make sure www/lib/meteor-client-side/meteor-runtime-config.js is set to Production address
2. Make sure flags in config.platform are set to production values
3. Build project in ionic
4. In Xcode: General > Identity: Increment build or version number
5. In Xcode: Product > Archive etc . . . see Issue #36 for detailed discussion of how this was set up. 
6. To use the release build in development - go to Product > Scheme > Edit Scheme and change the run settings. (This is necessary to get push notifictions to work).
7. In iTunesConnect > Apps > TestFlight, select the new version to test. (These process for a while before they are available). 