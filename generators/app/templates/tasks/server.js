/**
 * Contains the server task
 */

var gulp = require('gulp')

    , srv = require('./config/config').server
    , webserver = require('gulp-webserver')
    ;

gulp.task('server', function() {
    gulp.src(srv.watch)
        .pipe(webserver(srv.options));
});
