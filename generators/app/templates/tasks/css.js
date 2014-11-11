/**
 * Contains the css processing task
 *
 * Features:
 *  - Ignore underscore files (SCSS style)
 *  - Resolve relative URLs
 */

var gulp = require('gulp')

    , css = require('./config/config').css
    , preprocessor = require('gulp-' + css.pre.processor)
    , postprocessor = require('gulp-' + css.post.processor)
    , sourcemaps = require('gulp-sourcemaps')
    ;

gulp.task('css', [], function () {

    return gulp.src(css.src)
        .pipe(sourcemaps.init())
        .pipe(preprocessor(css.pre.options))
        .pipe(postprocessor(css.post.options))
        .pipe(sourcemaps.write('.', { sourceRoot: css.source.root }))
        .pipe(gulp.dest(css.destination.path))
        ;

});

