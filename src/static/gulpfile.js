var gulp = require('gulp');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var rev = require('gulp-rev');
var stageFile = 'temp';

// Copy all static images
gulp.task('images', [], function() {
    return gulp.src('./img/**/*.html')
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('../' + stageFile + '/img'));
});

gulp.task('copy', function () {
    gulp.src('./img/**')
        .pipe(gulp.dest('../' + stageFile + '/img'));
    return gulp.src('./partials/*.html')
        .pipe(gulp.dest('../' + stageFile + '/partials'));
});

gulp.task('usemin', ['images', 'copy'],function () {
    return gulp.src('./*.html')
        .pipe(usemin({
            outputRelativePath: '../',
            css: [minifyCss(), 'concat', rev()],
            // html: [minifyHtml({empty: true})],
            js: [uglify(), rev()]
        }))
        .pipe(gulp.dest('../'+ stageFile + '/'));
});
