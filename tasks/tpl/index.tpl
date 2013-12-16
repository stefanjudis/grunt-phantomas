<%
  var metrics         = _.keys( results[ 0 ].metrics );
  var groupedMetrics    = [];
  var counter         = 0;
  var columnsPerTable = 7;
  _.each( metrics, function( metric, index ) {
    if ( index !== 0 && index % columnsPerTable === 0 ) {
      ++counter;
    }

    if ( groupedMetrics[ counter ] === undefined ) {
      groupedMetrics[ counter ] = [];
    }

    groupedMetrics[ counter ].push( metric );
  } );
%>


<!DOCTYPE html>
<html>
<head>
  <title></title>
  <link rel="stylesheet" href="public/styles/phantomas.css" media="all">
</head>
<body>
  <main>
  <ul class="p--graphs">
    <% _.each( metrics, function( metric ) { %>
      <li id="graph--<%= metric %>" class="p--graphs--graph">
        <h3><%= metric %></h3>
    <% } );%>
  </ul>
  <% _.each( groupedMetrics, function( metrics ) { %>
    <table class="p--table">
      <thead class="p--table--head">
        <th class="p--table--column">Date</th>
        <% _.each( metrics, function( key ) { %>
          <th class="p--table--column"><%= key %></th>
        <% } ); %>
      </thead>
      <tbody class="p--table--body">
        <% _.each( results, function( result ) { %>
          <tr class="p--table--row">
            <td class="p--table--column"><%= ( new Date( result.timestamp ) ).toISOString() %></td>
            <% _.each( metrics, function( metric ) { %>
              <td class="p--table--column"><%= result.metrics[ metric ] %></td>
            <% } ); %>
          </tr>
        <% } ) %>
      </tbody>
    </table>
  <% } ); %>
</main>
<script>var results = <%= JSON.stringify( results ) %></script>
<script src="public/scripts/d3.min.js"></script>
<script src="public/scripts/phantomas.min.js"></script>
</body>
</html>
