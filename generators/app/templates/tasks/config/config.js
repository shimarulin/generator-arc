'use strict';

var cwd = process.cwd()// current working directory
    , filter = require('gulp-filter')
    , minimatch = require('minimatch')
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
    };

var directory = {
        application: 'app/',
        build: 'build/',
        source: 'src/'
    },
    /**
     * Task config
     * @type {object}
     * @property {object}           source                      - source globs math
     * @property {(string|Array.)}  source.extensions           - files extensions
     * @property {object}           source.options              - globs match options
     * @property {boolean}          source.option.recursive     - recursive search
     * @property {boolean}          source.option.underscore    - ignore underscored files
     * @property {(string|Array.)}  source.root                 - overwrite default root
     * @property {object}           destination                 - destination options
     * @property {object}           destination.name            - destination filename
     * @property {object}           destination.path            - destination path
     */
    fonts = {
        destination: {
            path: "fonts/"
        }
    },
    html = {
        source: {
            extensions: ["html"],
            options: {
                underscore: false,
                recursive: false
            }
        },
        destination: {
            path: "/"
        }
    },
    lib = {
        fonts: {
            destination: {
                path: "fonts/"
            }
        },
        scripts: {
            destination: {
                name: 'lib.js',
                path: "js/"
            }
        },
        styles: {
            destination: {
                name: 'lib.css',
                path: "css/"
            }
        }
    },
    scripts = {
        destination: {
            path: 'js/'
        }
    },
    server = {
        source: {root: directory.application},
        "options": {
            "host": "localhost",
            "port": 8000,
            "livereload": true,
            "fallback": "index.html"
        }
    },
    styles = {
        source: {
            extensions: "<%= JSON.stringify(tpl.preprocessor.extensions) %>",
            options: {
                underscore: false,
                recursive: false
            }
        },
        preprocessor: {
            name: '"<%= properties.preprocessor %>"',
            module: '"<%= tpl.preprocessor.module %>"',
            options: "<%= JSON.stringify(tpl.preprocessor.options) %>"
        },
        postprocessor: {
            name: "pleeease",
            module: 'gulp-pleeease',
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
            path: 'css/'
        }
    }
;

function Config() {
    this.fonts = new Task(fonts);
    this.scripts = new Task(scripts);
    this.server = new Task(server);
    this.styles = new Task(styles);
    this.lib = {};
    this.lib.fonts = new Task(lib.fonts);
    this.lib.scripts = new Task(lib.scripts);
    this.lib.styles = new Task(lib.styles);

    this.filters = filters;
}

module.exports = new Config();

function Task (config) {

    var recursive = thereIs(config, "source.options.recursive", true),
        underscore  = thereIs(config, "source.options.underscore", true);

    this.destination = {
        name: thereIs(config, "destination.name", false) ? config.destination.name : null,
        path: thereIs(config, "destination.path", false) ? (directory.application + config.destination.path) : null
    };

    this.source = {};
    this.source.files = _globs(recursive, underscore);
    if (thereIs(config, "source.root", undefined)) {
        this.source.root = {
            absolute: cwd + '/' + config.source.root,
            relative: config.source.root
        };
        this.watch = _globs(true, true, config.source.root);
    }
    else {
        this.source.root = {
            absolute: cwd + '/' + directory.source,
            relative: directory.source
        };
        this.watch = _globs(true, true);
    }

    for(var i in config) {
        if (config.hasOwnProperty(i) && _inspect.bind(this)(i) != true) {
            this[i] = config[i];
        }
    }

    /**
     * Verification of the existence
     * */
    function _inspect(prop) {
        for(var i in this) {
            if (this.hasOwnProperty(i) && i == prop) {
                return true
            }
        }
    }

    /**
     * Make array of globs
     * */

    function _globs(recursive, underscore, dir) {
        var _src = [],
            _dir = (dir !== undefined) ? dir : directory.source;
        if (thereIs(config, "source.extensions", undefined) === undefined && dir === undefined) {
            return null;
        }
        else if (thereIs(config, "source.extensions", undefined) === undefined && dir !== undefined) {
            return _dir;
        }
        return _src.concat(config.source.extensions.map(function(ext){
            var path = "",
                ignore = ""
                ;
            if (recursive == true) {
                path = path + "**/";
            }
            else {
                path = path + "";
            }
            if (underscore == false) {
                ignore = "!" + _dir + path + "_*." + ext;
                _src.push(ignore);
            }
            return _dir + path + "*." + ext;
        }));
    }
}

/**
 * Making Deep Property Access Safe in JavaScript
 * http://designpepper.com/blog/drips/making-deep-property-access-safe-in-javascript.html
 * https://github.com/joshuacc/drabs/blob/master/src/drabs.js
 * */
function thereIs(obj, props, defaultValue) {
    if (typeof props === "string") {
        props = props.split(".");
    }
    var thereIsByArray = function (obj, propsArray, defaultValue) {
        if (obj === undefined || obj === null) {
            return defaultValue;
        }
        if (propsArray.length === 0) {
            return obj;
        }
        var foundSoFar = obj[propsArray[0]];
        var remainingProps = propsArray.slice(1);
        return thereIsByArray(foundSoFar, remainingProps, defaultValue);
    };
    return thereIsByArray(obj, props, defaultValue);
}