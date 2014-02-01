/*
 * grunt-phantomas
 * https://github.com/stefanjudis/grunt-phantomas
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

'use strict';

var Promise   = require( 'bluebird' );
var fs        = Promise.promisifyAll( require( 'node-fs' ) );
var path      = Promise.promisifyAll( require( 'path' ) );
var meta      = require( '../config/metricsMeta' );
var phantomas = require( 'phantomas' );
var _         = require('lodash');
var minify    = require( 'html-minifier' ).minify;


/**
 * Path to generated asset files
 * @type {String}
 */
var ASSETS_PATH = path.resolve(
                    __dirname, '../public/'
                  );


/**
 * Path to index template
 * @type {String}
 */
var TEMPLATE_FILE = path.resolve(
                      __dirname,
                      '../tpl/index.tpl'
                    );


/**
 * Constructor for Phantomas
 *
 * @param {Object}   grunt   grunt
 * @param {Object}   options options
 * @param {Function} done    callback to be called when everything is done
 *                           or an error appeared
 *
 * @tested
 */
var Phantomas = function( grunt, options, done ) {
  this.dataPath  = path.normalize(  options.indexPath + 'data/' );
  this.done      = done;
  this.grunt     = grunt;
  this.meta      = meta;
  this.options   = options;
  this.phantomas = Promise.promisify( phantomas );

  // quit if the phantomas version is too old
  if ( /(0\.12\.0|0\.11\..*|0\.10\..*)/.test( phantomas.version ) ) {
    this.grunt.log.error( 'YOUR PHANTOMAS VERSION IS OUTDATED.' );
    this.grunt.fail.fatal( 'PLEASE UPDATE TO AT LEAST 0.12.1.' );
  }
};


/**
 * Copy all needed assets from 'tasks/public'
 * to specified index path
 *
 * - phantomas.css
 */
Phantomas.prototype.copyAssets = function() {
  this.grunt.log.subhead( 'PHANTOMAS ASSETS COPYING STARTED.' );

  return new Promise( function( resolve ) {
    if ( !fs.existsSync( this.options.indexPath + '/public' ) ) {
      fs.mkdirSync( this.options.indexPath + '/public' );
    }

    this.copyStyles();
    this.copyScripts();

    resolve();
  }.bind( this ) );
};


/**
 * Copy script files and create needed folders
 *
 * - d3.min.js
 * - phantomas.min.js
 *
 * @tested
 */
Phantomas.prototype.copyScripts = function() {
  if ( !fs.existsSync( this.options.indexPath + '/public/scripts' ) ) {
    fs.mkdirSync( this.options.indexPath + '/public/scripts' );
  }

  var d3 = fs.readFileSync(
    path.normalize( ASSETS_PATH + '/scripts/d3.min.js' )
  );

  fs.writeFileSync(
    path.normalize( this.options.indexPath + '/public/scripts/d3.min.js' ),
    d3
  );

  this.grunt.log.ok(
    'Phantomas copied asset to \'' + this.options.indexPath + 'public/scripts/d3.min.js\'.'
  );

  var phantomas = fs.readFileSync(
    path.normalize( ASSETS_PATH + '/scripts/phantomas.min.js' )
  );

  fs.writeFileSync(
    path.normalize( this.options.indexPath + '/public/scripts/phantomas.min.js' ),
    phantomas
  );

  this.grunt.log.ok(
    'Phantomas copied asset to \'' + this.options.indexPath + 'public/scripts/phantomas.min.js\'.'
  );
};


/**
 * Copy styles file and create needed folders
 *
 * @tested
 */
