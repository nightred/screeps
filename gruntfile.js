
module.exports = function(grunt) {

    var config = require('./.screeps.json')

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        meta: {
            "src": "src",
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
            test: {
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
        'deploy-test',
        ['clean:build', 'copy:build', 'copy:test']
    );

    grunt.registerTask(
        'deploy-live',
        ['clean:build', 'copy:build', 'screeps:live']
    );

}
