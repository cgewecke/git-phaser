# git-phaser
-------------

A Github-based proximity app for iOS that lets you browse the profiles and repos of people near you. Written in Ionic with a Meteor back end, using iBeacons for proximity detection.

## Tests: 
----------
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

## Launch Meteor
----------------

Make sure devices are connected to dev computer's wifi. In the server directory:

```
$ meteor run  --mobile-server 10.0.0.8:3000
```

## Build:
----------

```
$ ionic build ios
```

## Deploy server to Heroku 
--------------------------

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
-----------------------

1. Make sure www/lib/meteor-client-side/meteor-runtime-config.js is set to Production address
2. Make sure flags in config.platform are set to production values
3. Build project in ionic
4. In Xcode: General > Identity: Increment build or version number
5. In Xcode: Product > Archive etc . . . see Issue #36 for detailed discussion of how this was set up. 
6. To use the release build in development - go to Product > Scheme > Edit Scheme and change the run settings. (This is necessary to get push notifictions to work).
7. In iTunesConnect > Apps > TestFlight, select the new version to test. (These process for a while before they are available). 