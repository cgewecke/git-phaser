var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var karma = require('karma').server;
var gulpDocs = require('gulp-ngdocs');
var connect = require('gulp-connect');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('ngdocs', [], function () {

  var options = {
    scripts: [
      "lib/ionic/js/ionic.bundle.js",
      "lib/moment/moment.js",
      "lib/meteor-client-side/meteor-runtime-config.js",
      "lib/meteor-client-side/dist/meteor-client-side.bundle.js",
      "lib/accounts-base-client-side/dist/accounts-base-client-side.bundle.js",
      "lib/accounts-password-client-side/dist/accounts-password-client-side.bundle.min.js",
      "lib/angular-meteor/dist/angular-meteor.bundle.js",
      "lib/angular-meteor/dist/angular-meteor-auth.bundle.js",
      "lib/github/github.js",
      "lib/angular-github-adapter/angular-github-adapter.js",
      "lib/ngCordova/dist/ng-cordova.js",
      "lib/ng-cordova-oauth/dist/ng-cordova-oauth.js",
      "lib/ionic-toast/dist/ionic-toast.bundle.min.js",
      "lib/leaflet/leaflet.js",
      "lib/leaflet-pulse-icon/src/L.Icon.Pulse.js"
    ]
  };
  return gulp.src('www/js/{,*/}*.js')
    .pipe(gulpDocs.process(options))
    .pipe(gulp.dest('./docs'));
});

gulp.task('connect_ngdocs', function() {
var connect = require('gulp-connect');
  connect.server({
    root: 'docs',
    livereload: false,
    fallback: 'docs/index.html',
    port: 8083
  });
});

gulp.task('test', function(done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: false,
        autoWatch: true
    }, function() {
        done();
    });
});
