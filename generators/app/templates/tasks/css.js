/**
 * Contains the css processing task
 *
 * Features:
 *  - Ignore underscore files (SCSS style)
 *  - Resolve relative URLs
 */

var gulp = require('gulp')

    , styles = require('./config/config').styles
    , preprocessor = require('gulp-' + styles.preprocessor.name)
    , postprocessor = require('gulp-' + styles.postprocessor.name)
    , sourcemaps = require('gulp-sourcemaps')
    ;

gulp.task('styles', [], function () {

    return gulp.src(styles.src)
        .pipe(sourcemaps.init())
        .pipe(preprocessor(styles.preprocessor.options))
        .pipe(postprocessor(styles.postprocessor.options))
        .pipe(sourcemaps.write('.', { sourceRoot: styles.source.root }))
        .pipe(gulp.dest(styles.destination.path))
        ;

});

