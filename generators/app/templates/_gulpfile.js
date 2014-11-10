/**
 * Main gulp.js file contains the default task and watchers.
 * The remaining tasks are contained in the directory "tasks".
 */

var gulp = require('gulp')
    , requireDir = require('require-dir')
    , dir = requireDir('./tasks')
    , config = require('./tasks/config/config')
    , requireTasks = [
        'lib'
    ]
    ;

gulp.task('default', requireTasks, function() {
    gulp.watch(config.css.watch, ['css']);
});


