'use strict';
var filter = require('gulp-filter')
    , minimatch = require('minimatch')
    , main = {
        application: {root: 'app/'},
        source: {root: 'src/'}
    }
    , styles = {
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
    this.styles = styles;
    styles.destination.path = main.application.root + styles.destination.path;
    styles.watch = styles.source.files.map(function(file){
        return main.source.root + '**/' + file;
    });
    styles.source.root = process.cwd() + "/" + main.source.root;
    styles.src = _fileset(styles);

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

function _fileset(config) {
    var _src = [];
    return _src.concat( config.source.files.map(function(file){
        var path = "",
            ignore = ""
            ;

        if (config.source.config.recursive == true) {
            path = path + "**/";
        }
        if (config.source.config.underscore == false) {
            ignore = "!" + main.source.root + path + "_" + file;
            _src.push(ignore);
        }
        return main.source.root + path + file;
    }, config) );
}