Phantomas.prototype.copyStyles = function() {
  if ( !fs.existsSync( this.options.indexPath + '/public/styles' ) ) {
    fs.mkdirSync( this.options.indexPath + '/public/styles' );
  }

  var styles = fs.readFileSync(
    path.normalize( ASSETS_PATH + '/styles/phantomas.css' )
  );

  fs.writeFileSync(
    path.normalize( this.options.indexPath + '/public/styles/phantomas.css' ),
    styles
  );

  this.grunt.log.ok(
    'Phantomas copied asset to \'' + this.options.indexPath + 'public/styles/phantomas.css\'.'
  );

  if ( this.options.additionalStylesheet ) {
    if ( fs.existsSync( this.options.additionalStylesheet ) ) {
      fs.writeFileSync(
        path.normalize( this.options.indexPath + '/public/styles/custom.css' ),
        fs.readFileSync( this.options.additionalStylesheet )
      );

      this.grunt.log.ok(
        'Phantomas copied custom stylesheet to \'' +
        this.options.indexPath +
        'public/styles/custom.css\'.'
      );
    } else {
      this.grunt.log.error(
        'Your additional stylesheet \'' +
        this.options.additionalStylesheet +
        '\' does not exist.'
      );
    }
  }
};


/**
 * Write phantomas result to json file
 *
 * @param  {String}  result phantomas result
 * @return {Promise}        Promise
 *
 * @tested
 */
Phantomas.prototype.createDataJson = function( result ) {
  this.grunt.log.subhead( 'WRITING RESULT JSON FILE.' );

  return new Promise( function( resolve, reject ) {
    if (
      typeof result.requests !== 'undefined' &&
      result.requests.values.length
    ) {

      fs.writeFileAsync(
        this.dataPath + ( +new Date() ) + '.json',
        JSON.stringify( result, null, 2 )
      ).then( resolve );

      this.grunt.log.ok( 'JSON file written.' );
    } else {
      reject( 'No run was successful.' );
    }
  }.bind( this ) );
};


/**
 * Create data directory in index path
 * if it doesn't exist yet
 *
 * TODO -> put it together with 'createDataDirectory'
 *
 * @return {Promise} Promise
 *
 * @tested
 */
Phantomas.prototype.createDataDirectory = function() {
  return new Promise( function( resolve ) {
    var exists = fs.existsSync( this.dataPath );

    if ( exists ) {
      resolve();
    } else {
      fs.mkdirSync(
        path.normalize(
          this.options.indexPath + 'data'
        )
      );

      resolve();
    }
  }.bind( this ) );
};


/**
 * Create index directory to make sure
 * files are writable according to set
 * indexPath
 *
 * TODO -> put it together with 'createDataDirectory'
 *
 * @return {Promise} Promise
 *
 * @tested
 */
Phantomas.prototype.createIndexDirectory = function() {
  return new Promise( function( resolve ) {
    var exists = fs.existsSync( this.options.indexPath );
    if ( exists ) {
      resolve();
    } else {
      fs.mkdirSync(
        path.normalize(
          this.options.indexPath
        ),
        '0777',
        true
      );

      resolve();
    }
  }.bind( this ) );
};

/**
 * Write final index.html file and
 * handle all metrics
 *
 * @param  {Array}   files content of all metric files
 * @return {Promise}       Promise
 *
 * @tested
 */
Phantomas.prototype.createIndexHtml = function( results ) {
  return new Promise( function( resolve ) {
    this.grunt.log.subhead( 'PHANTOMAS index.html WRITING STARTED.' );

    var templateResults = [];

    // check if all files were valid json
    results.forEach( function( result ) {
      if ( result.isFulfilled() ) {
        templateResults.push( result.value() );
      }
    }.bind( this ) );

    this.grunt.file.write(
      this.options.indexPath + 'index.html',
      this.grunt.template.process(
        this.grunt.file.read( TEMPLATE_FILE ),
        { data : {
          additionalStylesheet : this.options.additionalStylesheet,
          group                : this.options.group,
          meta                 : this.meta,
          results              : templateResults,
          url                  : this.options.url
        } }
      )
    );

    this.grunt.log.ok(
      'Phantomas created new \'index.html\' at \'' + this.options.indexPath + '\'.'
    );

    this.grunt.file.write(
      this.options.indexPath + 'index.html',
      minify(
        this.grunt.file.read( this.options.indexPath + 'index.html' ),
        {
          removeComments     : true,
          collapseWhitespace : true
        }
      )
    );

    this.grunt.log.ok(
      'Phantomas made \'index.html\' at \'' + this.options.indexPath + '\' nice and small.'
    );

    resolve( templateResults );

  }.bind( this ) );
};



/**
 * Exectue phantomas a given number of times
 * ( set in options )
 *
 * @return {Promise} Promise that gets resolved when all
 *                           executions succeeded
 */
