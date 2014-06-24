'use strict';

module.exports = function(grunt) {
    grunt.registerMultiTask('readCoverage', 'Reads and reports a coverage json file', function() {
        var fs = require('fs');
        var result = JSON.parse(fs.readFileSync('.coverage/coverage.json', 'utf-8'));

        if (result.coverage < 100) {
            grunt.fail.warn(
                'Expected coverage to be 100%, but was ' + result.coverage.toFixed(2) + '%.'
            );
        } else {
            grunt.log.ok('Coverage is 100%.');
        }
    });
};
