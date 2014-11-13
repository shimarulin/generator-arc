'use strict';
var filter = require('gulp-filter')
    , minimatch = require('minimatch')
    , main = {
        application: {root: 'app/'},
        source: {root: 'src/'}
    }
    , css = {
        source: {
            files: "<%= JSON.stringify(tpl.preprocessor.files) %>",
            config: {
                underscore: false,
                recursive: true
            }
        },
        preprocessor: {
            name: '"<%= properties.preprocessor %>"',
            options: "<%= JSON.stringify(tpl.preprocessor.options) %>"
        },
        postprocessor: {
            name: "pleeease",
            options: {
                minifier: false,
                autoprefixer: {
                    browsers: [
                        "Explorer >= 9",
                        "last 4 versions"
                    ]
                }
            }
        },
        destination: {
            path: 'css/',
            lib: {name: 'lib.css'}
        }
    }
    , filters = {
        js: filter('**/*.js'),
        css: filter('**/*.css'),
        less: filter('**/*.less'),
        scss: filter(['*.sass', '*.scss']),
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
    , fonts = {
        destination: {path: "fonts/"}
    }
    , scripts = {
        destination: {
            path: 'js/',
            lib: {name: 'lib.js'}
        }
    }
    , server = {
        "root": "",
        "options": {
            "host": "localhost",
            "port": 8000,
            "livereload": true,
            "fallback": "index.html"
            }
        }
;

function Config() {
    this.css = css;
    css.destination.path = main.application.root + css.destination.path;
    css.watch = css.source.files.map(function(file){
        return main.source.root + '**/' + file;
    });
    css.source.root = process.cwd() + "/" + main.source.root;
    css.src = [];
    css.src = css.src.concat( css.source.files.map(function(file){
        var path = "",
            ignore = ""
            ;

        if (css.source.config.recursive == true) {
            path = path + "/**/";
        }
        else {
            path = path + "/";
        }
        if (css.source.config.underscore == false) {
            ignore = "!" + css.source.root + path + "_" + file;
            this.src.push(ignore);
        }
        return css.source.root + path + file;
    }, css) );

    this.filters = filters;

    this.fonts = fonts;
    fonts.path = fonts.destination.path;
    fonts.destination.path = main.application.root + fonts.destination.path;

    this.scripts = scripts;
    scripts.destination.path = main.application.root + scripts.destination.path;

    this.server = server;
    if (this.server.root == '') { this.server.root = main.application.root; }
}

module.exports = new Config();