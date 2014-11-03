'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');

var ArcGenerator = yeoman.generators.Base.extend({
    constructor: function () {
        // Calling the super constructor is important so our generator is correctly setup
        yeoman.generators.Base.apply(this, arguments);

        this.argument('projectName', {
            desc: 'You application name',
            type: String,
            defaults: function () {
                return path.basename(process.cwd());
            }(),
            required: false
        });

        // This method adds support for a `--less` flag
        // Usage: this.options.less
//        this.option('less', {
//            desc: 'Less support',
//            type: String,
//            defaults: undefined,
//            hide: false
//        });

    },

    initializing: function () {
        this.log(this);
        this.pkg = require('../../package.json');
        this.bowerrc = this.src.readJSON('bowerrc');
        this.projectName = this._.slugify(this._.humanize(this.projectName));
        this.readableName = this._.capitalize(this._.humanize(this.projectName));
    },

    prompting: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the awesome Arc generator!'
        ));

        var prompts = [
            {
                type: 'list',
                name: 'preprocessor',
                message: 'Select CSS pre-processor',
                choices: [
                    {
                        name: 'Less',
                        value: 'less'
                    },
                    {
                        name: 'Sass',
                        value: 'sass'
                    }
                ],
                default: 0
            }
        ];

        this.prompt(prompts, function (props) {
            this.properties = props;
            done();
        }.bind(this));
    },

    configuring: function () {
//        this.log(this);
//        this.log(this.options);
//        this.log(this.arguments);
//        this.log('projectName -> ' + this.projectName);
    },

    writing: {
        app: function () {

            this.mkdir('src/components');
            this.mkdir('src/modules');

            this.template('src/_app.html', 'src/app.html');

        },

        tasks: function () {
            this.mkdir('tasks/config/modules');
        },

        bower: function () {
            this.copy('bowerrc', '.bowerrc');
        },

        projectfiles: function () {
            this.template('_package.json', 'package.json');
            this.template('_bower.json', 'bower.json');

            this.template('_gitignore', '.gitignore');

            this.copy('editorconfig', '.editorconfig');
            this.copy('gitattributes', '.gitattributes');

            this.src.copy('jshintrc', '.jshintrc');

//            this.src.copy('npmrc', '.npmrc');
//            this.src.copy('gitignore', '.gitignore');
//            this.src.copy('gitignore', '.gitignore');

        }
    },

    end: function () {
        this.installDependencies();
    }
});

module.exports = ArcGenerator;
