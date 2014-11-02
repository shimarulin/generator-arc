'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');

var ArcGenerator = yeoman.generators.Base.extend({
    constructor: function () {
        // Calling the super constructor is important so our generator is correctly setup
        yeoman.generators.Base.apply(this, arguments);

        this.argument('projectname', {
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
        this.pkg = require('../../package.json');
        this.projectname = this._.slugify(this._.humanize(this.projectname));
        this.readable_name = this._.humanize(this.projectname);
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
//        this.log('projectname -> ' + this.projectname);
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
            this.copy('_package.json', 'package.json');
            this.copy('_bower.json', 'bower.json');

            this.copy('editorconfig', '.editorconfig');
            this.copy('gitattributes', '.gitattributes');
            this.copy('gitignore', '.gitignore');

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
