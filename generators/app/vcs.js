'use strict';
var exec = require('child_process').exec
//    ,
//    generator
    ;

function Vcs (generator, callback) {
//    generator = yeoman;
    var vcs = this.list = {};
    vcs.hg = {};
    vcs.git = {};
//    var done = generator.async();

//    (function () {
//
//    })();
    exec('hg showconfig ui.username',
        function (error, stdout, stderr) {
//            this.log("Std Hg: "+stderr);
            if (error !== null) {
                this.log('exec error: ' + error);
                vcs.hg.installed = false;
            }
            else {
                var str = generator._.trim(stdout),
                    userRx = /.*(?=<)/i,
                    emailRx = /<.*(?:>)/i;
                vcs.hg.installed = true;
                vcs.hg.username = generator._.clean(str.match(userRx)[0]);
                vcs.hg.useremail = generator._.trim(str.match(emailRx)[0], "<>");
            }
        }.bind(generator));

    exec('git config user.name',
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
                vcs.git.installed = false;
            }
            else {
                vcs.git.installed = true;
                vcs.git.username = this._.trim(stdout);
            }
        }.bind(generator));

    exec('git config user.email',
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
                vcs.git.installed = false;
            }
            else {
                vcs.git.installed = true;
                vcs.git.useremail = this._.trim(stdout);
            }
            callback();
        }.bind(generator));
}

module.exports = Vcs;


//exports.init = function (yeoman) {
//    generator = yeoman;
//};
//
//exports.installed = function () {
//    var vcs = {};
//    exec('hg showconfig ui.username',
//        function (error, stdout, stderr) {
////            this.log("Std Hg: "+stderr);
//            if (error !== null) {
//                this.log('exec error: ' + error);
//            }
//            else {
//                var str = generator._.trim(stdout),
//                    userRx = /.*(?=<)/i,
//                    emailRx = /<.*(?:>)/i;
//                vcs.hg = {};
//                vcs.hg.username = generator._.clean(str.match(userRx)[0]);
//                vcs.hg.useremail = generator._.trim(str.match(emailRx)[0], "<>");
//            }
//        }.bind(generator));
//
//    return vcs;
//};