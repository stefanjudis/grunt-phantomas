/*
 * grunt-phantomas
 * https://github.com/stefanjudis/grunt-phantomas
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

'use strict';

var Promise = require( 'bluebird' );
var fs      = Promise.promisifyAll( require( 'fs' ) );
var path    = Promise.promisifyAll( require( 'path' ) );

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
  this.options   = options;
  this.phantomas = Promise.promisify( require( 'phantomas' ) );
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
  return new Promise( function( resolve ) {
    fs.writeFileAsync(
      this.dataPath + ( +new Date() ) + '.json',
      JSON.stringify( result )
    )
      .then( resolve );
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
        )
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

    this.grunt.file.write(
      this.options.indexPath + 'index.html',
      this.grunt.template.process(
        this.grunt.file.read( TEMPLATE_FILE ),
        { data : {
          results : results,
          url     : this.options.url
        } }
      )
    );

    this.grunt.log.ok(
      'Phantomas created new \'index.html\' at \'' + this.options.indexPath + '\'.'
    );

    resolve();

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
        ).then( function( result ) {
          this.grunt.log.ok( 'Phantomas execution successful.');

          return result.metrics;
        }.bind( this ) )
      );
    }

    Promise.all( runs )
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
Phantomas.prototype.formResult = function( metrics ) {
  return new Promise( function( resolve ) {
    var entries = {},
        entry,
        metric;

    // prepare entries
    for( metric in metrics[ 0 ] ) {
      if ( metric !== 'jQueryVersion' ) {
        entries[metric] = {
          values  : [],
          sum     : 0,
          min     : 0,
          max     : 0,
          median  : undefined,
          average : undefined
        };
      }
    }

    // process all runs
    metrics.forEach( function( data ) {
      var metric;
      for ( metric in data ) {
        if ( metric !== 'jQueryVersion' ) {
          entries[ metric ].values.push( data[ metric ] );
        }
      }
    } );

    // calculate stats
    for ( metric in entries ) {
            entry = entries[ metric ];

      if ( typeof entry.values[ 0 ] === 'string' ) {
              // don't sort metric with string value
      } else {
        entry.values = entry.values
                        .filter( function( element ) {
                          return element !== null;
                        } )
                        .sort( function ( a, b ) {
                          return a - b;
                        } );
      }

      if ( entry.values.length === 0 ) {
        continue;
      }

      entry.min = entry.values.slice( 0, 1 ).pop();
      entry.max = entry.values.slice( -1 ).pop();

      if ( typeof entry.values[ 0 ] === 'string' ) {
        continue;
      }

      for ( var i = 0, len = entry.values.length++; i<len; i++ ) {
        entry.sum += entry.values[ i ];
      }

      entry.average = + ( len && ( entry.sum / len ).toFixed( 2 ) );
      entry.median = + ( ( (len % 2 === 0) ?
                      ( ( entry.values[ len >> 1 ] + entry.values[ len >> 1 + 1 ] ) / 2 ) :
                      entry.values[ len >> 1 ] ).toFixed( 2 ) );
    }

    resolve( entries );
  } );
};

/**
 * General function to start the whole thingy
 */
Phantomas.prototype.kickOff = function() {
  this.grunt.log.subhead( 'PHANTOMAS SYSTEM CALL STARTED' );

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
        console.log( ':/' );
        console.log( e );
      } )
      .done();
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
          reject( e );
        }
        // set internal timestamp to work with it
        // on frontend side later on
        data.timestamp = +file.replace( /\.json/gi, '' );

        resolve( data );
      } );
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
    fs.readdirAsync( this.dataPath ).bind( this )
      .then( function( files ) {
        files = files.filter( function( file ) {
          return file.match( /\.json/gi );
        } );

        files = files.map( function( file ) {
            return this.readMetricsFile( file );
        }, this );

        Promise.all( files ).bind( this )
          .then( resolve );
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
