/**
 * Contains the css processing task
 *
 * Features:
 *  - Ignore underscore files (SCSS style)
 *  - Resolve relative URLs
 */

var gulp = require('gulp')

    , styles = require('./config/config').styles
    , preprocessor = require(styles.preprocessor.module)
    , postprocessor = require(styles.postprocessor.module)
    , sourcemaps = require('gulp-sourcemaps')
    ;

gulp.task('styles', [], function () {

    return gulp.src(styles.source.files)
        .pipe(sourcemaps.init())
        .pipe(preprocessor(styles.preprocessor.options))
        .pipe(postprocessor(styles.postprocessor.options))
        .pipe(sourcemaps.write('.', { sourceRoot: styles.source.root.absolute }))
        .pipe(gulp.dest(styles.destination.path))
        ;

});

