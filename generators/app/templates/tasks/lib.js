
var gulp = require('gulp')

    , config = require('./config/config')
    , styles = config.styles
    , fonts = config.fonts
    , filters = config.filters
    , scripts = config.scripts

    , concat = require('gulp-concat')
    , flatten = require('gulp-flatten')
    , order = require("gulp-order")
    , replace = require('gulp-replace')
    , sourcemaps = require('gulp-sourcemaps')
    , libs = require('main-bower-files')
    ;


gulp.task('lib.fonts', function () {
    return gulp.src(libs())
        .pipe(filters.fonts)
        .pipe(flatten())
        .pipe(gulp.dest(fonts.destination.path))
});


gulp.task('lib.styles', [], function () {

    return gulp.src(libs())
        .pipe(filters.css)
        .pipe(sourcemaps.init())
        .pipe(concat(styles.destination.lib.name))
        // Replace relative font url
        .pipe(replace(/(url\(['"]?)([^:\/\s]+)((\/\w+)*\/)?([\w\-\.]+)([\?][\#]?[\w\=\&\.]+)?(['"]?\)+)/gm,
            function(str, $1, $2, $3, $4, $5, $6, $7){
                var replace = '';
                if ($3 === undefined && $4 === undefined && $6 === undefined) {
                    replace = $1 + '../' + fonts.path + $2 + $5 + $7
                }
                else if (typeof $3 == 'string' && typeof $4 == 'string' && $6 === undefined) {
                    replace = $1 + '../' + fonts.path + $5 + $7
                }
                else if (typeof $3 == 'string' && typeof $4 == 'string' && typeof $6 === 'string') {
                    replace = $1 + '../' + fonts.path + $5 + $6 + $7
                }
                return replace
            }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(styles.destination.path))

});

gulp.task('lib.scripts', function () {
    return gulp.src(libs())
        .pipe(filters.js)
        .pipe(order([
            "**/*angular*",
            "**/*jquery*",
            "**/*"
        ]))
        .pipe(sourcemaps.init())
        .pipe(concat(scripts.destination.lib.name))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(scripts.destination.path))
});

gulp.task('lib', ['lib.fonts', 'lib.styles', 'lib.scripts']);