'use strict';
var util = require('util'),
    path = require('path'),
    querystring = require('querystring'),
    https = require('https'),
    http = require('http'),
    exec = require('child_process').exec,
    async = require('async'),
    yeoman = require('yeoman-generator'),
    yosay = require('yosay'),
    githubUsername = require('github-username'),
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
    templateSettings = {
        js: {
            evaluate: /\/\*\<\%(.+?)\%\>\*\//g,
            interpolate: /"\<\%=(.+?)\%\>"/g,
            escape: /"\<\%-(.+?)\%\>"/g
        }
    }
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

        this.option('gitlab', {
            desc: 'Use you gitlab account for configuring repository url',
            type: Boolean,
            defaults: false
        });

        this.option('create', {
            desc: 'Create remote repository',
            type: Boolean,
            defaults: false
        });

        this.option('email', {
            desc: 'Overwrite you email',
            type: String,
            defaults: false
        });

        this.option('nossl', {
            desc: 'Overwrite you email',
            type: Boolean,
            defaults: false
        });
    },

    initializing: function () {
        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the awesome Arc generator!'
        ));

        this.pkg = require('../../package.json');
        this.bowerrc = this.src.readJSON('bowerrc');

        this.readableName = function(){
            return this.projectName.match(/\s/) !== null ? this.projectName : this._.capitalize(this._.humanize(this.projectName))
        }.bind(this)();
        this.projectName = this._.slugify(this._.humanize(this.projectName));

        this.username = this.user.git.name();
        this.useremail = function(email){
            return typeof email === 'string' ? email : this.user.git.email();
        }.bind(this)(this.options.email);

        this.protocol = function(nossl){
            return nossl ? "http://" : "https://";
        }(this.options.nossl);

        this.user.name = this.username;

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
                type: 'input',
                name: 'repositoryUrl',
                message: 'Enter your ' + serviceName() + ' repository url',
                default: 'gitlab.com',
                when: function () {
                    return yo.options.gitlab
                }
            },
            {
                type: 'password',
                name: 'password',
                message: 'Enter your ' + serviceName() + ' password',
                default: '',
                when: function () {
                    return (yo.options.create && (yo.options.bitbucket || yo.options.github)) || yo.options.gitlab
                }
            }
        ];

        this.prompt(prompts, function (props) {
            this.properties = props;

            var params, options, req;
            if (this.options.github) {
                options = {
                        hostname: 'api.github.com',
                        path: '/users/',
                        headers: {
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'Yeoman-Generator-Arc',
                            'Content-type': 'application/json'
                        }
                    };
                githubUsername(this.useremail, function (err, username) {
                    if (err === null) {
                        this.user.github.user = username;
                    }
                    else {
                        this.log(colors.red.bold(err));
                        this.user.github.user =  this._.strLeft(this.useremail, '@');
                    }
                    options.path += username;
                    https
                        .get(options, function(res) {
                            res.on("data", function(chunk) {
                                var name = JSON.parse(chunk).name;
                                this.user.github.name = (name !== ('' || undefined)) ? name : this.username;
                                this.user.name = this.user.github.name;
                                done();
                            }.bind(this));
                        }.bind(this))
                        .on('error', function(e) {
                            this.log("Got error: ".red.bold, colors.red(e.message));
                            done();
                        }.bind(this));
                }.bind(this));
            }
            else if (this.options.bitbucket) {
                https
                    .get("https://bitbucket.org/api/1.0/users/" + this.useremail, function(res) {
                        res.on("data", function(chunk) {
                            this.user.bitbucket = JSON.parse(chunk).user;
                            this.user.name = this.user.bitbucket.display_name;
                            done();
                        }.bind(this));
                    }.bind(this))
                    .on('error', function(e) {
                        this.log("Got error: ".red.bold, colors.red(e.message));
                        done();
                    }.bind(this));
            }
            else if (this.options.gitlab) {
                params = JSON.stringify({
                    'email': this.useremail,
                    'password': this.properties.password
                });
                options = {
                    hostname: this.properties.repositoryUrl,
                    path: '/api/v3/session',
                    method: 'POST',
                    headers: {
                        'User-Agent': 'Yeoman-Generator-Arc',
                        'Content-type': 'application/json'
                    }
                };
                if (this.options.nossl) {
                    req = http.request(options, gitLabResponseHandler.bind(this));
                }
                else {
                    req = https.request(options, gitLabResponseHandler.bind(this));
                }
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

            function gitLabResponseHandler(res){
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    this.user.gitlab = JSON.parse(chunk);
                    this.user.name = this.user.gitlab.name;
                    this.remote = true;
                    done();
                }.bind(this));
            }

        }.bind(this));

        function serviceName () {
            var name = '';
            if (yo.options.github) {
                name = 'GitHub'
            }
            else if (yo.options.bitbucket) {
                name = 'BitBucket'
            }
            else if (yo.options.gitlab) {
                name = 'GitLab'
            }
            return name;
        }
    },

    configuring: function () {
        var done = this.async();

        this.url = {};
        if (this.options.github) {
            this.url.repo = 'https://github.com/' + this.user.github.user + '/' + this.projectName + '.git';
            this.url.bugs = 'https://github.com/' + this.user.github.user + '/' + this.projectName + '/issues';
            this.url.home = 'http://github.com/' + this.user.github.user;
            this.repository = 'git@github.com:' + this.user.github.user + '/' + this.projectName + '.git';
        }
        else if (this.options.bitbucket) {
            this.url.repo = 'https://bitbucket.org/' + this.user.bitbucket.username + '/' + this.projectName + '.git';
            this.url.bugs = 'https://bitbucket.org/' + this.user.bitbucket.username + '/' + this.projectName + '/issues';
            this.url.home = 'http://bitbucket.org/' + this.user.bitbucket.username;
            this.repository = 'git@bitbucket.org:' + this.user.bitbucket.username + '/' + this.projectName + '.git';
        }
        else if (this.options.gitlab) {
            this.url.repo = this.protocol + this.properties.repositoryUrl + '/' + this.user.gitlab.username + '/' + this.projectName + '.git';
            this.url.bugs = this.protocol + this.properties.repositoryUrl + '/' + this.user.gitlab.username + '/' + this.projectName + '/issues';
            this.url.home = this.protocol + this.properties.repositoryUrl + '/u/' + this.user.gitlab.username;
            this.repository = 'git@' + this.properties.repositoryUrl + ':' + this.user.gitlab.username + '/' + this.projectName + '.git';
        }
        else {
            this.url.repo = 'https://example.com/' + this.projectName + '.git';
            this.url.bugs = 'https://example.com/' + this.projectName + '/issues';
            this.url.home = 'http://example.com/' + this.projectName;
        }

        var params, options, req;
        if (this.options.github && this.options.create) {
            params = JSON.stringify({
                'name': this.readableName,
                'has_wiki': false
            });
            options = {
                hostname: 'api.github.com',
                path: '/user/repos',
                method: 'POST',
                auth: this.user.github.user + ':' + this.properties.password,
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
                    this.repository = JSON.parse(chunk).ssh_url;
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
                'name' : this.readableName,
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
        else if (this.options.gitlab && this.options.create) {
            params = {
                'name' : this.readableName,
                'path': this.projectName,
                'wiki_enabled' : false,
                'public': false
            };
            var gitlab = require('gitlab')({
                url:   this.protocol + this.properties.repositoryUrl,
                token: this.user.gitlab.private_token
            });
            gitlab.projects.create(params, function(data) {
                done();
            });
        }
        else {
            done();
        }

    },

    writing: {
        app: function () {
            this.mkdir('src/components');
            this.mkdir('src/fonts');
            this.mkdir('src/images');
            this.mkdir('src/modules');

            this.copy('gitkeep', 'src/components/.gitkeep');
            this.copy('gitkeep', 'src/fonts/.gitkeep');
            this.copy('gitkeep', 'src/images/.gitkeep');
            this.copy('gitkeep', 'src/modules/.gitkeep');

            this.template('src/_index.html', 'src/index.html');
            if (this.properties.preprocessor == 'less') {
                this.copy('src/app.less', 'src/app.less');
            }
            else if (this.properties.preprocessor == 'sass') {
                this.copy('src/app.scss', 'src/app.scss');
            }
            this.copy('src/app.js', 'src/app.js');
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
            this.tpl = {};
            if (this.properties.preprocessor == 'less') {
                this.tpl.preprocessor = require('./templates/tasks/config/less.json');
            }
            else if (this.properties.preprocessor == 'sass') {
                this.tpl.preprocessor = require('./templates/tasks/config/sass.json');
            }
            this.mkdir('tasks/config');
            this.copy('gulpfile.js', 'gulpfile.js');
            this.template('tasks/config/config.js', 'tasks/config/config.js', undefined, templateSettings.js);
            this.copy('tasks/config/filters.js', 'tasks/config/filters.js');

            this.copy('tasks/fonts.js', 'tasks/fonts.js');
            this.copy('tasks/images.js', 'tasks/images.js');
            this.copy('tasks/libs.js', 'tasks/libs.js');
            this.copy('tasks/markup.js', 'tasks/markup.js');
            this.copy('tasks/scripts.js', 'tasks/scripts.js');
            this.copy('tasks/server.js', 'tasks/server.js');
            this.copy('tasks/styles.js', 'tasks/styles.js');
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
                    exec('git config user.name "'+yo.user.name+'"',
                        function (error, stdout, stderr) {
                            if (error === null) {
                                yo.log('git config user.name:'.green, "susses".cyan);
                            }
                            callback(null, '\"git config user.name\" susses');
                        });
                },
                function(callback){
                    if (typeof yo.options.email === 'string') {
                        exec('git config user.email "'+yo.options.email+'"',
                            function (error, stdout, stderr) {
                                if (error === null) {
                                    yo.log('git config user.email:'.green, "susses".cyan);
                                }
                                callback(null, '\"git config user.email\" susses');
                            });
                    }
                    else {
                        callback(null, '\"git config user.email\" skipped');
                    }
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
                                yo.log('git commit:'.green, yo._.trim(stdout));
                            }
                            callback(null, '\"git commit\" susses');
                        });
                }
            ],
            function(err, results){
                if (yo.repository) {
                    addRemote(yo.repository);
                }
            }
        );

        function addRemote (repo) {
            exec('git remote add origin ' + repo,
                function (error, stdout, stderr) {
                    if (error === null && yo.remote) {
                        yo.log('git remote add:'.green, "susses".cyan);
                        push();
                    }
                    else if (error === null) {
                        yo.log('git remote add:'.green, "susses".cyan);
                    }
                });
        }
        function push () {
            exec('git push --set-upstream origin master',
                function (error, stdout, stderr) {
                    if (error === null) {
                        yo.log('git push:'.green, yo._.trim(stdout));
                    }
                });
        }
    }
});

module.exports = ArcGenerator;
