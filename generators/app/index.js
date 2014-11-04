'use strict';
var util = require('util'),
    path = require('path'),
    exec = require('child_process').exec,
    yeoman = require('yeoman-generator'),
    yosay = require('yosay');

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
        this.pkg = require('../../package.json');
        this.bowerrc = this.src.readJSON('bowerrc');
        this.projectName = this._.slugify(this._.humanize(this.projectName));
        this.readableName = this._.capitalize(this._.humanize(this.projectName));

        exec('git config user.name',
            function (error, stdout, stderr) {
                this.userName = this._.trim(stdout);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            }.bind(this));
        exec('git config user.email',
            function (error, stdout, stderr) {
                this.userEmail = this._.trim(stdout);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            }.bind(this));
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
            },
            {
                type: 'input',
                name: 'repository',
                message: 'Enter the repository url'
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
        this.log('userName -> ' + this.userName);
        this.log('userEmail -> ' + this.userEmail);
    },

    writing: {
        app: function () {
            this.mkdir('src/components');
            this.mkdir('src/modules');

            this.template('src/_app.html', 'src/app.html');
        },

        bower: function () {
            this.copy('bowerrc', '.bowerrc');
            this.template('_bower.json', 'bower.json');
        },

        git: function () {
            this.copy('gitattributes', '.gitattributes');
            this.template('_gitignore', '.gitignore');
        },

        tasks: function () {
            this.mkdir('tasks/config/modules');
        },

        projectfiles: function () {
            this.template('_package.json', 'package.json');

            this.copy('editorconfig', '.editorconfig');
            this.copy('jshintrc', '.jshintrc');
        }
    },

    end: function () {
        this.installDependencies();
    }
});

module.exports = ArcGenerator;
