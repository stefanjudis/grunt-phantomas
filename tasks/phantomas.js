/*
 * grunt-phantomas
 * https://github.com/stefanjudis/grunt-phantomas
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function( grunt ) {
  grunt.registerMultiTask(
    'phantomas',
    'Get metrics of your site and compare them.',
    function() {
      var done      = this.async();
      var options   = this.options( {
        indexPath    : './phantomas/',
        numberOfRuns : 5,
        options      : {},
        url          : 'http://gruntjs.com/'
      } );
      var Phantomas = require(
                        './lib/phantomas'
                      );

      // let's kick things off
      var phantomas = new Phantomas( grunt, options, done );
      phantomas.kickOff();
    }
  );
};
