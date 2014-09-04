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
var json2csv  = Promise.promisify( require( 'json2csv' ) );
var phantomas = require( 'phantomas' );
var _         = require( 'lodash' );
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
  this.dataPath         = path.normalize(  options.indexPath + 'data/' );
  this.done             = done;
  this.failedAssertions = [];
  this.grunt            = grunt;
  this.imagePath        = path.normalize( options.indexPath + 'images/' );
  this.options          = options;
  this.timestamp        = +new Date();
  this.buildUi          = options.buildUi;
};


/**
 * Copy all needed assets from 'tasks/public'
 * to specified index path
 *
 * - phantomas.css
 * - phantomas.js
 *
 * @tested
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
 * Write final index.html file and handle all metrics
 *
 * @param  {Array}  results content of all metric files
 * @return {Promise}        Promise
 *
 * @tested
 */
Phantomas.prototype.createIndexHtml = function( results ) {
  return new Promise( function( resolve ) {
    this.grunt.log.subhead( 'PHANTOMAS index.html WRITING STARTED.' );

    var templateResults  = [];
    var images           = this.getImages();

    // check if all files were valid json
    results.forEach( function( result ) {
      if ( result.isFulfilled() ) {
        templateResults.push( result.value() );
      }
    }.bind( this ) );

    this.grunt.file.write(
      this.options.indexPath + 'index.html',
      this.grunt.template.process(
        minify(
          this.grunt.file.read( TEMPLATE_FILE ),
          {
            removeComments     : true,
            // TODO fix me
            // https://github.com/stefanjudis/grunt-phantomas/issues/93
            collapseWhitespace : true
          }
        ),
        { data : {
          additionalStylesheet : this.options.additionalStylesheet,
          assertions           : this.options.assertions,
          failedAssertions     : this.failedAssertions,
          group                : this.options.group,
          images               : images,
          meta                 : phantomas.metadata.metrics,
          results              : templateResults,
          timestamp            : this.timestamp,
          url                  : this.options.url
        } }
      )
    );

    this.grunt.log.ok(
      'Phantomas created new \'index.html\' at \'' + this.options.indexPath + '\'.'
    );

    resolve( templateResults );

  }.bind( this ) );
};


/**
 * Execute phantomas a given number of times
 * ( set in options )
 *
 * @return {Promise} Promise that gets resolved when all
 *                           executions succeeded
 *
 * @tested
 */
