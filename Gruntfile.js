/*
 * grunt-phantomas
 * https://github.com/stefanjudis/grunt-phantomas
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function( grunt ) {

  grunt.initConfig( {
    jshint: {
      /* https://github.com/gruntjs/grunt-contrib-jshint */
      all: [
        'Gruntfile.js',
        'tasks/**/*.js',
        '<%= nodeunit.tests %>',
      ],
      options : {
        jshintrc : '.jshintrc',
      },
    },

    clean : {
      /* https://github.com/gruntjs/grunt-contrib-clean */
      tests : [ 'tmp' ],
    },


    compass : {
      /* https://github.com/gruntjs/grunt-contrib-compass */
      dist : {
        options: {
          sassDir: 'tasks/assets/sass',
          cssDir: 'tasks/public/styles',
          environment: 'production'
        }
      }
    },


    phantomas : {
      /* https://github.com/stefanjudis/grunt-phantomas */
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


    nodeunit : {
      /* https://github.com/gruntjs/grunt-contrib-nodeunit */
      tests : [ 'test/**/*Test.js' ],
    }
  } );

  // Actually load this plugin's task(s).
  grunt.loadTasks( 'tasks' );

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
  grunt.loadNpmTasks( 'grunt-contrib-compass' );

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask( 'test', [ 'clean', 'nodeunit' ] );

  // By default, lint and run all tests.
  grunt.registerTask( 'default', [ 'jshint', 'test' ] );

  grunt.registerTask( 'build', [ 'compass', 'phantomas' ] );

};
