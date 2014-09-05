# grunt-phantomas

[![Build Status](http://img.shields.io/travis/stefanjudis/grunt-phantomas.svg?style=flat)](https://travis-ci.org/stefanjudis/grunt-phantomas) [![bnpm version](http://img.shields.io/npm/v/grunt-phantomas.svg?style=flat)](https://www.npmjs.org/package/grunt-phantomas) [![npm downloads](http://img.shields.io/npm/dm/grunt-phantomas.svg?style=flat)](https://www.npmjs.org/package/grunt-phantomas) [![Dependency Status](http://img.shields.io/gemnasium/stefanjudis/grunt-phantomas.svg?style=flat)](https://gemnasium.com/stefanjudis/grunt-phantomas) [![Coverage Status](http://img.shields.io/coveralls/stefanjudis/grunt-phantomas.svg?style=flat)](https://coveralls.io/r/stefanjudis/grunt-phantomas?branch=master) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

> Grunt plugin for phantomas

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-phantomas --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-phantomas');
```

## The "phantomas" task
You're looking for a tool that gives you detailed metrics about your site? Great!!!
This grunt plugin executes [phantomas](https://github.com/macbre/phantomas) for you and visualizes the returned metrics in a generated `index.html` for you. It will keep track of history, so that you can set it up and check reports after every deployment of your site. Read [below](#tracking-history-in-ci) to learn how to setup history tracking in different CI systems.

Examples of rendered output:
- metrics for [http://gruntjs.com](http://gruntjs.com) -> [here](http://stefanjudis.github.io/grunt-phantomas/gruntjs/)
- metrics for [example site](http://stefanjudis.github.io/phantomas-custom-metrics-tryout/) including custom metrics -> [here](http://stefanjudis.github.io/phantomas-custom-metrics-tryout/metrics/)

*I'm still at early stage, but I think you can already work with it.* ;)

### Overview
In your project's Gruntfile, add a section named `phantomas` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig( {
  phantomas: {
    gruntSite : {
      options : {
        indexPath : './phantomas/',
        options   : {},
        url       : 'http://gruntjs.com/',
        buildUi   : true
      }
    }
  }
} )
```

### Options

#### options.additionalStylesheet
Type: `String|Boolean`
Default value: `false`

If you don't like the phantomas default styling and want to customize it, you can set the path to an additional stylesheet, that will be copied and loaded in the generated `index.html`.

#### options.assertions
Type: `Object`
Default Value: `{}`

An object that represents possible assertions for your generated UI. Best way is to run `grunt-phantomas` once and setting these values afterwards for particular metrics. The UI will warn you whenever the `median` value of your defined runs of a specific metric will go over the specified value by highlighting depending graphs and showing warnings on top of the builded UI. Using this option you can easily keep track of getting worse values. Performance budget for the win. :)

Example:

```
phantomas : {
  /* https://github.com/stefanjudis/grunt-phantomas */
  grunt : {
    options : {
      assertions : {
        'assetsWithQueryString' : 3,     // receive warning, when there are more than 3 assets with a query string
        'bodyHTMLSize'          : 10500, // receive warning, when the bodyHTMLsize is bigger than 10500
        'jsErrors'              : 0      // receive warning, when JS errors appear
      }
      indexPath  : './phantomas/',
      options    : {
        'timeout' : 30
      },
      url        : 'http://gruntjs.com/'
    }
  }
}
```

#### options.indexPath
Type: `String`
Default value: `./phantomas/`

A string value that represents the relative path to the place where `phantomas` will render your metrics. Inside of this folder an `index.html`, a data folder and an assets folder will be created.

#### options.numberOfRuns
Type: `Number`
Default value: `5`

A numeric value that represents the number of times the `phantomas` executable will be started. The more times it runs the more reliable metrics become.

#### options.options
Type: `Object`
Default value: `{}`

An object that represents possible options for `phantomas` executable. For more information please check [the official api documentation](https://github.com/macbre/phantomas/wiki/npm-module) and [list of possible parameters](https://github.com/macbre/phantomas). See usage examples later on.

#### options.url
Type: `String`
Default value: `http://gruntjs.com/`

A string value that represents the url of the site, which will be analyzed by `phantomas`.


#### options.buildUi
Type: `Boolean`
Default value: `true`

If you want to use `grunt-phantomas` without generating a UI for the data, this is an option to switch off the visualization interface. If set to false only defined data format will be outputted at `options.indexPath + '/data/'`.

#### options.output
Type: `Array`
Default value: `[ 'json', 'csv' ]`

Choose to output CSV or JSON files. The default is JSON and CSV. The buildUi option does not work if `json` is not included in `options.output`. *You have to set `buildUi` to `false`, if you want to write CSV files only*.


#### options.group
Type: `Object`
Default value:
```
{
  'REQUESTS' : [
    'requests',
    'gzipRequests',
    'postRequests',
    'httpsRequests',
    'notFound',
    'multipleRequests',
    'maxRequestsPerDomain',
    'domains',
    'medianRequestsPerDomain',
    'redirects',
    'redirectsTime',
    'smallestResponse',
    'biggestResponse',
    'smallestLatency',
    'biggestLatency',
    'medianResponse',
    'medianLatency',
    'assetsNotGzipped',
    'assetsWithQueryString',
    'smallImages'
  ],
  'TIMINGS' : [
    'timeToFirstByte',
    'timeToLastByte',
    'timeToFirstCss',
    'timeToFirstJs',
    'timeToFirstImage',
    'fastestResponse',
    'slowestResponse',
    'onDOMReadyTime',
    'onDOMReadyTimeEnd',
    'windowOnLoadTime',
    'windowOnLoadTimeEnd',
    'httpTrafficCompleted',
    'timeBackend',
    'timeFrontend'
  ],
  'HTML' : [
    'bodyHTMLSize',
    'iframesCount',
    'imagesWithoutDimensions',
    'commentsSize',
    'hiddenContentSize',
    'whiteSpacesSize',
    'DOMelementsCount',
    'DOMelementMaxDepth',
    'nodesWithInlineCSS',
    'foo'
  ],
  'JAVASCRIPT' : [
    'eventsBound',
    'documentWriteCalls',
    'evalCalls',
    'jsErrors',
    'consoleMessages',
    'windowAlerts',
    'windowConfirms',
    'windowPrompts',
    'globalVariables',
    'localStorageEntries',
    'ajaxRequests'
  ],
  'DOM' : [
    'DOMqueries',
    'DOMqueriesById',
    'DOMqueriesByClassName',
    'DOMqueriesByTagName',
    'DOMqueriesByQuerySelectorAll',
    'DOMinserts',
    'DOMqueriesDuplicated'
  ],
  'HEADERS' : [
    'headersCount',
    'headersSentCount',
    'headersRecvCount',
    'headersSize',
    'headersSentSize',
    'headersRecvSize'
  ],
  'CACHING' : [
    'cacheHits',
    'cacheMisses',
    'cachePasses',
    'cachingNotSpecified',
    'cachingTooShort',
    'cachingDisabled'
  ],
  'COOKIES' : [
    'cookiesSent',
    'cookiesRecv',
    'domainsWithCookies',
    'documentCookiesLength',
    'documentCookiesCount'
  ],
  'COUNTS & SIZES' : [
    'contentLength',
    'bodySize',
    'htmlSize',
    'htmlCount',
    'cssSize',
    'cssCount',
    'jsSize',
    'jsCount',
    'jsonSize',
    'jsonCount',
    'imageSize',
    'imageCount',
    'webfontSize',
    'webfontCount',
    'base64Size',
    'base64Count',
    'otherCount',
    'otherSize'
  ],
  'JQUERY' : [
    'jQueryOnDOMReadyFunctions',
    'jQuerySizzleCalls'
  ]
}
```
An object that represents the metrics grouping rendered inside of the generated `index.html`. You can set up your grouping by just passing another object to this option.

Example:

```
phantomas : {
  /* https://github.com/stefanjudis/grunt-phantomas */
  grunt : {
    options : {
      indexPath : './phantomas/',
      options   : {
        'timeout' : 30
      },
      url       : 'http://gruntjs.com/',
      group     : {
        'foo' : [ 'cookiesSent' ]
      }
    }
  }
}
```
This configuration will lead to a rather empty looking rendered `index.html`. :)
Additionally you will be informed, which metrics you missed during the build process.

Output for example:

```
CHECKING FOR NOT DISPLAYED METRICS.
>> You are currently not displaying the following metrics:
>> requests, gzipRequests, postRequests, httpsRequests, notFound, timeToFirstByte, timeToLastByte, bodySize, contentLength, ajaxRequests, htmlCount, htmlSize, cssCount, cssSize, jsCount, jsSize, jsonCount, jsonSize, imageCount, imageSize, webfontCount, webfontSize, base64Count, base64Size, otherCount, otherSize, cacheHits, cacheMisses, cachePasses, cachingNotSpecified, cachingTooShort, cachingDisabled, consoleMessages, domains, maxRequestsPerDomain, medianRequestsPerDomain, DOMqueries, DOMqueriesById, DOMqueriesByClassName, DOMqueriesByTagName, DOMqueriesByQuerySelectorAll, DOMinserts, DOMqueriesDuplicated, eventsBound, headersCount, headersSentCount, headersRecvCount, headersSize, headersSentSize, headersRecvSize, documentWriteCalls, evalCalls, jQueryOnDOMReadyFunctions, jQuerySizzleCalls, jsErrors, redirects, redirectsTime, assetsNotGzipped, assetsWithQueryString, smallImages, multipleRequests, timeToFirstCss, timeToFirstJs, timeToFirstImage, onDOMReadyTime, onDOMReadyTimeEnd, windowOnLoadTime, windowOnLoadTimeEnd, timeBackend, timeFrontend, httpTrafficCompleted, windowAlerts, windowConfirms, windowPrompts, cookiesRecv, domainsWithCookies, documentCookiesLength, documentCookiesCount, bodyHTMLSize, iframesCount, imagesWithoutDimensions, commentsSize, hiddenContentSize, whiteSpacesSize, DOMelementsCount, DOMelementMaxDepth, nodesWithInlineCSS, globalVariables, localStorageEntries, smallestResponse, biggestResponse, fastestResponse, slowestResponse, smallestLatency, biggestLatency, medianResponse, medianLatency
```


### Usage Examples

#### Default Options
In this example, the default options are used to fetch metrics of `http://gruntjs.com` and render the visualized metrics at `./phantomas`.

```js
grunt.initConfig({
  phantomas: {
  	yourSite: {}
  }
});
```

#### Grunt task options
In this example, custom options are used to fetch metrics of `http://yoursite.com` and render the visualized metrics at `./yoursite/`.

```js
grunt.initConfig( {
  phantomas: {
    yourSite : {
      options : {
        additionalStylesheet : '/Users/foo/bar/custom.css',
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
        indexPath            : './yoursite/',
        url                  : 'http://yoursite.com/',
        numberOfRuns         : 10
      }
    }
  }
} );
```

#### Output options

##### Build ui

```js
grunt.initConfig( {
  phantomas: {
    yoursite : {
      options : {
        indexPath            : './phantomas/',
        options              : {
          'timeout' : 30
        },
        url                  : 'http://gruntjs.com/'
      }
    }
  }
}
```

##### Export JSON data only

```js
grunt.initConfig( {
  phantomas: {
    yoursite : {
      options : {
        buildUi              : false,
        output               : 'json',
        indexPath            : './phantomas/',
        options              : {
          'timeout' : 30
        },
        url                  : 'http://gruntjs.com/'
      }
    }
  }
}
```

##### Export CSV data only

```js
grunt.initConfig( {
  phantomas: {
    yoursite : {
      options : {
        buildUi              : false,
        output               : 'csv',
        indexPath            : './phantomas/',
        options              : {
          'timeout' : 30
        },
        url                  : 'http://gruntjs.com/'
      }
    }
  }
}
```

#### Phantomas options
In this example, the phantomas option is used to set `phantomas` execution parameters. In this case all external script except the defined ones are blocked by `phantomas`, what can become really handy, when dealing with a lot of third party scripts that influence your site performance.
Additionally phantomas will wait 30 seconds for all resources to be loaded until it quits with the timeout status code 252.
```js
grunt.initConfig( {
  phantomas: {
    yourSite : {
      options : {
        indexPath : './yoursite/',
        options   : {
          'allow-domain' : 'cdn.yoursite.com.br,ajax.googleapis.com',
          'no-externals' : true,
          'timeout'      : 30

        },
        url       : 'http://yoursite.com'
      }
    }
  }
} );
```

### Troubleshooting

By default, the experimental `film-strip` option is true. If the grunt phantomas command fails, try setting the film strip option to false:

```js
grunt.initConfig( {
  phantomas: {
    yourSite : {
      options : {
        indexPath : './yoursite/',
        options   : {
          'film-strip'   : false
        },
        url       : 'http://yoursite.com'
      }
    }
  }
} );
```


### Tracking history in CI
To track history in Travis CI, use the [caching option](http://docs.travis-ci.com/user/caching/#Arbitrary-directories) to cache the `indexPath` folder.

#### Note:
Formatters are not supported as options for Phantomas, because they are not implemented in the CommonJS version of Phantomas.


## Donating
Support this project and others by [stefanjudis](https://www.gittip.com/stefanjudis/) via [gittip](https://www.gittip.com/stefanjudis/).

[![Support via Gittip](https://rawgithub.com/twolfson/gittip-badge/0.2.0/dist/gittip.png)](https://www.gittip.com/stefanjudis/)


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

To make sure tests are passing and coding style is in a good shape please run `grunt test` before applying changes.

## Release History
Please check release history at [Github](https://github.com/stefanjudis/grunt-phantomas/releases). :)
