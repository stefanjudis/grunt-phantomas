/* global window, document, d3 */

/*
 * grunt-phantomas
 * https://github.com/stefanjudis/grunt-phantomas
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */
;( function( d3, window, document ) {
  /**
   * Helper functions
   */


  /**
   * Attach eventlistener to given event
   *
   * THX to John Resig
   * http://ejohn.org/projects/flexible-javascript-events/
   *
   * @param {Object}   obj  dom element
   * @param {String}   type event type
   * @param {Function} fn   event listener
   */
  function addEvent( obj, type, fn ) {
    if ( obj.attachEvent ) {
      obj[ 'e' + type + fn ] = fn;
      obj[ type + fn ]       = function() {
        obj[ 'e' + type + fn ]( window.event );
      };
      obj.attachEvent( 'on'+type, obj[ type + fn ] );
    } else {
      obj.addEventListener( type, fn, false );
    }
  }

  /**
   * Get parent of dom element with
   * given class
   *
   * @param  {Object} el        element
   * @param  {String} className className
   * @return {Object}           parent element with given class
   */
  function getParent( el, className ) {
    var parent = null;
    var p      = el.parentNode;

    while ( p !== null ) {
        var o = p;

        if ( o.classList.contains( className ) ) {
          parent = o;
          break;
        }

        p = o.parentNode;
    }
    return parent; // returns an Array []
  }

  /**
   * Config stuff
   * @type {Number}
   */
  var DURATION = 1500;

  /**
   * draw the fancy line chart
   *
   * @param {Array}  data      data
   * @param {String} metric    metric
   */
  function drawLineChart( data, metric, type ) {
    // Helper functions on top of 8-)
    function drawCircle( datum, index ) {
      circleContainer.datum( datum )
                    .append( 'circle' )
                    .attr( 'class', 'lineChart--circle' )
                    .attr( 'r', 0 )
                    .attr(
                      'cx',
                      function( d ) {
                        return x( d.date ) + detailWidth / 2;
                      }
                    )
                    .attr(
                      'cy',
                      function( d ) {
                        return y( d.value[ type ] );
                      }
                    )
                    .attr(
                      'data-average',
                      function( d ) {
                        return d.value.average;
                      }
                    )
                    .attr(
                      'data-max',
                      function( d ) {
                        return d.value.max;
                      }
                    )
                    .attr(
                      'data-median',
                      function( d ) {
                        return d.value.median;
                      }
                    )
                    .attr(
                      'data-min',
                      function( d ) {
                        return d.value.min;
                      }
                    )
                    .attr(
                      'data-sum',
                      function( d ) {
                        return d.value.sum;
                      }
                    )
                    .on( 'mouseenter', function() {
                      d3.select( this )
                        .attr(
                          'class',
                          'lineChart--circle lineChart--circle__highlighted'
                        )
                        .attr( 'r', 4 );
                    } )
                    .on( 'mouseout', function() {
                      d3.select( this )
                        .attr(
                          'class',
                          'lineChart--circle'
                        )
                        .attr( 'r', 3 );
                    } )

                    .transition()
                    .delay( DURATION / 10 * index )
                    .attr( 'r', 3 );
    }

    function drawCircles( data ) {
      circleContainer = svg.append( 'g' );

      data.forEach( function( datum, index ) {
        drawCircle( datum, index );
      } );
    }

    function tween( b, callback ) {
      return function( a ) {
        var i = ( function interpolate() {
          return function( t ) {
            return a.map( function( datum, index ) {
              var returnObject = datum;

              returnObject.value[ type ] = b[ index ].value[ type ] * t;

              return returnObject;
            } );
          };
        } )();

        return function( t ) {
          return callback( i ( t ) );
        };
      };
    }
    // data manipulation first
    data = data.reduce( function( newData, datum ) {
      if ( datum[ metric ] ) {
        newData.push( {
          date  : new Date( datum.timestamp ),
          value : datum[ metric ]
        } );
      }

      return newData;
    }, [] );


    // TODO code duplication check how you can avoid that
    var containerEl = document.getElementById( 'graph--' + metric ),
        width       = containerEl.clientWidth,
        height      = width * 0.4,
        margin      = {
          top    : 20,
          right  : 10,
          bottom : 60,
          left   : 10
        },

        detailWidth  = 98,

        container   = d3.select( containerEl ),
        svg         = container.select( 'svg' )
                                .attr( 'width', width )
                                .attr( 'height', height + margin.top + margin.bottom ),

        x          = d3.time.scale().range( [ 0, width - detailWidth ] ),
        xAxis      = d3.svg.axis().scale( x )
                                  .ticks ( 8 )
                                  .tickSize( -height ),
        xAxisTicks = d3.svg.axis().scale( x )
                                  .ticks( 16 )
                                  .tickSize( -height )
                                  .tickFormat( '' ),
        y          = d3.scale.linear().range( [ height, 0 ] ),
        yAxisTicks = d3.svg.axis().scale( y )
                                  .ticks( 12 )
                                  .tickSize( width )
                                  .tickFormat( '' )
                                  .orient( 'right' ),

        area = d3.svg.area()
                      .interpolate( 'linear' )
                      .x( function( d )  { return x( d.date ) + detailWidth / 2; } )
                      .y0( height )
                      .y1( function( d ) { return y( d.value[ type ] ); } ),

        line = d3.svg.line()
                  .interpolate( 'linear' )
                  .x( function( d ) { return x( d.date ) + detailWidth / 2; } )
                  .y( function( d ) { return y( d.value[ type ] ); } ),

        startData = data.map( function( datum ) {
                      return {
                        date  : datum.date,
                        value : {
                          average : 0,
                          min     : 0,
                          median  : 0,
                          max     : 0,
                          sum     : 0
                        }
                      };
                    } ),

        circleContainer;

    // Compute the minimum and maximum date, and the maximum price.
    x.domain( [ data[ 0 ].date, data[ data.length - 1 ].date ] );
    // hacky hacky hacky :(
    y.domain( [
      0,
      d3.max( data, function( d ) { return d.value ? d.value[ type ] : 0; } ) + 700
    ] );

    if ( !svg.empty() ) {
      svg.selectAll( 'g, path' ).remove();
    }

    svg.append( 'g' )
        .attr( 'class', 'lineChart--xAxisTicks' )
        .attr( 'transform', 'translate(' + detailWidth / 2 + ',' + height + ')' )
        .call( xAxisTicks );

    svg.append( 'g' )
        .attr( 'class', 'lineChart--xAxis' )
        .attr( 'transform', 'translate(' + detailWidth / 2 + ',' + ( height + 5 ) + ')' )
        .call( xAxis )
        .selectAll( 'text' )
        .attr( 'transform', 'rotate(45)' )
        .style( 'text-anchor', 'start' );

    svg.append( 'g' )
      .attr( 'class', 'lineChart--yAxisTicks' )
      .call( yAxisTicks );

    // Add the area path.
    svg.append( 'path' )
        .datum( startData )
        .attr( 'class', 'p--lineChart--area' )
        .attr( 'd', area )
        .transition()
        .duration( DURATION )
        .attrTween( 'd', tween( data, area ) );

    // // Add the line path.
    svg.append( 'path' )
        .datum( startData )
        .attr( 'class', 'p--lineChart--areaLine' )
        .attr( 'd', line )
        .transition()
        .duration( DURATION )
        .delay( DURATION / 2 )
        .attrTween( 'd', tween( data, line ) )
        .each( 'end', function() {
          drawCircles( data );
        } );
  }

  function appendDetailBoxForCircle( circle ) {
    var bBox          = circle.getBBox();
    var detailBox     = document.createElement( 'div' );
    var listContainer = getParent( circle, 'p--graphs--graph' );

    detailBox.innerHTML =
      '<dl>' +
        '<dt>Average:</dt>' +
        '<dd>' + circle.attributes.getNamedItem( 'data-average' ).value + '</dd>' +
        '<dt>Max:</dt>' +
        '<dd>' + circle.attributes.getNamedItem( 'data-max' ).value + '</dd>' +
        '<dt>Median:</dt>' +
        '<dd>' + circle.attributes.getNamedItem( 'data-median' ).value + '</dd>' +
        '<dt>Min:</dt>' +
        '<dd>' + circle.attributes.getNamedItem( 'data-min' ).value + '</dd>' +
        '<dt>Sum:</dt>' +
        '<dd>' + circle.attributes.getNamedItem( 'data-sum' ).value + '</dd>' +
      '</dl>';

    // radius need to be substracted
    // TODO think of cleaner solution
    detailBox.style.left = ( bBox.x - 71 ) + 'px';
    detailBox.style.top = ( bBox.y - 75 ) + 'px';
    detailBox.classList.add( 'p--graphs--detailBox' );

    listContainer.appendChild( detailBox );
  }


  function removeDetailBoxForCircle( circle ) {
    var listContainer = getParent( circle, 'p--graphs--graph' );

    var detailBox = listContainer.querySelector( '.p--graphs--detailBox' );

    listContainer.removeChild( detailBox );
  }


  /**
   * Attach circle events on graph list
   * -> event delegation for the win
   */
  function attachCircleEvents() {
    var mainContainer = document.getElementsByTagName( 'main' )[ 0 ];

    addEvent( mainContainer, 'mouseover', function( event ) {
      if ( event.target.tagName === 'circle' ) {
        appendDetailBoxForCircle( event.target );
      }
    } );

    addEvent( mainContainer, 'mouseout', function( event ) {
      if ( event.target.tagName === 'circle' ) {
        removeDetailBoxForCircle( event.target );
      }
    } );
  }


  /**
   * Attach hover event to body and listen
   * for description button hovers
   * to show description
   */
  function attachDescriptionEvents () {
    var body = document.querySelector( 'body' );

    addEvent( body, 'mouseover', function( event ) {
      if (
        event.target.tagName === 'A' &&
        event.target.classList.contains( 'active' ) &&
        (
          event.target.classList.contains( 'p--graphs--descriptionBtn' ) ||
          event.target.classList.contains( 'p--graphs--warningBtn' ) ||
          event.target.classList.contains( 'p--graphs--experimentalBtn' )
        )
      ) {
        var target = document.getElementById(
                        event.target.href.split( '#' )[ 1 ]
                      );

        target.removeAttribute( 'hidden' );

        event.preventDefault();
      }
    } );

    addEvent( body, 'mouseout', function( event ) {
      if (
        event.target.tagName === 'A' &&
        event.target.classList.contains( 'active' ) &&
        (
          event.target.classList.contains( 'p--graphs--descriptionBtn' ) ||
          event.target.classList.contains( 'p--graphs--warningBtn' ) ||
          event.target.classList.contains( 'p--graphs--experimentalBtn' )
        )
      ) {
        var target = document.getElementById(
                        event.target.href.split( '#' )[ 1 ]
                      );

        target.setAttribute( 'hidden', 'hidden' );

        event.preventDefault();
      }
    } );

    addEvent( body, 'click', function( event ) {
      if (
        event.target.tagName === 'A' &&
        (
          event.target.classList.contains( 'p--graphs--descriptionBtn' ) ||
          event.target.classList.contains( 'p--graphs--warningBtn' ) ||
          event.target.classList.contains( 'p--graphs--experimentalBtn' )
        )
      ) {
        event.preventDefault();
      }
    } );
  }


  /**
   * Attach event to select box to rerender
   * graphs depending on chosen tyoe
   */
  function attachMetricChangeEvent() {
    var switcher = document.getElementById( 'p--switcher' );

    addEvent( switcher, 'change', function( event ) {
      drawLineCharts( window.results, event.target.value );
    } );
  }


  /**
   * Attach events to document
   */
  function attachEventListeners() {
    attachCircleEvents();
    attachDescriptionEvents();
    attachMetricChangeEvent();
  }


  /**
   * KICK OFF FOR GRAPH POWER
   * *******************************
   * Check all metrics if numeric values are
   * included and initialize all graphs for it
   *
   * @param  {Array}            data data
   * @param  {String|undefined} type type of displayed data
   */
  function drawLineCharts( data, type ) {
    var lastMetric = data[ data.length - 1 ];

    type = type || 'median';

    for( var metric in lastMetric ) {
      if (
        lastMetric[ metric ] &&
        typeof lastMetric[ metric ].median === 'number' &&
        metric !== 'timestamp' &&
        document.getElementById( 'graph--' + metric )
      ) {
        drawLineChart( data, metric, type );
      }
    }
  }

  drawLineCharts( window.results );
  attachEventListeners();


} )( d3, window, document );
