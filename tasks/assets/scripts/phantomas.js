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
   * draw the fancy line chart
   *
   * @param {Array}  data      data
   * @param {String} metric    metric
   * @param {String} type      median|max|min|...
   */
  function drawLineChart( data, metric, type ) {
    // Helper functions on top of 8-)

    /**
     * Draw one particalur circle
     *
     * @param  {Object}  datum datum
     */
    function drawCircle( datum ) {
      circleContainer.datum( datum )
                    .append( 'circle' )
                    .attr( 'class', function( d ) {
                      return ( assertionValue && d.value[ type ] > assertionValue ) ?
                        'lineChart--circle failed' :
                        'lineChart--circle';
                    } )
                    .attr( 'r', 4 )
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
                      'data-timestamp',
                      function( d ) {
                        return +d.date;
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
                      'data-metric',
                      function() {
                        return metric;
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
                          function( d ) {
                            return ( assertionValue && d.value[ type ] > assertionValue ) ?
                                'lineChart--circle highlighted failed' :
                                'lineChart--circle highlighted';
                            }
                        )
                        .attr( 'r', 6 );
                    } )
                    .on( 'mouseout', function() {
                      d3.select( this )
                        .attr(
                          'class',
                          function( d ) {
                            return ( assertionValue && d.value[ type ] > assertionValue ) ?
                                'lineChart--circle failed' :
                                'lineChart--circle';
                          }
                        )
                        .attr( 'r', 4 );
                    } );
    }


    /**
     * Container function to iterate of given
     * data and draw a circle for each data set
     *
     * @param  {Array}   data  data
     */
    function drawCircles( data ) {
      if ( !circleContainer ) {
        circleContainer = svg.append( 'g' );
      }

      circleContainer.selectAll( 'circle' ).remove();

      data.forEach( drawCircle );
    }


    /**
     * Redraw all elements that are effected
     * by zooming and translating
     */
    function redraw() {
      svg.select( '.lineChart--xAxis' ).call( xAxis )
                                        .selectAll( 'text' )
                                        .attr( 'transform', 'rotate(45)' )
                                        .style( 'text-anchor', 'start' );
      svg.select( '.lineChart--xAxisTicks' ).call( xAxisTicks );
      svg.select( '.p--lineChart--area' ).attr( 'd', area );
      svg.select( '.p--lineChart--areaLine' ).attr( 'd', line );

      drawCircles( data );
    }


    /**
     * Zoom
     */
    function zoomed() {
      redraw();

      // show reset button
      svg.select( '.p--lineChart--reset' )
          .attr( 'class', 'p--lineChart--reset active' );

      svg.select( '.p--lineChart--resetText' )
          .attr( 'class', 'p--lineChart--resetText active' );

    }


    /**
     * Reset zoom
     */
    function unZoomed() {
      zoom.translate( [ 0, 0 ] ).scale( 1 );

      redraw();

      // hide reset button
      svg.select( '.p--lineChart--reset' )
          .attr( 'class', 'p--lineChart--reset' );

      svg.select( '.p--lineChart--resetText' )
          .attr( 'class', 'p--lineChart--resetText' );
    }

    // get the assertion value
    // out of this huge set of data
    var assertionValue = null;

    if ( data[ data.length - 1 ].assertions[ metric ] ) {
      assertionValue = data[ data.length - 1 ].assertions[ metric ].value;
    }

    // data manipulation first
    // remove all the stuff that
    // is not needed for this chart
    data = data.reduce( function( newData, datum ) {
      if ( datum.metrics[ metric ] ) {
        newData.push( {
          date  : new Date( datum.timestamp ),
          value : datum.metrics[ metric ]
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
          bottom : 60,
        },

        detailWidth  = 115,

        container   = d3.select( containerEl ),
        svg         = container.select( '.p--graphs--svg' )
                                .attr( 'width', width )
                                .attr( 'height', height + margin.top + margin.bottom )
                                .attr( 'class', 'p--graphs--svg is-initialized' ),

        x          = d3.time.scale().range( [ 0, width - detailWidth ] ),
        xAxis      = d3.svg.axis().scale( x )
                                  .ticks ( 8 )
                                  .tickSize( -height ),
        xAxisTicks = d3.svg.axis().scale( x )
                                  .ticks( 16 )
                                  .tickSize( -height )
                                  .tickFormat( '' ),
        y          = d3.scale.linear().range( [ height, margin.top ] ),
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

        loader = container.select( '.p--graphs--loading' ),

        assertionGroup,
        circleContainer,
        zoom;

    // Compute the minimum and maximum date, and the maximum price.
    x.domain( [ data[ 0 ].date, data[ data.length - 1 ].date ] );
    // hacky hacky hacky :(
    y.domain( [
      0,
      d3.max( data, function( d ) {
        if ( d.value ) {
          return ( d.value[ type ] > assertionValue ) ?
                  d.value[ type ] :
                  assertionValue;
        } else {
          return 0;
        }
      } )
    ] );

    // hide loading spinner
    loader.attr( 'class', 'p--graphs--loading' );

    // clean up time... :)
    if ( !svg.empty() ) {
      svg.selectAll( 'g, path, rect, text, line' ).remove();
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

    // add assertion graphics
    if ( assertionValue !== null ) {
      assertionGroup = svg.append( 'g' )
                          .attr( 'transform', 'translate( 0,' + y( assertionValue ) + ')' )
                          .attr( 'class', 'p--lineChart--assertion' );

      assertionGroup.append( 'line' )
                     .attr( 'x1', 0 )
                     .attr( 'y1', 0 )
                     .attr( 'x2', width )
                     .attr( 'y2', 0 )
                     .attr( 'class', 'p--lineChart--assertion' );

      assertionGroup.append( 'rect' )
                    .attr( 'width', 50 )
                    .attr( 'height', 20 )
                    .attr( 'x', 0 )
                    .attr( 'y', - 10 );

      assertionGroup.append( 'text' )
                    .attr( 'x', 25 )
                    .attr( 'y', 4 )
                    .text( assertionValue );
    }

    // Add the area path.
    svg.append( 'path' )
        .datum( data )
        .attr( 'class', 'p--lineChart--area' )
        .attr( 'd', area );

    // Add the line path.
    svg.append( 'path' )
        .datum( data )
        .attr( 'class', 'p--lineChart--areaLine' )
        .attr( 'd', line );


    // configure zoom
    zoom = d3.behavior.zoom()
              .x( x )
              .scaleExtent( [ 1, 100 ] )
              .on( 'zoom', zoomed );

    // set up zoom pane
    svg.append( 'rect' )
        .attr( 'class', 'p--lineChart--pane' )
        .attr( 'width', width )
        .attr( 'height', height )
        .call( zoom );

    drawCircles( data );

    // set up reset button
    svg.append( 'rect' )
        .attr( 'class', 'p--lineChart--reset' )
        .attr( 'width', 77 )
        .attr( 'height', 23 )
        .attr( 'x', width - 77 )
        .attr( 'y', 2 )
        .on( 'click', unZoomed );

    svg.append( 'text' )
        .attr( 'class', 'p--lineChart--resetText' )
        .attr( 'x', width - 38 )
        .attr( 'y', 17 )
        .text( 'reset' )
        .on( 'click', unZoomed );

  }


  /**
   * Append a new detail box to circle
   *
   * @param  {Object} circle svg circle
   */
  function appendDetailBoxForCircle( circle ) {
    removeDetailBoxForCircle( circle );

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


  /**
   * Remove detail box
   *
   * @param  {Object} circle svg circle
   */
  function removeDetailBoxForCircle( circle ) {
    var listContainer = getParent( circle, 'p--graphs--graph' );

    var detailBox = listContainer.querySelector( '.p--graphs--detailBox' );

    if ( detailBox ) {
      listContainer.removeChild( detailBox );
    }
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
        highlightTableRow( event.target );
      }
    } );

    addEvent( mainContainer, 'mouseout', function( event ) {
      if ( event.target.tagName === 'circle' ) {
        removeDetailBoxForCircle( event.target );
        unhighlightTableRow( event.target );
      }
    } );
  }


  /**
   * Attach click events on graph list
   * -> event delegation for the win
   */
  function attachClickEvents() {
    var body         = document.querySelector( 'body' );
    var headerHeight = document.getElementsByTagName( 'header' )[ 0 ]
                                .getBoundingClientRect().height;
    var overlay      = document.getElementById( 'p--modal__overlay' );
    var closeButton  = document.getElementById( 'p--modal__close' );

    addEvent( body, 'click', function( event ) {
      if ( event.target.classList.contains( 'js-expand' ) ) {
        document.getElementById(
          'p--table--container--' +
          event.target.attributes.getNamedItem( 'data-metric' ).value
        ).classList.toggle( 'expanded' );
      }

      if ( event.target.classList.contains( 'js-offenders' ) ) {
        overlay.style.display     = 'block';
        overlay.style.opacity     = 0.5;
        closeButton.style.display = 'block';

        document.getElementById(
          'offender--' +
          event.target.attributes.getNamedItem( 'data-metric' ).value
        ).classList.toggle( 'in-modal' );

      }

      if ( event.target === overlay || event.target === closeButton) {
        overlay.style.opacity     = 0;
        overlay.style.display     = 'none';
        closeButton.style.display = 'none';
        document.querySelector( '.in-modal' ).classList.toggle( 'in-modal' );
      }

      if ( event.target.classList.contains( 'js-scroll' ) ) {
        event.preventDefault();

        var yPosition = 0;
        var element = document.getElementById(
            event.target.href.split( '#' )[ 1 ]
        );

        if ( element.offsetParent ) {
          do {
              yPosition += element.offsetTop;
          } while ( element = element.offsetParent );
        }

        // console.log( document.getElementById( event.target.href.split( '#' )[ 1 ] ).offsetTop );
        window.scrollTo(
          0,
          yPosition - headerHeight - 20
        );
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
   * Attach mouse hover events on body
   * -> event delegation for the win
   */
  function attachHeaderEvents() {
    var body      = document.querySelector( 'body' );
    var container = document.getElementById( 'p--header--notification' );



    addEvent( body, 'mouseover', function( event ) {
      if ( event.target.classList.contains( 'js-warning' ) ) {
        container.innerHTML = event.target.innerHTML;
      }
    } );
  }


  /**
   * Attach event to select box to rerender
   * graphs depending on chosen tyoe
   */
  function attachMetricChangeEvent() {
    var switcher = document.getElementById( 'p--switcher--metrics' );

    addEvent( switcher, 'change', function( event ) {
      drawLineCharts( window.results, event.target.value );
    } );
  }


  /**
   * Attach events to document
   */
  function attachEventListeners() {
    attachCircleEvents();
    attachClickEvents();
    attachDescriptionEvents();
    attachHeaderEvents();
    attachMetricChangeEvent();
  }


  /**
   * Highlight table row if particular
   * graph bullet if hovered
   *
   * @param  {Object} target target
   */
  function unhighlightTableRow( target ) {
    var row = document.querySelectorAll(
      '#' + target.attributes.getNamedItem( 'data-metric' ).value +
      '--row--' +
      target.attributes.getNamedItem( 'data-timestamp' ).value
    );

    if ( row.length ) {
      row[ 0 ].classList.remove( 'active' );
    }
  }


  /**
   * Unhighlight table row if particular
   * graph bullet is left
   *
   * @param  {Object} target target
   */
  function highlightTableRow( target ) {
    var metric = target.attributes.getNamedItem( 'data-metric' ).value;
    var row = document.getElementById(
      metric +
      '--row--' +
      target.attributes.getNamedItem( 'data-timestamp' ).value
    );
    var scrollContainer = document.getElementById(
      'p--table--container--' + metric
    );

    if ( row && scrollContainer ) {
      scrollContainer.scrollTop = row.offsetTop;

      row.classList.add( 'active' );
    }
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
    var loaders    = document.querySelectorAll( '.p--graphs--loading' );

    for ( var i = 0; i < loaders.length; ++i ) {
      loaders[ i ].classList.add( 'is-active' );
    }

    type = type || 'median';

    for ( var metric in lastMetric.metrics ) {
      if (
        lastMetric.metrics[ metric ] &&
        typeof lastMetric.metrics[ metric ].median === 'number' &&
        metric !== 'timestamp' &&
        document.getElementById( 'graph--' + metric )
      ) {
        setTimeout( drawLineChart.bind( null, data, metric, type ), 250 );
      }
    }
  }

  drawLineCharts( window.results );
  attachEventListeners();


} )( d3, window, document );
