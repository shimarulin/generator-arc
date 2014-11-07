'use strict';
var util = require('util'),
    path = require('path'),
//    exec = require('child_process').exec,
    yeoman = require('yeoman-generator'),
    yosay = require('yosay'),
    colors = require('colors'),
    logger = require('tracer').colorConsole({
        filters : {
            log : colors.white,
            trace : colors.magenta,
            debug : colors.cyan,
            info : colors.green,
            warn : colors.yellow,
            error : [ colors.red, colors.bold ]
        }
    }),
    githubUsername = require('github-username')
    ;

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

        this.option('github', {
            desc: 'Use you github account for configuring repository url',
            type: Boolean,
            defaults: false
        });

    },

    initializing: function () {
        var done = this.async();
        this.pkg = require('../../package.json');
        this.bowerrc = this.src.readJSON('bowerrc');
        this.projectName = this._.slugify(this._.humanize(this.projectName));
        this.readableName = this._.capitalize(this._.humanize(this.projectName));
        this.username = this.user.git.name();
        this.useremail = this.user.git.email();

        if (this.options.github == true) {
            githubUsername(this.useremail, function (err, username) {
                if (err === null) {
                    this.user.github.name = username;
                }
                else {
                    this.log(colors.red.bold(err));
                    this.user.github.name =  this._.strLeft(this.useremail, '@');
                }
                done();
            }.bind(this));
        }
        else {
            done();
        }

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
        this.url = {};
        if (this.options.github) {
            this.url.repo = 'https://github.com/' + this.user.github.name + '/' + this.projectName + '.git';
            this.url.bugs = 'https://github.com/' + this.user.github.name + '/' + this.projectName + '/issues';
            this.url.home = 'http://github.com/' + this.user.github.name;
        }
        else {
            this.url.repo = 'https://example.com/' + this.projectName + '.git';
            this.url.bugs = 'https://example.com/' + this.projectName + '/issues';
            this.url.home = 'http://example.com/' + this.projectName;
        }
        this.log(
//            logger.log(this.options),
            logger.info(this.url)
        );
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
