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
 * Path to the Phantomas executable
 * @type {String}
 */
var PHANTOMAS_PATH = path.resolve(
                        __dirname, '../../node_modules/.bin/phantomas'
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
  this.grunt    = grunt;
  this.options  = options;
  this.done     = done;
  this.dataPath = path.normalize( this.options.indexPath + 'data/' );
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
      result
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
 */
Phantomas.prototype.createIndexHtml = function( files ) {
  return new Promise( function( resolve ) {
    this.grunt.log.subhead( 'PHANTOMAS index.html WRITING STARTED.' );

    this.grunt.file.write(
      this.options.indexPath + 'index.html',
      this.grunt.template.process(
        this.grunt.file.read( TEMPLATE_FILE ),
        { data : {
          results : files
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
 * Simple getter to build up command line
 * options for process spawn and to have it
 * on a clear place
 *
 * @tested
 */
Phantomas.prototype.getPhantomasProcessArguments = function() {
  return [
    '--url',
    this.options.url,
    '--format',
    'json'
  ].concat( this.options.raw );
};


/**
 * Handle the result of the given phantomas
 * process call and work with it
 *
 * - write json to disk to keep track of progress
 * - create index html
 *
 * @param  {String} result result
 */
Phantomas.prototype.handleData = function( result ) {
  // check if data directory already exists
  // if not create it
  this.createIndexDirectory().bind( this )
      .then( this.createDataDirectory )
      // write new json file with metrics data
      .then( function() {
        this.createDataJson( result );
      } )
      // write a new index.html with all data json
      // files injected
      .then( this.readMetricsFiles )
      // write html file and produce
      // nice graphics
      .then( this.createIndexHtml )
      // copy all asset files over to
      // wished index path
      .then( this.copyAssets )
      // yeah we're done
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
 * General function to start the whole thingy
 */
Phantomas.prototype.kickOff = function() {
  this.grunt.log.subhead( 'PHANTOMAS SYSTEM CALL STARTED' );

  this.grunt.log.verbose.writeln(
    'Executing phantoms with following parameters:\n' +
    this.getPhantomasProcessArguments().join( ' ' )
  );

  this.grunt.util.spawn( {
    cmd  : PHANTOMAS_PATH,
    args : this.getPhantomasProcessArguments()
  }, function( error, result ) {
    if ( error ) {
      this.grunt.fatal( error );
    }

    this.grunt.log.ok( 'Phantomas executation successful.');

    this.handleData( result );
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
