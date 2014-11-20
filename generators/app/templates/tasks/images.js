var gulp = require('gulp')

    , flatten = require("gulp-flatten")
    , config = require('./config/config')
    , images = config.images
    , filters = config.filters
    ;

gulp.task('images', [], function () {

    return gulp.src(images.source.files)
        .pipe(flatten())
        .pipe(gulp.dest(images.destination.path))
        ;

});