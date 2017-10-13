
module.exports = function(grunt) {

    var config = require('./.screeps.json')

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        meta: {
            "src": "src",
            "env": "env",
            "dest": "build",
        },

        clean: {
            build: {
                src: ['<%= meta.dest %>/*'],
            },
        },

        copy: {
            build: {
                cwd: '<%= meta.src %>',
                src: ['**'],
                dest: '<%= meta.dest %>/',
                expand: true,
                filter: 'isFile',
                rename: function (dest, src) {
                    return dest + src.replace(/\//g,'.');
                }
            },
            envlive: {
                cwd: '<%= meta.env %>',
                src: ['env_live.js'],
                dest: '<%= meta.dest %>/',
                expand: true,
                rename: function (dest, src) {
                    return dest + src.replace('live','var');
                }
            },
            envlocal: {
                cwd: '<%= meta.env %>',
                src: ['env_local.js'],
                dest: '<%= meta.dest %>/',
                expand: true,
                rename: function (dest, src) {
                    return dest + src.replace('local','var');
                }
            },
            local: {
                cwd: '<%= meta.dest %>',
                src: ['**'],
                dest: config.deploy,
                expand: true,
            },
        },

        screeps: {
            options: {
                email:  config.screepsEmail,
                password: config.screepsPassword,
                branch: 'default',
                ptr: false,
            },
            live: {
                src: ['<%= meta.dest %>/*.js'],
            },
        },
    });

    grunt.registerTask(
        'build',
        ['clean:build', 'copy:build']
    );

    grunt.registerTask(
        '1-deploy-local',
        ['clean:build', 'copy:build', 'copy:envlocal', 'copy:local']
    );

    grunt.registerTask(
        '1-deploy-live',
        ['clean:build', 'copy:build', 'copy:envlive', 'screeps:live']
    );

}
