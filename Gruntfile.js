/*
 * grunt-phantomas
 * https://github.com/stefanjudis/grunt-phantomas
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function( grunt ) {

  // Project configuration.
  grunt.initConfig( {
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/**/*.js',
        '<%= nodeunit.tests %>',
      ],
      options : {
        jshintrc : '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean : {
      tests : [ 'tmp' ],
    },

    // Configuration to be run (and then tested).
    phantomas : {
      google : {
        options : {
          indexPath : './phantomas/',
          raw       : [
            '--no-externals',
            '--allow-domain=cdn.natue.com.br,ajax.googleapis.com,static.natue.com.br'
          ],
          url       : 'http://www.natue.com.br'
        }
      }
    },

    // Unit tests.
    nodeunit : {
      tests : [ 'test/**/*Test.js' ],
    }
  } );

  // Actually load this plugin's task(s).
  grunt.loadTasks( 'tasks' );

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask( 'test', [ 'clean', 'nodeunit' ] );

  // By default, lint and run all tests.
  grunt.registerTask( 'default', [ 'jshint', 'test' ] );

};
