/*
 * grunt-phantomas
 * https://github.com/stefanjudis/grunt-phantomas
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

module.exports = {
  requests : {
    reliable    : true,
    description : 'Total number of HTTP requests made'
  },
  gzipRequests : {
    reliable    : false,
    description : 'Number of gzipped HTTP responses'
  },
  postRequests : {
    reliable    : true,
    description : 'Number of POST requests'
  },
  httpsRequests : {
    reliable    : true,
    description : 'Number of HTTPS requests'
  },
  redirects : {
    reliable    : true,
    description : 'Number of HTTP redirects (either 301 or 302)'
  },
  redirectsTime : {
    reliable    : true,
    description : 'Time it took to send and receive redirects'
  },
  notFound : {
    reliable    : true,
    description : 'Number of HTTP 404 responses'
  },
  timeToFirstByte : {
    reliable    : true,
    description : 'Time it took to receive the first byte of the first response (that was not a redirect)'
  },
  timeToLastByte : {
    reliable    : true,
    description : 'Time it took to receive the last byte of the first response (that was not a redirect)'
  },
  timeBackend : {
    reliable    : true,
    description : 'Time to the first byte compared to the total loading time (in %)'
  },
  timeFrontend : {
    reliable    : true,
    description : 'Time to window on load compared to the total loading time (in %)'
  },
  bodySize : {
    reliable    : false,
    description : 'Size of the content of all responses'
  },
  contentLength : {
    reliable    : true,
    description : 'Size of the content of all responses (based on Content-Length header)'
  },
  ajaxRequests : {
    reliable    : true,
    description : 'Number of AJAX requests'
  },
  htmlCount : {
    reliable    : true,
    description : 'Number of HTML responses'
  },
  htmlSize : {
    reliable    : false,
    description : 'Size of HTML responses'
  },
  cssCount : {
    reliable    : true,
    description : 'Number of CSS responses'
  },
  cssSize : {
    reliable    : false,
    description : 'Size of CSS responses'
  },
  jsCount : {
    reliable    : true,
    description : 'Number of JS responses'
  },
  jsSize : {
    reliable    : false,
    description : 'Size of JS responses'
  },
  jsonCount : {
    reliable    : true,
    description : 'Number of JSON responses'
  },
  jsonSize : {
    reliable    : false,
    description : 'Size of JSON responses'
  },
  imageCount : {
    reliable    : true,
    description : 'Number of image responses'
  },
  imageSize : {
    reliable    : false,
    description : 'Size of image responses'
  },
  webfontCount : {
    reliable    : true,
    description : 'Number of web font responses'
  },
  webfontSize : {
    reliable    : false,
    description : 'Size of web font responses'
  },
  base64Count : {
    reliable    : true,
    description : 'Number of base64 encoded "responses" (no HTTP request was actually made)'
  },
  base64Size : {
    reliable    : false,
    description : 'Size of base64 encoded "responses"'
  },
  otherCount : {
    reliable    : true,
    description : 'Number of other responses'
  },
  otherSize : {
    reliable    : false,
    description : 'Size of other responses'
  },
  cacheHits : {
    reliable    : true,
    description : 'Number of cache hits - Metrics are calculated based on X-Cache header added by Varnish / Squid servers'
  },
  cacheMisses : {
    reliable    : true,
    description : 'Number of cache misses - Metrics are calculated based on X-Cache header added by Varnish / Squid servers'
  },
  cachePasses : {
    reliable    : true,
    description : 'Number of cache passes - Metrics are calculated based on X-Cache header added by Varnish / Squid servers'
  },
  cachingNotSpecified : {
    reliable    : true,
    description : 'Responses with no caching header sent (either <strong>Cache-Control</strong> or <strong>Expires</strong>)'
  },
  cachingTooShort : {
    reliable    : true,
    description : 'Responses with too short (less than a week) caching time'
  },
  cachingDisabled : {
    reliable    : true,
    description : 'Responses with caching disabled (<strong>max-age=0</strong>)'
  },
  domains : {
    reliable    : true,
    description : 'Number of domains used to fetch the page'
  },
  maxRequestsPerDomain : {
    reliable    : true,
    description : 'Maximum number of requests fetched from a single domain'
  },
  medianRequestsPerDomain : {
    reliable    : true,
    description : 'Median of requests fetched from each domain'
  },
  DOMqueries : {
    reliable    : true,
    description : 'Sum of all four metrics below'
  },
  DOMqueriesById : {
    reliable    : true,
    description : 'Number of <strong>document.getElementById</strong> calls'
  },
  DOMqueriesByClassName : {
    reliable    : true,
    description : 'Number of <strong>document.getElementsByClassName</strong> calls'
  },
  DOMqueriesByTagName : {
    reliable    : true,
    description : 'Number of <strong>document.getElementsByTagName</strong> calls'
  },
  DOMqueriesByQuerySelectorAll : {
    reliable    : true,
    description : 'Number of <strong>document.querySelectorAll</strong> calls'
  },
  DOMinserts : {
    reliable    : true,
    description : 'Number of DOM nodes inserts'
  },
  DOMqueriesDuplicated : {
    reliable    : true,
    description : 'Number of duplicated DOM queries'
  },
  eventsBound : {
    reliable    : true,
    description : 'Number of <strong>EventTarget.addEventListener</strong> calls'
  },
  headersCount : {
    reliable    : true,
    description : 'Number of requests and responses headers'
  },
  headersSentCount : {
    reliable    : true,
    description : 'Number of headers sent in requests'
  },
  headersRecvCount : {
    reliable    : true,
    description : 'Number of headers received in responses'
  },
  headersSize : {
    reliable    : true,
    description : 'Size of all headers'
  },
  headersSentSize : {
    reliable    : true,
    description : 'Size of sent headers'
  },
  headersRecvSize : {
    reliable    : true,
    description : 'Size of received headers'
  },
  documentWriteCalls : {
    reliable    : true,
    description : 'Number of calls to either <strong>document.write</strong> or <strong>document.writeln</strong>'
  },
  evalCalls : {
    reliable    : true,
    description : 'Number of calls to eval (either direct or via <strong>setTimeout</strong> / <strong>setInterval</strong>)'
  },
  jQueryOnDOMReadyFunctions : {
    reliable    : true,
    description : 'Number of functions bound to <strong>onDOMReady</strong> event - Requires jQuery 1.8.0+'
  },
  jQuerySizzleCalls : {
    reliable    : true,
    description : 'Number of calls to Sizzle (including those that will be resolved using querySelectorAll) - Requires jQuery 1.8.0+'
  },
  jsErrors : {
    reliable    : true,
    description : 'Number of JavaScript errors - Error message and backtrace will be emitted as offenders'
  },
  assetsNotGzipped : {
    reliable    : true,
    description : 'Static assets that were not gzipped'
  },
  assetsWithQueryString : {
    reliable    : true,
    description : 'Static assets requested with query string (e.g. ?foo) in URL'
  },
  smallImages : {
    reliable    : true,
    description : 'Images smaller than 2 kB that can be base64 encoded'
  },
  multipleRequests : {
    reliable    : true,
    description : 'Number of static assets that are requested more than once'
  },
  timeToFirstCss : {
    reliable    : true,
    description : 'Time it took to receive the last byte of the first CSS'
  },
  timeToFirstJs : {
    reliable    : true,
    description : 'Time it took to receive the last byte of the first JS'
  },
  timeToFirstImage : {
    reliable    : true,
    description : 'Time it took to receive the last byte of the first image'
  },
  onDOMReadyTime : {
    reliable    : true,
    description : 'Time it took to fire <strong>onDOMready</strong> event - Times below are relative to responseEnd entry in NavigationTiming (represented by timeToLastByte metric). See NavigationTiming spec for more information.'
  },
  onDOMReadyTimeEnd : {
    experimental : true,
    reliable     : true,
    description  : 'Time it took to finish processing <strong>onDOMready</strong> event - Times below are relative to responseEnd entry in NavigationTiming (represented by timeToLastByte metric). See NavigationTiming spec for more information.'
  },
  windowOnLoadTime : {
    reliable    : true,
    description : 'Time it took to fire <strong>window.load</strong> event - Times below are relative to responseEnd entry in NavigationTiming (represented by timeToLastByte metric). See NavigationTiming spec for more information.'
  },
  windowOnLoadTimeEnd : {
    experimental : true,
    reliable     : true,
    description  : 'Time it took to finish processing <strong>window.load</strong> event - Times below are relative to responseEnd entry in NavigationTiming (represented by timeToLastByte metric). See NavigationTiming spec for more information.'
  },
  httpTrafficCompleted : {
    reliable    : true,
    description : 'Time it took to receive the last byte of the last HTTP response'
  },
  cssBase64Length : {
    experimental : true,
    reliable     : true,
    description  : 'Total length of base64-encoded data in CSS source'
  },
  cssComments : {
    experimental : true,
    reliable     : true,
    description  : 'Number of comments in CSS source'
  },
  cssCommentsLength : {
    experimental : true,
    reliable     : true,
    description  : 'Length of comments content in CSS source'
  },
  cssComplexSelectors : {
    experimental : true,
    reliable     : true,
    description  : 'Number of complex selectors (consisting of more than three expressions, e.g. <strong>header ul li .foo</strong>)'
  },
  cssDuplicatedSelectors : {
    experimental : true,
    reliable     : true,
    description  : 'Number of CSS selectors defined more than once in CSS source'
  },
  cssEmptyRules : {
    experimental : true,
    reliable     : true,
    description  : 'Number of rules with no properties (e.g. <strong>.foo { }</strong>)'
  },
  cssOldIEFixes : {
    experimental : true,
    reliable     : true,
    description  : 'Number of fixes for old versions of Internet Explorer'
  },
  cssImportants : {
    experimental : true,
    reliable     : true,
    description  : 'Number of properties with value forced by <strong>!important</strong>'
  },
  cssOldPropertyPrefixes : {
    experimental : true,
    reliable     : true,
    description  : 'Number of properties with no longer needed vendor prefix, powered by data provided by autoprefixer (e.g. <strong>--moz-border-radius</strong>)'
  },
  cssQualifiedSelectors : {
    experimental : true,
    reliable    : true,
    description : 'Number of qualified selectors (e.g. <strong>header#nav</strong>, <strong>.foo#bar</strong>, <strong>h1.title</strong>)'
  },
  cssSpecificityIdAvg : {
    experimental : true,
    reliable     : true,
    description  : 'Average specificity for ID'
  },
  cssSpecificityIdTotal : {
    experimental : true,
    reliable     : true,
    description  : 'Total specificity for ID'
  },
  cssSpecificityClassAvg : {
    experimental : true,
    reliable     : true,
    description  : 'Average specificity for class, pseudo-class or attribute'
  },
  cssSpecificityClassTotal : {
    experimental : true,
    reliable     : true,
    description  : 'Total specificity for class, pseudo-class or attribute'
  },
  cssSpecificityTagAvg : {
    experimental : true,
    reliable     : true,
    description  : 'Average specificity for element'
  },
  cssSpecificityTagTotal : {
    experimental : true,
    reliable     : true,
    description  : 'Total specificity for element'
  },
  cssSelectorsByAttribute : {
    experimental : true,
    reliable     : true,
    description  : 'Number of selectors by attribute (e.g. <strong>.foo[value=bar]</strong>)'
  },
  cssSelectorsByClass : {
    experimental : true,
    reliable     : true,
    description  : 'Number of selectors by class'
  },
  cssSelectorsById : {
    experimental : true,
    reliable     : true,
    description  : 'Number of selectors by ID'
  },
  cssSelectorsByPseudo : {
    experimental : true,
    reliable     : true,
    description  : 'Number of pseudo-selectors (e,g. <strong>:hover</strong>)'
  },
  cssSelectorsByTag : {
    experimental : true,
    reliable     : true,
    description  : 'Number of selectors by tag name'
  },
  cssUniversalSelectors : {
    experimental : true,
    reliable     : true,
    description  : 'Number of selectors trying to match every element (e.g. <strong>.foo > *</strong>)'
  },
  cssLength : {
    experimental : true,
    reliable     : true,
    description  : 'length of CSS source (in bytes)'
  },
  cssRules : {
    experimental : true,
    reliable     : true,
    description  : ' number of rules (e.g. <strong>.foo, .bar { color: red }</strong> is counted as one rule)'
  },
  cssSelectors : {
    experimental : true,
    reliable     : true,
    description  : 'Number of selectors (e.g. <strong>.foo, .bar { color: red }</strong> is counted as two selectors - .foo and .bar)'
  },
  cssDeclarations : {
    experimental : true,
    reliable     : true,
    description  : 'Number of declarations (e.g. <strong>.foo, .bar { color: red }</strong> is counted as one declaration - color: red)'
  },
  windowAlerts : {
    reliable    : true,
    description : 'Number of calls to <strong>alert</strong>'
  },
  windowConfirms : {
    reliable    : true,
    description : 'Number of calls to <strong>confirm</strong>'
  },
  windowPrompts : {
    reliable    : true,
    description : 'Number of calls to <strong>prompt</strong>'
  },
  cssNotices : {
    experimental : true,
    reliable     : true,
    description  : ''
  },
  consoleMessages : {
    reliable    : true,
    description : 'Number of calls to <strong>console.*</strong> functions'
  },
  cookiesSent : {
    reliable    : true,
    description : 'Length of cookies sent in HTTP requests'
  },
  cookiesRecv : {
    reliable    : true,
    description : 'Length of cookies received in HTTP responses'
  },
  domainsWithCookies : {
    reliable    : true,
    description : 'Number of domains with cookies set'
  },
  documentCookiesLength : {
    reliable    : true,
    description : 'Length of <strong>document.cookie</strong>'
  },
  documentCookiesCount : {
    reliable    : true,
    description : 'Number of cookies in document.cookie'
  },
  bodyHTMLSize : {
    reliable    : true,
    description : 'Size of body tag content (<strong>document.body.innerHTML.length</strong>) - Metrics are generated after the full page load'
  },
  iframesCount : {
    reliable    : true,
    description : 'Number of iframe nodes - Metrics are generated after the full page load'
  },
  imagesWithoutDimensions : {
    reliable    : true,
    description : 'Number of <img> nodes without both <strong>width</strong> and <strong>height</strong> attribute - Metrics are generated after the full page load'
  },
  commentsSize : {
    reliable    : true,
    description : 'Size of HTML comments on the page - Metrics are generated after the full page load'
  },
  hiddenContentSize : {
    reliable    : true,
    description : 'Size of content of hidden elements on the page (with CSS <strong>display: none</strong>) - Metrics are generated after the full page load'
  },
  whiteSpacesSize : {
    reliable    : true,
    description : 'Size of text nodes with whitespaces only - Metrics are generated after the full page load'
  },
  DOMelementsCount : {
    reliable    : true,
    description : 'Total number of HTML element nodes - Metrics are generated after the full page load'
  },
  DOMelementMaxDepth : {
    reliable    : true,
    description : 'Maximum level on nesting of HTML element node - Metrics are generated after the full page load'
  },
  nodesWithInlineCSS : {
    reliable    : true,
    description : 'Number of nodes with inline CSS styling (with <strong>style</strong> attribute) - Metrics are generated after the full page load'
  },
  globalVariables : {
    reliable    : true,
    description : 'Number of JS globals variables - Metrics are generated after the full page load'
  },
  localStorageEntries : {
    reliable    : true,
    description : 'Number of entries in local storage'
  },
  smallestResponse : {
    reliable    : true,
    description : 'Size of the smallest response - Includes HTTP 200 responses only'
  },
  biggestResponse : {
    reliable    : true,
    description : 'Size of the biggest response - Includes HTTP 200 responses only'
  },
  fastestResponse : {
    reliable    : true,
    description : 'Time to the last byte of the fastest response - Includes HTTP 200 responses only - Time is total duration, from the start of the request to the receipt of the final byte in the response.'
  },
  slowestResponse : {
    reliable    : true,
    description : 'Time to the last byte of the slowest response - Includes HTTP 200 responses only - Time is total duration, from the start of the request to the receipt of the final byte in the response.'
  },
  smallestLatency : {
    reliable    : true,
    description : 'Time to the first byte of the fastest response - Includes HTTP 200 responses only - Time is total duration, from the start of the request to the receipt of the final byte in the response.'
  },
  biggestLatency : {
    reliable    : true,
    description : 'Time to the first byte of the slowest response - Includes HTTP 200 responses only - Time is total duration, from the start of the request to the receipt of the final byte in the response.'
  },
  medianResponse : {
    reliable    : true,
    description : 'Median value of time to the last byte for all responses - Includes HTTP 200 responses only - Time is total duration, from the start of the request to the receipt of the final byte in the response.'
  },
  medianLatency : {
    reliable    : true,
    description : 'Median value of time to the first byte for all responses - Includes HTTP 200 responses only - Time is total duration, from the start of the request to the receipt of the final byte in the response.'
  }
};
