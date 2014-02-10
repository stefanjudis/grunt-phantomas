<!DOCTYPE html>
<html>
  <head>
    <title>Frontend statistics for <%= url %></title>
    <link rel="stylesheet" href="public/styles/phantomas.css" media="all">
    <% if ( additionalStylesheet ) { %>
      <link rel="stylesheet" href="public/styles/custom.css" media="all">
    <% } %>
  </head>
  <body>
    <header class="p--header">
      <span class="p--header--span">Frontend stats for <a class="fancy" href="<%= url %>" data-url="<%= url %>" target="_blank"><%= url %></a></span>
      <select id="p--switcher" class="p--switcher">
        <option value="average">Average</option>
        <option value="min">Min</option>
        <option value="median" selected="selected">Median</option>
        <option value="max">Max</option>
      </select>
    </header>
    <main>
      <h1>Stats for <%= url %></h1>
      <% for ( var key in group ) { %>
        <% if ( group.hasOwnProperty( key ) ) { %>
          <h2><%= key %></h2>
          <ul class="p--graphs">
            <% _.each( group[ key ], function( metric ) { %>
              <% if ( results[ results.length - 1 ][ metric ] ) { %>
                <li id="graph--<%= metric %>" class="p--graphs--graph">
                  <h3><%= metric %></h3>
                  <a class="p--graphs--experimentalBtn <%= ( meta[ metric ] && meta[ metric ].experimental ) ? 'active' : '' %>" href="#experimental-<%= metric %>">Show experimental</a>
                  <div id="experimental-<%= metric %>" class="p--graphs--experimental" hidden>Be careful this feature is marked as experimental.</div>
                  <a class="p--graphs--descriptionBtn <%= ( meta[ metric ] && meta[ metric ].description ) ? 'active' : '' %>" href="#description-<%= metric %>">Show description</a>
                  <div id="description-<%= metric %>" class="p--graphs--description" hidden><%= ( meta[ metric ] && meta[ metric ].description ) ? meta[ metric ].description : '' %></div>
                  <a class="p--graphs--warningBtn <%= ( meta[ metric ] && !meta[ metric ].reliable ) ? 'active' : '' %>" href="#warning-<%= metric %>">Show warning</a>
                  <div id="warning-<%= metric %>" class="p--graphs--warning" hidden>Unfortunately this metric is not reliable. For more information please check documentation of phantomas.</div>
                  <svg class="p--graphs--svg"></svg>
                  <table class="p--table">
                    <thead class="p--table--head">
                      <th class="p--table--column">Date</th>
                      <th class="p--table--column"><%= metric %></th>
                    </thead>
                    <tbody class="p--table--body">
                      <% _.each( results, function( result ) { %>
                        <% if ( result[ metric ] && result[ metric ].median !== undefined ) { %>
                          <tr class="p--table--row">
                              <td class="p--table--column__highlight"><%= ( new Date( result.timestamp ) ).toISOString() %></td>
                              <td class="p--table--column"><%= result[ metric ].median %></td>
                          </tr>
                        <% } %>
                      <% } ) %>
                    </tbody>
                  </table>
              <% } %>
            <% } );%>
          </ul>
        <% } %>
      <% } %>
    </main>
    <footer class="p--footer">
      Made with &#x2764; and <a href="https://github.com/macbre/phantomas" target="_blank">Phantomas</a>
    </footer>
    <script>var results = [
<%= results.map( function ( result ) {
  return '/* ' + ( new Date( result.timestamp ) ) + ' | ' + result.timestamp + '.json */\n' + JSON.stringify( result, null, 2 ) ;
} ).join( ',\n' ) %>
];</script>
    <script src="public/scripts/d3.min.js"></script>
    <script src="public/scripts/phantomas.min.js"></script>
  </body>
</html>
