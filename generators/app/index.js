'use strict';
var util = require('util'),
    path = require('path'),
    querystring = require('querystring'),
    https = require('https'),
    exec = require('child_process').exec,
    async = require('async'),
    yeoman = require('yeoman-generator'),
    yosay = require('yosay'),
    colors = require('colors'),
    logger = require('tracer').colorConsole({
        inspectOpt: {
            showHidden : true, //the object's non-enumerable properties will be shown too
            depth : 1 //tells inspect how many times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null.
        },
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

        this.option('bitbucket', {
            desc: 'Use you bitbucket account for configuring repository url',
            type: Boolean,
            defaults: false
        });

        this.option('create', {
            desc: 'Create remote repository',
            type: Boolean,
            defaults: false
        });
    },

    initializing: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the awesome Arc generator!'
        ));

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
        else if (this.options.bitbucket == true) {
            https
                .get("https://bitbucket.org/api/1.0/users/" + this.useremail, function(res) {
                    res.on("data", function(chunk) {
                        this.user.bitbucket = JSON.parse(chunk).user;
                        done();
                    }.bind(this));
                }.bind(this))
                .on('error', function(e) {
                    this.log("Got error: ".red.bold, colors.red(e.message));
                    done();
                }.bind(this));
        }
        else {
            done();
        }

    },

    prompting: function () {
        var yo = this;
        var done = this.async();
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
                type: 'password',
                name: 'password',
                message: 'Enter your ' + serviceName() + ' password',
                default: '',
                when: function () {
                    return yo.options.create && (yo.options.bitbucket || yo.options.github)
                }
            }
        ];

        this.prompt(prompts, function (props) {
            this.properties = props;
            done();
        }.bind(this));

        function serviceName () {
            var name = '';
            if (yo.options.github) {
                name = 'GitHub'
            }
            else if (yo.options.bitbucket) {
                name = 'BitBucket'
            }
            return name;
        }
    },

    configuring: function () {
        var done = this.async();
        this.url = {};
        if (this.options.github) {
            this.url.repo = 'https://github.com/' + this.user.github.name + '/' + this.projectName + '.git';
            this.url.bugs = 'https://github.com/' + this.user.github.name + '/' + this.projectName + '/issues';
            this.url.home = 'http://github.com/' + this.user.github.name;
            this.repository = 'git@github.com:' + this.user.github.name + '/' + this.projectName + '.git';
        }
        else if (this.options.bitbucket) {
            this.url.repo = 'https://bitbucket.org/' + this.user.bitbucket.username + '/' + this.projectName + '.git';
            this.url.bugs = 'https://bitbucket.org/' + this.user.bitbucket.username + '/' + this.projectName + '/issues';
            this.url.home = 'http://bitbucket.org/' + this.user.bitbucket.username;
            this.repository = 'git@bitbucket.org:' + this.user.bitbucket.username + '/' + this.projectName + '.git';
        }
        else {
            this.url.repo = 'https://example.com/' + this.projectName + '.git';
            this.url.bugs = 'https://example.com/' + this.projectName + '/issues';
            this.url.home = 'http://example.com/' + this.projectName;
        }
        this.log(
//            logger.log(this.options),
//            logger.info(this)
        );

        var params, options, req;
        if (this.options.github && this.options.create) {
            params = JSON.stringify({
                'name': this.projectName,
                'has_wiki': false
            });
            options = {
                hostname: 'api.github.com',
                path: '/user/repos',
                method: 'POST',
                auth: this.user.github.name + ':' + this.properties.password,
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Yeoman-Generator-Arc',
                    'Content-type': 'application/json'
                }
            };
            req = https.request(options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    this.remote = true;
                    done();
                }.bind(this));
            }.bind(this));
            req.write(params);
            req.end();

            req.on('error', function(e) {
                this.log("Got error: ".red.bold, colors.red(e.message));
                done();
            }.bind(this));
        }
        else if (this.options.bitbucket && this.options.create) {
            params = querystring.stringify({
                'name' : this.projectName,
                'is_private': true,
                'scm': 'git'
            });
            options = {
                hostname: 'bitbucket.org',
                path: '/api/2.0/repositories/' +  this.user.bitbucket.username + '/' + this.projectName,
                method: 'POST',
                auth: this.user.bitbucket.username + ':' + this.properties.password,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': params.length
                }
            };
            req = https.request(options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    this.remote = true;
                    done();
                }.bind(this));
            }.bind(this));
            req.write(params);
            req.end();

            req.on('error', function(e) {
                this.log("Got error: ".red.bold, colors.red(e.message));
                done();
            }.bind(this));
        }
        else {
            done();
        }

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
            this.mkdir('tasks/config');
            this.copy('gulpfile.js', 'gulpfile.js');
            this.template('tasks/config/_config.js', 'tasks/config/config.js');
            this.copy('tasks/lib.js', 'tasks/lib.js');
        },

        projectfiles: function () {
            this.template('_package.json', 'package.json');
            this.template('_readme.md', 'README.md');

            this.copy('editorconfig', '.editorconfig');
            this.copy('jshintrc', '.jshintrc');
        }
    },

    end: function () {
        var yo = this;
        this.installDependencies();

        async.series([
                function(callback){
                    exec('git init',
                        function (error, stdout, stderr) {
                            if (error === null) {
                                console.log('git init: '.green + colors.cyan(yo._.trim(stdout)));
                            }
                            callback(null, '\"git init\" susses');
                        });
                },
                function(callback){
                    exec('git add .',
                        function (error, stdout, stderr) {
                            if (error === null) {
                                console.log('git add:'.green, "susses".cyan);
                            }
                            callback(null, '\"git add\" susses');
                        });
                },
                function(callback){
                    exec('git commit -m \"Initial commit\"',
                        function (error, stdout, stderr) {
                            if (error === null) {
                                console.log('git commit:'.green, yo._.trim(stdout));
                            }
                            callback(null, '\"git commit\" susses');
                        });
                }
            ],
            function(err, results){
//                    logger.info(results);
                if (yo.repository) {
                    addRemote(yo.repository);
                }
            }
        );

        function addRemote (repo) {
            exec('git remote add origin ' + repo,
                function (error, stdout, stderr) {
                    if (error === null && yo.remote) {
                        console.log('git remote add:'.green, "susses".cyan);
                        push();
                    }
                    else if (error === null) {
                        console.log('git remote add:'.green, "susses".cyan);
                    }
                });
        }
        function push () {
            exec('git push --set-upstream origin master',
                function (error, stdout, stderr) {
                    if (error === null) {
                        console.log('git push:'.green, yo._.trim(stdout));
                    }
                });
        }
    }
});

module.exports = ArcGenerator;
