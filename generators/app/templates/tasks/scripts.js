/**
 * Contains the script compile task
 *
 */

var gulp = require('gulp')

    , scripts = require('./config/config').scripts
    , concat = require('gulp-concat')
    , sourcemaps = require('gulp-sourcemaps')
    , order = require("gulp-order")
    , flatten = require("gulp-flatten")
    ;

gulp.task('script', function () {
    return gulp.src(scripts.source.files)
        .pipe(flatten())
        .pipe(order([
            "!**/*-+(controller|service|directive|filter).js",
            "**/*-controller.js",
            "**/*-service.js",
            "**/*-directive.js",
            "**/*-filter.js"
        ]))
        .pipe(sourcemaps.init())
        .pipe(concat(scripts.destination.name))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(scripts.destination.path))
        ;
});