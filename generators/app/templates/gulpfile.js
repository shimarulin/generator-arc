/**
 * Main gulp.js file contains the default task and watchers.
 * The remaining tasks are contained in the directory "tasks".
 */

var gulp = require('gulp')
    , requireDir = require('require-dir')
    , dir = requireDir('./tasks')
    , config = require('./tasks/config/config')
    , requireTasks = [
        'lib',
        'html',
        'styles'
    ]
    ;

gulp.task('default', requireTasks, function() {
    gulp.watch(config.html.watch, ['html']);
    gulp.watch(config.styles.watch, ['styles']);
    gulp.watch(config.scripts.watch, ['scripts']);
});


