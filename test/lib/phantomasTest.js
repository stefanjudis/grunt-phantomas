'use strict';

var fs        = require( 'fs' );
var grunt     = require( 'grunt' );
var Phantomas = require( '../../tasks/lib/phantomas' );
var Promise   = require( 'bluebird' );
var _         = require( 'lodash' );

var TEMP_PATH = './tmp/';


/**
 * Helper functions
 */

/**
 * Delete folder recursive
 * - unfortunately plain node has problems with that
 *
 * @param  {String} path path
 */
function deleteFolderRecursive ( path ) {
  var files = [];
  if( fs.existsSync(path) ) {
    files = fs.readdirSync( path );
    files.forEach( function( file ){
      var curPath = path + '/' + file;
      if( fs.statSync( curPath ).isDirectory() ) {
          deleteFolderRecursive( curPath );
      } else {
          fs.unlinkSync( curPath );
      }
    } );
    fs.rmdirSync( path );
  }
}


/**
 * Create a function that
 * will return a stubbed promise
 *
 * @param  {Object}  test     test
 * @param  {String}  name     function name
 * @param  {Boolean} testDone should test.done() be called
 *
 * @return {Function}         Function that will
 *                                     return stubbed promise
 */
function createStubPromise( test, name, testDone ){
  return function() {
    return new Promise( function( resolve ) {
      resolve();

      test.ok(true, name + ' was called!');

      if( testDone ) {
        test.done();
      }
    } );
  };
}


/**
 * Test suite for checking promises flow
 *
 * @type {Object}
 */
exports.phantomasPromisesFlow = {
  setUp: function( done ){
    // save stubs for reverting after test
    this.stubs = {
      createIndexDirectory           : Phantomas.prototype.createIndexDirectory,
      createDataDirectory            : Phantomas.prototype.createDataDirectory,
      executePhantomas               : Phantomas.prototype.executePhantomas,
      formResult                     : Phantomas.prototype.formResult,
      createDataJson                 : Phantomas.prototype.createDataJson,
      readMetricsFiles               : Phantomas.prototype.readMetricsFiles,
      outputUi                       : Phantomas.prototype.outputUi,
      createIndexHtml                : Phantomas.prototype.createIndexHtml,
      notifyAboutNotDisplayedMetrics : Phantomas.prototype.notifyAboutNotDisplayedMetrics,
      copyAssets                     : Phantomas.prototype.copyAssets,
      showSuccessMessage             : Phantomas.prototype.showSuccessMessage
    };

    done();
  },

  tearDown: function ( callback ) {
    // revert stubs to their original value
    _.each( this.stubs, function( val, key ) {
      Phantomas.prototype[ key ] = val;
    } );

    callback();
  },

  outputUi : {
    withUi : function( test ) {
      var options     = {
        indexPath : TEMP_PATH,
        buildUi   : true
      };
      var done = function() {};
      var phantomas = new Phantomas( grunt, options, done );

      // create stubs for Phantomas functions
      Phantomas.prototype.createIndexHtml                 = createStubPromise( test, 'createIndexHtml' );
      Phantomas.prototype.notifyAboutNotDisplayedMetrics  = createStubPromise( test, 'notifyAboutNotDisplayedMetrics' );
      Phantomas.prototype.copyAssets                      = createStubPromise( test, 'copyAssets', true );

      phantomas.outputUi();

      test.expect( 3 );
    },
    withoutUi : function( test ) {
      var options     = {
        indexPath : TEMP_PATH,
        buildUi   : false
      };
      var done = function() {};
      var phantomas = new Phantomas( grunt, options, done );

      // create stubs for Phantomas functions
      Phantomas.prototype.createIndexHtml                 = createStubPromise( test, 'createIndexHtml' );
      Phantomas.prototype.notifyAboutNotDisplayedMetrics  = createStubPromise( test, 'notifyAboutNotDisplayedMetrics' );
      Phantomas.prototype.copyAssets                      = createStubPromise( test, 'copyAssets' );

      // make sure none of the UI building
      // functions is called
      phantomas.outputUi()
                .then( function() {
                  test.expect( 0 );
                  test.done();
                } );

    }
  },


  kickOff : function( test ) {
    var options     = {
      indexPath : TEMP_PATH,
      buildUi   : true
    };
    var done = function() {};
    var phantomas = new Phantomas( grunt, options, done );

    // create stubs for Phantomas functions
    Phantomas.prototype.createIndexDirectory = createStubPromise( test, 'createIndexDirectory' );
    Phantomas.prototype.createDataDirectory  = createStubPromise( test, 'createDataDirectory' );
    Phantomas.prototype.executePhantomas     = createStubPromise( test, 'executePhantomas' );
    Phantomas.prototype.formResult           = createStubPromise( test, 'formResult' );
    Phantomas.prototype.createDataJson       = createStubPromise( test, 'createDataJson' );
    Phantomas.prototype.readMetricsFiles     = createStubPromise( test, 'readMetricsFiles' );
    Phantomas.prototype.outputUi             = createStubPromise( test, 'outputUi' );
    Phantomas.prototype.showSuccessMessage   = createStubPromise( test, 'showSuccessMessage', true );

    phantomas.kickOff();

    test.expect( 8 );
  }
};