Phantomas.prototype.executePhantomas = function() {
  var runs = [];

  return new Promise( function( resolve ) {
    var options;

    this.grunt.log.verbose.writeln(
      'Executing phantomas ( ' + this.options.numberOfRuns + ' times ) with following parameters:\n' +
      JSON.stringify( this.options.options )
    );

    for ( var i = 0; i < this.options.numberOfRuns; ++i ) {
      options = _.clone( this.options.options );

      // run it only for the first run
      if ( i === 0 && options[ 'film-strip' ] !== false ) {
        options[ 'film-strip' ]     = true;
        options[ 'film-strip-dir' ] = this.imagePath + this.timestamp;
      }

      runs.push(
        phantomas(
          this.options.url,
          options
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
 * @param  {Array} results results
 * @return {Object}        formated metrics
 *
 * @tested
 */
Phantomas.prototype.formResult = function( results ) {
  this.grunt.log.ok( this.options.numberOfRuns + ' Phantomas execution(s) done -> checking results:' );
  return new Promise( function( resolve ) {
    var assertions       = _.reduce( this.options.assertions, function( result, num, key ) {
          result[ key ] = {
            value  : num
          };

          return result;
        }, {} ),
        entries          = {},
        offenders        = {},
        fulfilledPromise = _.filter( results, function( promise ) {
          return promise.isFulfilled();
        } ),
        fulFilledMetrics = fulfilledPromise.length && fulfilledPromise[ 0 ].value().json.metrics,
        entry,
        metric;

    _.each( fulFilledMetrics, function( value, key ) {
      if (
        typeof value !== 'undefined' &&
        typeof value !== 'string'
      ) {
        entries[ key ] = {
          values  : [],
          sum     : 0,
          min     : 0,
          max     : 0,
          median  : undefined,
          average : undefined
        };
      }
    } );

    // process all runs
    _.each( results, function( promise ) {
      if ( promise.isFulfilled() ) {
        this.grunt.log.ok( 'Phantomas execution successful.' );

        var promiseValue = promise.value(),
            metric;

        for ( metric in promiseValue.json.metrics ) {
          if (
            typeof promiseValue.json.metrics[ metric ] !== 'string' &&
            typeof entries[ metric ] !== 'undefined'
          ) {
            entries[ metric ].values.push( promiseValue.json.metrics[ metric ] );
          }
        }

        offenders = _.reduce( promiseValue.json.offenders, function( old, value, key ) {
          old[ key ] = _.uniq( ( old[ key ] || [] ).concat( value ) );

          return old;
        }, offenders );
      } else {
        this.grunt.log.error(
          'Phantomas execution not successful -> ' + promise.error()
        );
      }
    }, this );

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

      // pushed failed assertion
      // depending on median
      // to failedAssertions sum up
      if (
        this.options.assertions[ metric ] &&
        entry.median > this.options.assertions[ metric ] &&
        _.indexOf( this.failedAssertions, metric ) === -1
      ) {
        this.failedAssertions.push( metric );
      }
    }

    resolve( {
      assertions       : assertions,
      metrics          : entries,
      offenders        : offenders
    } );
  }.bind( this ) );
};


/**
 * Get array of image paths
 *
 * @return {Array} Array of image paths
 */
Phantomas.prototype.getImages = function() {
  var files;

  try {
    files = fs.readdirSync( this.imagePath + '/' + this.timestamp );
  } catch( e ) {
    this.grunt.log.error( 'NO IMAGES FOR FILM STRIP VIEW FOUND' );
    files = [];
  }

  return _.sortBy( files, _.bind( function( file ) {
    return +file.match(
      /^screenshot-\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d-(\d*).png$/
    )[ 1 ];
  }, this ) );
};


/**
 * General function to start the whole thingy
 *
 * @tested
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
      // write new file(s) with metrics data
      .then( this.writeData )
      // process data and generate
      // ui if wanted
      .then( this.processData )
      // yeah we're done!!! :)
      .then( this.showSuccessMessage )
      // catch general bluebird error
      .catch( Promise.RejectionError, function ( e ) {
          console.error( 'unable to write file, because: ', e.message );
      } )
      // catch unknown error
      .catch( function( e ) {
        this.grunt.log.error( 'SOMETHING WENT WRONG...' );

        if ( e.stack ) {
          this.grunt.log.error( e.stack );
        } else {
          this.grunt.log.error( e );
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
 *
 * @tested
 */
Phantomas.prototype.notifyAboutNotDisplayedMetrics = function( results ) {
  return new Promise( function( resolve ) {
    this.grunt.log.subhead( 'CHECKING FOR NOT DISPLAYED METRICS.' );

    var resultKeys          = _.keys( results[ results.length - 1 ].metrics );
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
 * Process data and build UI if wished
 *
 * @return {Promise} Promise
 *
 * @tested
 */
Phantomas.prototype.processData = function() {
  return new Promise( function( resolve, reject ) {
    if ( this.options.buildUi ) {
      if ( _.indexOf( this.options.output, 'json' ) !== -1 ) {
        // read all generated metric files
        // and prepare them for ui generation
        this.readMetricsFiles().bind( this )
            // generate index.html
            .then( this.outputUi )
            // resolve everything to go on
            .then( resolve );
      } else {
        this.grunt.log.error(
          'Your set ouput format is not compatible with building the UI.'
        );

        reject(
          'Please set \'output\' to \'json\' if you want to build UI\n\n' +
          '-- or --\n\n' +
          'set \'buildUi\' to \'false\' if you want to get only the csv files.'
        );
      }
    } else {
      resolve();
    }
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
      { encoding : 'utf8' }
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

        // provide backwards compability
        // if no offenders data is present
        if ( !data.offenders ) {
          data.offenders = {};
          data.metrics = JSON.parse( JSON.stringify( data ) );
        }

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
 * Generate UI files if wished including creating index.html,
 * copying assets and so
 *
 * Do nothing if 'this.buildUI' is falsy
 *
 * @param  {Array}   files files
 * @return {Promise}       Promise
 *
 * @tested
 */
Phantomas.prototype.outputUi = function( files ) {
  this.grunt.log.subhead( 'BUILDING THE UI TO DISPLAY YOUR DATA.' );

  return new Promise( function( resolve, reject ) {
     this.createIndexHtml( files ).bind( this )
         .then( this.notifyAboutNotDisplayedMetrics )
         .then( this.copyAssets )
         .then( resolve )
         .catch( function( e ) {
              reject( e );
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


/**
 * Create json or csv data
 *
 * @param  {Object}  result phantomas result
 * @return {Promise}        Promise
 *
 * @tested
 */
Phantomas.prototype.writeData = function( result ) {
  this.grunt.log.subhead( 'WRITING RESULT FILES.' );

  var runs = [];

  return new Promise( function( resolve, reject ) {
    if (
      typeof result.metrics.requests !== 'undefined' &&
      result.metrics.requests.values.length
    ) {
      // keep backwards compatibility
      // to not break existant configurations
      if ( typeof this.options.output === 'string' ) {
        this.options.output = [ this.options.output ];
      }

      // iterate of output formats
      // and write data
      _.each( this.options.output, function( format ) {
        if ( this._writeData[ format ] !== undefined ) {
          runs.push(
            this._writeData[ format ].bind( this )( result )
          );
        } else {
          reject(
            'Your set ouput format \'' + format + '\' is not supported.\n' +
            'PLEASE CHECK DOCUMENTATION FOR SUPPORTED FORMATS.'
          );
        }
      }, this );

      Promise.settle( runs )
          .then( resolve );
    } else {
      reject( 'No run was successful.' );
    }
  }.bind( this ) );
};


/**
 * Object holding function to generate
 * several data formats
 *
 * @type {Object}
 */
Phantomas.prototype._writeData = {
  /**
   * Create CSV with generated data
   *
   * @param  {Object} result result
   * @return {Promise}       Promise
   *
   * @tested
   */
  csv  : function( result ) {
    return new Promise( function( resolve, reject ) {
      var displayedMetricKeys = _.keys( result.metrics );
      var metrics             = {};

      _.each( result.metrics, function( value, key ){
        metrics[ key ] = result.metrics[ key ].average;
      } );

      json2csv( { data : result.metrics, fields : displayedMetricKeys } )
        .then( function( csv ) {
          var fileName = this.dataPath + this.timestamp + '.csv';

          fs.writeFileAsync(
            fileName,
            csv
          ).then( resolve );

          this.grunt.log.ok( 'CSV file - ' + fileName  + ' - written.' );
        }.bind( this ) )
        .catch( function( e ) {
          reject( e );
        } );
    }.bind( this ) );
  },


  /**
   * Create JSON with generated data
   *
   * @param  {Object} result result
   * @return {Promise}       Promise
   *
   * @tested
   */
  json : function( result ) {
    return new Promise( function( resolve, reject ) {
      var fileName = this.dataPath + this.timestamp + '.json';

      fs.writeFileAsync(
        fileName,
        JSON.stringify( result, null, 2 )
      )
      .then( resolve )
      .catch( reject );

      this.grunt.log.ok( 'JSON file - ' + fileName + ' - written.' );
    }.bind( this ) );
  }
};

module.exports = Phantomas;
