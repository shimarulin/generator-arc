var gulp = require('gulp')

    , html = require('./config/config').html
    ;

gulp.task('html', [], function () {

    return gulp.src(html.source.files)
        .pipe(gulp.dest(html.destination.path))
        ;

});