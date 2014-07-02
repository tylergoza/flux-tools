'use strict';

module.exports = function(grunt) {
    var lintFiles = [
        '*.js',
        'tasks/*.js',
        'src/*.js',
        'src/**/*.js',
        '!flux-tools.js',
        '!flux-tools.min.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            build: {
                files: {
                    'flux-tools.js': ['browserify.js']
                }
            }
        },
        clean: {
            coverage: ['.coverage']
        },
        jshint: {
            lint: {
                src: lintFiles,
                options: {jshintrc: '.jshintrc'}
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    require: function() {
                        var jsdom = require('jsdom');

                        //build the dom for tests
                        global.window = jsdom.jsdom().createWindow(
                            '<!DOCTYPE html>' +
                            '<html>' +
                                '<head>' +
                                    '<meta charset="utf-8">' +
                                    '<title>Mocha Test</title>' +
                                '</head>' +
                                '<body>' +
                                '</body>' +
                            '</html>'
                        );
                        global.document = global.window.document;
                        global.navigator = global.window.navigator;

                        require('blanket')({
                          pattern: 'src'
                        });
                    }
                },
                src: ['src/*.js', 'src/**/*.js']
            },
            htmlCoverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: '.coverage/coverage.html'
                },
                src: ['src/*.js', 'src/**/*.js']
            },
            jsonCoverage: {
                options: {
                    reporter: 'json-cov',
                    quiet: true,
                    captureFile: '.coverage/coverage.json'
                },
                src: ['src/*.js', 'src/**/*.js']
            }
        },
        readCoverage: {files: {}},
        uglify: {
            build: {
                files: {
                    'flux-tools.min.js': 'flux-tools.js'
                }
            }
        }
    });

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('unitTest', ['clean:coverage', 'mochaTest', 'readCoverage']);
    grunt.registerTask('build', ['browserify', 'uglify']);
    grunt.registerTask('test', ['lint', 'unitTest']);
    grunt.registerTask('publish', ['test', 'build']);

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadTasks('tasks');
};
