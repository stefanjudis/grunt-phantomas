<!DOCTYPE html>
<html>
<head>
  <title></title>
</head>
<body>
<h1>Oh yeah</h1>
<table>
  <thead>
    <th>Date</th>
    <% var metrics = _.keys( results[ 0 ].metrics ); %>
    <% _.each( metrics, function( key ) { %>
      <th><%= key %></th>
    <% } ); %>
  </thead>
  <tbody>
    <% _.each( results, function( result ) { %>
      <tr>
        <td><%= ( new Date( result.timestamp ) ).toString() %></td>
        <% _.each( metrics, function( metric ) { %>
          <td><%= result.metrics[ metric ] %></td>
        <% } ); %>
      </tr>
    <% } ) %>
  </tbody>
</table>
<script>var results = <%= JSON.stringify( results ) %></script>
</body>
</html>
