var gulp = require('gulp');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var rev = require('gulp-rev');
var swig = require('gulp-swig');
var del = require('del');
var runSequence = require('run-sequence');
var stageFile = 'temp';

// Copy all static images
gulp.task('images', [], function() {
    return gulp.src('./img/**/*.html')
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('./img'));
        // .pipe(gulp.dest('../' + stageFile + '/img'));
});

gulp.task('copy', function () {
    gulp.src('./img/**')
        .pipe(gulp.dest('./img'));
        // .pipe(gulp.dest('../' + stageFile + '/img'));
    return gulp.src('./partials/*.html')
        .pipe(gulp.dest('./partials'));
        // .pipe(gulp.dest('../' + stageFile + '/partials'));
});

gulp.task('usemin', [],function () {
    return gulp.src('./**/*.swig')
        .pipe(usemin({
            outputRelativePath: '../',
            // css: [minifyCss(), 'concat', rev()],
            // html: [minifyHtml({empty: true})],
            js: [uglify(), rev()]
        }))
        //.pipe(gulp.dest('./'));
        .pipe(gulp.dest('../'+ stageFile + '/'));
});

gulp.task('copy:swig:share', function() {
    return gulp.src('../' + stageFile + '/share/_*.swig')
        .pipe(gulp.dest('../django/templates/share/'));
});

gulp.task('clean:temp', function (cb) {
  del(['../' + stageFile], {force: 1}, cb);
});

gulp.task('clean:js', function(cb) {
    del(['js/mappingbird-*.js'],cb);
});

gulp.task('copy:js', function() {
    return gulp.src('../' + stageFile + '/js/*.js')
        .pipe(gulp.dest('js/'));
});

gulp.task('build', function () {
  runSequence('clean:temp', 'clean:js', 'usemin', 'copy:swig:share', 'copy:js');
});
