/*
 * grunt-phantomas
 * https://github.com/stefanjudis/grunt-phantomas
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function( grunt ) {
  var devIndexPath = './phantomas/';

  grunt.initConfig( {

    clean : {
      /* https://github.com/gruntjs/grunt-contrib-clean */
      tests : [ 'tmp' ],
    },


    compass : {
      /* https://github.com/gruntjs/grunt-contrib-compass */
      dist : {
        options : {
          sassDir     : 'tasks/assets/sass',
          cssDir      : 'tasks/public/styles',
          environment : 'production'
        }
      }
    },


    copy : {
      /* https://github.com/gruntjs/grunt-contrib-copy */
      scripts : {
        files : [
          {
            cwd    : 'tasks/public/scripts/',
            expand : true,
            src    : [ '**' ],
            dest   : devIndexPath + 'public/scripts/',
            filter : 'isFile'
          },
        ]
      },
      styles : {
        files : [
          {
            cwd    : 'tasks/public/styles/',
            expand : true,
            src    : [ '**' ],
            dest   : devIndexPath + 'public/styles/',
            filter : 'isFile'
          },
        ]
      }
    },


    jscs : {
      /* https://www.npmjs.org/package/grunt-jscs-checker */
      src     : [
        'Gruntfile.js',
        'tasks/assets/**/*.js',
        '!tasks/assets/scripts/d3.min.js',
        'tasks/lib/phantomas.js',
        '<%= nodeunit.tests %>',
      ],
      options : {
        config : '.jscs.json'
      }
    },


    jshint : {
      /* https://github.com/gruntjs/grunt-contrib-jshint */
      all : [
        'Gruntfile.js',
        'tasks/assets/**/*.js',
        '!tasks/assets/scripts/d3.min.js',
        'tasks/lib/**/phantomas.js',
        '<%= nodeunit.tests %>',
      ],
      options : {
        jshintrc : '.jshintrc',
      },
    },


    phantomas : {
      /* https://github.com/stefanjudis/grunt-phantomas */
      grunt : {
        options : {
          assertions : {
            'assetsWithQueryString' : 3,
            'biggestLatency'        : 1400,
            'bodyHTMLSize'          : 10500,
            'commentsSize'          : 55,
            'consoleMessages'       : 0,
            'hiddenContentSize'     : 65,
            'jsErrors'              : 0,
            'gzipRequests'          : 8,
            'medianResponse'        : 400,
            'nodesWithInlineCSS'    : 0,
            'requests'              : 30,
            'timeToFirstImage'      : 1100,
            'DOMelementsCount'      : 200,
            'DOMqueries'            : 10
          },
          // additionalStylesheet : '/Users/stefan/Desktop/custom2.css',
          // buildUi              : false,
          // output               : 'json',
          indexPath            : './phantomas/',
          options              : {
            'timeout'        : 30
          },
          url                  : 'http://gruntjs.com/'
        }
      }
    },


    nodeunit : {
      /* https://github.com/gruntjs/grunt-contrib-nodeunit */
      tests : [ 'test/**/*Test.js' ],
    },


    uglify : {
      /* https://github.com/gruntjs/grunt-contrib-uglify */
      options : {
        mangle : false
      },
      phantomas : {
        files : {
          'tasks/public/scripts/phantomas.min.js' : [ 'tasks/assets/scripts/phantomas.js' ]
        }
      }
    },


    watch : {
      /* https://github.com/gruntjs/grunt-contrib-watch */
      js : {
        files   : [ 'tasks/assets/scripts/**/*.js' ],
        flatten : true,
        options : {
          spawn : false,
        },
        tasks   : [ 'uglify', 'copy:scripts' ]
      },
      sass : {
        files   : [ 'tasks/assets/sass/**/*.scss' ],
        flatten : true,
        options : {
          spawn : false,
        },
        tasks   : [ 'compass', 'copy:styles' ]
      }
    }
  } );

  // Actually load this plugin's task(s).
  grunt.loadTasks( 'tasks' );

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-contrib-compass' );
  grunt.loadNpmTasks( 'grunt-contrib-copy' );
  grunt.loadNpmTasks( 'grunt-jscs' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask( 'test', [ 'clean', 'nodeunit', 'jshint', 'jscs' ] );

  // By default, lint and run all tests.
  grunt.registerTask( 'default', [ 'test' ] );

  // Set up development environment
  grunt.registerTask( 'build', [ 'compass', 'uglify', 'phantomas' ] );

};
