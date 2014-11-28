'use strict';

var filter = require('gulp-filter'),
    minimatch = require('minimatch');

function Filters() {
    this.js = filter('**/*.js');
    this.css = filter('**/*.css');
    this.less = filter('**/*.less');
    this.scss = filter(['*.sass', '*.scss']);
    this.fonts = filter(function (file) {
        var conformity = false;
        if (minimatch(file.path, '**/*.{eot,ttf,woff}')) {
            conformity = true;
        }
        else if (minimatch(file.path, '**/*.svg') && file.contents.toString().indexOf("<glyph") !== -1) {
            conformity = true;
        }
        return conformity;
    });
    this.images = filter(function (file) {
        var conformity = false;
        if (minimatch(file.path, '**/*.{png,jpg,gif}')) {
            conformity = true;
        }
        else if (minimatch(file.path, '**/*.svg') && file.contents.toString().indexOf("<glyph") === -1) {
            conformity = true;
        }
        return conformity;
    });
}

module.exports = new Filters();