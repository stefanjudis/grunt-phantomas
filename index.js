module.exports = process.env.PHANTOMAS_COV
  ? require( './tasks/lib/phantomas-cov' )
  : require( './tasks/lib/phantomas' );
