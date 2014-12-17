var gulp = require('gulp')

    , markup = require('./config/config').markup
    ;

gulp.task('markup', [], function () {

    return gulp.src(markup.source.files)
        .pipe(gulp.dest(markup.destination.path))
        ;

});
