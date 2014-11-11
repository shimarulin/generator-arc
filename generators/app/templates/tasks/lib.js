
var gulp = require('gulp')

    , config = require('./config/config')
    , css = config.css
    , fonts = config.fonts
    , filters = config.filters

    , concat = require('gulp-concat')
    , flatten = require('gulp-flatten')
    , order = require("gulp-order")
    , replace = require('gulp-replace')
    , sourcemaps = require('gulp-sourcemaps')
    , libs = require('main-bower-files')
    ;


gulp.task('lib.font', function () {
    return gulp.src(libs())
        .pipe(filters.fonts)
        .pipe(flatten())
        .pipe(gulp.dest(fonts.destination.path))
});


gulp.task('lib.css', [], function () {

    return gulp.src(libs())
        .pipe(filters.css)
        .pipe(sourcemaps.init())
        .pipe(concat("lib.css"))
        .pipe(replace(/([^:\/\s]+)((\/\w+)*\/)([\w\-\.\?\#]+)(['"]\))/gm, '$1/'+fonts.destination.path+'$4$5'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(css.destination.path))

});