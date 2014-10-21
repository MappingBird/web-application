var gulp = require('gulp');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var rev = require('gulp-rev');
var swig = require('gulp-swig');
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

gulp.task('swig', function() {
    gulp.src('./*.swig')
        .pipe(swig())
        .pipe(gulp.dest('./'))
    gulp.src('./partials/*.swig')
        .pipe(swig())
        .pipe(gulp.dest('./partials/'));
});

gulp.task('usemin', ['swig', 'images', 'copy'],function () {
    return gulp.src('./*.html')
        .pipe(usemin({
            outputRelativePath: '../',
            // css: [minifyCss(), 'concat', rev()],
            // html: [minifyHtml({empty: true})],
            js: [uglify(), rev()]
        }))
        .pipe(gulp.dest('./'));
        //.pipe(gulp.dest('../'+ stageFile + '/'));
});
