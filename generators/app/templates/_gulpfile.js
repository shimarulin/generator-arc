/**
 * Main gulp.js file contains the default task and watchers.
 * The remaining tasks are contained in the directory "tasks".
 */

var gulp = require('gulp')
    , requireDir = require('require-dir')
    , dir = requireDir('./tasks')
    , config = require('./tasks/modules/config')
    , requireTask = [
        'lib',
        'html',
        'css',
        'script',
        'server'
    ]
    ;

gulp.task('default', requireTask, function() {
    gulp.watch(config.css.watch, ['css']);
    gulp.watch('src/**/*.js', ['script']);
});


