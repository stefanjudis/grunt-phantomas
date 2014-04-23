'use strict';

var fs        = require( 'fs' );
var grunt     = require( 'grunt' );
var Phantomas = require( '../../index' );
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
  if ( fs.existsSync(path) ) {
    files = fs.readdirSync( path );
    files.forEach( function( file ){
      var curPath = path + '/' + file;
      if ( fs.statSync( curPath ).isDirectory() ) {
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
 *
 * @return {Function}         Function that will
 *                                     return stubbed promise
 */
function createStubPromise( test, name ){
  return function() {
    return new Promise( function( resolve ) {
      test.ok( true, name + ' was called!' );
      resolve();
    } );
  };
}


/**
 * Test suite for checking promises flow
 *
 * @type {Object}
 */
exports.phantomasPromisesFlow = {
  setUp : function( done ){
    // save stubs for reverting after test
    this.stubs = {
      copyStyles                     : Phantomas.prototype.copyStyles,
      copyScripts                    : Phantomas.prototype.copyScripts,
      createIndexDirectory           : Phantomas.prototype.createIndexDirectory,
      createDataDirectory            : Phantomas.prototype.createDataDirectory,
      executePhantomas               : Phantomas.prototype.executePhantomas,
      formResult                     : Phantomas.prototype.formResult,
      writeData                      : Phantomas.prototype.writeData,
      processData                    : Phantomas.prototype.processData,
      readMetricsFiles               : Phantomas.prototype.readMetricsFiles,
      outputUi                       : Phantomas.prototype.outputUi,
      createIndexHtml                : Phantomas.prototype.createIndexHtml,
      notifyAboutNotDisplayedMetrics : Phantomas.prototype.notifyAboutNotDisplayedMetrics,
      copyAssets                     : Phantomas.prototype.copyAssets,
      showSuccessMessage             : Phantomas.prototype.showSuccessMessage
    };

    done();
  },

  tearDown : function ( callback ) {
    // revert stubs to their original value
    _.each( this.stubs, function( val, key ) {
      Phantomas.prototype[ key ] = val;
    } );

    deleteFolderRecursive( TEMP_PATH );

    callback();
  },


  copyAssets : {
    publicFolderExists : function( test ) {
      var options     = {
        buildUi   : true,
        indexPath : TEMP_PATH
      };
      var done = function() {};

      var phantomas = new Phantomas( grunt, options, done );

      fs.mkdirSync( TEMP_PATH );
      fs.mkdirSync( TEMP_PATH + '/public' );

      Phantomas.prototype.copyScripts = createStubPromise( test, 'copyScripts' );
      Phantomas.prototype.copyStyles  = createStubPromise( test, 'copyStyles' );

      phantomas.copyAssets()
                .then( function() {
                  test.expect( 2 );
                  test.done();
                } );
    },

    publicFolderDoesNotExist : function( test ) {
      var options     = {
        buildUi   : true,
        indexPath : TEMP_PATH
      };
      var done = function() {};

      var phantomas = new Phantomas( grunt, options, done );
      var mkdirSync = fs.mkdirSync;

      fs.mkdirSync( TEMP_PATH );

      Phantomas.prototype.copyScripts = createStubPromise( test, 'copyScripts' );
      Phantomas.prototype.copyStyles  = createStubPromise( test, 'copyStyles' );

      fs.mkdirSync = function() {
        test.ok( true, 'fs.mkdirSync was called!' );
      };

      phantomas.copyAssets()
                .then( function() {
                  test.expect( 3 );

                  fs.mkdirSync = mkdirSync;

                  test.done();
                } );
    }
  },


  kickOff : function( test ) {
    var options     = {
      buildUi   : true,
      indexPath : TEMP_PATH
    };
    var done = function() {
      test.expect( 6 );
      test.done();
    };

    var results = {
        requests : {
          values : [ 1, 2, 3, 4 ]
        }
      };

    // stubbing form result here as it needs to use a fake results object
    Phantomas.prototype.formResult = function(){
      return new Promise( function( resolve ) {
        resolve( results );
        test.ok( true, 'formResult was called!' );
      } );
    };

    var phantomas = new Phantomas( grunt, options, done );

    // create stubs for Phantomas functions
    Phantomas.prototype.createIndexDirectory = createStubPromise( test, 'createIndexDirectory' );
    Phantomas.prototype.createDataDirectory  = createStubPromise( test, 'createDataDirectory' );
    Phantomas.prototype.executePhantomas     = createStubPromise( test, 'executePhantomas' );
    Phantomas.prototype.writeData            = createStubPromise( test, 'writeData' );
    Phantomas.prototype.processData          = createStubPromise( test, 'processData' );

    phantomas.kickOff();
  },


  processData : {
    withUI : {
      jsonIsNotSet : function( test ) {
        var options     = {
          indexPath : TEMP_PATH,
          buildUi   : true,
          output    : 'whatever'
        };
        var done = function() {};
        var phantomas = new Phantomas( grunt, options, done );

        // create stubs for Phantomas functions
        Phantomas.prototype.readMetricsFiles = createStubPromise( test, 'readMetricsFiles' );
        Phantomas.prototype.outputUi         = createStubPromise( test, 'outputUi' );

        phantomas.processData()
                  .catch( function( e ) {
                    test.strictEqual(
                      e,
                      'Please set \'output\' to \'json\' if you want to build UI\n\n' +
                      '-- or --\n\n' +
                      'set \'buildUi\' to \'false\' if you want to get only the csv files.'
                    );
                    test.expect( 1 );
                    test.done();
                  } );
      },
      jsonIsSet : function( test ) {
        var options     = {
          indexPath : TEMP_PATH,
          buildUi   : true,
          output    : 'json'
        };
        var done = function() {};
        var phantomas = new Phantomas( grunt, options, done );

        // create stubs for Phantomas functions
        Phantomas.prototype.readMetricsFiles = createStubPromise( test, 'readMetricsFiles' );
        Phantomas.prototype.outputUi         = createStubPromise( test, 'outputUi' );

        phantomas.processData()
                  .then( function() {
                    test.expect( 2 );
                    test.done();
                  } );
      },
    },
    withoutUi : function( test ) {
      var options     = {
        indexPath : TEMP_PATH,
        buildUi   : false,
        output    : 'json'
      };
      var done = function() {};
      var phantomas = new Phantomas( grunt, options, done );

      // create stubs for Phantomas functions
      Phantomas.prototype.readMetricsFiles = createStubPromise( test, 'readMetricsFiles' );
      Phantomas.prototype.outputUi         = createStubPromise( test, 'outputUi' );

      phantomas.processData()
                .then( function() {
                  test.expect( 0 );
                  test.done();
                } );
    }
  },


  outputUi : function( test ) {
    var options     = {
      indexPath : TEMP_PATH,
      buildUi   : true
    };
    var done = function() {};
    var phantomas = new Phantomas( grunt, options, done );

    // create stubs for Phantomas functions
    Phantomas.prototype.createIndexHtml                 = createStubPromise( test, 'createIndexHtml' );
    Phantomas.prototype.notifyAboutNotDisplayedMetrics  = createStubPromise( test, 'notifyAboutNotDisplayedMetrics' );
    Phantomas.prototype.copyAssets                      = createStubPromise( test, 'copyAssets' );

    phantomas.outputUi()
              .then( function() {
                test.expect( 3 );
                test.done();
              } );

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

  tearDown : function ( callback ) {
    deleteFolderRecursive( TEMP_PATH );

    callback();
  },

  constructor : function( test ) {
    var options   = {
      indexPath : TEMP_PATH,
      buildUi   : false
    };
    var done      = function() {};
    var phantomas = new Phantomas( grunt, options, done );

    test.strictEqual( phantomas.dataPath,  'tmp/data/' );
    test.strictEqual( phantomas.done,      done );
    test.strictEqual( phantomas.grunt,     grunt );
    test.strictEqual( phantomas.imagePath, 'tmp/images/' );
    test.strictEqual( phantomas.options,   options );
    test.strictEqual( phantomas.buildUi,   false );

    test.strictEqual( typeof phantomas.timestamp,  'number' );

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


  executePhantomas : {
    withoutErrors : function( test ) {
      var options     = {
        url          : 'http://whatever.com',
        numberOfRuns : 5,
        options      : {}
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      var count             = 0;
      var filmStripCount    = 0;
      var filmStripDirCount = 0;

      // mock phantomas execution
      phantomas.phantomas = function( url, options ) {

        return new Promise( function( resolve ) {
          test.strictEqual( url , 'http://whatever.com' );

          test.strictEqual( typeof options, 'object' );

          count++;

          if ( options[ 'film-strip' ] ) {
            filmStripCount++;
          }

          if ( options[ 'film-strip-dir' ] ) {
            filmStripDirCount++;
          }
          setTimeout( function() {
            resolve();
          }, 500 );
        } );
      };

      phantomas.executePhantomas()
                .then( function() {
                  test.strictEqual( filmStripCount,    1 );
                  test.strictEqual( filmStripDirCount, 1 );
                  test.strictEqual( count,             5 );

                  test.done();
                } );
    },
    withErrors : function( test ) {
      var options     = {};
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      // mock phantomas execution
      phantomas.phantomas = function() {
        return new Promise( function() {
          throw new Error( 'Error!' );
        } );
      };

      phantomas.executePhantomas()
                .then( function( results ) {
                  test.strictEqual( results.length, 0 );
                  test.done();
                } );
    }
  },


  getImages : {
    imagesExist : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      phantomas.timestamp = 123456;

      fs.mkdirSync( './tmp/images' );
      fs.mkdirSync( './tmp/images/123456' );

      fs.writeFileSync( './tmp/images/123456/screenshot-1234-22.png',   'foo' );
      fs.writeFileSync( './tmp/images/123456/screenshot-1234-33.png',   'bar' );
      fs.writeFileSync( './tmp/images/123456/screenshot-1234-1133.png', 'baz' );

      var images = phantomas.getImages();

      test.strictEqual( images instanceof Array, true );

      test.strictEqual( images.length, 3 );

      test.strictEqual( images[ 0 ], 'screenshot-1234-22.png' );
      test.strictEqual( images[ 1 ], 'screenshot-1234-33.png' );
      test.strictEqual( images[ 2 ], 'screenshot-1234-1133.png' );

      test.done();
    },
    imagesDoesntExist : function( test ) {
      var options     = {};
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      var images = phantomas.getImages();

      test.strictEqual( images instanceof Array, true );

      test.strictEqual( images.length, 0 );

      test.done();
    }
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
            metrics   : {
              metricA       : 10,
              metricB       : 40,
              jQueryVersion : '1.9.1'
            },
            offenders : {
              foo : 'bar'
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
            metrics   : {
              metricA       : 20,
              metricB       : 50,
              jQueryVersion : '1.9.1'
            },
            offenders : {
              foo : 'baz'
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
            metrics   : {
              metricA       : 30,
              metricB       : 60,
              jQueryVersion : '1.9.1'
            },
            offenders : {
              foo : 'bar'
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

        test.strictEqual( typeof result.metrics.metricA, 'object' );
        test.strictEqual( result.metrics.metricA.sum,     60 );
        test.strictEqual( result.metrics.metricA.min,     10 );
        test.strictEqual( result.metrics.metricA.max,     30 );
        test.strictEqual( result.metrics.metricA.median,  20 );
        test.strictEqual( result.metrics.metricA.average, 20 );

        test.strictEqual( typeof result.metrics.metricB, 'object' );
        test.strictEqual( result.metrics.metricB.sum,     150 );
        test.strictEqual( result.metrics.metricB.min,     40 );
        test.strictEqual( result.metrics.metricB.max,     60 );
        test.strictEqual( result.metrics.metricB.median,  50 );
        test.strictEqual( result.metrics.metricB.average, 50 );

        test.strictEqual( typeof result.offenders, 'object' );
        test.strictEqual( result.offenders.foo instanceof Array, true );
        test.strictEqual( result.offenders.foo.length, 2 );
        test.strictEqual( result.offenders.foo[ 0 ], 'bar' );
        test.strictEqual( result.offenders.foo[ 1 ], 'baz' );

        test.strictEqual( typeof result.jQueryVersion, 'undefined' );
        test.done();
      } );
  },


  notifyAboutNotDisplayedMetrics : function( test ) {
    var options     = {
      indexPath : TEMP_PATH,
      group     : {
        foo : [
          'baz'
        ]
      }
    };
    var done        = function() {};
    var phantomas   = new Phantomas( grunt, options, done );
    var log         = grunt.log.ok;
    var results     = [
      {
        metrics : {
          bar   : 'whatever',
          baz   : 'whatever',
          boing : 'whatver '
        }
      }
    ];

    grunt.log.ok = function( msg ) {
      test.strictEqual(
        msg,
        'You are currently not displaying the following metrics:\nbar, boing'
      );
    };

    phantomas.notifyAboutNotDisplayedMetrics( results )
              .then( function() {
                grunt.log.ok = log;

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
  },


  writeData : {
    invalidData : function( test ) {
      var options   = {
        indexPath : TEMP_PATH,
        buildUi   : false
      };
      var done = function() {};
      var phantomas = new Phantomas( grunt, options, done );
      var result    = {
        metrics : {}
      };

      phantomas.writeData( result )
                .catch( function( e ) {
                  test.strictEqual( e, 'No run was successful.' );
                  test.done();
                } );
    },
    validData : {
      invalidDataFormat : function( test ) {
        var options   = {
          buildUi   : false,
          indexPath : TEMP_PATH,
          output    : 'invalidFormat'
        };
        var done = function() {};
        var phantomas = new Phantomas( grunt, options, done );
        var result    = {
          metrics : {
            requests : {
              values : [ 1 ]
            }
          }
        };

        test.throws(
          function() {
            phantomas.writeData( result );
          },
          Error,
          'Your set ouput format is not supported.\n' +
          'PLEASE CHECK DOCUMENTATION FOR SUPPORTED FORMATS.'
        );
        test.done();
      },
      validDataFormat : function( test ) {
        var options   = {
          buildUi   : false,
          indexPath : TEMP_PATH,
          output    : 'validFormat'
        };
        var done = function() {};
        var phantomas = new Phantomas( grunt, options, done );
        var result    = {
          metrics : {
            requests : {
              values : [ 1 ]
            }
          }
        };

        // stub the valid data forma
        phantomas._writeData.validFormat = function() {
          return new Promise( function() {});
        };

        var returnedPromise = phantomas.writeData( result );

        test.strictEqual( typeof returnedPromise, 'object' );
        test.strictEqual( returnedPromise instanceof Promise, true );
        test.done();
      }
    }
  },


  _writeData : {
    csv : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );
      var fileContent = {
        metrics : {
          requests : {
            values : [ 1, 2, 3, 4 ]
          }
        }
      };

      fs.mkdirSync( TEMP_PATH + 'data' );

      phantomas._writeData.csv.bind( phantomas )( fileContent )
        .then( function() {
          var files = fs.readdirSync( 'tmp/data/' );

          test.strictEqual( files.length, 1 );
          test.done();

          deleteFolderRecursive( TEMP_PATH + 'data' );
        } );
    },
    json : function( test ) {
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

      phantomas._writeData.json.bind( phantomas )( fileContent )
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
  }
};