Phantomas.prototype.executePhantomas = function() {
  var runs = [];

  return new Promise( function( resolve ) {
    this.grunt.log.verbose.writeln(
      'Executing phantoms ( ' + this.options.numberOfRuns + ' times ) with following parameters:\n' +
      JSON.stringify( this.options.options )
    );

    for ( var i = 0; i < this.options.numberOfRuns; ++i ) {
      runs.push(
        this.phantomas(
          this.options.url,
          this.options.options
        )
      );
    }

    Promise.settle( runs )
          .then( resolve )
          .catch( function( e ) {
            console.log( e );
          } );
  }.bind( this ) );
};


/**
 * Format the results of phantomas execution
 * and calculate statistic data
 *
 * @param  {Array} metrics metrics
 * @return {Object}        formated metrics
 *
 * @tested
 */
Phantomas.prototype.formResult = function( results ) {
  this.grunt.log.ok( this.options.numberOfRuns + ' Phantomas execution(s) done -> checking results:' );
  return new Promise( function( resolve ) {
    var entries                = {},
        foundFullfilledPromise = false,
        entry,
        metric;

    // prepare entries
    for ( var i = 0; i < results.length && !foundFullfilledPromise; i++ ) {
      if ( results[ i ].isFulfilled() ) {
        // grep the first entries for the json result
        for ( metric in results[ i ].value()[ 0 ].metrics ) {
          if (
            typeof results[ i ].value()[ 0 ].metrics[ metric ] !== 'string' &&
            typeof results[ i ].value()[ 0 ].metrics[ metric ] !== 'undefined'
          ) {
            entries[ metric ] = {
              values  : [],
              sum     : 0,
              min     : 0,
              max     : 0,
              median  : undefined,
              average : undefined
            };
          }

          foundFullfilledPromise = true;
        }
      }
    }

    // process all runs
    results.forEach( function( promise ) {
      if ( promise.isFulfilled() ) {
        this.grunt.log.ok( 'Phantomas execution done.' );

        var promiseValue = promise.value()[ 0 ].metrics,
            metric;

        for ( metric in promiseValue ) {
          if (
            typeof promiseValue[ metric ] !== 'string' &&
            typeof entries[ metric ] !== 'undefined'
          ) {
            entries[ metric ].values.push( promiseValue[ metric ] );
          }
        }
      } else {
        this.grunt.log.error(
          'Phantomas execution not successful -> ' + promise.error()
        );
      }
    }.bind( this ) );

    /**
     * Avoiding deep nesting for 'calculate stats'
     *
     * @param  {Number}  element element
     * @return {Boolean}
     */
    function filterEntryValues( element ) {
      return element !== null;
    }

    /**
     * Avoiding deep nesting for 'calculate stats'
     *
     * @param  {Number} a value A
     * @param  {Number} b value B
     * @return {Number}   sorting value
     */
    function sortEntryValues ( a, b ) {
      return a - b;
    }

    // calculate stats
    for ( metric in entries ) {
            entry = entries[ metric ];

      if ( typeof entry.values[ 0 ] !== 'string' ) {
        entry.values = entry.values
                        .filter( filterEntryValues )
                        .sort( sortEntryValues );
      }

      if ( entry.values.length === 0 ) {
        continue;
      }

      entry.min = entry.values.slice( 0, 1 ).pop();
      entry.max = entry.values.slice( -1 ).pop();

      if ( typeof entry.values[ 0 ] === 'string' ) {
        continue;
      }

      for ( var j = 0, len = entry.values.length++; j<len; j++ ) {
        entry.sum += entry.values[ j ];
      }

      entry.average = + ( len && ( entry.sum / len ).toFixed( 2 ) );
      entry.median = + ( ( (len % 2 === 0) ?
                      ( ( entry.values[ len >> 1 ] + entry.values[ len >> 1 + 1 ] ) / 2 ) :
                      entry.values[ len >> 1 ] ).toFixed( 2 ) );
    }

    resolve( entries );
  }.bind( this ) );
};

/**
 * General function to start the whole thingy
 */