/**
 * General unit test suite
 *
 * @type {Object}
 */
exports.phantomas = {
  setUp : function( done ) {
    // setup here if necessary
    fs.mkdirSync( TEMP_PATH );

    done();
  },

  tearDown: function ( callback ) {
    deleteFolderRecursive( TEMP_PATH );

    callback();
  },

  constructor : function( test ) {
    var options   = {
      indexPath : TEMP_PATH
    };
    var done      = function() {};
    var phantomas = new Phantomas( grunt, options, done );

    test.strictEqual( phantomas.grunt,    grunt );
    test.strictEqual( phantomas.options,  options );
    test.strictEqual( phantomas.done,     done );
    test.strictEqual( phantomas.dataPath, 'tmp/data/' );

    test.done();
  },


  copyScripts : function( test ) {
    var options     = {
      indexPath : TEMP_PATH
    };
    var done        = function() {};
    var phantomas   = new Phantomas( grunt, options, done );

    fs.mkdirSync( TEMP_PATH + 'public' );

    phantomas.copyScripts();

    test.strictEqual(
      fs.existsSync( TEMP_PATH + 'public/scripts/phantomas.min.js' ),
      true
    );

    test.strictEqual(
      fs.existsSync( TEMP_PATH + 'public/scripts/d3.min.js' ),
      true
    );

    test.done();
  },


  copyStyles : {
    withoutAdditionalStylesheet : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      fs.mkdirSync( TEMP_PATH + 'public' );

      phantomas.copyStyles();

      test.strictEqual(
        fs.existsSync( TEMP_PATH + 'public/styles/phantomas.css' ),
        true
      );

      test.strictEqual(
        fs.existsSync( TEMP_PATH + 'public/styles/custom.css' ),
        false
      );

      test.done();
    },
    withAdditionalStylesheet : {
      stylesheetExists : function( test ) {
        var options     = {
          additionalStylesheet : TEMP_PATH + 'foo.css',
          indexPath            : TEMP_PATH
        };
        var done        = function() {};
        var phantomas   = new Phantomas( grunt, options, done );

        fs.writeFileSync(
          TEMP_PATH +
          'foo.css', 'body { color : red !important; }'
        );
        fs.mkdirSync( TEMP_PATH + 'public' );

        phantomas.copyStyles();

        test.strictEqual(
          fs.existsSync( TEMP_PATH + 'public/styles/phantomas.css' ),
          true
        );

        test.strictEqual(
          fs.existsSync( TEMP_PATH + 'public/styles/custom.css' ),
          true
        );

        test.done();
      },
      stylesheetDoesNotExist : function( test ) {
        var options     = {
          additionalStylesheet : TEMP_PATH + 'foo.css',
          indexPath            : TEMP_PATH
        };
        var done        = function() {};
        var phantomas   = new Phantomas( grunt, options, done );

        fs.mkdirSync( TEMP_PATH + 'public' );

        phantomas.copyStyles();

        test.strictEqual(
          fs.existsSync( TEMP_PATH + 'public/styles/phantomas.css' ),
          true
        );

        test.strictEqual(
          fs.existsSync( TEMP_PATH + 'public/styles/custom.css' ),
          false
        );

        test.done();
      }
    }
  },


  createDataJson : {
    invalidData : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );
      var fileContent = {
        test : 'test'
      };

      fs.mkdirSync( TEMP_PATH + 'data' );

      phantomas.createDataJson( fileContent )
        .catch( function( e ) {
          test.strictEqual( e, 'No run was successful.' );

          test.done();

          deleteFolderRecursive( TEMP_PATH + 'data' );
        } );
    },
    validData : function( test ) {
      var options     = {
        indexPath : TEMP_PATH,
        buildUi   : true
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );
      var fileContent = {
        requests : {
          values : [ 1, 2, 3, 4 ]
        }
      };

      fs.mkdirSync( TEMP_PATH + 'data' );

      phantomas.createDataJson( fileContent )
        .then( function() {
          var files = fs.readdirSync( 'tmp/data/' );
          test.strictEqual( files.length, 1 );

          test.strictEqual(
            fs.readFileSync( './tmp/data/' + files[ 0 ], 'utf8' ),
            JSON.stringify( fileContent, null, 2 )
          );

          test.done();

          deleteFolderRecursive( TEMP_PATH + 'data' );
        } );
    }
  },


  createDataDirectory : {
    directoryDoesNotExist : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      phantomas.createDataDirectory()
        .then( function() {
          test.strictEqual( fs.existsSync( TEMP_PATH + '/data' ), true );
          test.done();
        } );
    },
    directoryExists : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      fs.mkdirSync( TEMP_PATH + 'data' );

      phantomas.createDataDirectory()
        .then( function() {
          test.strictEqual( fs.existsSync( TEMP_PATH + '/data' ), true );
          test.done();
        } );
    }
  },


  createIndexDirectory : {
    directoryDoesNotExist : function( test ) {
      var options     = {
        // check if recursive folder
        // creation works
        indexPath : TEMP_PATH + 'tmp/'
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      deleteFolderRecursive( TEMP_PATH );

      phantomas.createIndexDirectory()
        .then( function() {
          test.strictEqual( fs.existsSync( TEMP_PATH ), true );
          test.strictEqual( fs.existsSync( TEMP_PATH + 'tmp/' ), true );
          test.done();
        } );
    },
    directoryExists : function( test ) {
      var options     = {
        // check if recursive folder
        // creation works
        indexPath : TEMP_PATH + 'tmp/'
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      phantomas.createIndexDirectory()
        .then( function() {
          test.strictEqual( fs.existsSync( TEMP_PATH ), true );
          test.strictEqual( fs.existsSync( TEMP_PATH + 'tmp/' ), true );
          test.done();
        } );
    }
  },


  createIndexHtml : function( test ) {
    var options     = {
      indexPath : TEMP_PATH
    };
    var done        = function() {};
    var phantomas   = new Phantomas( grunt, options, done );
    var results     = [
      {
        isFulfilled : function() {
          return true;
        },
        value        : function() {
          return {
            test : 'test1', timestamp : 123456,
          };
        }
      },
      {
        isFulfilled : function() {
          return true;
        },
        value        : function() {
          return {
            test : 'test2', timestamp : 234567,
          };
        }
      },
      {
        isFulfilled : function() {
          return true;
        },
        value        : function() {
          return {
            test : 'test1', timestamp : 345678,
          };
        }
      },
    ];

    phantomas.createIndexHtml( results )
      .then( function() {
        var html = fs.readFileSync( TEMP_PATH + 'index.html', 'utf8' );

        test.strictEqual( fs.existsSync( TEMP_PATH + 'index.html' ), true );
        test.strictEqual(
          html.match( JSON.stringify( results ) ) instanceof Array,
          true
        );
        test.strictEqual(
          html.match( JSON.stringify( results ) ).length,
          1
        );

        test.done();
      } );
  },


  formResult : function( test ) {
    var options     = {
        url : 'http://test.com'
      };
    var done        = function() {};
    var phantomas   = new Phantomas( grunt, options, done );
    var metrics     = [
      {
        isFulfilled : function() {
          return true;
        },
        value : function() {
          return [ {
            metrics : {
              metricA       : 10,
              metricB       : 40,
              jQueryVersion : '1.9.1'
            }
          } ];
        }
      },
      {
        isFulfilled : function() {
          return true;
        },
        value : function() {
          return [ {
            metrics : {
              metricA       : 20,
              metricB       : 50,
              jQueryVersion : '1.9.1'
            }
          } ];
        }
      },
      {
        isFulfilled   : function() {
          return true;
        },
        value : function() {
          return [ {
            metrics : {
              metricA       : 30,
              metricB       : 60,
              jQueryVersion : '1.9.1'
            }
          } ];
        }
      },
      {
        isFulfilled   : function() {
          return false;
        },
        error : function() {
          return 'TIMEOUUUUUT';
        }
      }
    ];

    phantomas.formResult( metrics )
      .then( function( result ) {
        test.strictEqual( typeof result, 'object' );

        test.strictEqual( typeof result.metricA, 'object' );
        test.strictEqual(  result.metricA.sum,     60 );
        test.strictEqual(  result.metricA.min,     10 );
        test.strictEqual(  result.metricA.max,     30 );
        test.strictEqual(  result.metricA.median,  20 );
        test.strictEqual(  result.metricA.average, 20 );

        test.strictEqual( typeof result.metricB, 'object' );
        test.strictEqual(  result.metricB.sum,     150 );
        test.strictEqual(  result.metricB.min,     40 );
        test.strictEqual(  result.metricB.max,     60 );
        test.strictEqual(  result.metricB.median,  50 );
        test.strictEqual(  result.metricB.average, 50 );

        test.strictEqual( typeof result.jQueryVersion, 'undefined' );
        test.done();
      } );
  },


  readMetricsFile : {
    notValidJson : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );
      var fileContent = '{ "test": test" }';

      fs.mkdirSync( './tmp/data' );

      fs.writeFileSync( './tmp/data/123456.json', fileContent );

      phantomas.readMetricsFile( '123456.json' )
        .catch( Error, function( error ) {
          test.strictEqual( typeof error, 'object' );
          test.strictEqual(
            error.toString(),
            'SyntaxError: Unexpected token e'
          );

          test.done();
        } );
    },
    validJson : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );
      var fileContent = '{ "test": "test" }';

      fs.mkdirSync( './tmp/data' );

      fs.writeFileSync( './tmp/data/123456.json', fileContent );

      phantomas.readMetricsFile( '123456.json' )
        .then( function( data ) {
          test.strictEqual( typeof data,    'object' );
          test.strictEqual( data.test,      'test'   );
          test.strictEqual( data.timestamp, 123456   );

          test.done();
        } );
    }
  },


  readMetricsFiles : {
    allFilesOkay : function( test ) {
      var options      = {
        indexPath : TEMP_PATH
      };
      var done         = function() {};
      var phantomas    = new Phantomas( grunt, options, done );
      var fileContent1 = '{ "test": "test1" }';
      var fileContent2 = '{ "test": "test2" }';

      fs.mkdirSync( './tmp/data' );

      fs.writeFileSync( './tmp/data/123456.json', fileContent1 );
      fs.writeFileSync( './tmp/data/234567.json', fileContent2 );

      phantomas.readMetricsFiles()
        .then( function( results ) {
          test.strictEqual( results.length,         2 );
          test.strictEqual( results[ 0 ].isFulfilled(), true );
          test.strictEqual( typeof results[ 0 ].value(), 'object' );
          test.strictEqual( results[ 0 ].value().test,      'test1' );
          test.strictEqual( results[ 0 ].value().timestamp, 123456 );
          test.strictEqual( results[ 1 ].isFulfilled(), true );
          test.strictEqual( typeof results[ 1 ].value(),    'object' );
          test.strictEqual( results[ 1 ].value().test,      'test2' );
          test.strictEqual( results[ 1 ].value().timestamp, 234567 );

          test.done();
        } );
    },
    oneFileMalformed : function( test ) {
      var options      = {
        indexPath : TEMP_PATH
      };
      var done         = function() {};
      var phantomas    = new Phantomas( grunt, options, done );
      var fileContent1 = '{ "test": "test1" }';
      var fileContent2 = '{ "test": "test2",,,,, }';

      fs.mkdirSync( './tmp/data' );

      fs.writeFileSync( './tmp/data/123456.json', fileContent1 );
      fs.writeFileSync( './tmp/data/234567.json', fileContent2 );

      phantomas.readMetricsFiles()
        .then( function( results ) {
          test.strictEqual( results.length,         2 );
          test.strictEqual( results[ 0 ].isFulfilled(), true );
          test.strictEqual( typeof results[ 0 ].value(), 'object' );
          test.strictEqual( results[ 0 ].value().test,      'test1' );
          test.strictEqual( results[ 0 ].value().timestamp, 123456 );
          test.strictEqual( results[ 1 ].isFulfilled(), false );

          test.done();
        } );
    }
  },


  showSuccessMessage : function( test ) {
    var options         = {};
    var done            = function() {
      test.done();
    };
    var phantomas       = new Phantomas( grunt, options, done );

    phantomas.showSuccessMessage();
  }
};
