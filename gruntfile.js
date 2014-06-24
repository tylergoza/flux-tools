'use strict';

module.exports = function(grunt) {
    var lintFiles = ['*.js', 'tasks/*.js', 'src/*.js', 'src/**/*.js'];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            build: {
                files: {
                    'build/flux-tools.js': [
                        'src/*.js',
                        'src/**/*.js',
                        '!src/tests/*.js',
                        '!src/**/tests/*.js'
                    ]
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
                        require('blanket')({
                          pattern: 'src'
                        });
                    }
                },
                src: ['src/tests/*.js', 'src/**/tests/*.js']
            },
            htmlCoverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: '.coverage/coverage.html'
                },
                src: ['src/tests/*.js', 'src/**/tests/*.js']
            },
            jsonCoverage: {
                options: {
                    reporter: 'json-cov',
                    quiet: true,
                    captureFile: '.coverage/coverage.json'
                },
                src: ['src/tests/*.js', 'src/**/tests/*.js']
            }
        },
        readCoverage: {files: {}},
        uglify: {
            build: {
                files: {
                    'build/flux-tools.min.js': 'build/flux-tools.js'
                }
            }
        }
    });

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('build', ['browserify', 'uglify']);
    grunt.registerTask('test', ['clean:coverage', 'mochaTest', 'readCoverage']);

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadTasks('tasks');
};