Phantomas.prototype.kickOff = function() {
  this.grunt.log.subhead( 'PHANTOMAS EXECUTION(S) STARTED.' );

  this.createIndexDirectory().bind( this )
      // create data directory to prevent
      // fileIO errors
      .then( this.createDataDirectory )
      // execute the phantomas process
      // multiple runs according to
      // configuration
      .then( this.executePhantomas )
      // format result and calculate
      // max / min / median / average / ...
      .then( this.formResult )
      // write new json file with metrics data
      .then( this.createDataJson )
      // read all created json metrics
      .then( this.readMetricsFiles )
      // write html file and produce
      // nice graphics
      .then( this.createIndexHtml )
      // check displayed options and
      // inform which one are not displayed
      // in the result index
      .then( this.notifyAboutNotDisplayedMetrics )
      // copy all asset files over to
      // wished index path
      .then( this.copyAssets )
      // yeah we're done :)
      .then( this.showSuccessMessage )
      // catch general bluebird error
      .catch( Promise.RejectionError, function ( e ) {
          console.error( 'unable to write file, because: ', e.message );
      } )
      // catch unknown error
      .catch( function( e ) {
        this.grunt.log.error( 'SOMETHING WENT WRONG...' );
        this.grunt.log.error( e );

        if ( e.stack ) {
          this.grunt.log.error( e.stack );
        }
        this.grunt.event.emit( 'phantomasFailure', e );
      }.bind( this ) )
      .done();
};


/**
 * Notify about not displayed metrics during
 * the build process
 *
 * @param  {Object} results results
 * @return {Promise}        Promise
 */
Phantomas.prototype.notifyAboutNotDisplayedMetrics = function( results ) {
  return new Promise( function( resolve ) {
    this.grunt.log.subhead( 'CHECKING FOR NOT DISPLAYED METRICS.' );

    var resultKeys          = _.keys( results[ 0 ] );
    var displayedMetricKeys = _.flatten( _.values( this.options.group ) );

    displayedMetricKeys.push( 'timestamp' );

    var notDisplayedMetrics = _.difference( resultKeys, displayedMetricKeys );

    this.grunt.log.ok(
      'You are currently not displaying the following metrics:\n' +
      notDisplayedMetrics.join( ', ' )
    );

    resolve();
  }.bind( this ) );
};


/**
 * Handle the path of a metrics file and read it
 *
 * @param  {String} file file path to metrics file
 * @return {Promise}     Promise
 *
 * @tested
 */
Phantomas.prototype.readMetricsFile = function( file ) {
  return new Promise( function( resolve, reject ) {
    fs.readFileAsync(
      this.dataPath + file,
      { encoding : 'utf8'}
    ).bind( this )
      .then( function( data ) {
        try {
          data = JSON.parse( data );
        } catch( e ) {
          // if it's not valid json
          // let's fail
          this.grunt.log.error(
            'Sorry - ' + this.dataPath + file + ' is malformed'
          );

          reject( e );
        }
        // set internal timestamp to work with it
        // on frontend side later on
        data.timestamp = +file.replace( /\.json/gi, '' );

        this.grunt.log.ok( '\'' + file + '\' looks good!' );

        resolve( data );
      }.bind( this ) );
  }.bind( this ) );
};


/**
 * Get data of all metrics files
 * included in data folder
 *
 * @return {Promise} Promise
 *
 * @tested
 */
Phantomas.prototype.readMetricsFiles = function() {
  return new Promise( function( resolve ) {
    this.grunt.log.subhead( 'CHECKING ALL WRITTEN FILES FOR VALID JSON.' );

    fs.readdirAsync( this.dataPath ).bind( this )
      .then( function( files ) {
        files = files.filter( function( file ) {
          return file.match( /\.json/gi );
        } );

        files = files.map( function( file ) {
            return this.readMetricsFile( file );
        }, this );

        Promise.settle( files ).bind( this )
          .then( resolve )
          .catch( function( e ) {
            console.log( e );
          } );
      } );
  }.bind( this ) );
};


/**
 * Show final message and call grunt task callback afterwards
 *
 * @tested
 */
Phantomas.prototype.showSuccessMessage = function() {
  this.grunt.log.subhead( 'FINISHED PHANTOMAS.' );

  this.done();
};

module.exports = Phantomas;
