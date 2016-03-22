// Karma configuration
// Generated on Tue Jan 19 2016 15:22:45 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'], 


    // list of files / patterns to load in the browser
    files: [

        // Add JQuery so that 'find' etc works correctly
        'node_modules/jquery/dist/jquery.min.js',

        // Lib 
        'www/lib/ionic/js/ionic.bundle.js',
        'www/lib/angular-mocks/angular-mocks.js',
        'www/lib/moment/moment.js',
        'www/lib/meteor-client-side/meteor-runtime-config.js',
        'www/lib/meteor-client-side/dist/meteor-client-side.bundle.min.js',
        'www/lib/accounts-base-client-side/dist/accounts-base-client-side.bundle.js',
        'www/lib/accounts-password-client-side/dist/accounts-password-client-side.bundle.min.js',
        'www/lib/angular-meteor/dist/angular-meteor.bundle.js',
        'www/lib/angular-meteor/dist/angular-meteor-auth.bundle.js',
        'www/lib/ngCordova/dist/ng-cordova.js',
        'www/lib/ng-cordova-oauth/dist/ng-cordova-oauth.min.js',
        'www/lib/ionic-toast/dist/ionic-toast.bundle.min.js',
        'www/lib/leaflet/leaflet.js',
        'www/lib/leaflet-pulse-icon/src/L.Icon.Pulse.js',
        'www/lib/github/github.js',
        'www/lib/angular-github-adapter/angular-github-adapter.js',
        
        // Misc app
        'www/js/*.js',
        'www/js/mongo/*.js',
        'www/js/filters/*.js',

        // Core w/specs: If services are not first, there is a cascade of
        // failures. Weird
        'www/js/config/*.js',
        'www/js/services/*.js',
        'www/js/controllers/*.js',
        'www/js/directives/*.js',        

        // Templates
        'www/templates/*.html',

        // Test utilities & mocks
        'tests/mocks/*.js',
        'tests/util/*.js',

        'www/js/config/specs/*.js',
        'www/js/services/specs/*.js',
        'www/js/controllers/specs/*.js',
        'www/js/directives/specs/*.js'

    ],

    // list of files to exclude
    exclude: [
        //'www/js/directives/specs/beaconmap.spec.js',
        //'www/js/controllers/specs/profile.spec.js',
    ],

    browsers: [
      'Chrome'
    ],

    customLaunchers: {
      Chrome_without_security: {
        base: 'Chrome',
        flags: ['--disable-web-security']
      }
    },

    // Which plugins to enable
    plugins: [
      "karma-chrome-launcher",
      "karma-jasmine",
      "karma-mocha-reporter",
      "karma-ng-html2js-preprocessor"
    ],

    preprocessors: {
      'www/templates/*.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      moduleName: 'templates',
      stripPrefix: 'www/'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DISABLE,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    restartOnFileChange: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
