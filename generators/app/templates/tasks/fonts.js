/**
 * Contains the fonts processing task
 */

var gulp = require('gulp')

    , fonts = require('./config/config').fonts
    , filters = require('./config/filters')
    , flatten = require('gulp-flatten')
    ;

gulp.task('fonts.files', [], function () {

    return gulp.src(fonts.source.files)
        .pipe(filters.fonts)
        .pipe(flatten())
        .pipe(gulp.dest(fonts.destination.path))
        ;

});

