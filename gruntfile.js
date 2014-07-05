'use strict';

module.exports = function(grunt) {
    /**
     * @method registerTasks
     * Registers grunt tasks for command line usage.
     */
    function registerTasks() {
        grunt.registerTask('unitTest', ['clean:coverage', 'mochaTest', 'reportCoverage']);
        grunt.registerTask('build', ['browserify', 'uglify']);
        grunt.registerTask('test', ['jshint', 'unitTest']);
        grunt.registerTask('publish', ['test', 'build']);
    }

    /**
     * @method registerReportCoverage
     * Registers a task that can read the blanket coverage report.
     */
    function registerReportCoverage() {
        grunt.registerMultiTask('reportCoverage', 'Reads and reports a coverage json file', function() {
            var result = grunt.file.readJSON('.coverage/coverage.json');

            if (result.coverage < 100) {
                grunt.fail.warn(
                    'Expected coverage to be 100%, but was ' + result.coverage.toFixed(2) + '%.\n' +
                    'See ".coverage/coverage.html" for details.'
                );
            } else {
                grunt.log.ok('Code coverage is 100%. Reward yourself with a burrito.');
            }
        });
    }

    /**
     * @method loadNpmTasks
     * Loads tasks from installed grunt plugins.
     */
    function loadNpmTasks() {
        var npmTasks = [
            'grunt-browserify',
            'grunt-contrib-clean',
            'grunt-contrib-jshint',
            'grunt-contrib-uglify',
            'grunt-mocha-test'
        ];

        npmTasks.forEach(function(task) {
            grunt.loadNpmTasks(task);
        });
    }

    /**
     * @method mochaHarness
     * Sets up the environment for running Mocha tests.
     * Creates a jsdom window.
     */
    function mochaHarness() {
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

        require('blanket')({pattern: 'src'});
    }

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
                src: [
                    '*.js',
                    'tasks/*.js',
                    'src/*.js',
                    'src/**/*.js',
                    '!flux-tools.js',
                    '!flux-tools.min.js'
                ],
                options: {jshintrc: '.jshintrc'}
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    require: [mochaHarness]
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
        reportCoverage: {files: {}},
        uglify: {
            build: {
                files: {
                    'flux-tools.min.js': 'flux-tools.js'
                }
            }
        }
    });

    registerTasks();
    registerReportCoverage();
    loadNpmTasks();
};
