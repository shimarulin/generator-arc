'use strict';
var filter = require('gulp-filter')
    , minimatch = require('minimatch')
    , main = {
        application: {root: 'app/'},
        source: {root: 'src/'}
    }
    , css = {
        source: {files: {
            less: ['*.less'],
            sass: ['*.sass', '*.scss']
        }},
        pre: {processor: '<%= properties.preprocessor %>'},
        destination: {
            path: 'css/',
            lib: {name: 'lib.css'}
        }
    }
    , fonts = {
        destination: {path: "fonts/"}
    }
    , filters = {
        js: filter('**/*.js'),
        css: filter('**/*.css'),
        less: filter('**/*.less'),
        scss: filter('**/*.scss'),
        fonts: filter(function (file) {
            var conformity = false;
            if (minimatch(file.path, '**/*.{eot,ttf,woff}')) {
                conformity = true;
            }
            else if (minimatch(file.path, '**/*.svg') && file.contents.toString().indexOf("<glyph") !== -1) {
                conformity = true;
            }
            return conformity;
        }),
        images: filter(function (file) {
            var conformity = false;
            if (minimatch(file.path, '**/*.{png,jpg,gif}')) {
                conformity = true;
            }
            else if (minimatch(file.path, '**/*.svg') && file.contents.toString().indexOf("<glyph") === -1) {
                conformity = true;
            }
            return conformity;
        })
    }
;

function Config() {
    this.css = css;
    css.destination.path = main.application.root + css.destination.path;
    css.watch = css.source.files[css.pre.processor].map(function(file){
        return main.source.root + '**/' + file;
    });

    this.fonts = fonts;
    fonts.path = fonts.destination.path;
    fonts.destination.path = main.application.root + fonts.destination.path;

    this.filters = filters;
}

module.exports = new Config();