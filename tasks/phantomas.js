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
        additionStylesheet : false,
        assertions         : {},
        buildUi            : true,
        indexPath          : './phantomas/',
        numberOfRuns       : 5,
        options            : {},
        output             : [ 'json', 'csv' ],
        url                : 'http://gruntjs.com/',
        group              : {
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
